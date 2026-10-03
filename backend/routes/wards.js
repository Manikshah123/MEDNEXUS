const express = require('express');
const router = express.Router();
const Ward = require('../models/Ward');

// GET /api/wards
router.get('/', async (req, res) => {
  try {
    const wards = await Ward.find({ isActive: true }).sort({ name: 1 });
    res.json({ success: true, data: wards });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/wards/:id
router.get('/:id', async (req, res) => {
  try {
    const ward = await Ward.findById(req.params.id);
    if (!ward) return res.status(404).json({ success: false, message: 'Ward not found' });
    res.json({ success: true, data: ward });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/wards/:id/bed - Update bed status
router.put('/:id/bed', async (req, res) => {
  try {
    const { roomNumber, bedId, status, patientId, patientName, patientObjectId } = req.body;
    const ward = await Ward.findById(req.params.id);
    if (!ward) return res.status(404).json({ success: false, message: 'Ward not found' });

    let updated = false;
    ward.rooms.forEach(room => {
      if (room.roomNumber === roomNumber) {
        room.beds.forEach(bed => {
          if (bed.bedId === bedId || bed.bedNumber === bedId) {
            bed.status = status;
            if (patientId) bed.patientId = patientId;
            if (patientName) bed.patientName = patientName;
            if (patientObjectId) bed.patient = patientObjectId;
            if (status === 'Available' || status === 'Cleaning') {
              bed.patient = null;
              bed.patientId = '';
              bed.patientName = '';
            }
            updated = true;
          }
        });
      }
    });

    if (!updated) return res.status(404).json({ success: false, message: 'Bed not found' });

    ward.updateBedCounts();
    await ward.save();

    res.json({ success: true, data: ward });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// GET /api/wards/stats/overview
router.get('/stats/overview', async (req, res) => {
  try {
    const wards = await Ward.find({ isActive: true });
    let totalBeds = 0, occupied = 0, available = 0, cleaning = 0;
    wards.forEach(w => {
      totalBeds += w.totalBeds;
      occupied += w.occupiedBeds;
      available += w.availableBeds;
      cleaning += w.cleaningBeds;
    });
    res.json({ success: true, data: { totalBeds, occupied, available, cleaning, wardCount: wards.length } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
