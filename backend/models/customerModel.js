const mongoose = require("mongoose");
const contactPersonSchema = require("./contactPersonModel").schema;
const addressSchema = require("./addressModel").schema;
const CustomerTypes = require('../enums/customerTypes');

const customerSchema = new mongoose.Schema({
  intnr: {
    type: String,
    required: true,
    unique: true,
    maxlength: 10,
  },
  type: {
    type: String,
    enum: Object.values(CustomerTypes),
    required: true,
  },
  contact_persons: {
    type: [contactPersonSchema],
    validate: [arrayMinLength, "At least one contact person is required"],
  },
  addresses: {
    type: [addressSchema],
    validate: [arrayMinLength, "At least one address is required"],
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

function arrayMinLength(val) {
  return val.length > 0;
}

customerSchema.pre("save", function (next) {
  if (this.isNew && (!this.contact_persons.length || !this.addresses.length)) {
    next(
      new Error(
        "Customer must have at least one contact person and one address"
      )
    );
  } else {
    this.updated_at = Date.now();
    next();
  }
});

module.exports = mongoose.model("Customer", customerSchema);
