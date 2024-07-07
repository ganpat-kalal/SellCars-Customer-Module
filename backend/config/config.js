require('dotenv').config();

module.exports = {
    MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/your_db',
    JWT_SECRET: process.env.JWT_SECRET,
    PORT: process.env.PORT || 5000,
    NODE_ENV: process.env.NODE_ENV || 'development',
};
