import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../assets/logo.png'
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import { supabase } from '../lib/supabaseClient';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [currentAdminId, setCurrentAdminId] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // NEW: State for Admin Registration
  const [showRegModal, setShowRegModal] = useState(false);
  const [adminData, setAdminData] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  
  const navigate = useNavigate();

  const loadInitialData = async () => {
    setLoading(true);
    const [{ data: authRes }, { data: usersRes }] = await Promise.all([
      supabase.auth.getUser(),
      supabase.from('Users').select('id, full_name, email, roles:role_id(role)')
    ]);

    setCurrentAdminId(authRes.user?.id);
    setUsers(usersRes || []);
    setLoading(false);
  };

  // NEW: Admin Registration Logic
  const handleAdminRegister = async (e) => {
    e.preventDefault();

    // 1. Fetch the Admin Role ID dynamically
    const { data: roleData, error: roleError } = await supabase
      .from('roles')
      .select('id')
      .eq('role', 'admin')
      .single();

    if (roleError) return alert("Could not fetch Admin role details.");

    // 2. Register the new Admin
    const { error } = await supabase.auth.signUp({
      email: adminData.email,
      password: adminData.password,
      options: {
        data: {
          full_name: adminData.name,
          role_id: roleData.id, // Assigned admin role ID from roles table
        },
      },
    });

    if (error) {
      alert("Error: " + error.message);
    } else {
      alert("New Admin Registered Successfully!");
      setShowRegModal(false);
      setAdminData({ name: "", email: "", password: "" });
      loadInitialData(); // Refresh list to show new admin
    }
  };

  const deleteUser = async (userId) => {
    if (userId === currentAdminId) {
      return alert("Forbidden: Logic prevents self-deletion.");
    }

    if (!window.confirm("The person is deleted permanently. Proceed?")) return;

    const { error } = await supabase.rpc('delete_user_by_id', { target_user_id: userId });
    
    if (error) {
      console.error("Critical Failure:", error.message);
      alert(`Deletion Failed: ${error.message}`);
    } else {
      setUsers(users.filter(u => u.id !== userId));
    }
  };

  useEffect(() => { loadInitialData(); }, []);

  if (loading) return <div className="p-20 text-center">Validating Session...</div>;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950">
      <nav className="bg-white dark:bg-gray-900 shadow-md p-4 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        
        {/* 1. Shopsy Logo & Name (Links to Home) */}
        <div>
            <Link to="/" className="font-bold text-2xl sm:text-3xl flex gap-2">
            <img src={Logo} alt="logo" className="w-10" />
             Shopsy
            </Link>
            </div>

        {/* 2. Admin Action Center */}
        <div className="flex gap-4 items-center">
          {/* PRODUCT MANAGEMENT BUTTON (Moves to new page) */}
          <button 
            onClick={() => navigate('/admin-products')} 
            className="bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:scale-105 shadow-md transition-all text-sm md:text-base"
          >
            Product Management
          </button>

          {/* REGISTER ADMIN BUTTON (Opens Modal) */}
          <button 
            onClick={() => setShowRegModal(true)} 
            className="bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:scale-105 shadow-md transition-all text-sm md:text-base"
          >
            + Register Admin
          </button>
          
          {/* SIGN OUT BUTTON */}
          <button 
            onClick={() => supabase.auth.signOut().then(() => navigate('/'))} 
            className="bg-primary text-white px-4 py-2 rounded-lg font-bold hover:scale-105 transition-all text-sm md:text-base"
          >
            Sign Out
          </button>
        </div>
      </div>
    </nav>

      {/* ADMIN REGISTRATION MODAL */}
      {showRegModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-xl w-[400px] shadow-2xl">
            <h2 className="text-xl font-bold mb-4">Add New Administrator</h2>
            <form onSubmit={handleAdminRegister} className="space-y-4">
              <input 
                type="text" placeholder="Full Name" required 
                className="w-full p-2 border rounded outline-none focus:ring-2 focus:ring-green-500"
                onChange={(e) => setAdminData({...adminData, name: e.target.value})}
              />
              <input 
                type="email" placeholder="Email" required 
                className="w-full p-2 border rounded outline-none focus:ring-2 focus:ring-green-500"
                onChange={(e) => setAdminData({...adminData, email: e.target.value})}
              />
              
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password (min 6 chars)"
                  required
                  className="w-full p-2 border rounded outline-none focus:ring-2 focus:ring-green-500 pr-10"
                  onChange={(e) => setAdminData({...adminData, password: e.target.value})}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 dark:text-gray-300"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <AiOutlineEyeInvisible size={18} /> : <AiOutlineEye size={18} />}
                </button>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowRegModal(false)} className="px-4 py-2 bg-gray-500 text-white rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded font-bold">Register Admin</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b bg-gray-50 text-xs uppercase text-gray-500">
              <th className="p-4">Identity</th>
              <th className="p-4">Access Level</th>
              <th className="p-4 text-right">Operations</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b last:border-0 hover:bg-gray-50/50">
                <td className="p-4">
                  <p className="font-bold">{u.full_name}</p>
                  <p className="text-sm text-gray-500">{u.email}</p>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-md text-xs font-bold ${u.roles?.role === 'admin' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {u.roles?.role || "user"}
                  </span>
                </td>
                <td className="p-4 text-right">
                  {u.id === currentAdminId ? (
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">Active Session</span>
                  ) : (
                    <button onClick={() => deleteUser(u.id)} className="text-red-600 font-bold hover:underline">
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;