import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate, useNavigate } from 'react-router-dom';
import AOS from "aos";
import "aos/dist/aos.css";

import Navbar from './components/Navbar/Navbar.jsx';
import Hero from './components/Hero/Hero.jsx';
import Products from './components/Products/Products.jsx';
import TopProducts from './components/TopProducts/TopProducts.jsx';
import Banner from './components/Banner/Banner.jsx';
import Subscribe from './components/Subscribe/Subscribe.jsx';
import Testimonials from './components/Testimonials/Testimonials.jsx';
import Footer from './components/Footer/Footer.jsx';
import AuthPopup from './components/AuthPopup/AuthPopup.jsx';
import Contact from './pages/Contact.jsx';
import UserDashboard from './pages/UserDashboard.jsx';
import AdminDashboard from './pages/AdminDashboard';
import AdminProductsPage from './pages/AdminProductsPage.jsx';
import AdminTopRated from './pages/AdminTopRated.jsx';
import AdminLayout from './components/AdminLayout.jsx';
import About from './pages/about.jsx';
import WomensWear from './pages/WomensWear.jsx';
import KidsWear from './pages/KidsWear.jsx';
import MensWear from './pages/MensWear.jsx';
import ProductCollectionPage from './pages/ProductCollectionPage.jsx';
import AllProducts from './pages/AllProducts.jsx';
import { supabase } from './lib/supabaseClient.js';
import Cart from './pages/Cart.jsx';
// ── Inner component: has access to useLocation inside Router ──
const AppContent = ({  authPopup, setAuthPopup,
    handleAuthPopup, user, setUser, handleLogout, authLoading}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isAdminPage = location.pathname.startsWith('/admin');
  const onLogout = async () => {
  await handleLogout(); // Wait for Supabase to finish
  navigate("/",{ replace: true });        // Then move to Home
};
    // Wait for session to restore before rendering any routes
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 font-medium">Loading...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="bg-white dark:bg-gray-900 dark:text-white duration-200">
      {/* Hide the public Navbar on all /admin/* pages */}
      {!isAdminPage && (
        <Navbar handleAuthPopup={handleAuthPopup} 
        user={user}           // Send user state to Navbar
        handleLogout={onLogout} // Send logout logic to Navbar
        />
      )}

      <AuthPopup orderPopup={authPopup} setOrderPopup={setAuthPopup} setUser={setUser}/>

      <Routes>

        {/* ── Public Routes ── */}
        <Route path="/" element={
          <>
            <Hero  />
            <Products />
            <TopProducts  />
            <Banner />
            <Subscribe />
            <Testimonials />
          </>
        } />
        <Route 
        path="/dashboard" 
        element={user ? <UserDashboard /> : <Navigate to="/" replace />} 
        />
        <Route path="/contact" element={<Contact />} />
        <Route path="/about" element={<About />} />
        <Route path="/womenswear" element={<WomensWear user={user} handleAuthPopup={handleAuthPopup}/>} />
        <Route path="/kidswear" element={<KidsWear user={user} handleAuthPopup={handleAuthPopup}/>} />
        <Route path="/menswear" element={<MensWear user={user} handleAuthPopup={handleAuthPopup}/>} />
        <Route path='/trending' element={<ProductCollectionPage title="Trending Products" filterColumn="trending" user={user} handleAuthPopup={handleAuthPopup}/>} />
        <Route path='/best-sellers' element={<ProductCollectionPage title="Best Sellers" filterColumn="best_seller" user={user} handleAuthPopup={handleAuthPopup}/>} />
        <Route path='/top-rated' element={<ProductCollectionPage title="Top Rated" filterColumn="top_rated" user={user} handleAuthPopup={handleAuthPopup}/>} />
        <Route path="/all-products" element={<AllProducts user={user} handleAuthPopup={handleAuthPopup}/>} />
        <Route path="/cart" element={<Cart user={user} />} />
        {/* ── Admin Routes (nested under AdminLayout for shared sidebar) ── */}
        <Route path="/admin" 
        element={!authLoading && (user ? <AdminLayout onLogout={onLogout} /> : <Navigate to="/" replace />)}>
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard"  element={<AdminDashboard />} />
          <Route path="products"   element={<AdminProductsPage />} />
          <Route path="top-rated"  element={<AdminTopRated />} />
        </Route>

      </Routes>

      {/* Hide Footer on all /admin/* pages */}
      {!isAdminPage && <Footer />}

      
    </div>
  );
};

// ── Root App: owns state + provides Router context ──
const App = () => {
  const [authPopup, setAuthPopup] = React.useState(false);
  const [user, setUser] = React.useState(null);
  const [authLoading, setAuthLoading] = React.useState(true);
  const handleAuthPopup  = () => setAuthPopup(prev => !prev);
  
  const handleLogout = async () => {
  try {
    // 1. Tell Supabase to kill the session globally
    await supabase.auth.signOut();
    
    // 2. Clear local React state
    setUser(null);
    
    // 3. Clear any lingering local storage keys manually just in case
    localStorage.removeItem('sb-access-token'); 
  } catch (error) {
    console.error("Logout error:", error.message);
  }
};

  React.useEffect(() => {
    AOS.init({ offset: 100, duration: 800, easing: "ease-in-sine", delay: 100 });
    AOS.refresh();
    const checkSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      setUser({
        id: session.user.id,
        name: session.user.user_metadata.full_name || "User",
        email: session.user.email
      });
    }else {
      setUser(null); // Ensure state is null if no session exists
    }
    setAuthLoading(false);
  };
  checkSession();
  const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_OUT') {
      setUser(null);
    }
  });

  return () => {
    authListener.subscription.unsubscribe();
  };
  }, []);

  // pick up the public base path from Vite, and default to '/'
  // during development it will be '/', while builds for GH Pages use
  // "/Ecommerce-react/" as configured in vite.config.js. Using the
  // environment variable keeps our routes consistent across modes.
  const basename = import.meta.env.BASE_URL || "/";

  return (
    <Router basename={basename}>
      <AppContent
        
        authPopup={authPopup}
        setAuthPopup={setAuthPopup}
        handleAuthPopup={handleAuthPopup}
        user={user}         // Pass user to content
        setUser={setUser}   // Pass setter to content
        handleLogout={handleLogout} // Pass logout handler
         authLoading={authLoading} 
      />
    </Router>
  );
};

export default App;
