const mongoose = require("mongoose");
const contactPersonSchema = require("./contactPersonModel").schema;
const addressSchema = require("./addressModel").schema;

const customerSchema = new mongoose.Schema({
  intnr: {
    type: String,
    required: true,
    unique: true,
    maxlength: 10,
  },
  type: {
    type: String,
    enum: ["PRIVATE", "COMPANY", "DEALER"],
    required: true,
  },
  contact_persons: {
    type: [contactPersonSchema],
    default: [],
  },
  addresses: {
    type: [addressSchema],
    default: [],
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
});

// Middleware to update the updated_at field on save
customerSchema.pre("save", function (next) {
  this.updated_at = Date.now();
  next();
});

module.exports = mongoose.model("Customer", customerSchema);
