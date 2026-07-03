import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Product title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Product description is required']
  },
  category: {
    type: String,
    required: [true, 'Product category is required'],
    enum: ['Home Appliances', 'Kitchen Appliances', 'Cookware', 'Tableware', 'Other']
  },
  price: {
    type: Number,
    required: [true, 'Product base price is required'],
    min: [0, 'Price must be positive']
  },
  discountPrice: {
    type: Number,
    min: [0, 'Discount price must be positive'],
    validate: {
      validator: function(val) {
        return !val || val < this.price;
      },
      message: 'Discount price must be less than regular price ({VALUE})'
    }
  },
  stock: {
    type: Number,
    required: [true, 'Stock quantity is required'],
    min: [0, 'Stock cannot be negative'],
    default: 10
  },
  images: {
    type: [String],
    default: []
  },
  reviews: [reviewSchema],
  averageRating: {
    type: Number,
    default: 0
  },
  numReviews: {
    type: Number,
    default: 0
  },
  sourceMarketplaceLinks: {
    amazon: { type: String, default: '' },
    flipkart: { type: String, default: '' }
  }
}, {
  timestamps: true
});

// Auto-calculate average rating and number of reviews when reviews change
productSchema.pre('save', function(next) {
  if (this.isModified('reviews')) {
    this.numReviews = this.reviews.length;
    if (this.numReviews > 0) {
      const sum = this.reviews.reduce((acc, item) => item.rating + acc, 0);
      this.averageRating = parseFloat((sum / this.numReviews).toFixed(1));
    } else {
      this.averageRating = 0;
    }
  }
  next();
});

const Product = mongoose.model('Product', productSchema);
export default Product;
