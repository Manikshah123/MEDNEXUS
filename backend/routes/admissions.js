const express = require('express');
const router = express.Router();
const Admission = require('../models/Admission');
const Patient = require('../models/Patient');
const Ward = require('../models/Ward');
const AuditLog = require('../models/AuditLog');
const Notification = require('../models/Notification');
const Billing = require('../models/Billing');

// Generate admission ID
async function generateAdmissionId() {
  const year = new Date().getFullYear();
  const count = await Admission.countDocuments();
  return `ADM-${year}-${String(count + 1).padStart(5, '0')}`;
}

// Generate invoice ID
async function generateInvoiceId() {
  const year = new Date().getFullYear();
  const count = await Billing.countDocuments();
  return `INV-${year}-${String(count + 1).padStart(5, '0')}`;
}

// POST /api/admissions - Create admission
router.post('/', async (req, res) => {
  try {
    const admissionId = await generateAdmissionId();
    const { patientId, diagnosis, doctorId, doctorName, department, priority, wardId, wardName, room, bed, expectedStay, specialInstructions } = req.body;

    // Find patient
    const patient = await Patient.findOne({ patientId });
    if (!patient) return res.status(404).json({ success: false, message: 'Patient not found' });

    const admission = await Admission.create({
      admissionId,
      patient: patient._id,
      patientId,
      diagnosis,
      doctor: doctorId,
      doctorName,
      department,
      priority: priority || 'Normal',
      ward: wardId,
      wardName,
      room,
      bed,
      expectedStay: expectedStay || 1,
      specialInstructions,
      admissionDate: new Date(),
      admissionTime: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    });

    // Update patient status
    patient.status = 'Admitted';
    patient.currentWard = wardId;
    patient.currentRoom = room;
    patient.currentBed = bed;
    patient.timeline.push({
      event: 'Patient Admitted',
      description: `Admitted to ${wardName}, Room ${room}, Bed ${bed}. Diagnosis: ${diagnosis}`,
      staffMember: doctorName,
      staffRole: 'Doctor',
      status: 'Completed'
    });
    await patient.save();

    // Update ward bed status
    if (wardId) {
      const ward = await Ward.findById(wardId);
      if (ward) {
        ward.rooms.forEach(r => {
          if (r.roomNumber === room) {
            r.beds.forEach(b => {
              if (b.bedNumber === bed || b.bedId === bed) {
                b.status = 'Occupied';
                b.patient = patient._id;
                b.patientId = patientId;
                b.patientName = `${patient.firstName} ${patient.lastName}`;
              }
            });
          }
        });
        ward.updateBedCounts();
        await ward.save();
      }
    }

    // Create billing record
    const invoiceId = await generateInvoiceId();
    await Billing.create({
      invoiceId,
      patient: patient._id,
      patientId,
      patientName: `${patient.firstName} ${patient.lastName}`,
      admission: admission._id,
      admissionId,
      items: [
        { description: 'Admission Fee', category: 'Admission', quantity: 1, unitPrice: 500, totalPrice: 500 },
        { description: `Bed Charges - ${wardName}`, category: 'Bed', quantity: 1, unitPrice: 1000, totalPrice: 1000 }
      ],
      subtotal: 1500,
      total: 1500,
      pending: 1500,
      status: 'Pending'
    });

    // Audit
    await AuditLog.create({
      action: 'Patient Admitted',
      module: 'Admission',
      description: `${patient.firstName} ${patient.lastName} admitted to ${wardName}`,
      userName: doctorName,
      userRole: 'doctor',
      patientId,
      entityId: admission._id.toString(),
      entityType: 'Admission'
    });

    // Notifications
    await Notification.create([
      {
        title: 'New Patient Admitted',
        message: `${patient.firstName} ${patient.lastName} (${patientId}) admitted to ${wardName}, Bed ${bed}`,
        type: 'admission',
        priority: priority === 'Emergency' ? 'Critical' : 'Normal',
        targetRole: 'nurse',
        patientId,
        module: 'Admission'
      },
      {
        title: 'New Admission',
        message: `${patient.firstName} ${patient.lastName} admitted. Bed: ${wardName} ${bed}`,
        type: 'admission',
        targetRole: 'admin',
        patientId,
        module: 'Admission'
      }
    ]);

    res.status(201).json({ success: true, data: admission });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// GET /api/admissions
router.get('/', async (req, res) => {
  try {
    const { status, priority, ward, page = 1, limit = 50 } = req.query;
    let query = {};
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (ward) query.wardName = { $regex: ward, $options: 'i' };

    const admissions = await Admission.find(query)
      .populate('patient', 'firstName lastName patientId age gender bloodGroup phone')
      .populate('doctor', 'name specialization')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Admission.countDocuments(query);
    res.json({ success: true, data: admissions, total });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/admissions/:id
router.get('/:id', async (req, res) => {
  try {
    let admission;
    if (req.params.id.startsWith('ADM-')) {
      admission = await Admission.findOne({ admissionId: req.params.id })
        .populate('patient')
        .populate('doctor', 'name specialization department');
    } else {
      admission = await Admission.findById(req.params.id)
        .populate('patient')
        .populate('doctor', 'name specialization department');
    }
    if (!admission) return res.status(404).json({ success: false, message: 'Admission not found' });
    res.json({ success: true, data: admission });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/admissions/:id/discharge
router.put('/:id/discharge', async (req, res) => {
  try {
    const admission = await Admission.findById(req.params.id);
    if (!admission) return res.status(404).json({ success: false, message: 'Admission not found' });

    admission.status = 'Discharged';
    admission.dischargeDate = new Date();
    admission.dischargeSummary = req.body.dischargeSummary || '';
    await admission.save();

    // Update patient
    const patient = await Patient.findOne({ patientId: admission.patientId });
    if (patient) {
      patient.status = 'Discharged';
      patient.currentWard = null;
      patient.currentRoom = '';
      patient.currentBed = '';
      patient.timeline.push({
        event: 'Patient Discharged',
        description: req.body.dischargeSummary || 'Patient discharged',
        staffMember: req.body.doctorName || '',
        staffRole: 'Doctor',
        status: 'Completed'
      });
      await patient.save();
    }

    // Free up bed
    if (admission.ward) {
      const ward = await Ward.findById(admission.ward);
      if (ward) {
        ward.rooms.forEach(r => {
          if (r.roomNumber === admission.room) {
            r.beds.forEach(b => {
              if (b.bedNumber === admission.bed || b.bedId === admission.bed) {
                b.status = 'Cleaning';
                b.patient = null;
                b.patientId = '';
                b.patientName = '';
              }
            });
          }
        });
        ward.updateBedCounts();
        await ward.save();
      }
    }

    res.json({ success: true, data: admission });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;
