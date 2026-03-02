import React, { useState } from 'react';
import { Link, useNavigate, Outlet, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import Logo from "../assets/logo.png";
import { HiMenuAlt3, HiX } from "react-icons/hi";

const AdminLayout = ({ onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (path) =>
    location.pathname === path
      ? "bg-primary text-white"
      : "hover:bg-gray-100 text-gray-600";

  const navItems = [
    { label: "User Management", path: "/admin/dashboard" },
    { label: "Product Management", path: "/admin/products" },
    { label: "Top Rated", path: "/admin/top-rated" },
  ];

  const handleNav = (path) => {
    navigate(path);
    setSidebarOpen(false); // Close sidebar on mobile after navigation
  };

  return (
    <div className="flex min-h-screen bg-gray-50">

      {/* ── Mobile Overlay backdrop ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── SIDEBAR ── */}
      <aside className={`
        fixed top-0 left-0 h-screen w-64 bg-white shadow-xl flex flex-col border-r z-30
        transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:sticky lg:z-auto
      `}>
        {/* Logo */}
        <div className="p-6 flex items-center justify-between border-b">
          <Link to="/" className="flex items-center gap-2">
            <img src={Logo} alt="Shopsy" className="w-8" />
            <span className="text-xl font-bold text-gray-800">Shopsy Admin</span>
          </Link>
          {/* Close button — mobile only */}
          <button
            className="lg:hidden text-gray-500 hover:text-gray-800"
            onClick={() => setSidebarOpen(false)}
          >
            <HiX size={22} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => handleNav(item.path)}
              className={`w-full text-left px-4 py-3 rounded-lg font-semibold transition-all ${isActive(item.path)}`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Sign Out */}
        <div className="p-4 border-t">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2 p-3 text-red-600 font-bold hover:bg-red-50 rounded-lg transition-all"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Mobile Top Bar */}
        <div className="lg:hidden flex items-center gap-4 px-4 py-3 bg-white border-b shadow-sm sticky top-0 z-10">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-700 hover:text-primary transition-colors"
            aria-label="Open menu"
          >
            <HiMenuAlt3 size={24} />
          </button>
          <div className="flex items-center gap-2">
            <img src={Logo} alt="Shopsy" className="w-7" />
            <span className="font-bold text-gray-800">Shopsy Admin</span>
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>

      </div>
    </div>
  );
};

export default AdminLayout;
