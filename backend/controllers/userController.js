const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const config = require('../config/config');

const createInitialUsers = async () => {
  const users = [
    {
      first_name: "Max",
      last_name: "Mustermann",
      email: "user1@example.com",
      password_hash: crypto
        .createHash("sha256")
        .update("password1")
        .digest("hex")
        .substr(0, 32),
    },
    {
      first_name: "John",
      last_name: "Doe",
      email: "user2@example.com",
      password_hash: crypto
        .createHash("sha256")
        .update("password2")
        .digest("hex")
        .substr(0, 32),
    },
    {
      first_name: "Jane",
      last_name: "Smith",
      email: "user3@example.com",
      password_hash: crypto
        .createHash("sha256")
        .update("password3")
        .digest("hex")
        .substr(0, 32),
    },
  ];

  for (const user of users) {
    const existingUser = await User.findOne({ email: user.email });
    if (!existingUser) {
      const newUser = new User(user);
      await newUser.save();
    }
  }
}

// Call this function once to create the initial users
createInitialUsers();

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const hashedPassword = crypto
      .createHash("sha256")
      .update(password)
      .digest("hex")
      .substr(0, 32);

    if (hashedPassword !== user.password_hash) {
      return res.status(400).json({ message: "Invalid credentials!" });
    }

    const token = jwt.sign({ id: user._id }, config.JWT_SECRET, {
      expiresIn: "1h",
    });

    user.updated_at = Date.now();
    await user.save();
    res.json({ token, user });
  } catch (error) {
    res.status(500).json({ message: "Server error!" });
  }
};

module.exports = { login };