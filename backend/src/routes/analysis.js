import express from 'express';
import {
  analyzeSubject,
  getAnalysis,
  getAnalyses,
  generateQuestions,
  quickPredict,
  testChromaConnection,
  testChromaDetailed,
  resetChromaCollection,
  testChromaFull,
  testGeminiAPI,
  getRedisHealth,
  clearRedisCache
} from '../controllers/analysisController.js';
import { validateAnalysis } from '../middleware/validation.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

// ✅ FIXED: Put ALL debug routes before parameterized routes
router.get('/test-chroma', testChromaConnection);
router.get('/debug/chroma-detailed', testChromaDetailed);
router.get('/debug/chroma-full-test', testChromaFull);
router.delete('/debug/chroma-reset', resetChromaCollection);
router.get('/debug/gemini-test', testGeminiAPI);
router.get('/debug/redis-health', getRedisHealth);
router.post('/debug/redis-clear', clearRedisCache);

// Analysis routes
router.post('/subject/:subjectId', validateAnalysis, analyzeSubject);
router.get('/', getAnalyses);
router.post('/generate-questions', generateQuestions);

router.post('/quick-predict', quickPredict);

// ✅ This MUST be LAST - it catches everything else as :id
router.get('/:id', getAnalysis);

export default router;