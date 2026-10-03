const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient');
const AuditLog = require('../models/AuditLog');
const Notification = require('../models/Notification');

// Generate unique Patient ID
async function generatePatientId() {
  const year = new Date().getFullYear();
  const lastPatient = await Patient.findOne({ patientId: new RegExp(`^MED-${year}`) })
    .sort({ patientId: -1 });
  
  let nextNum = 1;
  if (lastPatient) {
    const lastNum = parseInt(lastPatient.patientId.split('-')[2]);
    nextNum = lastNum + 1;
  }
  return `MED-${year}-${String(nextNum).padStart(6, '0')}`;
}

// POST /api/patients - Register new patient
router.post('/', async (req, res) => {
  try {
    const patientId = await generatePatientId();
    const patientData = {
      ...req.body,
      patientId,
      registrationDate: new Date(),
      timeline: [{
        event: 'Patient Registration',
        description: `Patient registered with ID ${patientId}`,
        staffMember: req.body.registeredByName || 'Reception Staff',
        staffRole: 'Receptionist',
        status: 'Completed',
        date: new Date()
      }]
    };

    const patient = await Patient.create(patientData);

    // Audit
    await AuditLog.create({
      action: 'Patient Registration',
      module: 'Reception',
      description: `Registered patient ${patient.firstName} ${patient.lastName} (${patientId})`,
      userName: req.body.registeredByName || 'Reception',
      userRole: 'receptionist',
      patientId,
      entityId: patient._id.toString(),
      entityType: 'Patient'
    });

    // Notification
    await Notification.create({
      title: 'New Patient Registered',
      message: `${patient.firstName} ${patient.lastName} registered with ID ${patientId}`,
      type: 'info',
      targetRole: 'admin',
      patientId,
      module: 'Reception'
    });

    res.status(201).json({ success: true, data: patient });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// GET /api/patients - List all patients
router.get('/', async (req, res) => {
  try {
    const { search, status, page = 1, limit = 50 } = req.query;
    let query = {};

    if (search) {
      query = {
        $or: [
          { patientId: { $regex: search, $options: 'i' } },
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } }
        ]
      };
    }

    if (status) query.status = status;

    const patients = await Patient.find(query)
      .populate('assignedDoctor', 'name specialization')
      .populate('currentWard', 'name code')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Patient.countDocuments(query);

    res.json({ success: true, data: patients, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/patients/:id - Get patient by ID or patientId
router.get('/:id', async (req, res) => {
  try {
    let patient;
    if (req.params.id.startsWith('MED-')) {
      patient = await Patient.findOne({ patientId: req.params.id })
        .populate('assignedDoctor', 'name specialization department phone')
        .populate('currentWard', 'name code type');
    } else {
      patient = await Patient.findById(req.params.id)
        .populate('assignedDoctor', 'name specialization department phone')
        .populate('currentWard', 'name code type');
    }

    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    res.json({ success: true, data: patient });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/patients/:id - Update patient
router.put('/:id', async (req, res) => {
  try {
    let patient;
    if (req.params.id.startsWith('MED-')) {
      patient = await Patient.findOneAndUpdate({ patientId: req.params.id }, req.body, { new: true, runValidators: true });
    } else {
      patient = await Patient.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    }

    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    res.json({ success: true, data: patient });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// POST /api/patients/:id/timeline - Add timeline event
router.post('/:id/timeline', async (req, res) => {
  try {
    const patient = await Patient.findOne({ patientId: req.params.id }) || await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ success: false, message: 'Patient not found' });

    patient.timeline.push({
      ...req.body,
      date: new Date()
    });
    await patient.save();

    res.json({ success: true, data: patient });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// GET /api/patients/stats/overview
router.get('/stats/overview', async (req, res) => {
  try {
    const total = await Patient.countDocuments();
    const admitted = await Patient.countDocuments({ status: 'Admitted' });
    const registered = await Patient.countDocuments({ status: 'Registered' });
    const discharged = await Patient.countDocuments({ status: 'Discharged' });

    res.json({
      success: true,
      data: { total, admitted, registered, discharged }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
