import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

const AdminProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [categories, setCategories] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProductId, setCurrentProductId] = useState(null);
  const [productData, setProductData] = useState({
    name: '', description: '', price: '', stock_qty: '',
    category_id: '', imageFile: null, top_rated: false,
    trending: false, best_seller: false
  });

  const uploadProductImage = async (file) => {
    if (!file) return null;
    if (file.size > 3 * 1024 * 1024) { alert("Image must be under 3MB"); return null; }
    const fileName = `products/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from('product-images').upload(fileName, file);
    if (error) { alert(error.message); return null; }
    const { data } = supabase.storage.from('product-images').getPublicUrl(fileName);
    return data.publicUrl;
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (parseInt(productData.stock_qty) < 0) { alert("Stock cannot be less than 0."); return; }
    let finalImageUrl = productData.image_url;
    if (productData.imageFile) finalImageUrl = await uploadProductImage(productData.imageFile);

    const payload = {
      name: productData.name,
      description: productData.description,
      price: parseFloat(productData.price),
      stock_qty: parseInt(productData.stock_qty),
      category_id: productData.category_id,
      image_url: finalImageUrl,
      top_rated: productData.top_rated,
      trending: productData.trending,
      best_seller: productData.best_seller,
    };

    const { error } = isEditing
      ? await supabase.from('products').update(payload).eq('id', currentProductId)
      : await supabase.from('products').insert(payload);

    if (error) { alert(error.message); }
    else { alert(isEditing ? "Updated Successfully!" : "Added Successfully!"); closeAndResetModal(); fetchProducts(); }
  };

  const closeAndResetModal = () => {
    setShowModal(false); setIsEditing(false); setCurrentProductId(null);
    setProductData({ name: '', description: '', price: '', stock_qty: '', category_id: '', imageFile: null, top_rated: false, trending: false, best_seller: false });
  };

  const fetchProducts = async () => {
    const { data, error } = await supabase.from('products').select(`*, categories ( name )`);
    if (!error) setProducts(data || []);
  };

  const fetchCategories = async () => {
    const { data, error } = await supabase.from('categories').select('id, name');
    if (!error) setCategories(data || []);
  };

  useEffect(() => { fetchProducts(); fetchCategories(); }, []);

  const handleDeleteProduct = async (product) => {
    if (!window.confirm(`Permanently delete ${product.name}?`)) return;
    try {
      if (product.image_url) {
        const urlParts = product.image_url.split('product-images/');
        if (urlParts.length > 1) {
          const filePath = urlParts[1].split('?')[0];
          await supabase.storage.from('product-images').remove([filePath]);
        }
      }
      const { error: dbError } = await supabase.from('products').delete().eq('id', product.id);
      if (dbError) throw dbError;
      alert("Product and image successfully removed.");
      fetchProducts();
    } catch (error) { alert("Database Error: " + error.message); }
  };

  const handleEditClick = (product) => {
    setProductData({
      name: product.name, description: product.description,
      price: product.price, stock_qty: product.stock_qty,
      category_id: product.category_id, image_url: product.image_url,
      imageFile: null, top_rated: product.top_rated,
      trending: product.trending, best_seller: product.best_seller
    });
    setCurrentProductId(product.id);
    setIsEditing(true);
    setShowModal(true);
  };

  return (
    <div>

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Product Management</h2>
        <button
          onClick={() => {
            setIsEditing(false);
            setShowModal(true);
            setProductData({ name: '', description: '', price: '', stock_qty: '', category_id: '', imageFile: null, top_rated: false, trending: false, best_seller: false });
          }}
          className="bg-primary text-white px-6 py-2 rounded-lg font-bold hover:bg-green-700 shadow-md w-full sm:w-auto"
        >
          + Add New Product
        </button>
      </div>

      {/* ── Add/Edit Modal ── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 px-4">
          <div className="bg-white p-5 sm:p-6 rounded-xl w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">{isEditing ? "Edit Product" : "Add New Product"}</h2>

            <form onSubmit={handleSaveProduct} className="space-y-3">
              <input
                type="text" placeholder="Product Name" required
                className="w-full p-2 border rounded"
                value={productData.name}
                onChange={(e) => setProductData({ ...productData, name: e.target.value })}
              />
              <textarea
                placeholder="Description"
                className="w-full p-2 border rounded"
                value={productData.description}
                onChange={(e) => setProductData({ ...productData, description: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number" placeholder="Price" required
                  className="w-full p-2 border rounded"
                  value={productData.price}
                  onChange={(e) => setProductData({ ...productData, price: e.target.value })}
                />
                <input
                  type="number" min="0" placeholder="Stock Qty" required
                  className="w-full p-2 border rounded"
                  value={productData.stock_qty}
                  onChange={(e) => setProductData({ ...productData, stock_qty: e.target.value })}
                />
              </div>
              <select
                required className="w-full p-2 border rounded"
                value={productData.category_id}
                onChange={(e) => setProductData({ ...productData, category_id: e.target.value })}
              >
                <option value="">Select Category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>

              {/* Checkboxes */}
              <div className="flex flex-wrap gap-4 py-2 border-t border-b">
                {[
                  { key: 'top_rated', label: 'Top Rated' },
                  { key: 'trending', label: 'Trending' },
                  { key: 'best_seller', label: 'Best Seller' },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox" className="w-4 h-4 accent-green-600"
                      checked={productData[key]}
                      onChange={(e) => setProductData({ ...productData, [key]: e.target.checked })}
                    />
                    <span className="text-sm font-medium">{label}</span>
                  </label>
                ))}
              </div>

              <input
                type="file" accept="image/*"
                required={!isEditing}
                className="w-full text-sm"
                onChange={(e) => setProductData({ ...productData, imageFile: e.target.files[0] })}
              />

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={closeAndResetModal}
                  className="px-4 py-2 bg-gray-500 text-white rounded">
                  Cancel
                </button>
                <button type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded font-bold">
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Product Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {products.length === 0 ? (
          <p className="text-gray-500 col-span-4 text-center py-20">No products found.</p>
        ) : (
          products.map((product) => (
            <div key={product.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              {product.image_url && (
                <img src={product.image_url} alt={product.name} className="w-full h-40 object-cover rounded-lg mb-3" />
              )}
              <h3 className="font-bold text-gray-800 dark:text-white">{product.name}</h3>
              <p className="text-sm text-gray-500 mt-1">Category: {product.categories?.name}</p>
              <p className="text-primary font-bold mt-1">₹{product.price}</p>
              <div className="flex gap-2 mt-4">
                <button onClick={() => handleEditClick(product)}
                  className="flex-1 text-sm bg-blue-50 text-blue-600 font-bold py-1.5 rounded hover:bg-blue-100 transition">
                  Edit
                </button>
                <button onClick={() => handleDeleteProduct(product)}
                  className="flex-1 text-sm bg-red-50 text-red-600 font-bold py-1.5 rounded hover:bg-red-100 transition">
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};

export default AdminProductsPage;
