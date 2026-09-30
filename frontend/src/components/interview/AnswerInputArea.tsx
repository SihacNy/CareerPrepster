"use client";

import React, { useState, useEffect } from "react";
import {
  Mic,
  MicOff,
  Clock,
  Send,
  Loader2,
  RotateCcw,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { InputModality } from "@/types/interview";

interface AnswerInputAreaProps {
  onSubmit: (responseText: string, modality: InputModality, durationSeconds: number) => Promise<void>;
  isSubmitting: boolean;
  disabled?: boolean;
}

export function AnswerInputArea({
  onSubmit,
  isSubmitting,
  disabled = false,
}: AnswerInputAreaProps) {
  const [text, setText] = useState("");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [timerActive, setTimerActive] = useState(true);
  const [usedVoice, setUsedVoice] = useState(false);

  const {
    isListening,
    transcript,
    isSupported,
    error: speechError,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition();

  // Elapsed pacing timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (timerActive && !disabled) {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerActive, disabled]);

  // Sync speech transcript into answer text
  useEffect(() => {
    if (transcript) {
      setText(transcript);
      setUsedVoice(true);
    }
  }, [transcript]);

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;

  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || isSubmitting || disabled) return;

    if (isListening) {
      stopListening();
    }
    setTimerActive(false);

    await onSubmit(
      text.trim(),
      usedVoice ? "VOICE" : "TEXT",
      elapsedSeconds
    );
  };

  const handleReset = () => {
    setText("");
    resetTranscript();
    setUsedVoice(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
      {/* Top Bar: Timer, Voice Dictation Button & Word Count */}
      <div className="px-6 py-3 border-b border-slate-100 bg-slate-50/75 flex flex-wrap items-center justify-between gap-3">
        {/* Voice Dictation Button */}
        <div className="flex items-center space-x-3">
          {isSupported ? (
            <button
              type="button"
              onClick={toggleListening}
              disabled={disabled || isSubmitting}
              className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                isListening
                  ? "bg-red-500 text-white shadow-sm ring-2 ring-red-300 animate-pulse"
                  : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              {isListening ? <Mic className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5 text-sky-600" />}
              <span>{isListening ? "Listening... (Tap to Pause)" : "Record Voice Answer"}</span>
            </button>
          ) : (
            <div className="text-[11px] text-slate-400 flex items-center space-x-1">
              <MicOff className="w-3.5 h-3.5" />
              <span>Voice input not supported in this browser (Type below)</span>
            </div>
          )}

          {isListening && (
            <span className="text-[11px] text-red-600 font-medium flex items-center space-x-1 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              <span>Transcribing live speech...</span>
            </span>
          )}
        </div>

        {/* Pacing Timer & Word Count */}
        <div className="flex items-center space-x-4 text-xs text-slate-500">
          <div className="flex items-center space-x-1.5 font-sans tabular-nums font-semibold text-slate-600">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{formatTimer(elapsedSeconds)}</span>
          </div>

          <div className="border-l border-slate-200 pl-4 font-medium text-slate-600">
            <span>{wordCount} words</span>
          </div>
        </div>
      </div>

      {speechError && (
        <div className="px-6 py-2 bg-amber-50 border-b border-amber-100 text-amber-800 text-xs flex items-center space-x-2">
          <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span>{speechError}</span>
        </div>
      )}

      {/* Main Textarea */}
      <div className="p-4 sm:p-6 flex-1">
        <textarea
          rows={7}
          disabled={disabled || isSubmitting}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Speak into your microphone or type your response here... Follow the STAR method:
- Situation: Set the context and challenge
- Task: Explain your specific goal
- Action: Detail the exact technologies, tools, and steps you took
- Result: Conclude with quantifiable impact metrics..."
          className="w-full h-full p-2 text-sm text-slate-800 bg-transparent border-0 focus:outline-none focus:ring-0 placeholder:text-slate-400 resize-none leading-relaxed"
        />
      </div>

      {/* Bottom Actions Bar */}
      <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
        <button
          type="button"
          onClick={handleReset}
          disabled={!text || disabled || isSubmitting}
          className="text-xs font-semibold text-slate-400 hover:text-slate-600 disabled:opacity-30 transition-colors flex items-center space-x-1"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Clear Answer</span>
        </button>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!text.trim() || disabled || isSubmitting}
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Analyzing STAR Framework...</span>
            </>
          ) : (
            <>
              <span>Submit Answer</span>
              <Send className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
