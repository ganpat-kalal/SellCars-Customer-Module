const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

exports.login = async (req, res) => {
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
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    
    user.updated_at = Date.now();
    await user.save();
    res.json({ token, user });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
