const mongoose = require('mongoose');

const admissionSchema = new mongoose.Schema({
  admissionId: { type: String, required: true, unique: true },
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  patientId: { type: String, required: true },
  admissionDate: { type: Date, default: Date.now },
  admissionTime: { type: String, default: '' },
  diagnosis: { type: String, required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctorName: { type: String, default: '' },
  department: { type: String, default: '' },
  priority: { type: String, enum: ['Normal', 'Urgent', 'Emergency'], default: 'Normal' },
  ward: { type: mongoose.Schema.Types.ObjectId, ref: 'Ward' },
  wardName: { type: String, default: '' },
  room: { type: String, default: '' },
  bed: { type: String, default: '' },
  expectedStay: { type: Number, default: 1 },
  specialInstructions: { type: String, default: '' },
  status: {
    type: String,
    enum: ['Active', 'Discharged', 'Transferred', 'Cancelled'],
    default: 'Active'
  },
  dischargeDate: { type: Date },
  dischargeSummary: { type: String, default: '' },
  dischargeDoctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  admittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, {
  timestamps: true
});

admissionSchema.index({ patientId: 1 });
admissionSchema.index({ status: 1 });

module.exports = mongoose.model('Admission', admissionSchema);
