import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Link, useNavigate } from 'react-router-dom';

// ─────────────────────────────────────────────────────────────
// CONFIGURATION — your Supabase project credentials
// ─────────────────────────────────────────────────────────────
const SUPABASE_URL = 'https://jhdcopamctltiwuxwdiv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpoZGNvcGFtY3RsdGl3dXh3ZGl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1NDE4NzEsImV4cCI6MjA4NjExNzg3MX0.OCUotLQcK0TqGeqycUTLaHu_w7lYa3_5W7XJ-xIXH7A';
const RAZORPAY_KEY_ID = 'rzp_test_SL7UBC3KlBWRed';

// ─────────────────────────────────────────────────────────────
// UTILITY — dynamically injects Razorpay script into the page
// at the moment the user clicks checkout, then waits for it to
// be ready before opening the payment popup
// ─────────────────────────────────────────────────────────────
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return; } // already loaded, skip
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);   // script loaded successfully
    script.onerror = () => resolve(false); // script failed to load
    document.body.appendChild(script);
  });
};

// ─────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────
const Cart = ({ user }) => {

  // ── Cart State ──
  const [cartItems, setCartItems]       = useState([]);
  const [loading, setLoading]           = useState(true);

  // ── Payment State ──
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [orderSuccess, setOrderSuccess]     = useState(false);
  const [orderId, setOrderId]               = useState(null);

  // ── Address Modal State ──
  // Controls whether the address popup is visible
  const [showAddressModal, setShowAddressModal] = useState(false);
  // Stores what the user types in the address form
  const [addressData, setAddressData] = useState({
    fullName: '',
    phone: '',
    addressLine: '',
    city: '',
    state: '',
    pincode: '',
  });

  // ── Past Orders State ──
  const [pastOrders, setPastOrders]         = useState([]);
  const [ordersLoading, setOrdersLoading]   = useState(false);
  // Controls expand/collapse of each order's item list
  const [expandedOrder, setExpandedOrder]   = useState(null);

  const navigate = useNavigate();

  // ─────────────────────────────────────────────────────────────
  // FETCH CART ITEMS — loads the current user's active cart
  // ─────────────────────────────────────────────────────────────
  const fetchCartItems = async () => {
    if (!user?.id) { setLoading(false); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          id,
          quantity,
          products ( id, name, price, image_url ),
          carts!inner ( user_id )
        `)
        .eq('carts.user_id', user.id);
      if (error) throw error;
      setCartItems(data || []);
    } catch (error) {
      console.error("Cart Fetch Error:", error.message);
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // FETCH PAST ORDERS — loads all completed orders for this user
  // along with each order's individual product line items
  // ─────────────────────────────────────────────────────────────
  const fetchPastOrders = async () => {
    if (!user?.id) return;
    setOrdersLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          created_at,
          total_amount,
          status,
          delivery_address,
          razorpay_payment_id,
          order_items (
            id,
            quantity,
            price_at_purchase,
            products ( name, image_url )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }); // newest orders first

      if (error) throw error;
      setPastOrders(data || []);
    } catch (error) {
      console.error("Orders Fetch Error:", error.message);
    } finally {
      setOrdersLoading(false);
    }
  };

  // ── Calculated totals ──
  const subtotal   = cartItems.reduce((acc, item) => acc + (item.products.price * item.quantity), 0);
  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // ─────────────────────────────────────────────────────────────
  // REMOVE ITEM from cart
  // ─────────────────────────────────────────────────────────────
  const removeItem = async (itemId) => {
    const { error } = await supabase.from('cart_items').delete().eq('id', itemId);
    if (!error) {
      setCartItems(prev => prev.filter(item => item.id !== itemId));
      window.dispatchEvent(new Event("cartUpdated")); // updates navbar badge count
    }
  };

  // ─────────────────────────────────────────────────────────────
  // UPDATE QUANTITY — also validates against available stock
  // ─────────────────────────────────────────────────────────────
  const updateQty = async (itemId, newQty) => {
    if (newQty < 1) return;
    const item = cartItems.find(i => i.id === itemId);
    if (!item) return;

    // Only check stock when user is increasing quantity
    if (newQty > item.quantity) {
      const { data: productData, error: stockError } = await supabase
        .from('products').select('stock_qty').eq('id', item.products.id).single();
      if (stockError) { console.error("Stock check error:", stockError.message); return; }
      if (newQty > productData.stock_qty) {
        alert(`Sorry! Only ${productData.stock_qty} unit(s) available in stock.`);
        return;
      }
    }

    const { error } = await supabase.from('cart_items').update({ quantity: newQty }).eq('id', itemId);
    if (!error) {
      setCartItems(prev => prev.map(i => i.id === itemId ? { ...i, quantity: newQty } : i));
    } else {
      console.error("Update error:", error.message);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // STEP 1 OF CHECKOUT — open the address collection modal
  // This is triggered by the "Proceed to Checkout" button
  // ─────────────────────────────────────────────────────────────
  const handleProceedToCheckout = () => {
    if (!user?.id) { alert("Please login to proceed."); return; }
    if (cartItems.length === 0) { alert("Your cart is empty."); return; }
    setShowAddressModal(true); // Show the address form popup
  };

  // ─────────────────────────────────────────────────────────────
  // STEP 2 OF CHECKOUT — called when user submits the address form
  // Closes the address modal and opens the Razorpay payment popup
  // ─────────────────────────────────────────────────────────────
  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    setShowAddressModal(false); // Close address modal
    await handleRazorpayPayment(); // Move to payment
  };

  // ─────────────────────────────────────────────────────────────
  // STEP 3 OF CHECKOUT — Razorpay payment flow
  // 1. Load Razorpay script
  // 2. Call Edge Function to create a Razorpay order
  // 3. Open Razorpay popup
  // 4. On success → call verify Edge Function → save order to DB
  // ─────────────────────────────────────────────────────────────
  const handleRazorpayPayment = async () => {
    setPaymentLoading(true);

    try {
      // 1. Ensure Razorpay script is available before using it
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        alert("Failed to load Razorpay. Please check your internet connection.");
        setPaymentLoading(false);
        return;
      }

      // 2. Call our Supabase Edge Function to create a Razorpay order
      //    This returns a Razorpay order ID needed to open the popup
      const orderRes = await fetch(`${SUPABASE_URL}/functions/v1/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ amount: subtotal }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.error || "Failed to create order");

      // 3. Format the full delivery address as a single string to store in DB
      const fullAddress = `${addressData.fullName}, ${addressData.phone}, ${addressData.addressLine}, ${addressData.city}, ${addressData.state} - ${addressData.pincode}`;

      // 4. Configure and open the Razorpay payment popup
      const options = {
        key: RAZORPAY_KEY_ID,
        amount: orderData.amount,     // amount in paise (already multiplied by 100 in Edge Function)
        currency: orderData.currency,
        name: "Shopsy",
        description: "Order Payment",
        order_id: orderData.orderId,  // Razorpay order ID from our Edge Function
        prefill: {
          name: user.name || "",      // pre-fills name in Razorpay popup
          email: user.email || "",    // pre-fills email in Razorpay popup
          contact: addressData.phone, // pre-fills phone in Razorpay popup
        },
        theme: { color: "#f97316" },  // matches your primary orange color

        // 5. This handler runs automatically after successful payment
        //    Razorpay sends back 3 values we must verify server-side
        handler: async (response) => {
          try {
            // Call our verify Edge Function which:
            // - Verifies the payment signature (security check)
            // - Saves the order + order_items to the database
            // - Deducts stock from products
            // - Clears the cart
            const verifyRes = await fetch(`${SUPABASE_URL}/functions/v1/verify-payment`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
              },
              body: JSON.stringify({
                razorpay_order_id:  response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                userId:       user.id,
                cartItems:    cartItems,
                totalAmount:  subtotal,
                deliveryAddress: fullAddress, // pass the address to save in orders table
              }),
            });

            const verifyData = await verifyRes.json();
            if (!verifyRes.ok) throw new Error(verifyData.error || "Verification failed");

            // Payment verified and order saved — update the UI
            setCartItems([]);                              // clear cart display
            window.dispatchEvent(new Event("cartUpdated")); // reset navbar badge to 0
            setOrderId(verifyData.orderId);
            setOrderSuccess(true);
            fetchPastOrders(); // immediately refresh the past orders section

          } catch (err) {
            alert("Payment received but order saving failed: " + err.message);
          } finally {
            setPaymentLoading(false);
          }
        },

        // Runs if user closes the popup without completing payment
        modal: {
          ondismiss: () => {
            setPaymentLoading(false);
            alert("Payment cancelled. Your cart is still saved.");
          },
        },
      };

      const rzp = new window.Razorpay(options);

      // Runs if payment fails (wrong card, insufficient funds, bank decline etc.)
      rzp.on('payment.failed', (response) => {
        alert("Payment failed: " + response.error.description);
        setPaymentLoading(false);
      });

      rzp.open(); // opens the Razorpay payment popup

    } catch (error) {
      alert("Checkout Error: " + error.message);
      setPaymentLoading(false);
    }
  };

  // Load cart and past orders when component mounts or user changes
  useEffect(() => {
    fetchCartItems();
    fetchPastOrders();
  }, [user]);

  // ─────────────────────────────────────────────────────────────
  // LOADING STATE
  // ─────────────────────────────────────────────────────────────
  if (loading) return <div className="p-20 text-center">Loading your cart...</div>;

  // ─────────────────────────────────────────────────────────────
  // ORDER SUCCESS SCREEN — replaces the cart after payment
  // ─────────────────────────────────────────────────────────────
  if (orderSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900 px-4">
        <div className="text-center max-w-md">
          {/* Animated green checkmark */}
          <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-black text-gray-800 dark:text-white mb-2">Order Placed! </h1>
          <p className="text-gray-500 dark:text-gray-400 mb-2">Thank you for shopping with Shopsy!</p>

          {/* Show the generated order ID for reference */}
          {orderId && (
            <p className="text-xs text-gray-400 font-mono bg-gray-50 dark:bg-gray-800 px-4 py-2 rounded-lg inline-block mb-6">
              Order ID: {orderId}
            </p>
          )}

          <div className="bg-green-50 dark:bg-gray-800 border border-green-100 dark:border-gray-700 rounded-2xl p-5 mb-8 text-left space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-300">Payment received successfully</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">Your order is being processed</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">Delivery to: {addressData.city}, {addressData.state}</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={() => navigate('/')}
              className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:scale-105 transition-all duration-200">
              Continue Shopping
            </button>
            <button onClick={() => { setOrderSuccess(false); fetchPastOrders(); }}
              className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-8 py-3 rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200">
              View My Orders
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // MAIN CART PAGE
  // ─────────────────────────────────────────────────────────────
  return (
    <div className="container mx-auto py-10 px-4 min-h-screen dark:bg-gray-900 dark:text-white">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart ({totalItems} items)</h1>

      {cartItems.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-xl text-gray-500 mb-4">Your cart is feeling lonely.</p>
          <Link to="/all-products" className="bg-primary text-white px-6 py-2 rounded-full">Continue Shopping</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── Cart Item List ── */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <img
                  src={item.products?.image_url}
                  alt={item.products?.name}
                  className="w-20 h-20 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="font-bold">{item.products.name}</h3>
                  <p className="text-primary font-bold">₹{item.products.price}</p>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => updateQty(item.id, item.quantity - 1)} className="px-2 bg-gray-200 dark:bg-gray-700 rounded">-</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateQty(item.id, item.quantity + 1)} className="px-2 bg-gray-200 dark:bg-gray-700 rounded">+</button>
                </div>
                <button onClick={() => removeItem(item.id)} className="text-red-500 ml-4">Remove</button>
              </div>
            ))}
          </div>

          {/* ── Order Summary ── */}
          <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl h-fit">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>
            <div className="flex justify-between mb-2"><span>Subtotal:</span><span>₹{subtotal}</span></div>
            <div className="flex justify-between mb-4 text-green-600"><span>Shipping:</span><span>FREE</span></div>
            <hr className="mb-4" />
            <div className="flex justify-between text-xl font-bold mb-6"><span>Total:</span><span>₹{subtotal}</span></div>

            {/* Step 1 of checkout: opens address modal */}
            <button
              onClick={handleProceedToCheckout}
              disabled={paymentLoading}
              className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:scale-105 duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {paymentLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Processing...
                </span>
              ) : 'Proceed to Checkout'}
            </button>

            <p className="text-center text-xs text-gray-400 mt-3">Secure payment via Razorpay</p>
          </div>

        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          PAST ORDERS SECTION
          Shows all previous orders with expandable item details
      ───────────────────────────────────────────────────────────── */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold mb-6 dark:text-white">My Past Orders</h2>

        {ordersLoading ? (
          <div className="text-center py-10 text-gray-400">Loading orders...</div>
        ) : pastOrders.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <p className="text-gray-400 text-lg">No orders yet.</p>
            <p className="text-gray-400 text-sm mt-1">Your completed orders will appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pastOrders.map((order) => (
              <div key={order.id} className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl overflow-hidden shadow-sm">

                {/* ── Order Header Row — always visible ── */}
                <div
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-5 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all"
                  onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                  // clicking toggles the expanded state for this order
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    {/* Status badge — green for paid, yellow for pending */}
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold w-fit ${
                      order.status === 'paid'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                    }`}>
                      {order.status === 'paid' ? '✅ Paid' : '⏳ ' + order.status}
                    </span>

                    <div>
                      {/* Order date formatted as readable string */}
                      <p className="font-semibold text-gray-800 dark:text-white text-sm">
                        {new Date(order.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'long', year: 'numeric'
                        })}
                      </p>
                      {/* Truncated order ID for reference */}
                      <p className="text-xs text-gray-400 font-mono">#{order.id.slice(0, 8)}...</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mt-3 sm:mt-0">
                    <p className="font-black text-lg text-primary">₹{order.total_amount}</p>
                    {/* Expand/collapse arrow icon */}
                    <svg
                      className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${expandedOrder === order.id ? 'rotate-180' : ''}`}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {/* ── Expanded Order Details — visible only when clicked ── */}
                {expandedOrder === order.id && (
                  <div className="border-t border-gray-100 dark:border-gray-700 p-5">

                    {/* Delivery Address */}
                    {order.delivery_address && (
                      <div className="mb-5 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">Delivery Address</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{order.delivery_address}</p>
                      </div>
                    )}

                    {/* Payment ID for reference */}
                    {order.razorpay_payment_id && (
                      <p className="text-xs text-gray-400 font-mono mb-4">
                        Payment ID: {order.razorpay_payment_id}
                      </p>
                    )}

                    {/* List of products in this order */}
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-3">Items Ordered</p>
                    <div className="space-y-3">
                      {order.order_items?.map((item) => (
                        <div key={item.id} className="flex items-center gap-4">
                          {/* Product thumbnail */}
                          <img
                            src={item.products?.image_url}
                            alt={item.products?.name}
                            className="w-14 h-14 object-cover rounded-lg bg-gray-100"
                          />
                          <div className="flex-1">
                            <p className="font-semibold text-gray-800 dark:text-white text-sm">{item.products?.name}</p>
                            <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                          </div>
                          {/* Price at the time of purchase (locked in, doesn't change if product price changes) */}
                          <p className="font-bold text-primary">₹{item.price_at_purchase * item.quantity}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          ADDRESS COLLECTION MODAL
          Shown when user clicks "Proceed to Checkout"
          Collects delivery address before opening Razorpay
      ───────────────────────────────────────────────────────────── */}
      {showAddressModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center px-4"
          onClick={() => setShowAddressModal(false)} // click backdrop to close
        >
          <div
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md p-6 sm:p-8 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-black text-gray-800 dark:text-white">Delivery Address</h2>
                <p className="text-sm text-gray-400 mt-0.5">Where should we deliver your order?</p>
              </div>
              <button
                onClick={() => setShowAddressModal(false)}
                className="text-gray-400 hover:text-red-500 text-xl font-bold transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Address Form */}
            <form onSubmit={handleAddressSubmit} className="space-y-4">

              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter your full name"
                  value={addressData.fullName}
                  onChange={(e) => setAddressData({ ...addressData, fullName: e.target.value })}
                  className="w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  placeholder="10-digit mobile number"
                  value={addressData.phone}
                  onChange={(e) => setAddressData({ ...addressData, phone: e.target.value })}
                  className="w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary"
                />
              </div>

              {/* Address Line */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">
                  Address
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="House no, Street, Area, Landmark"
                  value={addressData.addressLine}
                  onChange={(e) => setAddressData({ ...addressData, addressLine: e.target.value })}
                  className="w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary resize-none"
                />
              </div>

              {/* City + State side by side */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="City"
                    value={addressData.city}
                    onChange={(e) => setAddressData({ ...addressData, city: e.target.value })}
                    className="w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="State"
                    value={addressData.state}
                    onChange={(e) => setAddressData({ ...addressData, state: e.target.value })}
                    className="w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Pincode */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">
                  Pincode
                </label>
                <input
                  type="text"
                  required
                  placeholder="6-digit pincode"
                  maxLength={6}
                  value={addressData.pincode}
                  onChange={(e) => setAddressData({ ...addressData, pincode: e.target.value })}
                  className="w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary"
                />
              </div>

              {/* Order Summary inside modal — shows what they're paying */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mt-2">
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300 mb-1">
                  <span>{totalItems} item(s)</span>
                  <span>₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-sm text-green-600">
                  <span>Shipping</span>
                  <span>FREE</span>
                </div>
                <div className="flex justify-between font-black text-gray-800 dark:text-white mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                  <span>Total</span>
                  <span>₹{subtotal}</span>
                </div>
              </div>

              {/* Submit button — moves to Razorpay payment */}
              <button
                type="submit"
                className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:scale-[1.02] active:scale-100 transition-all duration-200 mt-2"
              >
                Continue to Payment →
              </button>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Cart;
