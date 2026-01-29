import { useNavigate } from 'react-router-dom';
import React, { useState } from 'react';
import { IoCloseOutline } from 'react-icons/io5';
import emailjs from '@emailjs/browser';

const AuthPopup = ({ orderPopup, setOrderPopup }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: ""
  });
  const navigate = useNavigate();
  const handleInput = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAuthSubmit = (e) => {
    e.preventDefault();
    if (isLogin) {
      setOrderPopup(false);
      // Pass the actual name from formData if available
      navigate('/dashboard', { state: { name: formData.name || "Customer" } });
    } else {
      sendWelcomeEmail(e);
    }
  };

  const sendWelcomeEmail = (e) => {
    // e.preventDefault();

    // 1. Immediately close the popup so the user can continue shopping
    setOrderPopup(false);

    // 2. Send the mail in the background
    const serviceId = 'service_f4miqbr'; 
    const templateId = 'template_seupp8l'; 
    const publicKey = 't5UzBCGrxoViNNq5V'; 

    const templateParams = {
      user_name: formData.name,
      user_email: formData.email,
    };
    emailjs.send(serviceId, templateId, templateParams, publicKey)
      .then(() => {
        console.log("Email sent successfully in the background.");
        // After sending email, navigate to dashboard
        navigate('/dashboard', { state: { name: formData.name } });
      })
      .catch((err) => {
        console.error("Silent email send failed:", err);
      });
  };

  return (
    <>
      {orderPopup && (
        <div className="fixed top-0 left-0 w-screen h-screen bg-black/50 backdrop-blur-sm z-50 flex justify-center items-center">
          <div className="bg-white dark:bg-gray-900 p-8 rounded-xl shadow-md w-[350px] relative">
            <IoCloseOutline 
              className="text-2xl cursor-pointer absolute top-4 right-4 dark:text-white" 
              onClick={() => setOrderPopup(false)} 
            />

            <h1 className="text-2xl font-bold mb-6 dark:text-white">
                {isLogin ? "Login" : "Register"}
            </h1>

            <form onSubmit={handleAuthSubmit} className="space-y-4">
                <input name="name" onChange={handleInput} type="text" placeholder="Full Name" className="w-full rounded-full border border-gray-300 dark:border-gray-500 dark:bg-gray-800 px-4 py-2 outline-none dark:text-white" required />
              {!isLogin && (
                <>
                  <input name="phone" onChange={handleInput} type="number" placeholder="Phone Number" className="w-full rounded-full border border-gray-300 dark:border-gray-500 dark:bg-gray-800 px-4 py-2 outline-none dark:text-white" required />
                  </>
              )}
              <input name="email" onChange={handleInput} type="email" placeholder="Email" className="w-full rounded-full border border-gray-300 dark:border-gray-500 dark:bg-gray-800 px-4 py-2 outline-none dark:text-white" required />
              <input name="password" type="password" placeholder="Password" className="w-full rounded-full border border-gray-300 dark:border-gray-500 dark:bg-gray-800 px-4 py-2 outline-none dark:text-white" required />
              
              <button type="submit" className="w-full bg-gradient-to-r from-primary to-secondary text-white py-2 rounded-full font-bold hover:scale-105 duration-200">
                {isLogin ? "Log In" : "Sign Up"}
              </button>
            </form>

            <div className="text-center text-sm mt-6 dark:text-gray-400">
              {isLogin ? (
                <p>Not registered yet? <span className="text-primary font-bold cursor-pointer hover:underline" onClick={() => setIsLogin(false)}>Register here</span></p>
              ) : (
                <p>Already registered? <span className="text-primary font-bold cursor-pointer hover:underline" onClick={() => setIsLogin(true)}>Login here</span></p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AuthPopup;