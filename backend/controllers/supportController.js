import SupportMessage from '../models/SupportMessage.js';

// @desc    Create a new support message
// @route   POST /api/support
// @access  Public
export const createSupportMessage = async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;

    const supportMessage = await SupportMessage.create({
      name,
      email,
      subject,
      message
    });

    // socket io notification to admin
    if (req.io) {
      req.io.emit('support_message_created', supportMessage);
    }

    res.status(201).json({
      success: true,
      message: 'Support message received',
      supportMessage
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all support messages
// @route   GET /api/support
// @access  Public (or Admin in production)
export const getSupportMessages = async (req, res, next) => {
  try {
    const messages = await SupportMessage.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: messages.length,
      messages
    });
  } catch (error) {
    next(error);
  }
};
