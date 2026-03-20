import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Product from './models/Product.js';

dotenv.config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ecommerce-store');

const seedData = async () => {
  try {
    await User.deleteMany();
    await Product.deleteMany();

    console.log('Data cleared.');

    // Provision an Admin Account
    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(10);
    const hashedAdminPassword = await bcrypt.hash('123456', salt);

    const adminUser = await User.create({
      name: 'Super Admin',
      email: 'support@novahardware.com',
      password: hashedAdminPassword,
      isAdmin: true,
      isVerified: true
    });
    console.log('✅ Admin user provisioned (support@novahardware.com / 123456)');

    const products = [
      {
        name: 'M4 MacBook Pro 16"',
        image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8',
        description: 'Apple M4 Max chip with 16-core CPU and 40-core GPU',
        category: 'Electronics',
        price: 3499.99,
        countInStock: 5,
      },
      {
        name: 'NVIDIA RTX 5090 GPU',
        image: 'https://images.unsplash.com/photo-1591488320449-011701bb6704',
        description: 'Next-gen graphics card for extreme 8K gaming and AI compute.',
        category: 'Hardware',
        price: 1999.99,
        countInStock: 2,
      },
      {
        name: 'Keychron Q1 Pro Mechanical Keyboard',
        image: 'https://images.unsplash.com/photo-1595225476474-87563907a212',
        description: 'Wireless custom mechanical keyboard with QMK/VIA support.',
        category: 'Accessories',
        price: 199.99,
        countInStock: 15,
      }
    ];

    await Product.insertMany(products);
    console.log('✨ Dummy Products Imported Successfully!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error}`);
    process.exit(1);
  }
};

seedData();
