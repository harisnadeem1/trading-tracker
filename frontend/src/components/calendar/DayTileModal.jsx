
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, DollarSign, TrendingUp, Hash, StickyNote, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

const DayTileModal = ({ isOpen, onClose, date, initialData, onSave }) => {
  const [formData, setFormData] = useState({
    profitLoss: '',
    trades: '',
    roi: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
      
      if (initialData) {
        setFormData({
          profitLoss: initialData.profitLoss || '',
          trades: initialData.trades || '',
          roi: initialData.roi || '',
          notes: initialData.notes || ''
        });
      } else {
        setFormData({
          profitLoss: '',
          trades: '',
          roi: '',
          notes: ''
        });
      }
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    await new Promise(resolve => setTimeout(resolve, 400));
    
    onSave(date, {
      profitLoss: parseFloat(formData.profitLoss) || 0,
      trades: parseInt(formData.trades) || 0,
      roi: parseFloat(formData.roi) || 0,
      notes: formData.notes
    });
    
    setIsSubmitting(false);
    onClose();
  };

  if (!isOpen) return null;

  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return '';
    const dateObj = new Date(dateStr + 'T12:00:00'); 
    return dateObj.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center sm:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full h-full sm:h-auto sm:max-w-lg bg-gray-950 sm:bg-gray-900 border-none sm:border sm:border-gray-800 rounded-none sm:rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-4 sm:px-6 border-b border-gray-800 bg-gray-900/50">
             <div className="flex items-center gap-3">
              <button 
                onClick={onClose}
                className="sm:hidden p-2 -ml-2 text-gray-400 hover:text-white"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white">Daily Journal</h2>
                <p className="text-xs sm:text-sm text-gray-400">{formatDateDisplay(date)}</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="hidden sm:block p-2 rounded-full hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6 flex-1 overflow-y-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Profit/Loss */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-400">Net P/L ($)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign className="h-4 w-4 text-gray-500" />
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.profitLoss}
                    onChange={(e) => setFormData({...formData, profitLoss: e.target.value})}
                    className="block w-full pl-10 pr-3 py-3 sm:py-2.5 bg-gray-900 sm:bg-gray-950 border border-gray-800 rounded-lg focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 text-white placeholder-gray-600 text-base sm:text-sm transition-all"
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Number of Trades */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-400">Total Trades</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Hash className="h-4 w-4 text-gray-500" />
                  </div>
                  <input
                    type="number"
                    min="0"
                    value={formData.trades}
                    onChange={(e) => setFormData({...formData, trades: e.target.value})}
                    className="block w-full pl-10 pr-3 py-3 sm:py-2.5 bg-gray-900 sm:bg-gray-950 border border-gray-800 rounded-lg focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 text-white placeholder-gray-600 text-base sm:text-sm transition-all"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* ROI */}
              <div className="space-y-2 col-span-1">
                <label className="block text-sm font-medium text-gray-400">ROI (%)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <TrendingUp className="h-4 w-4 text-gray-500" />
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.roi}
                    onChange={(e) => setFormData({...formData, roi: e.target.value})}
                    className="block w-full pl-10 pr-3 py-3 sm:py-2.5 bg-gray-900 sm:bg-gray-950 border border-gray-800 rounded-lg focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 text-white placeholder-gray-600 text-base sm:text-sm transition-all"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-400">Daily Notes</label>
              <div className="relative">
                <div className="absolute top-3 left-3 pointer-events-none">
                  <StickyNote className="h-4 w-4 text-gray-500" />
                </div>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  rows={6}
                  className="block w-full pl-10 pr-3 py-3 sm:py-2.5 bg-gray-900 sm:bg-gray-950 border border-gray-800 rounded-lg focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 text-white placeholder-gray-600 text-base sm:text-sm transition-all resize-none"
                  placeholder="What went well today? What could be improved?"
                />
              </div>
            </div>

            {/* Footer Actions (Visible on Mobile/Desktop) */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-800 mt-auto">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800 h-12 sm:h-10 px-6"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 h-12 sm:h-10 px-6 flex-1 sm:flex-none"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Entry
                  </>
                )}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default DayTileModal;
