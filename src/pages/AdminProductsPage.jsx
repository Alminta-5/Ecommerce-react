import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from "../assets/logo.png";
import { supabase } from '../lib/supabaseClient';

const AdminProducts = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);

  // Logic to fetch products from your database
  const fetchProducts = async () => {
    const { data } = await supabase.from('products').select('*');
    setProducts(data || []);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950">
      {/* --- SHARED ADMIN NAVBAR --- */}
      <nav className="bg-white dark:bg-gray-900 shadow-md p-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center">
                <Link to="/" className="font-bold text-2xl sm:text-3xl flex gap-2">
                <img src={Logo} alt="logo" className="w-10" />
                 Shopsy
                </Link>
          </div>

          <div className="flex gap-4 items-center">
            {/* Navigates back to the User Management Table */}
            <button 
            onClick={() => navigate('/admin-top-rated')} 
            className="bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:scale-105 shadow-md transition-all text-sm md:text-base"
            >
            Top Rated
            </button>
            <button 
              onClick={() => navigate('/admin-dashboard')} 
              className="bg-gray-200 dark:bg-gray-800 px-4 py-2 rounded-full font-bold text-sm"
            >
              User Management
            </button>
            <button 
              onClick={() => supabase.auth.signOut().then(() => navigate('/'))} 
              className="bg-black text-white px-4 py-2 rounded-lg font-bold text-sm"
            >
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      {/* --- PRODUCT MANAGEMENT CONTENT --- */}
      <main className="p-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold dark:text-white">Inventory Management</h2>
          <button className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-700 shadow-md">
            + Add New Product
          </button>
        </div>

        {/* Grid for Product Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div key={product.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
               {/* Product display logic here */}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default AdminProducts;