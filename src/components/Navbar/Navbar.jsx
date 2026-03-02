import React from 'react'
import { useState, useEffect } from 'react';
import Logo from '../../assets/logo.png'
import { IoMdSearch } from "react-icons/io";
import { FaCaretDown, FaCartShopping } from "react-icons/fa6";
import { HiMenuAlt3, HiX } from "react-icons/hi";
import DarkMode from './DarkMode.jsx';
import { useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { FaUserCircle } from "react-icons/fa";
import { supabase } from '../../lib/supabaseClient.js';

const Menu = [
  { id: 1, name: "Home", link: "/" },
  { id: 2, name: "Contact Us", link: "/contact" },
  { id: 3, name: "Women Wear", link: "/womenswear" },
  { id: 4, name: "Kids Wear", link: "/kidswear" },
  { id: 5, name: "Mens Wear", link: "/menswear" },
  { id: 6, name: "About us", link: "/about" },
];

const DropDownLinks = [
  { id: 1, name: "Trending Products", link: "/trending" },
  { id: 2, name: "Best Sellers", link: "/best-sellers" },
  { id: 3, name: "Top Rated", link: "/top-rated" },
];

const Navbar = ({ handleAuthPopup, user, handleLogout }) => {
  const [allProducts, setAllProducts] = useState([]);
  const location = useLocation();
  const [cartCount, setCartCount] = React.useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredItems, setFilteredItems] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  const getCount = async () => {
    if (!user || !user.id) { setCartCount(0); return; }
    const { data, error } = await supabase
      .from('cart_items')
      .select(`quantity, carts!inner ( user_id )`)
      .eq('carts.user_id', user.id);
    if (!error) {
      setCartCount(data?.reduce((acc, item) => acc + item.quantity, 0) || 0);
    }
  };

  useEffect(() => {
    getCount();
    window.addEventListener("cartUpdated", getCount);
    return () => window.removeEventListener("cartUpdated", getCount);
  }, [user]);

  useEffect(() => {
    const fetchProductsForSearch = async () => {
      const { data, error } = await supabase.from('products').select('id, name');
      if (!error) setAllProducts(data || []);
    };
    fetchProductsForSearch();
  }, []);

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchQuery(value);

    if (value.trim() === "") {
      setFilteredItems([]);
      setShowDropdown(false);
      return;
    }

    const categoryItems = [...Menu, ...DropDownLinks].map(item => ({ ...item, type: 'category' }));
    const productItems = allProducts.map(p => ({
      id: p.id, name: p.name, type: 'product', link: '/all-products'
    }));

    const sorted = [...categoryItems, ...productItems]
      .filter(item => item.name.toLowerCase().includes(value))
      .sort((a, b) => {
        const nameA = a.name.toLowerCase();
        const nameB = b.name.toLowerCase();
        if (nameA === value) return -1;
        if (nameB === value) return 1;
        if (a.type === 'category' && b.type === 'product') return -1;
        return nameA.localeCompare(nameB);
      });

    setFilteredItems(sorted.slice(0, 10));
    setShowDropdown(true);
  };

  const isDashboard = location.pathname === "/dashboard";

  return (
    <div className="shadow-md bg-white dark:bg-gray-900 dark:text-white duration-200 relative z-40">

      {/* ── Top Bar ── */}
      <div className="bg-primary/40 py-2">
        <div className="container flex justify-between items-center px-4">

          {/* Logo */}
          <Link to="/" className="font-bold text-2xl sm:text-3xl flex gap-2 items-center">
            <img src={Logo} alt="logo" className="w-10" />
            Shopsy
          </Link>

          {/* Right side icons */}
          <div className="flex items-center gap-3">

            {/* Search — desktop only */}
            <div className="relative group hidden sm:block">
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={handleSearch}
                className="w-[200px] group-hover:w-[300px] transition-all duration-300 rounded-full border border-gray-300 px-2 py-1 focus:outline-none focus:border-primary dark:border-gray-500 dark:bg-gray-800"
              />
              <IoMdSearch className="text-gray-500 group-hover:text-primary absolute top-1/2 -translate-y-1/2 right-3" />
              {showDropdown && (
                <div className="absolute top-10 w-full bg-white dark:bg-gray-800 shadow-md rounded-md overflow-hidden z-[9999]">
                  {filteredItems.length > 0 ? (
                    <ul>
                      {filteredItems.map((item) => (
                        <li key={item.id} className="hover:bg-primary/20">
                          <Link
                            to={item.link}
                            state={item.type === 'product' ? { searchTerm: item.name } : null}
                            className="flex justify-between items-center px-4 py-2 text-sm text-gray-700 dark:text-white"
                            onClick={() => { setShowDropdown(false); setSearchQuery(""); }}
                          >
                            <span>{item.name}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="px-4 py-2 text-sm text-gray-500">No results found</div>
                  )}
                </div>
              )}
            </div>

            {/* Cart Button */}
            <Link
              to={user ? "/cart" : "#"}
              onClick={(e) => { if (!user) { e.preventDefault(); handleAuthPopup(); } }}
            >
              <button className="relative bg-gradient-to-r from-primary to-secondary text-white py-1 px-4 rounded-full flex items-center gap-3">
                <FaCartShopping className="text-xl text-white drop-shadow-sm" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-1 bg-red-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white shadow-md">
                    {cartCount}
                  </span>
                )}
              </button>
            </Link>

            {/* Dark Mode */}
            <DarkMode />

            {/* Hamburger — mobile only */}
            <button
              className="sm:hidden text-2xl text-gray-700 dark:text-white p-1"
              onClick={() => setMobileMenuOpen(prev => !prev)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <HiX /> : <HiMenuAlt3 />}
            </button>

          </div>
        </div>
      </div>

      {/* ── Desktop Lower Navbar ── */}
      <div data-aos="zoom-in" className="hidden sm:flex justify-center">
        <div className="container flex justify-between items-center py-2 px-4">
          <ul className="flex items-center gap-4 mx-auto">
            {Menu.map((data) => (
              <li key={data.id}>
                <Link to={data.link} className="inline-block px-4 hover:text-primary duration-200">
                  {data.name}
                </Link>
              </li>
            ))}
            {/* Trending Dropdown */}
            <li className="group relative cursor-pointer">
              <a href="#" className="flex items-center gap-[2px] py-2">
                Trending
                <span><FaCaretDown className="transition-all duration-200 group-hover:rotate-180" /></span>
              </a>
              <div className="absolute z-[9999] hidden group-hover:block w-[150px] rounded-md bg-white p-2 text-black shadow-md dark:bg-gray-800 dark:text-white">
                <ul>
                  {DropDownLinks.map((data) => (
                    <li key={data.id}>
                      <Link to={data.link} className="inline-block w-full rounded-md p-2 hover:bg-primary/20">
                        {data.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          </ul>

          {/* Desktop Login/Logout */}
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                  <FaUserCircle className="text-xl text-primary" />
                  <span className="font-bold text-sm">{user.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-sm bg-red-500 text-white px-4 py-1 rounded-full hover:scale-105 duration-200"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={handleAuthPopup}
                className="bg-gradient-to-r from-primary to-secondary text-white py-1 px-4 rounded-full"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════
          MOBILE MENU OVERLAY
      ══════════════════════════════════════ */}
      {mobileMenuOpen && (
        <div className="sm:hidden fixed inset-0 z-50 flex flex-col bg-white dark:bg-gray-900 overflow-y-auto">

          {/* Mobile Menu Header */}
          <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100 dark:border-gray-700 bg-primary/10">
            <Link to="/" className="font-bold text-xl flex gap-2 items-center" onClick={() => setMobileMenuOpen(false)}>
              <img src={Logo} alt="logo" className="w-8" />
              Shopsy
            </Link>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="text-2xl text-gray-600 dark:text-white"
            >
              <HiX />
            </button>
          </div>

          <div className="flex flex-col gap-1 px-5 py-5">

            {/* Mobile Search */}
            <div className="relative mb-4">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={handleSearch}
                className="w-full rounded-full border border-gray-300 dark:border-gray-600 px-4 py-2 pr-10 focus:outline-none focus:border-primary dark:bg-gray-800 dark:text-white text-sm"
              />
              <IoMdSearch className="text-gray-400 absolute top-1/2 -translate-y-1/2 right-4 text-lg" />
              {/* Mobile search results */}
              {showDropdown && filteredItems.length > 0 && (
                <div className="absolute top-11 left-0 right-0 bg-white dark:bg-gray-800 shadow-lg rounded-xl overflow-hidden z-50 border border-gray-100 dark:border-gray-700">
                  <ul>
                    {filteredItems.map((item) => (
                      <li key={item.id} className="hover:bg-primary/10">
                        <Link
                          to={item.link}
                          state={item.type === 'product' ? { searchTerm: item.name } : null}
                          className="block px-4 py-2.5 text-sm text-gray-700 dark:text-white"
                          onClick={() => {
                            setShowDropdown(false);
                            setSearchQuery("");
                            setMobileMenuOpen(false);
                          }}
                        >
                          {item.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* User Info — if logged in */}
            {user && (
              <div className="flex items-center gap-3 bg-primary/10 dark:bg-gray-800 px-4 py-3 rounded-xl mb-3">
                <FaUserCircle className="text-2xl text-primary" />
                <div>
                  <p className="font-bold text-sm text-gray-800 dark:text-white">{user.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                </div>
              </div>
            )}
            

            {/* Menu Links */}
            {Menu.map((data) => (
              <Link
                key={data.id}
                to={data.link}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-3 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-primary/10 hover:text-primary transition-all duration-200 ${
                  location.pathname === data.link ? 'bg-primary/10 text-primary font-bold' : ''
                }`}
              >
                {data.name}
              </Link>
            ))}

            {/* Trending Accordion */}
            <button
              onClick={() => setMobileDropdownOpen(prev => !prev)}
              className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-primary/10 hover:text-primary transition-all duration-200 w-full text-left"
            >
              <span>Trending</span>
              <FaCaretDown className={`transition-transform duration-200 ${mobileDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {mobileDropdownOpen && (
              <div className="ml-4 flex flex-col gap-1 border-l-2 border-primary/30 pl-4">
                {DropDownLinks.map((data) => (
                  <Link
                    key={data.id}
                    to={data.link}
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2.5 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-primary/10 hover:text-primary transition-all duration-200"
                  >
                    {data.name}
                  </Link>
                ))}
              </div>
            )}

            {/* Divider */}
            <div className="h-px bg-gray-100 dark:bg-gray-700 my-3" />

            {/* Login / Logout */}
            {user ? (
              <button
                onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl text-sm transition-all duration-200"
              >
                Logout
              </button>
            ) : (
              <button
                onClick={() => { handleAuthPopup(); setMobileMenuOpen(false); }}
                className="w-full bg-gradient-to-r from-primary to-secondary text-white font-bold py-3 rounded-xl text-sm transition-all duration-200"
              >
                Login / Sign Up
              </button>
            )}

          </div>
        </div>
      )}

    </div>
  );
};

export default Navbar;
