import Document from '../models/Document.js';
import Subject from '../models/Subject.js';
import DocumentProcessor from '../services/DocumentProcessor.js';
import ChromaService from '../services/ChromaService.js';
import RedisService from '../services/RedisService.js'; // ✅ ADD REDIS
import logger from '../utils/logger.js';
import fs from 'fs/promises';
import { ApiError, ApiResponse, asyncHandler } from '../utils/index.js';

// ✅ REDIS: Enhanced uploadDocument with caching
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

    // ✅ REDIS: Clear documents cache for this user/subject
    try {
        await RedisService.del(`documents:${req.user._id}:${subjectId}`);
        await RedisService.del(`documents:${req.user._id}:all`);
        console.log('✅ Cleared documents cache after upload');
    } catch (cacheError) {
        console.log('⚠️ Cache clear failed:', cacheError.message);
    }

    // Process document content asynchronously
    processDocumentContent(document._id).catch(error => {
        logger.error(`Background processing failed for document ${document._id}:`, error);
    });

    logger.info(`Document uploaded: ${document.originalName} by user ${req.user.email}`);

    return res
        .status(201)
        .json(new ApiResponse(201, { document }, "Document uploaded successfully. Processing in background."));
});

// ✅ REDIS: Enhanced processDocumentContent with caching
const processDocumentContent = async (documentId) => {
    try {
        const document = await Document.findById(documentId);
        if (!document) return;

        // ✅ REDIS: Cache processing status
        await RedisService.cacheDocumentStatus(documentId, {
            status: 'processing',
            startedAt: new Date().toISOString(),
            documentName: document.originalName,
            userId: document.userId.toString()
        }, 3600); // 1 hour cache

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

        // ✅ REDIS: Update cache with success status
        await RedisService.cacheDocumentStatus(documentId, {
            status: 'completed',
            completedAt: new Date().toISOString(),
            documentName: document.originalName,
            userId: document.userId.toString(),
            chromaAdded: false // Will update after ChromaDB
        }, 86400); // 24 hours cache

        // Add to Chroma vector store
        try {
            await ChromaService.addDocuments([document]);
            console.log(`✅ Document added to ChromaDB: ${document.originalName}`);
            
            // ✅ REDIS: Update cache with ChromaDB success
            await RedisService.cacheDocumentStatus(documentId, {
                status: 'completed',
                completedAt: new Date().toISOString(),
                documentName: document.originalName,
                userId: document.userId.toString(),
                chromaAdded: true,
                processedAt: new Date().toISOString()
            }, 86400); // 24 hours cache
            
        } catch (chromaError) {
            console.log('⚠️ Failed to add document to ChromaDB:', chromaError.message);
            
            // ✅ REDIS: Update cache with ChromaDB warning
            await RedisService.cacheDocumentStatus(documentId, {
                status: 'completed',
                completedAt: new Date().toISOString(),
                documentName: document.originalName,
                userId: document.userId.toString(),
                chromaAdded: false,
                warning: 'ChromaDB addition failed'
            }, 86400);
        }

        // ✅ REDIS: Clear documents list cache
        try {
            await RedisService.del(`documents:${document.userId}:${document.subjectId}`);
            await RedisService.del(`documents:${document.userId}:all`);
            console.log('✅ Cleared documents cache after processing');
        } catch (cacheError) {
            console.log('⚠️ Cache clear failed:', cacheError.message);
        }

        logger.info(`Document processed successfully: ${document.originalName}`);
    } catch (error) {
        const document = await Document.findById(documentId);
        if (document) {
            document.processingStatus = 'failed';
            await document.save();
            
            // ✅ REDIS: Cache failure status
            await RedisService.cacheDocumentStatus(documentId, {
                status: 'failed',
                failedAt: new Date().toISOString(),
                documentName: document.originalName,
                userId: document.userId.toString(),
                error: error.message
            }, 3600); // 1 hour cache
        }
        logger.error(`Document processing failed for ${documentId}:`, error);
    }
};

