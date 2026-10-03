const express = require('express');
const router = express.Router();
const Billing = require('../models/Billing');
const AuditLog = require('../models/AuditLog');

// GET /api/billing
router.get('/', async (req, res) => {
  try {
    const { patientId, status, page = 1, limit = 50 } = req.query;
    let query = {};
    if (patientId) query.patientId = patientId;
    if (status) query.status = status;

    const bills = await Billing.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Billing.countDocuments(query);
    res.json({ success: true, data: bills, total });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/billing/:id
router.get('/:id', async (req, res) => {
  try {
    let bill;
    if (req.params.id.startsWith('INV-')) {
      bill = await Billing.findOne({ invoiceId: req.params.id });
    } else {
      bill = await Billing.findById(req.params.id);
    }
    if (!bill) return res.status(404).json({ success: false, message: 'Invoice not found' });
    res.json({ success: true, data: bill });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/billing/:id/items - Add billing item
router.post('/:id/items', async (req, res) => {
  try {
    const bill = await Billing.findById(req.params.id);
    if (!bill) return res.status(404).json({ success: false, message: 'Invoice not found' });

    bill.items.push(req.body);
    bill.calculateTotals();
    await bill.save();

    res.json({ success: true, data: bill });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// POST /api/billing/:id/payment - Add payment
router.post('/:id/payment', async (req, res) => {
  try {
    const bill = await Billing.findById(req.params.id);
    if (!bill) return res.status(404).json({ success: false, message: 'Invoice not found' });

    bill.payments.push(req.body);
    bill.calculateTotals();
    await bill.save();

    // Audit
    await AuditLog.create({
      action: 'Payment Received',
      module: 'Billing',
      description: `Payment of ₹${req.body.amount} received for ${bill.patientName} (${bill.invoiceId})`,
      userName: req.body.receivedBy,
      userRole: 'billing',
      patientId: bill.patientId,
      entityId: bill._id.toString(),
      entityType: 'Billing'
    });

    res.json({ success: true, data: bill });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// PUT /api/billing/:id
router.put('/:id', async (req, res) => {
  try {
    const bill = await Billing.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!bill) return res.status(404).json({ success: false, message: 'Invoice not found' });
    res.json({ success: true, data: bill });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// GET /api/billing/stats/overview
router.get('/stats/overview', async (req, res) => {
  try {
    const bills = await Billing.find({ status: { $ne: 'Cancelled' } });
    let totalRevenue = 0, totalPending = 0, totalPaid = 0;
    bills.forEach(b => {
      totalRevenue += b.total;
      totalPending += b.pending;
      totalPaid += b.paid;
    });
    const pendingBills = await Billing.countDocuments({ status: 'Pending' });
    const partialBills = await Billing.countDocuments({ status: 'Partially Paid' });

    res.json({
      success: true,
      data: { totalRevenue, totalPending, totalPaid, pendingBills, partialBills, totalBills: bills.length }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
