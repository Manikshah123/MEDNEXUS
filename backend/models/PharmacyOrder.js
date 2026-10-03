const mongoose = require('mongoose');

const pharmacyOrderSchema = new mongoose.Schema({
  pharmacyOrderId: { type: String, required: true, unique: true },
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  orderId: { type: String, required: true },
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  patientId: { type: String, required: true },
  patientName: { type: String, default: '' },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  doctorName: { type: String, default: '' },
  medicineName: { type: String, required: true },
  dosage: { type: String, default: '' },
  route: { type: String, default: '' },
  frequency: { type: String, default: '' },
  quantity: { type: Number, default: 1 },
  duration: { type: String, default: '' },
  specialInstructions: { type: String, default: '' },
  ward: { type: String, default: '' },
  room: { type: String, default: '' },
  bed: { type: String, default: '' },
  status: {
    type: String,
    enum: ['New', 'Accepted', 'Preparing', 'Ready', 'Sent to Ward', 'Dispensed', 'Cancelled'],
    default: 'New'
  },
  priority: { type: String, enum: ['Normal', 'Urgent', 'Stat'], default: 'Normal' },
  acceptedBy: { type: String, default: '' },
  acceptedAt: { type: Date },
  preparedBy: { type: String, default: '' },
  preparedAt: { type: Date },
  dispensedBy: { type: String, default: '' },
  dispensedAt: { type: Date },
  cancelReason: { type: String, default: '' },
  cancelledBy: { type: String, default: '' },
  billingAdded: { type: Boolean, default: false },
  unitPrice: { type: Number, default: 0 },
  totalPrice: { type: Number, default: 0 }
}, {
  timestamps: true
});

pharmacyOrderSchema.index({ patientId: 1 });
pharmacyOrderSchema.index({ status: 1 });

module.exports = mongoose.model('PharmacyOrder', pharmacyOrderSchema);
