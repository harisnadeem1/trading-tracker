
import React from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, Twitter, Facebook, Instagram, Linkedin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-950 border-t border-gray-800 py-12 px-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        <div className="col-span-1 md:col-span-1">
          <Link to="/" className="flex items-center space-x-2 mb-4">
            <BarChart3 className="w-8 h-8 text-emerald-500" />
            <span className="text-xl font-bold text-white">TradingJournal</span>
          </Link>
          <p className="text-gray-400 text-sm">
            Empowering traders with data-driven insights to master the markets.
          </p>
        </div>
        
        <div>
          <h3 className="text-white font-semibold mb-4">Product</h3>
          <ul className="space-y-2">
            <li><span className="text-gray-400 hover:text-emerald-500 cursor-pointer text-sm transition-colors">Features</span></li>
            <li><span className="text-gray-400 hover:text-emerald-500 cursor-pointer text-sm transition-colors">Pricing</span></li>
            <li><span className="text-gray-400 hover:text-emerald-500 cursor-pointer text-sm transition-colors">FAQ</span></li>
          </ul>
        </div>

        <div>
          <h3 className="text-white font-semibold mb-4">Company</h3>
          <ul className="space-y-2">
            <li><span className="text-gray-400 hover:text-emerald-500 cursor-pointer text-sm transition-colors">About Us</span></li>
            <li><span className="text-gray-400 hover:text-emerald-500 cursor-pointer text-sm transition-colors">Contact</span></li>
            <li><span className="text-gray-400 hover:text-emerald-500 cursor-pointer text-sm transition-colors">Careers</span></li>
          </ul>
        </div>

        <div>
          <h3 className="text-white font-semibold mb-4">Legal</h3>
          <ul className="space-y-2">
            <li><span className="text-gray-400 hover:text-emerald-500 cursor-pointer text-sm transition-colors">Privacy Policy</span></li>
            <li><span className="text-gray-400 hover:text-emerald-500 cursor-pointer text-sm transition-colors">Terms of Service</span></li>
          </ul>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
        <p className="text-gray-500 text-sm mb-4 md:mb-0">
          © {new Date().getFullYear()} TradingJournal. All rights reserved.
        </p>
        <div className="flex space-x-4">
          <Twitter className="w-5 h-5 text-gray-500 hover:text-white cursor-pointer transition-colors" />
          <Facebook className="w-5 h-5 text-gray-500 hover:text-white cursor-pointer transition-colors" />
          <Instagram className="w-5 h-5 text-gray-500 hover:text-white cursor-pointer transition-colors" />
          <Linkedin className="w-5 h-5 text-gray-500 hover:text-white cursor-pointer transition-colors" />
        </div>
      </div>
    </footer>
  );
};

export default Footer;
