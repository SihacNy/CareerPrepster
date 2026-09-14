"use client";

import React, { useRef, useState, useEffect } from "react";
import { Bold, Italic, Underline, Strikethrough, PenLine, Sparkles, Plus, Check, Undo2, Redo2 } from "lucide-react";

interface RichBulletEditorProps {
  label: string;
  bullets: string[];
  suggestions?: string[];
  onChange: (newBullets: string[]) => void;
  onRefineWithAI: (text: string, onApply: (newText: string) => void) => void;
}

/**
 * Converts markdown-style string (**bold**, *italic*, <u>underline</u>, ~~strike~~) to HTML for contentEditable
 */
function markdownToHtml(bullet: string): string {
  if (!bullet) return "<br>";
  let clean = bullet.replace(/^[•\-\*]\s*/, "");

  // Escape HTML entities first
  clean = clean
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Bold (**text** -> <strong>text</strong>)
  clean = clean.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  // Underline (<u>text</u> or __text__ -> <u>text</u>)
  clean = clean.replace(/&lt;u&gt;(.*?)&lt;\/u&gt;/gi, "<u>$1</u>");
  clean = clean.replace(/__([^_]+)__/g, "<u>$1</u>");
  // Italic (*text* -> <em>text</em>)
  clean = clean.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  // Strikethrough (~~text~~ -> <del>text</del>)
  clean = clean.replace(/~~([^~]+)~~/g, "<del>$1</del>");

  return clean || "<br>";
}

/**
 * Converts contentEditable DOM nodes back into markdown strings with formatting tokens preserved
 */
function nodeToMarkdown(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) {
    return node.nodeValue || "";
  }
  if (node.nodeType === Node.ELEMENT_NODE) {
    const el = node as HTMLElement;
    const tag = el.tagName.toUpperCase();

    let inner = "";
    el.childNodes.forEach((child) => {
      inner += nodeToMarkdown(child);
    });

    if (tag === "STRONG" || tag === "B") {
      return `**${inner}**`;
    }
    if (tag === "U" || tag === "INS") {
      return `<u>${inner}</u>`;
    }
    if (tag === "EM" || tag === "I") {
      return `*${inner}*`;
    }
    if (tag === "DEL" || tag === "S" || tag === "STRIKE") {
      return `~~${inner}~~`;
    }
    if (tag === "BR") {
      return "";
    }
    return inner;
  }
  return "";
}

/**
 * Extracts bullet points array from editor
 */
function extractBulletsFromEditor(editorEl: HTMLElement): string[] {
  const lis = editorEl.querySelectorAll("li");
  if (lis.length > 0) {
    const result: string[] = [];
    lis.forEach((li) => {
      const text = nodeToMarkdown(li).trim();
      if (text.length > 0) {
        result.push(text);
      }
    });
    return result.length > 0 ? result : [""];
  }

  const raw = editorEl.innerText.trim();
  return raw ? [raw] : [""];
}

const DEFAULT_SUGGESTIONS = [
  "Spearheaded end-to-end development of microservices using Node.js and TypeScript, reducing query latency by 32%.",
  "Optimized relational database query execution plans, slashing median response times by 40%.",
  "Authored comprehensive unit and integration test suites using Jest, boosting service code coverage from 68% to 91%.",
  "Designed and implemented automated CI/CD pipelines with GitHub Actions, reducing deployment cycle times to 8 minutes.",
];

const UL_BULLET_CLASS = "list-disc pl-5 space-y-1.5 outline-none text-sm text-slate-900 leading-relaxed";

