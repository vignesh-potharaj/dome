import React from 'react';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import ProtectedRoute from '../components/ProtectedRoute';

const Dashboard = () => {
  const router = useRouter();

  useEffect(() => {
    // Logic to fetch user data or handle redirection if needed
  }, []);

  return (
    <ProtectedRoute>
      <div>
        <h1>Dashboard</h1>
        <p>Welcome to your dashboard!</p>
        {/* Additional user-specific information can be displayed here */}
      </div>
    </ProtectedRoute>
  );
};

export default Dashboard;