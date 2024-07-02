const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/userModel');
const crypto = require('crypto');

// Load environment variables from .env file
dotenv.config({ path: require('path').resolve(__dirname, '../.env') });

// Verify environment variables are loaded
console.log('MongoDB URI:', process.env.MONGO_URI);

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('MongoDB connected');
  createUsers();
}).catch(err => console.error(err));

const createUsers = async () => {
  try {
    const users = [
      { email: 'user1@example.com', password: crypto.createHash('sha256').update('password1').digest('hex').substr(0, 32) },
      { email: 'user2@example.com', password: crypto.createHash('sha256').update('password2').digest('hex').substr(0, 32) },
      { email: 'user3@example.com', password: crypto.createHash('sha256').update('password3').digest('hex').substr(0, 32) },
    ];

    await User.insertMany(users);
    console.log('Users created');
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};
