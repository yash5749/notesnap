import Subject from '../models/Subject.js';
import Document from '../models/Document.js';
import logger from '../utils/logger.js';
import { ApiError, ApiResponse, asyncHandler } from '../utils/index.js';

export const createSubject = asyncHandler(async (req, res) => {
    const { name, description, syllabus } = req.body;

    const subject = await Subject.create({
        userId: req.user._id,
        name,
        description,
        syllabus
    });

    logger.info(`Subject created: ${subject.name} by user ${req.user.email}`);

    return res
        .status(201)
        .json(new ApiResponse(201, { subject }, "Subject created successfully"));
});

export const getSubjects = asyncHandler(async (req, res) => {
    const subjects = await Subject.find({ 
        userId: req.user._id,
        isActive: true 
    }).sort({ createdAt: -1 });

    return res
        .status(200)
        .json(new ApiResponse(200, { subjects }, "Subjects fetched successfully"));
});

export const getSubject = asyncHandler(async (req, res) => {
    const subject = await Subject.findOne({
        _id: req.params.id,
        userId: req.user._id
    });

    if (!subject) {
        throw new ApiError(404, "Subject not found");
    }

    // Get document counts for this subject
    const documentCounts = await Document.aggregate([
        {
            $match: {
                subjectId: subject._id,
                userId: req.user._id
            }
        },
        {
            $group: {
                _id: '$documentType',
                count: { $sum: 1 }
            }
        }
    ]);

    const counts = {};
    documentCounts.forEach(item => {
        counts[item._id] = item.count;
    });

    return res
        .status(200)
        .json(new ApiResponse(200, { subject, documentCounts: counts }, "Subject fetched successfully"));
});

export const updateSubject = asyncHandler(async (req, res) => {
    const { name, description, syllabus } = req.body;

    const subject = await Subject.findOneAndUpdate(
        {
            _id: req.params.id,
            userId: req.user._id
        },
        {
            name,
            description,
            syllabus
        },
        {
            new: true,
            runValidators: true
        }
    );

    if (!subject) {
        throw new ApiError(404, "Subject not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, { subject }, "Subject updated successfully"));
});

export const deleteSubject = asyncHandler(async (req, res) => {
    const subject = await Subject.findOneAndUpdate(
        {
            _id: req.params.id,
            userId: req.user._id
        },
        {
            isActive: false
        },
        {
            new: true
        }
    );

    if (!subject) {
        throw new ApiError(404, "Subject not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, null, "Subject deleted successfully"));
});