const Customer = require("../models/customerModel");
const csv = require("csv-parser");
const fs = require("fs");

const getCustomers = async (req, res) => {
  const customers = await Customer.find();
  res.json(customers);
};

const createCustomer = async (req, res) => {
  const customer = new Customer(req.body);
  try {
    const newCustomer = await customer.save();
    res.status(201).json(newCustomer);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const updateCustomer = async (req, res) => {
  try {
    const updatedCustomer = await Customer.findOneAndUpdate(
      { intnr: req.params.intnr },
      req.body,
      { new: true }
    );
    res.json(updatedCustomer);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findOneAndDelete({
      intnr: req.params.intnr,
    });
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }
    res.json({ message: "Customer deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const validateContactPerson = (contactPerson) => {
  const errors = [];

  // Validate contact persons
  if (!contactPerson.first_name) {
    errors.push("First name is required");
  }
  if (!contactPerson.last_name) {
    errors.push("Last name is required");
  }
  if (
    contactPerson.email &&
    !/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(contactPerson.email)
  ) {
    errors.push("Invalid email format");
  }
  if (
    contactPerson.mobile_phone &&
    !/^\d{10}$/.test(contactPerson.mobile_phone)
  ) {
    errors.push("Invalid phone number format");
  }

  return errors;
};

const validateAddress = (address) => {
  const errors = [];

  // Validate addresses
  if (!address.company_name) {
    errors.push("Company name is required");
  }
  if (!address.country) {
    errors.push("Country is required");
  }
  if (!address.city) {
    errors.push("City is required");
  }
  if (!address.zip) {
    errors.push("Zip code is required");
  }
  if (
    address.email &&
    !/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(address.email)
  ) {
    errors.push("Invalid address email format");
  }

  return errors;
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

      // Validate customer
      const validationErrors = validateContactPerson(
        customer.contact_persons[0]
      );
      if (validationErrors.length > 0) {
        errors.push({
          customer,
          errors: validationErrors,
        });
      } else {
        customers.push(customer);
      }
    })
    .on("end", async () => {
      try {
        if (errors.length > 0) {
          return res.status(400).json({
            message: "Validation errors occurred",
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

          await Customer.create(customer);
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
            message: "Validation errors occurred",
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
          .json({ message: "Contact persons uploaded successfully" });
      } catch (err) {
        res.status(500).json({
          message: "Error uploading contact persons",
          error: err.message,
        });
      }
    });
};

const uploadAddresses = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
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
            message: "Validation errors occurred",
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

        res.status(201).json({ message: "Addresses uploaded successfully" });
      } catch (err) {
        res
          .status(500)
          .json({ message: "Error uploading addresses", error: err.message });
      }
    });
};

module.exports = {
  getCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  uploadCustomers,
  uploadContactPersons,
  uploadAddresses,
};
