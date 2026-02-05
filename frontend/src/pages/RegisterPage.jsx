
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { BarChart3, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const validateField = (name, value, allData = formData) => {
    let error = '';
    
    switch (name) {
      case 'username':
        if (!value.trim()) error = 'Username is required';
        else if (value.length < 3) error = 'Username must be at least 3 characters';
        break;
        
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value) error = 'Email is required';
        else if (!emailRegex.test(value)) error = 'Please enter a valid email address';
        break;
        
      case 'password':
        if (!value) error = 'Password is required';
        else if (value.length < 6) error = 'Password must be at least 6 characters';
        break;
        
      case 'confirmPassword':
        if (value !== allData.password) error = 'Passwords do not match';
        break;
        
      default:
        break;
    }
    
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newData = { ...formData, [name]: value };
    setFormData(newData);
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // Special case for confirm password real-time validation
    if (name === 'password' && formData.confirmPassword) {
      if (value !== formData.confirmPassword) {
        setErrors(prev => ({ ...prev, confirmPassword: 'Passwords do not match' }));
      } else {
        setErrors(prev => ({ ...prev, confirmPassword: '' }));
      }
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate network delay for better UX
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const result = register(formData.email, formData.password, formData.username);

      if (result.success) {
        toast({
          title: "Account created!",
          description: "Welcome to TradingJournal. You are now logged in.",
          className: "bg-emerald-500 border-none text-white",
        });
        navigate('/dashboard', { replace: true });
      } else {
        toast({
          title: "Registration Failed",
          description: result.error || "An error occurred during registration",
          variant: "destructive"
        });
        setErrors(prev => ({ ...prev, submit: result.error }));
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Password strength indicator helper
  const getPasswordStrength = () => {
    const pass = formData.password;
    if (!pass) return 0;
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 10) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    return score; // 0 to 5
  };

  const passwordStrength = getPasswordStrength();

  return (
    <>
      <Helmet>
        <title>Create Account - TradingJournal</title>
        <meta name="description" content="Register for a new TradingJournal account" />
      </Helmet>

      <div className="min-h-screen bg-gray-950 flex flex-col relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-5%] w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-[-10%] right-[-5%] w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        </div>

        {/* Header / Logo */}
        <header className="relative z-10 px-6 py-6 flex justify-center sm:justify-start">
          <Link to="/" className="inline-flex items-center space-x-2 group">
            <div className="bg-emerald-500/10 p-2 rounded-lg group-hover:bg-emerald-500/20 transition-colors">
              <BarChart3 className="w-6 h-6 text-emerald-500" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">TradingJournal</span>
          </Link>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center p-4 z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-md my-4 sm:my-8"
          >
            <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl shadow-2xl p-6 sm:p-8">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
                <p className="text-gray-400">Join thousands of traders improving their game</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Username Input */}
                <div className="space-y-2">
                  <label htmlFor="username" className="block text-base sm:text-sm font-medium text-gray-300">
                    Username
                  </label>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    value={formData.username}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="TraderJohn"
                    className={`w-full bg-gray-950/50 border ${
                      errors.username ? 'border-red-500/50 focus:ring-red-500/50' : 'border-gray-700 focus:ring-emerald-500/50'
                    } rounded-xl px-4 py-3.5 sm:py-3 text-base sm:text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200`}
                    disabled={isSubmitting}
                  />
                  <AnimatePresence>
                    {errors.username && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-xs text-red-400 font-medium ml-1 flex items-center mt-1"
                      >
                        <AlertCircle className="w-3 h-3 mr-1" /> {errors.username}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                {/* Email Input */}
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-base sm:text-sm font-medium text-gray-300">
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
                      errors.email ? 'border-red-500/50 focus:ring-red-500/50' : 'border-gray-700 focus:ring-emerald-500/50'
                    } rounded-xl px-4 py-3.5 sm:py-3 text-base sm:text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200`}
                    disabled={isSubmitting}
                  />
                  <AnimatePresence>
                    {errors.email && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-xs text-red-400 font-medium ml-1 flex items-center mt-1"
                      >
                        <AlertCircle className="w-3 h-3 mr-1" /> {errors.email}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                {/* Password Input */}
                <div className="space-y-2">
                  <label htmlFor="password" className="block text-base sm:text-sm font-medium text-gray-300">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Create a strong password"
                    className={`w-full bg-gray-950/50 border ${
                      errors.password ? 'border-red-500/50 focus:ring-red-500/50' : 'border-gray-700 focus:ring-emerald-500/50'
                    } rounded-xl px-4 py-3.5 sm:py-3 text-base sm:text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200`}
                    disabled={isSubmitting}
                  />
                  
                  {/* Password Strength Indicator */}
                  {formData.password && (
                    <div className="flex gap-1 h-1 mt-2">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div
                          key={level}
                          className={`h-full flex-1 rounded-full transition-all duration-300 ${
                            level <= passwordStrength
                              ? passwordStrength < 3
                                ? 'bg-red-500'
                                : passwordStrength < 4
                                ? 'bg-yellow-500'
                                : 'bg-emerald-500'
                              : 'bg-gray-800'
                          }`}
                        />
                      ))}
                    </div>
                  )}

                  <AnimatePresence>
                    {errors.password && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-xs text-red-400 font-medium ml-1 flex items-center mt-1"
                      >
                        <AlertCircle className="w-3 h-3 mr-1" /> {errors.password}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                {/* Confirm Password Input */}
                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="block text-base sm:text-sm font-medium text-gray-300">
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Confirm your password"
                    className={`w-full bg-gray-950/50 border ${
                      errors.confirmPassword ? 'border-red-500/50 focus:ring-red-500/50' : 'border-gray-700 focus:ring-emerald-500/50'
                    } rounded-xl px-4 py-3.5 sm:py-3 text-base sm:text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200`}
                    disabled={isSubmitting}
                  />
                  <AnimatePresence>
                    {errors.confirmPassword && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-xs text-red-400 font-medium ml-1 flex items-center mt-1"
                      >
                        <AlertCircle className="w-3 h-3 mr-1" /> {errors.confirmPassword}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-4 sm:py-3 h-12 rounded-xl shadow-lg shadow-emerald-500/20 transition-all duration-200 mt-4 text-base"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Creating account...
                    </span>
                  ) : (
                    "Register"
                  )}
                </Button>
              </form>

              <div className="mt-8 pt-6 border-t border-gray-800 text-center">
                <p className="text-gray-400 text-sm">
                  Already have an account?{' '}
                  <Link to="/login" className="text-emerald-500 hover:text-emerald-400 font-semibold transition-colors">
                    Log in
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

export default RegisterPage;
