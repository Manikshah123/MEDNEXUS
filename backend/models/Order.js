const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  patientId: { type: String, required: true },
  patientName: { type: String, default: '' },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctorName: { type: String, default: '' },
  category: {
    type: String,
    enum: ['Medication', 'Injection', 'IV Fluid', 'Lab Test', 'Imaging', 'Procedure', 'Diet', 'Monitoring', 'Nursing Instruction', 'Other'],
    required: true
  },
  // Medication specific fields
  medicineName: { type: String, default: '' },
  dosage: { type: String, default: '' },
  route: { type: String, enum: ['Oral', 'IV', 'IM', 'SC', 'Topical', 'Inhaled', 'Rectal', 'Sublingual', 'Other', ''], default: '' },
  frequency: { type: String, default: '' },
  duration: { type: String, default: '' },
  startDate: { type: Date },
  endDate: { type: Date },
  administrationTimes: [{ type: String }],
  // General fields
  instruction: { type: String, default: '' },
  specialInstructions: { type: String, default: '' },
  priority: { type: String, enum: ['Normal', 'Urgent', 'Stat'], default: 'Normal' },
  status: {
    type: String,
    enum: ['Ordered', 'Acknowledged', 'In Progress', 'Completed', 'Cancelled', 'Discontinued'],
    default: 'Ordered'
  },
  // Ward info
  ward: { type: String, default: '' },
  room: { type: String, default: '' },
  bed: { type: String, default: '' },
  // Tracking
  orderedAt: { type: Date, default: Date.now },
  acknowledgedBy: { type: String, default: '' },
  acknowledgedAt: { type: Date },
  completedBy: { type: String, default: '' },
  completedAt: { type: Date },
  cancelledReason: { type: String, default: '' },
  // Administration records
  administrations: [{
    administeredBy: { type: String, default: '' },
    administeredByRole: { type: String, default: '' },
    administeredAt: { type: Date, default: Date.now },
    dose: { type: String, default: '' },
    notes: { type: String, default: '' },
    status: { type: String, enum: ['Administered', 'Skipped', 'Refused', 'Held'], default: 'Administered' }
  }]
}, {
  timestamps: true
});

orderSchema.index({ patientId: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ category: 1 });

module.exports = mongoose.model('Order', orderSchema);
