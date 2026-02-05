
import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { BarChart3, Calendar, TrendingUp, DollarSign, LineChart, Target, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Footer from '@/components/Footer';

const HomePage = () => {
  const { isAuthenticated } = useAuth();

  const benefits = [
    {
      icon: Calendar,
      title: 'Calendar Tracking',
      description: 'Visual day-by-day trade logging to spot patterns in your trading schedule.'
    },
    {
      icon: BarChart3,
      title: 'Performance Analytics',
      description: 'Deep dive into your metrics with comprehensive charts and breakdowns.'
    },
    {
      icon: TrendingUp,
      title: 'Win Rate Tracking',
      description: 'Monitor your success rate and identify your strongest setups.'
    },
    {
      icon: DollarSign,
      title: 'P&L Analysis',
      description: 'Track profits and losses accurately to manage your bankroll effectively.'
    },
    {
      icon: LineChart,
      title: 'Visual Trade History',
      description: 'See your equity curve grow and analyze drawdowns visually.'
    },
    {
      icon: Target,
      title: 'Data-Driven Insights',
      description: 'Make smarter decisions based on historical performance data.'
    }
  ];

  const testimonials = [
    {
      name: "Alex Thompson",
      role: "Day Trader",
      quote: "This journal completely changed how I approach the markets. The analytics are a game changer.",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80"
    },
    {
      name: "Sarah Chen",
      role: "Forex Swing Trader",
      quote: "I used to track trades in Excel. This is 100x better. The calendar view helps me see my consistency instantly.",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80"
    },
    {
      name: "Michael Rodriguez",
      role: "Crypto Investor",
      quote: "Simple, clean, and powerful. Exactly what I needed to keep myself accountable and profitable.",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80"
    }
  ];

  return (
    <>
      <Helmet>
        <title>TradingJournal - Master Your Trading with Data</title>
        <meta name="description" content="Track every trade, analyze performance, and make smarter decisions with our comprehensive trading journal." />
      </Helmet>

      <div className="min-h-screen bg-gray-950 text-white flex flex-col">
        {/* Hero Section */}
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden py-20 px-4 sm:px-6">
          {/* Background Image with Overlay */}
          <div className="absolute inset-0 z-0">
            <img 
              src="https://images.unsplash.com/photo-1640340435016-1964cf4e723b" 
              alt="Trading Chart Background" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-gray-950/95 via-gray-950/85 to-gray-950"></div>
            <div className="absolute inset-0 bg-emerald-950/30 mix-blend-overlay"></div>
          </div>

          <div className="relative z-10 max-w-7xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-6 tracking-tight leading-tight">
                Master Your Trading with <br className="hidden md:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
                  Data-Driven Insights
                </span>
              </h1>
              
              <p className="text-lg sm:text-xl md:text-2xl text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed px-4">
                Track every trade, analyze performance, and make smarter decisions with our comprehensive trading journal.
              </p>

              {!isAuthenticated ? (
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full max-w-md mx-auto sm:max-w-none">
                  <Link to="/register" className="w-full sm:w-auto">
                    <Button 
                      size="lg" 
                      className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 text-white h-14 px-8 text-lg rounded-xl shadow-xl shadow-emerald-500/20 transition-transform hover:scale-105"
                    >
                      Sign Up Now
                    </Button>
                  </Link>
                  <Link to="/login" className="w-full sm:w-auto">
                    <Button 
                      size="lg" 
                      variant="outline"
                      className="w-full sm:w-auto border-gray-500 text-white hover:bg-white/10 h-14 px-8 text-lg rounded-xl backdrop-blur-sm"
                    >
                      Log In
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full max-w-md mx-auto sm:max-w-none">
                  <Link to="/dashboard" className="w-full sm:w-auto">
                    <Button 
                      size="lg" 
                      className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 text-white h-14 px-8 text-lg rounded-xl shadow-xl shadow-emerald-500/20 transition-transform hover:scale-105"
                    >
                      Go to Dashboard
                    </Button>
                  </Link>
                </div>
              )}
            </motion.div>
          </div>
          
          {/* Scroll Indicator */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="absolute bottom-10 left-1/2 transform -translate-x-1/2 hidden md:block"
          >
            <div className="w-6 h-10 border-2 border-gray-500 rounded-full flex justify-center p-1">
              <motion.div 
                animate={{ y: [0, 12, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="w-1.5 h-1.5 bg-emerald-500 rounded-full"
              />
            </div>
          </motion.div>
        </section>

        {/* Features Grid Section */}
        <section className="py-16 sm:py-24 px-4 bg-gray-950">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12 sm:mb-16"
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">Powerful Features</h2>
              <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto">
                Everything you need to analyze your trading behavior and improve your profitability.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-gray-900 border border-gray-800 rounded-xl p-6 sm:p-8 hover:shadow-2xl hover:shadow-emerald-500/10 hover:border-emerald-500/50 transition-all duration-300 group hover:-translate-y-1"
                >
                  <div className="bg-gray-800 w-12 h-12 sm:w-14 sm:h-14 rounded-lg flex items-center justify-center mb-6 group-hover:bg-emerald-500/20 transition-colors">
                    <benefit.icon className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-500" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{benefit.title}</h3>
                  <p className="text-gray-400 leading-relaxed text-sm sm:text-base">{benefit.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-16 sm:py-24 px-4 bg-gradient-to-b from-gray-900 to-gray-950">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12 sm:mb-16"
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">Trusted by Traders</h2>
              <p className="text-gray-400 text-base sm:text-lg">See what our community has to say about their journey.</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                  className="bg-gray-950 border border-gray-800 rounded-xl p-6 sm:p-8 relative"
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-t-xl opacity-0 hover:opacity-100 transition-opacity"></div>
                  <div className="flex items-center space-x-1 mb-6">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="w-4 h-4 text-yellow-500 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-300 italic mb-6 text-sm sm:text-base">"{testimonial.quote}"</p>
                  <div className="flex items-center space-x-4">
                    <img 
                      src={testimonial.image} 
                      alt={testimonial.name} 
                      className="w-10 h-10 rounded-full object-cover border-2 border-emerald-500/30"
                    />
                    <div>
                      <h4 className="text-white font-semibold">{testimonial.name}</h4>
                      <p className="text-emerald-500 text-sm">{testimonial.role}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Secondary CTA Section */}
        <section className="py-16 sm:py-24 px-4 bg-gray-900 relative overflow-hidden">
          <div className="absolute inset-0 bg-emerald-500/5"></div>
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
                Ready to Transform Your Trading?
              </h2>
              <p className="text-lg sm:text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
                Join thousands of traders who are treating their trading like a business. Start tracking your metrics today.
              </p>
              
              {!isAuthenticated ? (
                <div className="flex flex-col sm:flex-row gap-4 justify-center w-full max-w-md mx-auto sm:max-w-none">
                  <Link to="/register" className="w-full sm:w-auto">
                    <Button 
                      size="lg" 
                      className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 text-white h-14 px-10 text-lg rounded-xl shadow-lg shadow-emerald-500/20"
                    >
                      Get Started Free
                    </Button>
                  </Link>
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="w-full sm:w-auto border-gray-700 hover:bg-gray-800 text-white h-14 px-10 text-lg rounded-xl"
                  >
                    Schedule Demo
                  </Button>
                </div>
              ) : (
                <Link to="/dashboard" className="w-full sm:w-auto inline-block">
                  <Button 
                    size="lg" 
                    className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 text-white h-14 px-10 text-lg rounded-xl shadow-lg shadow-emerald-500/20"
                  >
                    View Your Dashboard
                  </Button>
                </Link>
              )}
            </motion.div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default HomePage;
