import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../lib/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

const allSlots = [
  '5:00 PM – 6:30 PM',
  '7:00 PM – 8:30 PM',
  '9:00 PM – 10:30 PM',
  '11:00 PM – 12:30 AM'
];

const packages = [
  { id: 'party', name: 'Party', price: 3999 },
  { id: 'vibe', name: 'Vibe', price: 5999 },
  { id: 'magic', name: 'Magic', price: 8999 },
  { id: 'elite', name: 'Elite', price: 14999 },
  { id: 'luxury', name: 'Luxury', price: 19999 },
];

const balloonOptions = [
  { value: 'rose-gold', label: 'Rose Gold & White' },
  { value: 'red-hearts', label: 'Red Hearts & Chrome' },
  { value: 'blush-pink', label: 'Blush Pink & Gold' },
  { value: 'gold-white', label: 'Gold & White Classic' },
  { value: 'purple', label: 'Purple Passion' },
  { value: 'custom', label: 'Surprise Me' },
];

const cakeOptions = [
  { value: 'none', label: 'No Cake' },
  { value: 'chocolate', label: 'Chocolate' },
  { value: 'black-forest', label: 'Black Forest' },
  { value: 'white-forest', label: 'White Forest' },
  { value: 'butterscotch', label: 'Butterscotch' },
  { value: 'red-velvet', label: 'Red Velvet (+₹250)' },
  { value: 'chocolate-truffle', label: 'Chocolate Truffle (+₹250)' },
];

const addOnsList = [
  { id: 'sparkling-candle', label: 'Sparkling Candle', price: 70 },
  { id: 'blindfold', label: 'Blindfold Entry', price: 100 },
  { id: 'personalised-letter', label: 'Personalised Letter', price: 100 },
  { id: 'sash-tiara', label: 'Sash & Tiara', price: 200 },
  { id: 'photo-frame', label: 'Photo Frame', price: 200 },
  { id: 'foil-balloon', label: 'Foil Balloon', price: 200 },
  { id: 'photo-prints', label: 'Photo Prints', price: 200 },
  { id: 'balloon-stands', label: 'Balloon Stands', price: 400 },
  { id: 'heart-balloons', label: 'Heart Balloons', price: 500 },
  { id: 'rose-bouquet', label: 'Rose Bouquet', price: 600 },
  { id: 'flower-entrance', label: 'Flower Entrance', price: 750 },
  { id: 'chrome-balloons', label: 'Chrome Balloons', price: 1000 },
  { id: 'coldfire-2', label: 'Cold Fire (2 Pcs)', price: 1000 },
  { id: 'coldfire-4', label: 'Cold Fire (4 Pcs)', price: 1500 },
  { id: 'coldfire-6', label: 'Cold Fire (6 Pcs)', price: 2000 },
  { id: 'fog-entry', label: 'Fog Entry', price: 1500 },
  { id: 'photographer', label: 'Photographer', price: 2500 },
  { id: 'guitarist', label: 'Guitarist', price: 5000 },
];

const occasionOptions = ['Birthday', 'Anniversary', 'Proposal', 'Celebration', 'Date Night', 'Baby Shower', 'Other'];

