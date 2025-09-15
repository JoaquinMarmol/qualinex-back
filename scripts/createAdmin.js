import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../src/models/index.js';

// Load environment variables
dotenv.config();

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@warranty.com' });
    
    if (existingAdmin) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    // Create admin user
    const adminUser = new User({
      email: 'admin@warranty.com',
      password: 'Admin123!',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      emailVerified: true,
      isActive: true
    });

    await adminUser.save();
    console.log('Admin user created successfully');
    console.log('Email: admin@warranty.com');
    console.log('Password: Admin123!');
    console.log('Please change the password after first login');

  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

createAdmin();

