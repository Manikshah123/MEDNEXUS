const express = require('express');
const router = express.Router();
const PharmacyOrder = require('../models/PharmacyOrder');
const Medicine = require('../models/Medicine');
const Order = require('../models/Order');
const AuditLog = require('../models/AuditLog');
const Notification = require('../models/Notification');

// GET /api/pharmacy/orders
router.get('/orders', async (req, res) => {
  try {
    const { status, priority, page = 1, limit = 100 } = req.query;
    let query = {};
    if (status) query.status = status;
    if (priority) query.priority = priority;

    const orders = await PharmacyOrder.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await PharmacyOrder.countDocuments(query);
    res.json({ success: true, data: orders, total });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/pharmacy/orders/:id/status
router.put('/orders/:id/status', async (req, res) => {
  try {
    const { status, performedBy, reason } = req.body;
    const pOrder = await PharmacyOrder.findById(req.params.id);
    if (!pOrder) return res.status(404).json({ success: false, message: 'Order not found' });

    pOrder.status = status;
    const now = new Date();

    switch (status) {
      case 'Accepted':
        pOrder.acceptedBy = performedBy;
        pOrder.acceptedAt = now;
        break;
      case 'Preparing':
        pOrder.preparedBy = performedBy;
        break;
      case 'Ready':
        pOrder.preparedAt = now;
        break;
      case 'Sent to Ward':
        await Notification.create({
          title: 'Medicine Ready',
          message: `${pOrder.medicineName} for ${pOrder.patientName} (Bed: ${pOrder.bed}) is ready from pharmacy`,
          type: 'medication',
          targetRole: 'nurse',
          patientId: pOrder.patientId,
          module: 'Pharmacy'
        });
        break;
      case 'Dispensed':
        pOrder.dispensedBy = performedBy;
        pOrder.dispensedAt = now;
        // Update medicine stock
        const medicine = await Medicine.findOne({ name: { $regex: pOrder.medicineName, $options: 'i' } });
        if (medicine && medicine.stock > 0) {
          medicine.stock -= pOrder.quantity;
          medicine.stockHistory.push({
            action: 'Dispensed',
            quantity: pOrder.quantity,
            performedBy,
            notes: `Dispensed for patient ${pOrder.patientId}`
          });
          await medicine.save();
        }
        // Update corresponding order
        if (pOrder.order) {
          await Order.findByIdAndUpdate(pOrder.order, { status: 'In Progress' });
        }
        break;
      case 'Cancelled':
        pOrder.cancelReason = reason;
        pOrder.cancelledBy = performedBy;
        break;
    }

    await pOrder.save();

    // Audit
    await AuditLog.create({
      action: `Pharmacy Order ${status}`,
      module: 'Pharmacy',
      description: `${pOrder.medicineName} for ${pOrder.patientName} - ${status}`,
      userName: performedBy,
      userRole: 'pharmacist',
      patientId: pOrder.patientId,
      entityId: pOrder._id.toString(),
      entityType: 'PharmacyOrder'
    });

    res.json({ success: true, data: pOrder });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// GET /api/pharmacy/inventory
router.get('/inventory', async (req, res) => {
  try {
    const { search, category, status, page = 1, limit = 100 } = req.query;
    let query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { genericName: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } }
      ];
    }
    if (category) query.category = category;
    if (status) query.status = status;

    const medicines = await Medicine.find(query)
      .sort({ name: 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Medicine.countDocuments(query);
    res.json({ success: true, data: medicines, total });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/pharmacy/inventory
router.post('/inventory', async (req, res) => {
  try {
    const medicine = await Medicine.create(req.body);
    res.status(201).json({ success: true, data: medicine });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// PUT /api/pharmacy/inventory/:id
router.put('/inventory/:id', async (req, res) => {
  try {
    const medicine = await Medicine.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!medicine) return res.status(404).json({ success: false, message: 'Medicine not found' });
    res.json({ success: true, data: medicine });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// PUT /api/pharmacy/inventory/:id/stock
router.put('/inventory/:id/stock', async (req, res) => {
  try {
    const { quantity, action, performedBy, notes } = req.body;
    const medicine = await Medicine.findById(req.params.id);
    if (!medicine) return res.status(404).json({ success: false, message: 'Medicine not found' });

    if (action === 'Added') {
      medicine.stock += quantity;
    } else if (action === 'Adjusted') {
      medicine.stock = quantity;
    }

    medicine.stockHistory.push({ action, quantity, performedBy, notes });
    await medicine.save();

    res.json({ success: true, data: medicine });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// GET /api/pharmacy/stats
router.get('/stats', async (req, res) => {
  try {
    const newOrders = await PharmacyOrder.countDocuments({ status: 'New' });
    const preparing = await PharmacyOrder.countDocuments({ status: 'Preparing' });
    const ready = await PharmacyOrder.countDocuments({ status: 'Ready' });
    const sentToWard = await PharmacyOrder.countDocuments({ status: 'Sent to Ward' });
    const dispensed = await PharmacyOrder.countDocuments({ status: 'Dispensed' });
    const lowStock = await Medicine.countDocuments({ status: 'Low Stock' });
    const outOfStock = await Medicine.countDocuments({ status: 'Out of Stock' });
    const expired = await Medicine.countDocuments({ status: 'Expired' });

    res.json({
      success: true,
      data: { newOrders, preparing, ready, sentToWard, dispensed, lowStock, outOfStock, expired }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
