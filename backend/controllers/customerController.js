const csv = require("csv-parser");
const fs = require("fs");
const Customer = require("../models/customerModel");
const { validateContactPerson, validateAddress, validateFileType } = require('../utils/validation');

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
      return res.status(404).json({ message: 'Customer not found!' });
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

    if (!contact_persons || !addresses || contact_persons.length === 0 || addresses.length === 0) {
      return res.status(400).json({ message: "Customer must have at least one contact person and one address!" });
    }

    for (let contactPerson of contact_persons) {
      const errors = validateContactPerson(contactPerson);
      if (errors.length > 0) {
        return res.status(400).json({ message: "Invalid contact person data!", errors });
      }
    }

    for (let address of addresses) {
      const errors = validateAddress(address);
      if (errors.length > 0) {
        return res.status(400).json({ message: "Invalid address data!", errors });
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
    return res.status(400).json({ message: "No file uploaded!" });
  }

  const customers = [];
  const errors = [];

  parseCSVFile(req.file.path, 'customer', (row, err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }

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
  }, async (err) => {
    if (err) {
      return res.status(500).json({ message: "Error uploading customers!", error: err.message });
    }

    if (errors.length > 0) {
      return res.status(400).json({ message: "Validation errors occurred!", errors });
    }

    for (const customer of customers) {
      const existingCustomer = await Customer.findOne({ intnr: customer.intnr });
      if (existingCustomer) {
        errors.push(`Customer with intnr ${customer.intnr} already exists.`);
        continue;
      }

      const createdCustomer = await Customer.create(customer);
      createdCustomer.contact_persons[0].address = createdCustomer.addresses[0]._id;
      await createdCustomer.save();
    }

    if (errors.length) {
      return res.status(400).json({ message: "Some customers were not created", errors });
    }

    res.status(201).json({ message: "Customers uploaded successfully" });
  });
};

const uploadContactPersons = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded!" });
  }

  const contactPersons = [];
  const errors = [];

  parseCSVFile(req.file.path, 'contactPerson', (row, err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }

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
        contact_persons: [contactPerson],
      });
    }
  }, async (err) => {
    if (err) {
      return res.status(500).json({ message: "Error uploading contact persons!", error: err.message });
    }

    if (errors.length > 0) {
      return res.status(400).json({ message: "Validation errors occurred!", errors });
    }

    for (const contactPerson of contactPersons) {
      const existingCustomer = await Customer.findOne({ intnr: contactPerson.intnr });
      if (existingCustomer) {
        // Update existing customer with new contact person
        existingCustomer.contact_persons.push(contactPerson.contact_persons[0]);
        await existingCustomer.save();
      } else {
        errors.push(`Customer with intnr ${contactPerson.intnr} does not exist.`);
      }
    }

    if (errors.length) {
      return res.status(400).json({ message: "Some contact persons were not added", errors });
    }

    res.status(201).json({ message: "Contact persons uploaded successfully!" });
  });
};

const uploadAddresses = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded!" });
  }

  const addresses = [];
  const errors = [];

  parseCSVFile(req.file.path, 'address', (row, err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }

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
        addresses: [address],
      });
    }
  }, async (err) => {
    if (err) {
      return res.status(500).json({ message: "Error uploading addresses!", error: err.message });
    }

    if (errors.length > 0) {
      return res.status(400).json({ message: "Validation errors occurred!", errors });
    }

    for (const address of addresses) {
      const existingCustomer = await Customer.findOne({ intnr: address.intnr });
      if (existingCustomer) {
        // Update existing customer with new address
        existingCustomer.addresses.push(address.addresses[0]);
        await existingCustomer.save();
      } else {
        errors.push(`Customer with intnr ${address.intnr} does not exist.`);
      }
    }

    if (errors.length) {
      return res.status(400).json({ message: "Some addresses were not added", errors });
    }

    res.status(201).json({ message: "Addresses uploaded successfully!" });
  });
};

// Helper function to parse CSV file
const parseCSVFile = (filePath, fileType, rowHandler, endHandler) => {
  const parser = fs.createReadStream(filePath).pipe(csv());

  let detectedFileType = null;

  parser.on("data", (row) => {
    if (!detectedFileType) {
      try {
        detectedFileType = validateFileType(row);
        if (detectedFileType !== fileType) {
          throw new Error(`Uploaded file is not a valid ${fileType} file!`);
        }
      } catch (err) {
        parser.destroy();
        return rowHandler(null, err);
      }
    }
    rowHandler(row);
  });

  parser.on("end", endHandler);

  parser.on("error", (err) => endHandler(err));
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
