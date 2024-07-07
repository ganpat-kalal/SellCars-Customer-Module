// utils/validation.js

const validateContactPerson = (contactPerson) => {
    const errors = [];

    if (!contactPerson.first_name) {
        errors.push("First name is required!");
    }
    if (!contactPerson.last_name) {
        errors.push("Last name is required!");
    }
    if (
        contactPerson.email &&
        !/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(contactPerson.email)
    ) {
        errors.push("Invalid email format!");
    }
    if (
        contactPerson.mobile_phone &&
        !/^\d{7,15}$/.test(contactPerson.mobile_phone)
    ) {
        errors.push("Invalid phone number format!");
    }

    return errors;
};

const validateAddress = (address) => {
    const errors = [];

    if (!address.company_name) {
        errors.push("Company name is required!");
    }
    if (!address.country) {
        errors.push("Country is required!");
    }
    if (!address.city) {
        errors.push("City is required!");
    }
    if (!address.zip) {
        errors.push("Zip code is required!");
    }
    if (
        address.email &&
        !/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(address.email)
    ) {
        errors.push("Invalid address email format!");
    }

    return errors;
};

module.exports = {
    validateContactPerson,
    validateAddress
};