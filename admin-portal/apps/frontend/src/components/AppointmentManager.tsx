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

  // Detail modal state
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false);

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
  const [slotsAvailability, setSlotsAvailability] = useState<Record<string, { available: boolean; reason?: string }>>({});
  const [loadingAvailability, setLoadingAvailability] = useState<boolean>(false);
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

  const fetchAvailability = async (date: string, branchId: string) => {
    if (!date || !branchId) return;
    setLoadingAvailability(true);
    try {
      const response = await axios.get(`${API_URL}/booking/availability`, {
        params: { 
          branchId, 
          date,
          excludeBookingId: selectedBooking?.id
        }
      });
      if (response.data.success) {
        const slots = response.data.slots;
        setSlotsAvailability(slots);
        
        // Auto-select first available slot if current selection is disabled on new date
        const isSelectedSlotAvailable = slots[newSlot]?.available ?? false;
        
        if (!isSelectedSlotAvailable) {
          const firstAvailable = Object.keys(slots).find(slotVal => slots[slotVal]?.available);
          if (firstAvailable) {
            setNewSlot(firstAvailable);
          } else {
            setNewSlot('');
          }
        }
      }
    } catch (err) {
      console.error('Error fetching slot availability:', err);
    } finally {
      setLoadingAvailability(false);
    }
  };

  useEffect(() => {
    if (showRescheduleModal && selectedBooking && newDate) {
      fetchAvailability(newDate, selectedBooking.branchId);
    }
  }, [newDate, showRescheduleModal, selectedBooking]);

  const isSlotDisabled = (slotValue: string) => {
    const status = slotsAvailability[slotValue];
    return status ? !status.available : false;
  };

  const getSlotSuffix = (slotValue: string) => {
    const status = slotsAvailability[slotValue];
    if (status && !status.available) {
      return ` - Blocked (${status.reason || 'Unavailable'})`;
    }
    if (selectedBooking && newDate === selectedBooking.date && slotValue === selectedBooking.slot) {
      return ' (Current)';
    }
    return '';
  };

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

  const openDetailModal = (booking: Booking) => {
    setSelectedBooking(booking);
    setInternalNotesInput(booking.internalNotes || '');
    setShowDetailModal(true);
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
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

  // Check unique branch list from current records
  const uniqueBranches = Array.from(new Set(bookingsList.map(b => b.branchId)));

  return (
    <div className="bookings-manager" style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: 'calc(100vh - 100px)' }}>
      
      {/* Header & Filters */}
      <div className="panel-card" style={{ padding: '20px', flexShrink: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 700, margin: 0 }}>Appointments</h1>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
              Click on any appointment to view full details and manage it.
            </p>
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            {filteredBookings.length} of {bookingsList.length} appointments
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <input
            type="text"
            className="form-control"
            placeholder="Search by ID, name or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ flex: 1, maxWidth: '400px' }}
          />
          <select className="form-control" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ fontSize: '13px', padding: '8px 12px', width: '160px' }}>
            <option value="all">All Statuses</option>
            <option value="pending_payment">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="rescheduled">Rescheduled</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select className="form-control" value={branchFilter} onChange={(e) => setBranchFilter(e.target.value)} style={{ fontSize: '13px', padding: '8px 12px', width: '160px' }}>
            <option value="all">All Branches</option>
            {uniqueBranches.map(b => (
              <option key={b} value={b}>{b.charAt(0).toUpperCase() + b.slice(1)}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Appointments List */}
      <div className="panel-card" style={{ flex: 1, overflowY: 'auto', padding: '0' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>Loading Appointments...</div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--status-cancelled)' }}>{error}</div>
        ) : filteredBookings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)', fontSize: '14px' }}>No bookings found matching filters.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                <th style={{ padding: '14px 20px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-secondary)', fontWeight: 600 }}>Booking ID</th>
                <th style={{ padding: '14px 16px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-secondary)', fontWeight: 600 }}>Customer</th>
                <th style={{ padding: '14px 16px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-secondary)', fontWeight: 600 }}>Date</th>
                <th style={{ padding: '14px 16px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-secondary)', fontWeight: 600 }}>Slot</th>
                <th style={{ padding: '14px 16px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-secondary)', fontWeight: 600 }}>Package</th>
                <th style={{ padding: '14px 16px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-secondary)', fontWeight: 600 }}>Branch</th>
                <th style={{ padding: '14px 16px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-secondary)', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '14px 16px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-secondary)', fontWeight: 600 }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((b) => (
                <tr
                  key={b.id}
                  onClick={() => openDetailModal(b)}
                  style={{
                    borderBottom: '1px solid var(--border-color)',
                    cursor: 'pointer',
                    transition: 'background-color 0.15s ease',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  <td style={{ padding: '14px 20px', fontWeight: 600, color: 'var(--accent-gold)', fontFamily: 'monospace', fontSize: '13px' }}>{b.id}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ fontWeight: 500 }}>{b.customer?.name || 'Guest'}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{b.customer?.phone || ''}</div>
                  </td>
                  <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>{b.date}</td>
                  <td style={{ padding: '14px 16px', fontSize: '12px', color: 'var(--text-secondary)' }}>{b.slot.split('–')[0].trim()}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{b.packageName}</span>
                  </td>
                  <td style={{ padding: '14px 16px', textTransform: 'capitalize', fontSize: '13px' }}>{b.branchId}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <span className={`status-badge ${b.status}`}>{b.status.replace('_', ' ')}</span>
                  </td>
                  <td style={{ padding: '14px 16px', fontWeight: 600 }}>₹{b.totalPrice}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* All Modals via Portal */}
      {mounted && typeof window !== 'undefined' && createPortal(
        <>
          {/* Appointment Detail Modal */}
          {showDetailModal && selectedBooking && (
            <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) closeDetailModal(); }}>
              <div className="modal-content" style={{ width: '780px', maxWidth: '95vw', maxHeight: '92vh', overflowY: 'auto', padding: 0 }}>
                
                {/* Modal Header */}
                <div style={{ padding: '24px 28px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'sticky', top: 0, backgroundColor: 'var(--bg-secondary)', zIndex: 1 }}>
                  <div>
                    <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '1px' }}>Booking Details</span>
                    <h2 style={{ fontSize: '22px', fontWeight: 700, margin: '4px 0 0 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {selectedBooking.id}
                      <span className={`status-badge ${selectedBooking.status}`} style={{ fontSize: '11px' }}>
                        {selectedBooking.status.replace('_', ' ')}
                      </span>
                    </h2>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <a
                      href={getWhatsAppLink(selectedBooking)}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-secondary"
                      style={{ textDecoration: 'none', color: '#25D366', borderColor: '#25D366', padding: '6px 12px', fontSize: '12px' }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16" style={{ marginRight: '4px', verticalAlign: '-2px' }}>
                        <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.907h.003c4.368 0 7.927-3.558 7.93-7.93a7.9 7.9 0 0 0-2.326-5.647zM11.566 10.1c-.2-.1-.1.31-.8-.415-.17-.185-.348-.31-.516-.484-.168-.174-.35-.355-.54-.538-.19-.18-.396-.364-.6-.546-.235-.21-.492-.43-.767-.625-.275-.195-.514-.3-.626-.38a.33.33 0 0 0-.408.063c-.113.117-.492.572-.614.722-.122.15-.243.165-.443.065-.2-.1-.84-.311-1.602-.99-.593-.53-1.002-1.182-1.118-1.382-.117-.2-.012-.311.087-.41.09-.09.2-.23.3-.34.1-.1.137-.17.2-.3.067-.13.033-.245-.017-.345-.05-.1-.444-1.07-.607-1.466-.16-.39-.314-.338-.43-.343a4.7 4.7 0 0 0-.315-.005c-.173.003-.454.066-.692.324-.238.258-.91.89-.91 2.17s.93 2.518 1.06 2.693c.13.174 1.83 2.793 4.43 3.916.62.268 1.102.428 1.48.548.624.2 1.19.17 1.638.103.5-.075 1.53-.625 1.74-1.226.21-.6.21-1.127.147-1.226-.063-.1-.235-.15-.436-.25z"/>
                      </svg>
                      WhatsApp
                    </a>

                    {selectedBooking.status !== 'cancelled' && (
                      <>
                        <button onClick={openEditDetailsModal} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }}>Edit</button>
                        <button onClick={openRescheduleModal} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }}>Reschedule</button>
                      </>
                    )}
                    <button onClick={closeDetailModal} className="modal-close" style={{ marginLeft: '8px' }}>X</button>
                  </div>
                </div>

                {/* Modal Body */}
                <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

                  {/* Core Info Cards */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    
                    {/* Customer details */}
                    <div className="panel-card" style={{ padding: '16px', backgroundColor: 'rgba(255,255,255,0.015)', backdropFilter: 'none', boxShadow: 'none' }}>
                      <h3 style={{ fontSize: '14px', fontWeight: 600, borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '12px', color: 'var(--accent-gold)' }}>Customer & Celebrant Details</h3>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                        <tbody>
                          <tr>
                            <td style={{ padding: '5px 0', color: 'var(--text-secondary)', width: '40%' }}>Name</td>
                            <td style={{ padding: '5px 0', fontWeight: 500 }}>{selectedBooking.customer?.name}</td>
                          </tr>
                          <tr>
                            <td style={{ padding: '5px 0', color: 'var(--text-secondary)' }}>WhatsApp</td>
                            <td style={{ padding: '5px 0', fontWeight: 500 }}>{selectedBooking.customer?.phone}</td>
                          </tr>
                          <tr>
                            <td style={{ padding: '5px 0', color: 'var(--text-secondary)' }}>Email</td>
                            <td style={{ padding: '5px 0', fontWeight: 500 }}>{selectedBooking.customer?.email || 'N/A'}</td>
                          </tr>
                          <tr>
                            <td style={{ padding: '5px 0', color: 'var(--text-secondary)' }}>Occasion</td>
                            <td style={{ padding: '5px 0', fontWeight: 500, textTransform: 'capitalize' }}>
                              {selectedBooking.specialNote?.toLowerCase().includes('birthday') || selectedBooking.specialNote?.toLowerCase().includes('anniversary') 
                                ? selectedBooking.specialNote 
                                : 'Special Celebration'}
                            </td>
                          </tr>
                          <tr>
                            <td style={{ padding: '5px 0', color: 'var(--text-secondary)' }}>Celebrant Name</td>
                            <td style={{ padding: '5px 0', fontWeight: 500 }}>{selectedBooking.celebrantName || 'N/A'}</td>
                          </tr>
                          <tr>
                            <td style={{ padding: '5px 0', color: 'var(--text-secondary)' }}>Guest Count</td>
                            <td style={{ padding: '5px 0', fontWeight: 500 }}>{selectedBooking.guestCount} guests</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Experience customizations */}
                    <div className="panel-card" style={{ padding: '16px', backgroundColor: 'rgba(255,255,255,0.015)', backdropFilter: 'none', boxShadow: 'none' }}>
                      <h3 style={{ fontSize: '14px', fontWeight: 600, borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '12px', color: 'var(--accent-gold)' }}>Selected Experience</h3>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                        <tbody>
                          <tr>
                            <td style={{ padding: '5px 0', color: 'var(--text-secondary)', width: '40%' }}>Package</td>
                            <td style={{ padding: '5px 0', fontWeight: 600, color: 'var(--accent-gold)', textTransform: 'uppercase' }}>{selectedBooking.packageName}</td>
                          </tr>
                          <tr>
                            <td style={{ padding: '5px 0', color: 'var(--text-secondary)' }}>Date & Slot</td>
                            <td style={{ padding: '5px 0', fontWeight: 500 }}>{selectedBooking.date} • {selectedBooking.slot}</td>
                          </tr>
                          <tr>
                            <td style={{ padding: '5px 0', color: 'var(--text-secondary)' }}>Balloon Palette</td>
                            <td style={{ padding: '5px 0', fontWeight: 500 }}>{selectedBooking.balloonColor || 'None Selected'}</td>
                          </tr>
                          <tr>
                            <td style={{ padding: '5px 0', color: 'var(--text-secondary)' }}>Cake Flavor</td>
                            <td style={{ padding: '5px 0', fontWeight: 500 }}>{selectedBooking.cakeOption || 'Complimentary Compliment'}</td>
                          </tr>
                          <tr>
                            <td style={{ padding: '5px 0', color: 'var(--text-secondary)' }}>Message on Cake</td>
                            <td style={{ padding: '5px 0', fontWeight: 500, fontStyle: 'italic' }}>"{selectedBooking.messageOnCake || 'None'}"</td>
                          </tr>
                          <tr>
                            <td style={{ padding: '5px 0', color: 'var(--text-secondary)' }}>LED Light Board</td>
                            <td style={{ padding: '5px 0', fontWeight: 500 }}>{selectedBooking.ledName || 'None'}</td>
                          </tr>
                          <tr>
                            <td style={{ padding: '5px 0', color: 'var(--text-secondary)' }}>Add-Ons</td>
                            <td style={{ padding: '5px 0', fontWeight: 500, fontSize: '12px' }}>
                              {selectedBooking.addOns && selectedBooking.addOns.length > 0 
                                ? selectedBooking.addOns.join(', ') 
                                : 'No additional add-ons'}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Financials */}
                  <div className="panel-card" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backdropFilter: 'none', boxShadow: 'none' }}>
                    <div style={{ display: 'flex', gap: '40px' }}>
                      <div>
                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Price</span>
                        <div style={{ fontSize: '20px', fontWeight: 700 }}>₹{selectedBooking.totalPrice}</div>
                      </div>
                      <div>
                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Advance Paid</span>
                        <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--status-confirmed)' }}>₹{selectedBooking.advancePaid}</div>
                      </div>
                      <div>
                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Balance</span>
                        <div style={{ fontSize: '20px', fontWeight: 700, color: selectedBooking.balancePaid ? 'var(--text-secondary)' : 'var(--status-pending)' }}>
                          {selectedBooking.balancePaid ? '₹0 (Settled)' : `₹${selectedBooking.totalPrice - selectedBooking.advancePaid}`}
                        </div>
                      </div>
                    </div>

                    <div>
                      {!selectedBooking.balancePaid && selectedBooking.status !== 'cancelled' ? (
                        <button onClick={handleMarkBalancePaid} className="btn btn-primary" style={{ fontSize: '13px' }}>Mark Balance Paid</button>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--status-confirmed)', fontWeight: 600, fontSize: '13px' }}>
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style={{ width: '18px', height: '18px' }}>
                            <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
                          </svg>
                          Payment Settled
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Notes and Logs */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '20px' }}>
                    
                    {/* Internal Notes */}
                    <div className="panel-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px', backdropFilter: 'none', boxShadow: 'none' }}>
                      <h3 style={{ fontSize: '14px', fontWeight: 600, borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', color: 'var(--accent-gold)' }}>Internal Admin Notes</h3>
                      <textarea
                        className="form-control"
                        rows={5}
                        placeholder="Add notes that only other admins can see..."
                        value={internalNotesInput}
                        onChange={(e) => setInternalNotesInput(e.target.value)}
                        style={{ resize: 'none', fontSize: '13px' }}
                      />
                      <button onClick={handleSaveNotes} className="btn btn-secondary" style={{ width: 'fit-content', marginLeft: 'auto', fontSize: '12px' }}>Save Notes</button>
                    </div>

                    {/* Modification History */}
                    <div className="panel-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px', backdropFilter: 'none', boxShadow: 'none' }}>
                      <h3 style={{ fontSize: '14px', fontWeight: 600, borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', color: 'var(--accent-gold)' }}>Modification History Log</h3>
                      
                      <div className="logs-scroller" style={{ maxHeight: '160px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
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

                  {/* Cancel Booking */}
                  {selectedBooking.status !== 'cancelled' && (
                    <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
                      <button onClick={handleCancelBooking} className="btn btn-secondary" style={{ color: 'var(--status-cancelled)', borderColor: 'rgba(239, 68, 68, 0.3)', fontSize: '13px' }}>Cancel Reservation</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Reschedule Modal */}
          {showRescheduleModal && selectedBooking && (
            <div className="modal-overlay" style={{ zIndex: 1100 }}>
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
                      disabled={loadingAvailability}
                    >
                      {loadingAvailability ? (
                        <option value="">Loading slots...</option>
                      ) : !newSlot ? (
                        <option value="">No slots available on this date</option>
                      ) : null}

                      {!loadingAvailability && (
                        <>
                          <option 
                            value="5:00 PM – 6:30 PM" 
                            disabled={isSlotDisabled("5:00 PM – 6:30 PM")}
                          >
                            Slot 1 (5:00 PM – 6:30 PM){getSlotSuffix("5:00 PM – 6:30 PM")}
                          </option>
                          <option 
                            value="7:00 PM – 8:30 PM" 
                            disabled={isSlotDisabled("7:00 PM – 8:30 PM")}
                          >
                            Slot 2 (7:00 PM – 8:30 PM){getSlotSuffix("7:00 PM – 8:30 PM")}
                          </option>
                          <option 
                            value="9:00 PM – 10:30 PM" 
                            disabled={isSlotDisabled("9:00 PM – 10:30 PM")}
                          >
                            Slot 3 (9:00 PM – 10:30 PM){getSlotSuffix("9:00 PM – 10:30 PM")}
                          </option>
                          <option 
                            value="11:00 PM – 12:30 AM" 
                            disabled={isSlotDisabled("11:00 PM – 12:30 AM")}
                          >
                            Slot 4 (11:00 PM – 12:30 AM){getSlotSuffix("11:00 PM – 12:30 AM")}
                          </option>
                        </>
                      )}
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
            <div className="modal-overlay" style={{ zIndex: 1100 }}>
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
