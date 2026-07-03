import Cart from '../models/Cart.js';
import Product from '../models/Product.js';

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
export const getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
    
    // Create cart if it doesn't exist
    if (!cart) {
      cart = await Cart.create({
        user: req.user.id,
        items: [],
        subtotal: 0
      });
    }

    res.status(200).json({ success: true, cart });
  } catch (error) {
    next(error);
  }
};

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
export const addToCart = async (req, res, next) => {
  const { productId, quantity } = req.body;
  const qty = Number(quantity) || 1;

  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    // Check stock
    if (product.stock < qty) {
      return res.status(400).json({ success: false, error: 'Not enough stock available' });
    }

    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      cart = new Cart({ user: req.user.id, items: [] });
    }

    const price = product.discountPrice || product.price;

    // Check if product is already in cart
    const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);

    if (itemIndex > -1) {
      // Update quantity
      const newQty = cart.items[itemIndex].quantity + qty;
      if (product.stock < newQty) {
        return res.status(400).json({ success: false, error: 'Cannot add more, exceeds available stock' });
      }
      cart.items[itemIndex].quantity = newQty;
      cart.items[itemIndex].price = price; // update with latest price
    } else {
      // Add new item
      cart.items.push({ product: productId, quantity: qty, price });
    }

    await cart.save();
    
    // Populate product and return
    const updatedCart = await Cart.findOne({ user: req.user.id }).populate('items.product');

    res.status(200).json({ success: true, cart: updatedCart });
  } catch (error) {
    next(error);
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart
// @access  Private
export const updateCartItem = async (req, res, next) => {
  const { productId, quantity } = req.body;
  const qty = Number(quantity);

  if (qty < 1) {
    return res.status(400).json({ success: false, error: 'Quantity must be at least 1' });
  }

  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    if (product.stock < qty) {
      return res.status(400).json({ success: false, error: 'Requested quantity exceeds available stock' });
    }

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ success: false, error: 'Cart not found' });
    }

    const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
    if (itemIndex === -1) {
      return res.status(404).json({ success: false, error: 'Product not found in cart' });
    }

    cart.items[itemIndex].quantity = qty;
    cart.items[itemIndex].price = product.discountPrice || product.price; // update to latest price

    await cart.save();
    const updatedCart = await Cart.findOne({ user: req.user.id }).populate('items.product');

    res.status(200).json({ success: true, cart: updatedCart });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:productId
// @access  Private
export const removeFromCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ success: false, error: 'Cart not found' });
    }

    cart.items = cart.items.filter(item => item.product.toString() !== req.params.productId);
    await cart.save();

    const updatedCart = await Cart.findOne({ user: req.user.id }).populate('items.product');
    res.status(200).json({ success: true, cart: updatedCart });
  } catch (error) {
    next(error);
  }
};

// @desc    Clear user cart
// @route   DELETE /api/cart
// @access  Private
export const clearCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (cart) {
      cart.items = [];
      cart.subtotal = 0;
      await cart.save();
    }
    res.status(200).json({ success: true, message: 'Cart cleared', cart });
  } catch (error) {
    next(error);
  }
};
