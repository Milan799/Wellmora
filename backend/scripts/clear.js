import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product.js';

dotenv.config();

const clearDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/wellmora');
    console.log('Connected to Database for Clearing...');
    
    // Clear existing products
    const result = await Product.deleteMany({});
    console.log(`Successfully cleared ${result.deletedCount} products from database.`);

    mongoose.disconnect();
    console.log('Database Disconnected.');
  } catch (error) {
    console.error('Clearing Error:', error);
    process.exit(1);
  }
};

clearDB();
