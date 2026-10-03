const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true, uppercase: true },
  genericName: { type: String, default: '' },
  category: {
    type: String,
    enum: ['Antibiotic', 'Analgesic', 'Antipyretic', 'Antihypertensive', 'Antidiabetic', 'Anticoagulant', 'Antacid', 'Steroid', 'Vitamin', 'IV Fluid', 'Injection', 'Sedative', 'Bronchodilator', 'Cardiac', 'Diuretic', 'Other'],
    default: 'Other'
  },
  form: {
    type: String,
    enum: ['Tablet', 'Capsule', 'Syrup', 'Injection', 'IV', 'Cream', 'Ointment', 'Drops', 'Inhaler', 'Powder', 'Other'],
    default: 'Tablet'
  },
  strength: { type: String, default: '' },
  manufacturer: { type: String, default: '' },
  batchNumber: { type: String, default: '' },
  expiryDate: { type: Date },
  stock: { type: Number, default: 0 },
  minStock: { type: Number, default: 10 },
  unitPrice: { type: Number, default: 0 },
  sellingPrice: { type: Number, default: 0 },
  supplier: { type: String, default: '' },
  location: { type: String, default: '' },
  requiresPrescription: { type: Boolean, default: true },
  isControlled: { type: Boolean, default: false },
  status: {
    type: String,
    enum: ['In Stock', 'Low Stock', 'Out of Stock', 'Expired', 'Discontinued'],
    default: 'In Stock'
  },
  stockHistory: [{
    action: { type: String, enum: ['Added', 'Dispensed', 'Adjusted', 'Expired', 'Returned'] },
    quantity: { type: Number },
    performedBy: { type: String, default: '' },
    date: { type: Date, default: Date.now },
    notes: { type: String, default: '' }
  }]
}, {
  timestamps: true
});

// Update status based on stock
medicineSchema.pre('save', function(next) {
  if (this.expiryDate && new Date(this.expiryDate) < new Date()) {
    this.status = 'Expired';
  } else if (this.stock === 0) {
    this.status = 'Out of Stock';
  } else if (this.stock <= this.minStock) {
    this.status = 'Low Stock';
  } else {
    this.status = 'In Stock';
  }
  next();
});

medicineSchema.index({ name: 'text', genericName: 'text', code: 'text' });

module.exports = mongoose.model('Medicine', medicineSchema);
