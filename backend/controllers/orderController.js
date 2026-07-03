import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Cart from '../models/Cart.js';

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
export const createOrder = async (req, res, next) => {
  const { shippingAddress, paymentMethod, paymentStatus, transactionId } = req.body;

  try {
    // 1. Get user cart
    const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, error: 'Your cart is empty' });
    }

    // 2. Map items and check stock
    const orderItems = [];
    for (const item of cart.items) {
      const product = await Product.findById(item.product._id);
      if (!product) {
        return res.status(404).json({ success: false, error: `Product not found: ${item.product.title}` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          error: `Insufficient stock for product: ${product.title}. Available stock: ${product.stock}`
        });
      }

      orderItems.push({
        product: product._id,
        title: product.title,
        quantity: item.quantity,
        price: item.price,
        image: product.images[0] || ''
      });
    }

    // 3. Deduct stock and update database
    for (const item of cart.items) {
      const product = await Product.findById(item.product._id);
      product.stock -= item.quantity;
      await product.save();

      // Emit real-time inventory change event
      if (req.io) {
        req.io.emit('product_updated', {
          id: product._id,
          title: product.title,
          price: product.price,
          discountPrice: product.discountPrice,
          stock: product.stock
        });
      }
    }

    // 4. Calculate prices
    const subtotal = cart.subtotal;
    const shippingPrice = subtotal > 1000 ? 0 : 100; // Free shipping above Rs 1000
    const taxPrice = parseFloat((subtotal * 0.18).toFixed(2)); // 18% tax
    const totalPrice = parseFloat((subtotal + shippingPrice + taxPrice).toFixed(2));

    // 5. Create Order
    const order = await Order.create({
      user: req.user.id,
      items: orderItems,
      shippingAddress,
      paymentDetails: {
        paymentMethod,
        status: paymentStatus || 'Pending',
        transactionId: transactionId || ''
      },
      shippingPrice,
      taxPrice,
      totalPrice
    });

    // 6. Clear user cart
    cart.items = [];
    cart.subtotal = 0;
    await cart.save();

    // Notify Admins of new order
    if (req.io) {
      req.io.emit('order_created', {
        id: order._id,
        userName: req.user.name,
        totalPrice: order.totalPrice,
        createdAt: order.createdAt
      });
    }

    res.status(201).json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    // Authorize: check if user owns order or is Admin
    if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Not authorized to view this order' });
    }

    res.status(200).json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort('-createdAt');
    res.status(200).json({ success: true, orders });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders (Admin only)
// @route   GET /api/orders
// @access  Private/Admin
export const getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({}).populate('user', 'name email').sort('-createdAt');
    res.status(200).json({ success: true, orders });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status / tracking details (Admin only)
// @route   PUT /api/orders/:id
// @access  Private/Admin
export const updateOrderStatus = async (req, res, next) => {
  const { orderStatus, trackingId, paymentStatus } = req.body;

  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    if (orderStatus) order.orderStatus = orderStatus;
    if (trackingId) order.trackingId = trackingId;
    if (paymentStatus) order.paymentDetails.status = paymentStatus;

    if (orderStatus === 'Delivered') {
      order.estimatedDelivery = Date.now();
    }

    await order.save();

    // Socket.io real-time update to specific user/room or broadcast
    if (req.io) {
      req.io.emit('order_updated', {
        id: order._id,
        status: order.orderStatus,
        userId: order.user,
        trackingId: order.trackingId
      });
    }

    res.status(200).json({ success: true, order });
  } catch (error) {
    next(error);
  }
};
