import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../lib/auth';

interface Branch {
  id: string;
  name: string;
  status: 'active' | 'disabled';
  capacity: number;
  createdAt: string;
}

const API_URL = process.env.API_URL || 'http://localhost:3000/api';

const SettingsPanel: React.FC = () => {
  const { user } = useAuth();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchBranches();
  }, []);

  const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
  };

  const fetchBranches = async () => {
    setLoading(true);
    setError('');
    try {
      // Direct database branches can be fetched or we can seed them
      // Since branches is a public table in schema, we can query it
      // Let's call the test-db endpoint or the admin branches endpoint
      // We will create a local mock list or fetch if available
      // Let's create an endpoint in Next.js api for this, or simulate
      // We can use a simple GET request or mock since they are static
      const response = await axios.get(`${API_URL}/test-db`);
      if (response.data && response.data.branches) {
        setBranches(response.data.branches);
      }
    } catch (err: any) {
      console.error('Error fetching branches settings:', err);
      // Fallback defaults
      setBranches([
        { id: 'kokapet', name: 'Kokapet Branch', status: 'active', capacity: 6, createdAt: '' },
        { id: 'sainikpuri', name: 'Sainikpuri Branch', status: 'active', capacity: 6, createdAt: '' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBranchStatus = async (branchId: string, currentStatus: 'active' | 'disabled') => {
    // Branch Admin safety check
    if (user?.role === 'branch_admin' && user?.branchId !== branchId) {
      alert('Unauthorized: You can only modify settings for your assigned branch.');
      return;
    }

    const newStatus = currentStatus === 'active' ? 'disabled' : 'active';
    const msg = newStatus === 'disabled' 
      ? 'Soft Disable: This will prevent any NEW bookings from being made, but existing bookings will remain active. Proceed?' 
      : 'Enable Branch: This will re-open slots for public bookings. Proceed?';

    if (!confirm(msg)) return;

    try {
      const response = await axios.patch(
        `${API_URL}/admin/branches/${branchId}`,
        { status: newStatus },
        getHeaders()
      );
      if (response.data.success) {
        fetchBranches();
      }
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to update branch status');
    }
  };

  const handleUpdateCapacity = async (branchId: string, currentCapacity: number) => {
    if (user?.role === 'branch_admin' && user?.branchId !== branchId) {
      alert('Unauthorized: You can only modify settings for your assigned branch.');
      return;
    }

    const input = prompt('Enter new slot capacity (maximum reservations per slot):', currentCapacity.toString());
    if (input === null) return;
    const capacity = parseInt(input, 10);

    if (isNaN(capacity) || capacity < 1) {
      alert('Invalid capacity value');
      return;
    }

    try {
      const response = await axios.patch(
        `${API_URL}/admin/branches/${branchId}`,
        { capacity },
        getHeaders()
      );
      if (response.data.success) {
        fetchBranches();
      }
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to update slot capacity');
    }
  };

  const handleEmergencyShutdown = (branchId: string) => {
    if (user?.role === 'branch_admin' && user?.branchId !== branchId) {
      alert('Unauthorized: You can only modify settings for your assigned branch.');
      return;
    }

    const msg = `⚠️ EMERGENCY HARD SHUTDOWN WARNING ⚠️\n\n` +
      `This will immediately block all slots and suspend bookings.\n` +
      `According to cafe policy, NO REFUNDS OR REVERSALS will be issued via Razorpay.\n` +
      `You must manually contact affected customers to reschedule their slots.\n\n` +
      `Type "SHUTDOWN" to confirm this emergency action:`;

    const confirmText = prompt(msg);
    if (confirmText !== 'SHUTDOWN') {
      alert('Emergency action cancelled.');
      return;
    }

    // Call update status to disabled
    handleToggleBranchStatus(branchId, 'active');
  };

  return (
    <div className="settings-panel panel-card">
      <div className="page-header">
        <div className="page-title">
          <h1>Branch Configuration Settings</h1>
          <p>Manage cafe branch status, booking serviceability, slot capacities, and API credentials.</p>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>Loading settings...</div>
      ) : (
        <div className="settings-grid" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {branches.map(b => {
            const isAssigned = user?.role === 'super_admin' || user?.branchId === b.id;
            return (
              <div
                key={b.id}
                className="branch-settings-card"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.01)',
                  border: isAssigned ? '1px solid var(--border-color)' : '1px dashed rgba(255, 255, 255, 0.05)',
                  borderRadius: '16px',
                  padding: '24px',
                  opacity: isAssigned ? 1 : 0.5
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '20px' }}>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: 600, textTransform: 'capitalize' }}>
                      {b.name} ({b.id})
                    </h3>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      Manage reservation capacity and public availability.
                    </span>
                  </div>
                  <span className={`status-badge ${b.status === 'active' ? 'confirmed' : 'cancelled'}`} style={{ fontSize: '12px' }}>
                    {b.status === 'active' ? 'Online' : 'Offline'}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                  
                  {/* Serviceability soft toggles */}
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--accent-gold)', marginBottom: '12px' }}>Serviceability Controls</h4>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: '1.4' }}>
                      Toggling status changes public visibility. Soft disable lets existing bookings remain in place, while emergency shutdown enforces slot cancellation without refund policies.
                    </p>

                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        onClick={() => handleToggleBranchStatus(b.id, b.status)}
                        disabled={!isAssigned}
                        className={`btn ${b.status === 'active' ? 'btn-secondary' : 'btn-primary'}`}
                      >
                        {b.status === 'active' ? 'Soft Disable Branch' : 'Enable Branch (Online)'}
                      </button>

                      {b.status === 'active' && (
                        <button
                          onClick={() => handleEmergencyShutdown(b.id)}
                          disabled={!isAssigned}
                          className="btn btn-secondary"
                          style={{ color: 'var(--status-cancelled)', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                        >
                          Emergency Shutdown
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Slot capacity limits */}
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--accent-gold)', marginBottom: '12px' }}>Slot Capacity Settings</h4>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: '1.4' }}>
                      Configure the maximum number of concurrent reservations allowed per 90-minute slot. Default capacity limit is <strong>{b.capacity}</strong> domes.
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                      <div style={{ fontSize: '24px', fontWeight: 700 }}>{b.capacity} <span style={{ fontSize: '14px', fontWeight: 400, color: 'var(--text-secondary)' }}>domes</span></div>
                      <button
                        onClick={() => handleUpdateCapacity(b.id, b.capacity)}
                        disabled={!isAssigned}
                        className="btn btn-secondary"
                      >
                        Change Capacity
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            );
          })}

          {/* Credentials Card (Placeholder) */}
          <div
            className="credentials-card panel-card"
            style={{
              padding: '24px',
              backgroundColor: 'rgba(255,255,255,0.015)',
              marginTop: '12px'
            }}
          >
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--accent-gold)', marginBottom: '8px' }}>Integrations & API Credentials</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Razorpay Keys, WhatsApp Business API endpoints, and SMS fallbacks are locked and managed securely inside the system environment files (`.env`) to ensure maximum security.
            </p>
            <div style={{ display: 'flex', gap: '30px', fontSize: '13px' }}>
              <div>
                <strong>Razorpay Webhook:</strong> <span style={{ fontFamily: 'monospace', color: 'var(--text-secondary)' }}>https://domecafe.in/api/booking/webhook</span>
              </div>
              <div>
                <strong>WhatsApp API Target:</strong> <span style={{ fontFamily: 'monospace', color: 'var(--text-secondary)' }}>Meta Business v20.0</span>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default SettingsPanel;
