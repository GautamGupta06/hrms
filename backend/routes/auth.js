const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Import your separate collection models
const Superadmin = require('../models/Superadmin');
const Admin = require('../models/Admin');
const Employee = require('../models/Employee');

// A secret key used to sign your login tokens (in production, put this in a .env file)
const JWT_SECRET = "HRMS_SUPER_SECRET_KEY_123";

// ==========================================
// 1. UNIVERSAL LOGIN ROUTE (For all roles)
// ==========================================
router.post('/login', async (req, res) => {
  const { email, password, role } = req.body; // 'role' matches your frontend tabs ('employee', 'hr', 'admin')

  try {
    let user = null;

    // Direct the query to look inside the correct database table
    if (role === 'superadmin') {
      user = await Superadmin.findOne({ email });
    } else if (role === 'admin') {
      user = await Admin.findOne({ email });
    } else if (role === 'hr' || role === 'employee') {
      user = await Employee.findOne({ email });
      
      // Safety Check: If someone logs in via the HR tab but their database entry is a standard employee
      if (user && role === 'hr' && user.role !== 'hr') {
        return res.status(403).json({ message: "Access Denied: You are not registered as an HR Manager" });
      }
    }

    // If no record exists for that email in the selected table
    if (!user) {
      return res.status(400).json({ message: "Invalid email or credentials" });
    }

    // Verify password match using bcrypt
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or credentials" });
    }

    // Generate a secure secure token containing the user's Mongo ID and role context
    const token = jwt.sign(
      { id: user._id, role: user.role || role },
      JWT_SECRET,
      { expiresIn: '1d' } // Token expires in 24 hours
    );

    // Send the pass token back to your frontend localStorage handler
    res.json({
      message: "Login successful",
      token,
      role: user.role || role
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error during authentication" });
  }
});

// ==========================================
// 2. SUPERADMIN CREATES ADMIN ROUTE
// ==========================================
router.post('/create-admin', async (req, res) => {
  const { adminId, name, email, password, branchName } = req.body;

  try {
    // Check if admin account already exists
    let existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: "An Admin with this email already exists" });
    }

    // Hash the clear text password securely
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Save into the Admin collection
    const newAdmin = new Admin({
      adminId,
      name,
      email,
      password: hashedPassword,
      branchName
    });

    await newAdmin.save();
    res.status(201).json({ message: "Admin account created successfully!" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error creating Admin profile" });
  }
});

// ==========================================
// 3. ADMIN CREATES EMPLOYEE / HR ROUTE
// ==========================================
router.post('/create-employee', async (req, res) => {
  const { empId, name, email, password, role, department } = req.body; // role must be 'employee' or 'hr'

  try {
    let existingEmployee = await Employee.findOne({ email });
    if (existingEmployee) {
      return res.status(400).json({ message: "A worker with this email already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newWorker = new Employee({
      empId,
      name,
      email,
      password: hashedPassword,
      role, // saves as either 'employee' or 'hr' cleanly
      department
    });

    await newWorker.save();
    res.status(201).json({ message: `${role.toUpperCase()} account created successfully!` });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error creating personnel file" });
  }
});

module.exports = router;