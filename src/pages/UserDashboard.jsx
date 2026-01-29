import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; 
import { FaSignOutAlt } from 'react-icons/fa';

const UserDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get the name passed from AuthPopup
  const userName = location.state?.name || "Customer";
  // Get the first letter for the alphabet logo
  const initial = userName.charAt(0).toUpperCase();

  const handleLogout = () => {
    // Navigate back to home page
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950">
      {/* Dashboard Header */}
      <nav className="bg-white dark:bg-gray-900 shadow-md p-4">
        <div className="container flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">You are in Shopsy</h1>
          
          <div className="flex items-center gap-4">
            {/* Alphabet Logo (User Avatar) */}
            <div className="w-10 h-10 bg-primary text-white flex items-center justify-center rounded-full font-bold text-xl shadow-md">
              {initial}
            </div>
            <span className="font-semibold dark:text-white hidden sm:block">
              {userName}
            </span>
            {/* Logout Button */}
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-600 transition-all duration-200"
            >
              <FaSignOutAlt /> Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content & Ads */}
      <main className="container py-10">
        <h2 className="text-3xl font-bold mb-6 dark:text-white text-center sm:text-left">
          Welcome , {userName}!
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-r from-primary to-yellow-500 p-10 rounded-3xl text-white shadow-lg">
            <h3 className="text-2xl font-bold">Exclusive Deal!</h3>
            <p className="mt-2">Use code SHOPSY26 for 20% off your next purchase.</p>
          </div>
          <div className="bg-gradient-to-r from-secondary to-blue-400 p-10 rounded-3xl text-white shadow-lg">
            <h3 className="text-2xl font-bold">New Arrival</h3>
            <p className="mt-2">The 2026 Winter Collection has officially landed!</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserDashboard;