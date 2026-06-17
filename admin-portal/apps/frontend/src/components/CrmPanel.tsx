import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../lib/auth';

const API_URL = process.env.API_URL || 'http://localhost:3000/api';

interface CustomerCrm {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  occasions: Record<string, string>;
  marketingConsent: boolean;
  createdAt: string;
  bookingsCount: number;
  totalSpend: number;
  lastVisitedBranch: string | null;
}

const CAMPAIGN_TEMPLATES = [
  {
    id: 'birthday_discount',
    title: '🎂 Birthday 15% Discount Offer',
    category: 'birthday',
    body: 'Hey {{name}}! 🎂 Celebrating your birthday soon? Dome Cafe has a special gift for you: get 15% off any Classic or Premium booking at our branches! Reply DOME15 to book.',
  },
  {
    id: 'anniversary_gift',
    title: '🥂 Anniversary Photographer Offer',
    category: 'anniversary',
    body: 'Happy Anniversary week {{name}}! 🥂 Re-live your special moments at Dome Cafe. Enjoy a complimentary photographer add-on when you book any Grand slot this month! Reply ANNIVGRAND to claim.',
  },
  {
    id: 'general_loyalty',
    title: '✨ Loyalty VVIP Upgrade Campaign',
    category: 'loyalty',
    body: 'Hello {{name}}, we miss you! ☕ As one of our top customers at Dome Cafe, we\'d love to host your next gathering. Use code DOMEVVIP for a free package upgrade. Book now!',
  }
];

const MONTHS = [
  { value: '01', name: 'January' },
  { value: '02', name: 'February' },
  { value: '03', name: 'March' },
  { value: '04', name: 'April' },
  { value: '05', name: 'May' },
  { value: '06', name: 'June' },
  { value: '07', name: 'July' },
  { value: '08', name: 'August' },
  { value: '09', name: 'September' },
  { value: '10', name: 'October' },
  { value: '11', name: 'November' },
  { value: '12', name: 'December' },
];

