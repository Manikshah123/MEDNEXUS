const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  patientId: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  // Personal Information
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  dateOfBirth: { type: Date, required: true },
  age: { type: Number },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
  bloodGroup: { type: String, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'], default: 'Unknown' },
  phone: { type: String, required: true },
  email: { type: String, default: '' },
  address: {
    street: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    zipCode: { type: String, default: '' },
    country: { type: String, default: 'India' }
  },
  // Emergency Contact
  emergencyContact: {
    name: { type: String, default: '' },
    relationship: { type: String, default: '' },
    phone: { type: String, default: '' }
  },
  // Identification
  govIdType: { type: String, enum: ['Aadhaar', 'PAN', 'Passport', 'Driving License', 'Voter ID', 'Other'], default: 'Aadhaar' },
  govIdNumber: { type: String, default: '' },
  // Medical Information
  existingConditions: [{ type: String }],
  allergies: [{ type: String }],
  previousHistory: { type: String, default: '' },
  currentMedications: [{ type: String }],
  // Insurance
  insuranceProvider: { type: String, default: '' },
  insurancePolicyNumber: { type: String, default: '' },
  // Status
  status: {
    type: String,
    enum: ['Registered', 'Admitted', 'Discharged', 'Transferred', 'Deceased'],
    default: 'Registered'
  },
  // Current Location
  currentWard: { type: mongoose.Schema.Types.ObjectId, ref: 'Ward' },
  currentBed: { type: String, default: '' },
  currentRoom: { type: String, default: '' },
  // Assigned Doctor
  assignedDoctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  // Registration
  registeredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  registrationDate: { type: Date, default: Date.now },
  // Timeline events
  timeline: [{
    event: { type: String, required: true },
    description: { type: String, default: '' },
    staffMember: { type: String, default: '' },
    staffRole: { type: String, default: '' },
    status: { type: String, default: 'Completed' },
    date: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

// Auto-calculate age from DOB
patientSchema.pre('save', function(next) {
  if (this.dateOfBirth) {
    const today = new Date();
    const birth = new Date(this.dateOfBirth);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    this.age = age;
  }
  next();
});

// Virtual for full name
patientSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

patientSchema.set('toJSON', { virtuals: true });
patientSchema.set('toObject', { virtuals: true });

// Index for search
patientSchema.index({ patientId: 1 });
patientSchema.index({ firstName: 'text', lastName: 'text', phone: 'text' });

module.exports = mongoose.model('Patient', patientSchema);
