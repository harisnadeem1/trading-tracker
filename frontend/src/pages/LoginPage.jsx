import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import { BarChart3, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL;

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, setAuth } = useAuth(); // ⬅ from AuthContext

  // If already logged in, go to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const validateField = (name, value) => {
    let error = '';

    if (name === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!value) error = 'Email is required';
      else if (!emailRegex.test(value)) error = 'Please enter a valid email address';
    }

    if (name === 'password') {
      if (!value) error = 'Password is required';
      else if (value.length < 6) error = 'Password must be at least 6 characters';
    }

    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (serverError) setServerError('');
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    // Validate all fields
    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const message = data.message || 'Invalid email or password';
        setServerError(message);
        return;
      }

      // ✅ Update global auth state + localStorage via AuthContext
      if (data.token) {
        setAuth(data.token, data.user || null);
      }

      console.log('Login successful, token and user saved via AuthContext');

      // Redirect to dashboard or previous page
      const from = location.state?.from?.pathname || '/dashboard';
      console.log('Navigating to:', from);
      navigate(from, { replace: true });
    } catch (err) {
      console.error(err);
      setServerError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Login - TradingJournal</title>
        <meta name="description" content="Sign in to your TradingJournal account" />
      </Helmet>

      <div className="min-h-screen bg-gray-950 flex flex-col relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
          <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        </div>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center p-4 z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-md"
          >
            <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl shadow-2xl p-6 sm:p-8">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Welcome back</h1>
                <p className="text-gray-400">Enter your details to access your account</p>
              </div>

              {/* Server Error Alert */}
              <AnimatePresence>
                {serverError && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-6 bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-start space-x-3 overflow-hidden"
                  >
                    <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-red-400">{serverError}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email Input */}
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="block text-base sm:text-sm font-medium text-gray-300"
                  >
                    Email address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="name@example.com"
                    className={`w-full bg-gray-950/50 border ${
                      errors.email
                        ? 'border-red-500/50 focus:ring-red-500/50'
                        : 'border-gray-700 focus:ring-emerald-500/50'
                    } rounded-xl px-4 py-3.5 sm:py-3 text-base sm:text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200`}
                    disabled={isSubmitting}
                  />
                  <AnimatePresence>
                    {errors.email && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="text-xs text-red-400 font-medium ml-1"
                      >
                        {errors.email}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                {/* Password Input */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="password"
                      className="block text-base sm:text-sm font-medium text-gray-300"
                    >
                      Password
                    </label>
                    <Link
                      to="#"
                      className="text-sm sm:text-xs text-emerald-500 hover:text-emerald-400 font-medium transition-colors"
                      onClick={(e) => e.preventDefault()} // Placeholder link
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Enter your password"
                    className={`w-full bg-gray-950/50 border ${
                      errors.password
                        ? 'border-red-500/50 focus:ring-red-500/50'
                        : 'border-gray-700 focus:ring-emerald-500/50'
                    } rounded-xl px-4 py-3.5 sm:py-3 text-base sm:text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200`}
                    disabled={isSubmitting}
                  />
                  <AnimatePresence>
                    {errors.password && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="text-xs text-red-400 font-medium ml-1"
                      >
                        {errors.password}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-4 sm:py-3 h-12 rounded-xl shadow-lg shadow-emerald-500/20 transition-all duration-200 mt-2 text-base"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Signing in...
                    </span>
                  ) : (
                    'Sign in'
                  )}
                </Button>
              </form>

              <div className="mt-8 pt-6 border-t border-gray-800 text-center">
                <p className="text-gray-400 text-sm">
                  Don't have an account?{' '}
                  <Link
                    to="/register"
                    className="text-emerald-500 hover:text-emerald-400 font-semibold transition-colors"
                  >
                    Sign up
                  </Link>
                </p>
              </div>
            </div>
          </motion.div>
        </main>
      </div>
    </>
  );
};

export default LoginPage;
