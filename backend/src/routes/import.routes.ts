import { Router } from 'express';
import { ImportController, uploadMiddleware } from '../controllers/import.controller.js';

const router = Router();

router.post('/import', uploadMiddleware.single('file'), ImportController.importResume);

export const importRoutes = router;
