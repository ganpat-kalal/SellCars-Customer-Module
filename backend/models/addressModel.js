const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
  company_name: {
    type: String,
    maxlength: 50,
  },
  country: {
    type: String,
    maxlength: 50,
  },
  city: {
    type: String,
    maxlength: 50,
  },
  zip: {
    type: String,
    maxlength: 5,
  },
  fax: {
    type: String,
    maxlength: 20,
    match: [/^\+?[0-9\s-]+$/, "Please use a valid fax number."],
  },
  phone: {
    type: String,
    maxlength: 20,
    match: [/^\+?[0-9\s-]+$/, "Please use a valid phone number."],
  },
  street: {
    type: String,
    maxlength: 100,
  },
  email: {
    type: String,
    maxlength: 50,
    match: [/^\S+@\S+\.\S+$/, "Please use a valid email address."],
  },
});

module.exports = mongoose.model("Address", addressSchema);
