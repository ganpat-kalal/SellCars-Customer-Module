const validateContactPerson = (contactPerson) => {
    const errors = [];

    if (!contactPerson.first_name) {
        errors.push("First name is required!");
    }
    if (!contactPerson.last_name) {
        errors.push("Last name is required!");
    }
    if (!contactPerson.email) {
        errors.push("Email is required!");
    } else if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(contactPerson.email)) {
        errors.push("Invalid email format!");
    }
    if (!contactPerson.mobile_phone) {
        errors.push("Mobile phone is required!");
    } else if (!/^\d{7,15}$/.test(contactPerson.mobile_phone)) {
        errors.push("Invalid phone number format!");
    }
    if (contactPerson.birth_date && !/^\d{4}-\d{2}-\d{2}$/.test(contactPerson.birth_date)) {
        errors.push("Invalid birth date format (YYYY-MM-DD)!");
    }

    return errors;
};

const validateAddress = (address) => {
    const errors = [];

    if (!address.country) {
        errors.push("Country is required!");
    }
    if (!address.city) {
        errors.push("City is required!");
    }
    if (!address.zip) {
        errors.push("Zip code is required!");
    }
    if (!address.street) {
        errors.push("Street is required!");
    }
    if (
        address.email &&
        !/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(address.email)
    ) {
        errors.push("Invalid address email format!");
    }

    return errors;
};

const validateFileType = (row) => {
    if (row["A"] && row["B"] && row["C"] && row["D"] && row["E"] && row["F"] && row["G"] && row["H"] && row["I"] && row["J"] && row["K"] && row["L"] && row["M"] && row["N"] && row["O"]) {
        return 'customer';
    } else if (row["A"] && row["C"] && row["D"] && row["E"] && row["F"] && row["G"]) {
        return 'contactPerson';
    } else if (row["A"] && row["H"] && row["I"] && row["J"] && row["K"] && row["L"] && row["M"] && row["N"] && row["O"]) {
        return 'address';
    } else {
        throw new Error("Invalid file type");
    }
};

module.exports = {
    validateContactPerson,
    validateAddress,
    validateFileType
};