const CrmPanel: React.FC = () => {
  const { user } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState<'database' | 'campaigns'>('database');
  const [customers, setCustomers] = useState<CustomerCrm[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<CustomerCrm[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [occasionMonth, setOccasionMonth] = useState<string>('all');
  const [occasionType, setOccasionType] = useState<string>('all');
  const [consentFilter, setConsentFilter] = useState<string>('all');

  // Campaign Selection
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<string[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState(CAMPAIGN_TEMPLATES[0]);
  const [campaignSending, setCampaignSending] = useState<boolean>(false);
  const [campaignResult, setCampaignResult] = useState<{ success: boolean; count: number; error?: string } | null>(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [customers, searchQuery, occasionMonth, occasionType, consentFilter]);

  const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
  };

  const fetchCustomers = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`${API_URL}/admin/crm/customers`, getHeaders());
      if (response.data.success) {
        setCustomers(response.data.customers || []);
      }
    } catch (err: any) {
      console.error('Error fetching CRM customers:', err);
      setError(err.response?.data?.error || 'Failed to fetch customer list');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...customers];

    // Text Search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(c =>
        c.name.toLowerCase().includes(query) ||
        (c.email || '').toLowerCase().includes(query) ||
        c.phone.includes(query)
      );
    }

    // Occasion Month and Type Filter
    if (occasionMonth !== 'all') {
      result = result.filter(c => {
        const occasions = c.occasions || {};
        return Object.entries(occasions).some(([type, dateStr]) => {
          if (!dateStr || dateStr.length < 7) return false;
          // Filter by type if not 'all'
          if (occasionType !== 'all' && type !== occasionType) return false;
          // Month check (format: YYYY-MM-DD -> MM is index 5-6)
          const month = dateStr.substring(5, 7);
          return month === occasionMonth;
        });
      });
    } else if (occasionType !== 'all') {
      // If occasionType is set but month is 'all', filter customers who have that type of occasion
      result = result.filter(c => {
        const occasions = c.occasions || {};
        return !!occasions[occasionType];
      });
    }

    // Consent Filter
    if (consentFilter !== 'all') {
      const consentBool = consentFilter === 'opt-in';
      result = result.filter(c => c.marketingConsent === consentBool);
    }

    setFilteredCustomers(result);
  };

  // Checkbox selections
  const handleSelectCustomer = (id: string) => {
    setSelectedCustomerIds(prev =>
      prev.includes(id) ? prev.filter(cId => cId !== id) : [...prev, id]
    );
  };

  const handleSelectAllFiltered = () => {
    const allFilteredIds = filteredCustomers.map(c => c.id);
    const areAllSelected = allFilteredIds.every(id => selectedCustomerIds.includes(id));

    if (areAllSelected) {
      // Unselect all filtered
      setSelectedCustomerIds(prev => prev.filter(id => !allFilteredIds.includes(id)));
    } else {
      // Select all filtered (keeping any other selections)
      setSelectedCustomerIds(prev => {
        const newSelections = [...prev];
        allFilteredIds.forEach(id => {
          if (!newSelections.includes(id)) {
            newSelections.push(id);
          }
        });
        return newSelections;
      });
    }
  };

  // CSV Exporter
  const handleExportCSV = () => {
    if (filteredCustomers.length === 0) {
      alert('No customer records to export.');
      return;
    }

    const headers = [
      'Customer ID',
      'Name',
      'Phone',
      'Email',
      'Joined Date',
      'Marketing Consent',
      'Bookings Count',
      'Total Spend (INR)',
      'Last Visited Branch',
      'Birthday',
      'Anniversary'
    ];

    const rows = filteredCustomers.map(c => [
      c.id,
      c.name,
      c.phone,
      c.email || '',
      new Date(c.createdAt).toLocaleDateString(),
      c.marketingConsent ? 'Opt-In' : 'Opt-Out',
      c.bookingsCount,
      c.totalSpend,
      c.lastVisitedBranch || 'N/A',
      c.occasions?.birthday || '',
      c.occasions?.anniversary || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `dome_crm_customers_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Campaign calculations
  const consentedSelectedCount = customers.filter(
    c => selectedCustomerIds.includes(c.id) && c.marketingConsent
  ).length;

  const skippedSelectedCount = selectedCustomerIds.length - consentedSelectedCount;

  const getPreviewText = (bodyTemplate: string) => {
    if (selectedCustomerIds.length === 0) {
      return bodyTemplate.replace(/\{\{name\}\}/g, 'Valued Customer');
    }
    const firstSelectedId = selectedCustomerIds[0];
    const customer = customers.find(c => c.id === firstSelectedId);
    return bodyTemplate.replace(/\{\{name\}\}/g, customer ? customer.name : 'Valued Customer');
  };

  const handleSendCampaign = async () => {
    if (consentedSelectedCount === 0) {
      alert('Cannot send campaign: 0 recipients have opted in for marketing consent.');
      return;
    }

    const recipientNames = customers
      .filter(c => selectedCustomerIds.includes(c.id) && c.marketingConsent)
      .slice(0, 5)
      .map(c => c.name)
      .join(', ');

    const sampleText = consentedSelectedCount > 5 ? ` and ${consentedSelectedCount - 5} others` : '';

    const confirmMsg = `Are you sure you want to send the "${selectedTemplate.title}" campaign to ${consentedSelectedCount} opted-in customer(s)?\n\nPreview Recipients: ${recipientNames}${sampleText}\n\nNote: ${skippedSelectedCount} opted-out customer(s) will be automatically excluded.`;

    if (!confirm(confirmMsg)) return;

    setCampaignSending(true);
    setCampaignResult(null);

    // Filter target customer list strictly to consented IDs
    const consentedIds = customers
      .filter(c => selectedCustomerIds.includes(c.id) && c.marketingConsent)
      .map(c => c.id);

    try {
      const response = await axios.post(
        `${API_URL}/admin/crm/bulk-send`,
        {
          customerIds: consentedIds,
          templateId: selectedTemplate.id,
          templateBody: selectedTemplate.body
        },
        getHeaders()
      );

      if (response.data.success) {
        setCampaignResult({ success: true, count: response.data.count });
        // Clear selection
        setSelectedCustomerIds([]);
      } else {
        setCampaignResult({ success: false, count: 0, error: response.data.error || 'Failed to dispatch campaign' });
      }
    } catch (err: any) {
      console.error('Error dispatching CRM campaign:', err);
      setCampaignResult({
        success: false,
        count: 0,
        error: err.response?.data?.error || 'Server error occurred during dispatch'
      });
    } finally {
      setCampaignSending(false);
    }
  };

  // Helpers
  const formatOccasion = (occasions: Record<string, string>) => {
    if (!occasions || Object.keys(occasions).length === 0) return <span style={{ color: 'var(--text-secondary)' }}>None</span>;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '12px' }}>
        {occasions.birthday && (
          <div>
            🎂 Birthday: <strong>{new Date(occasions.birthday).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</strong>
          </div>
        )}
        {occasions.anniversary && (
          <div>
            🥂 Anniversary: <strong>{new Date(occasions.anniversary).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</strong>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="crm-panel">
      <div className="page-header">
        <div className="page-title">
          <h1>Customer Relations & Messaging (CRM)</h1>
          <p>Manage customer directory profiles, analyze customer spends, and run personalized bulk messaging campaigns.</p>
        </div>
      </div>

      {/* Sub-Tabs */}
      <div className="crm-tabs">
        <button
          onClick={() => {
            setActiveSubTab('database');
            setCampaignResult(null);
          }}
          className={`crm-tab-btn ${activeSubTab === 'database' ? 'active' : ''}`}
        >
          Customer Database ({filteredCustomers.length})
        </button>
        <button
          onClick={() => setActiveSubTab('campaigns')}
          className={`crm-tab-btn ${activeSubTab === 'campaigns' ? 'active' : ''}`}
        >
          Bulk Campaigns Dispatcher {selectedCustomerIds.length > 0 && `(${selectedCustomerIds.length} Selected)`}
        </button>
      </div>

      {/* Database tab content */}
      {activeSubTab === 'database' && (
        <div className="panel-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Filters Bar */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', alignItems: 'end' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Search Customer</label>
              <input
                type="text"
                placeholder="Search name, phone, email..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="form-control"
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Occasion Month</label>
              <select
                value={occasionMonth}
                onChange={e => setOccasionMonth(e.target.value)}
                className="form-control"
              >
                <option value="all">Any Month</option>
                {MONTHS.map(m => (
                  <option key={m.value} value={m.value}>{m.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Occasion Type</label>
              <select
                value={occasionType}
                disabled={occasionMonth === 'all'}
                onChange={e => setOccasionType(e.target.value)}
                className="form-control"
              >
                <option value="all">Any Occasion</option>
                <option value="birthday">Birthdays only</option>
                <option value="anniversary">Anniversaries only</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Marketing Consent</label>
              <select
                value={consentFilter}
                onChange={e => setConsentFilter(e.target.value)}
                className="form-control"
              >
                <option value="all">All Consent statuses</option>
                <option value="opt-in">Opted In (DPDP Comply)</option>
                <option value="opt-out">Opted Out (Do Not Contact)</option>
              </select>
            </div>
          </div>

          {/* Action Row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              Selected <strong>{selectedCustomerIds.length}</strong> customer(s) for campaigns.
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={handleExportCSV} className="btn btn-secondary">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: 16, height: 16 }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                Export CSV
              </button>
              <button
                onClick={() => {
                  if (selectedCustomerIds.length === 0) {
                    alert('Please select at least one customer from the list first.');
                    return;
                  }
                  setActiveSubTab('campaigns');
                }}
                className="btn btn-primary"
                disabled={selectedCustomerIds.length === 0}
              >
                Go to Campaign Dispatcher ({selectedCustomerIds.length})
              </button>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>Loading customer directory metrics...</div>
          ) : error ? (
            <div style={{ color: 'var(--status-cancelled)', padding: '20px', border: '1px solid var(--border-color)', borderRadius: '8px', backgroundColor: 'rgba(239, 68, 68, 0.05)' }}>
              {error}
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)', border: '1px dashed var(--border-color)', borderRadius: '12px' }}>
              No customer records match your filter criteria.
            </div>
          ) : (
            <div className="crm-table-container">
              <table className="crm-table">
                <thead>
                  <tr>
                    <th style={{ width: '40px', textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={filteredCustomers.length > 0 && filteredCustomers.map(c => c.id).every(id => selectedCustomerIds.includes(id))}
                        onChange={handleSelectAllFiltered}
                      />
                    </th>
                    <th>Customer Name</th>
                    <th>Contact Info</th>
                    <th>Special Occasions</th>
                    <th style={{ textAlign: 'right' }}>Total Bookings</th>
                    <th style={{ textAlign: 'right' }}>Total Spend</th>
                    <th>Last Branch</th>
                    <th style={{ textAlign: 'center' }}>Marketing Consent</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.map(customer => (
                    <tr key={customer.id}>
                      <td style={{ textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={selectedCustomerIds.includes(customer.id)}
                          onChange={() => handleSelectCustomer(customer.id)}
                        />
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{customer.name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                          Joined: {new Date(customer.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td>
                        <div>{customer.phone}</div>
                        {customer.email && <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{customer.email}</div>}
                      </td>
                      <td>{formatOccasion(customer.occasions)}</td>
                      <td style={{ textAlign: 'right', fontWeight: 500 }}>{customer.bookingsCount}</td>
                      <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--accent-gold)' }}>
                        ₹{customer.totalSpend.toLocaleString()}
                      </td>
                      <td>
                        {customer.lastVisitedBranch ? (
                          <span className="profile-badge badge-branch" style={{ textTransform: 'capitalize' }}>
                            {customer.lastVisitedBranch}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>None</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span className={`consent-badge ${customer.marketingConsent ? 'opt-in' : 'opt-out'}`}>
                          {customer.marketingConsent ? 'Opt-In' : 'Opt-Out'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Campaigns tab content */}
      {activeSubTab === 'campaigns' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px', alignItems: 'start' }}>
          
          {/* Left Panel: Selector & Actions */}
          <div className="panel-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h2>Campaign Configuration</h2>

            {/* Recipients Summary */}
            <div style={{ padding: '16px', borderRadius: '10px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '8px' }}>Target Recipients Summary</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Total Selected Customers:</span>
                  <strong style={{ color: 'var(--text-primary)' }}>{selectedCustomerIds.length}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Consented to Marketing (Opt-in):</span>
                  <strong style={{ color: 'var(--status-confirmed)' }}>{consentedSelectedCount}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Blocked / Opted Out (DPDP):</span>
                  <strong style={{ color: skippedSelectedCount > 0 ? 'var(--status-cancelled)' : 'var(--text-secondary)' }}>
                    {skippedSelectedCount}
                  </strong>
                </div>
              </div>

              {skippedSelectedCount > 0 && (
                <div style={{ marginTop: '12px', padding: '10px', borderRadius: '6px', backgroundColor: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.15)', fontSize: '12px', color: '#f87171' }}>
                  ⚠️ <strong>DPDP Act Compliance:</strong> {skippedSelectedCount} selected customer(s) do not have marketing consent and will be excluded automatically.
                </div>
              )}
            </div>

            {/* Template Chooser */}
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '10px' }}>
                Select Pre-Approved Template
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {CAMPAIGN_TEMPLATES.map(template => (
                  <div
                    key={template.id}
                    className={`template-card ${selectedTemplate.id === template.id ? 'active' : ''}`}
                    onClick={() => setSelectedTemplate(template)}
                  >
                    <div style={{ fontWeight: 600, fontSize: '14px' }}>{template.title}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {template.body}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Send Campaign Button */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
              <button
                onClick={handleSendCampaign}
                disabled={campaignSending || consentedSelectedCount === 0}
                className="btn btn-primary"
                style={{ width: '100%', padding: '12px' }}
              >
                {campaignSending ? (
                  'Dispatching campaigns via WhatsApp...'
                ) : (
                  `Send Campaign via WhatsApp (${consentedSelectedCount} Recipient${consentedSelectedCount === 1 ? '' : 's'})`
                )}
              </button>

              <button
                onClick={() => {
                  setActiveSubTab('database');
                  setCampaignResult(null);
                }}
                disabled={campaignSending}
                className="btn btn-secondary"
                style={{ width: '100%' }}
              >
                Back to Customer Database
              </button>
            </div>

            {/* Send campaign feedback */}
            {campaignResult && (
              <div
                style={{
                  padding: '14px',
                  borderRadius: '8px',
                  border: '1px solid',
                  backgroundColor: campaignResult.success ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                  borderColor: campaignResult.success ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                  color: campaignResult.success ? 'var(--status-confirmed)' : 'var(--status-cancelled)',
                  fontSize: '14px'
                }}
              >
                {campaignResult.success ? (
                  <div>
                    🎉 <strong>Campaign Dispatched!</strong> Successfully sent messages to <strong>{campaignResult.count}</strong> customer(s) via the WhatsApp Simulator. Logs were successfully recorded in the audit trail.
                  </div>
                ) : (
                  <div>
                    ❌ <strong>Failed to dispatch:</strong> {campaignResult.error || 'Unknown error occurred.'}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Panel: Live Personalized Preview */}
          <div className="panel-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h2>Live Template Preview</h2>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '-12px' }}>
              Personalized preview generated using the details of the first selected recipient in your target queue.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Template ID</span>
                <div style={{ fontSize: '14px', fontWeight: 600, marginTop: '2px' }}>{selectedTemplate.id}</div>
              </div>

              <div>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Category</span>
                <div style={{ fontSize: '13px', fontWeight: 500, textTransform: 'capitalize', marginTop: '2px' }}>
                  {selectedTemplate.category}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Live Simulated Preview Message</span>
                <div className="preview-box" style={{ marginTop: '6px' }}>
                  {getPreviewText(selectedTemplate.body)}
                </div>
              </div>

              <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                💡 <strong>Pre-Approved Templates:</strong> In order to comply with WhatsApp Business API and customer messaging guidelines, all bulk campaign templates must be pre-approved. Interactive variables like <code>{`{{name}}`}</code> will resolve dynamically at the moment of transmission.
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default CrmPanel;
