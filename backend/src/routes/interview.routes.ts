import { Router } from 'express';
import { InterviewController } from '../controllers/interview.controller.js';
import { requireAuth } from '../middlewares/requireAuth.js';
import { validate } from '../middlewares/validate.js';
import {
  createInterviewSessionSchema,
  submitAnswerSchema,
  listSessionsQuerySchema,
} from '../schemas/interview.schema.js';

const router = Router();

// All interview endpoints require authenticated user
router.use(requireAuth);

router.post('/sessions', validate(createInterviewSessionSchema), InterviewController.createSession);
router.get('/sessions', validate(listSessionsQuerySchema, 'query'), InterviewController.listSessions);
router.get('/sessions/:id', InterviewController.getSessionById);
router.post('/sessions/:id/responses', validate(submitAnswerSchema), InterviewController.submitAnswer);
router.get('/sessions/:id/scorecard', InterviewController.getScorecard);

export const interviewRoutes = router;
