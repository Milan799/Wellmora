import Product from '../models/Product.js';
import mongoose from 'mongoose';


// @desc    Get all products (with query filter/sort)
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res, next) => {
  try {
    const { category, search, minPrice, maxPrice, sort, rating } = req.query;

    const query = {};

    // Filters
    if (category) {
      query.category = category;
    }

    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (rating) {
      query.averageRating = { $gte: Number(rating) };
    }

    let queryBuilder = Product.find(query);

    // Sorting
    if (sort) {
      const sortBy = sort.split(',').join(' ');
      queryBuilder = queryBuilder.sort(sortBy);
    } else {
      queryBuilder = queryBuilder.sort('-createdAt');
    }

    const products = await queryBuilder;

    res.status(200).json({
      success: true,
      count: products.length,
      products
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    res.status(200).json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

// @desc    Create product (Admin only)
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = async (req, res, next) => {
  try {
    const product = await Product.create(req.body);

    // Socket.io real-time update
    if (req.io) {
      req.io.emit('product_created', product);
    }

    res.status(201).json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

// @desc    Update product (Admin only)
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = async (req, res, next) => {
  try {
    let product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    const oldPrice = product.price;
    const oldStock = product.stock;

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    // Check if price or stock changed to emit real-time event
    if (product.price !== oldPrice || product.stock !== oldStock) {
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

    res.status(200).json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete product (Admin only)
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    await product.deleteOne();

    if (req.io) {
      req.io.emit('product_deleted', req.params.id);
    }

    res.status(200).json({ success: true, message: 'Product deleted' });
  } catch (error) {
    next(error);
  }
};


export const createProductReview = async (req, res, next) => {
  const { rating, comment } = req.body;

  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    const userId = req.user ? req.user.id : new mongoose.Types.ObjectId();
    const userName = req.user ? req.user.name : 'Guest Customer';

    const review = {
      user: userId,
      name: userName,
      rating: Number(rating) || 5,
      comment
    };

    product.reviews.push(review);
    await product.save();

    if (req.io) {
      req.io.emit('product_review_added', {
        productId: product._id,
        averageRating: product.averageRating,
        numReviews: product.numReviews,
        review
      });
    }

    res.status(201).json({ success: true, message: 'Review added' });
  } catch (error) {
    next(error);
  }
};
