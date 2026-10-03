require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Patient = require('../models/Patient');
const Ward = require('../models/Ward');
const Medicine = require('../models/Medicine');
const Admission = require('../models/Admission');
const Order = require('../models/Order');
const PharmacyOrder = require('../models/PharmacyOrder');
const Billing = require('../models/Billing');
const Vital = require('../models/Vital');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear all data
    await Promise.all([
      User.deleteMany({}), Patient.deleteMany({}), Ward.deleteMany({}),
      Medicine.deleteMany({}), Admission.deleteMany({}), Order.deleteMany({}),
      PharmacyOrder.deleteMany({}), Billing.deleteMany({}), Vital.deleteMany({}),
      Notification.deleteMany({}), AuditLog.deleteMany({})
    ]);
    console.log('Cleared existing data');

    // ============ USERS ============
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    const users = await User.insertMany([
      { employeeId: 'ADM-001', name: 'Dr. Rajesh Kapoor', email: 'admin@mednexus.in', password: hashedPassword, role: 'admin', department: 'Administration', phone: '9876543210' },
      { employeeId: 'DOC-001', name: 'Dr. Anand Sharma', email: 'anand.sharma@mednexus.in', password: hashedPassword, role: 'doctor', department: 'Emergency Medicine', specialization: 'Emergency Medicine', phone: '9876543211' },
      { employeeId: 'DOC-002', name: 'Dr. Priya Mehta', email: 'priya.mehta@mednexus.in', password: hashedPassword, role: 'doctor', department: 'Internal Medicine', specialization: 'Internal Medicine', phone: '9876543212' },
      { employeeId: 'DOC-003', name: 'Dr. Vikram Singh', email: 'vikram.singh@mednexus.in', password: hashedPassword, role: 'doctor', department: 'Cardiology', specialization: 'Cardiology', phone: '9876543213' },
      { employeeId: 'DOC-004', name: 'Dr. Neha Gupta', email: 'neha.gupta@mednexus.in', password: hashedPassword, role: 'doctor', department: 'Pediatrics', specialization: 'Pediatrics', phone: '9876543214' },
      { employeeId: 'DOC-005', name: 'Dr. Arun Patel', email: 'arun.patel@mednexus.in', password: hashedPassword, role: 'doctor', department: 'Orthopedics', specialization: 'Orthopedics', phone: '9876543215' },
      { employeeId: 'DOC-006', name: 'Dr. Sunita Reddy', email: 'sunita.reddy@mednexus.in', password: hashedPassword, role: 'doctor', department: 'Gynecology', specialization: 'Obstetrics & Gynecology', phone: '9876543216' },
      { employeeId: 'DOC-007', name: 'Dr. Mahesh Kumar', email: 'mahesh.kumar@mednexus.in', password: hashedPassword, role: 'doctor', department: 'Surgery', specialization: 'General Surgery', phone: '9876543217' },
      { employeeId: 'DOC-008', name: 'Dr. Kavita Joshi', email: 'kavita.joshi@mednexus.in', password: hashedPassword, role: 'doctor', department: 'Neurology', specialization: 'Neurology', phone: '9876543218' },
      { employeeId: 'DOC-009', name: 'Dr. Ramesh Iyer', email: 'ramesh.iyer@mednexus.in', password: hashedPassword, role: 'doctor', department: 'Pulmonology', specialization: 'Pulmonology', phone: '9876543219' },
      { employeeId: 'DOC-010', name: 'Dr. Deepa Nair', email: 'deepa.nair@mednexus.in', password: hashedPassword, role: 'doctor', department: 'Dermatology', specialization: 'Dermatology', phone: '9876543220' },
      { employeeId: 'NUR-001', name: 'Anita Verma', email: 'anita.verma@mednexus.in', password: hashedPassword, role: 'nurse', department: 'Emergency', phone: '9876543221' },
      { employeeId: 'NUR-002', name: 'Suman Devi', email: 'suman.devi@mednexus.in', password: hashedPassword, role: 'nurse', department: 'ICU', phone: '9876543222' },
      { employeeId: 'NUR-003', name: 'Rekha Kumari', email: 'rekha.kumari@mednexus.in', password: hashedPassword, role: 'nurse', department: 'General Ward', phone: '9876543223' },
      { employeeId: 'REC-001', name: 'Pooja Sharma', email: 'reception@mednexus.in', password: hashedPassword, role: 'receptionist', department: 'Front Desk', phone: '9876543224' },
      { employeeId: 'REC-002', name: 'Amit Tiwari', email: 'reception2@mednexus.in', password: hashedPassword, role: 'receptionist', department: 'Front Desk', phone: '9876543225' },
      { employeeId: 'PHR-001', name: 'Suresh Pandey', email: 'pharmacy@mednexus.in', password: hashedPassword, role: 'pharmacist', department: 'Pharmacy', phone: '9876543226' },
      { employeeId: 'PHR-002', name: 'Meena Agarwal', email: 'pharmacy2@mednexus.in', password: hashedPassword, role: 'pharmacist', department: 'Pharmacy', phone: '9876543227' },
      { employeeId: 'BIL-001', name: 'Ravi Shankar', email: 'billing@mednexus.in', password: hashedPassword, role: 'billing', department: 'Billing', phone: '9876543228' },
      { employeeId: 'BIL-002', name: 'Geeta Mishra', email: 'billing2@mednexus.in', password: hashedPassword, role: 'billing', department: 'Billing', phone: '9876543229' },
    ]);
    console.log(`Created ${users.length} users`);

    const doctors = users.filter(u => u.role === 'doctor');

    // ============ WARDS ============
    const wardData = [
      {
        name: 'Emergency Ward', code: 'EMR', type: 'Emergency', floor: 1,
        rooms: [
          { roomNumber: 'E-01', roomType: 'Emergency', beds: [
            { bedId: 'E-01-A', bedNumber: 'E-01-A', status: 'Available' },
            { bedId: 'E-01-B', bedNumber: 'E-01-B', status: 'Available' },
            { bedId: 'E-01-C', bedNumber: 'E-01-C', status: 'Available' },
            { bedId: 'E-01-D', bedNumber: 'E-01-D', status: 'Available' },
          ]},
          { roomNumber: 'E-02', roomType: 'Emergency', beds: [
            { bedId: 'E-02-A', bedNumber: 'E-02-A', status: 'Available' },
            { bedId: 'E-02-B', bedNumber: 'E-02-B', status: 'Available' },
            { bedId: 'E-02-C', bedNumber: 'E-02-C', status: 'Available' },
            { bedId: 'E-02-D', bedNumber: 'E-02-D', status: 'Available' },
          ]},
          { roomNumber: 'E-03', roomType: 'Emergency', beds: [
            { bedId: 'E-03-A', bedNumber: 'E-03-A', status: 'Available' },
            { bedId: 'E-03-B', bedNumber: 'E-03-B', status: 'Available' },
            { bedId: 'E-03-C', bedNumber: 'E-03-C', status: 'Cleaning' },
            { bedId: 'E-03-D', bedNumber: 'E-03-D', status: 'Available' },
          ]},
          { roomNumber: 'E-04', roomType: 'Emergency', beds: [
            { bedId: 'E-04-A', bedNumber: 'E-04-A', status: 'Available' },
            { bedId: 'E-04-B', bedNumber: 'E-04-B', status: 'Available' },
            { bedId: 'E-04-C', bedNumber: 'E-04-C', status: 'Available' },
            { bedId: 'E-04-D', bedNumber: 'E-04-D', status: 'Available' },
          ]}
        ],
        headNurse: 'Anita Verma', contactExtension: '1001'
      },
      {
        name: 'ICU', code: 'ICU', type: 'ICU', floor: 2,
        rooms: [
          { roomNumber: 'ICU-01', roomType: 'ICU', beds: [
            { bedId: 'ICU-01-A', bedNumber: 'ICU-01-A', status: 'Available' },
            { bedId: 'ICU-01-B', bedNumber: 'ICU-01-B', status: 'Available' },
          ]},
          { roomNumber: 'ICU-02', roomType: 'ICU', beds: [
            { bedId: 'ICU-02-A', bedNumber: 'ICU-02-A', status: 'Available' },
            { bedId: 'ICU-02-B', bedNumber: 'ICU-02-B', status: 'Available' },
          ]},
          { roomNumber: 'ICU-03', roomType: 'ICU', beds: [
            { bedId: 'ICU-03-A', bedNumber: 'ICU-03-A', status: 'Available' },
            { bedId: 'ICU-03-B', bedNumber: 'ICU-03-B', status: 'Available' },
          ]}
        ],
        headNurse: 'Suman Devi', contactExtension: '1002'
      },
      {
        name: 'General Ward', code: 'GEN', type: 'General', floor: 3,
        rooms: [
          { roomNumber: 'G-01', roomType: 'General', beds: [
            { bedId: 'G-01-A', bedNumber: 'G-01-A', status: 'Available' },
            { bedId: 'G-01-B', bedNumber: 'G-01-B', status: 'Available' },
            { bedId: 'G-01-C', bedNumber: 'G-01-C', status: 'Available' },
            { bedId: 'G-01-D', bedNumber: 'G-01-D', status: 'Available' },
            { bedId: 'G-01-E', bedNumber: 'G-01-E', status: 'Available' },
            { bedId: 'G-01-F', bedNumber: 'G-01-F', status: 'Available' },
          ]},
          { roomNumber: 'G-02', roomType: 'General', beds: [
            { bedId: 'G-02-A', bedNumber: 'G-02-A', status: 'Available' },
            { bedId: 'G-02-B', bedNumber: 'G-02-B', status: 'Available' },
            { bedId: 'G-02-C', bedNumber: 'G-02-C', status: 'Available' },
            { bedId: 'G-02-D', bedNumber: 'G-02-D', status: 'Available' },
            { bedId: 'G-02-E', bedNumber: 'G-02-E', status: 'Available' },
            { bedId: 'G-02-F', bedNumber: 'G-02-F', status: 'Available' },
          ]},
          { roomNumber: 'G-03', roomType: 'General', beds: [
            { bedId: 'G-03-A', bedNumber: 'G-03-A', status: 'Available' },
            { bedId: 'G-03-B', bedNumber: 'G-03-B', status: 'Available' },
            { bedId: 'G-03-C', bedNumber: 'G-03-C', status: 'Cleaning' },
            { bedId: 'G-03-D', bedNumber: 'G-03-D', status: 'Available' },
          ]}
        ],
        headNurse: 'Rekha Kumari', contactExtension: '1003'
      },
      {
        name: 'Private Ward', code: 'PVT', type: 'Private', floor: 4,
        rooms: [
          { roomNumber: 'P-01', roomType: 'Private', beds: [{ bedId: 'P-01-A', bedNumber: 'P-01-A', status: 'Available' }] },
          { roomNumber: 'P-02', roomType: 'Private', beds: [{ bedId: 'P-02-A', bedNumber: 'P-02-A', status: 'Available' }] },
          { roomNumber: 'P-03', roomType: 'Private', beds: [{ bedId: 'P-03-A', bedNumber: 'P-03-A', status: 'Available' }] },
          { roomNumber: 'P-04', roomType: 'Private', beds: [{ bedId: 'P-04-A', bedNumber: 'P-04-A', status: 'Available' }] },
          { roomNumber: 'P-05', roomType: 'Private', beds: [{ bedId: 'P-05-A', bedNumber: 'P-05-A', status: 'Available' }] },
          { roomNumber: 'P-06', roomType: 'Private', beds: [{ bedId: 'P-06-A', bedNumber: 'P-06-A', status: 'Available' }] },
        ],
        contactExtension: '1004'
      },
      {
        name: 'Pediatric Ward', code: 'PED', type: 'Pediatric', floor: 3,
        rooms: [
          { roomNumber: 'PD-01', roomType: 'General', beds: [
            { bedId: 'PD-01-A', bedNumber: 'PD-01-A', status: 'Available' },
            { bedId: 'PD-01-B', bedNumber: 'PD-01-B', status: 'Available' },
            { bedId: 'PD-01-C', bedNumber: 'PD-01-C', status: 'Available' },
            { bedId: 'PD-01-D', bedNumber: 'PD-01-D', status: 'Available' },
          ]},
          { roomNumber: 'PD-02', roomType: 'General', beds: [
            { bedId: 'PD-02-A', bedNumber: 'PD-02-A', status: 'Available' },
            { bedId: 'PD-02-B', bedNumber: 'PD-02-B', status: 'Available' },
            { bedId: 'PD-02-C', bedNumber: 'PD-02-C', status: 'Available' },
            { bedId: 'PD-02-D', bedNumber: 'PD-02-D', status: 'Available' },
          ]}
        ],
        contactExtension: '1005'
      },
      {
        name: 'Maternity Ward', code: 'MAT', type: 'Maternity', floor: 3,
        rooms: [
          { roomNumber: 'M-01', roomType: 'Semi-Private', beds: [
            { bedId: 'M-01-A', bedNumber: 'M-01-A', status: 'Available' },
            { bedId: 'M-01-B', bedNumber: 'M-01-B', status: 'Available' },
          ]},
          { roomNumber: 'M-02', roomType: 'Semi-Private', beds: [
            { bedId: 'M-02-A', bedNumber: 'M-02-A', status: 'Available' },
            { bedId: 'M-02-B', bedNumber: 'M-02-B', status: 'Available' },
          ]},
          { roomNumber: 'M-03', roomType: 'Private', beds: [
            { bedId: 'M-03-A', bedNumber: 'M-03-A', status: 'Available' },
          ]},
          { roomNumber: 'M-04', roomType: 'Private', beds: [
            { bedId: 'M-04-A', bedNumber: 'M-04-A', status: 'Available' },
          ]}
        ],
        contactExtension: '1006'
      },
      {
        name: 'Surgical Ward', code: 'SUR', type: 'Surgical', floor: 2,
        rooms: [
          { roomNumber: 'S-01', roomType: 'General', beds: [
            { bedId: 'S-01-A', bedNumber: 'S-01-A', status: 'Available' },
            { bedId: 'S-01-B', bedNumber: 'S-01-B', status: 'Available' },
            { bedId: 'S-01-C', bedNumber: 'S-01-C', status: 'Available' },
            { bedId: 'S-01-D', bedNumber: 'S-01-D', status: 'Available' },
          ]},
          { roomNumber: 'S-02', roomType: 'General', beds: [
            { bedId: 'S-02-A', bedNumber: 'S-02-A', status: 'Available' },
            { bedId: 'S-02-B', bedNumber: 'S-02-B', status: 'Available' },
            { bedId: 'S-02-C', bedNumber: 'S-02-C', status: 'Available' },
            { bedId: 'S-02-D', bedNumber: 'S-02-D', status: 'Available' },
          ]}
        ],
        contactExtension: '1007'
      },
      {
        name: 'Cardiology Ward', code: 'CAR', type: 'Cardiology', floor: 4,
        rooms: [
          { roomNumber: 'C-01', roomType: 'Semi-Private', beds: [
            { bedId: 'C-01-A', bedNumber: 'C-01-A', status: 'Available' },
            { bedId: 'C-01-B', bedNumber: 'C-01-B', status: 'Available' },
          ]},
          { roomNumber: 'C-02', roomType: 'Semi-Private', beds: [
            { bedId: 'C-02-A', bedNumber: 'C-02-A', status: 'Available' },
            { bedId: 'C-02-B', bedNumber: 'C-02-B', status: 'Available' },
          ]},
          { roomNumber: 'C-03', roomType: 'Private', beds: [
            { bedId: 'C-03-A', bedNumber: 'C-03-A', status: 'Available' },
          ]}
        ],
        contactExtension: '1008'
      },
      {
        name: 'Orthopedics Ward', code: 'ORT', type: 'Orthopedics', floor: 4,
        rooms: [
          { roomNumber: 'O-01', roomType: 'General', beds: [
            { bedId: 'O-01-A', bedNumber: 'O-01-A', status: 'Available' },
            { bedId: 'O-01-B', bedNumber: 'O-01-B', status: 'Available' },
            { bedId: 'O-01-C', bedNumber: 'O-01-C', status: 'Available' },
            { bedId: 'O-01-D', bedNumber: 'O-01-D', status: 'Available' },
          ]},
          { roomNumber: 'O-02', roomType: 'General', beds: [
            { bedId: 'O-02-A', bedNumber: 'O-02-A', status: 'Available' },
            { bedId: 'O-02-B', bedNumber: 'O-02-B', status: 'Available' },
            { bedId: 'O-02-C', bedNumber: 'O-02-C', status: 'Available' },
            { bedId: 'O-02-D', bedNumber: 'O-02-D', status: 'Available' },
          ]}
        ],
        contactExtension: '1009'
      }
    ];

    const wards = [];
    for (const wd of wardData) {
      const ward = new Ward(wd);
      ward.updateBedCounts();
      await ward.save();
      wards.push(ward);
    }
    console.log(`Created ${wards.length} wards`);

    // ============ MEDICINES ============
    const medicineData = [
      { name: 'Ceftriaxone', code: 'MED-001', genericName: 'Ceftriaxone Sodium', category: 'Antibiotic', form: 'Injection', strength: '1g', manufacturer: 'Cipla Ltd', batchNumber: 'BAT-2026-001', expiryDate: new Date('2027-12-31'), stock: 500, minStock: 50, unitPrice: 120, sellingPrice: 180, supplier: 'PharmaCorp India' },
      { name: 'Paracetamol 500mg', code: 'MED-002', genericName: 'Acetaminophen', category: 'Antipyretic', form: 'Tablet', strength: '500mg', manufacturer: 'Sun Pharma', batchNumber: 'BAT-2026-002', expiryDate: new Date('2028-06-30'), stock: 2000, minStock: 200, unitPrice: 2, sellingPrice: 5, supplier: 'MediSupply Co' },
      { name: 'Amoxicillin 500mg', code: 'MED-003', genericName: 'Amoxicillin', category: 'Antibiotic', form: 'Capsule', strength: '500mg', manufacturer: 'Dr. Reddy\'s', batchNumber: 'BAT-2026-003', expiryDate: new Date('2027-09-30'), stock: 800, minStock: 100, unitPrice: 8, sellingPrice: 15, supplier: 'PharmaCorp India' },
      { name: 'Metformin 500mg', code: 'MED-004', genericName: 'Metformin HCL', category: 'Antidiabetic', form: 'Tablet', strength: '500mg', manufacturer: 'Lupin Ltd', batchNumber: 'BAT-2026-004', expiryDate: new Date('2028-03-31'), stock: 1500, minStock: 150, unitPrice: 3, sellingPrice: 7, supplier: 'MediSupply Co' },
      { name: 'Amlodipine 5mg', code: 'MED-005', genericName: 'Amlodipine Besylate', category: 'Antihypertensive', form: 'Tablet', strength: '5mg', manufacturer: 'Cipla Ltd', batchNumber: 'BAT-2026-005', expiryDate: new Date('2028-01-31'), stock: 1200, minStock: 100, unitPrice: 4, sellingPrice: 8, supplier: 'PharmaCorp India' },
      { name: 'Omeprazole 20mg', code: 'MED-006', genericName: 'Omeprazole', category: 'Antacid', form: 'Capsule', strength: '20mg', manufacturer: 'Sun Pharma', batchNumber: 'BAT-2026-006', expiryDate: new Date('2027-11-30'), stock: 900, minStock: 100, unitPrice: 5, sellingPrice: 10, supplier: 'MediSupply Co' },
      { name: 'Aspirin 75mg', code: 'MED-007', genericName: 'Acetylsalicylic Acid', category: 'Anticoagulant', form: 'Tablet', strength: '75mg', manufacturer: 'Bayer India', batchNumber: 'BAT-2026-007', expiryDate: new Date('2028-08-31'), stock: 1800, minStock: 200, unitPrice: 2, sellingPrice: 4, supplier: 'PharmaCorp India' },
      { name: 'Dexamethasone 4mg', code: 'MED-008', genericName: 'Dexamethasone', category: 'Steroid', form: 'Injection', strength: '4mg/ml', manufacturer: 'Cadila Healthcare', batchNumber: 'BAT-2026-008', expiryDate: new Date('2027-07-31'), stock: 300, minStock: 30, unitPrice: 25, sellingPrice: 45, supplier: 'MediSupply Co' },
      { name: 'Normal Saline 500ml', code: 'MED-009', genericName: 'Sodium Chloride 0.9%', category: 'IV Fluid', form: 'IV', strength: '0.9%', manufacturer: 'Baxter India', batchNumber: 'BAT-2026-009', expiryDate: new Date('2028-12-31'), stock: 400, minStock: 50, unitPrice: 40, sellingPrice: 65, supplier: 'IV Solutions Ltd' },
      { name: 'Ringer Lactate 500ml', code: 'MED-010', genericName: 'Ringer\'s Lactate', category: 'IV Fluid', form: 'IV', strength: '500ml', manufacturer: 'Baxter India', batchNumber: 'BAT-2026-010', expiryDate: new Date('2028-10-31'), stock: 350, minStock: 50, unitPrice: 45, sellingPrice: 70, supplier: 'IV Solutions Ltd' },
      { name: 'Insulin Regular', code: 'MED-011', genericName: 'Insulin Human', category: 'Antidiabetic', form: 'Injection', strength: '100 IU/ml', manufacturer: 'Novo Nordisk', batchNumber: 'BAT-2026-011', expiryDate: new Date('2027-06-30'), stock: 150, minStock: 20, unitPrice: 350, sellingPrice: 500, supplier: 'DiabCare India' },
      { name: 'Morphine 10mg', code: 'MED-012', genericName: 'Morphine Sulfate', category: 'Analgesic', form: 'Injection', strength: '10mg/ml', manufacturer: 'Cipla Ltd', batchNumber: 'BAT-2026-012', expiryDate: new Date('2027-05-31'), stock: 100, minStock: 15, unitPrice: 80, sellingPrice: 120, supplier: 'PharmaCorp India', isControlled: true },
      { name: 'Diazepam 5mg', code: 'MED-013', genericName: 'Diazepam', category: 'Sedative', form: 'Tablet', strength: '5mg', manufacturer: 'Sun Pharma', batchNumber: 'BAT-2026-013', expiryDate: new Date('2028-02-28'), stock: 200, minStock: 30, unitPrice: 10, sellingPrice: 18, supplier: 'MediSupply Co', isControlled: true },
      { name: 'Furosemide 40mg', code: 'MED-014', genericName: 'Furosemide', category: 'Diuretic', form: 'Tablet', strength: '40mg', manufacturer: 'Lupin Ltd', batchNumber: 'BAT-2026-014', expiryDate: new Date('2028-04-30'), stock: 700, minStock: 80, unitPrice: 4, sellingPrice: 8, supplier: 'PharmaCorp India' },
      { name: 'Salbutamol Inhaler', code: 'MED-015', genericName: 'Salbutamol', category: 'Bronchodilator', form: 'Inhaler', strength: '100mcg', manufacturer: 'Cipla Ltd', batchNumber: 'BAT-2026-015', expiryDate: new Date('2028-09-30'), stock: 120, minStock: 15, unitPrice: 95, sellingPrice: 150, supplier: 'MediSupply Co' },
      { name: 'Ciprofloxacin 500mg', code: 'MED-016', genericName: 'Ciprofloxacin', category: 'Antibiotic', form: 'Tablet', strength: '500mg', manufacturer: 'Dr. Reddy\'s', batchNumber: 'BAT-2026-016', expiryDate: new Date('2027-08-31'), stock: 600, minStock: 60, unitPrice: 12, sellingPrice: 22, supplier: 'PharmaCorp India' },
      { name: 'Heparin 5000 IU', code: 'MED-017', genericName: 'Heparin Sodium', category: 'Anticoagulant', form: 'Injection', strength: '5000 IU/ml', manufacturer: 'Gland Pharma', batchNumber: 'BAT-2026-017', expiryDate: new Date('2027-10-31'), stock: 180, minStock: 20, unitPrice: 150, sellingPrice: 220, supplier: 'IV Solutions Ltd' },
      { name: 'Pantoprazole 40mg', code: 'MED-018', genericName: 'Pantoprazole', category: 'Antacid', form: 'Injection', strength: '40mg', manufacturer: 'Sun Pharma', batchNumber: 'BAT-2026-018', expiryDate: new Date('2027-12-31'), stock: 400, minStock: 40, unitPrice: 60, sellingPrice: 95, supplier: 'MediSupply Co' },
      { name: 'Ondansetron 4mg', code: 'MED-019', genericName: 'Ondansetron', category: 'Other', form: 'Injection', strength: '4mg/2ml', manufacturer: 'Cipla Ltd', batchNumber: 'BAT-2026-019', expiryDate: new Date('2028-05-31'), stock: 350, minStock: 35, unitPrice: 30, sellingPrice: 50, supplier: 'PharmaCorp India' },
      { name: 'Vitamin B Complex', code: 'MED-020', genericName: 'Multivitamin B', category: 'Vitamin', form: 'Tablet', strength: '—', manufacturer: 'Abbott India', batchNumber: 'BAT-2026-020', expiryDate: new Date('2028-11-30'), stock: 2500, minStock: 300, unitPrice: 1.5, sellingPrice: 3, supplier: 'MediSupply Co' },
      { name: 'Atorvastatin 10mg', code: 'MED-021', genericName: 'Atorvastatin Calcium', category: 'Cardiac', form: 'Tablet', strength: '10mg', manufacturer: 'Lupin Ltd', batchNumber: 'BAT-2026-021', expiryDate: new Date('2028-07-31'), stock: 1100, minStock: 100, unitPrice: 6, sellingPrice: 12, supplier: 'PharmaCorp India' },
      { name: 'Diclofenac 50mg', code: 'MED-022', genericName: 'Diclofenac Sodium', category: 'Analgesic', form: 'Tablet', strength: '50mg', manufacturer: 'Novartis India', batchNumber: 'BAT-2026-022', expiryDate: new Date('2028-01-31'), stock: 950, minStock: 100, unitPrice: 3, sellingPrice: 6, supplier: 'MediSupply Co' },
      { name: 'Tramadol 50mg', code: 'MED-023', genericName: 'Tramadol HCL', category: 'Analgesic', form: 'Capsule', strength: '50mg', manufacturer: 'Cipla Ltd', batchNumber: 'BAT-2026-023', expiryDate: new Date('2027-09-30'), stock: 400, minStock: 50, unitPrice: 8, sellingPrice: 15, supplier: 'PharmaCorp India', isControlled: true },
      { name: 'Midazolam 5mg', code: 'MED-024', genericName: 'Midazolam', category: 'Sedative', form: 'Injection', strength: '5mg/5ml', manufacturer: 'Sun Pharma', batchNumber: 'BAT-2026-024', expiryDate: new Date('2027-11-30'), stock: 80, minStock: 10, unitPrice: 95, sellingPrice: 150, supplier: 'MediSupply Co', isControlled: true },
      { name: 'Dextrose 5% 500ml', code: 'MED-025', genericName: 'Dextrose', category: 'IV Fluid', form: 'IV', strength: '5%', manufacturer: 'Baxter India', batchNumber: 'BAT-2026-025', expiryDate: new Date('2028-12-31'), stock: 320, minStock: 40, unitPrice: 38, sellingPrice: 60, supplier: 'IV Solutions Ltd' },
      { name: 'Azithromycin 500mg', code: 'MED-026', genericName: 'Azithromycin', category: 'Antibiotic', form: 'Tablet', strength: '500mg', manufacturer: 'Alkem Labs', batchNumber: 'BAT-2026-026', expiryDate: new Date('2028-03-31'), stock: 550, minStock: 60, unitPrice: 18, sellingPrice: 30, supplier: 'PharmaCorp India' },
      { name: 'Metoprolol 50mg', code: 'MED-027', genericName: 'Metoprolol Tartrate', category: 'Cardiac', form: 'Tablet', strength: '50mg', manufacturer: 'Cipla Ltd', batchNumber: 'BAT-2026-027', expiryDate: new Date('2028-06-30'), stock: 800, minStock: 80, unitPrice: 5, sellingPrice: 10, supplier: 'MediSupply Co' },
      { name: 'Prednisolone 10mg', code: 'MED-028', genericName: 'Prednisolone', category: 'Steroid', form: 'Tablet', strength: '10mg', manufacturer: 'Sun Pharma', batchNumber: 'BAT-2026-028', expiryDate: new Date('2027-12-31'), stock: 600, minStock: 60, unitPrice: 6, sellingPrice: 12, supplier: 'PharmaCorp India' },
      { name: 'Ranitidine 150mg', code: 'MED-029', genericName: 'Ranitidine', category: 'Antacid', form: 'Tablet', strength: '150mg', manufacturer: 'Dr. Reddy\'s', batchNumber: 'BAT-2026-029', expiryDate: new Date('2025-03-31'), stock: 45, minStock: 50, unitPrice: 3, sellingPrice: 6, supplier: 'MediSupply Co' },
      { name: 'Enoxaparin 40mg', code: 'MED-030', genericName: 'Enoxaparin Sodium', category: 'Anticoagulant', form: 'Injection', strength: '40mg/0.4ml', manufacturer: 'Gland Pharma', batchNumber: 'BAT-2026-030', expiryDate: new Date('2027-08-31'), stock: 120, minStock: 15, unitPrice: 280, sellingPrice: 400, supplier: 'IV Solutions Ltd' },
      { name: 'Calcium Carbonate', code: 'MED-031', genericName: 'Calcium + Vitamin D3', category: 'Vitamin', form: 'Tablet', strength: '500mg+250IU', manufacturer: 'Abbott India', batchNumber: 'BAT-2026-031', expiryDate: new Date('2028-09-30'), stock: 1800, minStock: 200, unitPrice: 2, sellingPrice: 4, supplier: 'MediSupply Co' },
      { name: 'Dopamine 200mg', code: 'MED-032', genericName: 'Dopamine HCL', category: 'Cardiac', form: 'Injection', strength: '200mg/5ml', manufacturer: 'Neon Labs', batchNumber: 'BAT-2026-032', expiryDate: new Date('2027-10-31'), stock: 60, minStock: 10, unitPrice: 45, sellingPrice: 75, supplier: 'IV Solutions Ltd' },
      { name: 'Mannitol 20% 100ml', code: 'MED-033', genericName: 'Mannitol', category: 'Diuretic', form: 'IV', strength: '20%', manufacturer: 'Baxter India', batchNumber: 'BAT-2026-033', expiryDate: new Date('2028-04-30'), stock: 150, minStock: 20, unitPrice: 55, sellingPrice: 85, supplier: 'IV Solutions Ltd' },
      { name: 'Phenytoin 100mg', code: 'MED-034', genericName: 'Phenytoin Sodium', category: 'Other', form: 'Tablet', strength: '100mg', manufacturer: 'Sun Pharma', batchNumber: 'BAT-2026-034', expiryDate: new Date('2028-02-28'), stock: 450, minStock: 50, unitPrice: 4, sellingPrice: 8, supplier: 'PharmaCorp India' },
      { name: 'Iron Sucrose 100mg', code: 'MED-035', genericName: 'Iron Sucrose', category: 'Vitamin', form: 'Injection', strength: '100mg/5ml', manufacturer: 'Emcure Pharma', batchNumber: 'BAT-2026-035', expiryDate: new Date('2027-11-30'), stock: 200, minStock: 25, unitPrice: 120, sellingPrice: 180, supplier: 'MediSupply Co' },
      { name: 'Clindamycin 300mg', code: 'MED-036', genericName: 'Clindamycin', category: 'Antibiotic', form: 'Capsule', strength: '300mg', manufacturer: 'Cipla Ltd', batchNumber: 'BAT-2026-036', expiryDate: new Date('2028-01-31'), stock: 350, minStock: 40, unitPrice: 15, sellingPrice: 25, supplier: 'PharmaCorp India' },
      { name: 'Meropenem 1g', code: 'MED-037', genericName: 'Meropenem', category: 'Antibiotic', form: 'Injection', strength: '1g', manufacturer: 'Aurobindo Pharma', batchNumber: 'BAT-2026-037', expiryDate: new Date('2027-07-31'), stock: 180, minStock: 20, unitPrice: 450, sellingPrice: 650, supplier: 'PharmaCorp India' },
      { name: 'Noradrenaline 4mg', code: 'MED-038', genericName: 'Norepinephrine', category: 'Cardiac', form: 'Injection', strength: '4mg/4ml', manufacturer: 'Neon Labs', batchNumber: 'BAT-2026-038', expiryDate: new Date('2027-09-30'), stock: 50, minStock: 10, unitPrice: 55, sellingPrice: 90, supplier: 'IV Solutions Ltd' },
      { name: 'Levofloxacin 500mg', code: 'MED-039', genericName: 'Levofloxacin', category: 'Antibiotic', form: 'Tablet', strength: '500mg', manufacturer: 'Glenmark Pharma', batchNumber: 'BAT-2026-039', expiryDate: new Date('2028-05-31'), stock: 700, minStock: 70, unitPrice: 14, sellingPrice: 25, supplier: 'MediSupply Co' },
      { name: 'Potassium Chloride', code: 'MED-040', genericName: 'KCl', category: 'Other', form: 'Injection', strength: '15%', manufacturer: 'Baxter India', batchNumber: 'BAT-2026-040', expiryDate: new Date('2028-08-31'), stock: 250, minStock: 30, unitPrice: 20, sellingPrice: 35, supplier: 'IV Solutions Ltd' },
      { name: 'Vancomycin 500mg', code: 'MED-041', genericName: 'Vancomycin HCL', category: 'Antibiotic', form: 'Injection', strength: '500mg', manufacturer: 'Cipla Ltd', batchNumber: 'BAT-2026-041', expiryDate: new Date('2027-12-31'), stock: 100, minStock: 15, unitPrice: 350, sellingPrice: 500, supplier: 'PharmaCorp India' },
      { name: 'Hydrocortisone 100mg', code: 'MED-042', genericName: 'Hydrocortisone', category: 'Steroid', form: 'Injection', strength: '100mg', manufacturer: 'Cadila Healthcare', batchNumber: 'BAT-2026-042', expiryDate: new Date('2028-03-31'), stock: 250, minStock: 25, unitPrice: 35, sellingPrice: 55, supplier: 'MediSupply Co' },
      { name: 'Losartan 50mg', code: 'MED-043', genericName: 'Losartan Potassium', category: 'Antihypertensive', form: 'Tablet', strength: '50mg', manufacturer: 'Lupin Ltd', batchNumber: 'BAT-2026-043', expiryDate: new Date('2028-06-30'), stock: 900, minStock: 100, unitPrice: 5, sellingPrice: 10, supplier: 'PharmaCorp India' },
      { name: 'Telmisartan 40mg', code: 'MED-044', genericName: 'Telmisartan', category: 'Antihypertensive', form: 'Tablet', strength: '40mg', manufacturer: 'Glenmark Pharma', batchNumber: 'BAT-2026-044', expiryDate: new Date('2028-07-31'), stock: 750, minStock: 80, unitPrice: 6, sellingPrice: 12, supplier: 'MediSupply Co' },
      { name: 'Clopidogrel 75mg', code: 'MED-045', genericName: 'Clopidogrel', category: 'Anticoagulant', form: 'Tablet', strength: '75mg', manufacturer: 'Sun Pharma', batchNumber: 'BAT-2026-045', expiryDate: new Date('2028-04-30'), stock: 650, minStock: 70, unitPrice: 8, sellingPrice: 15, supplier: 'PharmaCorp India' },
      { name: 'Ibuprofen 400mg', code: 'MED-046', genericName: 'Ibuprofen', category: 'Analgesic', form: 'Tablet', strength: '400mg', manufacturer: 'Abbott India', batchNumber: 'BAT-2026-046', expiryDate: new Date('2028-09-30'), stock: 1200, minStock: 150, unitPrice: 3, sellingPrice: 6, supplier: 'MediSupply Co' },
      { name: 'Cetirizine 10mg', code: 'MED-047', genericName: 'Cetirizine', category: 'Other', form: 'Tablet', strength: '10mg', manufacturer: 'Dr. Reddy\'s', batchNumber: 'BAT-2026-047', expiryDate: new Date('2028-08-31'), stock: 1500, minStock: 200, unitPrice: 2, sellingPrice: 4, supplier: 'PharmaCorp India' },
      { name: 'Domperidone 10mg', code: 'MED-048', genericName: 'Domperidone', category: 'Other', form: 'Tablet', strength: '10mg', manufacturer: 'Cipla Ltd', batchNumber: 'BAT-2026-048', expiryDate: new Date('2028-05-31'), stock: 800, minStock: 100, unitPrice: 3, sellingPrice: 5, supplier: 'MediSupply Co' },
      { name: 'Metronidazole 400mg', code: 'MED-049', genericName: 'Metronidazole', category: 'Antibiotic', form: 'Tablet', strength: '400mg', manufacturer: 'Alkem Labs', batchNumber: 'BAT-2026-049', expiryDate: new Date('2028-02-28'), stock: 900, minStock: 100, unitPrice: 3, sellingPrice: 6, supplier: 'PharmaCorp India' },
      { name: 'Chlorhexidine Solution', code: 'MED-050', genericName: 'Chlorhexidine', category: 'Other', form: 'Other', strength: '0.05%', manufacturer: 'Raman & Weil', batchNumber: 'BAT-2026-050', expiryDate: new Date('2028-11-30'), stock: 300, minStock: 30, unitPrice: 25, sellingPrice: 40, supplier: 'MediSupply Co' },
    ];

    const medicines = await Medicine.insertMany(medicineData);
    console.log(`Created ${medicines.length} medicines`);

    // ============ PATIENTS ============
    const patientData = [
      { patientId: 'MED-2026-000001', firstName: 'Rahul', lastName: 'Sharma', dateOfBirth: new Date('1984-03-15'), gender: 'Male', bloodGroup: 'B+', phone: '9812345001', email: 'rahul.sharma@email.com', address: { street: '45 MG Road', city: 'Mumbai', state: 'Maharashtra', zipCode: '400001' }, emergencyContact: { name: 'Meera Sharma', relationship: 'Wife', phone: '9812345101' }, govIdType: 'Aadhaar', govIdNumber: '1234-5678-9012', existingConditions: ['Hypertension'], allergies: ['Sulfa drugs'], insuranceProvider: 'Star Health Insurance', insurancePolicyNumber: 'SH-2026-78456' },
      { patientId: 'MED-2026-000002', firstName: 'Priya', lastName: 'Patel', dateOfBirth: new Date('1992-07-22'), gender: 'Female', bloodGroup: 'O+', phone: '9812345002', email: 'priya.patel@email.com', address: { street: '12 Lajpat Nagar', city: 'Delhi', state: 'Delhi', zipCode: '110024' }, emergencyContact: { name: 'Vijay Patel', relationship: 'Father', phone: '9812345102' }, govIdType: 'PAN', govIdNumber: 'ABCDE1234F', existingConditions: [], allergies: ['Penicillin'], insuranceProvider: 'HDFC Ergo', insurancePolicyNumber: 'HE-2026-56789' },
      { patientId: 'MED-2026-000003', firstName: 'Arun', lastName: 'Kumar', dateOfBirth: new Date('1965-11-08'), gender: 'Male', bloodGroup: 'A+', phone: '9812345003', email: 'arun.kumar@email.com', address: { street: '78 Gandhi Nagar', city: 'Bangalore', state: 'Karnataka', zipCode: '560001' }, emergencyContact: { name: 'Sunita Kumar', relationship: 'Wife', phone: '9812345103' }, govIdType: 'Aadhaar', govIdNumber: '9876-5432-1098', existingConditions: ['Diabetes', 'Coronary Artery Disease'], allergies: [], insuranceProvider: 'ICICI Lombard', insurancePolicyNumber: 'IL-2026-12345' },
      { patientId: 'MED-2026-000004', firstName: 'Meena', lastName: 'Reddy', dateOfBirth: new Date('1978-01-30'), gender: 'Female', bloodGroup: 'AB+', phone: '9812345004', address: { street: '23 Banjara Hills', city: 'Hyderabad', state: 'Telangana', zipCode: '500034' }, emergencyContact: { name: 'Suresh Reddy', relationship: 'Husband', phone: '9812345104' }, govIdType: 'Aadhaar', govIdNumber: '4567-8901-2345', existingConditions: ['Asthma'], allergies: ['Aspirin', 'NSAIDs'] },
      { patientId: 'MED-2026-000005', firstName: 'Vikash', lastName: 'Singh', dateOfBirth: new Date('1955-05-12'), gender: 'Male', bloodGroup: 'O-', phone: '9812345005', address: { street: '90 Civil Lines', city: 'Lucknow', state: 'Uttar Pradesh', zipCode: '226001' }, emergencyContact: { name: 'Asha Singh', relationship: 'Daughter', phone: '9812345105' }, govIdType: 'Voter ID', govIdNumber: 'UP-VOT-987654', existingConditions: ['COPD', 'Hypertension', 'Type 2 Diabetes'], allergies: ['Morphine'] },
      { patientId: 'MED-2026-000006', firstName: 'Anita', lastName: 'Deshmukh', dateOfBirth: new Date('1988-09-25'), gender: 'Female', bloodGroup: 'A-', phone: '9812345006', email: 'anita.deshmukh@email.com', address: { street: '56 FC Road', city: 'Pune', state: 'Maharashtra', zipCode: '411005' }, emergencyContact: { name: 'Rajesh Deshmukh', relationship: 'Brother', phone: '9812345106' }, govIdType: 'PAN', govIdNumber: 'FGHIJ5678K' },
      { patientId: 'MED-2026-000007', firstName: 'Mohammed', lastName: 'Khan', dateOfBirth: new Date('1970-12-03'), gender: 'Male', bloodGroup: 'B-', phone: '9812345007', address: { street: '34 Aminabad', city: 'Lucknow', state: 'Uttar Pradesh', zipCode: '226018' }, emergencyContact: { name: 'Fatima Khan', relationship: 'Wife', phone: '9812345107' }, govIdType: 'Aadhaar', govIdNumber: '6789-0123-4567', existingConditions: ['Chronic Kidney Disease'], allergies: [] },
      { patientId: 'MED-2026-000008', firstName: 'Deepa', lastName: 'Nair', dateOfBirth: new Date('1995-04-18'), gender: 'Female', bloodGroup: 'O+', phone: '9812345008', email: 'deepa.nair@email.com', address: { street: '67 Marine Drive', city: 'Kochi', state: 'Kerala', zipCode: '682001' }, emergencyContact: { name: 'Gopalan Nair', relationship: 'Father', phone: '9812345108' }, govIdType: 'Aadhaar', govIdNumber: '3456-7890-1234' },
      { patientId: 'MED-2026-000009', firstName: 'Suresh', lastName: 'Chandra', dateOfBirth: new Date('1960-08-07'), gender: 'Male', bloodGroup: 'AB-', phone: '9812345009', address: { street: '11 Rajpur Road', city: 'Dehradun', state: 'Uttarakhand', zipCode: '248001' }, emergencyContact: { name: 'Kamla Chandra', relationship: 'Wife', phone: '9812345109' }, govIdType: 'Aadhaar', govIdNumber: '8901-2345-6789', existingConditions: ['Heart Failure', 'Atrial Fibrillation'], allergies: ['Contrast Dye'] },
      { patientId: 'MED-2026-000010', firstName: 'Kavita', lastName: 'Joshi', dateOfBirth: new Date('1982-02-14'), gender: 'Female', bloodGroup: 'A+', phone: '9812345010', email: 'kavita.joshi@email.com', address: { street: '89 Shivaji Nagar', city: 'Pune', state: 'Maharashtra', zipCode: '411004' }, emergencyContact: { name: 'Ravi Joshi', relationship: 'Husband', phone: '9812345110' }, govIdType: 'Passport', govIdNumber: 'K1234567' },
      { patientId: 'MED-2026-000011', firstName: 'Rajendra', lastName: 'Prasad', dateOfBirth: new Date('1975-06-20'), gender: 'Male', bloodGroup: 'B+', phone: '9812345011', address: { street: '45 Boring Road', city: 'Patna', state: 'Bihar', zipCode: '800001' }, emergencyContact: { name: 'Savitri Prasad', relationship: 'Wife', phone: '9812345111' }, existingConditions: ['Liver Cirrhosis'], allergies: ['Codeine'] },
      { patientId: 'MED-2026-000012', firstName: 'Lakshmi', lastName: 'Iyer', dateOfBirth: new Date('1990-10-11'), gender: 'Female', bloodGroup: 'O+', phone: '9812345012', email: 'lakshmi.iyer@email.com', address: { street: '33 T Nagar', city: 'Chennai', state: 'Tamil Nadu', zipCode: '600017' }, emergencyContact: { name: 'Subramaniam Iyer', relationship: 'Father', phone: '9812345112' }, govIdType: 'Aadhaar', govIdNumber: '2345-6789-0123' },
      { patientId: 'MED-2026-000013', firstName: 'Dinesh', lastName: 'Yadav', dateOfBirth: new Date('1968-03-28'), gender: 'Male', bloodGroup: 'A+', phone: '9812345013', address: { street: '77 Model Town', city: 'Jaipur', state: 'Rajasthan', zipCode: '302001' }, emergencyContact: { name: 'Parvati Yadav', relationship: 'Wife', phone: '9812345113' }, existingConditions: ['Osteoarthritis'], allergies: [] },
      { patientId: 'MED-2026-000014', firstName: 'Shreya', lastName: 'Banerjee', dateOfBirth: new Date('1998-12-05'), gender: 'Female', bloodGroup: 'B+', phone: '9812345014', email: 'shreya.b@email.com', address: { street: '21 Salt Lake', city: 'Kolkata', state: 'West Bengal', zipCode: '700091' }, emergencyContact: { name: 'Tapan Banerjee', relationship: 'Father', phone: '9812345114' }, govIdType: 'Aadhaar', govIdNumber: '5678-9012-3456' },
      { patientId: 'MED-2026-000015', firstName: 'Harish', lastName: 'Malhotra', dateOfBirth: new Date('1958-07-16'), gender: 'Male', bloodGroup: 'O+', phone: '9812345015', address: { street: '54 Sector 17', city: 'Chandigarh', state: 'Chandigarh', zipCode: '160017' }, emergencyContact: { name: 'Sunita Malhotra', relationship: 'Wife', phone: '9812345115' }, existingConditions: ['Prostate Enlargement', 'Hypertension'], allergies: ['Tetracycline'] },
      { patientId: 'MED-2026-000016', firstName: 'Rekha', lastName: 'Gupta', dateOfBirth: new Date('1985-11-02'), gender: 'Female', bloodGroup: 'AB+', phone: '9812345016', email: 'rekha.gupta@email.com', address: { street: '18 Gomti Nagar', city: 'Lucknow', state: 'Uttar Pradesh', zipCode: '226010' }, emergencyContact: { name: 'Manoj Gupta', relationship: 'Husband', phone: '9812345116' }, existingConditions: ['Thyroid disorder'] },
      { patientId: 'MED-2026-000017', firstName: 'Santosh', lastName: 'Mishra', dateOfBirth: new Date('1972-04-09'), gender: 'Male', bloodGroup: 'A-', phone: '9812345017', address: { street: '92 Hazratganj', city: 'Lucknow', state: 'Uttar Pradesh', zipCode: '226001' }, emergencyContact: { name: 'Rani Mishra', relationship: 'Wife', phone: '9812345117' }, existingConditions: ['Peptic Ulcer'], allergies: ['NSAIDs'] },
      { patientId: 'MED-2026-000018', firstName: 'Pooja', lastName: 'Agarwal', dateOfBirth: new Date('2015-08-30'), gender: 'Female', bloodGroup: 'O+', phone: '9812345018', address: { street: '65 Vaishali Nagar', city: 'Jaipur', state: 'Rajasthan', zipCode: '302021' }, emergencyContact: { name: 'Amit Agarwal', relationship: 'Father', phone: '9812345118' }, govIdType: 'Aadhaar', govIdNumber: '0123-4567-8901' },
      { patientId: 'MED-2026-000019', firstName: 'Gopal', lastName: 'Menon', dateOfBirth: new Date('1980-01-24'), gender: 'Male', bloodGroup: 'B+', phone: '9812345019', email: 'gopal.menon@email.com', address: { street: '41 MG Road', city: 'Thiruvananthapuram', state: 'Kerala', zipCode: '695001' }, emergencyContact: { name: 'Latha Menon', relationship: 'Wife', phone: '9812345119' }, existingConditions: ['Migraine'] },
      { patientId: 'MED-2026-000020', firstName: 'Nisha', lastName: 'Verma', dateOfBirth: new Date('1993-06-13'), gender: 'Female', bloodGroup: 'A+', phone: '9812345020', email: 'nisha.verma@email.com', address: { street: '30 Aashiana', city: 'Lucknow', state: 'Uttar Pradesh', zipCode: '226012' }, emergencyContact: { name: 'Rakesh Verma', relationship: 'Father', phone: '9812345120' }, govIdType: 'Aadhaar', govIdNumber: '7890-1234-5678', existingConditions: ['Anxiety Disorder'], allergies: ['Latex'] },
      { patientId: 'MED-2026-000021', firstName: 'Rajan', lastName: 'Pillai', dateOfBirth: new Date('1962-09-17'), gender: 'Male', bloodGroup: 'O-', phone: '9812345021', address: { street: '15 Indiranagar', city: 'Bangalore', state: 'Karnataka', zipCode: '560038' }, emergencyContact: { name: 'Usha Pillai', relationship: 'Wife', phone: '9812345121' }, existingConditions: ['Parkinson\'s Disease'], allergies: [] },
      { patientId: 'MED-2026-000022', firstName: 'Swati', lastName: 'Thakur', dateOfBirth: new Date('1987-05-06'), gender: 'Female', bloodGroup: 'B-', phone: '9812345022', email: 'swati.thakur@email.com', address: { street: '28 Koregaon Park', city: 'Pune', state: 'Maharashtra', zipCode: '411001' }, emergencyContact: { name: 'Ajay Thakur', relationship: 'Husband', phone: '9812345122' } },
      { patientId: 'MED-2026-000023', firstName: 'Bharat', lastName: 'Saxena', dateOfBirth: new Date('1950-12-21'), gender: 'Male', bloodGroup: 'AB+', phone: '9812345023', address: { street: '73 Saket', city: 'Delhi', state: 'Delhi', zipCode: '110017' }, emergencyContact: { name: 'Mohan Saxena', relationship: 'Son', phone: '9812345123' }, existingConditions: ['Chronic Heart Failure', 'Diabetes', 'Renal Insufficiency'], allergies: ['Iodine'] },
      { patientId: 'MED-2026-000024', firstName: 'Divya', lastName: 'Kapoor', dateOfBirth: new Date('2000-03-08'), gender: 'Female', bloodGroup: 'O+', phone: '9812345024', email: 'divya.kapoor@email.com', address: { street: '52 Sector 62', city: 'Noida', state: 'Uttar Pradesh', zipCode: '201301' }, emergencyContact: { name: 'Neeraj Kapoor', relationship: 'Father', phone: '9812345124' }, govIdType: 'Aadhaar', govIdNumber: '4561-2378-9045' },
      { patientId: 'MED-2026-000025', firstName: 'Ashok', lastName: 'Tiwari', dateOfBirth: new Date('1974-10-29'), gender: 'Male', bloodGroup: 'A+', phone: '9812345025', address: { street: '36 Alkapuri', city: 'Vadodara', state: 'Gujarat', zipCode: '390007' }, emergencyContact: { name: 'Seema Tiwari', relationship: 'Wife', phone: '9812345125' }, existingConditions: ['Epilepsy'], allergies: [] },
    ];

    // Add timeline to each patient
    const patientDocs = [];
    for (const pd of patientData) {
      pd.registrationDate = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
      pd.timeline = [{
        event: 'Patient Registration',
        description: `Patient registered with ID ${pd.patientId}`,
        staffMember: 'Pooja Sharma',
        staffRole: 'Receptionist',
        status: 'Completed',
        date: pd.registrationDate
      }];
      const p = new Patient(pd);
      await p.save();
      patientDocs.push(p);
    }
    console.log(`Created ${patientDocs.length} patients`);

    // ============ ADMISSIONS (8 active admissions) ============
    const admissionConfigs = [
      { patientIdx: 0, doctorIdx: 0, wardIdx: 0, room: 'E-04', bed: 'E-04-B', diagnosis: 'Acute bacterial infection with sepsis', priority: 'Emergency' },
      { patientIdx: 2, doctorIdx: 2, wardIdx: 7, room: 'C-01', bed: 'C-01-A', diagnosis: 'Acute myocardial infarction', priority: 'Emergency' },
      { patientIdx: 4, doctorIdx: 8, wardIdx: 1, room: 'ICU-01', bed: 'ICU-01-A', diagnosis: 'Severe COPD exacerbation with respiratory failure', priority: 'Emergency' },
      { patientIdx: 6, doctorIdx: 1, wardIdx: 2, room: 'G-01', bed: 'G-01-A', diagnosis: 'Chronic kidney disease – dialysis management', priority: 'Normal' },
      { patientIdx: 8, doctorIdx: 2, wardIdx: 7, room: 'C-02', bed: 'C-02-A', diagnosis: 'Congestive heart failure', priority: 'Urgent' },
      { patientIdx: 10, doctorIdx: 1, wardIdx: 2, room: 'G-01', bed: 'G-01-C', diagnosis: 'Hepatic encephalopathy', priority: 'Urgent' },
      { patientIdx: 12, doctorIdx: 4, wardIdx: 8, room: 'O-01', bed: 'O-01-A', diagnosis: 'Right hip fracture – pre-operative', priority: 'Normal' },
      { patientIdx: 14, doctorIdx: 6, wardIdx: 6, room: 'S-01', bed: 'S-01-A', diagnosis: 'Benign prostatic hyperplasia – TURP planned', priority: 'Normal' },
    ];

    const admissions = [];
    for (let i = 0; i < admissionConfigs.length; i++) {
      const cfg = admissionConfigs[i];
      const patient = patientDocs[cfg.patientIdx];
      const doctor = doctors[cfg.doctorIdx];
      const ward = wards[cfg.wardIdx];

      const admissionId = `ADM-2026-${String(i + 1).padStart(5, '0')}`;
      const admission = await Admission.create({
        admissionId,
        patient: patient._id,
        patientId: patient.patientId,
        diagnosis: cfg.diagnosis,
        doctor: doctor._id,
        doctorName: doctor.name,
        department: doctor.department,
        priority: cfg.priority,
        ward: ward._id,
        wardName: ward.name,
        room: cfg.room,
        bed: cfg.bed,
        expectedStay: Math.floor(Math.random() * 7) + 3,
        admissionDate: new Date(Date.now() - Math.random() * 5 * 24 * 60 * 60 * 1000),
        admissionTime: '10:30 AM',
        status: 'Active'
      });
      admissions.push(admission);

      // Update patient
      patient.status = 'Admitted';
      patient.currentWard = ward._id;
      patient.currentRoom = cfg.room;
      patient.currentBed = cfg.bed;
      patient.assignedDoctor = doctor._id;
      patient.timeline.push({
        event: 'Patient Admitted',
        description: `Admitted to ${ward.name}, Room ${cfg.room}, Bed ${cfg.bed}. Diagnosis: ${cfg.diagnosis}`,
        staffMember: doctor.name,
        staffRole: 'Doctor',
        status: 'Completed',
        date: admission.admissionDate
      });
      await patient.save();

      // Update bed
      ward.rooms.forEach(r => {
        if (r.roomNumber === cfg.room) {
          r.beds.forEach(b => {
            if (b.bedId === cfg.bed) {
              b.status = 'Occupied';
              b.patient = patient._id;
              b.patientId = patient.patientId;
              b.patientName = `${patient.firstName} ${patient.lastName}`;
            }
          });
        }
      });
      ward.updateBedCounts();
      await ward.save();
    }
    console.log(`Created ${admissions.length} admissions`);

    // ============ ORDERS ============
    const orderConfigs = [
      // Rahul Sharma orders
      { patientIdx: 0, doctorIdx: 0, category: 'Medication', medicineName: 'Ceftriaxone', dosage: '1g', route: 'IV', frequency: 'Every 12 hours', duration: '5 days', administrationTimes: ['08:00 AM', '08:00 PM'], instruction: 'Administer after checking allergy status', status: 'In Progress' },
      { patientIdx: 0, doctorIdx: 0, category: 'Medication', medicineName: 'Paracetamol 500mg', dosage: '500mg', route: 'Oral', frequency: 'Every 6 hours', duration: '3 days', administrationTimes: ['06:00 AM', '12:00 PM', '06:00 PM', '12:00 AM'], instruction: 'Give with food if possible', status: 'In Progress' },
      { patientIdx: 0, doctorIdx: 0, category: 'IV Fluid', medicineName: 'Normal Saline 500ml', dosage: '500ml', route: 'IV', frequency: 'Every 8 hours', duration: '3 days', administrationTimes: ['08:00 AM', '04:00 PM', '12:00 AM'], instruction: 'Monitor intake/output', status: 'Ordered' },
      { patientIdx: 0, doctorIdx: 0, category: 'Lab Test', instruction: 'Complete Blood Count, CRP, Blood Culture', status: 'Completed' },
      { patientIdx: 0, doctorIdx: 0, category: 'Monitoring', instruction: 'Vitals every 4 hours. Report if temperature > 38.5°C or SpO2 < 94%', status: 'In Progress' },

      // Arun Kumar orders (Cardiology)
      { patientIdx: 2, doctorIdx: 2, category: 'Medication', medicineName: 'Aspirin 75mg', dosage: '75mg', route: 'Oral', frequency: 'Once daily', duration: '30 days', administrationTimes: ['08:00 AM'], instruction: 'Give after breakfast', status: 'In Progress' },
      { patientIdx: 2, doctorIdx: 2, category: 'Medication', medicineName: 'Metoprolol 50mg', dosage: '50mg', route: 'Oral', frequency: 'Twice daily', duration: '30 days', administrationTimes: ['08:00 AM', '08:00 PM'], instruction: 'Check heart rate before administering', status: 'In Progress' },
      { patientIdx: 2, doctorIdx: 2, category: 'Medication', medicineName: 'Atorvastatin 10mg', dosage: '10mg', route: 'Oral', frequency: 'Once daily (night)', duration: '30 days', administrationTimes: ['10:00 PM'], instruction: 'Give at bedtime', status: 'Ordered' },
      { patientIdx: 2, doctorIdx: 2, category: 'Injection', medicineName: 'Enoxaparin 40mg', dosage: '40mg', route: 'SC', frequency: 'Once daily', duration: '5 days', administrationTimes: ['09:00 AM'], instruction: 'Subcutaneous injection in abdomen', status: 'In Progress' },
      { patientIdx: 2, doctorIdx: 2, category: 'Lab Test', instruction: 'Troponin I, Lipid Profile, HbA1c, Renal Function Test', status: 'Ordered' },

      // Vikash Singh orders (ICU)
      { patientIdx: 4, doctorIdx: 8, category: 'IV Fluid', medicineName: 'Normal Saline 500ml', dosage: '500ml', route: 'IV', frequency: 'Continuous', duration: '24 hours', administrationTimes: [], instruction: 'Continuous infusion at 80ml/hr', status: 'In Progress' },
      { patientIdx: 4, doctorIdx: 8, category: 'Medication', medicineName: 'Salbutamol Inhaler', dosage: '2 puffs', route: 'Inhaled', frequency: 'Every 4 hours', duration: '7 days', administrationTimes: ['06:00 AM', '10:00 AM', '02:00 PM', '06:00 PM', '10:00 PM', '02:00 AM'], instruction: 'Use spacer device', status: 'In Progress' },
      { patientIdx: 4, doctorIdx: 8, category: 'Injection', medicineName: 'Hydrocortisone 100mg', dosage: '100mg', route: 'IV', frequency: 'Every 8 hours', duration: '3 days', administrationTimes: ['08:00 AM', '04:00 PM', '12:00 AM'], instruction: 'Slow IV push over 3-5 minutes', status: 'In Progress' },
      { patientIdx: 4, doctorIdx: 8, category: 'Monitoring', instruction: 'Continuous SpO2 monitoring. Maintain SpO2 > 92%. Hourly vitals. ABG every 6 hours.', status: 'In Progress' },

      // Mohammed Khan orders (General)
      { patientIdx: 6, doctorIdx: 1, category: 'IV Fluid', medicineName: 'Ringer Lactate 500ml', dosage: '500ml', route: 'IV', frequency: 'Every 12 hours', duration: '3 days', administrationTimes: ['08:00 AM', '08:00 PM'], instruction: 'Monitor fluid balance', status: 'In Progress' },
      { patientIdx: 6, doctorIdx: 1, category: 'Medication', medicineName: 'Furosemide 40mg', dosage: '40mg', route: 'Oral', frequency: 'Once daily', duration: '5 days', administrationTimes: ['08:00 AM'], instruction: 'Give in morning. Monitor potassium.', status: 'Ordered' },

      // Dinesh Yadav orders (Orthopedics)
      { patientIdx: 12, doctorIdx: 4, category: 'Medication', medicineName: 'Tramadol 50mg', dosage: '50mg', route: 'Oral', frequency: 'Every 8 hours', duration: '5 days', administrationTimes: ['08:00 AM', '04:00 PM', '12:00 AM'], instruction: 'For pain management. Assess pain score before and after.', status: 'In Progress' },
      { patientIdx: 12, doctorIdx: 4, category: 'Medication', medicineName: 'Pantoprazole 40mg', dosage: '40mg', route: 'IV', frequency: 'Once daily', duration: '5 days', administrationTimes: ['06:00 AM'], instruction: 'Give before breakfast', status: 'In Progress' },
      { patientIdx: 12, doctorIdx: 4, category: 'Lab Test', instruction: 'Pre-operative panel: CBC, PT/INR, BMP, Type & Screen', status: 'Ordered' },
      { patientIdx: 12, doctorIdx: 4, category: 'Imaging', instruction: 'X-Ray Right Hip AP & Lateral', status: 'Completed' },
    ];

    const orders = [];
    for (let i = 0; i < orderConfigs.length; i++) {
      const cfg = orderConfigs[i];
      const patient = patientDocs[cfg.patientIdx];
      const doctor = doctors[cfg.doctorIdx];
      const orderId = `ORD-${String(i + 1).padStart(6, '0')}`;

      const order = await Order.create({
        orderId,
        patient: patient._id,
        patientId: patient.patientId,
        patientName: `${patient.firstName} ${patient.lastName}`,
        doctor: doctor._id,
        doctorName: doctor.name,
        category: cfg.category,
        medicineName: cfg.medicineName || '',
        dosage: cfg.dosage || '',
        route: cfg.route || '',
        frequency: cfg.frequency || '',
        duration: cfg.duration || '',
        administrationTimes: cfg.administrationTimes || [],
        instruction: cfg.instruction || '',
        specialInstructions: cfg.instruction || '',
        priority: cfg.priority || 'Normal',
        status: cfg.status,
        ward: patient.currentRoom ? wards.find(w => w._id.equals(patient.currentWard))?.name || '' : '',
        room: patient.currentRoom || '',
        bed: patient.currentBed || '',
        orderedAt: new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000)
      });
      orders.push(order);

      // Create pharmacy orders for medications
      if (['Medication', 'Injection', 'IV Fluid'].includes(cfg.category)) {
        const phrId = `PHR-${String(orders.length).padStart(6, '0')}`;
        const statuses = ['New', 'Accepted', 'Preparing', 'Ready', 'Sent to Ward', 'Dispensed'];
        const phrStatus = statuses[Math.floor(Math.random() * statuses.length)];

        await PharmacyOrder.create({
          pharmacyOrderId: phrId,
          order: order._id,
          orderId: order.orderId,
          patient: patient._id,
          patientId: patient.patientId,
          patientName: `${patient.firstName} ${patient.lastName}`,
          doctor: doctor._id,
          doctorName: doctor.name,
          medicineName: cfg.medicineName,
          dosage: cfg.dosage,
          route: cfg.route,
          frequency: cfg.frequency,
          quantity: Math.floor(Math.random() * 20) + 5,
          duration: cfg.duration,
          specialInstructions: cfg.instruction || '',
          ward: patient.currentRoom ? wards.find(w => w._id.equals(patient.currentWard))?.name || '' : '',
          room: patient.currentRoom || '',
          bed: patient.currentBed || '',
          priority: cfg.priority || 'Normal',
          status: phrStatus
        });
      }
    }
    console.log(`Created ${orders.length} orders`);

    // ============ BILLING ============
    for (let i = 0; i < admissions.length; i++) {
      const adm = admissions[i];
      const patient = patientDocs[admissionConfigs[i].patientIdx];
      const invoiceId = `INV-2026-${String(i + 1).padStart(5, '0')}`;

      const items = [
        { description: 'Registration Fee', category: 'Registration', quantity: 1, unitPrice: 200, totalPrice: 200 },
        { description: 'Consultation Fee', category: 'Consultation', quantity: 1, unitPrice: 800, totalPrice: 800 },
        { description: 'Admission Fee', category: 'Admission', quantity: 1, unitPrice: 500, totalPrice: 500 },
        { description: `Bed Charges - ${adm.wardName} (per day)`, category: 'Bed', quantity: 3, unitPrice: adm.wardName.includes('ICU') ? 5000 : adm.wardName.includes('Private') ? 3000 : 1000, totalPrice: 0 },
      ];
      items[3].totalPrice = items[3].quantity * items[3].unitPrice;

      // Add some medicine charges
      const patientOrders = orders.filter(o => o.patientId === patient.patientId && o.medicineName);
      patientOrders.forEach(o => {
        items.push({
          description: `${o.medicineName} ${o.dosage}`,
          category: 'Medicine',
          quantity: Math.floor(Math.random() * 10) + 1,
          unitPrice: Math.floor(Math.random() * 200) + 50,
          totalPrice: 0,
          orderId: o.orderId
        });
        items[items.length - 1].totalPrice = items[items.length - 1].quantity * items[items.length - 1].unitPrice;
      });

      const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
      const paidAmount = Math.random() > 0.4 ? Math.floor(subtotal * (Math.random() * 0.5 + 0.3)) : 0;

      const bill = new Billing({
        invoiceId,
        patient: patient._id,
        patientId: patient.patientId,
        patientName: `${patient.firstName} ${patient.lastName}`,
        admission: adm._id,
        admissionId: adm.admissionId,
        items,
        subtotal,
        taxPercent: 5,
        total: 0,
        payments: paidAmount > 0 ? [{ amount: paidAmount, method: ['Cash', 'Card', 'UPI'][Math.floor(Math.random() * 3)], receivedBy: 'Ravi Shankar', date: new Date() }] : []
      });
      bill.calculateTotals();
      await bill.save();
    }
    console.log('Created billing records');

    // ============ VITALS ============
    const admittedPatients = patientDocs.filter(p => p.status === 'Admitted');
    for (const patient of admittedPatients) {
      // Create 3-5 vital readings per admitted patient
      const numReadings = Math.floor(Math.random() * 3) + 3;
      for (let v = 0; v < numReadings; v++) {
        await Vital.create({
          patient: patient._id,
          patientId: patient.patientId,
          heartRate: Math.floor(Math.random() * 40) + 60,
          systolicBP: Math.floor(Math.random() * 60) + 100,
          diastolicBP: Math.floor(Math.random() * 30) + 60,
          spO2: Math.floor(Math.random() * 6) + 94,
          temperature: parseFloat((Math.random() * 2 + 36.5).toFixed(1)),
          respiratoryRate: Math.floor(Math.random() * 10) + 14,
          recordedByName: ['Anita Verma', 'Suman Devi', 'Rekha Kumari'][Math.floor(Math.random() * 3)],
          createdAt: new Date(Date.now() - v * 4 * 60 * 60 * 1000)
        });
      }
    }
    console.log('Created vital records');

    // ============ NOTIFICATIONS ============
    await Notification.insertMany([
      { title: 'New Medication Order', message: 'Ceftriaxone 1g IV for Rahul Sharma (MED-2026-000001)', type: 'pharmacy', targetRole: 'pharmacist', patientId: 'MED-2026-000001', module: 'Pharmacy' },
      { title: 'Medicine Due Soon', message: 'Paracetamol 500mg for Rahul Sharma is due in 10 minutes (Bed E-04-B)', type: 'medication', priority: 'High', targetRole: 'nurse', patientId: 'MED-2026-000001', module: 'Nursing' },
      { title: 'Critical Vitals', message: 'Vikash Singh (MED-2026-000005) SpO2 dropped to 91%. Immediate attention required.', type: 'vital', priority: 'Critical', targetRole: 'doctor', patientId: 'MED-2026-000005', module: 'Vitals' },
      { title: 'Medicine Ready', message: 'Enoxaparin 40mg for Arun Kumar is ready from pharmacy. Bed: C-01-A', type: 'medication', targetRole: 'nurse', patientId: 'MED-2026-000003', module: 'Pharmacy' },
      { title: 'New Admission', message: 'Dinesh Yadav admitted to Orthopedics Ward, Bed O-01-A. Pre-operative case.', type: 'admission', targetRole: 'nurse', patientId: 'MED-2026-000013', module: 'Admission' },
      { title: 'Low Stock Alert', message: 'Ranitidine 150mg stock is below minimum level (45 remaining)', type: 'warning', priority: 'High', targetRole: 'pharmacist', module: 'Inventory' },
      { title: 'Lab Results Available', message: 'CBC and Blood Culture results available for Rahul Sharma (MED-2026-000001)', type: 'info', targetRole: 'doctor', patientId: 'MED-2026-000001', module: 'Lab' },
      { title: 'Pending Bills', message: '3 patients have pending bills exceeding ₹10,000', type: 'billing', targetRole: 'billing', module: 'Billing' },
      { title: 'Bed Cleaning Complete', message: 'Bed E-03-C in Emergency Ward is now available', type: 'info', targetRole: 'receptionist', module: 'Ward' },
      { title: 'Discharge Pending', message: 'Mohammed Khan (MED-2026-000007) discharge summary pending from Dr. Anand Sharma', type: 'info', targetRole: 'doctor', patientId: 'MED-2026-000007', module: 'Discharge' },
    ]);
    console.log('Created notifications');

    // ============ AUDIT LOGS ============
    const auditEntries = [
      { action: 'Patient Registration', module: 'Reception', description: 'Registered Rahul Sharma (MED-2026-000001)', userName: 'Pooja Sharma', userRole: 'receptionist', patientId: 'MED-2026-000001' },
      { action: 'Patient Admitted', module: 'Admission', description: 'Rahul Sharma admitted to Emergency Ward', userName: 'Dr. Anand Sharma', userRole: 'doctor', patientId: 'MED-2026-000001' },
      { action: 'Order Created', module: 'Doctor Orders', description: 'Ceftriaxone 1g IV ordered for Rahul Sharma', userName: 'Dr. Anand Sharma', userRole: 'doctor', patientId: 'MED-2026-000001' },
      { action: 'Medicine Dispensed', module: 'Pharmacy', description: 'Ceftriaxone 1g dispensed for MED-2026-000001', userName: 'Suresh Pandey', userRole: 'pharmacist', patientId: 'MED-2026-000001' },
      { action: 'Medicine Administered', module: 'Nursing', description: 'Ceftriaxone 1g IV administered to Rahul Sharma', userName: 'Anita Verma', userRole: 'nurse', patientId: 'MED-2026-000001' },
      { action: 'Vitals Recorded', module: 'Nursing', description: 'Vitals recorded: HR 82, BP 128/78, SpO2 97%', userName: 'Anita Verma', userRole: 'nurse', patientId: 'MED-2026-000001' },
      { action: 'Patient Admitted', module: 'Admission', description: 'Arun Kumar admitted to Cardiology Ward', userName: 'Dr. Vikram Singh', userRole: 'doctor', patientId: 'MED-2026-000003' },
      { action: 'Order Created', module: 'Doctor Orders', description: 'Aspirin 75mg, Metoprolol 50mg ordered for Arun Kumar', userName: 'Dr. Vikram Singh', userRole: 'doctor', patientId: 'MED-2026-000003' },
      { action: 'Invoice Generated', module: 'Billing', description: 'Invoice INV-2026-00001 generated for Rahul Sharma', userName: 'Ravi Shankar', userRole: 'billing', patientId: 'MED-2026-000001' },
      { action: 'Payment Received', module: 'Billing', description: 'Payment of ₹5000 received for MED-2026-000001', userName: 'Ravi Shankar', userRole: 'billing', patientId: 'MED-2026-000001' },
      { action: 'Login', module: 'Authentication', description: 'Dr. Anand Sharma logged in', userName: 'Dr. Anand Sharma', userRole: 'doctor' },
      { action: 'Patient Registration', module: 'Reception', description: 'Registered Priya Patel (MED-2026-000002)', userName: 'Pooja Sharma', userRole: 'receptionist', patientId: 'MED-2026-000002' },
      { action: 'Stock Updated', module: 'Pharmacy', description: 'Added 200 units of Paracetamol 500mg', userName: 'Suresh Pandey', userRole: 'pharmacist' },
      { action: 'Bed Status Updated', module: 'Ward', description: 'Bed E-03-C marked for cleaning', userName: 'Anita Verma', userRole: 'nurse' },
    ];
    await AuditLog.insertMany(auditEntries);
    console.log('Created audit logs');

    console.log('\n=== SEED COMPLETE ===');
    console.log('\nLogin Credentials (all users):');
    console.log('Password: password123\n');
    console.log('Admin:       admin@mednexus.in');
    console.log('Doctor:      anand.sharma@mednexus.in');
    console.log('Nurse:       anita.verma@mednexus.in');
    console.log('Reception:   reception@mednexus.in');
    console.log('Pharmacist:  pharmacy@mednexus.in');
    console.log('Billing:     billing@mednexus.in');
    console.log('\nOr use Employee IDs: ADM-001, DOC-001, NUR-001, REC-001, PHR-001, BIL-001');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seed();
