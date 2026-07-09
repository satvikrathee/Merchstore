import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { ShoppingBag, User, LogOut, LayoutDashboard, Menu, X, ChevronDown } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { fetchCart } from '../features/cart/cartSlice';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { isLoggedIn, user, logout } = useAuth();
  const cartItems = useSelector((state) => state.cart.items);

  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const cartCount = cartItems.reduce((acc, item) => acc + item.qty, 0);

  useEffect(() => {
    if (isLoggedIn) {
      dispatch(fetchCart());
    }
  }, [isLoggedIn, dispatch]);

  useEffect(() => {
    setIsOpen(false);
    setDropdownOpen(false);
  }, [location]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogoutClick = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className={`sticky top-0 z-40 w-full transition-all duration-300 ${
      scrolled
        ? 'bg-white/95 backdrop-blur-xl border-b border-brand-dark-100 shadow-sm'
        : 'bg-white/70 backdrop-blur-md border-b border-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-[72px]">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-11 h-11 flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
                <img
                  src="/logo.png"
                  alt="Geeta University Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-display font-bold text-lg text-brand-maroon-700 leading-none tracking-tight group-hover:text-brand-maroon-600 transition-colors">
                  GEETA UNIVERSITY
                </span>
                <span className="font-sans font-medium text-[9px] text-brand-gold-600 uppercase tracking-[0.2em] leading-none mt-1">
                  Merchandise Store
                </span>
              </div>
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-1">
            {[
              { to: '/', label: 'Home' },
              { to: '/products', label: 'Catalog' },
            ].map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`px-4 py-2 rounded-lg font-sans font-medium text-sm transition-all ${
                  isActive(to)
                    ? 'text-brand-maroon-700 bg-brand-maroon-50 font-semibold'
                    : 'text-brand-dark-600 hover:text-brand-maroon-700 hover:bg-brand-dark-50'
                }`}
              >
                {label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/cart"
              className="relative p-2.5 text-brand-dark-600 hover:text-brand-maroon-700 hover:bg-brand-maroon-50 rounded-xl transition-all duration-200"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-brand-gold-500 text-brand-dark-950 font-sans font-bold text-[10px] min-w-[18px] h-[18px] flex items-center justify-center rounded-full shadow-sm">
                  {cartCount}
                </span>
              )}
            </Link>

            {isLoggedIn ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 pl-1.5 pr-3 py-1.5 text-brand-dark-800 hover:bg-brand-dark-50 rounded-xl border border-brand-dark-100 transition-all duration-200"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-maroon-600 to-brand-maroon-800 text-white flex items-center justify-center font-display font-semibold text-sm">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="font-sans font-medium text-sm">{user?.name?.split(' ')[0]}</span>
                  <ChevronDown className={`w-4 h-4 text-brand-dark-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white border border-brand-dark-100 rounded-xl shadow-xl py-1.5 z-50 animate-fadeIn">
                    <div className="px-4 py-2.5 border-b border-brand-dark-100">
                      <p className="font-display font-semibold text-sm text-brand-dark-900 truncate">{user?.name}</p>
                      <p className="font-sans text-xs text-brand-dark-400 truncate">{user?.email}</p>
                    </div>
                    <Link
                      to={user?.role === 'admin' ? '/admin/analytics' : '/dashboard'}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-brand-dark-700 hover:bg-brand-maroon-50 hover:text-brand-maroon-700 transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      {user?.role === 'admin' ? 'Admin Panel' : 'Dashboard'}
                    </Link>
                    <button
                      onClick={handleLogoutClick}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  state={{ from: location }}
                  className="px-4 py-2 text-sm font-semibold text-brand-dark-600 hover:text-brand-maroon-700 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  state={{ from: location }}
                  className="px-5 py-2 bg-brand-maroon-700 text-white rounded-xl text-sm font-semibold hover:bg-brand-maroon-600 transition-all duration-300"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center md:hidden gap-3">
            <Link to="/cart" className="relative p-2 text-brand-dark-700 rounded-lg">
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-brand-gold-500 text-brand-dark-950 font-sans font-bold text-[9px] min-w-[16px] h-4 flex items-center justify-center rounded-full">
                  {cartCount}
                </span>
              )}
            </Link>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-brand-dark-700 hover:bg-brand-dark-100 transition-all duration-200"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden border-t border-brand-dark-100 bg-white px-4 pt-2 pb-5 space-y-1 shadow-lg animate-fadeIn">
          <Link
            to="/"
            className={`block px-3 py-2.5 rounded-xl font-sans font-medium text-sm ${
              isActive('/') ? 'bg-brand-maroon-50 text-brand-maroon-700 font-semibold' : 'text-brand-dark-700 hover:bg-brand-dark-50'
            }`}
          >
            Home
          </Link>
          <Link
            to="/products"
            className={`block px-3 py-2.5 rounded-xl font-sans font-medium text-sm ${
              isActive('/products') ? 'bg-brand-maroon-50 text-brand-maroon-700 font-semibold' : 'text-brand-dark-700 hover:bg-brand-dark-50'
            }`}
          >
            Catalog
          </Link>

          <hr className="border-brand-dark-100 my-2" />

          {isLoggedIn ? (
            <div className="space-y-1">
              <div className="flex items-center gap-3 px-3 py-2">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-brand-maroon-600 to-brand-maroon-800 text-white flex items-center justify-center font-display font-semibold text-sm">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-display font-bold text-sm text-brand-dark-900 truncate">{user?.name}</span>
                  <span className="font-sans text-xs text-brand-dark-400 truncate">{user?.email}</span>
                </div>
              </div>
              <Link
                to={user?.role === 'admin' ? '/admin/analytics' : '/dashboard'}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-sans font-medium text-sm text-brand-dark-700 hover:bg-brand-dark-50"
              >
                <LayoutDashboard className="w-4 h-4 text-brand-dark-400" />
                {user?.role === 'admin' ? 'Admin Panel' : 'Dashboard'}
              </Link>
              <button
                onClick={handleLogoutClick}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-sans font-medium text-sm text-red-600 hover:bg-red-50 text-left"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2 pt-1 px-1">
              <Link to="/login" state={{ from: location }} className="w-full text-center py-2.5 border border-brand-maroon-700 text-brand-maroon-700 rounded-xl font-semibold text-sm hover:bg-brand-maroon-50 transition-colors">
                Login
              </Link>
              <Link to="/register" state={{ from: location }} className="w-full text-center py-2.5 bg-brand-maroon-700 text-white rounded-xl font-semibold text-sm hover:bg-brand-maroon-600 transition-colors">
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
