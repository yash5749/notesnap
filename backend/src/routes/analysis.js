import express from 'express';
import {
  analyzeSubject,
  getAnalysis,
  getAnalyses,
  generateQuestions
} from '../controllers/analysisController.js';
import { validateAnalysis } from '../middleware/validation.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.post('/subject/:subjectId', validateAnalysis, analyzeSubject);
router.get('/', getAnalyses);
router.get('/:id', getAnalysis);
router.post('/generate-questions', generateQuestions);

export default router;