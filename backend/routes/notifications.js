const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');

// GET /api/notifications
router.get('/', async (req, res) => {
  try {
    const { role, isRead, limit = 50 } = req.query;
    let query = {};
    if (role) query.$or = [{ targetRole: role }, { targetRole: '' }];
    if (isRead !== undefined) query.isRead = isRead === 'true';

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    const unreadCount = await Notification.countDocuments({ ...query, isRead: false });
    res.json({ success: true, data: notifications, unreadCount });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/notifications/:id/read
router.put('/:id/read', async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(req.params.id, {
      isRead: true,
      readAt: new Date()
    }, { new: true });
    res.json({ success: true, data: notification });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// PUT /api/notifications/read-all
router.put('/read-all', async (req, res) => {
  try {
    const { role } = req.body;
    const query = role ? { $or: [{ targetRole: role }, { targetRole: '' }], isRead: false } : { isRead: false };
    await Notification.updateMany(query, { isRead: true, readAt: new Date() });
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;
