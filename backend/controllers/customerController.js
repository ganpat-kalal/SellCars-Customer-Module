const Customer = require('../models/customerModel');

exports.getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.find();
    res.json(customers);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createCustomer = async (req, res) => {
  const newCustomer = new Customer(req.body);
  try {
    const customer = await newCustomer.save();
    res.status(201).json(customer);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Implement other CRUD operations as needed
