import Analysis from '../models/Analysis.js';
import Subject from '../models/Subject.js';
import Document from '../models/Document.js';
import AnalysisService from '../services/AnalysisService.js';
import logger from '../utils/logger.js';
import { ApiError, ApiResponse, asyncHandler } from '../utils/index.js';

export const analyzeSubject = asyncHandler(async (req, res) => {
    const { subjectId } = req.params;
    const { focusAreas, questionTypes, depth } = req.body;

    // Validate subject exists and belongs to user
    const subject = await Subject.findOne({
        _id: subjectId,
        userId: req.user._id
    });

    if (!subject) {
        throw new ApiError(404, "Subject not found");
    }

    // Get all processed documents for this subject
    const documents = await Document.find({
        subjectId,
        userId: req.user._id,
        processingStatus: 'completed'
    });

    if (documents.length === 0) {
        throw new ApiError(400, "No processed documents found for analysis");
    }

    // Separate documents by type
    const syllabus = documents.find(d => d.documentType === 'syllabus');
    const notes = documents.filter(d => d.documentType === 'notes');
    const pyqs = documents.filter(d => d.documentType === 'pyq');

    if (notes.length === 0 && pyqs.length === 0) {
        throw new ApiError(400, "Need at least notes or previous year questions for analysis");
    }

    // Create analysis record
    const analysis = await Analysis.create({
        userId: req.user._id,
        subjectId,
        documentIds: documents.map(d => d._id),
        status: 'processing'
    });

    // Perform analysis asynchronously
    performAnalysis(analysis._id, {
        subject,
        syllabus,
        notes,
        pyqs,
        options: { focusAreas, questionTypes, depth }
    }).catch(error => {
        logger.error(`Background analysis failed for ${analysis._id}:`, error);
    });

    logger.info(`Analysis started for subject: ${subject.name} by user ${req.user.email}`);

    return res
        .status(202)
        .json(new ApiResponse(202, { analysisId: analysis._id, status: 'processing' }, "Analysis started. Check back later for results."));
});

// Background analysis processing
const performAnalysis = async (analysisId, input) => {
    try {
        const analysis = await Analysis.findById(analysisId);
        if (!analysis) return;

        const result = await AnalysisService.analyzeSubject(input);

        analysis.importantTopics = result.importantTopics;
        analysis.generatedQuestions = result.generatedQuestions;
        analysis.summary = result.summary;
        analysis.metadata = result.metadata;
        analysis.status = 'completed';
        await analysis.save();

        logger.info(`Analysis completed successfully: ${analysisId}`);
    } catch (error) {
        const analysis = await Analysis.findById(analysisId);
        if (analysis) {
            analysis.status = 'failed';
            await analysis.save();
        }
        logger.error(`Analysis processing failed for ${analysisId}:`, error);
        throw error;
    }
};

export const getAnalysis = asyncHandler(async (req, res) => {
    const analysis = await Analysis.findOne({
        _id: req.params.id,
        userId: req.user._id
    })
        .populate('subjectId', 'name')
        .populate('documentIds', 'originalName documentType');

    if (!analysis) {
        throw new ApiError(404, "Analysis not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, { analysis }, "Analysis fetched successfully"));
});

export const getAnalyses = asyncHandler(async (req, res) => {
    const { subjectId } = req.query;
    
    const filter = {
        userId: req.user._id
    };

    if (subjectId) {
        filter.subjectId = subjectId;
    }

    const analyses = await Analysis.find(filter)
        .populate('subjectId', 'name')
        .sort({ createdAt: -1 })
        .limit(20);

    return res
        .status(200)
        .json(new ApiResponse(200, { analyses }, "Analyses fetched successfully"));
});

export const generateQuestions = asyncHandler(async (req, res) => {
    const { topic, count = 5, difficulty, type } = req.body;

    // Mock response for now
    const mockQuestions = Array.from({ length: count }, (_, i) => ({
        id: `gen-${Date.now()}-${i}`,
        question: `Sample question about ${topic} (${difficulty} difficulty)`,
        type: type || 'application',
        marks: difficulty === 'easy' ? 2 : difficulty === 'medium' ? 5 : 10,
        difficulty,
        topic,
        learningOutcome: `Understand key concepts of ${topic}`,
        modelUsed: 'gemini-pro',
        estimatedTime: difficulty === 'easy' ? 5 : difficulty === 'medium' ? 10 : 15
    }));

    return res
        .status(200)
        .json(new ApiResponse(200, { questions: mockQuestions }, "Questions generated successfully"));
});