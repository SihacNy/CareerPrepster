import { Router } from 'express';
import { JobRoleController } from '../controllers/job-role.controller.js';
import { validate } from '../middlewares/validate.js';
import { jobRoleQuerySchema, roleBulletsQuerySchema } from '../schemas/job-role.schema.js';

const router = Router();

// Job role catalog endpoints are public
router.get('/', validate(jobRoleQuerySchema, 'query'), JobRoleController.listRoles);
router.get('/:id/bullets', validate(roleBulletsQuerySchema, 'query'), JobRoleController.getRoleBullets);

export const jobRoleRoutes = router;
