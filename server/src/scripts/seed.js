require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const config = require('../config/env');

const seedUsers = async () => {
  try {
    await mongoose.connect(config.MONGODB_URI);
    console.log('[Seed] Connected to MongoDB');

    // Remove existing demo users
    await User.deleteMany({ email: { $in: ['student@campusiq.edu', 'admin@campusiq.edu'] } });

    // Create Admin User
    const admin = await User.create({
      name: 'Dr. Sarah Mitchell (Dean)',
      email: 'admin@campusiq.edu',
      password: 'adminpassword123',
      role: 'admin',
      department: 'Administration',
    });
    console.log(`[Seed] Created Admin User: ${admin.email} (password: adminpassword123)`);

    // Create Student User
    const student = await User.create({
      name: 'Alex Johnson',
      email: 'student@campusiq.edu',
      password: 'studentpassword123',
      role: 'student',
      department: 'Computer Science',
    });
    console.log(`[Seed] Created Student User: ${student.email} (password: studentpassword123)`);

    console.log('[Seed] Seeding completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('[Seed] Error seeding data:', error.message);
    process.exit(1);
  }
};

seedUsers();
