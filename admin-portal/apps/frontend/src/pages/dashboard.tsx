import React, { useState } from 'react';
import ProtectedRoute from '../components/ProtectedRoute';
import Layout from '../components/Layout';
import CalendarView from '../components/CalendarView';
import AppointmentManager from '../components/AppointmentManager';
import SettingsPanel from '../components/SettingsPanel';
import CrmPanel from '../components/CrmPanel';
import OfflineBookingForm from '../components/OfflineBookingForm';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState<string>('calendar');

  const renderActiveView = () => {
    switch (activeTab) {
      case 'calendar':
        return <CalendarView />;
      case 'bookings':
        return <AppointmentManager />;
      case 'new-booking':
        return <OfflineBookingForm />;
      case 'crm':
        return <CrmPanel />;
      case 'settings':
        return <SettingsPanel />;
      default:
        return <CalendarView />;
    }
  };

  return (
    <ProtectedRoute>
      <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
        {renderActiveView()}
      </Layout>
    </ProtectedRoute>
  );
};

export default Dashboard;