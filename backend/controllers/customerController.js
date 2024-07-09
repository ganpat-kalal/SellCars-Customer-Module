const csv = require("csv-parser");
const fs = require("fs");
const Customer = require("../models/customerModel");
const CustomerTypes = require("../enums/customerTypes");
const { validateContactPerson, validateAddress, validateFileType } = require('../utils/validation');

// Get all customers
const getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find();
    res.status(200).json(customers);
  } catch (error) {
    res.status(500).json(errorResponse(error.message));
  }
};

// Get a single customer by Intnr
const getCustomerByIntnr = async (req, res) => {
  try {
    const customer = await Customer.findOne({ intnr: req.params.intnr }).populate('contact_persons.address');
    if (!customer) {
      return res.status(404).json(errorResponse('Customer not found!'));
    }
    res.status(200).json(customer);
  } catch (error) {
    res.status(500).json(errorResponse(error.message));
  }
};

// Create a new customer
const createCustomer = async (req, res) => {
  try {
    const { contact_persons, addresses, ...customerData } = req.body;

    if (!contact_persons || !addresses || contact_persons.length === 0 || addresses.length === 0) {
      return res.status(400).json(errorResponse("Customer must have at least one contact person and one address!"));
    }

    if (!Object.values(CustomerTypes).includes(customerData.type)) {
      return res.status(400).json(errorResponse("Invalid customer type!"));
    }

    for (let contactPerson of contact_persons) {
      const errors = validateContactPerson(contactPerson);
      if (errors.length > 0) {
        return res.status(400).json(errorResponse("Invalid contact person data!", errors));
      }
    }

    for (let address of addresses) {
      const errors = validateAddress(address);
      if (errors.length > 0) {
        return res.status(400).json(errorResponse("Invalid address data!", errors));
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
    res.status(400).json(errorResponse(err.message));
  }
};

// Update a customer by Intnr
const updateCustomer = async (req, res) => {
  try {
    const { type, contact_persons, addresses } = req.body;

    if (!type || !contact_persons || !addresses) {
      return res.status(400).json(errorResponse("Type, contact persons, and addresses are required!"));
    }

    // Validate type
    if (!Object.values(CustomerTypes).includes(type)) {
      return res.status(400).json(errorResponse("Invalid customer type!"));
    }

    // Validate contact persons
    if (contact_persons.length === 0) {
      return res.status(400).json(errorResponse("Customer must have at least one contact person!"));
    }
    const contactPerson = contact_persons[0];
    const contactPersonErrors = validateContactPerson(contactPerson);
    if (contactPersonErrors.length > 0) {
      return res.status(400).json(errorResponse("Invalid contact person data!", contactPersonErrors));
    }

    // Validate addresses
    if (addresses.length === 0) {
      return res.status(400).json(errorResponse("Customer must have at least one address!"));
    }
    const address = addresses[0];
    const addressErrors = validateAddress(address);
    if (addressErrors.length > 0) {
      return res.status(400).json(errorResponse("Invalid address data!", addressErrors));
    }

    // Ensure company_name and address email are only set if type is COMPANY or DEALER
    if ([CustomerTypes.COMPANY, CustomerTypes.DEALER].includes(type)) {
      if (!address.company_name || !address.email) {
        return res.status(400).json(errorResponse("Company name and email are required for COMPANY or DEALER types!"));
      }
    } else {
      address.company_name = undefined;
      address.email = undefined;
    }

    const updatedCustomer = await Customer.findOneAndUpdate(
      { intnr: req.params.intnr },
      {
        type,
        'contact_persons.0.first_name': contactPerson.first_name,
        'contact_persons.0.last_name': contactPerson.last_name,
        'contact_persons.0.email': contactPerson.email,
        'contact_persons.0.mobile_phone': contactPerson.mobile_phone,
        'addresses.0.company_name': type == CustomerTypes.PRIVATE ? null : address.company_name,
        'addresses.0.country': address.country,
        'addresses.0.zip': address.zip,
        'addresses.0.city': address.city,
        'addresses.0.street': address.street,
        'addresses.0.fax': type == CustomerTypes.PRIVATE ? null : address.fax,
        'addresses.0.phone': type == CustomerTypes.PRIVATE ? null : address.phone,
        'addresses.0.email': type == CustomerTypes.PRIVATE ? null : address.email,
        updated_at: Date.now(),
      },
      { new: true, runValidators: true }
    ).populate("contact_persons.address");

    if (!updatedCustomer) {
      return res.status(404).json(errorResponse("Customer not found!"));
    }

    res.status(200).json(updatedCustomer);
  } catch (err) {
    res.status(400).json(errorResponse(err.message));
  }
};

// Delete a customer by Intnr
const deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findOne({ intnr: req.params.intnr });

    if (!customer) {
      return res.status(404).json(errorResponse('Customer not found'));
    }

    await Customer.deleteOne({ intnr: req.params.intnr });

    res.status(200).json({ message: 'Customer deleted successfully' });
  } catch (err) {
    res.status(500).json(errorResponse('Error deleting customer', [err.message]));
  }
};

