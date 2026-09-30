import { Router } from 'express';
import { JobsController } from '../controllers/jobs.controller.js';
import { requireAuth } from '../middlewares/requireAuth.js';
import { validate } from '../middlewares/validate.js';
import {
  JobListQuerySchema,
  UpdateRecommendationStatusSchema,
  UpdateJobPreferencesSchema,
} from '../schemas/jobs.schema.js';

const router = Router();

// Candidate Job Match endpoints require authentication
router.use('/recommendations', requireAuth);
router.get('/recommendations', validate(JobListQuerySchema, 'query'), JobsController.listRecommendations);
router.get('/recommendations/:id', JobsController.getRecommendationById);
router.patch('/recommendations/:id/status', validate(UpdateRecommendationStatusSchema), JobsController.updateRecommendationStatus);

router.use('/preferences', requireAuth);
router.get('/preferences', JobsController.getPreferences);
router.put('/preferences', validate(UpdateJobPreferencesSchema), JobsController.updatePreferences);

router.use('/refresh', requireAuth);
router.post('/refresh', JobsController.triggerRefresh);
router.get('/refresh/status', JobsController.getRefreshStatus);

// Internal/Admin discovery trigger
router.post('/admin/discover', JobsController.adminDiscover);

export const jobRoutes = router;
