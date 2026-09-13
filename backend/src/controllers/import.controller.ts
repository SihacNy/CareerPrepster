import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { ParserService } from '../services/parser.service.js';
import { AppError } from '../middlewares/errorHandler.js';

// Multer in-memory storage (Zero persistent disk writes)
export const uploadMiddleware = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (_req, file, cb) => {
    const allowedMimes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
    ];
    if (allowedMimes.includes(file.mimetype) || file.originalname.match(/\.(pdf|docx)$/i)) {
      cb(null, true);
    } else {
      cb(new AppError('Only .pdf and .docx files are supported.', 400, 'INVALID_FILE_TYPE'));
    }
  },
});

export class ImportController {
  static async importResume(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        throw new AppError('No resume file uploaded.', 400, 'NO_FILE_UPLOADED');
      }

      const fileBuffer = req.file.buffer;
      const mimeType = req.file.mimetype;

      // 1. Extract in-memory text via pdf-parse or mammoth
      const rawText = await ParserService.extractRawText(fileBuffer, mimeType);

      // 2. Semantic layout structuring with Google Gemini
      const parsedCV = await ParserService.structureResumeWithAI(rawText);

      return res.status(200).json({
        success: true,
        data: {
          extractedTextLength: rawText.length,
          parsedCV,
        },
      });
    } catch (error) {
      return next(error);
    }
  }
}
