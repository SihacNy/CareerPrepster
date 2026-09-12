import { NextRequest, NextResponse } from "next/server";
import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * POST /api/cvs/import
 *
 * Accepts a multipart/form-data upload with a single `file` field (PDF or DOCX).
 * Extracts raw text using pdf-parse (PDF) or mammoth (DOCX) and returns it.
 *
 * NOTE: This is a TEMPORARY Next.js API route. When the Express backend is added,
 * migrate this logic to backend/src/routes/import.routes.ts + backend/src/services/parser.service.ts.
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "NO_FILE", message: "No file was provided." },
        },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "FILE_TOO_LARGE",
            message: "File exceeds the 5MB size limit.",
          },
        },
        { status: 413 }
      );
    }

    // Determine file type
    const fileName = file.name.toLowerCase();
    const isPdf =
      file.type === "application/pdf" || fileName.endsWith(".pdf");
    const isDocx =
      file.type ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      fileName.endsWith(".docx");

    if (!isPdf && !isDocx) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_FILE_TYPE",
            message: "Only PDF and DOCX files are supported.",
          },
        },
        { status: 400 }
      );
    }

    // Read file into a Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let rawText = "";

    if (isPdf) {
      const parser = new PDFParse({ data: buffer });
      const textResult = await parser.getText();
      rawText = textResult.text || "";
      await parser.destroy();
    } else if (isDocx) {
      const result = await mammoth.extractRawText({ buffer });
      rawText = result.value || "";
    }

    // Clean up extracted text: normalize whitespace
    rawText = rawText
      .replace(/\r\n/g, "\n")
      .replace(/[ \t]+/g, " ")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    // Image-only PDF detection: if we extracted fewer than 30 characters,
    // the PDF is likely a scanned image with no selectable text layer.
    if (rawText.length < 30) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "SCANNED_PDF_NO_TEXT",
            message:
              "Could not detect selectable text in this PDF. Please upload a digital PDF or start from scratch with our templates.",
          },
        },
        { status: 422 }
      );
    }

    return NextResponse.json({
      success: true,
      rawText,
      sourceFileName: file.name,
    });
  } catch (error) {
    console.error("[/api/cvs/import] Parsing error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "PARSE_ERROR",
          message:
            "An unexpected error occurred while parsing your file. Please try again.",
        },
      },
      { status: 500 }
    );
  }
}
