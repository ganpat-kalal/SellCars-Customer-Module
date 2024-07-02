const mongoose = require('mongoose');

const contactPersonSchema = new mongoose.Schema({
  first_name: {
    type: String,
    required: true,
  },
  last_name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  mobile_phone: {
    type: String,
    required: true,
  },
  birth_date: {
    type: Date,
    required: true,
  },
});

module.exports = mongoose.model('ContactPerson', contactPersonSchema);
