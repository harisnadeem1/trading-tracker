import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Save,
  DollarSign,
  TrendingUp,
  Hash,
  StickyNote,
  ArrowLeft,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const DayTileModal = ({ isOpen, onClose, date, initialData, onSave }) => {
  const [formData, setFormData] = useState({
    profitLoss: '',
    trades: '',
    amountInvested: '',
    roi: '',
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate ROI on the fly based on profitLoss & amountInvested
  const computedRoi = (() => {
    const pl = parseFloat(formData.profitLoss);
    const invested = parseFloat(formData.amountInvested);

    if (!invested || Number.isNaN(invested) || invested === 0) return 0;
    if (Number.isNaN(pl)) return 0;

    return Number(((pl / invested) * 100).toFixed(2));
  })();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';

      if (initialData) {
        setFormData({
          profitLoss: initialData.profitLoss ?? '',
          trades: initialData.trades ?? '',
          amountInvested: initialData.amountInvested ?? '',
          roi: initialData.roi ?? '',
          notes: initialData.notes ?? '',
        });
      } else {
        setFormData({
          profitLoss: '',
          trades: '',
          amountInvested: '',
          roi: '',
          notes: '',
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

    try {
      const profitLoss = parseFloat(formData.profitLoss) || 0;
      const trades = parseInt(formData.trades) || 0;
      const amountInvested = parseFloat(formData.amountInvested) || 0;
      let roi = 0;

      if (amountInvested > 0) {
        roi = Number(((profitLoss / amountInvested) * 100).toFixed(2));
      }

      await onSave(date, {
        profitLoss,
        trades,
        amountInvested,
        roi,
        notes: formData.notes,
      });

      onClose();
    } catch (error) {
      console.error('Failed to save entry', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return '';
    const dateObj = new Date(dateStr + 'T12:00:00');
    return dateObj.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center sm:p-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 24, stiffness: 260 }}
          className="relative w-full h-full sm:h-auto sm:max-w-lg bg-slate-950 sm:bg-slate-900/95 border-none sm:border sm:border-slate-800 rounded-none sm:rounded-2xl shadow-[0_18px_60px_rgba(0,0,0,0.75)] overflow-hidden z-10 flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-4 sm:px-6 border-b border-slate-800 bg-slate-900/80 backdrop-blur">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="sm:hidden p-2 -ml-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800/60 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-white tracking-tight">
                  Daily Journal
                </h2>
                <p className="text-xs sm:text-sm text-slate-400">
                  {formatDateDisplay(date)}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="hidden sm:inline-flex p-2 rounded-full hover:bg-slate-800/70 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="p-4 sm:p-6 space-y-6 flex-1 overflow-y-auto bg-slate-950/90"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Profit/Loss */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">
                  Net P/L ($)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign className="h-4 w-4 text-slate-500" />
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.profitLoss}
                    onChange={(e) =>
                      setFormData({ ...formData, profitLoss: e.target.value })
                    }
                    className="block w-full pl-10 pr-3 py-3 sm:py-2.5 bg-slate-900 border border-slate-800 rounded-lg focus:ring-2 focus:ring-emerald-500/60 focus:border-emerald-500 text-white placeholder-slate-600 text-base sm:text-sm transition-all"
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Number of Trades */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">
                  Total Trades
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Hash className="h-4 w-4 text-slate-500" />
                  </div>
                  <input
                    type="number"
                    min="0"
                    value={formData.trades}
                    onChange={(e) =>
                      setFormData({ ...formData, trades: e.target.value })
                    }
                    className="block w-full pl-10 pr-3 py-3 sm:py-2.5 bg-slate-900 border border-slate-800 rounded-lg focus:ring-2 focus:ring-emerald-500/60 focus:border-emerald-500 text-white placeholder-slate-600 text-base sm:text-sm transition-all"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Amount Invested */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">
                  Amount Invested ($)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign className="h-4 w-4 text-slate-500" />
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.amountInvested}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        amountInvested: e.target.value,
                      })
                    }
                    className="block w-full pl-10 pr-3 py-3 sm:py-2.5 bg-slate-900 border border-slate-800 rounded-lg focus:ring-2 focus:ring-emerald-500/60 focus:border-emerald-500 text-white placeholder-slate-600 text-base sm:text-sm transition-all"
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* ROI (auto-calculated, read-only) */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">
                  ROI (%)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <TrendingUp className="h-4 w-4 text-slate-500" />
                  </div>
                  <input
                    type="number"
                    value={computedRoi.toFixed(2)}
                    readOnly
                    className="block w-full pl-10 pr-3 py-3 sm:py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-600 text-base sm:text-sm transition-all cursor-not-allowed opacity-80"
                  />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">
                Daily Notes
              </label>
              <div className="relative">
                <div className="absolute top-3 left-3 pointer-events-none">
                  <StickyNote className="h-4 w-4 text-slate-500" />
                </div>
                <textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  rows={6}
                  className="block w-full pl-10 pr-3 py-3 sm:py-2.5 bg-slate-900 border border-slate-800 rounded-lg focus:ring-2 focus:ring-emerald-500/60 focus:border-emerald-500 text-white placeholder-slate-600 text-base sm:text-sm transition-all resize-none"
                  placeholder="What went well today? What could be improved?"
                />
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800 mt-auto">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="h-11 sm:h-10 px-5 border-slate-700 bg-slate-900/70 text-slate-200 hover:text-white hover:bg-slate-800/90 hover:border-slate-600 transition-colors"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-11 sm:h-10 px-6 bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/25 flex-1 sm:flex-none transition-colors disabled:opacity-70"
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
