import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import {
  Menu,
  X,
  BarChart3,
  Calendar,
  LogOut,
  LayoutDashboard,
  Settings,
  BarChart2,
  Bell,
  Sun
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

const Navigation = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Main authenticated nav links
  const authenticatedLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/calendar', label: 'Calendar', icon: Calendar },
    { path: '#reports', label: 'Reports', icon: BarChart2 },
    { path: '#insights', label: 'Insights', icon: BarChart3 }
  ];

  const isActive = (path) => location.pathname === path;

  const displayName = user?.email ? user.email.split('@')[0] : '';
  const initials = displayName ? displayName.charAt(0).toUpperCase() : '?';

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled || mobileMenuOpen
          ? 'bg-gray-950/95 backdrop-blur-sm border-b border-gray-800 shadow-lg'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group z-50 relative">
            <div className="bg-emerald-500/10 p-2 rounded-lg group-hover:bg-emerald-500/20 transition-colors">
              <BarChart3 className="w-6 h-6 text-emerald-500" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">
              TradingJournal
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {isAuthenticated ? (
              <>
                {/* Main nav links */}
                <div className="flex space-x-1">
                  {authenticatedLinks.map((link) => {
                    const active = isActive(link.path);
                    const baseClasses =
                      'px-4 py-2 rounded-lg transition-all flex items-center space-x-2 text-sm font-medium';
                    const stateClasses = active
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      : 'text-gray-300 hover:text-white hover:bg-white/5';

                    return (
                      <Link
                        key={link.path}
                        to={link.path}
                        className={`${baseClasses} ${stateClasses}`}
                      >
                        <link.icon className="w-4 h-4" />
                        <span>{link.label}</span>
                      </Link>
                    );
                  })}
                </div>

                <div className="h-6 w-px bg-gray-800 mx-3" />

                {/* Right-side controls */}
                <div className="flex items-center space-x-3">
                  {/* Theme toggle placeholder */}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-full text-gray-400 hover:text-emerald-400 hover:bg-white/5"
                  >
                    <Sun className="w-4 h-4" />
                  </Button>

                  {/* Notifications placeholder */}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-full text-gray-400 hover:text-emerald-400 hover:bg-white/5 relative"
                  >
                    <Bell className="w-4 h-4" />
                    <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-500" />
                  </Button>

                  {/* User pill + logout */}
                  <div className="flex items-center space-x-3 pl-3 border-l border-gray-800">
                    <div className="flex items-center space-x-2">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-xs font-semibold text-white">
                        {initials}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-200 font-medium">
                          {displayName}
                        </span>
                        <span className="text-[11px] text-gray-500 uppercase tracking-wide">
                          Trader · Free Plan
                        </span>
                      </div>
                    </div>

                    <Button
                      onClick={handleLogout}
                      variant="ghost"
                      size="sm"
                      className="text-gray-400 hover:text-red-400 hover:bg-red-500/10 flex items-center"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                {/* Marketing-style links (look real even if anchors) */}
                <div className="hidden lg:flex items-center space-x-3 text-sm">
                  <Link
                    to="#features"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    Features
                  </Link>
                  <Link
                    to="#pricing"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    Pricing
                  </Link>
                  <Link
                    to="#faq"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    FAQ
                  </Link>
                </div>

                <Link to="/login">
                  <Button
                    variant="outline"
                    className="
                      border-gray-700 
                      bg-gray-900 
                      text-white 
                      hover:bg-gray-800 
                      hover:border-gray-600
                    "
                  >
                    Log In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 -mr-2 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors z-50 relative focus:outline-none focus:ring-2 focus:ring-emerald-500"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: '100vh' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="md:hidden fixed inset-0 top-0 pt-20 bg-gray-950 z-40 overflow-y-auto"
          >
            <div className="px-4 py-4 space-y-4">
              {isAuthenticated ? (
                <>
                  {/* Mobile user card */}
                  <div className="flex items-center justify-between px-4 py-3 rounded-2xl bg-gray-900 border border-gray-800">
                    <div className="flex items-center space-x-3">
                      <div className="h-9 w-9 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-sm font-semibold text-white">
                        {initials}
                      </div>
                      <div>
                        <div className="text-sm text-gray-100 font-medium">
                          {displayName || 'Trader'}
                        </div>
                        <div className="text-xs text-gray-500">Signed in</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        className="p-2 rounded-full bg-gray-800 text-gray-300"
                      >
                        <Bell className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        className="p-2 rounded-full bg-gray-800 text-gray-300"
                      >
                        <Sun className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Main mobile links */}
                  <div className="flex flex-col space-y-2">
                    {authenticatedLinks.map((link) => {
                      const active = isActive(link.path);
                      const baseClasses =
                        'flex items-center space-x-3 px-4 py-4 rounded-xl transition-all text-base font-medium';
                      const stateClasses = active
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : 'text-gray-300 hover:bg-gray-800';

                      return (
                        <Link
                          key={link.path}
                          to={link.path}
                          className={`${baseClasses} ${stateClasses}`}
                        >
                          <link.icon className="w-6 h-6" />
                          <span>{link.label}</span>
                        </Link>
                      );
                    })}
                  </div>

                  {/* Account actions */}
                  <div className="pt-6 mt-2 border-t border-gray-800 space-y-3">
                    <button
                      type="button"
                      className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl bg-gray-900 text-gray-200 border border-gray-800"
                    >
                      <Settings className="w-5 h-5" />
                      <span className="font-medium text-sm">Account Settings</span>
                    </button>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-3 px-4 py-4 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors active:bg-red-500/20"
                    >
                      <LogOut className="w-6 h-6" />
                      <span className="font-medium">Logout</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col space-y-4 pt-4">
                  <div className="flex flex-col space-y-2 mb-2">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Explore
                    </span>
                    <Link
                      to="#features"
                      className="px-4 py-3 rounded-xl bg-gray-900 text-gray-200 text-sm flex items-center justify-between"
                    >
                      <span>Features</span>
                    </Link>
                    <Link
                      to="#pricing"
                      className="px-4 py-3 rounded-xl bg-gray-900 text-gray-200 text-sm flex items-center justify-between"
                    >
                      <span>Pricing</span>
                    </Link>
                    <Link
                      to="#faq"
                      className="px-4 py-3 rounded-xl bg-gray-900 text-gray-200 text-sm flex items-center justify-between"
                    >
                      <span>FAQ</span>
                    </Link>
                  </div>

                  <Link to="/login" className="block">
                    <Button
                      variant="outline"
                      className="
                        w-full h-12 text-base rounded-xl
                        border-gray-700
                        bg-gray-900
                        text-white
                        hover:bg-gray-800
                        hover:border-gray-600
                      "
                    >
                      Log In
                    </Button>
                  </Link>
                  <Link to="/register" className="block">
                    <Button className="w-full h-12 text-base bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 rounded-xl">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navigation;
