import { useNavigate } from 'react-router-dom';
import React, { useState } from 'react';
import { IoCloseOutline } from 'react-icons/io5';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import { supabase } from '../../lib/supabaseClient'

const AuthPopup = ({ orderPopup, setOrderPopup, setUser }) => {
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
      handleLogin(e);
    } else {
      handleSignUp(e);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();

    const { data: roleData, error: roleError } = await supabase
      .from('roles')
      .select('id')
      .eq('role', 'user')
      .maybeSingle();

    if (roleError || !roleData) {
      alert("Internal Error: 'user' role not found in database.");
      return;
    }

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
      const { data: userData, error: userError } = await supabase
        .from('Users')
        .select(`full_name, role_id, roles!inner ( role )`)
        .eq('id', authData.user.id)
        .maybeSingle();

      const displayName = userData?.full_name || authData.user.user_metadata.full_name || "User";
      setUser({
        id: authData.user.id,
        name: displayName,
        email: authData.user.email,
        role: userData?.roles?.role || 'user'
      });

      setOrderPopup(false);

      const roleName = userData.roles?.role;
      if (roleName === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard', { state: { name: displayName } });
      }
    }
  };

  return (
    <>
      {orderPopup && (
        // Backdrop
        <div
          className="fixed inset-0 w-screen h-screen bg-black/50 backdrop-blur-sm z-50 flex justify-center items-center px-4"
          onClick={() => setOrderPopup(false)} // Close on backdrop click
        >
          {/* Modal Card */}
          <div
            className="bg-white dark:bg-gray-900 p-6 sm:p-8 rounded-2xl shadow-xl w-full max-w-sm relative"
            onClick={(e) => e.stopPropagation()} // Prevent close when clicking inside
          >
            {/* Close Button */}
            <IoCloseOutline
              className="text-2xl cursor-pointer absolute top-4 right-4 dark:text-white hover:text-red-500 transition-colors"
              onClick={() => setOrderPopup(false)}
            />

            {/* Title */}
            <p className="text-sm text-gray-400 dark:text-gray-500 mb-6">
              {isLogin
                ? "Login to access your account"
                : "Sign up to start shopping"}
            </p>

            {/* Form */}
            <form onSubmit={handleAuthSubmit} className="space-y-3">

              {/* Name — signup only */}
              {!isLogin && (
                <input
                  name="name"
                  onChange={handleInput}
                  type="text"
                  placeholder="Full Name"
                  className="w-full rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white px-4 py-2.5 outline-none focus:border-primary text-sm"
                  required
                />
              )}

              {/* Email */}
              <input
                name="email"
                onChange={handleInput}
                type="email"
                placeholder="Email address"
                className="w-full rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white px-4 py-2.5 outline-none focus:border-primary text-sm"
                required
              />

              {/* Password */}
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  onChange={handleInput}
                  className="w-full rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white px-4 py-2.5 outline-none focus:border-primary text-sm pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-300 hover:text-primary transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <AiOutlineEyeInvisible size={18} /> : <AiOutlineEye size={18} />}
                </button>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-primary to-secondary text-white py-2.5 rounded-xl font-bold hover:scale-[1.02] active:scale-100 transition-all duration-200 text-sm mt-2"
              >
                {isLogin ? "Log In" : "Sign Up"}
              </button>
            </form>

            {/* Toggle login/signup */}
            <div className="text-center text-sm mt-5 dark:text-gray-400">
              {isLogin ? (
                <p>
                  Not registered yet?{' '}
                  <span
                    className="text-primary font-bold cursor-pointer hover:underline"
                    onClick={() => setIsLogin(false)}
                  >
                    Register here
                  </span>
                </p>
              ) : (
                <p>
                  Already registered?{' '}
                  <span
                    className="text-primary font-bold cursor-pointer hover:underline"
                    onClick={() => setIsLogin(true)}
                  >
                    Login here
                  </span>
                </p>
              )}
            </div>

          </div>
        </div>
      )}
    </>
  );
};

export default AuthPopup;
