const express = require('express');
const router = express.Router();
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password, employeeId } = req.body;

    // Find user by email or employeeId
    const query = email ? { email } : { employeeId: employeeId?.toUpperCase() };
    const user = await User.findOne(query).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(401).json({ success: false, message: 'Account is deactivated' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    const token = user.getSignedJwtToken();

    // Audit log
    await AuditLog.create({
      action: 'Login',
      module: 'Authentication',
      description: `${user.name} logged in`,
      userId: user._id,
      userName: user.name,
      userRole: user.role
    });

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        employeeId: user.employeeId,
        role: user.role,
        department: user.department,
        specialization: user.specialization,
        phone: user.phone,
        avatar: user.avatar
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/auth/me
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: 'No token' });

    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        employeeId: user.employeeId,
        role: user.role,
        department: user.department,
        specialization: user.specialization,
        phone: user.phone,
        avatar: user.avatar
      }
    });
  } catch (error) {
    res.status(401).json({ success: false, message: 'Not authorized' });
  }
});

// GET /api/auth/users - Get all staff (admin only)
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ name: 1 });
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/auth/doctors
router.get('/doctors', async (req, res) => {
  try {
    const doctors = await User.find({ role: 'doctor', isActive: true }).select('-password').sort({ name: 1 });
    res.json({ success: true, data: doctors });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
