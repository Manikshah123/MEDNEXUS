const mongoose = require('mongoose');

const vitalSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  patientId: { type: String, required: true },
  heartRate: { type: Number, default: 0 },
  systolicBP: { type: Number, default: 0 },
  diastolicBP: { type: Number, default: 0 },
  spO2: { type: Number, default: 0 },
  temperature: { type: Number, default: 0 },
  respiratoryRate: { type: Number, default: 0 },
  bloodSugar: { type: Number, default: 0 },
  weight: { type: Number, default: 0 },
  notes: { type: String, default: '' },
  recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  recordedByName: { type: String, default: '' },
  isAbnormal: { type: Boolean, default: false },
  alerts: [{ type: String }]
}, {
  timestamps: true
});

// Check for abnormal values
vitalSchema.pre('save', function(next) {
  const alerts = [];
  if (this.heartRate > 100 || this.heartRate < 60) alerts.push('Heart rate abnormal');
  if (this.systolicBP > 140 || this.systolicBP < 90) alerts.push('Blood pressure abnormal');
  if (this.spO2 < 95) alerts.push('SpO2 low');
  if (this.temperature > 38.5 || this.temperature < 36) alerts.push('Temperature abnormal');
  if (this.respiratoryRate > 20 || this.respiratoryRate < 12) alerts.push('Respiratory rate abnormal');
  this.alerts = alerts;
  this.isAbnormal = alerts.length > 0;
  next();
});

vitalSchema.index({ patientId: 1 });
vitalSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Vital', vitalSchema);
