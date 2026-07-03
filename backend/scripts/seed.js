import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product.js';
import User from '../models/User.js';

dotenv.config();

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/wellmora');
    console.log('Connected to Database for Seeding...');
    
    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products...');

    // Clear existing users
    await User.deleteMany({});
    console.log('Cleared existing users...');

    // Create an Admin user
    const admin = await User.create({
      name: 'Wellmora Admin',
      email: 'admin@wellmora.com',
      password: 'admin123',
      role: 'admin',
      shippingAddress: {
        street: '123 Business Hub',
        city: 'Mumbai',
        state: 'Maharashtra',
        zipCode: '400001',
        country: 'India'
      }
    });
    console.log('Created Admin user: admin@wellmora.com / admin123');

    // Create a Customer user
    const customer = await User.create({
      name: 'John Doe',
      email: 'customer@wellmora.com',
      password: 'customer123',
      role: 'customer',
      shippingAddress: {
        street: '456 Residency St',
        city: 'Bangalore',
        state: 'Karnataka',
        zipCode: '560001',
        country: 'India'
      }
    });
    console.log('Created Customer user: customer@wellmora.com / customer123');

    const products = [
      {
        title: "Wellmora Pro-Blend 1000W Mixer Grinder",
        description: "Premium heavy-duty mixer grinder with 3 stainless steel jars, double safety lock, and high-performance copper motor for effortless grinding. Features a stunning sleek metallic glassmorphic control knob.",
        category: "Kitchen Appliances",
        price: 4999,
        discountPrice: 3499,
        stock: 25,
        images: [
          "https://images.unsplash.com/photo-1578643463396-0997cb5328c1?auto=format&fit=crop&q=80&w=600"
        ],
        averageRating: 4.6,
        numReviews: 2,
        sourceMarketplaceLinks: {
          amazon: "https://www.amazon.in/dp/B08XYZ123",
          flipkart: "https://www.flipkart.com/product/wellmora-mixer"
        },
        reviews: [
          {
            user: customer._id,
            name: "Rohan Sharma",
            rating: 5,
            comment: "Excellent performance, grinds spices very fast and smooth! Design looks highly premium."
          },
          {
            user: customer._id,
            name: "Pooja Patel",
            rating: 4,
            comment: "Great quality, a bit noisy but does the job perfectly."
          }
        ]
      },
      {
        title: "Wellmora Crispy-Fry 4L Digital Air Fryer",
        description: "Cook with up to 90% less oil. Featuring an intuitive glassmorphic touch control panel, 8 preset cooking menus, rapid 360 air circulation, and a non-stick easy-clean basket.",
        category: "Kitchen Appliances",
        price: 7999,
        discountPrice: 5499,
        stock: 15,
        images: [
          "https://images.unsplash.com/photo-1621972750749-0fbb1abb7736?auto=format&fit=crop&q=80&w=600"
        ],
        averageRating: 4.8,
        numReviews: 1,
        sourceMarketplaceLinks: {
          amazon: "https://www.amazon.in/dp/B08XYZ456",
          flipkart: "https://www.flipkart.com/product/wellmora-airfryer"
        },
        reviews: [
          {
            user: customer._id,
            name: "Amit Verma",
            rating: 5,
            comment: "Fries are so crispy and healthy. Using it daily now. Truly worth the money!"
          }
        ]
      },
      {
        title: "Wellmora AeroVac Handheld Cordless Vacuum Cleaner",
        description: "Super lightweight cordless hand vacuum with 12000Pa powerful suction, washable HEPA filter, and up to 30 mins runtime. Perfect for car detailing and home furniture cleaning.",
        category: "Home Appliances",
        price: 3499,
        discountPrice: 2499,
        stock: 30,
        images: [
          "https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&q=80&w=600"
        ],
        averageRating: 4.4,
        numReviews: 1,
        sourceMarketplaceLinks: {
          amazon: "https://www.amazon.in/dp/B08XYZ789",
          flipkart: "https://www.flipkart.com/product/wellmora-aerovac"
        },
        reviews: [
          {
            user: customer._id,
            name: "Sneha Reddy",
            rating: 4,
            comment: "Very handy and light. Suction is good for cleanups."
          }
        ]
      },
      {
        title: "Wellmora ThermoGuard 1.7L Smart Electric Kettle",
        description: "Double-wall insulated stainless steel kettle with dry-boil protection and auto-shutoff. Glass touch-screen base allows precise temperature selection for green tea, coffee, and baby milk.",
        category: "Kitchen Appliances",
        price: 2499,
        discountPrice: 1799,
        stock: 40,
        images: [
          "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&q=80&w=600"
        ],
        averageRating: 4.5,
        numReviews: 1,
        sourceMarketplaceLinks: {
          amazon: "https://www.amazon.in/dp/B08XYZ101",
          flipkart: "https://www.flipkart.com/product/wellmora-kettle"
        },
        reviews: [
          {
            user: customer._id,
            name: "Vikram Malhotra",
            rating: 5,
            comment: "Maintains temperature perfectly. The double-wall insulation prevents accidental burns."
          }
        ]
      },
      {
        title: "Wellmora HydroClean Sonic Electric Mop",
        description: "Self-propelling cordless sonic electric mop. High frequency vibrations scrub away tough stains, while dual water tanks keep clean and dirty water completely separate.",
        category: "Home Appliances",
        price: 12999,
        discountPrice: 8999,
        stock: 10,
        images: [
          "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&q=80&w=600"
        ],
        averageRating: 4.7,
        numReviews: 2,
        sourceMarketplaceLinks: {
          amazon: "https://www.amazon.in/dp/B08XYZ202",
          flipkart: "https://www.flipkart.com/product/wellmora-mop"
        },
        reviews: [
          {
            user: customer._id,
            name: "Meera Sen",
            rating: 5,
            comment: "Excellent cleaning quality. Highly recommended for big homes!"
          },
          {
            user: customer._id,
            name: "Abhishek Das",
            rating: 4.4,
            comment: "Battery runs for about 35 minutes, enough for my apartment. Cleans very well."
          }
        ]
      }
    ];

    // Seed products
    const seededProducts = await Product.insertMany(products);
    console.log(`Seeded ${seededProducts.length} products successfully!`);

    mongoose.disconnect();
    console.log('Database Disconnected. Seeding completed.');
  } catch (error) {
    console.error('Seeding Error:', error);
    process.exit(1);
  }
};

seedDB();
