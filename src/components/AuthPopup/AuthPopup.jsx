import { useNavigate } from 'react-router-dom';
import React, { useState } from 'react';
import { IoCloseOutline } from 'react-icons/io5';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import emailjs from '@emailjs/browser';
import { supabase } from '../../lib/supabaseClient'

const AuthPopup = ({ orderPopup, setOrderPopup }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const handleInput = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAuthSubmit = (e) => {
  e.preventDefault();
  if (isLogin) {
    handleLogin(e); // Calls the real Supabase Login
  } else {
    handleSignUp(e); // Calls the real Supabase Registration
  }
};
const handleSignUp = async (e) => {
  e.preventDefault();
  
  // 1. Fetch the user role ID
  const { data: roleData, error: roleError } = await supabase
    .from('roles')
    .select('id')
    .eq('role', 'user')
    .maybeSingle();

  if (roleError || !roleData) {
    alert("Internal Error: 'user' role not found in database.");
    console.error("Role missing:", roleError);
    return;
  }

  // 2. Register
  const { data, error } = await supabase.auth.signUp({
    email: formData.email,
    password: formData.password,
    options: {
      data: {
        full_name: formData.name,
        phone: formData.phone,
        role_id: roleData.id,
      },
    },
  });

  if (error) {
    alert("Registration Error: " + error.message);
  } else {
    alert("Success! Please log in.");
    setIsLogin(true);
  }
};
const handleLogin = async (e) => {
  e.preventDefault();
  
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: formData.email,
    password: formData.password,
  });

  if (authError) {
    alert("Login failed: " + authError.message);
    return;
  }

  if (authData?.user) {
    // We use a flat join to ensure compatibility
    const { data: userData, error: userError } = await supabase
      .from('Users') 
      .select(`
        full_name,
        role_id,
        roles!inner (
          role
        )
      `)
      .eq('id', authData.user.id)
      .maybeSingle(); // maybeSingle prevents the "contains 0 rows" crash

    if (userError || !userData) {
      console.error("Login data fetch error:", userError);
      setOrderPopup(false);
      // Fallback to user dashboard if data is missing
      navigate('/dashboard', { state: { name: authData.user.user_metadata.full_name || "User" } });
      return;
    }

    setOrderPopup(false);
    
    // Safely check the role string
    const roleName = userData.roles?.role;

    if (roleName === 'admin') {
      navigate('/admin-dashboard');
    } else {
      navigate('/dashboard', { state: { name: userData.full_name } });
    }
  }
};
 const sendWelcomeEmail = (e) => {
  const serviceId = 'service_f4miqbr'; 
  const templateId = 'template_seupp8l'; 
  const publicKey = 't5UzBCGrxoViNNq5V'; 

  const templateParams = {
    user_name: formData.name,
    user_email: formData.email,
  };

  emailjs.send(serviceId, templateId, templateParams, publicKey)
    .then(() => {
      console.log("Welcome email sent.");
      // REMOVED: navigate('/dashboard') 
    })
    .catch((err) => {
      console.error("Email failed:", err);
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
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  onChange={handleInput}
                  className="w-full rounded-full border border-gray-300 dark:border-gray-500 dark:bg-gray-800 px-4 py-2 outline-none dark:text-white pr-10"
                  required
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