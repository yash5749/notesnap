import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import { generateToken } from '../middleware/auth.js';
import logger from '../utils/logger.js';
import { ApiError, ApiResponse, asyncHandler } from '../utils/index.js';

export const register = asyncHandler(async (req, res) => {
    const { email, password, name } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new ApiError(409, "User already exists with this email");
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const user = new User({
        name,
        email,
        password
    });

    await user.save();


    // Generate token
    const token = generateToken(user._id);

    logger.info(`New user registered: ${user.email}`);

    const userData = {
        id: user._id,
        email: user.email,
        name: user.name,
        subscription: user.subscription
    };

    return res
        .status(201)
        .json(new ApiResponse(201, { user: userData, token }, "User registered successfully"));
});

export const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Find user and include password for comparison
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
        throw new ApiError(401, "Invalid email or password");
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        throw new ApiError(401, "Incorrect Password");
    }

    // Generate token
    const token = generateToken(user._id);

    logger.info(`User logged in: ${user.email}`);

    const userData = {
        id: user._id,
        email: user.email,
        name: user.name,
        subscription: user.subscription
    };

    return res
        .status(200)
        .json(new ApiResponse(200, { user: userData, token }, "Login successful"));
});

export const getProfile = asyncHandler(async (req, res) => {
    const userData = {
        id: req.user._id,
        email: req.user.email,
        name: req.user.name,
        subscription: req.user.subscription,
        createdAt: req.user.createdAt
    };

    return res
        .status(200)
        .json(new ApiResponse(200, { user: userData }, "Profile fetched successfully"));
});