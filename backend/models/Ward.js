const mongoose = require('mongoose');

const bedSchema = new mongoose.Schema({
  bedId: { type: String, required: true },
  bedNumber: { type: String, required: true },
  status: {
    type: String,
    enum: ['Available', 'Occupied', 'Cleaning', 'Reserved', 'Maintenance'],
    default: 'Available'
  },
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' },
  patientId: { type: String, default: '' },
  patientName: { type: String, default: '' }
});

const roomSchema = new mongoose.Schema({
  roomNumber: { type: String, required: true },
  roomType: { type: String, enum: ['General', 'Semi-Private', 'Private', 'ICU', 'Emergency'], default: 'General' },
  beds: [bedSchema]
});

const wardSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  code: { type: String, required: true, unique: true, uppercase: true },
  type: {
    type: String,
    enum: ['Emergency', 'ICU', 'General', 'Private', 'Pediatric', 'Maternity', 'Surgical', 'Cardiology', 'Orthopedics'],
    required: true
  },
  floor: { type: Number, default: 1 },
  totalBeds: { type: Number, default: 0 },
  occupiedBeds: { type: Number, default: 0 },
  availableBeds: { type: Number, default: 0 },
  cleaningBeds: { type: Number, default: 0 },
  reservedBeds: { type: Number, default: 0 },
  rooms: [roomSchema],
  headNurse: { type: String, default: '' },
  contactExtension: { type: String, default: '' },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

// Update bed counts
wardSchema.methods.updateBedCounts = function() {
  let total = 0, occupied = 0, available = 0, cleaning = 0, reserved = 0;
  this.rooms.forEach(room => {
    room.beds.forEach(bed => {
      total++;
      switch(bed.status) {
        case 'Occupied': occupied++; break;
        case 'Available': available++; break;
        case 'Cleaning': cleaning++; break;
        case 'Reserved': reserved++; break;
        default: break;
      }
    });
  });
  this.totalBeds = total;
  this.occupiedBeds = occupied;
  this.availableBeds = available;
  this.cleaningBeds = cleaning;
  this.reservedBeds = reserved;
  return this;
};

module.exports = mongoose.model('Ward', wardSchema);
