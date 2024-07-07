const csv = require("csv-parser");
const fs = require("fs");
const Customer = require("../models/customerModel");
const { validateContactPerson, validateAddress } = require('../utils/validation');

// Get all customers
const getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find();
    res.status(200).json(customers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single customer by Intnr
const getCustomerByIntnr = async (req, res) => {
  try {
    const customer = await Customer.findOne({ intnr: req.params.intnr }).populate('contact_persons.address');
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    res.status(200).json(customer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new customer
const createCustomer = async (req, res) => {
  try {
    const { contact_persons, addresses, ...customerData } = req.body;

    if (!contact_persons || contact_persons.length === 0 || !addresses || addresses.length === 0) {
      return res.status(400).json({ message: "Customer must have at least one contact person and one address" });
    }

    for (let contactPerson of contact_persons) {
      const errors = validateContactPerson(contactPerson);
      if (errors.length > 0) {
        return res.status(400).json({ message: "Invalid contact person data", errors });
      }
    }

    for (let address of addresses) {
      const errors = validateAddress(address);
      if (errors.length > 0) {
        return res.status(400).json({ message: "Invalid address data", errors });
      }
    }

    const customer = new Customer({
      ...customerData,
      contact_persons: contact_persons.map(cp => ({ ...cp, address: addresses[0]._id })),
      addresses
    });

    const newCustomer = await customer.save();
    res.status(201).json(newCustomer);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Update a customer by Intnr
const updateCustomer = async (req, res) => {
  try {
    const updatedCustomer = await Customer.findOneAndUpdate(
      { intnr: req.params.intnr },
      req.body,
      { new: true }
    ).populate("contact_persons.address");
    if (!updatedCustomer) {
      return res.status(404).json({ message: "Customer not found!" });
    }
    res.status(200).json(updatedCustomer);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Delete a customer by Intnr
const deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findOne({ intnr: req.params.intnr });

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    await Customer.deleteOne({ intnr: req.params.intnr });

    res.status(200).json({ message: 'Customer deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting customer', error: err.message });
  }
};

const uploadCustomers = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const customers = [];
  const errors = [];
  const parser = fs
    .createReadStream(req.file.path)
    .pipe(csv())
    .on("data", (row) => {
      const customer = {
        intnr: row["A"],
        type: row["B"],
        contact_persons: [
          {
            first_name: row["C"],
            last_name: row["D"],
            email: row["E"],
            mobile_phone: row["F"],
            birth_date: row["G"],
            address: null, // This will be set after creating the address
          },
        ],
        addresses: [
          {
            company_name: row["H"],
            country: row["I"],
            city: row["J"],
            zip: row["K"],
            fax: row["L"],
            phone: row["M"],
            street: row["N"],
            email: row["O"],
          },
        ],
      };

      const contactPersonErrors = validateContactPerson(customer.contact_persons[0]);
      const addressErrors = validateAddress(customer.addresses[0]);

      if (contactPersonErrors.length > 0 || addressErrors.length > 0) {
        errors.push({
          customer,
          errors: [...contactPersonErrors, ...addressErrors],
        });
      } else {
        customers.push(customer);
      }
    })
    .on("end", async () => {
      try {
        if (errors.length > 0) {
          return res.status(400).json({
            message: "Validation errors occurred!",
            errors,
          });
        }

        for (const customer of customers) {
          const existingCustomer = await Customer.findOne({
            intnr: customer.intnr,
          });
          if (existingCustomer) {
            errors.push(
              `Customer with intnr ${customer.intnr} already exists.`
            );
            continue;
          }

          const createdCustomer = await Customer.create(customer);
          createdCustomer.contact_persons[0].address = createdCustomer.addresses[0]._id;
          await createdCustomer.save();
        }

        if (errors.length) {
          return res
            .status(400)
            .json({ message: "Some customers were not created", errors });
        }

        res.status(201).json({ message: "Customers uploaded successfully" });
      } catch (err) {
        res
          .status(500)
          .json({ message: "Error uploading customers", error: err.message });
      }
    });
};

const uploadContactPersons = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const contactPersons = [];
  const errors = [];
  const parser = fs
    .createReadStream(req.file.path)
    .pipe(csv())
    .on("data", (row) => {
      const contactPerson = {
        first_name: row["C"],
        last_name: row["D"],
        email: row["E"],
        mobile_phone: row["F"],
        birth_date: row["G"],
      };

      // Validate contact person
      const validationErrors = validateContactPerson(contactPerson);
      if (validationErrors.length > 0) {
        errors.push({
          contactPerson,
          errors: validationErrors,
        });
      } else {
        contactPersons.push({
          intnr: row["A"],
          type: row["B"],
          contact_persons: [contactPerson],
        });
      }
    })
    .on("end", async () => {
      try {
        if (errors.length > 0) {
          return res.status(400).json({
            message: "Validation errors occurred!",
            errors,
          });
        }

        for (const contactPerson of contactPersons) {
          const existingCustomer = await Customer.findOne({
            intnr: contactPerson.intnr,
          });
          if (existingCustomer) {
            // Update existing customer with new contact person
            existingCustomer.contact_persons.push(
              contactPerson.contact_persons[0]
            );
            await existingCustomer.save();
          } else {
            // Create new customer with contact person
            await Customer.create(contactPerson);
          }
        }

        res
          .status(201)
          .json({ message: "Contact persons uploaded successfully!" });
      } catch (err) {
        res.status(500).json({
          message: "Error uploading contact persons!",
          error: err.message,
        });
      }
    });
};

const uploadAddresses = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded!" });
  }

  const addresses = [];
  const errors = [];
  const parser = fs
    .createReadStream(req.file.path)
    .pipe(csv())
    .on("data", (row) => {
      const address = {
        company_name: row["H"],
        country: row["I"],
        city: row["J"],
        zip: row["K"],
        fax: row["L"],
        phone: row["M"],
        street: row["N"],
        email: row["O"],
      };

      // Validate address
      const validationErrors = validateAddress(address);
      if (validationErrors.length > 0) {
        errors.push({
          address,
          errors: validationErrors,
        });
      } else {
        addresses.push({
          intnr: row["A"],
          type: row["B"],
          addresses: [address],
        });
      }
    })
    .on("end", async () => {
      try {
        if (errors.length > 0) {
          return res.status(400).json({
            message: "Validation errors occurred!",
            errors,
          });
        }

        for (const address of addresses) {
          const existingCustomer = await Customer.findOne({
            intnr: address.intnr,
          });
          if (existingCustomer) {
            // Update existing customer with new address
            existingCustomer.addresses.push(address.addresses[0]);
            await existingCustomer.save();
          } else {
            // Create new customer with address
            await Customer.create(address);
          }
        }

        res.status(201).json({ message: "Addresses uploaded successfully!" });
      } catch (err) {
        res
          .status(500)
          .json({ message: "Error uploading addresses!", error: err.message });
      }
    });
};

module.exports = {
  getCustomers,
  getCustomerByIntnr,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  uploadCustomers,
  uploadContactPersons,
  uploadAddresses,
};
