import React, { useState } from 'react';
import { useHospital } from '../../context/HospitalContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import {
  Receipt,
  CreditCard,
  Printer,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Plus,
  Search,
  X,
  FileText,
  Building,
  Activity
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const BillingPage = () => {
  const { bills, patients, refreshData, showToast } = useHospital();
  const { currentUser } = useAuth();

  const [selectedBill, setSelectedBill] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    method: 'UPI',
    referenceNo: 'UPI-' + Math.floor(10000000 + Math.random() * 90000000)
  });

  const totalRevenue = bills.reduce((sum, b) => sum + (b.paidAmount || 0), 0);
  const totalOutstanding = bills.reduce((sum, b) => sum + (b.balance || 0), 0);

  const handleOpenPayment = (bill) => {
    setSelectedBill(bill);
    setPaymentForm({
      amount: bill.balance,
      method: 'UPI',
      referenceNo: 'UPI-' + Math.floor(10000000 + Math.random() * 90000000)
    });
    setShowPaymentModal(true);
  };

  const handleOpenInvoice = (bill) => {
    setSelectedBill(bill);
    setShowInvoiceModal(true);
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!selectedBill) return;
    try {
      await api.billing.recordPayment(selectedBill.invoiceId, {
        amount: Number(paymentForm.amount),
        method: paymentForm.method,
        referenceNo: paymentForm.referenceNo,
        receivedBy: currentUser?.name || 'Ravi Shankar'
      });

      await refreshData();
      showToast(`Payment of ₹${Number(paymentForm.amount).toLocaleString()} recorded successfully for ${selectedBill.invoiceId}`, 'success');
      setShowPaymentModal(false);
    } catch (err) {
      showToast(err.message, 'danger');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Receipt size={24} color="var(--accent-teal)" />
            <h1>Hospital Billing & Financial Invoicing</h1>
          </div>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            Real-time itemized charge accumulation across patient journey, invoice generation & payment processing.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <span className="badge badge-normal" style={{ padding: '6px 12px' }}>
            Finance Officer: {currentUser?.name || 'Ravi Shankar'}
          </span>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        <div className="card" style={{ borderLeft: '4px solid var(--emerald-success)' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Total Realized Revenue
          </div>
          <div className="mono" style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--emerald-success)', margin: '4px 0' }}>
            ₹{totalRevenue.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Collected across {bills.length} patient invoices
          </div>
        </div>

        <div className="card" style={{ borderLeft: '4px solid var(--amber-warning)' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Outstanding Patient Receivables
          </div>
          <div className="mono" style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--amber-warning)', margin: '4px 0' }}>
            ₹{totalOutstanding.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Pending settlement before discharge clearance
          </div>
        </div>
      </div>

      {/* Invoices Ledger Table */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <FileText size={18} color="var(--accent-teal)" />
            <span>Active Hospital Invoices Ledger ({bills.length})</span>
          </div>
        </div>

        <div className="table-container">
          <table className="med-table">
            <thead>
              <tr>
                <th>Invoice Identifier</th>
                <th>Patient Details</th>
                <th>Admission Ward / Bed</th>
                <th>Itemized Subtotal</th>
                <th>Net Total (₹)</th>
                <th>Paid / Balance</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bills.map(bill => (
                <tr key={bill._id}>
                  <td className="mono" style={{ fontWeight: 800, color: 'var(--primary-navy)' }}>
                    {bill.invoiceId}
                  </td>
                  <td>
                    <Link to={`/patient/${bill.patientId}`} style={{ fontWeight: 700, color: 'var(--primary-navy)', textDecoration: 'none' }}>
                      {bill.patientName}
                    </Link>
                    <div className="mono" style={{ fontSize: '0.72rem', color: 'var(--accent-teal)' }}>
                      {bill.patientId}
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-neutral">
                      {bill.wardName} (Bed {bill.bedNumber})
                    </span>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      {(bill.items || []).length} billable items
                    </div>
                  </td>
                  <td>
                    <div className="mono" style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--primary-navy)' }}>
                      ₹{bill.total.toLocaleString()}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--emerald-success)' }}>
                      Paid: ₹{bill.paidAmount.toLocaleString()}
                    </div>
                    {bill.balance > 0 && (
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--rose-danger)' }}>
                        Bal: ₹{bill.balance.toLocaleString()}
                      </div>
                    )}
                  </td>
                  <td>
                    <span className={`badge ${bill.paymentStatus === 'Paid' ? 'badge-paid' : 'badge-partially-paid'}`}>
                      {bill.paymentStatus}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {bill.balance > 0 && (
                        <button 
                          className="btn btn-primary btn-sm"
                          onClick={() => handleOpenPayment(bill)}
                        >
                          <CreditCard size={14} />
                          <span>Pay</span>
                        </button>
                      )}
                      <button 
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleOpenInvoice(bill)}
                      >
                        <Printer size={14} />
                        <span>Print Bill</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Payment Modal */}
      {showPaymentModal && selectedBill && (
        <div className="modal-overlay" onClick={() => setShowPaymentModal(false)}>
          <div className="modal-dialog" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--primary-navy)' }}>
                Process Payment: {selectedBill.invoiceId}
              </div>
              <button className="btn-icon" onClick={() => setShowPaymentModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handlePaymentSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{
                  backgroundColor: 'var(--bg-surface-alt)',
                  border: '1px solid var(--border-light)',
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Patient: <strong>{selectedBill.patientName}</strong></div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>PID: {selectedBill.patientId}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Outstanding Balance</div>
                    <div className="mono" style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--rose-danger)' }}>
                      ₹{selectedBill.balance.toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Payment Amount (₹) <span className="required">*</span></label>
                  <input 
                    type="number" 
                    className="form-control"
                    value={paymentForm.amount}
                    onChange={e => setPaymentForm(prev => ({ ...prev, amount: e.target.value }))}
                    max={selectedBill.balance}
                    min="1"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Payment Mode</label>
                  <select 
                    className="form-select"
                    value={paymentForm.method}
                    onChange={e => setPaymentForm(prev => ({ ...prev, method: e.target.value }))}
                  >
                    <option value="UPI">UPI (Google Pay / PhonePe / Paytm)</option>
                    <option value="Card">Credit / Debit Card</option>
                    <option value="Cash">Cash at Billing Counter</option>
                    <option value="Insurance">TPA Insurance Direct Settlement</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Transaction / Cheque / Reference ID</label>
                  <input 
                    type="text" 
                    className="form-control"
                    value={paymentForm.referenceNo}
                    onChange={e => setPaymentForm(prev => ({ ...prev, referenceNo: e.target.value }))}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowPaymentModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Confirm Payment Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Printable Invoice Modal */}
      {showInvoiceModal && selectedBill && (
        <div className="modal-overlay" onClick={() => setShowInvoiceModal(false)}>
          <div className="modal-dialog modal-xl" onClick={e => e.stopPropagation()}>
            <div className="modal-header no-print">
              <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--primary-navy)' }}>
                Official Hospital Invoice Statement
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn btn-primary btn-sm" onClick={() => window.print()}>
                  <Printer size={14} />
                  <span>Print Invoice</span>
                </button>
                <button className="btn-icon" onClick={() => setShowInvoiceModal(false)}>
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="modal-body" style={{ padding: '32px' }}>
              {/* Official Hospital Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid var(--primary-navy)', paddingBottom: '20px', marginBottom: '24px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--accent-teal)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                      <Activity size={22} />
                    </div>
                    <div>
                      <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary-navy)' }}>MEDNEXUS MULTISPECIALTY HOSPITAL</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Tertiary Care, NABH Accredited • Reg No: MH/HOSP/2026/0948</div>
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div className="mono" style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
                    {selectedBill.invoiceId}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Date: {new Date().toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* Patient & Admission Info */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', backgroundColor: 'var(--bg-surface-alt)', padding: '16px', borderRadius: 'var(--radius-md)', marginBottom: '24px' }}>
                <div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>PATIENT DETAILS</div>
                  <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--primary-navy)' }}>{selectedBill.patientName}</div>
                  <div className="mono" style={{ fontSize: '0.85rem', color: 'var(--accent-teal)' }}>PID: {selectedBill.patientId}</div>
                </div>

                <div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>ADMISSION REFERENCE</div>
                  <div style={{ fontWeight: 700 }}>{selectedBill.admissionId}</div>
                  <div style={{ fontSize: '0.85rem' }}>{selectedBill.wardName} (Bed {selectedBill.bedNumber})</div>
                </div>
              </div>

              {/* Itemized Table */}
              <table className="med-table" style={{ marginBottom: '24px' }}>
                <thead>
                  <tr>
                    <th>Item Description</th>
                    <th>Category</th>
                    <th>Qty</th>
                    <th>Rate (₹)</th>
                    <th>Amount (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {(selectedBill.items || []).map((item, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 600 }}>{item.description}</td>
                      <td><span className="badge badge-neutral">{item.category}</span></td>
                      <td>{item.quantity}</td>
                      <td>₹{item.unitPrice.toLocaleString()}</td>
                      <td style={{ fontWeight: 700 }}>₹{item.totalPrice.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals Calculation */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
                <div style={{ width: '320px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Subtotal:</span>
                    <strong className="mono">₹{selectedBill.subtotal.toLocaleString()}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Tax (5% GST):</span>
                    <strong className="mono">₹{selectedBill.taxAmount?.toLocaleString() || '464.50'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid var(--border-light)', paddingTop: '8px', fontSize: '1.15rem' }}>
                    <span style={{ fontWeight: 800 }}>Total Invoice Amount:</span>
                    <strong className="mono" style={{ color: 'var(--primary-navy)' }}>₹{selectedBill.total.toLocaleString()}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--emerald-success)' }}>
                    <span>Total Paid:</span>
                    <strong className="mono">₹{selectedBill.paidAmount.toLocaleString()}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: selectedBill.balance > 0 ? 'var(--rose-danger)' : 'var(--emerald-success)', fontWeight: 800 }}>
                    <span>Balance Due:</span>
                    <strong className="mono">₹{selectedBill.balance.toLocaleString()}</strong>
                  </div>
                </div>
              </div>

              {/* Signatures */}
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-light)', paddingTop: '40px', marginTop: '40px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ borderTop: '1px solid var(--text-muted)', width: '180px', paddingTop: '6px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Patient / Next of Kin Signature
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ borderTop: '1px solid var(--text-muted)', width: '180px', paddingTop: '6px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Authorized Billing Officer
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
