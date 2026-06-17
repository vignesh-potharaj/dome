import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Booking {
  id: string;
  date: string;
  slot: string;
  packageName: string;
  status: string;
  customer?: {
    name: string;
    phone: string;
  };
}

interface BlockedDate {
  id: string;
  branchId: string;
  date: string;
  reason: string | null;
}

const API_URL = process.env.API_URL || 'http://localhost:3000/api';

const CalendarView: React.FC = () => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Modals state
  const [showBlockModal, setShowBlockModal] = useState<boolean>(false);
  const [selectedDateStr, setSelectedDateStr] = useState<string>('');
  const [blockReason, setBlockReason] = useState<string>('');
  const [selectedBlockedId, setSelectedBlockedId] = useState<string>('');
  const [showUnblockModal, setShowUnblockModal] = useState<boolean>(false);

  useEffect(() => {
    fetchData();
  }, [currentDate]);

  const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
  };

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const [bookingsRes, blockedRes] = await Promise.all([
        axios.get(`${API_URL}/admin/bookings`, getHeaders()),
        axios.get(`${API_URL}/admin/blocked-dates`, getHeaders())
      ]);

      if (bookingsRes.data.success) {
        setBookings(bookingsRes.data.bookings);
      }
      if (blockedRes.data.success) {
        setBlockedDates(blockedRes.data.blockedDates);
      }
    } catch (err: any) {
      console.error('Error fetching calendar data:', err);
      setError(err.response?.data?.error || 'Failed to load calendar data');
    } finally {
      setLoading(false);
    }
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleDayClick = (dayStr: string) => {
    const isBlocked = blockedDates.find(b => b.date === dayStr);
    if (isBlocked) {
      setSelectedBlockedId(isBlocked.id);
      setSelectedDateStr(dayStr);
      setShowUnblockModal(true);
    } else {
      setSelectedDateStr(dayStr);
      setBlockReason('');
      setShowBlockModal(true);
    }
  };

  const handleBlockDate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${API_URL}/admin/blocked-dates`,
        { date: selectedDateStr, reason: blockReason },
        getHeaders()
      );
      if (response.data.success) {
        setShowBlockModal(false);
        fetchData();
      }
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to block date');
    }
  };

  const handleUnblockDate = async () => {
    try {
      const response = await axios.delete(
        `${API_URL}/admin/blocked-dates/${selectedBlockedId}`,
        getHeaders()
      );
      if (response.data.success) {
        setShowUnblockModal(false);
        fetchData();
      }
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to unblock date');
    }
  };

  // Generate Calendar Days
  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    const days = [];
    // Pad previous month days
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(null);
    }
    // Current month days
    for (let i = 1; i <= totalDays; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const formatDateString = (date: Date) => {
    const offset = date.getTimezoneOffset();
    const adjusted = new Date(date.getTime() - offset * 60 * 1000);
    return adjusted.toISOString().split('T')[0];
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const days = getDaysInMonth();

  return (
    <div className="calendar-panel panel-card">
      <div className="page-header">
        <div className="page-title">
          <h1>Live Availability Calendar</h1>
          <p>Click on an available date to block it, or click on a blocked date to release it.</p>
        </div>
        <div className="calendar-controls">
          <button onClick={handlePrevMonth} className="btn btn-secondary" style={{ marginRight: '8px' }}>&lt; Prev</button>
          <span style={{ fontSize: '18px', fontWeight: 600, display: 'inline-block', width: '160px', textAlign: 'center' }}>
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </span>
          <button onClick={handleNextMonth} className="btn btn-secondary" style={{ marginLeft: '8px' }}>Next &gt;</button>
        </div>
      </div>

      {error && <div className="error-message" style={{ color: 'var(--status-cancelled)', marginBottom: '16px' }}>{error}</div>}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>Loading Calendar Data...</div>
      ) : (
        <div className="calendar-grid-container">
          {/* Days of Week Header */}
          <div className="days-of-week" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', fontWeight: 600, paddingBottom: '12px', color: 'var(--text-secondary)', fontSize: '14px' }}>
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          {/* Days Grid */}
          <div className="days-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '10px' }}>
            {days.map((day, idx) => {
              if (day === null) {
                return <div key={`empty-${idx}`} style={{ minHeight: '110px', backgroundColor: 'rgba(255,255,255,0.01)', borderRadius: '8px' }}></div>;
              }

              const dayStr = formatDateString(day);
              const isBlocked = blockedDates.find(b => b.date === dayStr);
              const dayBookings = bookings.filter(b => b.date === dayStr);

              return (
                <div
                  key={dayStr}
                  onClick={() => handleDayClick(dayStr)}
                  style={{
                    minHeight: '110px',
                    backgroundColor: isBlocked ? 'rgba(239, 68, 68, 0.05)' : 'rgba(255, 255, 255, 0.02)',
                    border: isBlocked ? '1px solid rgba(239, 68, 68, 0.2)' : '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = isBlocked ? 'var(--status-cancelled)' : 'var(--accent-gold)';
                    e.currentTarget.style.backgroundColor = isBlocked ? 'rgba(239, 68, 68, 0.08)' : 'rgba(255,255,255,0.04)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = isBlocked ? 'rgba(239, 68, 68, 0.2)' : 'var(--border-color)';
                    e.currentTarget.style.backgroundColor = isBlocked ? 'rgba(239, 68, 68, 0.05)' : 'rgba(255, 255, 255, 0.02)';
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600, fontSize: '15px' }}>{day.getDate()}</span>
                    {isBlocked && (
                      <span title={`Blocked: ${isBlocked.reason || 'No reason'}`} style={{ color: 'var(--status-cancelled)', fontSize: '12px' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style={{ width: '16px', height: '16px' }}>
                          <path fillRule="evenodd" d="M10 1a4.5 4.5 0 0 0-4.5 4.5V9H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-.5V5.5A4.5 4.5 0 0 0 10 1Zm3 8V5.5a3 3 0 1 0-6 0V9h6Z" clipRule="evenodd" />
                        </svg>
                      </span>
                    )}
                  </div>

                  {/* Booking Indicators */}
                  {!isBlocked && dayBookings.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '8px' }}>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 500 }}>
                        {dayBookings.length} {dayBookings.length === 1 ? 'booking' : 'bookings'}
                      </div>
                      <div style={{ display: 'flex', gap: '3px' }}>
                        {dayBookings.map((b) => (
                          <span
                            key={b.id}
                            title={`${b.customer?.name || 'Guest'} - ${b.slot} (${b.packageName})`}
                            style={{
                              width: '8px',
                              height: '8px',
                              borderRadius: '50%',
                              backgroundColor:
                                b.status === 'confirmed' ? 'var(--status-confirmed)' :
                                b.status === 'pending_payment' ? 'var(--status-pending)' :
                                b.status === 'rescheduled' ? 'var(--status-rescheduled)' :
                                'var(--status-cancelled)'
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  {isBlocked && (
                    <div style={{ fontSize: '11px', color: 'var(--status-cancelled)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {isBlocked.reason || 'Private Event'}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Block Date Modal */}
      {showBlockModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Block Date: {selectedDateStr}</h3>
              <button onClick={() => setShowBlockModal(false)} className="modal-close">X</button>
            </div>
            <form onSubmit={handleBlockDate}>
              <div className="form-group">
                <label htmlFor="reason">Reason for Closure / Maintenance</label>
                <input
                  type="text"
                  id="reason"
                  className="form-control"
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  placeholder="e.g. Private Event, Maintenance Downtime"
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button type="button" onClick={() => setShowBlockModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Block Date</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Unblock Date Modal */}
      {showUnblockModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ width: '400px' }}>
            <div className="modal-header">
              <h3>Release Blocked Date?</h3>
              <button onClick={() => setShowUnblockModal(false)} className="modal-close">X</button>
            </div>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              Are you sure you want to release the block on <strong>{selectedDateStr}</strong>? Customers will be able to book slots on this date again.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowUnblockModal(false)} className="btn btn-secondary">Cancel</button>
              <button onClick={handleUnblockDate} className="btn btn-primary" style={{ backgroundColor: 'var(--status-cancelled)', color: 'white' }}>Release Block</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;
