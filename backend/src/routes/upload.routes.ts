import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { uploadImageToS3 } from '../services/s3.service.js';
import { requireAuth } from '../middlewares/requireAuth.js';
import { AppError } from '../middlewares/errorHandler.js';

const upload = multer({
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new AppError('Only image files (PNG, JPG, WEBP) are allowed!', 400));
    }
  },
});

const router = Router();

// Upload photo endpoint
router.post(
  '/photo',
  requireAuth,
  upload.single('image'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        throw new AppError('No image file provided in request', 400);
      }

      const photoUrl = await uploadImageToS3(req.file.buffer, req.file.mimetype, 'photos');
      return res.status(200).json({
        success: true,
        photoUrl,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
