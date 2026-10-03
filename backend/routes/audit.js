const express = require('express');
const router = express.Router();
const AuditLog = require('../models/AuditLog');

// GET /api/audit
router.get('/', async (req, res) => {
  try {
    const { module, patientId, userRole, page = 1, limit = 100 } = req.query;
    let query = {};
    if (module) query.module = module;
    if (patientId) query.patientId = patientId;
    if (userRole) query.userRole = userRole;

    const logs = await AuditLog.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await AuditLog.countDocuments(query);
    res.json({ success: true, data: logs, total });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