// ✅ REDIS: Enhanced getDocuments with caching
export const getDocuments = asyncHandler(async (req, res) => {
    const { subjectId, documentType } = req.query;
    
    // ✅ REDIS: Generate cache key
    const cacheKey = `documents:${req.user._id}:${subjectId || 'all'}:${documentType || 'all'}`;
    
    // ✅ REDIS: Check cache first
    try {
        const cachedDocuments = await RedisService.get(cacheKey);
        if (cachedDocuments) {
            console.log('✅ Serving documents from Redis cache');
            const cachedData = JSON.parse(cachedDocuments);
            return res.status(200).json(new ApiResponse(200, { 
                documents: cachedData,
                cached: true,
                servedFrom: 'redis_cache'
            }, "Documents fetched successfully from cache"));
        }
    } catch (cacheError) {
        console.log('⚠️ Documents cache check failed:', cacheError.message);
    }

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

    // ✅ REDIS: Cache the documents list (5 minutes)
    try {
        await RedisService.setex(cacheKey, 300, JSON.stringify(documents)); // 5 minutes
        console.log('✅ Documents list cached in Redis for 5 minutes');
    } catch (cacheError) {
        console.log('⚠️ Documents cache store failed:', cacheError.message);
    }

    return res
        .status(200)
        .json(new ApiResponse(200, { documents }, "Documents fetched successfully"));
});

// ✅ REDIS: Enhanced getDocument with caching
export const getDocument = asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    // ✅ REDIS: Generate cache key
    const cacheKey = `document:${id}`;
    
    // ✅ REDIS: Check cache first
    try {
        const cachedDocument = await RedisService.get(cacheKey);
        if (cachedDocument) {
            console.log('✅ Serving document from Redis cache');
            const cachedData = JSON.parse(cachedDocument);
            
            // Verify the document belongs to the user
            if (cachedData.userId.toString() !== req.user._id.toString()) {
                throw new ApiError(403, "Access denied");
            }
            
            return res.status(200).json(new ApiResponse(200, { 
                document: cachedData,
                cached: true,
                servedFrom: 'redis_cache'
            }, "Document fetched successfully from cache"));
        }
    } catch (cacheError) {
        console.log('⚠️ Document cache check failed:', cacheError.message);
    }

    const document = await Document.findOne({
        _id: id,
        userId: req.user._id
    }).populate('subjectId', 'name');

    if (!document) {
        throw new ApiError(404, "Document not found");
    }

    // ✅ REDIS: Cache the individual document (10 minutes)
    try {
        await RedisService.setex(cacheKey, 600, JSON.stringify(document)); // 10 minutes
        console.log('✅ Document cached in Redis for 10 minutes');
    } catch (cacheError) {
        console.log('⚠️ Document cache store failed:', cacheError.message);
    }

    return res
        .status(200)
        .json(new ApiResponse(200, { document }, "Document fetched successfully"));
});

// ✅ REDIS: Enhanced deleteDocument with cache invalidation
export const deleteDocument = asyncHandler(async (req, res) => {
    const document = await Document.findOne({
        _id: req.params.id,
        userId: req.user._id
    });

    if (!document) {
        throw new ApiError(404, "Document not found");
    }

    // Store info for cache clearing
    const documentInfo = {
        id: document._id.toString(),
        subjectId: document.subjectId.toString(),
        userId: document.userId.toString()
    };

    // Delete physical file
    if (document.filePath) {
        await fs.unlink(document.filePath).catch(() => {
            logger.warn(`Failed to delete physical file: ${document.filePath}`);
        });
    }

    await Document.findByIdAndDelete(req.params.id);

    // ✅ REDIS: Clear all related caches
    try {
        await RedisService.del(`document:${documentInfo.id}`);
        await RedisService.del(`documents:${documentInfo.userId}:${documentInfo.subjectId}`);
        await RedisService.del(`documents:${documentInfo.userId}:all`);
        await RedisService.del(`documents:${documentInfo.userId}:all:${document.documentType}`);
        await RedisService.del(`doc_status:${documentInfo.id}`);
        console.log('✅ Cleared all document-related caches after deletion');
    } catch (cacheError) {
        console.log('⚠️ Cache clear failed after deletion:', cacheError.message);
    }

    return res
        .status(200)
        .json(new ApiResponse(200, null, "Document deleted successfully"));
});

