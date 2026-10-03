const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Patient = require('../models/Patient');
const PharmacyOrder = require('../models/PharmacyOrder');
const Billing = require('../models/Billing');
const AuditLog = require('../models/AuditLog');
const Notification = require('../models/Notification');

// Generate order ID
async function generateOrderId() {
  const count = await Order.countDocuments();
  return `ORD-${String(count + 1).padStart(6, '0')}`;
}

// Generate pharmacy order ID
async function generatePharmacyOrderId() {
  const count = await PharmacyOrder.countDocuments();
  return `PHR-${String(count + 1).padStart(6, '0')}`;
}

// POST /api/orders - Create doctor order
router.post('/', async (req, res) => {
  try {
    const orderId = await generateOrderId();
    const orderData = { ...req.body, orderId, orderedAt: new Date() };
    const order = await Order.create(orderData);

    // Update patient timeline
    const patient = await Patient.findOne({ patientId: order.patientId });
    if (patient) {
      let eventDesc = '';
      if (order.category === 'Medication' || order.category === 'Injection' || order.category === 'IV Fluid') {
        eventDesc = `${order.category}: ${order.medicineName} ${order.dosage} ${order.route} - ${order.frequency}`;
      } else {
        eventDesc = `${order.category}: ${order.instruction}`;
      }
      patient.timeline.push({
        event: 'Doctor Order',
        description: eventDesc,
        staffMember: order.doctorName,
        staffRole: 'Doctor',
        status: 'Ordered'
      });
      await patient.save();
    }

    // If medication order, create pharmacy order
    if (['Medication', 'Injection', 'IV Fluid'].includes(order.category)) {
      const pharmacyOrderId = await generatePharmacyOrderId();
      
      // Calculate quantity from frequency and duration
      let quantity = 1;
      if (order.duration && order.frequency) {
        const daysMatch = order.duration.match(/(\d+)/);
        const days = daysMatch ? parseInt(daysMatch[1]) : 1;
        const freqMatch = order.frequency.match(/every\s+(\d+)/i);
        const hoursInterval = freqMatch ? parseInt(freqMatch[1]) : 24;
        quantity = Math.ceil((days * 24) / hoursInterval);
      }

      await PharmacyOrder.create({
        pharmacyOrderId,
        order: order._id,
        orderId: order.orderId,
        patient: patient?._id,
        patientId: order.patientId,
        patientName: order.patientName,
        doctor: order.doctor,
        doctorName: order.doctorName,
        medicineName: order.medicineName,
        dosage: order.dosage,
        route: order.route,
        frequency: order.frequency,
        quantity,
        duration: order.duration,
        specialInstructions: order.specialInstructions,
        ward: order.ward,
        room: order.room,
        bed: order.bed,
        priority: order.priority,
        status: 'New'
      });

      // Notify pharmacy
      await Notification.create({
        title: 'New Medication Order',
        message: `${order.medicineName} ${order.dosage} for ${order.patientName} (${order.patientId})`,
        type: 'pharmacy',
        priority: order.priority === 'Stat' ? 'Critical' : 'Normal',
        targetRole: 'pharmacist',
        patientId: order.patientId,
        module: 'Pharmacy'
      });
    }

    // Notify nurse
    await Notification.create({
      title: 'New Doctor Order',
      message: `${order.category}: ${order.medicineName || order.instruction} for ${order.patientName}`,
      type: 'order',
      targetRole: 'nurse',
      patientId: order.patientId,
      module: 'Orders'
    });

    // Audit
    await AuditLog.create({
      action: 'Order Created',
      module: 'Doctor Orders',
      description: `${order.category} order for ${order.patientName}: ${order.medicineName || order.instruction}`,
      userName: order.doctorName,
      userRole: 'doctor',
      patientId: order.patientId,
      entityId: order._id.toString(),
      entityType: 'Order'
    });

    res.status(201).json({ success: true, data: order });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// GET /api/orders
router.get('/', async (req, res) => {
  try {
    const { patientId, category, status, doctor, page = 1, limit = 100 } = req.query;
    let query = {};
    if (patientId) query.patientId = patientId;
    if (category) query.category = category;
    if (status) query.status = status;
    if (doctor) query.doctor = doctor;

    const orders = await Order.find(query)
      .sort({ orderedAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Order.countDocuments(query);
    res.json({ success: true, data: orders, total });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/orders/:id
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/orders/:id/administer - Mark medicine administered
router.put('/:id/administer', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    order.administrations.push({
      administeredBy: req.body.administeredBy,
      administeredByRole: req.body.role || 'Nurse',
      administeredAt: new Date(),
      dose: req.body.dose || order.dosage,
      notes: req.body.notes || '',
      status: 'Administered'
    });

    // Check if all doses administered
    if (order.administrations.length >= (order.administrationTimes?.length || 1)) {
      order.status = 'Completed';
      order.completedBy = req.body.administeredBy;
      order.completedAt = new Date();
    } else {
      order.status = 'In Progress';
    }

    await order.save();

    // Update patient timeline
    const patient = await Patient.findOne({ patientId: order.patientId });
    if (patient) {
      patient.timeline.push({
        event: 'Medicine Administered',
        description: `${order.medicineName} ${order.dosage} administered`,
        staffMember: req.body.administeredBy,
        staffRole: 'Nurse',
        status: 'Completed'
      });
      await patient.save();
    }

    // Add to billing
    const billing = await Billing.findOne({ patientId: order.patientId, status: { $ne: 'Cancelled' } }).sort({ createdAt: -1 });
    if (billing) {
      const existingItem = billing.items.find(i => i.orderId === order.orderId);
      if (!existingItem) {
        billing.items.push({
          description: `${order.medicineName} ${order.dosage}`,
          category: 'Medicine',
          quantity: 1,
          unitPrice: 150,
          totalPrice: 150,
          orderId: order.orderId
        });
        billing.calculateTotals();
        await billing.save();
      }
    }

    // Audit
    await AuditLog.create({
      action: 'Medicine Administered',
      module: 'Nursing',
      description: `${order.medicineName} ${order.dosage} administered to ${order.patientName}`,
      userName: req.body.administeredBy,
      userRole: 'nurse',
      patientId: order.patientId,
      entityId: order._id.toString(),
      entityType: 'Order'
    });

    res.json({ success: true, data: order });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// PUT /api/orders/:id/status
router.put('/:id/status', async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, {
      status: req.body.status,
      ...(req.body.status === 'Cancelled' ? { cancelledReason: req.body.reason } : {})
    }, { new: true });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;
