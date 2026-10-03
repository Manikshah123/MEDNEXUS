const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: {
    type: String,
    enum: ['info', 'warning', 'error', 'success', 'medication', 'order', 'pharmacy', 'vital', 'admission', 'discharge', 'billing', 'system'],
    default: 'info'
  },
  priority: { type: String, enum: ['Low', 'Normal', 'High', 'Critical'], default: 'Normal' },
  targetRole: { type: String, default: '' },
  targetUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  patientId: { type: String, default: '' },
  module: { type: String, default: '' },
  actionUrl: { type: String, default: '' },
  isRead: { type: Boolean, default: false },
  readAt: { type: Date },
  readBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, {
  timestamps: true
});

notificationSchema.index({ targetRole: 1, isRead: 1 });
notificationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
