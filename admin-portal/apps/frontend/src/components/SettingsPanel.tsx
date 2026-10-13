import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import { useAuth } from '../lib/auth';

interface Branch {
  id: string;
  name: string;
  status: 'active' | 'disabled';
  capacity: number;
  phone?: string | null;
  allowOnlineBookings: boolean;
  createdAt?: string;
}

interface ConfirmModalState {
  isOpen: boolean;
  title: string;
  badge?: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void | Promise<void>;
}

interface CapacityModalState {
  isOpen: boolean;
  branchId: string;
  branchName: string;
  currentCapacity: number;
  newCapacity: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'http://localhost:3000/api';

const SettingsPanel: React.FC = () => {
  const { user } = useAuth();
  const [mounted, setMounted] = useState<boolean>(false);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [phoneInputs, setPhoneInputs] = useState<{ [branchId: string]: string }>({});
  const [savingPhone, setSavingPhone] = useState<{ [branchId: string]: boolean }>({});
  const [updatingToggle, setUpdatingToggle] = useState<{ [branchId: string]: boolean }>({});
  const [bulkUpdating, setBulkUpdating] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Custom UI Modals State (replaces native window.confirm and window.prompt)
  const [confirmModal, setConfirmModal] = useState<ConfirmModalState>({
    isOpen: false,
    title: '',
    message: '',
    confirmLabel: 'Confirm',
    onConfirm: () => {},
  });

  const [capacityModal, setCapacityModal] = useState<CapacityModalState>({
    isOpen: false,
    branchId: '',
    branchName: '',
    currentCapacity: 6,
    newCapacity: 6,
  });

  useEffect(() => {
    setMounted(true);
    fetchBranches();
  }, []);

  const getHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    return {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
  };

  const showAlert = (type: 'success' | 'error', text: string) => {
    setAlertMessage({ type, text });
    setTimeout(() => {
      setAlertMessage(null);
    }, 4500);
  };

  const fetchBranches = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/admin/branches`, getHeaders());
      if (response.data && response.data.branches) {
        setBranches(response.data.branches);
        const initialPhones: { [key: string]: string } = {};
        response.data.branches.forEach((b: Branch) => {
          initialPhones[b.id] = b.phone || '';
        });
        setPhoneInputs(initialPhones);
      }
    } catch (err: any) {
      console.error('Error fetching branches settings:', err);
      showAlert('error', err.response?.data?.error || 'Failed to load branch settings from server.');
    } finally {
      setLoading(false);
    }
  };

  // --- TOGGLE WEBSITE BOOKINGS MODAL TRIGGER & EXECUTOR ---
  const handleToggleOnlineBookings = (branchId: string, currentStatus: boolean) => {
    if (user?.role === 'branch_admin' && user?.branchId !== branchId) {
      showAlert('error', 'Unauthorized: You can only modify settings for your assigned branch.');
      return;
    }

    const nextStatus = !currentStatus;
    const branchObj = branches.find(b => b.id === branchId);
    const branchName = branchObj ? branchObj.name : branchId.toUpperCase();

    setConfirmModal({
      isOpen: true,
      title: nextStatus ? 'Resume Website Bookings' : 'Stop Website Bookings',
      badge: branchName,
      message: nextStatus
        ? `This will immediately re-open online slot reservations for ${branchName}. Customers will be able to book slots directly on the website.`
        : `Online slot booking will be PAUSED for ${branchName}. Visitors to the website will see a "Call Us" button with this branch's contact number. Proceed?`,
      confirmLabel: nextStatus ? 'Resume Bookings' : 'Stop Bookings',
      isDestructive: !nextStatus,
      onConfirm: () => executeToggleOnlineBookings(branchId, nextStatus),
    });
  };

  const executeToggleOnlineBookings = async (branchId: string, nextStatus: boolean) => {
    setUpdatingToggle(prev => ({ ...prev, [branchId]: true }));
    try {
      const response = await axios.patch(
        `${API_URL}/admin/branches/${branchId}`,
        { allowOnlineBookings: nextStatus },
        getHeaders()
      );
      if (response.data.success) {
        setBranches(prev =>
          prev.map(b => (b.id === branchId ? { ...b, allowOnlineBookings: nextStatus } : b))
        );
        showAlert(
          'success',
          nextStatus
            ? `Website bookings resumed for ${branchId.toUpperCase()}.`
            : `Website bookings stopped for ${branchId.toUpperCase()} (Call Us active).`
        );
      }
    } catch (err: any) {
      showAlert('error', err.response?.data?.error || 'Failed to update booking intake status.');
    } finally {
      setUpdatingToggle(prev => ({ ...prev, [branchId]: false }));
    }
  };

  // --- SUPER ADMIN BULK TOGGLE MODAL TRIGGER & EXECUTOR ---
  const handleBulkToggleBookings = (enableAll: boolean) => {
    if (user?.role !== 'super_admin') {
      showAlert('error', 'Unauthorized: Only Super Admin can perform bulk updates.');
      return;
    }

    setConfirmModal({
      isOpen: true,
      title: enableAll ? 'Resume All Website Bookings' : 'Emergency Pause — All Branches',
      badge: 'Super Admin Master Action',
      message: enableAll
        ? 'This will immediately re-enable online website bookings across ALL branches simultaneously. Customers will be able to book slots online for all locations.'
        : 'This will immediately STOP website bookings across ALL branches simultaneously. Visitors across all locations will see a "Call Us" button with each branch\'s mobile number. Proceed?',
      confirmLabel: enableAll ? 'Resume All Bookings' : 'Stop All Bookings',
      isDestructive: !enableAll,
      onConfirm: () => executeBulkToggleBookings(enableAll),
    });
  };

  const executeBulkToggleBookings = async (enableAll: boolean) => {
    setBulkUpdating(true);
    try {
      const response = await axios.patch(
        `${API_URL}/admin/branches`,
        { allowOnlineBookings: enableAll },
        getHeaders()
      );
      if (response.data.success) {
        setBranches(prev =>
          prev.map(b => ({ ...b, allowOnlineBookings: enableAll }))
        );
        showAlert(
          'success',
          enableAll
            ? 'Online website bookings resumed across all branches.'
            : 'Online website bookings paused across all branches.'
        );
      }
    } catch (err: any) {
      showAlert('error', err.response?.data?.error || 'Failed to execute bulk booking toggle.');
    } finally {
      setBulkUpdating(false);
    }
  };

  // --- SAVE BRANCH PHONE NUMBER ---
  const handleSavePhoneNumber = async (branchId: string) => {
    if (user?.role === 'branch_admin' && user?.branchId !== branchId) {
      showAlert('error', 'Unauthorized: You can only modify settings for your assigned branch.');
      return;
    }

    const phoneValue = (phoneInputs[branchId] || '').trim();
    if (!phoneValue) {
      showAlert('error', 'Please enter a valid mobile number (e.g. +91 98765 43210).');
      return;
    }

    setSavingPhone(prev => ({ ...prev, [branchId]: true }));
    try {
      const response = await axios.patch(
        `${API_URL}/admin/branches/${branchId}`,
        { phone: phoneValue },
        getHeaders()
      );
      if (response.data.success) {
        setBranches(prev =>
          prev.map(b => (b.id === branchId ? { ...b, phone: phoneValue } : b))
        );
        showAlert('success', `Contact number for ${branchId.toUpperCase()} updated successfully!`);
      }
    } catch (err: any) {
      showAlert('error', err.response?.data?.error || 'Failed to save contact number.');
    } finally {
      setSavingPhone(prev => ({ ...prev, [branchId]: false }));
    }
  };

  // --- CAPACITY MODAL TRIGGER & EXECUTOR ---
  const handleUpdateCapacity = (branchId: string, currentCapacity: number) => {
    if (user?.role === 'branch_admin' && user?.branchId !== branchId) {
      showAlert('error', 'Unauthorized: You can only modify settings for your assigned branch.');
      return;
    }

    const branchObj = branches.find(b => b.id === branchId);
    const branchName = branchObj ? branchObj.name : branchId.toUpperCase();

    setCapacityModal({
      isOpen: true,
      branchId,
      branchName,
      currentCapacity,
      newCapacity: currentCapacity,
    });
  };

  const executeCapacityUpdate = async (branchId: string, capacity: number) => {
    if (isNaN(capacity) || capacity < 1) {
      showAlert('error', 'Invalid capacity value. Must be at least 1.');
      return;
    }

    try {
      const response = await axios.patch(
        `${API_URL}/admin/branches/${branchId}`,
        { capacity },
        getHeaders()
      );
      if (response.data.success) {
        setBranches(prev =>
          prev.map(b => (b.id === branchId ? { ...b, capacity } : b))
        );
        showAlert('success', `Slot capacity for ${branchId.toUpperCase()} set to ${capacity}.`);
        setCapacityModal(prev => ({ ...prev, isOpen: false }));
      }
    } catch (err: any) {
      showAlert('error', err.response?.data?.error || 'Failed to update slot capacity.');
    }
  };

  // --- LOCATION OPERATIONAL STATUS MODAL TRIGGER & EXECUTOR ---
  const handleToggleBranchStatus = (branchId: string, currentStatus: 'active' | 'disabled') => {
    if (user?.role === 'branch_admin' && user?.branchId !== branchId) {
      showAlert('error', 'Unauthorized: You can only modify settings for your assigned branch.');
      return;
    }

    const newStatus = currentStatus === 'active' ? 'disabled' : 'active';
    const branchObj = branches.find(b => b.id === branchId);
    const branchName = branchObj ? branchObj.name : branchId.toUpperCase();

    setConfirmModal({
      isOpen: true,
      title: newStatus === 'disabled' ? 'Disable Branch Location' : 'Set Branch Location Online',
      badge: branchName,
      message: newStatus === 'disabled'
        ? `This will mark ${branchName} as offline in the operational system. Existing bookings will remain preserved.`
        : `This will restore ${branchName} to Online operational status.`,
      confirmLabel: newStatus === 'disabled' ? 'Disable Location' : 'Set Location Online',
      isDestructive: newStatus === 'disabled',
      onConfirm: () => executeToggleBranchStatus(branchId, newStatus),
    });
  };

  const executeToggleBranchStatus = async (branchId: string, newStatus: 'active' | 'disabled') => {
    try {
      const response = await axios.patch(
        `${API_URL}/admin/branches/${branchId}`,
        { status: newStatus },
        getHeaders()
      );
      if (response.data.success) {
        setBranches(prev =>
          prev.map(b => (b.id === branchId ? { ...b, status: newStatus } : b))
        );
        showAlert('success', `Location status updated to ${newStatus}.`);
      }
    } catch (err: any) {
      showAlert('error', err.response?.data?.error || 'Failed to update branch status.');
    }
  };

  const isSuperAdmin = user?.role === 'super_admin';
  const totalBranchesCount = branches.length;
  const activeBookingsCount = branches.filter(b => b.allowOnlineBookings).length;
  const allBranchesActive = totalBranchesCount > 0 && activeBookingsCount === totalBranchesCount;
  const allBranchesStopped = totalBranchesCount > 0 && activeBookingsCount === 0;

  return (
    <div className="settings-panel panel-card" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <div className="page-title">
          <h1 style={{ fontSize: '26px', fontWeight: 600, letterSpacing: '-0.5px' }}>Branch Settings & Booking Controls</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
            Configure online booking intake, branch contact mobile numbers for the &quot;Call Us&quot; fallback, slot capacities, and operational status.
          </p>
        </div>
      </div>

      {/* Real-time Notification Toast */}
      {alertMessage && (
        <div
          style={{
            padding: '14px 18px',
            borderRadius: '10px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: alertMessage.type === 'success' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
            border: `1px solid ${alertMessage.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
            color: alertMessage.type === 'success' ? '#10b981' : '#ef4444',
            fontSize: '14px',
            fontWeight: 500,
          }}
        >
          <span>{alertMessage.text}</span>
          <button
            onClick={() => setAlertMessage(null)}
            style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: '18px', padding: 0 }}
          >
            ×
          </button>
        </div>
      )}

      {/* SUPER ADMIN MASTER CONTROL BANNER */}
      {isSuperAdmin && !loading && (
        <div
          className="super-admin-banner"
          style={{
            backgroundColor: 'rgba(245, 158, 11, 0.05)',
            border: '1px solid rgba(245, 158, 11, 0.25)',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '32px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span
                  style={{
                    backgroundColor: 'rgba(245, 158, 11, 0.2)',
                    color: 'var(--accent-gold)',
                    fontSize: '11px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    letterSpacing: '0.5px',
                  }}
                >
                  Super Admin Master Control
                </span>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  Global Website Booking Intake
                </span>
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                {allBranchesActive && '🟢 All branches currently accepting website bookings.'}
                {allBranchesStopped && '🔴 Website bookings are STOPPED across all branches (Call Us button active everywhere).'}
                {!allBranchesActive && !allBranchesStopped && `🟡 Mixed: ${activeBookingsCount} of ${totalBranchesCount} branches accepting bookings.`}
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px', margin: 0 }}>
                Use master controls to immediately pause or resume online bookings across all cafe locations with a single click.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              {activeBookingsCount > 0 && (
                <button
                  onClick={() => handleBulkToggleBookings(false)}
                  disabled={bulkUpdating}
                  className="btn btn-secondary"
                  style={{
                    borderColor: 'rgba(239, 68, 68, 0.4)',
                    color: 'var(--status-cancelled)',
                    fontWeight: 600,
                  }}
                >
                  {bulkUpdating ? 'Updating...' : '⏸️ Stop Bookings for ALL Branches'}
                </button>
              )}

              {!allBranchesActive && (
                <button
                  onClick={() => handleBulkToggleBookings(true)}
                  disabled={bulkUpdating}
                  className="btn btn-primary"
                  style={{ fontWeight: 600 }}
                >
                  {bulkUpdating ? 'Updating...' : '▶️ Resume Bookings for ALL Branches'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>
          Loading branch settings...
        </div>
      ) : (
        <div className="settings-grid" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {branches.map(b => {
            const isAssigned = isSuperAdmin || user?.branchId === b.id;
            const isUpdatingThisToggle = updatingToggle[b.id] || false;
            const isSavingThisPhone = savingPhone[b.id] || false;
            const hasPhoneChanged = (phoneInputs[b.id] || '').trim() !== (b.phone || '').trim();

            return (
              <div
                key={b.id}
                className="branch-settings-card"
                style={{
                  backgroundColor: 'rgba(22, 30, 49, 0.5)',
                  border: isAssigned ? '1px solid var(--border-color)' : '1px dashed rgba(255, 255, 255, 0.08)',
                  borderRadius: '16px',
                  padding: '28px',
                  opacity: isAssigned ? 1 : 0.6,
                  transition: 'border-color 0.2s',
                }}
              >
                {/* Branch Card Header */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: '1px solid var(--border-color)',
                    paddingBottom: '18px',
                    marginBottom: '24px',
                    flexWrap: 'wrap',
                    gap: '12px',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <h3 style={{ fontSize: '20px', fontWeight: 600, margin: 0, textTransform: 'capitalize' }}>
                        {b.name}
                      </h3>
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontFamily: 'monospace', backgroundColor: 'rgba(255, 255, 255, 0.05)', padding: '2px 8px', borderRadius: '4px' }}>
                        ID: {b.id}
                      </span>
                      {!isAssigned && (
                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                          (Read-only for your login)
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'block', marginTop: '4px' }}>
                      Manage website booking intake, contact phone, slot capacity, and location status.
                    </span>
                  </div>

                  {/* Badges */}
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span
                      className={`status-badge ${b.allowOnlineBookings ? 'confirmed' : 'cancelled'}`}
                      style={{ fontSize: '12px', fontWeight: 600 }}
                    >
                      {b.allowOnlineBookings ? '● Website Bookings: ACTIVE' : '■ Website Bookings: STOPPED'}
                    </span>
                    <span
                      className={`status-badge ${b.status === 'active' ? 'confirmed' : 'cancelled'}`}
                      style={{ fontSize: '12px' }}
                    >
                      {b.status === 'active' ? 'Location Online' : 'Location Offline'}
                    </span>
                  </div>
                </div>

                {/* Branch Controls Grid */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                    gap: '24px',
                  }}
                >
                  {/* CONTROL 1: Website Booking Intake Toggle */}
                  <div
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid var(--glass-border)',
                      borderRadius: '12px',
                      padding: '20px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <h4 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--accent-gold)', margin: 0 }}>
                          Website Booking Intake
                        </h4>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 600,
                            padding: '2px 8px',
                            borderRadius: '4px',
                            backgroundColor: b.allowOnlineBookings ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                            color: b.allowOnlineBookings ? '#10b981' : '#ef4444',
                          }}
                        >
                          {b.allowOnlineBookings ? 'Intake Open' : 'Intake Paused'}
                        </span>
                      </div>
                      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.45', marginBottom: '16px' }}>
                        When intake is stopped, customer booking forms are paused on the website and replaced with a <strong>&quot;Call Us&quot;</strong> button pointing to this branch&apos;s mobile number.
                      </p>
                    </div>

                    <div style={{ paddingTop: '8px' }}>
                      <button
                        onClick={() => handleToggleOnlineBookings(b.id, b.allowOnlineBookings)}
                        disabled={!isAssigned || isUpdatingThisToggle}
                        className={`btn ${b.allowOnlineBookings ? 'btn-secondary' : 'btn-primary'}`}
                        style={{
                          width: '100%',
                          justifyContent: 'center',
                          borderColor: b.allowOnlineBookings ? 'rgba(239, 68, 68, 0.3)' : undefined,
                          color: b.allowOnlineBookings ? 'var(--status-cancelled)' : undefined,
                        }}
                      >
                        {isUpdatingThisToggle
                          ? 'Updating...'
                          : b.allowOnlineBookings
                          ? '⛔ Stop Taking Website Bookings'
                          : '✅ Accept Website Bookings'}
                      </button>
                    </div>
                  </div>

                  {/* CONTROL 2: Branch Contact Information */}
                  <div
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid var(--glass-border)',
                      borderRadius: '12px',
                      padding: '20px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <h4 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--accent-gold)', marginBottom: '8px' }}>
                        Branch Contact Mobile Number
                      </h4>
                      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.45', marginBottom: '14px' }}>
                        The official mobile number used everywhere and wired to the <strong>&quot;Call Us&quot;</strong> button when website bookings are stopped.
                      </p>

                      <div className="form-group" style={{ marginBottom: '12px' }}>
                        <input
                          type="tel"
                          className="form-control"
                          value={phoneInputs[b.id] ?? ''}
                          onChange={(e) => setPhoneInputs({ ...phoneInputs, [b.id]: e.target.value })}
                          placeholder="+91 98765 43210"
                          disabled={!isAssigned}
                          style={{
                            fontFamily: 'monospace',
                            fontSize: '14px',
                            letterSpacing: '0.5px',
                          }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        Current: <strong style={{ color: 'var(--text-primary)' }}>{b.phone || 'None configured'}</strong>
                      </span>
                      <button
                        onClick={() => handleSavePhoneNumber(b.id)}
                        disabled={!isAssigned || isSavingThisPhone || !hasPhoneChanged}
                        className="btn btn-secondary"
                        style={{
                          opacity: !hasPhoneChanged ? 0.6 : 1,
                          fontSize: '13px',
                          padding: '8px 16px',
                        }}
                      >
                        {isSavingThisPhone ? 'Saving...' : 'Save Number'}
                      </button>
                    </div>
                  </div>

                  {/* CONTROL 3: Slot Capacity & Operations */}
                  <div
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid var(--glass-border)',
                      borderRadius: '12px',
                      padding: '20px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <h4 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--accent-gold)', marginBottom: '8px' }}>
                        Capacity & Location Operations
                      </h4>
                      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.45', marginBottom: '14px' }}>
                        Set max simultaneous reservations per 90-min slot, or toggle whole location operational status.
                      </p>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                        <div>
                          <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block' }}>Slot Limit</span>
                          <span style={{ fontSize: '20px', fontWeight: 700 }}>{b.capacity} <small style={{ fontSize: '13px', fontWeight: 400, color: 'var(--text-secondary)' }}>domes</small></span>
                        </div>
                        <button
                          onClick={() => handleUpdateCapacity(b.id, b.capacity)}
                          disabled={!isAssigned}
                          className="btn btn-secondary"
                          style={{ fontSize: '13px', padding: '6px 14px' }}
                        >
                          Change Limit
                        </button>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                      <button
                        onClick={() => handleToggleBranchStatus(b.id, b.status)}
                        disabled={!isAssigned}
                        className="btn btn-secondary"
                        style={{
                          width: '100%',
                          fontSize: '12px',
                          padding: '6px 10px',
                          color: b.status === 'active' ? 'var(--text-secondary)' : '#10b981',
                        }}
                      >
                        {b.status === 'active' ? 'Disable Location' : 'Enable Location'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Credentials Reference Card */}
          <div
            className="credentials-card panel-card"
            style={{
              padding: '24px',
              backgroundColor: 'rgba(255,255,255,0.015)',
              border: '1px solid var(--glass-border)',
              borderRadius: '16px',
            }}
          >
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--accent-gold)', marginBottom: '6px' }}>
              System Integrations & Contact Wiring
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '14px', lineHeight: '1.4' }}>
              Branch contact numbers defined above are securely stored in the unified PostgreSQL database. When online bookings are paused for any branch, website clients receive the designated mobile number via the public API to trigger instant tel: call actions.
            </p>
            <div style={{ display: 'flex', gap: '28px', fontSize: '13px', flexWrap: 'wrap' }}>
              <div>
                <strong>Branches API:</strong> <span style={{ fontFamily: 'monospace', color: 'var(--text-secondary)' }}>/api/booking/branches & /api/admin/branches</span>
              </div>
              <div>
                <strong>Multi-Tenancy Guard:</strong> <span style={{ fontFamily: 'monospace', color: 'var(--text-secondary)' }}>PostgreSQL RLS + JWT Branch Scope</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- CUSTOM CONFIRMATION POP-UP MODAL (Rendered at Screen Center via Portal) --- */}
      {mounted && confirmModal.isOpen && createPortal(
        <div
          className="modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setConfirmModal(prev => ({ ...prev, isOpen: false }));
          }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: '100vh',
            margin: 0,
            padding: '20px',
            boxSizing: 'border-box',
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
          }}
        >
          <div
            className="modal-content"
            style={{
              width: '480px',
              maxWidth: '92%',
              backgroundColor: '#131b2e',
              border: '1px solid #334155',
              borderRadius: '16px',
              padding: '26px',
              boxShadow: '0 25px 60px rgba(0,0,0,0.75)',
            }}
          >
            <div className="modal-header" style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: confirmModal.isDestructive ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                    color: confirmModal.isDestructive ? '#ef4444' : 'var(--accent-gold)',
                    fontSize: '20px',
                  }}
                >
                  {confirmModal.isDestructive ? '⚠️' : 'ℹ️'}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {confirmModal.title}
                  </h3>
                  {confirmModal.badge && (
                    <span
                      style={{
                        fontSize: '11px',
                        color: 'var(--text-secondary)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        fontWeight: 600,
                      }}
                    >
                      {confirmModal.badge}
                    </span>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                className="modal-close"
                style={{ fontSize: '22px', lineHeight: 1 }}
              >
                ×
              </button>
            </div>

            <div style={{ marginBottom: '24px', color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6' }}>
              <p style={{ margin: 0 }}>{confirmModal.message}</p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                type="button"
                onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                className="btn btn-secondary"
                style={{ padding: '8px 18px', fontSize: '13px' }}
              >
                {confirmModal.cancelLabel || 'Cancel'}
              </button>
              <button
                type="button"
                onClick={async () => {
                  const fn = confirmModal.onConfirm;
                  setConfirmModal(prev => ({ ...prev, isOpen: false }));
                  await fn();
                }}
                className={`btn ${confirmModal.isDestructive ? 'btn-secondary' : 'btn-primary'}`}
                style={
                  confirmModal.isDestructive
                    ? {
                        backgroundColor: 'rgba(239, 68, 68, 0.15)',
                        borderColor: 'rgba(239, 68, 68, 0.4)',
                        color: '#ef4444',
                        fontWeight: 600,
                        padding: '8px 20px',
                        fontSize: '13px',
                      }
                    : { fontWeight: 600, padding: '8px 20px', fontSize: '13px' }
                }
              >
                {confirmModal.confirmLabel}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* --- CUSTOM CAPACITY INPUT POP-UP MODAL (Rendered at Screen Center via Portal) --- */}
      {mounted && capacityModal.isOpen && createPortal(
        <div
          className="modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setCapacityModal(prev => ({ ...prev, isOpen: false }));
          }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: '100vh',
            margin: 0,
            padding: '20px',
            boxSizing: 'border-box',
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
          }}
        >
          <div
            className="modal-content"
            style={{
              width: '420px',
              maxWidth: '92%',
              backgroundColor: '#131b2e',
              border: '1px solid #334155',
              borderRadius: '16px',
              padding: '26px',
              boxShadow: '0 25px 60px rgba(0,0,0,0.75)',
            }}
          >
            <div className="modal-header" style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'rgba(245, 158, 11, 0.15)',
                    color: 'var(--accent-gold)',
                    fontSize: '20px',
                  }}
                >
                  ⚙️
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    Slot Capacity
                  </h3>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    {capacityModal.branchName}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCapacityModal(prev => ({ ...prev, isOpen: false }))}
                className="modal-close"
                style={{ fontSize: '22px', lineHeight: 1 }}
              >
                ×
              </button>
            </div>

            <div style={{ marginBottom: '22px' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: '1.5', marginBottom: '16px' }}>
                Enter the maximum concurrent reservations allowed per 90-minute slot for this location.
              </p>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  Maximum Domes Capacity:
                </label>
                <input
                  type="number"
                  min={1}
                  max={30}
                  className="form-control"
                  value={capacityModal.newCapacity}
                  onChange={(e) =>
                    setCapacityModal(prev => ({
                      ...prev,
                      newCapacity: parseInt(e.target.value, 10) || 1,
                    }))
                  }
                  style={{
                    fontSize: '18px',
                    fontWeight: 700,
                    fontFamily: 'monospace',
                    padding: '10px 14px',
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                type="button"
                onClick={() => setCapacityModal(prev => ({ ...prev, isOpen: false }))}
                className="btn btn-secondary"
                style={{ padding: '8px 18px', fontSize: '13px' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => executeCapacityUpdate(capacityModal.branchId, capacityModal.newCapacity)}
                className="btn btn-primary"
                style={{ fontWeight: 600, padding: '8px 20px', fontSize: '13px' }}
              >
                Save Capacity
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default SettingsPanel;
