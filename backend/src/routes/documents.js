import express from 'express';
import {
  uploadDocument,
  getDocuments,
  getDocument,
  deleteDocument,
  getVectorStats,
  uploadSyllabus,
  uploadNotes,
  uploadPYQ,
  uploadTextbook,
  getDocumentStatus,    // ✅ ADD THIS
  getDocumentStats      // ✅ ADD THIS
} from '../controllers/documentController.js';
import { authenticate } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.use(authenticate);

// Upload routes
router.post('/upload', upload.single('file'), uploadDocument);
router.post('/upload/syllabus', upload.single('file'), uploadSyllabus);
router.post('/upload/notes', upload.single('file'), uploadNotes);
router.post('/upload/pyq', upload.single('file'), uploadPYQ);
router.post('/upload/textbook', upload.single('file'), uploadTextbook);

// Document management routes
router.get('/', getDocuments);
router.get('/stats/document-stats', getDocumentStats);  // ✅ ADD THIS NEW ROUTE
router.get('/stats/vector', getVectorStats);

// ✅ ADD THESE NEW ROUTES FOR DOCUMENT STATUS
router.get('/:id', getDocument);
router.get('/:id/status', getDocumentStatus);  // ✅ ADD THIS
router.delete('/:id', deleteDocument);

export default router;