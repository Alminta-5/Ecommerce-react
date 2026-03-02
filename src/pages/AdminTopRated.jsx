import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

const AdminTopRated = () => {
  const [view, setView] = useState('toprated');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async (currentView) => {
    setLoading(true);
    let query = supabase.from('products').select(`*, categories ( name )`);
    switch (currentView) {
      case 'toprated':    query = query.eq('top_rated', true); break;
      case 'trending':    query = query.eq('trending', true); break;
      case 'bestsellers': query = query.eq('best_seller', true); break;
      default: break;
    }
    const { data: res, error } = await query;
    if (!error) setData(res || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(view); }, [view]);

  const viewLabels = {
    toprated: 'Top Rated',
    trending: 'Trending',
    bestsellers: 'Best Sellers',
  };

  const handleRemoveFromView = async (productId) => {
    const columnToUpdate = {
      toprated: 'top_rated',
      trending: 'trending',
      bestsellers: 'best_seller'
    }[view];
    if (!columnToUpdate) return;
    const { error } = await supabase.from('products').update({ [columnToUpdate]: false }).eq('id', productId);
    if (error) { alert("Update failed: " + error.message); }
    else { setData(data.filter(item => item.id !== productId)); }
  };

  return (
    <div>

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
          {viewLabels[view]} Management
        </h2>

        {/* View Switch Buttons — scrollable on mobile */}
        <div className="flex gap-2 bg-white p-1 rounded-lg shadow-sm border overflow-x-auto">
          {Object.entries(viewLabels).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setView(key)}
              className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap flex-shrink-0 ${
                view === key ? 'bg-black text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Content ── */}
      {loading ? (
        <div className="p-20 text-center text-gray-500">Loading {viewLabels[view]}...</div>
      ) : data.length === 0 ? (
        <div className="p-20 text-center text-gray-400">No items found for this category.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {data.map((item) => (
            <div key={item.id} className="p-4 bg-white border rounded-xl shadow-md hover:shadow-lg transition-shadow flex flex-col justify-between">
              {item.image_url && (
                <img src={item.image_url} alt={item.name} className="w-full h-40 object-cover rounded-lg mb-3" />
              )}
              <h3 className="font-bold text-gray-800 text-lg">{item.name}</h3>
              <p className="text-sm text-gray-500 mt-1">
                Category: <span className="font-medium text-gray-700">{item.categories?.name || 'Uncategorized'}</span>
              </p>
              <p className="text-primary font-bold mt-1">₹{item.price}</p>
              <button
                onClick={() => handleRemoveFromView(item.id)}
                className="mt-3 px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors text-sm font-semibold w-full"
              >
                Remove from {viewLabels[view]}
              </button>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default AdminTopRated;
