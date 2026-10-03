const express = require('express');
const router = express.Router();
const Vital = require('../models/Vital');
const Patient = require('../models/Patient');
const Notification = require('../models/Notification');

// POST /api/vitals
router.post('/', async (req, res) => {
  try {
    const vital = await Vital.create(req.body);

    // If abnormal, create notification
    if (vital.isAbnormal) {
      const patient = await Patient.findOne({ patientId: vital.patientId });
      await Notification.create({
        title: 'Abnormal Vitals Detected',
        message: `${patient?.firstName || ''} ${patient?.lastName || ''} (${vital.patientId}): ${vital.alerts.join(', ')}`,
        type: 'vital',
        priority: 'High',
        targetRole: 'doctor',
        patientId: vital.patientId,
        module: 'Vitals'
      });
    }

    // Update patient timeline
    const patient = await Patient.findOne({ patientId: vital.patientId });
    if (patient) {
      patient.timeline.push({
        event: 'Vitals Recorded',
        description: `HR: ${vital.heartRate}, BP: ${vital.systolicBP}/${vital.diastolicBP}, SpO2: ${vital.spO2}%, Temp: ${vital.temperature}°C`,
        staffMember: vital.recordedByName || '',
        staffRole: 'Nurse',
        status: vital.isAbnormal ? 'Alert' : 'Normal'
      });
      await patient.save();
    }

    res.status(201).json({ success: true, data: vital });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// GET /api/vitals - Get vitals for a patient
router.get('/', async (req, res) => {
  try {
    const { patientId, limit = 50 } = req.query;
    if (!patientId) return res.status(400).json({ success: false, message: 'patientId required' });

    const vitals = await Vital.find({ patientId })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json({ success: true, data: vitals });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/vitals/latest/:patientId
router.get('/latest/:patientId', async (req, res) => {
  try {
    const vital = await Vital.findOne({ patientId: req.params.patientId })
      .sort({ createdAt: -1 });
    res.json({ success: true, data: vital });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
