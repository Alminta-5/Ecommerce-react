import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; 
import Navbar from './components/Navbar/Navbar.jsx'
import Hero from './components/Hero/Hero.jsx'
import Products from './components/products/products.jsx'
import AOS from "aos";
import "aos/dist/aos.css";
import TopProducts from './components/TopProducts/TopProducts.jsx';
import Banner from './components/Banner/Banner.jsx';
import Subscribe from './components/Subscribe/Subscribe.jsx';
import Testimonials from './components/Testimonials/Testimonials.jsx';
import Footer from './components/Footer/Footer.jsx';
import Popup from './components/Popup/Popup.jsx';
import AuthPopup from './components/AuthPopup/AuthPopup.jsx';
import UserDashboard from './pages/UserDashboard.jsx'; 
import AdminDashboard from './pages/AdminDashboard';
import { useLocation } from 'react-router-dom';
import AdminProductsPage from './pages/AdminProductsPage.jsx';
import AdminTopRated from './pages/AdminTopRated.jsx';


// 1. Create a wrapper component for your main content
const AppContent = ({ orderPopup, setOrderPopup, authPopup, setAuthPopup, handleOrderPopup, handleAuthPopup }) => {
  const location = useLocation();
  // Now useLocation works because it's inside the <Router> defined in App
  const isAdminPage = location.pathname.startsWith('/admin');

  return (
    <div className='bg-white dark:bg-gray-900 dark:text-white duration-200'>
      {/* Conditionally hide Navbar and Footer based on isAdminPage */}
      {!isAdminPage && <Navbar handleOrderPopup={handleOrderPopup} handleAuthPopup={handleAuthPopup}/>}
      
      <AuthPopup orderPopup={authPopup} setOrderPopup={setAuthPopup} />
      
      <Routes>
        <Route path="/" element={
          <>
            <Hero handleOrderPopup={handleOrderPopup} />
            <Products />
            <TopProducts handleOrderPopup={handleOrderPopup}/>
            <Banner />
            <Subscribe/>
            <Testimonials />
          </>
        } />
        <Route path="/dashboard" element={<UserDashboard />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/admin-products" element={<AdminProductsPage />} />
        <Route path="/admin-top-rated" element={<AdminTopRated />} />
      </Routes>

      {!isAdminPage && <Footer />}
      <Popup orderPopup={orderPopup} setOrderPopup={setOrderPopup} />
    </div>
  );
};

// 2. Main App component strictly provides the Router context
const App = () => {
  const [orderPopup, setOrderPopup] = React.useState(false);
  const [authPopup, setAuthPopup] = React.useState(false);

  const handleOrderPopup = () => setOrderPopup(!orderPopup);
  const handleAuthPopup = () => setAuthPopup(!authPopup);

  React.useEffect(() => {
    AOS.init({
      offset: 100,
      duration: 800,
      easing: "ease-in-sine",
      delay: 100,
    });
    AOS.refresh();
  }, []);

  return (
    <Router basename="/Ecommerce-react">
      <AppContent 
        orderPopup={orderPopup} 
        setOrderPopup={setOrderPopup}
        authPopup={authPopup}
        setAuthPopup={setAuthPopup}
        handleOrderPopup={handleOrderPopup}
        handleAuthPopup={handleAuthPopup}
      />
    </Router>
  );
};

export default App;