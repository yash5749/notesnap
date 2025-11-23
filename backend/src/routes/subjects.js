import express from 'express';
import {
  createSubject,
  getSubjects,
  getSubject,
  updateSubject,
  deleteSubject
} from '../controllers/subjectController.js';
import { validateSubject } from '../middleware/validation.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.post('/', validateSubject, createSubject);
router.get('/', getSubjects);
router.get('/:id', getSubject);
router.put('/:id', validateSubject, updateSubject);
router.delete('/:id', deleteSubject);

export default router;