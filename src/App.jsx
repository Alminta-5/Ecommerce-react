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

const App = () => {
  const [orderPopup, setOrderPopup] = React.useState(false);
  const [authPopup, setAuthPopup] = React.useState(false);

  const handleOrderPopup = () => {
    setOrderPopup(!orderPopup);
  };

  const handleAuthPopup = () => {
    setAuthPopup(!authPopup);
  };

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
    <Router>
      <div className='bg-white dark:bg-gray-900 dark:text-white duration-200'>
        <Navbar handleOrderPopup={handleOrderPopup} handleAuthPopup={handleAuthPopup}/>
        
        {/* State passed here is authPopup, which is correct */}
        <AuthPopup orderPopup={authPopup} setOrderPopup={setAuthPopup} />
        
        <Routes>
          <Route path="/" element={
            <>
              <Hero handleOrderPopup={handleOrderPopup} />
              <Products />
              <TopProducts handleOrderPopup={handleOrderPopup}/>
              <Banner />
              <Subscribe/>
              <Products />
              <Testimonials />
            </>
          } />

          {/* This route will now work because UserDashboard is imported */}
          <Route path="/dashboard" element={<UserDashboard />} />
        </Routes>
        <Footer />
        <Popup orderPopup={orderPopup} setOrderPopup={setOrderPopup} />
      </div>
    </Router>
  );
};

export default App;