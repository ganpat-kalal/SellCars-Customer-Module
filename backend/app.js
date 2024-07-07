const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const config = require('./config/config');

const app = express();

app.use(cors());
app.use(express.json());

// Connect to database
connectDB();

// Routes
app.get('/', (req, res) => {
  res.send('API is running...');
});

app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/customers', require('./routes/customerRoutes'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Start server
const PORT = config.PORT;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