export function RichBulletEditor({
  label,
  bullets,
  suggestions,
  onChange,
  onRefineWithAI,
}: RichBulletEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const isInternalChange = useRef(false);
  const [addedIndex, setAddedIndex] = useState<number | null>(null);

  // History state for Undo & Redo
  const [history, setHistory] = useState<string[][]>(() => [bullets && bullets.length > 0 ? bullets : [""]]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const pushHistory = (newBullets: string[], immediate: boolean = false) => {
    const current = history[historyIndex];
    if (current && JSON.stringify(current) === JSON.stringify(newBullets)) {
      return;
    }

    if (immediate) {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
      setHistory((prev) => {
        const sliced = prev.slice(0, historyIndex + 1);
        return [...sliced, newBullets].slice(-50);
      });
      setHistoryIndex((prev) => Math.min(prev + 1, 49));
    } else {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      debounceTimerRef.current = setTimeout(() => {
        setHistory((prev) => {
          const sliced = prev.slice(0, historyIndex + 1);
          return [...sliced, newBullets].slice(-50);
        });
        setHistoryIndex((prev) => Math.min(prev + 1, 49));
      }, 350);
    }
  };

  const handleUndo = () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    if (historyIndex <= 0) return;

    const nextIndex = historyIndex - 1;
    const previousBullets = history[nextIndex];
    if (!previousBullets) return;

    setHistoryIndex(nextIndex);

    const editor = editorRef.current;
    if (editor) {
      const html = `<ul class="${UL_BULLET_CLASS}">${previousBullets
        .map((b) => `<li>${markdownToHtml(b)}</li>`)
        .join("")}</ul>`;
      editor.innerHTML = html;
      isInternalChange.current = true;
      onChange(previousBullets);
    }
  };

  const handleRedo = () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    if (historyIndex >= history.length - 1) return;

    const nextIndex = historyIndex + 1;
    const nextBullets = history[nextIndex];
    if (!nextBullets) return;

    setHistoryIndex(nextIndex);

    const editor = editorRef.current;
    if (editor) {
      const html = `<ul class="${UL_BULLET_CLASS}">${nextBullets
        .map((b) => `<li>${markdownToHtml(b)}</li>`)
        .join("")}</ul>`;
      editor.innerHTML = html;
      isInternalChange.current = true;
      onChange(nextBullets);
    }
  };

  const activeSuggestions = suggestions && suggestions.length > 0 ? suggestions : DEFAULT_SUGGESTIONS;

  // Synchronize HTML with incoming bullets prop when changed externally (or on mount)
  useEffect(() => {
    if (isInternalChange.current) {
      isInternalChange.current = false;
      return;
    }

    const editor = editorRef.current;
    if (!editor) return;

    const items = bullets && bullets.length > 0 ? bullets : [""];
    const html = `<ul class="${UL_BULLET_CLASS}">${items
      .map((b) => `<li>${markdownToHtml(b)}</li>`)
      .join("")}</ul>`;

    editor.innerHTML = html;

    // Synchronize history if incoming bullets differ from current head
    setHistory((prev) => {
      const current = prev[historyIndex];
      if (!current || JSON.stringify(current) !== JSON.stringify(items)) {
        return [items];
      }
      return prev;
    });
    setHistoryIndex(0);
  }, [bullets]);

  // Helper to accurately determine if caret is at the start (offset 0) of an LI
  const isCursorAtStartOfLi = (li: HTMLLIElement, sel: Selection): boolean => {
    if (!sel.isCollapsed || !sel.anchorNode) return false;
    if (sel.anchorNode === li && sel.anchorOffset === 0) return true;

    let curr: Node | null = li;
    while (curr) {
      if (sel.anchorNode === curr && sel.anchorOffset === 0) return true;
      curr = curr.firstChild;
    }

    const walker = document.createTreeWalker(li, NodeFilter.SHOW_TEXT);
    const firstTextNode = walker.nextNode();
    if (firstTextNode && sel.anchorNode === firstTextNode && sel.anchorOffset === 0) {
      return true;
    }

    return false;
  };

  // MutationObserver to permanently guarantee no rogue div/p/text nodes exist outside <ul>
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    const observer = new MutationObserver(() => {
      let ul = editor.querySelector("ul");
      let hasRogueNodes = false;

      for (let i = 0; i < editor.childNodes.length; i++) {
        if (editor.childNodes[i] !== ul) {
          hasRogueNodes = true;
          break;
        }
      }

      if (hasRogueNodes) {
        if (!ul) {
          editor.innerHTML = `<ul class="${UL_BULLET_CLASS}"><li><br></li></ul>`;
          ul = editor.querySelector("ul");
        }

        if (ul) {
          const nodesToRemove: Node[] = [];
          const textToPrepend: string[] = [];

          editor.childNodes.forEach((node) => {
            if (node !== ul) {
              const text = node.textContent?.trim();
              if (text) {
                textToPrepend.push(text);
              }
              nodesToRemove.push(node);
            }
          });

          nodesToRemove.forEach((node) => {
            if (editor.contains(node)) {
              editor.removeChild(node);
            }
          });

          if (textToPrepend.length > 0) {
            textToPrepend.reverse().forEach((txt) => {
              const newLi = document.createElement("li");
              newLi.innerHTML = markdownToHtml(txt);
              ul?.insertBefore(newLi, ul.firstChild);
            });
          }

          if (!ul.querySelector("li")) {
            ul.innerHTML = "<li><br></li>";
          }

          const sel = window.getSelection();
          if (sel && (!sel.anchorNode || !ul.contains(sel.anchorNode))) {
            const firstLi = ul.querySelector("li");
            if (firstLi) {
              const range = document.createRange();
              range.setStart(firstLi, 0);
              range.collapse(true);
              sel.removeAllRanges();
              sel.addRange(range);
            }
          }

          isInternalChange.current = true;
          const extracted = extractBulletsFromEditor(editor);
          onChange(extracted);
        }
      }
    });

    observer.observe(editor, { childList: true });

    return () => observer.disconnect();
  }, [onChange]);

  // Ensures ONLY <ul> exists in the editor root and cleans up rogue unbulleted spaces
  const sanitizeEditor = () => {
    const editor = editorRef.current;
    if (!editor) return;

    let ul = editor.querySelector("ul");
    if (!ul) {
      const currentContent = editor.innerHTML;
      editor.innerHTML = `<ul class="${UL_BULLET_CLASS}"><li>${currentContent.trim() ? currentContent : "<br>"
        }</li></ul>`;
      return;
    }

    // If there are nodes outside the <ul> (like <div>, <p>, text nodes created by browser un-indent)
    const nodesToRemove: Node[] = [];
    const textToPrepend: string[] = [];

    editor.childNodes.forEach((node) => {
      if (node !== ul) {
        const text = node.textContent?.trim();
        if (text) {
          textToPrepend.push(text);
        }
        nodesToRemove.push(node);
      }
    });

    nodesToRemove.forEach((node) => {
      if (editor.contains(node)) {
        editor.removeChild(node);
      }
    });

    if (textToPrepend.length > 0) {
      textToPrepend.reverse().forEach((txt) => {
        const newLi = document.createElement("li");
        newLi.innerHTML = markdownToHtml(txt);
        ul?.insertBefore(newLi, ul.firstChild);
      });
    }

    if (!ul.querySelector("li")) {
      ul.innerHTML = "<li><br></li>";
    }
  };

  const handleInput = (immediate: boolean = false) => {
    const editor = editorRef.current;
    if (!editor) return;

    sanitizeEditor();

    isInternalChange.current = true;
    const extracted = extractBulletsFromEditor(editor);
    pushHistory(extracted, immediate);
    onChange(extracted);
  };

  // Formatting execution (Bold, Italic, Underline, Strikethrough)
  const applyFormat = (command: string) => {
    const editor = editorRef.current;
    if (!editor) return;

    editor.focus();
    document.execCommand(command, false);
    handleInput(true);
  };

  // Trigger Refine with AI for current line or selection
  const handleTriggerRefine = () => {
    const editor = editorRef.current;
    if (!editor) return;

    const sel = window.getSelection();
    let selectedText = sel ? sel.toString().trim() : "";
    let activeLi: HTMLLIElement | null = null;

    if (sel && sel.anchorNode) {
      let node: Node | null = sel.anchorNode;
      while (node && node !== editor) {
        if (node.nodeName === "LI") {
          activeLi = node as HTMLLIElement;
          break;
        }
        node = node.parentNode;
      }
    }

    if (!selectedText && activeLi) {
      selectedText = nodeToMarkdown(activeLi).trim();
    }

    if (!selectedText) {
      selectedText = bullets[0] || "Engineered scalable software solutions.";
    }

    onRefineWithAI(selectedText, (refinedText) => {
      if (activeLi) {
        activeLi.innerHTML = markdownToHtml(refinedText);
      } else {
        const ul = editor.querySelector("ul");
        if (ul) {
          const newLi = document.createElement("li");
          newLi.innerHTML = markdownToHtml(refinedText);
          ul.appendChild(newLi);
        }
      }
      handleInput(true);
    });
  };

  // Handle Backspace, Delete, and prevent un-indenting the top bullet into loose whitespace
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const editor = editorRef.current;
    if (!editor) return;

    // Handle Undo (Ctrl+Z) and Redo (Ctrl+Y or Ctrl+Shift+Z)
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z" && !e.shiftKey) {
      e.preventDefault();
      handleUndo();
      return;
    }
    if (
      (e.ctrlKey || e.metaKey) &&
      (e.key.toLowerCase() === "y" || (e.key.toLowerCase() === "z" && e.shiftKey))
    ) {
      e.preventDefault();
      handleRedo();
      return;
    }

    const sel = window.getSelection();
    if (!sel || !sel.anchorNode) return;

    const ul = editor.querySelector("ul");
    if (!ul) return;

    const lis = Array.from(ul.querySelectorAll("li"));

    // Find active LI
    let activeLi: HTMLLIElement | null = null;
    let node: Node | null = sel.anchorNode;
    while (node && node !== editor) {
      if (node.nodeName === "LI") {
        activeLi = node as HTMLLIElement;
        break;
      }
      node = node.parentNode;
    }

    // Case: Cursor is NOT inside any LI (e.g. inside a rogue div/p above ul, or directly in editor root)
    if (!activeLi) {
      if (e.key === "Backspace" || e.key === "Delete" || e.key === "Enter") {
        e.preventDefault();
        sanitizeEditor();
        const firstLi = ul.querySelector("li");
        if (firstLi) {
          const range = document.createRange();
          range.setStart(firstLi, 0);
          range.collapse(true);
          sel.removeAllRanges();
          sel.addRange(range);
        }
        handleInput();
        return;
      }
    }

    if (activeLi) {
      const isFirstLi = lis[0] === activeLi;
      const isLiEmpty =
        activeLi.innerText.trim() === "" ||
        activeLi.innerHTML === "<br>" ||
        activeLi.innerHTML === "";
      const isAtStart = isCursorAtStartOfLi(activeLi, sel);

      if (e.key === "Backspace") {
        // Case 1: On the first LI
        if (isFirstLi) {
          if (isLiEmpty) {
            e.preventDefault();
            if (lis.length > 1) {
              // Delete the empty top bullet and focus the next one cleanly
              const nextLi = lis[1];
              ul.removeChild(activeLi);
              const range = document.createRange();
              if (nextLi.firstChild && nextLi.firstChild.nodeType === Node.TEXT_NODE) {
                range.setStart(nextLi.firstChild, 0);
              } else {
                range.setStart(nextLi, 0);
              }
              range.collapse(true);
              sel.removeAllRanges();
              sel.addRange(range);
              handleInput();
            }
            // If it's the only LI, keep the empty bullet intact
            return;
          }

          // If first LI has text and cursor is at the very beginning (offset 0)
          if (isAtStart) {
            // Prevent browser from popping out of the list and creating space at the top
            e.preventDefault();
            return;
          }
        } else {
          // On subsequent empty LI: delete it and move cursor to end of previous LI
          if (isLiEmpty && sel.isCollapsed) {
            e.preventDefault();
            const prevLi = activeLi.previousElementSibling as HTMLLIElement | null;
            ul.removeChild(activeLi);
            if (prevLi) {
              const range = document.createRange();
              range.selectNodeContents(prevLi);
              range.collapse(false);
              sel.removeAllRanges();
              sel.addRange(range);
            }
            handleInput();
            return;
          }

          // If subsequent LI has text and cursor is at start of line: merge into previous LI
          if (!isLiEmpty && isAtStart) {
            e.preventDefault();
            const prevLi = activeLi.previousElementSibling as HTMLLIElement | null;
            if (prevLi) {
              const range = document.createRange();
              range.selectNodeContents(prevLi);
              range.collapse(false);

              while (activeLi.firstChild) {
                prevLi.appendChild(activeLi.firstChild);
              }
              ul.removeChild(activeLi);

              sel.removeAllRanges();
              sel.addRange(range);
              handleInput();
              return;
            }
          }
        }
      }

      if (e.key === "Delete") {
        if (isFirstLi && isLiEmpty && lis.length > 1) {
          e.preventDefault();
          const nextLi = lis[1];
          ul.removeChild(activeLi);
          const range = document.createRange();
          if (nextLi.firstChild && nextLi.firstChild.nodeType === Node.TEXT_NODE) {
            range.setStart(nextLi.firstChild, 0);
          } else {
            range.setStart(nextLi, 0);
          }
          range.collapse(true);
          sel.removeAllRanges();
          sel.addRange(range);
          handleInput();
          return;
        }

        if (!isFirstLi && isLiEmpty) {
          e.preventDefault();
          const nextLi = activeLi.nextElementSibling as HTMLLIElement | null;
          const prevLi = activeLi.previousElementSibling as HTMLLIElement | null;
          ul.removeChild(activeLi);
          const targetLi = nextLi || prevLi;
          if (targetLi) {
            const range = document.createRange();
            range.setStart(targetLi, 0);
            range.collapse(true);
            sel.removeAllRanges();
            sel.addRange(range);
          }
          handleInput();
          return;
        }
      }

      if (e.key === "Enter" && !e.shiftKey) {
        if (isLiEmpty) {
          e.preventDefault();
          // Don't pop out of list
          return;
        }

        if (isFirstLi && isAtStart) {
          // If pressing Enter at start of top bullet, insert a new empty bullet above inside ul
          e.preventDefault();
          const newLi = document.createElement("li");
          newLi.innerHTML = "<br>";
          ul.insertBefore(newLi, activeLi);
          handleInput();
          return;
        }
      }
    }
  };

  const handleInsertSuggestion = (suggestionText: string, idx: number, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const editor = editorRef.current;
    if (!editor) return;

    let ul = editor.querySelector("ul");
    if (!ul) {
      editor.innerHTML = `<ul class="${UL_BULLET_CLASS}"><li><br></li></ul>`;
      ul = editor.querySelector("ul");
    }

    if (!ul) return;

    const lis = ul.querySelectorAll("li");
    if (lis.length === 1 && (lis[0].innerText.trim() === "" || lis[0].innerHTML === "<br>")) {
      lis[0].innerHTML = markdownToHtml(suggestionText);
    } else {
      const newLi = document.createElement("li");
      newLi.innerHTML = markdownToHtml(suggestionText);
      ul.appendChild(newLi);
    }

    setAddedIndex(idx);
    setTimeout(() => {
      setAddedIndex((curr) => (curr === idx ? null : curr));
    }, 1400);
    handleInput(true);
  };

  return (
    <div className="w-full">
      {/* Header with Title and "Refine with AI" on the right */}
      <div className="flex items-center justify-between pb-1.5 mb-2">
        <span className="text-xs sm:text-[13px] font-semibold text-slate-700">
          {label}
        </span>

        {/* Elevated Refine with AI button */}
        <button
          type="button"
          onClick={handleTriggerRefine}
          className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs sm:text-[13px] font-semibold text-sky-700 bg-white hover:bg-sky-600 hover:text-white border border-sky-200 hover:border-sky-600 transition-colors shadow-subtle cursor-pointer group"
          title="Highlight a bullet and refine with AI STAR/XYZ frameworks"
        >
          <Sparkles className="w-4 h-4 mr-1.5" />
          <span>Refine with AI</span>
        </button>
      </div>

      {/* Editor Box */}
      <div className="border border-slate-200 rounded-xl bg-white overflow-hidden shadow-subtle focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-500/20 transition-all">
        {/* Rich Formatting Toolbar */}
        <div className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-50 border-b border-slate-200 text-slate-600 text-xs select-none">
          {/* Formatting tools */}
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              applyFormat("bold");
            }}
            className="p-1.5 rounded-md hover:bg-white hover:text-slate-900 transition-colors"
            title="Bold (Ctrl+B)"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              applyFormat("italic");
            }}
            className="p-1.5 rounded-md hover:bg-white hover:text-slate-900 transition-colors"
            title="Italic (Ctrl+I)"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              applyFormat("underline");
            }}
            className="p-1.5 rounded-md hover:bg-white hover:text-slate-900 transition-colors"
            title="Underline (Ctrl+U)"
          >
            <Underline className="w-4 h-4" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              applyFormat("strikeThrough");
            }}
            className="p-1.5 rounded-md hover:bg-white hover:text-slate-900 transition-colors"
            title="Strikethrough"
          >
            <Strikethrough className="w-4 h-4" />
          </button>

          {/* Divider */}
          <div className="h-4 w-px bg-slate-200 mx-1" />

          {/* Undo */}
          <button
            type="button"
            disabled={!canUndo}
            onMouseDown={(e) => {
              e.preventDefault();
              handleUndo();
            }}
            className={`p-1.5 rounded-md transition-colors ${canUndo
              ? "hover:bg-white hover:text-slate-900 cursor-pointer text-slate-700"
              : "text-slate-300 cursor-not-allowed opacity-40"
              }`}
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4" />
          </button>

          {/* Redo */}
          <button
            type="button"
            disabled={!canRedo}
            onMouseDown={(e) => {
              e.preventDefault();
              handleRedo();
            }}
            className={`p-1.5 rounded-md transition-colors ${canRedo
              ? "hover:bg-white hover:text-slate-900 cursor-pointer text-slate-700"
              : "text-slate-300 cursor-not-allowed opacity-40"
              }`}
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="w-4 h-4" />
          </button>
        </div>

        {/* ContentEditable Rich WYSIWYG Editor */}
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={() => handleInput(false)}
          onKeyDown={handleKeyDown}
          onKeyUp={() => sanitizeEditor()}
          onBlur={() => sanitizeEditor()}
          onFocus={() => {
            sanitizeEditor();
            const editor = editorRef.current;
            if (!editor) return;
            const ul = editor.querySelector("ul");
            if (!ul) return;
            const sel = window.getSelection();
            if (sel && sel.anchorNode && (sel.anchorNode === editor || !ul.contains(sel.anchorNode))) {
              const firstLi = ul.querySelector("li");
              if (firstLi) {
                const range = document.createRange();
                range.setStart(firstLi, 0);
                range.collapse(true);
                sel.removeAllRanges();
                sel.addRange(range);
              }
            }
          }}
          onClick={(e) => {
            sanitizeEditor();
            const editor = editorRef.current;
            if (!editor) return;
            const ul = editor.querySelector("ul");
            if (!ul) return;
            if (e.target === editor) {
              const firstLi = ul.querySelector("li");
              if (firstLi) {
                const sel = window.getSelection();
                if (sel) {
                  const range = document.createRange();
                  range.selectNodeContents(firstLi);
                  range.collapse(false);
                  sel.removeAllRanges();
                  sel.addRange(range);
                }
              }
            }
          }}
          className="w-full p-3.5 min-h-[110px] outline-none cursor-text text-sm text-slate-900 leading-relaxed [&_li]:text-sm [&_li]:text-slate-900 [&_li]:leading-relaxed [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-2"
        />
      </div>

      {/* Vertical Scroll-down Suggestion Bullets at the bottom */}
      {activeSuggestions.length > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2.5 px-0.5">
            <span className="text-xs sm:text-[13px] font-semibold text-slate-700 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-sky-500" />
              Suggested Bullets
            </span>
          </div>

          <div className="overflow-y-auto max-h-56 pr-1.5 space-y-2.5 scrollbar-thin scrollbar-thumb-slate-200 hover:scrollbar-thumb-slate-300">
            {activeSuggestions.map((item, idx) => {
              const isAdded = addedIndex === idx;
              return (
                <div
                  key={idx}
                  onClick={(e) => handleInsertSuggestion(item, idx, e)}
                  className={`group w-full p-3 rounded-xl border text-left cursor-pointer transition-all flex items-start justify-between gap-3 ${
                    isAdded
                      ? "bg-sky-50 border-sky-400 ring-1 ring-sky-300"
                      : "bg-white hover:bg-sky-50/40 border-slate-200 hover:border-sky-300 shadow-2xs"
                  }`}
                  title="Click to insert this bullet into your CV"
                >
                  <div className="flex-1">
                    <p className="text-xs sm:text-[13px] text-slate-700 leading-relaxed">
                      {item}
                    </p>
                  </div>

                  <div className="flex items-center shrink-0 self-center">
                    <button
                      type="button"
                      onClick={(e) => handleInsertSuggestion(item, idx, e)}
                      title={isAdded ? "Added to CV" : "Add to CV"}
                      aria-label={isAdded ? "Added to CV" : "Add to CV"}
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all flex-shrink-0 shadow-2xs ${
                        isAdded
                          ? "bg-sky-600 text-white animate-checkmark-pop shadow-md shadow-sky-500/30"
                          : "bg-sky-600 hover:bg-sky-700 text-white hover:scale-105 active:scale-95"
                      }`}
                    >
                      {isAdded ? (
                        <svg
                          className="w-4 h-4 text-white animate-checkmark-draw"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <Plus className="w-4 h-4 stroke-[2.5]" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
