import { Router } from 'express';
import { CvController } from '../controllers/cv.controller.js';
import { requireAuth } from '../middlewares/requireAuth.js';
import { validate } from '../middlewares/validate.js';
import { createCvSchema, updateCvSchema } from '../schemas/cv.schema.js';

const router = Router();

// All CV endpoints require authenticated user
router.use(requireAuth);

router.get('/', CvController.listUserCvs);
router.post('/', validate(createCvSchema), CvController.createCv);
router.get('/:id', CvController.getCvById);
router.put('/:id', validate(updateCvSchema), CvController.updateCv);
router.delete('/:id', CvController.deleteCv);

export const cvRoutes = router;
