import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';

interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string | null;
}

interface BookingLog {
  id: string;
  action: string;
  details: any;
  createdAt: string;
}

interface Booking {
  id: string;
  branchId: string;
  customerId: string;
  date: string;
  slot: string;
  packageName: string;
  balloonColor: string | null;
  cakeOption: string | null;
  sparklers: boolean;
  ledName: string | null;
  messageOnCake: string | null;
  addOns: string[];
  celebrantName: string | null;
  specialNote: string | null;
  guestCount: number;
  status: 'pending_payment' | 'confirmed' | 'cancelled' | 'rescheduled';
  totalPrice: number;
  advancePaid: number;
  balancePaid: boolean;
  internalNotes: string | null;
  razorpayOrderId: string | null;
  razorpayPaymentId: string | null;
  createdAt: string;
  customer?: Customer;
  logs?: BookingLog[];
}

const API_URL = process.env.API_URL || 'http://localhost:3000/api';

const AppointmentManager: React.FC = () => {
  const [mounted, setMounted] = useState<boolean>(false);
  const [bookingsList, setBookingsList] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Search/Filter states
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [branchFilter, setBranchFilter] = useState<string>('all');

  // Inline edit / Override states
  const [internalNotesInput, setInternalNotesInput] = useState<string>('');

  // Modals state
  const [showRescheduleModal, setShowRescheduleModal] = useState<boolean>(false);
  const [newDate, setNewDate] = useState<string>('');
  const [newSlot, setNewSlot] = useState<string>('');
  const [showEditDetailsModal, setShowEditDetailsModal] = useState<boolean>(false);
  const [editCake, setEditCake] = useState<string>('');
  const [editCakeMsg, setEditCakeMsg] = useState<string>('');
  const [editBalloon, setEditBalloon] = useState<string>('');

  useEffect(() => {
    fetchBookings();
    setMounted(true);
  }, []);

  useEffect(() => {
    applyFilters();
  }, [bookingsList, searchQuery, statusFilter, branchFilter]);

  useEffect(() => {
    if (selectedBooking) {
      // Find the latest state in the main list to keep selection in sync
      const fresh = bookingsList.find(b => b.id === selectedBooking.id);
      if (fresh) {
        setSelectedBooking(fresh);
        setInternalNotesInput(fresh.internalNotes || '');
      }
    }
  }, [bookingsList]);

  const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
  };

  const fetchBookings = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`${API_URL}/admin/bookings`, getHeaders());
      if (response.data.success) {
        setBookingsList(response.data.bookings);
        if (response.data.bookings.length > 0 && !selectedBooking) {
          setSelectedBooking(response.data.bookings[0]);
          setInternalNotesInput(response.data.bookings[0].internalNotes || '');
        }
      }
    } catch (err: any) {
      console.error('Error fetching bookings:', err);
      setError(err.response?.data?.error || 'Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let list = [...bookingsList];

    // Search query
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      list = list.filter(b => 
        b.id.toLowerCase().includes(query) ||
        (b.customer?.name || '').toLowerCase().includes(query) ||
        (b.customer?.phone || '').includes(query)
      );
    }

    // Status Filter
    if (statusFilter !== 'all') {
      list = list.filter(b => b.status === statusFilter);
    }

    // Branch Filter
    if (branchFilter !== 'all') {
      list = list.filter(b => b.branchId === branchFilter);
    }

    setFilteredBookings(list);
  };

  const handleSaveNotes = async () => {
    if (!selectedBooking) return;
    try {
      const response = await axios.patch(
        `${API_URL}/admin/bookings/${selectedBooking.id}`,
        { internalNotes: internalNotesInput },
        getHeaders()
      );
      if (response.data.success) {
        alert('Internal notes updated successfully');
        fetchBookings();
      }
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to save notes');
    }
  };

  const handleMarkBalancePaid = async () => {
    if (!selectedBooking) return;
    try {
      const response = await axios.patch(
        `${API_URL}/admin/bookings/${selectedBooking.id}`,
        { balancePaid: true },
        getHeaders()
      );
      if (response.data.success) {
        fetchBookings();
      }
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to update payment status');
    }
  };

  const handleCancelBooking = async () => {
    if (!selectedBooking) return;
    if (!confirm('Are you sure you want to cancel this booking? This action is irreversible.')) return;
    try {
      const response = await axios.patch(
        `${API_URL}/admin/bookings/${selectedBooking.id}`,
        { status: 'cancelled' },
        getHeaders()
      );
      if (response.data.success) {
        fetchBookings();
      }
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to cancel booking');
    }
  };

  const handleRescheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking) return;
    try {
      const response = await axios.patch(
        `${API_URL}/admin/bookings/${selectedBooking.id}`,
        { date: newDate, slot: newSlot, status: 'rescheduled' },
        getHeaders()
      );
      if (response.data.success) {
        setShowRescheduleModal(false);
        fetchBookings();
      }
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to reschedule booking');
    }
  };

  const handleEditDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking) return;
    try {
      const response = await axios.patch(
        `${API_URL}/admin/bookings/${selectedBooking.id}`,
        { cakeOption: editCake, messageOnCake: editCakeMsg, balloonColor: editBalloon },
        getHeaders()
      );
      if (response.data.success) {
        setShowEditDetailsModal(false);
        fetchBookings();
      }
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to update experience customizations');
    }
  };

  const openRescheduleModal = () => {
    if (!selectedBooking) return;
    setNewDate(selectedBooking.date);
    setNewSlot(selectedBooking.slot);
    setShowRescheduleModal(true);
  };

  const openEditDetailsModal = () => {
    if (!selectedBooking) return;
    setEditCake(selectedBooking.cakeOption || 'none');
    setEditCakeMsg(selectedBooking.messageOnCake || '');
    setEditBalloon(selectedBooking.balloonColor || '');
    setShowEditDetailsModal(true);
  };

  const getWhatsAppLink = (booking: Booking) => {
    if (!booking.customer) return '';
    // Strip special characters from phone
    const cleanedPhone = booking.customer.phone.replace(/[^0-9]/g, '');
    const phoneWithCountry = cleanedPhone.startsWith('91') ? cleanedPhone : `91${cleanedPhone}`;
    const text = `Hello ${booking.customer.name}! This is Dome Cafe. Regarding your reservation (${booking.id}) scheduled on ${booking.date} at ${booking.slot}:`;
    return `https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(text)}`;
  };

  const getActionClass = (action: string) => {
    switch (action) {
      case 'created': return 'log-created';
      case 'status_changed': return 'log-status';
      case 'rescheduled': return 'log-reschedule';
      case 'cake_updated': return 'log-cake';
      default: return 'log-modify';
    }
  };

  // Check unique branch list from current records
  const uniqueBranches = Array.from(new Set(bookingsList.map(b => b.branchId)));

  return (
    <div className="bookings-manager-grid" style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '24px', height: 'calc(100vh - 100px)' }}>
      
      {/* Left Panel: Search & Cards list */}
      <div className="bookings-sidebar panel-card" style={{ display: 'flex', flexDirection: 'column', padding: '20px', gap: '16px', overflowY: 'auto' }}>
        <div className="sidebar-filter-header">
          <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '12px' }}>Appointments List</h2>
          <input
            type="text"
            className="form-control"
            placeholder="Search by ID, name or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ marginBottom: '10px' }}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <select className="form-control" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ fontSize: '12px', padding: '6px' }}>
              <option value="all">All Statuses</option>
              <option value="pending_payment">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="rescheduled">Rescheduled</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <select className="form-control" value={branchFilter} onChange={(e) => setBranchFilter(e.target.value)} style={{ fontSize: '12px', padding: '6px' }}>
              <option value="all">All Branches</option>
              {uniqueBranches.map(b => (
                <option key={b} value={b}>{b.charAt(0).toUpperCase() + b.slice(1)}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>Loading Appointments...</div>
        ) : (
          <div className="cards-scroll-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', flex: 1 }}>
            {filteredBookings.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)', fontSize: '14px' }}>No bookings found matching filters.</div>
            ) : (
              filteredBookings.map((b) => (
                <div
                  key={b.id}
                  onClick={() => setSelectedBooking(b)}
                  style={{
                    backgroundColor: selectedBooking?.id === b.id ? 'rgba(255, 255, 255, 0.04)' : 'rgba(255,255,255,0.01)',
                    border: selectedBooking?.id === b.id ? '1px solid var(--accent-gold)' : '1px solid var(--border-color)',
                    borderRadius: '12px',
                    padding: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 600, fontSize: '14px', color: 'var(--accent-gold)' }}>{b.id}</span>
                    <span className={`status-badge ${b.status}`}>{b.status.replace('_', ' ')}</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '13px' }}>
                    <div style={{ fontWeight: 500, fontSize: '15px' }}>{b.customer?.name}</div>
                    <div style={{ color: 'var(--text-secondary)' }}>
                      {b.date} • {b.slot.split('–')[0]}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                      <span>{b.packageName.toUpperCase()}</span>
                      <span style={{ textTransform: 'capitalize' }}>{b.branchId}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Right Panel: Expanded details and actions */}
      <div className="booking-details-panel panel-card" style={{ overflowY: 'auto', padding: '24px' }}>
        {selectedBooking ? (
          <div className="details-container" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Header section */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '1px' }}>Booking Details</span>
                <h1 style={{ fontSize: '24px', fontWeight: 700, margin: '4px 0 0 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {selectedBooking.id}
                  <span className={`status-badge ${selectedBooking.status}`} style={{ fontSize: '12px' }}>
                    {selectedBooking.status.replace('_', ' ')}
                  </span>
                </h1>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <a
                  href={getWhatsAppLink(selectedBooking)}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-secondary"
                  style={{ textDecoration: 'none', color: '#25D366', borderColor: '#25D366' }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" style={{ marginRight: '6px' }}>
                    <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.907h.003c4.368 0 7.927-3.558 7.93-7.93a7.9 7.9 0 0 0-2.326-5.647zM11.566 10.1c-.2-.1-.1.31-.8-.415-.17-.185-.348-.31-.516-.484-.168-.174-.35-.355-.54-.538-.19-.18-.396-.364-.6-.546-.235-.21-.492-.43-.767-.625-.275-.195-.514-.3-.626-.38a.33.33 0 0 0-.408.063c-.113.117-.492.572-.614.722-.122.15-.243.165-.443.065-.2-.1-.84-.311-1.602-.99-.593-.53-1.002-1.182-1.118-1.382-.117-.2-.012-.311.087-.41.09-.09.2-.23.3-.34.1-.1.137-.17.2-.3.067-.13.033-.245-.017-.345-.05-.1-.444-1.07-.607-1.466-.16-.39-.314-.338-.43-.343a4.7 4.7 0 0 0-.315-.005c-.173.003-.454.066-.692.324-.238.258-.91.89-.91 2.17s.93 2.518 1.06 2.693c.13.174 1.83 2.793 4.43 3.916.62.268 1.102.428 1.48.548.624.2 1.19.17 1.638.103.5-.075 1.53-.625 1.74-1.226c.21-.6.21-1.127.147-1.226-.063-.1-.235-.15-.436-.25z"/>
                  </svg>
                  Message Customer
                </a>

                {selectedBooking.status !== 'cancelled' && (
                  <>
                    <button onClick={openEditDetailsModal} className="btn btn-secondary">Edit</button>
                    <button onClick={openRescheduleModal} className="btn btn-secondary">Reschedule</button>
                  </>
                )}
              </div>
            </div>

            {/* Core Info Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              
              {/* Customer details */}
              <div className="panel-card" style={{ padding: '16px', backgroundColor: 'rgba(255,255,255,0.015)' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 600, borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '12px', color: 'var(--accent-gold)' }}>Customer & Celebrant Details</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                  <tbody>
                    <tr>
                      <td style={{ padding: '6px 0', color: 'var(--text-secondary)' }}>Name</td>
                      <td style={{ padding: '6px 0', fontWeight: 500 }}>{selectedBooking.customer?.name}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '6px 0', color: 'var(--text-secondary)' }}>WhatsApp</td>
                      <td style={{ padding: '6px 0', fontWeight: 500 }}>{selectedBooking.customer?.phone}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '6px 0', color: 'var(--text-secondary)' }}>Email</td>
                      <td style={{ padding: '6px 0', fontWeight: 500 }}>{selectedBooking.customer?.email || 'N/A'}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '6px 0', color: 'var(--text-secondary)' }}>Occasion</td>
                      <td style={{ padding: '6px 0', fontWeight: 500, textTransform: 'capitalize' }}>
                        {selectedBooking.specialNote?.toLowerCase().includes('birthday') || selectedBooking.specialNote?.toLowerCase().includes('anniversary') 
                          ? selectedBooking.specialNote 
                          : 'Special Celebration'}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: '6px 0', color: 'var(--text-secondary)' }}>Celebrant Name</td>
                      <td style={{ padding: '6px 0', fontWeight: 500 }}>{selectedBooking.celebrantName || 'N/A'}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '6px 0', color: 'var(--text-secondary)' }}>Guest Count</td>
                      <td style={{ padding: '6px 0', fontWeight: 500 }}>{selectedBooking.guestCount} guests</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Experience customizations */}
              <div className="panel-card" style={{ padding: '16px', backgroundColor: 'rgba(255,255,255,0.015)' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 600, borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '12px', color: 'var(--accent-gold)' }}>Selected Experience</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                  <tbody>
                    <tr>
                      <td style={{ padding: '6px 0', color: 'var(--text-secondary)' }}>Package</td>
                      <td style={{ padding: '6px 0', fontWeight: 600, color: 'var(--accent-gold)', textTransform: 'uppercase' }}>{selectedBooking.packageName}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '6px 0', color: 'var(--text-secondary)' }}>Balloon Palette</td>
                      <td style={{ padding: '6px 0', fontWeight: 500 }}>{selectedBooking.balloonColor || 'None Selected'}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '6px 0', color: 'var(--text-secondary)' }}>Cake Flavor</td>
                      <td style={{ padding: '6px 0', fontWeight: 500 }}>{selectedBooking.cakeOption || 'Complimentary Compliment'}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '6px 0', color: 'var(--text-secondary)' }}>Message on Cake</td>
                      <td style={{ padding: '6px 0', fontWeight: 500, fontStyle: 'italic' }}>"{selectedBooking.messageOnCake || 'None'}"</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '6px 0', color: 'var(--text-secondary)' }}>LED Light Board</td>
                      <td style={{ padding: '6px 0', fontWeight: 500 }}>{selectedBooking.ledName || 'None'}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '6px 0', color: 'var(--text-secondary)' }}>Add-Ons</td>
                      <td style={{ padding: '6px 0', fontWeight: 500, fontSize: '12px' }}>
                        {selectedBooking.addOns && selectedBooking.addOns.length > 0 
                          ? selectedBooking.addOns.join(', ') 
                          : 'No additional add-ons'}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

            </div>

            {/* Financials & Override details */}
            <div className="panel-card" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '40px' }}>
                <div>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Total Price</span>
                  <div style={{ fontSize: '20px', fontWeight: 700 }}>₹{selectedBooking.totalPrice}</div>
                </div>
                <div>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Advance Paid (Online)</span>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--status-confirmed)' }}>₹{selectedBooking.advancePaid}</div>
                </div>
                <div>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Balance Remaining</span>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: selectedBooking.balancePaid ? 'var(--text-secondary)' : 'var(--status-pending)' }}>
                    {selectedBooking.balancePaid ? '₹0 (Fully Settled)' : `₹${selectedBooking.totalPrice - selectedBooking.advancePaid}`}
                  </div>
                </div>
              </div>

              <div>
                {!selectedBooking.balancePaid && selectedBooking.status !== 'cancelled' ? (
                  <button onClick={handleMarkBalancePaid} className="btn btn-primary">Mark Balance Paid</button>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--status-confirmed)', fontWeight: 600 }}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style={{ width: '20px', height: '20px' }}>
                      <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
                    </svg>
                    Payment Settled
                  </div>
                )}
              </div>
            </div>

            {/* Notes and logs grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '20px' }}>
              
              {/* Internal Notes block */}
              <div className="panel-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 600, borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', color: 'var(--accent-gold)' }}>Internal Admin Notes</h3>
                <textarea
                  className="form-control"
                  rows={6}
                  placeholder="Add notes that only other admins can see..."
                  value={internalNotesInput}
                  onChange={(e) => setInternalNotesInput(e.target.value)}
                  style={{ resize: 'none', fontSize: '13px' }}
                />
                <button onClick={handleSaveNotes} className="btn btn-secondary" style={{ width: 'fit-content', marginLeft: 'auto' }}>Save Notes</button>
              </div>

              {/* Booking Logs (Audit Trail) */}
              <div className="panel-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 600, borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', color: 'var(--accent-gold)' }}>Modification History Log</h3>
                
                <div className="logs-scroller" style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px' }}>
                  {selectedBooking.logs && selectedBooking.logs.length > 0 ? (
                    selectedBooking.logs.map((log) => (
                      <div key={log.id} style={{ padding: '8px 12px', backgroundColor: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span style={{ fontWeight: 600, textTransform: 'capitalize', color: 'var(--accent-gold)' }}>
                            {log.action.replace('_', ' ')}
                          </span>
                          <span style={{ color: 'var(--text-secondary)' }}>
                            {new Date(log.createdAt).toLocaleDateString()} {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div style={{ color: 'var(--text-secondary)' }}>
                          {log.action === 'created' && 'Reservation registered by Customer.'}
                          {log.action === 'status_changed' && `Status updated to ${log.details.newStatus}.`}
                          {log.action === 'rescheduled' && `Date rescheduled to ${log.details.changes?.date?.new || selectedBooking.date} / ${log.details.changes?.slot?.new || selectedBooking.slot}.`}
                          {log.action === 'cake_updated' && 'Cake flavor or wording customizations updated.'}
                          {log.action === 'balance_paid_updated' && 'Balance paid marked as settled.'}
                          {log.action === 'modified' && 'Booking specifications modified.'}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '20px' }}>No modification logs recorded.</div>
                  )}
                </div>
              </div>

            </div>

            {/* Cancel booking option at bottom */}
            {selectedBooking.status !== 'cancelled' && (
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={handleCancelBooking} className="btn btn-secondary" style={{ color: 'var(--status-cancelled)', borderColor: 'rgba(239, 68, 68, 0.3)' }}>Cancel Reservation</button>
              </div>
            )}

          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)' }}>
            Select a booking from the list to view full specifications.
          </div>
        )}
      </div>

      {mounted && typeof window !== 'undefined' && createPortal(
        <>
          {/* Reschedule Modal */}
          {showRescheduleModal && selectedBooking && (
            <div className="modal-overlay">
              <div className="modal-content">
                <div className="modal-header">
                  <h3>Reschedule Reservation: {selectedBooking.id}</h3>
                  <button onClick={() => setShowRescheduleModal(false)} className="modal-close">X</button>
                </div>
                <form onSubmit={handleRescheduleSubmit}>
                  <div className="form-group">
                    <label htmlFor="newDate">Select New Date</label>
                    <input
                      type="date"
                      id="newDate"
                      className="form-control"
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="newSlot">Select New Slot</label>
                    <select
                      id="newSlot"
                      className="form-control"
                      value={newSlot}
                      onChange={(e) => setNewSlot(e.target.value)}
                      required
                    >
                      <option value="5:00 PM – 6:30 PM">Slot 1 (5:00 PM – 6:30 PM)</option>
                      <option value="7:00 PM – 8:30 PM">Slot 2 (7:00 PM – 8:30 PM)</option>
                      <option value="9:00 PM – 10:30 PM">Slot 3 (9:00 PM – 10:30 PM)</option>
                      <option value="11:00 PM – 12:30 AM">Slot 4 (11:00 PM – 12:30 AM)</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
                    <button type="button" onClick={() => setShowRescheduleModal(false)} className="btn btn-secondary">Cancel</button>
                    <button type="submit" className="btn btn-primary">Reschedule</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Edit Details (Cake & Palette) Modal */}
          {showEditDetailsModal && selectedBooking && (
            <div className="modal-overlay">
              <div className="modal-content">
                <div className="modal-header">
                  <h3>Edit Experience Customizations: {selectedBooking.id}</h3>
                  <button onClick={() => setShowEditDetailsModal(false)} className="modal-close">X</button>
                </div>
                <form onSubmit={handleEditDetailsSubmit}>
                  <div className="form-group">
                    <label htmlFor="editCake">Cake Flavor</label>
                    <select
                      id="editCake"
                      className="form-control"
                      value={editCake}
                      onChange={(e) => setEditCake(e.target.value)}
                    >
                      <option value="none">Complimentary Compliment</option>
                      <option value="chocolate">Chocolate</option>
                      <option value="black-forest">Black Forest</option>
                      <option value="white-forest">White Forest</option>
                      <option value="butterscotch">Butterscotch</option>
                      <option value="red-velvet">Red Velvet (+₹250)</option>
                      <option value="chocolate-truffle">Chocolate Truffle (+₹250)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="editCakeMsg">Message on Cake</label>
                    <input
                      type="text"
                      id="editCakeMsg"
                      className="form-control"
                      value={editCakeMsg}
                      onChange={(e) => setEditCakeMsg(e.target.value)}
                      placeholder="e.g. Happy Birthday John!"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="editBalloon">Balloon Palette</label>
                    <input
                      type="text"
                      id="editBalloon"
                      className="form-control"
                      value={editBalloon}
                      onChange={(e) => setEditBalloon(e.target.value)}
                      placeholder="e.g. Rose Gold & White, Pastel Blue"
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
                    <button type="button" onClick={() => setShowEditDetailsModal(false)} className="btn btn-secondary">Cancel</button>
                    <button type="submit" className="btn btn-primary">Save Changes</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </>,
        document.body
      )}
    </div>
  );
};

export default AppointmentManager;
