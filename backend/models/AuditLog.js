const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  action: { type: String, required: true },
  module: { type: String, required: true },
  description: { type: String, default: '' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userName: { type: String, default: '' },
  userRole: { type: String, default: '' },
  patientId: { type: String, default: '' },
  entityId: { type: String, default: '' },
  entityType: { type: String, default: '' },
  changes: { type: mongoose.Schema.Types.Mixed, default: {} },
  ipAddress: { type: String, default: '' },
  userAgent: { type: String, default: '' }
}, {
  timestamps: true
});

auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ module: 1 });
auditLogSchema.index({ patientId: 1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