// ✅ REDIS: New endpoint to get document processing status
export const getDocumentStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    // ✅ REDIS: Try to get status from cache first
    try {
        const cachedStatus = await RedisService.getDocumentStatus(id);
        if (cachedStatus) {
            // Verify the document belongs to the user
            if (cachedStatus.userId !== req.user._id.toString()) {
                throw new ApiError(403, "Access denied");
            }
            
            return res.status(200).json(new ApiResponse(200, {
                status: cachedStatus,
                cached: true,
                servedFrom: 'redis_cache'
            }, "Document status fetched from cache"));
        }
    } catch (cacheError) {
        console.log('⚠️ Document status cache check failed:', cacheError.message);
    }
    
    // Fallback to database
    const document = await Document.findOne({
        _id: id,
        userId: req.user._id
    }).select('processingStatus originalName processedAt uploadedAt documentType');
    
    if (!document) {
        throw new ApiError(404, "Document not found");
    }
    
    const status = {
        status: document.processingStatus,
        documentName: document.originalName,
        documentType: document.documentType,
        processedAt: document.processedAt,
        uploadedAt: document.uploadedAt,
        userId: document.userId.toString()
    };
    
    // ✅ REDIS: Cache the status
    try {
        await RedisService.cacheDocumentStatus(id, status, 300); // 5 minutes
    } catch (cacheError) {
        console.log('⚠️ Document status cache store failed:', cacheError.message);
    }
    
    return res.status(200).json(new ApiResponse(200, {
        status: status,
        cached: false
    }, "Document status fetched from database"));
});

// ✅ REDIS: Enhanced getVectorStats with caching
export const getVectorStats = asyncHandler(async (req, res) => {
    // ✅ REDIS: Generate cache key
    const cacheKey = 'vector_stats:global';
    
    // ✅ REDIS: Check cache first
    try {
        const cachedStats = await RedisService.get(cacheKey);
        if (cachedStats) {
            console.log('✅ Serving vector stats from Redis cache');
            const cachedData = JSON.parse(cachedStats);
            return res.status(200).json(new ApiResponse(200, { 
                stats: cachedData,
                cached: true,
                servedFrom: 'redis_cache'
            }, "Vector store stats fetched successfully from cache"));
        }
    } catch (cacheError) {
        console.log('⚠️ Vector stats cache check failed:', cacheError.message);
    }

    try {
        const stats = await ChromaService.getCollectionStats();
        
        // ✅ REDIS: Cache vector stats (2 minutes)
        try {
            await RedisService.setex(cacheKey, 120, JSON.stringify(stats)); // 2 minutes
            console.log('✅ Vector stats cached in Redis for 2 minutes');
        } catch (cacheError) {
            console.log('⚠️ Vector stats cache store failed:', cacheError.message);
        }

        return res.status(200).json(new ApiResponse(200, { stats }, "Vector store stats fetched successfully"));
    } catch (error) {
        logger.error('Failed to get vector stats:', error);
        return res.status(200).json(new ApiResponse(200, { stats: { error: 'Chroma not available' } }, "Vector store stats fetched with warnings"));
    }
});

// ✅ REDIS: Enhanced specific upload controllers
export const uploadSyllabus = asyncHandler(async (req, res) => {
    await handleSpecificUpload(req, res, 'syllabus');
});

export const uploadNotes = asyncHandler(async (req, res) => {
    await handleSpecificUpload(req, res, 'notes');
});

export const uploadPYQ = asyncHandler(async (req, res) => {
    await handleSpecificUpload(req, res, 'pyq');
});

export const uploadTextbook = asyncHandler(async (req, res) => {
    await handleSpecificUpload(req, res, 'textbook');
});

