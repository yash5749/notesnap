import Document from '../models/Document.js';
import Subject from '../models/Subject.js';
import DocumentProcessor from '../services/DocumentProcessor.js';
import logger from '../utils/logger.js';
import fs from 'fs/promises';
import { ApiError, ApiResponse, asyncHandler } from '../utils/index.js';

export const uploadDocument = asyncHandler(async (req, res) => {
    if (!req.file) {
        throw new ApiError(400, "No file uploaded");
    }

    const { subjectId, documentType } = req.body;

    // Validate subject exists and belongs to user
    const subject = await Subject.findOne({
        _id: subjectId,
        userId: req.user._id
    });

    if (!subject) {
        // Clean up uploaded file
        await fs.unlink(req.file.path).catch(() => {});
        throw new ApiError(404, "Subject not found");
    }

    // Validate file
    await DocumentProcessor.validateFile(req.file);

    // Create document record
    const document = await Document.create({
        userId: req.user._id,
        subjectId,
        filename: req.file.filename,
        originalName: req.file.originalname,
        documentType,
        mimeType: req.file.mimetype,
        size: req.file.size,
        filePath: req.file.path,
        processingStatus: 'pending'
    });

    // Process document content asynchronously
    processDocumentContent(document._id).catch(error => {
        logger.error(`Background processing failed for document ${document._id}:`, error);
    });

    logger.info(`Document uploaded: ${document.originalName} by user ${req.user.email}`);

    return res
        .status(201)
        .json(new ApiResponse(201, { document }, "Document uploaded successfully. Processing in background."));
});

// Background document processing (keep this function as is)
const processDocumentContent = async (documentId) => {
    try {
        const document = await Document.findById(documentId);
        if (!document) return;

        document.processingStatus = 'processing';
        await document.save();

        const { content, metadata } = await DocumentProcessor.processDocument(
            document.filePath,
            document.mimeType
        );

        document.content = content;
        document.metadata = metadata;
        document.processingStatus = 'completed';
        document.processedAt = new Date();
        await document.save();

        logger.info(`Document processed successfully: ${document.originalName}`);
    } catch (error) {
        const document = await Document.findById(documentId);
        if (document) {
            document.processingStatus = 'failed';
            await document.save();
        }
        logger.error(`Document processing failed for ${documentId}:`, error);
        throw error;
    }
};

export const getDocuments = asyncHandler(async (req, res) => {
    const { subjectId, documentType } = req.query;
    
    const filter = {
        userId: req.user._id
    };

    if (subjectId) {
        filter.subjectId = subjectId;
    }

    if (documentType) {
        filter.documentType = documentType;
    }

    const documents = await Document.find(filter)
        .populate('subjectId', 'name')
        .sort({ uploadedAt: -1 });

    return res
        .status(200)
        .json(new ApiResponse(200, { documents }, "Documents fetched successfully"));
});

export const getDocument = asyncHandler(async (req, res) => {
    const document = await Document.findOne({
        _id: req.params.id,
        userId: req.user._id
    }).populate('subjectId', 'name');

    if (!document) {
        throw new ApiError(404, "Document not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, { document }, "Document fetched successfully"));
});

export const deleteDocument = asyncHandler(async (req, res) => {
    const document = await Document.findOne({
        _id: req.params.id,
        userId: req.user._id
    });

    if (!document) {
        throw new ApiError(404, "Document not found");
    }

    // Delete physical file
    if (document.filePath) {
        await fs.unlink(document.filePath).catch(() => {
            logger.warn(`Failed to delete physical file: ${document.filePath}`);
        });
    }

    await Document.findByIdAndDelete(req.params.id);

    return res
        .status(200)
        .json(new ApiResponse(200, null, "Document deleted successfully"));
});