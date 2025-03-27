const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../../models/User");
require('dotenv').config();

// Admin Register
const registerAdmin = async (req, res) => {
  const { userName, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.json({
        success: false,
        message: "Admin already exists with this email!",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const newAdmin = new User({
      userName,
      email,
      password: hashedPassword,
      role: "admin",
    });

    await newAdmin.save();
    res.status(201).json({
      success: true,
      message: "Admin registered successfully",
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Admin Login
const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const adminUser = await User.findOne({ email, role: "admin" }); // Only allow admin
    if (!adminUser) {
      return res.json({
        success: false,
        message: "Admin not found. Please register first.",
      });
    }

    const isMatch = await bcrypt.compare(password, adminUser.password);
    if (!isMatch) {
      return res.json({
        success: false,
        message: "Incorrect password!",
      });
    }

    const token = jwt.sign(
      {
        id: adminUser._id,
        role: adminUser.role,
        email: adminUser.email,
        userName: adminUser.userName,
      },
      process.env.CLIENT_SECRET_KEY,
      { expiresIn: "60m" }
    );

    res.cookie("token", token, { 
      httpOnly: true,
      secure: true,
      sameSite: "None", 
    }).json({
      success: true,
      message: "Admin logged in successfully",
      user: {
        id: adminUser._id,
        email: adminUser.email,
        role: adminUser.role,
        userName: adminUser.userName,
      },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Admin Logout
const logoutAdmin = (req, res) => {
  res.clearCookie("token").json({
    success: true,
    message: "Admin logged out successfully!",
  });
};

// Admin Auth Middleware
const adminAuthMiddleware = async (req, res, next) => {
  const token = req.cookies.token;
  console.log(token);
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized access!",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.CLIENT_SECRET_KEY);

    if (decoded.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied! Admins only.",
      });
    }

    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Invalid token. Unauthorized!",
    });
  }
};

module.exports = {
  registerAdmin,
  loginAdmin,
  logoutAdmin,
  adminAuthMiddleware,
};