// ✅ REDIS: Enhanced helper function with cache invalidation
const handleSpecificUpload = async (req, res, documentType) => {
    if (!req.file) {
        throw new ApiError(400, "No file uploaded");
    }

    const { subjectId } = req.body;

    // Validate subject exists and belongs to user
    const subject = await Subject.findOne({
        _id: subjectId,
        userId: req.user._id
    });

    if (!subject) {
        await fs.unlink(req.file.path).catch(() => {});
        throw new ApiError(404, "Subject not found");
    }

    // Use your existing DocumentProcessor
    await DocumentProcessor.validateFile(req.file);

    // Create document
    const document = await Document.create({
        userId: req.user._id,
        subjectId,
        filename: req.file.filename,
        originalName: req.file.originalname,
        documentType: documentType,
        mimeType: req.file.mimetype,
        size: req.file.size,
        filePath: req.file.path,
        processingStatus: 'pending'
    });

    // ✅ REDIS: Clear documents cache for this user/subject
    try {
        await RedisService.del(`documents:${req.user._id}:${subjectId}`);
        await RedisService.del(`documents:${req.user._id}:all`);
        await RedisService.del(`documents:${req.user._id}:all:${documentType}`);
        console.log('✅ Cleared documents cache after specific upload');
    } catch (cacheError) {
        console.log('⚠️ Cache clear failed:', cacheError.message);
    }

    // Process in background
    processDocumentContent(document._id).catch(error => {
        logger.error(`Background processing failed:`, error);
    });

    return res.status(201).json(new ApiResponse(201, { document }, `${documentType} uploaded successfully. Processing in background.`));
};

// ✅ REDIS: New endpoint to get user's document statistics
export const getDocumentStats = asyncHandler(async (req, res) => {
    const { subjectId } = req.query;
    
    // ✅ REDIS: Generate cache key
    const cacheKey = `doc_stats:${req.user._id}:${subjectId || 'all'}`;
    
    // ✅ REDIS: Check cache first
    try {
        const cachedStats = await RedisService.get(cacheKey);
        if (cachedStats) {
            console.log('✅ Serving document stats from Redis cache');
            const cachedData = JSON.parse(cachedStats);
            return res.status(200).json(new ApiResponse(200, { 
                stats: cachedData,
                cached: true,
                servedFrom: 'redis_cache'
            }, "Document statistics fetched from cache"));
        }
    } catch (cacheError) {
        console.log('⚠️ Document stats cache check failed:', cacheError.message);
    }

    const filter = { userId: req.user._id };
    if (subjectId) {
        filter.subjectId = subjectId;
    }

    const stats = await Document.aggregate([
        { $match: filter },
        {
            $group: {
                _id: '$documentType',
                count: { $sum: 1 },
                totalSize: { $sum: '$size' },
                processed: {
                    $sum: { $cond: [{ $eq: ['$processingStatus', 'completed'] }, 1, 0] }
                },
                failed: {
                    $sum: { $cond: [{ $eq: ['$processingStatus', 'failed'] }, 1, 0] }
                }
            }
        }
    ]);

    const totalStats = await Document.aggregate([
        { $match: filter },
        {
            $group: {
                _id: null,
                totalDocuments: { $sum: 1 },
                totalStorage: { $sum: '$size' },
                processingCompleted: {
                    $sum: { $cond: [{ $eq: ['$processingStatus', 'completed'] }, 1, 0] }
                },
                processingFailed: {
                    $sum: { $cond: [{ $eq: ['$processingStatus', 'failed'] }, 1, 0] }
                }
            }
        }
    ]);

    const result = {
        byType: stats,
        overall: totalStats[0] || {
            totalDocuments: 0,
            totalStorage: 0,
            processingCompleted: 0,
            processingFailed: 0
        },
        generatedAt: new Date().toISOString()
    };

    // ✅ REDIS: Cache document statistics (5 minutes)
    try {
        await RedisService.setex(cacheKey, 300, JSON.stringify(result)); // 5 minutes
        console.log('✅ Document statistics cached in Redis for 5 minutes');
    } catch (cacheError) {
        console.log('⚠️ Document stats cache store failed:', cacheError.message);
    }

    return res.status(200).json(new ApiResponse(200, { stats: result }, "Document statistics fetched successfully"));
});