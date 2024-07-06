const mongoose = require("mongoose");

const contactPersonSchema = new mongoose.Schema({
  first_name: {
    type: String,
    required: true,
    maxlength: 50,
  },
  last_name: {
    type: String,
    required: true,
    maxlength: 50,
  },
  email: {
    type: String,
    required: true,
    maxlength: 50,
    match: [/^\S+@\S+\.\S+$/, "Please use a valid email address."],
  },
  mobile_phone: {
    type: String,
    maxlength: 20,
    match: [/^\+?[0-9\s-]+$/, "Please use a valid phone number."],
  },
  birth_date: {
    type: String,
    match: [
      /^\d{4}-\d{2}-\d{2}$/,
      "Please use a valid date format YYYY-MM-DD.",
    ],
  },
  address: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Address",
    required: true,
  },
});

module.exports = mongoose.model("ContactPerson", contactPersonSchema);
