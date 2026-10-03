import React, { useState } from 'react';
import { useHospital } from '../../context/HospitalContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import {
  Pill,
  PackageCheck,
  AlertTriangle,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Layers,
  X,
  TrendingDown,
  ShieldAlert
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const PharmacyPage = () => {
  const { medicines, orders, refreshData, showToast } = useHospital();
  const { currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState('queue');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDispenseModal, setShowDispenseModal] = useState(false);
  const [batchLot, setBatchLot] = useState('BAT-2026-001');

  // Add stock modal state
  const [showStockModal, setShowStockModal] = useState(false);
  const [selectedMed, setSelectedMed] = useState(null);
  const [stockAddAmount, setStockAddAmount] = useState(100);

  const pharmacyQueue = orders.filter(o => ['Medication', 'Injection', 'IV Fluid'].includes(o.category));
  const pendingOrders = pharmacyQueue.filter(o => o.pharmacyStatus !== 'Dispensed');
  const lowStockMeds = medicines.filter(m => m.stock <= m.minStock);

  const handleOpenDispense = (order) => {
    setSelectedOrder(order);
    setShowDispenseModal(true);
  };

  const handleConfirmDispense = async () => {
    if (!selectedOrder) return;
    try {
      await api.pharmacy.dispenseMedicine(selectedOrder.orderId, batchLot, currentUser?.name);
      await refreshData();
      showToast(`Order ${selectedOrder.orderId} (${selectedOrder.medicineName}) dispensed to ward!`, 'success');
      setShowDispenseModal(false);
    } catch (e) {
      showToast(e.message, 'danger');
    }
  };

  const handleAddStock = async (e) => {
    e.preventDefault();
    if (!selectedMed) return;
    try {
      await api.pharmacy.updateStock(selectedMed._id, Number(stockAddAmount));
      await refreshData();
      showToast(`Added ${stockAddAmount} units to ${selectedMed.name} stock`, 'success');
      setShowStockModal(false);
    } catch (e) {
      showToast(e.message, 'danger');
    }
  };

  const filteredMedicines = medicines.filter(m =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.genericName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Pill size={24} color="var(--accent-teal)" />
            <h1>Central Hospital Pharmacy & Inventory</h1>
          </div>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            Dispense inpatient physician orders, monitor lot batches and manage hospital drug stock thresholds.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <span className="badge badge-normal" style={{ padding: '6px 12px' }}>
            Pharmacist: {currentUser?.name || 'Suresh Pandey'}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-header">
        <button 
          className={`tab-btn ${activeTab === 'queue' ? 'active' : ''}`}
          onClick={() => setActiveTab('queue')}
        >
          <PackageCheck size={16} />
          <span>Prescription Dispensing Queue ({pendingOrders.length} Pending)</span>
        </button>

        <button 
          className={`tab-btn ${activeTab === 'inventory' ? 'active' : ''}`}
          onClick={() => setActiveTab('inventory')}
        >
          <Layers size={16} />
          <span>Formulary & Stock Inventory ({medicines.length})</span>
        </button>
      </div>

      {/* TAB 1: DISPENSING QUEUE */}
      {activeTab === 'queue' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {lowStockMeds.length > 0 && (
            <div style={{
              backgroundColor: 'var(--amber-light)',
              border: '1px solid rgba(217, 119, 6, 0.3)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--amber-warning)', fontWeight: 700, fontSize: '0.85rem' }}>
                <AlertTriangle size={18} />
                <span>Inventory Alert: {lowStockMeds.length} medicine(s) are below safety minimum stock.</span>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('inventory')}>
                Review Stock
              </button>
            </div>
          )}

          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <Clock size={18} color="var(--accent-teal)" />
                <span>Doctor Prescriptions Inbound Stream</span>
              </div>
            </div>

            <div className="table-container">
              <table className="med-table">
                <thead>
                  <tr>
                    <th>Order #</th>
                    <th>Patient & Bed</th>
                    <th>Medicine & Dosage</th>
                    <th>Route / Frequency</th>
                    <th>Prescribing Doctor</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pharmacyQueue.map(order => {
                    const isDispensed = order.pharmacyStatus === 'Dispensed';

                    return (
                      <tr key={order._id}>
                        <td className="mono" style={{ fontWeight: 700, color: 'var(--accent-teal)' }}>
                          {order.orderId}
                        </td>
                        <td>
                          <div style={{ fontWeight: 700, color: 'var(--primary-navy)' }}>{order.patientName}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            <span className="mono">{order.patientId}</span> • {order.ward} (Bed {order.bed})
                          </div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 700 }}>{order.medicineName}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Dose: {order.dosage}</div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{order.route} • {order.frequency}</div>
                          {order.instruction && (
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                              "{order.instruction}"
                            </div>
                          )}
                        </td>
                        <td style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                          {order.doctorName}
                        </td>
                        <td>
                          <span className={`badge ${isDispensed ? 'badge-dispensed' : 'badge-preparing'}`}>
                            {order.pharmacyStatus || 'Preparing'}
                          </span>
                        </td>
                        <td>
                          {isDispensed ? (
                            <span style={{ fontSize: '0.75rem', color: 'var(--emerald-success)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                              <CheckCircle2 size={14} /> Sent to Ward
                            </span>
                          ) : (
                            <button 
                              className="btn btn-primary btn-sm"
                              onClick={() => handleOpenDispense(order)}
                            >
                              <PackageCheck size={14} />
                              <span>Dispense</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: INVENTORY */}
      {activeTab === 'inventory' && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Layers size={18} color="var(--accent-teal)" />
              <span>Drug Formulary & Real-Time Stock Count</span>
            </div>

            <div style={{ width: '280px' }}>
              <input 
                type="text" 
                className="form-control" 
                placeholder="Search drug code, generic, brand..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="table-container">
            <table className="med-table">
              <thead>
                <tr>
                  <th>Drug Code</th>
                  <th>Brand & Generic Name</th>
                  <th>Category / Form</th>
                  <th>Batch Lot & Expiry</th>
                  <th>Current Stock</th>
                  <th>Unit / Selling Price</th>
                  <th>Status & Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredMedicines.map(med => {
                  const isLow = med.stock <= med.minStock;

                  return (
                    <tr key={med._id}>
                      <td className="mono" style={{ fontWeight: 700, color: 'var(--primary-navy)' }}>
                        {med.code}
                      </td>
                      <td>
                        <div style={{ fontWeight: 700, color: 'var(--primary-navy)' }}>{med.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{med.genericName} • {med.strength}</div>
                      </td>
                      <td>
                        <span className="badge badge-neutral">{med.category}</span>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>{med.form}</div>
                      </td>
                      <td>
                        <div className="mono" style={{ fontSize: '0.78rem' }}>{med.batchNumber}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Exp: {new Date(med.expiryDate).toLocaleDateString()}</div>
                      </td>
                      <td>
                        <div className="mono" style={{ fontWeight: 800, fontSize: '1rem', color: isLow ? 'var(--rose-danger)' : 'var(--primary-navy)' }}>
                          {med.stock} Units
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Min: {med.minStock}</div>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>₹{med.sellingPrice}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Cost: ₹{med.unitPrice}</div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span className={`badge ${isLow ? 'badge-emergency' : 'badge-normal'}`}>
                            {med.status}
                          </span>
                          <button 
                            className="btn btn-secondary btn-sm"
                            onClick={() => {
                              setSelectedMed(med);
                              setShowStockModal(true);
                            }}
                          >
                            <Plus size={12} />
                            <span>Add</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Dispense Modal */}
      {showDispenseModal && selectedOrder && (
        <div className="modal-overlay" onClick={() => setShowDispenseModal(false)}>
          <div className="modal-dialog" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--primary-navy)' }}>
                Verify & Dispense Prescription
              </div>
              <button className="btn-icon" onClick={() => setShowDispenseModal(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{
                backgroundColor: 'var(--bg-surface-alt)',
                border: '1px solid var(--border-light)',
                padding: '16px',
                borderRadius: 'var(--radius-md)'
              }}>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
                  {selectedOrder.medicineName} ({selectedOrder.dosage})
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                  Patient: <strong>{selectedOrder.patientName} ({selectedOrder.patientId})</strong>
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--accent-teal)', marginTop: 2 }}>
                  Destination: {selectedOrder.ward} (Bed {selectedOrder.bed})
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Batch Lot Number</label>
                <input 
                  type="text" 
                  className="form-control"
                  value={batchLot}
                  onChange={e => setBatchLot(e.target.value)}
                />
              </div>

              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Authorized Pharmacist Signature: <strong>{currentUser?.name || 'Suresh Pandey'}</strong>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowDispenseModal(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleConfirmDispense}>
                Confirm & Dispatch to Ward
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Stock Modal */}
      {showStockModal && selectedMed && (
        <div className="modal-overlay" onClick={() => setShowStockModal(false)}>
          <div className="modal-dialog" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--primary-navy)' }}>
                Replenish Inventory: {selectedMed.name}
              </div>
              <button className="btn-icon" onClick={() => setShowStockModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddStock}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Current Stock: <strong>{selectedMed.stock} units</strong> (Min: {selectedMed.minStock})
                </div>

                <div className="form-group">
                  <label className="form-label">Quantity to Add (Units)</label>
                  <input 
                    type="number" 
                    className="form-control"
                    value={stockAddAmount}
                    onChange={e => setStockAddAmount(e.target.value)}
                    min="1"
                    required
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowStockModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Update Stock Level
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
