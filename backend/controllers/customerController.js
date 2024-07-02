const Customer = require('../models/customerModel');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');

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

exports.updateCustomer = async (req, res) => {
  try {
    const updatedCustomer = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedCustomer);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteCustomer = async (req, res) => {
  try {
    await Customer.findByIdAndDelete(req.params.id);
    res.json({ message: 'Customer deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.uploadCustomers = (req, res) => {
  const results = [];
  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', async () => {
      try {
        const customers = await Customer.insertMany(results);
        res.status(201).json(customers);
      } catch (error) {
        res.status(500).json({ message: 'Server error' });
      } finally {
        fs.unlinkSync(req.file.path);
      }
    });
};