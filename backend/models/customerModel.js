const mongoose = require('mongoose');
const contactPersonSchema = require('./contactPersonModel').schema;
const addressSchema = require('./addressModel').schema;

const customerSchema = new mongoose.Schema({
  intnr: {
    type: Number,
    required: true,
    unique: true,
  },
  type: {
    type: String,
    required: true,
  },
  contact_persons: [contactPersonSchema],
  addresses: [addressSchema],
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Customer', customerSchema);