const OfflineBookingForm: React.FC = () => {
  const { user } = useAuth();

  // Branch
  const [branchId, setBranchId] = useState<string>(user?.role === 'branch_admin' ? (user.branchId || '') : '');

  // Date & Slot
  const [date, setDate] = useState<string>('');
  const [slot, setSlot] = useState<string>('');
  const [slotsAvailability, setSlotsAvailability] = useState<Record<string, { available: boolean; reason?: string }>>({});
  const [loadingSlots, setLoadingSlots] = useState<boolean>(false);

  // Package
  const [packageName, setPackageName] = useState<string>('');

  // Customizations
  const [balloonColor, setBalloonColor] = useState<string>('rose-gold');
  const [cakeOption, setCakeOption] = useState<string>('none');
  const [eggless, setEggless] = useState<boolean>(false);
  const [messageOnCake, setMessageOnCake] = useState<string>('');
  const [sparklers, setSparklers] = useState<boolean>(false);
  const [ledName, setLedName] = useState<string>('');

  // Add-ons
  const [addOns, setAddOns] = useState<string[]>([]);

  // Customer
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [customerEmail, setCustomerEmail] = useState<string>('');
  const [occasion, setOccasion] = useState<string>('');
  const [celebrantName, setCelebrantName] = useState<string>('');
  const [guestCount, setGuestCount] = useState<string>('2');
  const [specialNote, setSpecialNote] = useState<string>('');
  const [marketingConsent, setMarketingConsent] = useState<boolean>(true);

  // Form state
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [success, setSuccess] = useState<{ bookingId: string; totalPrice: number } | null>(null);
  const [error, setError] = useState<string>('');

  const getHeaders = () => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  // Fetch slot availability when date or branch changes
  useEffect(() => {
    if (!date || !branchId) {
      setSlotsAvailability({});
      return;
    }
    const fetchAvailability = async () => {
      setLoadingSlots(true);
      try {
        const response = await axios.get(`${API_URL}/booking/availability`, {
          params: { branchId, date }
        });
        if (response.data.success) {
          setSlotsAvailability(response.data.slots);
          // Reset slot if currently selected one is unavailable
          if (slot && response.data.slots[slot] && !response.data.slots[slot].available) {
            setSlot('');
          }
        }
      } catch (err) {
        console.error('Error fetching availability:', err);
      } finally {
        setLoadingSlots(false);
      }
    };
    fetchAvailability();
  }, [date, branchId]);

  // Calculate total price (mirrors server logic)
  const calculateTotal = () => {
    const pkgPrice = packages.find(p => p.id === packageName)?.price || 0;
    let total = pkgPrice;

    if (cakeOption && cakeOption !== 'none') {
      if (cakeOption === 'red-velvet' || cakeOption === 'chocolate-truffle') total += 250;
      if (eggless) total += 250;
    }

    if (sparklers && packageName === 'party') total += 149;

    if (ledName) {
      const letterCount = ledName.replace(/[^a-zA-Z0-9]/g, '').length;
      total += letterCount * 49;
    }

    for (const addon of addOns) {
      const found = addOnsList.find(a => a.id === addon);
      if (found) total += found.price;
    }

    return total;
  };

  const totalPrice = calculateTotal();

  const toggleAddOn = (id: string) => {
    setAddOns(prev =>
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  const resetForm = () => {
    setDate('');
    setSlot('');
    setPackageName('');
    setBalloonColor('rose-gold');
    setCakeOption('none');
    setEggless(false);
    setMessageOnCake('');
    setSparklers(false);
    setLedName('');
    setAddOns([]);
    setCustomerName('');
    setCustomerPhone('');
    setCustomerEmail('');
    setOccasion('');
    setCelebrantName('');
    setGuestCount('2');
    setSpecialNote('');
    setMarketingConsent(true);
    setSuccess(null);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!branchId) { setError('Please select a branch.'); return; }
    if (!date) { setError('Please select a date.'); return; }
    if (!slot) { setError('Please select a time slot.'); return; }
    if (!packageName) { setError('Please select a package.'); return; }
    if (!customerName.trim()) { setError('Customer name is required.'); return; }
    if (!customerPhone.trim()) { setError('Customer phone number is required.'); return; }

    const finalAddOns = [...addOns];
    if (ledName.trim() && !finalAddOns.includes('led-name')) {
      finalAddOns.push('led-name');
    }

    setSubmitting(true);
    try {
      const response = await axios.post(`${API_URL}/admin/bookings/create-offline`, {
        booking: {
          branchId,
          date,
          slot,
          packageName,
          balloonColor,
          cakeOption,
          sparklers,
          eggless,
          addOns: finalAddOns,
          ledName: ledName.trim() || null,
          customer: {
            name: customerName.trim(),
            phone: customerPhone.trim(),
            email: customerEmail.trim() || undefined,
            occasion: occasion || undefined,
            celebrantName: celebrantName.trim() || undefined,
            guestCount: parseInt(guestCount, 10) || 2,
            cakeMessage: messageOnCake.trim() || undefined,
            specialNote: specialNote.trim() || undefined,
            marketingConsent,
          }
        }
      }, getHeaders());

      if (response.data.success) {
        setSuccess({
          bookingId: response.data.bookingId,
          totalPrice: response.data.totalPrice
        });
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create booking');
    } finally {
      setSubmitting(false);
    }
  };

  // Success screen
  if (success) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 100px)' }}>
        <div className="panel-card" style={{ padding: '48px', textAlign: 'center', maxWidth: '500px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
          <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>Booking Created!</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>
            The offline reservation has been confirmed successfully.
          </p>
          <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Booking ID</div>
            <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--accent-gold)', fontFamily: 'monospace' }}>{success.bookingId}</div>
            <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '8px' }}>Total: ₹{success.totalPrice.toLocaleString('en-IN')}</div>
          </div>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button onClick={resetForm} className="btn btn-primary" style={{ fontSize: '14px' }}>Create Another Booking</button>
          </div>
        </div>
      </div>
    );
  }

  const sectionStyle: React.CSSProperties = {
    padding: '24px',
    marginBottom: '0',
  };

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: '15px',
    fontWeight: 600,
    color: 'var(--accent-gold)',
    marginBottom: '16px',
    paddingBottom: '8px',
    borderBottom: '1px solid var(--border-color)',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '12px',
    fontWeight: 600,
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '6px',
    display: 'block',
  };

  return (
    <div style={{ height: 'calc(100vh - 100px)', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Page Header */}
      <div className="panel-card" style={{ padding: '24px', flexShrink: 0 }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, margin: 0 }}>New Offline Booking</h1>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
          Create a reservation for walk-in, phone, or repeat customers. No payment required.
        </p>
      </div>

      {error && (
        <div style={{ padding: '12px 20px', backgroundColor: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '8px', color: 'var(--status-cancelled)', fontSize: '13px' }}>
          ⚠ {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* Branch + Date/Slot Row */}
        <div className="panel-card" style={sectionStyle}>
          <h3 style={sectionTitleStyle}>Branch, Date & Time</h3>
          <div style={{ display: 'grid', gridTemplateColumns: user?.role === 'super_admin' ? '1fr 1fr 1fr' : '1fr 1fr', gap: '16px' }}>

            {/* Branch */}
            {user?.role === 'super_admin' ? (
              <div>
                <label style={labelStyle}>Branch</label>
                <select className="form-control" value={branchId} onChange={(e) => setBranchId(e.target.value)} required>
                  <option value="">Select branch</option>
                  <option value="kokapet">Kokapet</option>
                  <option value="sainikpuri">Sainikpuri</option>
                </select>
              </div>
            ) : (
              <div style={{ display: 'none' }} />
            )}

            {/* Date */}
            <div>
              <label style={labelStyle}>Date</label>
              <input
                type="date"
                className="form-control"
                value={date}
                onChange={(e) => { setDate(e.target.value); setSlot(''); }}
                required
              />
            </div>

            {/* Slot */}
            <div>
              <label style={labelStyle}>Time Slot</label>
              <select className="form-control" value={slot} onChange={(e) => setSlot(e.target.value)} required disabled={!date || loadingSlots}>
                <option value="">{loadingSlots ? 'Loading slots...' : 'Select slot'}</option>
                {allSlots.map(s => {
                  const status = slotsAvailability[s];
                  const disabled = status ? !status.available : false;
                  return (
                    <option key={s} value={s} disabled={disabled}>
                      {s}{disabled ? ` — ${status?.reason || 'Unavailable'}` : ''}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
        </div>

        {/* Package Selection */}
        <div className="panel-card" style={sectionStyle}>
          <h3 style={sectionTitleStyle}>Package</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }}>
            {packages.map(pkg => (
              <button
                key={pkg.id}
                type="button"
                onClick={() => setPackageName(pkg.id)}
                style={{
                  padding: '16px 12px',
                  backgroundColor: packageName === pkg.id ? 'rgba(245, 158, 11, 0.08)' : 'rgba(255,255,255,0.02)',
                  border: packageName === pkg.id ? '2px solid var(--accent-gold)' : '1px solid var(--border-color)',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '15px', color: packageName === pkg.id ? 'var(--accent-gold)' : 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{pkg.name}</div>
                <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>₹{pkg.price.toLocaleString('en-IN')}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Customizations */}
        <div className="panel-card" style={sectionStyle}>
          <h3 style={sectionTitleStyle}>Experience Customizations</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* Balloon Color */}
            <div>
              <label style={labelStyle}>Balloon Palette</label>
              <select className="form-control" value={balloonColor} onChange={(e) => setBalloonColor(e.target.value)}>
                {balloonOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Cake Flavor */}
            <div>
              <label style={labelStyle}>Cake Flavor</label>
              <select className="form-control" value={cakeOption} onChange={(e) => setCakeOption(e.target.value)}>
                {cakeOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Message on Cake */}
            <div>
              <label style={labelStyle}>Message on Cake</label>
              <input
                type="text"
                className="form-control"
                value={messageOnCake}
                onChange={(e) => setMessageOnCake(e.target.value)}
                placeholder="e.g. Happy Birthday John!"
                disabled={cakeOption === 'none'}
                style={{ opacity: cakeOption === 'none' ? 0.4 : 1 }}
              />
            </div>

            {/* LED Name */}
            <div>
              <label style={labelStyle}>LED Name Board {ledName ? `(₹${ledName.replace(/[^a-zA-Z0-9]/g, '').length * 49})` : '(₹49/letter)'}</label>
              <input
                type="text"
                className="form-control"
                value={ledName}
                onChange={(e) => setLedName(e.target.value.toUpperCase())}
                placeholder="e.g. JOHN"
              />
            </div>

            {/* Toggles row */}
            <div style={{ display: 'flex', gap: '24px', alignItems: 'center', gridColumn: '1 / -1' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
                <input
                  type="checkbox"
                  checked={sparklers}
                  onChange={(e) => setSparklers(e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: 'var(--accent-gold)' }}
                />
                Sparklers {packageName === 'party' ? '(+₹149)' : '(Included)'}
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', opacity: cakeOption === 'none' ? 0.4 : 1 }}>
                <input
                  type="checkbox"
                  checked={eggless}
                  onChange={(e) => setEggless(e.target.checked)}
                  disabled={cakeOption === 'none'}
                  style={{ width: '16px', height: '16px', accentColor: 'var(--accent-gold)' }}
                />
                Eggless Cake (+₹250)
              </label>
            </div>
          </div>
        </div>

        {/* Add-Ons */}
        <div className="panel-card" style={sectionStyle}>
          <h3 style={sectionTitleStyle}>Add-Ons</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
            {addOnsList.map(addon => (
              <label
                key={addon.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 14px',
                  backgroundColor: addOns.includes(addon.id) ? 'rgba(245, 158, 11, 0.06)' : 'rgba(255,255,255,0.01)',
                  border: addOns.includes(addon.id) ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid var(--border-color)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  fontSize: '13px',
                }}
              >
                <input
                  type="checkbox"
                  checked={addOns.includes(addon.id)}
                  onChange={() => toggleAddOn(addon.id)}
                  style={{ width: '14px', height: '14px', accentColor: 'var(--accent-gold)', flexShrink: 0 }}
                />
                <span style={{ flex: 1 }}>{addon.label}</span>
                <span style={{ color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 500 }}>₹{addon.price.toLocaleString('en-IN')}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Customer Details */}
        <div className="panel-card" style={sectionStyle}>
          <h3 style={sectionTitleStyle}>Customer Details</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Name *</label>
              <input type="text" className="form-control" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Customer full name" required />
            </div>
            <div>
              <label style={labelStyle}>Phone / WhatsApp *</label>
              <input type="tel" className="form-control" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="e.g. 9876543210" required />
            </div>
            <div>
              <label style={labelStyle}>Email</label>
              <input type="email" className="form-control" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} placeholder="Optional" />
            </div>
            <div>
              <label style={labelStyle}>Occasion</label>
              <select className="form-control" value={occasion} onChange={(e) => setOccasion(e.target.value)}>
                <option value="">Select occasion</option>
                {occasionOptions.map(o => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Celebrant Name</label>
              <input type="text" className="form-control" value={celebrantName} onChange={(e) => setCelebrantName(e.target.value)} placeholder="Who's being celebrated?" />
            </div>
            <div>
              <label style={labelStyle}>Guest Count</label>
              <select className="form-control" value={guestCount} onChange={(e) => setGuestCount(e.target.value)}>
                {['2', '3', '4', '5', '6'].map(n => (
                  <option key={n} value={n}>{n} guests</option>
                ))}
              </select>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Special Note</label>
              <textarea className="form-control" rows={3} value={specialNote} onChange={(e) => setSpecialNote(e.target.value)} placeholder="Any special requests or instructions..." style={{ resize: 'none' }} />
            </div>
            <div style={{ gridColumn: '1 / -1', marginTop: '4px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
                <input
                  type="checkbox"
                  checked={marketingConsent}
                  onChange={(e) => setMarketingConsent(e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: 'var(--accent-gold)' }}
                />
                Share booking updates & promotional offers via WhatsApp/Email (Default Opt-In)
              </label>
            </div>
          </div>
        </div>

        {/* Summary & Submit */}
        <div className="panel-card" style={{ ...sectionStyle, position: 'sticky', bottom: 0, zIndex: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '2px solid var(--border-color)' }}>
          <div>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Estimated Total</span>
            <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--accent-gold)' }}>
              ₹{totalPrice.toLocaleString('en-IN')}
            </div>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
              Offline booking — no advance payment
            </span>
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting || !packageName || !date || !slot || !customerName || !customerPhone}
            style={{ fontSize: '15px', padding: '12px 32px', opacity: submitting ? 0.6 : 1 }}
          >
            {submitting ? 'Creating...' : 'Create Booking'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default OfflineBookingForm;