const uploadCustomers = async (req, res) => {
  if (!req.file) {
    return res.status(400).json(errorResponse("No file uploaded!"));
  }

  const customers = [];
  const errors = [];

  parseCSVFile(req.file.path, 'customer', (row, err) => {
    if (err) {
      return res.status(400).json(errorResponse(err.message));
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
          company_name: (row["B"] === CustomerTypes.COMPANY || row["B"] === CustomerTypes.DEALER) ? row["H"] : undefined,
          country: row["I"],
          city: row["J"],
          zip: row["K"],
          fax: (row["B"] === CustomerTypes.COMPANY || row["B"] === CustomerTypes.DEALER) ? row["L"] : undefined,
          phone: (row["B"] === CustomerTypes.COMPANY || row["B"] === CustomerTypes.DEALER) ? row["M"] : undefined,
          street: row["N"],
          email: (row["B"] === CustomerTypes.COMPANY || row["B"] === CustomerTypes.DEALER) ? row["O"] : undefined,
        },
      ],
    };

    const contactPersonErrors = validateContactPerson(customer.contact_persons[0]);
    const addressErrors = validateAddress(customer.addresses[0]);

    if (contactPersonErrors.length > 0 || addressErrors.length > 0) {
      errors.push({
        data: customer,
        errors: [...contactPersonErrors, ...addressErrors],
      });
    } else {
      customers.push(customer);
    }
  }, async (err) => {
    if (err) {
      return res.status(500).json(errorResponse("Error uploading customers!", [err.message]));
    }

    if (errors.length > 0) {
      return res.status(400).json(errorResponse("Validation", errors));
    }

    for (const customer of customers) {
      const existingCustomer = await Customer.findOne({ intnr: customer.intnr });
      if (existingCustomer) {
        return res.status(400).json(errorResponse(`Customer with intnr ${customer.intnr} already exists.`));
      }

      const createdCustomer = await Customer.create(customer);
      createdCustomer.contact_persons[0].address = createdCustomer.addresses[0]._id;
      await createdCustomer.save();
    }

    res.status(201).json({ message: "Customers uploaded successfully" });
  });
};

const uploadContactPersons = async (req, res) => {
  if (!req.file) {
    return res.status(400).json(errorResponse("No file uploaded!"));
  }

  const contactPersons = [];
  const errors = [];

  parseCSVFile(req.file.path, 'contactPerson', (row, err) => {
    if (err) {
      return res.status(400).json(errorResponse(err.message));
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
      contactPerson.intnr = row["A"];
      errors.push({
        data: contactPerson,
        errors: validationErrors,
      });
    } else {
      contactPersons.push({
        intnr: row["A"],
        contactPerson,
      });
    }
  }, async (err) => {
    if (err) {
      return res.status(500).json(errorResponse("Error uploading contact persons!", [err.message]));
    }

    if (errors.length > 0) {
      return res.status(400).json(errorResponse("Validation", errors));
    }

    for (const contactPersonEntry of contactPersons) {
      const existingCustomer = await Customer.findOne({ intnr: contactPersonEntry.intnr });
      if (existingCustomer) {
        // Update existing customer with new contact person
        existingCustomer.contact_persons.push(contactPersonEntry.contactPerson);
        await existingCustomer.save();
      } else {
        return res.status(400).json(errorResponse(`Customer with intnr ${contactPersonEntry.intnr} does not exist.`));
      }
    }

    res.status(201).json({ message: "Contact persons uploaded successfully!" });
  });
};

const uploadAddresses = async (req, res) => {
  if (!req.file) {
    return res.status(400).json(errorResponse("No file uploaded!"));
  }

  const addresses = [];
  const errors = [];

  parseCSVFile(req.file.path, 'address', (row, err) => {
    if (err) {
      return res.status(400).json(errorResponse(err.message));
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
      address.intnr = row["A"];
      errors.push({
        data: address,
        errors: validationErrors,
      });
    } else {
      addresses.push({
        intnr: row["A"],
        address,
      });
    }
  }, async (err) => {
    if (err) {
      return res.status(500).json(errorResponse("Error uploading addresses!", [err.message]));
    }

    if (errors.length > 0) {
      return res.status(400).json(errorResponse("Validation", errors));
    }

    for (const addressEntry of addresses) {
      const existingCustomer = await Customer.findOne({ intnr: addressEntry.intnr });
      if (existingCustomer) {
        const address = addressEntry.address;
        // Remove unnecessary fields if the customer type is not COMPANY or DEALER
        if (![CustomerTypes.COMPANY, CustomerTypes.DEALER].includes(existingCustomer.type)) {
          address.company_name = undefined;
          address.fax = undefined;
          address.phone = undefined;
          address.email = undefined;
        }

        // Update existing customer with new address
        existingCustomer.addresses.push(address);
        await existingCustomer.save();
      } else {
        return res.status(400).json(errorResponse(`Customer with intnr ${addressEntry.intnr} does not exist.`));
      }
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

  parser.on("end", () => endHandler());

  parser.on("error", (err) => endHandler(err));
};

// Helper function for standardized error responses
const errorResponse = (message, errors = []) => ({
  message,
  errors
});

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
