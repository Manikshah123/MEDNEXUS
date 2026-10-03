const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient');
const User = require('../models/User');
const Admission = require('../models/Admission');
const Order = require('../models/Order');
const Medicine = require('../models/Medicine');
const Billing = require('../models/Billing');
const Ward = require('../models/Ward');

// GET /api/search?q=query
router.get('/', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) {
      return res.json({ success: true, data: { patients: [], doctors: [], admissions: [], orders: [], medicines: [], invoices: [] } });
    }

    const regex = new RegExp(q, 'i');

    const [patients, doctors, admissions, orders, medicines, invoices] = await Promise.all([
      Patient.find({
        $or: [
          { patientId: regex },
          { firstName: regex },
          { lastName: regex },
          { phone: regex }
        ]
      }).select('patientId firstName lastName age gender status phone').limit(10),

      User.find({
        role: 'doctor',
        $or: [{ name: regex }, { employeeId: regex }, { specialization: regex }]
      }).select('name employeeId specialization department').limit(10),

      Admission.find({
        $or: [{ admissionId: regex }, { patientId: regex }, { wardName: regex }]
      }).select('admissionId patientId wardName bed status diagnosis').limit(10),

      Order.find({
        $or: [{ orderId: regex }, { patientId: regex }, { medicineName: regex }]
      }).select('orderId patientId patientName category medicineName status').limit(10),

      Medicine.find({
        $or: [{ name: regex }, { code: regex }, { genericName: regex }]
      }).select('name code category stock status').limit(10),

      Billing.find({
        $or: [{ invoiceId: regex }, { patientId: regex }, { patientName: regex }]
      }).select('invoiceId patientId patientName total status').limit(10)
    ]);

    res.json({
      success: true,
      data: { patients, doctors, admissions, orders, medicines, invoices }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/search/dashboard-stats
router.get('/dashboard-stats', async (req, res) => {
  try {
    const [
      totalPatients,
      admittedPatients,
      dischargedToday,
      totalDoctors,
      activeDoctors,
      pendingOrders,
      newPharmacyOrders,
      pendingBills,
      wards
    ] = await Promise.all([
      Patient.countDocuments(),
      Patient.countDocuments({ status: 'Admitted' }),
      Patient.countDocuments({
        status: 'Discharged',
        updatedAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
      }),
      User.countDocuments({ role: 'doctor' }),
      User.countDocuments({ role: 'doctor', isActive: true }),
      Order.countDocuments({ status: { $in: ['Ordered', 'In Progress'] } }),
      require('../models/PharmacyOrder').countDocuments({ status: 'New' }),
      Billing.countDocuments({ status: { $in: ['Pending', 'Partially Paid'] } }),
      Ward.find({ isActive: true })
    ]);

    let totalBeds = 0, occupiedBeds = 0, availableBeds = 0;
    wards.forEach(w => {
      totalBeds += w.totalBeds;
      occupiedBeds += w.occupiedBeds;
      availableBeds += w.availableBeds;
    });

    // Recent admissions
    const recentAdmissions = await Admission.find({ status: 'Active' })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('admissionId patientId wardName bed diagnosis priority createdAt');

    // Emergency count
    const emergencyPatients = await Admission.countDocuments({
      status: 'Active',
      priority: 'Emergency'
    });

    // Today's revenue
    const todayBills = await Billing.find({
      createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      status: { $ne: 'Cancelled' }
    });
    const todayRevenue = todayBills.reduce((sum, b) => sum + b.paid, 0);

    // Ward occupancy for chart
    const wardOccupancy = wards.map(w => ({
      name: w.name,
      code: w.code,
      total: w.totalBeds,
      occupied: w.occupiedBeds,
      available: w.availableBeds,
      percentage: w.totalBeds > 0 ? Math.round((w.occupiedBeds / w.totalBeds) * 100) : 0
    }));

    res.json({
      success: true,
      data: {
        totalPatients,
        admittedPatients,
        emergencyPatients,
        dischargedToday,
        totalDoctors,
        activeDoctors,
        pendingOrders,
        newPharmacyOrders,
        pendingBills,
        totalBeds,
        occupiedBeds,
        availableBeds,
        todayRevenue,
        recentAdmissions,
        wardOccupancy
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
