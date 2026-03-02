import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { addToCart } from '../utils/cartUtils';
const ProductCollectionPage = ({ title, filterColumn, user, handleAuthPopup}) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    const fetchCollection = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select(`*, categories ( name )`)
        .eq(filterColumn, true); // Dynamically filter by the column passed as a prop

      if (!error) setProducts(data || []);
      setLoading(false);
    };

    fetchCollection();
  }, [filterColumn]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') setSelectedProduct(null);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (selectedProduct) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [selectedProduct]);


  if (loading) return <div className="p-20 text-center text-gray-500">Loading {title}...</div>;

  return (
    <div className="min-h-screen bg-amber-50 dark:bg-gray-900 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl md:text-5xl font-black text-primary leading-none mb-3 drop-shadow-lg">{title}</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div key={product.id} onClick={() => setSelectedProduct(product)}
            className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md border dark:border-gray-700">
              <img src={product.image_url} alt={product.name} 
              className="w-full h-48 object-cover rounded-lg mb-4" />
              <h3 className="font-bold text-lg dark:text-white">{product.name}</h3>
              <p className="text-sm text-gray-500">{product.categories?.name}</p>
              <p className="text-primary font-bold mt-2">₹{product.price}</p>
              <button
              onClick={() => product.stock_qty > 0 && addToCart(product, user, handleAuthPopup)}
              disabled={product.stock_qty <= 0}
              className={`mt-4 w-full py-2 rounded-lg font-bold transition-all
              ${product.stock_qty <= 0
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-primary text-white hover:bg-opacity-90'
              }`}
              >
              {product.stock_qty <= 0 ? '❌ Out of Stock' : 'Add to Cart'}
              </button>
            </div>
          ))}
        </div>
        {products.length === 0 && <p className="text-center text-gray-500 py-10">No products found here yet.</p>}
      </div>
     {/* ══════════════════════════════
              PRODUCT DETAIL MODAL
          ══════════════════════════════ */}
          {selectedProduct && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
              onClick={() => setSelectedProduct(null)}
            >
              <div
                className="relative bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close Button */}
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="absolute top-4 right-4 z-20 w-9 h-9 bg-white dark:bg-gray-800 rounded-full shadow-md flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-red-500 hover:scale-110 transition-all duration-200"
                >
                  ✕
                </button>
    
                {/* Left: Image */}
                <div className="relative w-full md:w-1/2 bg-amber-50 dark:bg-gray-800 flex-shrink-0">
                  {selectedProduct.stock_qty <= 0 && (
                    <div className="absolute inset-0 bg-white/60 dark:bg-gray-900/60 z-10 flex items-center justify-center">
                      <span className="text-xs tracking-widest uppercase text-gray-500 font-semibold border border-gray-300 px-5 py-2 bg-white dark:bg-gray-800 rounded-full">
                        Sold Out
                      </span>
                    </div>
                  )}
                  <img
                    src={selectedProduct.image_url}
                    alt={selectedProduct.name}
                    className={`w-full h-64 md:h-full object-cover ${
                      selectedProduct.stock_qty <= 0 ? 'grayscale opacity-60' : ''
                    }`}
                  />
                </div>
    
                {/* Right: Details */}
                <div className="flex flex-col p-8 overflow-y-auto w-full">
                  <span className="text-xs tracking-widest uppercase text-primary font-semibold mb-3">
                    {selectedProduct.categories?.name || title}
                  </span>
    
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white leading-snug mb-2">
                    {selectedProduct.name}
                  </h2>
    
                  <p className="text-3xl font-black text-primary mb-4">
                    ₹{selectedProduct.price}
                  </p>
    
                  <div className="h-px bg-gray-100 dark:bg-gray-700 mb-4" />
    
                  {/* Description */}
                  {selectedProduct.description ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-6">
                      {selectedProduct.description}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-400 dark:text-gray-500 leading-relaxed mb-6 italic">
                      No description available.
                    </p>
                  )}
    
                  {/* Stock Status */}
                  <div className="flex items-center gap-2 mb-6">
                    <div className={`w-2.5 h-2.5 rounded-full ${
                      selectedProduct.stock_qty <= 0
                        ? 'bg-gray-300'
                        : selectedProduct.stock_qty <= 5
                        ? 'bg-amber-400 animate-pulse'
                        : 'bg-green-400'
                    }`} />
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {selectedProduct.stock_qty <= 0
                        ? 'Out of stock'
                        : selectedProduct.stock_qty <= 5
                        ? `Only ${selectedProduct.stock_qty} units left!`
                        : `${selectedProduct.stock_qty} units available`}
                    </p>
                  </div>
    
                  <div className="flex-1" />
    
                  {/* Buttons */}
                  <div className="flex flex-col gap-3 mt-4">
                    <button
                      onClick={() => {
                        if (selectedProduct.stock_qty > 0) {
                          addToCart(selectedProduct, user, handleAuthPopup);
                          setSelectedProduct(null);
                        }
                      }}
                      disabled={selectedProduct.stock_qty <= 0}
                      className={`w-full py-3 rounded-xl text-sm font-bold tracking-wide transition-all duration-200 ${
                        selectedProduct.stock_qty <= 0
                          ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                          : 'bg-primary hover:bg-opacity-90 text-white shadow-md hover:-translate-y-0.5 active:translate-y-0'
                      }`}
                    >
                      {selectedProduct.stock_qty <= 0 ? 'Sold Out' : '🛒 Add to Cart'}
                    </button>
    
                    <button
                      onClick={() => setSelectedProduct(null)}
                      className="w-full py-3 rounded-xl text-sm font-semibold text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-all duration-200"
                    >
                      Continue Browsing
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
    
        </div>
      );
    };
    
    export default ProductCollectionPage;
    