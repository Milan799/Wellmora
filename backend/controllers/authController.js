import User from '../models/User.js';
import Cart from '../models/Cart.js';
import jwt from 'jsonwebtoken';

// Helpers to sign tokens
const generateAccessToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.ACCESS_TOKEN_SECRET || 'wellmora_access_secret_123', {
    expiresIn: '15m'
  });
};

const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.REFRESH_TOKEN_SECRET || 'wellmora_refresh_secret_456', {
    expiresIn: '7d'
  });
};

// Set token cookies helper
const sendTokenResponse = async (user, statusCode, res) => {
  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  // Save refresh token to user model
  user.refreshTokens = user.refreshTokens || [];
  user.refreshTokens.push(refreshToken);
  await user.save();

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  };

  res.cookie('accessToken', accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000 // 15 minutes
  });

  res.cookie('refreshToken', refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });

  res.status(statusCode).json({
    success: true,
    accessToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      shippingAddress: user.shippingAddress,
      billingAddress: user.billingAddress
    }
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
  const { name, email, password } = req.body;

  try {
    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, error: 'User already exists' });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password
    });

    // Create empty cart for user
    await Cart.create({
      user: user._id,
      items: [],
      subtotal: 0
    });

    await sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Please provide email and password' });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    await sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user / clear cookies
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      // Remove refresh token from user document
      await User.updateOne(
        { _id: req.user.id },
        { $pull: { refreshTokens: refreshToken } }
      );
    }

    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public
export const refresh = async (req, res, next) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ success: false, error: 'No refresh token provided' });
  }

  try {
    // Find user by token
    const user = await User.findOne({ refreshTokens: refreshToken });
    if (!user) {
      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');
      return res.status(401).json({ success: false, error: 'Invalid refresh token - user not found' });
    }

    // Verify token
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET || 'wellmora_refresh_secret_456');
    if (decoded.id !== user._id.toString()) {
      return res.status(401).json({ success: false, error: 'Invalid refresh token verification' });
    }

    // Generate new tokens (token rotation)
    const newAccessToken = generateAccessToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    // Replace old refresh token with new one in database
    user.refreshTokens = user.refreshTokens.filter(t => t !== refreshToken);
    user.refreshTokens.push(newRefreshToken);
    await user.save();

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    };

    res.cookie('accessToken', newAccessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000
    });

    res.cookie('refreshToken', newRefreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(200).json({
      success: true,
      accessToken: newAccessToken
    });
  } catch (error) {
    // Clear cookies on token verification failure
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    return res.status(401).json({ success: false, error: 'Refresh token expired or invalid' });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        shippingAddress: user.shippingAddress,
        billingAddress: user.billingAddress
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update profile address
// @route   PUT /api/auth/address
// @access  Private
export const updateAddress = async (req, res, next) => {
  const { shippingAddress, billingAddress } = req.body;

  try {
    const user = await User.findById(req.user.id);
    
    if (shippingAddress) user.shippingAddress = shippingAddress;
    if (billingAddress) user.billingAddress = billingAddress;

    await user.save();

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        shippingAddress: user.shippingAddress,
        billingAddress: user.billingAddress
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Social Login (Google / GitHub)
// @route   POST /api/auth/social-login
// @access  Public
export const socialLogin = async (req, res, next) => {
  const { name, email, provider } = req.body;

  try {
    if (!email || !name) {
      return res.status(400).json({ success: false, error: 'Please provide email and name' });
    }

    // Check if user exists
    let user = await User.findOne({ email });

    if (!user) {
      // Create user with a dummy password
      const dummyPassword = Math.random().toString(36).substring(2, 15) + 'A1!';
      user = await User.create({
        name,
        email,
        password: dummyPassword
      });

      // Create empty cart for user
      await Cart.create({
        user: user._id,
        items: [],
        subtotal: 0
      });
    }

    await sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users (Admin only)
// @route   GET /api/auth/users
// @access  Private/Admin
export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({}).sort('-createdAt');
    res.status(200).json({
      success: true,
      users: users.map(user => ({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        shippingAddress: user.shippingAddress,
        createdAt: user.createdAt
      }))
    });
  } catch (error) {
    next(error);
  }
};

