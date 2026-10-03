const mongoose = require('mongoose');

const billingItemSchema = new mongoose.Schema({
  description: { type: String, required: true },
  category: {
    type: String,
    enum: ['Registration', 'Consultation', 'Admission', 'Room', 'Bed', 'Medicine', 'Lab', 'Procedure', 'Doctor', 'Nursing', 'Other'],
    default: 'Other'
  },
  quantity: { type: Number, default: 1 },
  unitPrice: { type: Number, default: 0 },
  totalPrice: { type: Number, default: 0 },
  date: { type: Date, default: Date.now },
  orderId: { type: String, default: '' },
  notes: { type: String, default: '' }
});

const paymentSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  method: { type: String, enum: ['Cash', 'Card', 'UPI', 'Insurance', 'Bank Transfer', 'Other'], default: 'Cash' },
  reference: { type: String, default: '' },
  date: { type: Date, default: Date.now },
  receivedBy: { type: String, default: '' }
});

const billingSchema = new mongoose.Schema({
  invoiceId: { type: String, required: true, unique: true },
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  patientId: { type: String, required: true },
  patientName: { type: String, default: '' },
  admission: { type: mongoose.Schema.Types.ObjectId, ref: 'Admission' },
  admissionId: { type: String, default: '' },
  items: [billingItemSchema],
  subtotal: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  discountPercent: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  taxPercent: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
  paid: { type: Number, default: 0 },
  pending: { type: Number, default: 0 },
  payments: [paymentSchema],
  status: {
    type: String,
    enum: ['Draft', 'Pending', 'Partially Paid', 'Paid', 'Cancelled', 'Refunded'],
    default: 'Draft'
  },
  generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  generatedByName: { type: String, default: '' },
  notes: { type: String, default: '' },
  dueDate: { type: Date }
}, {
  timestamps: true
});

// Calculate totals
billingSchema.methods.calculateTotals = function() {
  this.subtotal = this.items.reduce((sum, item) => sum + item.totalPrice, 0);
  const discountAmount = this.discountPercent > 0 ? (this.subtotal * this.discountPercent / 100) : this.discount;
  this.discount = discountAmount;
  const afterDiscount = this.subtotal - discountAmount;
  this.tax = this.taxPercent > 0 ? (afterDiscount * this.taxPercent / 100) : this.tax;
  this.total = afterDiscount + this.tax;
  this.paid = this.payments.reduce((sum, p) => sum + p.amount, 0);
  this.pending = this.total - this.paid;

  if (this.pending <= 0) this.status = 'Paid';
  else if (this.paid > 0) this.status = 'Partially Paid';
  else this.status = 'Pending';

  return this;
};

billingSchema.index({ patientId: 1 });
billingSchema.index({ invoiceId: 1 });

module.exports = mongoose.model('Billing', billingSchema);
