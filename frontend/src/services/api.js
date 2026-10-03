import {
  initialUsers,
  initialWards,
  initialPatients,
  initialOrders,
  initialMedicines,
  initialBills,
  initialNotifications
} from './mockData';

// Storage Helper with Auto-initialization
const getStored = (key, fallback) => {
  try {
    const data = localStorage.getItem(`mednexus_${key}`);
    return data ? JSON.parse(data) : fallback;
  } catch (e) {
    return fallback;
  }
};

const setStored = (key, data) => {
  try {
    localStorage.setItem(`mednexus_${key}`, JSON.stringify(data));
  } catch (e) {
    console.error('Storage error', e);
  }
};

// Initialize State
if (!localStorage.getItem('mednexus_initialized')) {
  setStored('users', initialUsers);
  setStored('wards', initialWards);
  setStored('patients', initialPatients);
  setStored('orders', initialOrders);
  setStored('medicines', initialMedicines);
  setStored('bills', initialBills);
  setStored('notifications', initialNotifications);
  setStored('initialized', true);
}

export const api = {
  // Auth API
  auth: {
    login: async (emailOrId, password) => {
      const users = getStored('users', initialUsers);
      const user = users.find(
        u => u.email.toLowerCase() === emailOrId.toLowerCase() || u.employeeId.toLowerCase() === emailOrId.toLowerCase()
      );
      if (user) {
        const token = `jwt_token_${user._id}_${Date.now()}`;
        return { success: true, user, token };
      }
      // If user not found, default to first user or return failure
      throw new Error('Invalid Employee ID or Email. Try admin@mednexus.in (password: password123)');
    },
    getUsers: async () => getStored('users', initialUsers),
  },

  // Patients API
  patients: {
    getAll: async () => getStored('patients', initialPatients),
    getById: async (idOrPatientId) => {
      const patients = getStored('patients', initialPatients);
      return patients.find(p => p._id === idOrPatientId || p.patientId === idOrPatientId);
    },
    create: async (patientData) => {
      const patients = getStored('patients', initialPatients);
      const count = patients.length + 1;
      const patientId = `MED-2026-${String(count).padStart(6, '0')}`;
      
      const newPatient = {
        _id: `p_${Date.now()}`,
        patientId,
        ...patientData,
        status: patientData.status || 'Registered',
        registrationDate: new Date().toISOString(),
        timeline: [
          {
            id: `t_${Date.now()}`,
            event: 'Patient Registration',
            description: `Patient registered with Unique Patient ID ${patientId}`,
            staffMember: patientData.registeredBy || 'Pooja Sharma',
            staffRole: 'Receptionist',
            status: 'Completed',
            date: new Date().toISOString()
          }
        ]
      };
      
      const updated = [newPatient, ...patients];
      setStored('patients', updated);
      
      // Also log audit & notification
      api.notifications.create({
        title: 'New Patient Registered',
        message: `${newPatient.firstName} ${newPatient.lastName} (${patientId}) has been registered.`,
        type: 'info',
        priority: 'Normal',
        targetRole: 'receptionist',
        patientId: patientId,
        module: 'Reception'
      });

      return newPatient;
    },
    update: async (patientId, updateData) => {
      const patients = getStored('patients', initialPatients);
      const index = patients.findIndex(p => p.patientId === patientId || p._id === patientId);
      if (index !== -1) {
        patients[index] = { ...patients[index], ...updateData };
        setStored('patients', patients);
        return patients[index];
      }
      throw new Error('Patient not found');
    },
    addTimelineEvent: async (patientId, event) => {
      const patients = getStored('patients', initialPatients);
      const index = patients.findIndex(p => p.patientId === patientId || p._id === patientId);
      if (index !== -1) {
        const newEvent = {
          id: `t_${Date.now()}`,
          date: new Date().toISOString(),
          status: 'Completed',
          ...event
        };
        patients[index].timeline = [newEvent, ...(patients[index].timeline || [])];
        setStored('patients', patients);
        return patients[index];
      }
    }
  },

  // Wards & Bed API
  wards: {
    getAll: async () => getStored('wards', initialWards),
    getById: async (wardId) => {
      const wards = getStored('wards', initialWards);
      return wards.find(w => w._id === wardId || w.code === wardId);
    },
    assignBed: async ({ patientId, wardId, roomNumber, bedId, doctorName, diagnosis, priority }) => {
      const wards = getStored('wards', initialWards);
      const patients = getStored('patients', initialPatients);
      const patient = patients.find(p => p.patientId === patientId || p._id === patientId);
      
      if (!patient) throw new Error('Patient not found');

      // Update Ward Bed status
      let targetWardName = '';
      const updatedWards = wards.map(ward => {
        if (ward._id === wardId || ward.name === wardId) {
          targetWardName = ward.name;
          const updatedRooms = ward.rooms.map(room => {
            if (room.roomNumber === roomNumber) {
              const updatedBeds = room.beds.map(bed => {
                if (bed.bedId === bedId) {
                  return {
                    ...bed,
                    status: 'Occupied',
                    patientId: patient.patientId,
                    patientName: `${patient.firstName} ${patient.lastName}`
                  };
                }
                return bed;
              });
              return { ...room, beds: updatedBeds };
            }
            return room;
          });
          
          // Recompute bed counts
          let occupied = 0, available = 0, cleaning = 0;
          updatedRooms.forEach(r => r.beds.forEach(b => {
            if (b.status === 'Occupied') occupied++;
            else if (b.status === 'Available') available++;
            else if (b.status === 'Cleaning') cleaning++;
          }));

          return { ...ward, rooms: updatedRooms, occupiedBeds: occupied, availableBeds: available, cleaningBeds: cleaning };
        }
        return ward;
      });
      setStored('wards', updatedWards);

      // Update Patient record
      await api.patients.update(patient.patientId, {
        status: 'Admitted',
        currentWard: wardId,
        currentWardName: targetWardName,
        currentRoom: roomNumber,
        currentBed: bedId,
        assignedDoctorName: doctorName,
        diagnosis: diagnosis || patient.diagnosis,
        priority: priority || 'Normal',
        admissionDate: new Date().toISOString()
      });

      // Add Admission timeline event
      await api.patients.addTimelineEvent(patient.patientId, {
        event: 'Patient Admitted to Ward',
        description: `Admitted to ${targetWardName}, Room ${roomNumber}, Bed ${bedId}. Care Doctor: ${doctorName}`,
        staffMember: doctorName,
        staffRole: 'Doctor'
      });

      // Notify Nursing & Doctor
      api.notifications.create({
        title: 'New Patient Admitted',
        message: `${patient.firstName} ${patient.lastName} admitted to ${targetWardName} (${bedId})`,
        type: 'admission',
        priority: priority === 'Emergency' ? 'Critical' : 'Normal',
        targetRole: 'nurse',
        patientId: patient.patientId,
        module: 'Admission'
      });

      return { success: true, wardName: targetWardName, bedId };
    },
    updateBedStatus: async (wardId, roomNumber, bedId, newStatus) => {
      const wards = getStored('wards', initialWards);
      const updatedWards = wards.map(ward => {
        if (ward._id === wardId) {
          const updatedRooms = ward.rooms.map(room => {
            if (room.roomNumber === roomNumber) {
              const updatedBeds = room.beds.map(bed => {
                if (bed.bedId === bedId) {
                  return {
                    ...bed,
                    status: newStatus,
                    patientId: newStatus === 'Available' || newStatus === 'Cleaning' ? undefined : bed.patientId,
                    patientName: newStatus === 'Available' || newStatus === 'Cleaning' ? undefined : bed.patientName
                  };
                }
                return bed;
              });
              return { ...room, beds: updatedBeds };
            }
            return room;
          });
          return { ...ward, rooms: updatedRooms };
        }
        return ward;
      });
      setStored('wards', updatedWards);
      return { success: true };
    }
  },

  // Clinical Orders API
  orders: {
    getAll: async () => getStored('orders', initialOrders),
    getByPatientId: async (patientId) => {
      const orders = getStored('orders', initialOrders);
      return orders.filter(o => o.patientId === patientId);
    },
    create: async (orderData) => {
      const orders = getStored('orders', initialOrders);
      const orderId = `ORD-${String(orders.length + 1).padStart(6, '0')}`;
      
      const newOrder = {
        _id: `ord_${Date.now()}`,
        orderId,
        ...orderData,
        status: 'Ordered',
        pharmacyStatus: orderData.category === 'Medication' ? 'Preparing' : 'Ready',
        orderedAt: new Date().toISOString()
      };
      
      const updated = [newOrder, ...orders];
      setStored('orders', updated);

      // Add to patient timeline
      await api.patients.addTimelineEvent(orderData.patientId, {
        event: 'Doctor Order Created',
        description: `${orderData.category}: ${orderData.medicineName || orderData.instruction} ordered by ${orderData.doctorName}`,
        staffMember: orderData.doctorName,
        staffRole: 'Doctor'
      });

      // Auto-post to Pharmacy queue if Medication
      if (['Medication', 'Injection', 'IV Fluid'].includes(orderData.category)) {
        api.notifications.create({
          title: 'New Medication Prescription',
          message: `${orderData.medicineName} ${orderData.dosage} for ${orderData.patientName} (${orderData.bed})`,
          type: 'pharmacy',
          priority: orderData.priority === 'Emergency' ? 'High' : 'Normal',
          targetRole: 'pharmacist',
          patientId: orderData.patientId,
          module: 'Pharmacy'
        });
      }

      return newOrder;
    },
    updateStatus: async (orderId, status, pharmacyStatus) => {
      const orders = getStored('orders', initialOrders);
      const updated = orders.map(o => {
        if (o.orderId === orderId || o._id === orderId) {
          return {
            ...o,
            status: status || o.status,
            pharmacyStatus: pharmacyStatus !== undefined ? pharmacyStatus : o.pharmacyStatus
          };
        }
        return o;
      });
      setStored('orders', updated);
      return { success: true };
    }
  },

  // Pharmacy & Inventory API
  pharmacy: {
    getMedicines: async () => getStored('medicines', initialMedicines),
    getOrdersQueue: async () => {
      const orders = getStored('orders', initialOrders);
      return orders.filter(o => ['Medication', 'Injection', 'IV Fluid'].includes(o.category));
    },
    dispenseMedicine: async (orderId, batchNumber, dispensedBy) => {
      const orders = getStored('orders', initialOrders);
      const order = orders.find(o => o.orderId === orderId || o._id === orderId);
      if (!order) throw new Error('Order not found');

      // Update order status
      await api.orders.updateStatus(orderId, 'In Progress', 'Dispensed');

      // Add Timeline event to patient
      await api.patients.addTimelineEvent(order.patientId, {
        event: 'Medication Dispensed by Pharmacy',
        description: `${order.medicineName} (${order.dosage}) dispensed. Batch: ${batchNumber || 'BAT-2026-001'}`,
        staffMember: dispensedBy || 'Suresh Pandey',
        staffRole: 'Pharmacist'
      });

      // Notify Ward Nurse
      api.notifications.create({
        title: 'Medication Ready for Administration',
        message: `${order.medicineName} for ${order.patientName} (${order.bed}) has arrived at the ward.`,
        type: 'medication',
        priority: 'Normal',
        targetRole: 'nurse',
        patientId: order.patientId,
        module: 'Nursing'
      });

      return { success: true };
    },
    updateStock: async (medicineId, quantityDelta) => {
      const meds = getStored('medicines', initialMedicines);
      const updated = meds.map(m => {
        if (m._id === medicineId || m.code === medicineId) {
          const newStock = Math.max(0, m.stock + quantityDelta);
          return {
            ...m,
            stock: newStock,
            status: newStock <= m.minStock ? 'Low Stock' : 'In Stock'
          };
        }
        return m;
      });
      setStored('medicines', updated);
      return { success: true };
    }
  },

  // Nursing & eMAR API
  nursing: {
    recordAdministration: async ({ orderId, patientId, medicineName, dosage, nurseName, notes }) => {
      // Mark timeline
      await api.patients.addTimelineEvent(patientId, {
        event: 'Medication Administered',
        description: `${medicineName} (${dosage}) administered. Nurse Notes: ${notes || 'Patient vitals stable.'}`,
        staffMember: nurseName,
        staffRole: 'Nurse'
      });

      // Update Order Status if completed
      return { success: true, timestamp: new Date().toISOString() };
    },
    recordVitals: async (patientId, vitalsData, nurseName) => {
      const patient = await api.patients.getById(patientId);
      if (!patient) throw new Error('Patient not found');

      const desc = `Vitals Recorded: HR ${vitalsData.heartRate} bpm, BP ${vitalsData.systolicBP}/${vitalsData.diastolicBP} mmHg, SpO2 ${vitalsData.spO2}%, Temp ${vitalsData.temperature}°C, RR ${vitalsData.respiratoryRate}/min.`;
      
      await api.patients.addTimelineEvent(patientId, {
        event: 'Vitals Recorded',
        description: desc,
        staffMember: nurseName || 'Anita Verma',
        staffRole: 'Nurse'
      });

      // If abnormal vitals, fire alert
      if (vitalsData.spO2 < 92 || vitalsData.heartRate > 120 || vitalsData.systolicBP > 160) {
        api.notifications.create({
          title: 'CRITICAL: Abnormal Patient Vitals',
          message: `${patient.firstName} ${patient.lastName} (${patient.currentBed || 'OPD'}): SpO2 ${vitalsData.spO2}%, HR ${vitalsData.heartRate} bpm`,
          type: 'vital',
          priority: 'Critical',
          targetRole: 'doctor',
          patientId: patient.patientId,
          module: 'Vitals'
        });
      }

      return { success: true };
    }
  },

  // Billing & Invoicing API
  billing: {
    getAll: async () => getStored('bills', initialBills),
    getByPatientId: async (patientId) => {
      const bills = getStored('bills', initialBills);
      return bills.filter(b => b.patientId === patientId);
    },
    createInvoice: async (billData) => {
      const bills = getStored('bills', initialBills);
      const invoiceId = `INV-2026-${String(bills.length + 1).padStart(5, '0')}`;
      
      const newBill = {
        _id: `b_${Date.now()}`,
        invoiceId,
        ...billData,
        createdAt: new Date().toISOString()
      };
      
      const updated = [newBill, ...bills];
      setStored('bills', updated);

      await api.patients.addTimelineEvent(billData.patientId, {
        event: 'Hospital Invoice Generated',
        description: `Invoice ${invoiceId} generated for Total Amount: ₹${billData.total.toLocaleString()}`,
        staffMember: billData.generatedBy || 'Ravi Shankar',
        staffRole: 'Billing'
      });

      return newBill;
    },
    recordPayment: async (invoiceId, payment) => {
      const bills = getStored('bills', initialBills);
      const index = bills.findIndex(b => b.invoiceId === invoiceId || b._id === invoiceId);
      if (index !== -1) {
        const bill = bills[index];
        const newPayments = [...(bill.payments || []), { id: `pay_${Date.now()}`, ...payment, date: new Date().toISOString() }];
        const newPaidAmount = newPayments.reduce((sum, p) => sum + Number(p.amount), 0);
        const newBalance = Math.max(0, bill.total - newPaidAmount);
        
        bills[index] = {
          ...bill,
          payments: newPayments,
          paidAmount: newPaidAmount,
          balance: newBalance,
          paymentStatus: newBalance === 0 ? 'Paid' : 'Partially Paid'
        };
        
        setStored('bills', bills);

        await api.patients.addTimelineEvent(bill.patientId, {
          event: 'Billing Payment Received',
          description: `Payment of ₹${payment.amount.toLocaleString()} received via ${payment.method}. Ref: ${payment.referenceNo || 'N/A'}`,
          staffMember: payment.receivedBy || 'Ravi Shankar',
          staffRole: 'Billing'
        });

        return bills[index];
      }
      throw new Error('Invoice not found');
    }
  },

  // Notifications & Alerts API
  notifications: {
    getAll: async () => getStored('notifications', initialNotifications),
    create: (notif) => {
      const notifs = getStored('notifications', initialNotifications);
      const newNotif = {
        _id: `notif_${Date.now()}`,
        isRead: false,
        createdAt: new Date().toISOString(),
        ...notif
      };
      setStored('notifications', [newNotif, ...notifs]);
      return newNotif;
    },
    markRead: async (notifId) => {
      const notifs = getStored('notifications', initialNotifications);
      const updated = notifs.map(n => n._id === notifId ? { ...n, isRead: true } : n);
      setStored('notifications', updated);
      return { success: true };
    }
  }
};
