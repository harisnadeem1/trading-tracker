
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const CumulativeProfitChart = ({ data }) => {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500 bg-gray-900/30 rounded-2xl border border-gray-800 border-dashed text-sm">
        No cumulative data available
      </div>
    );
  }

  // Dimensions
  const height = 250;
  const padding = 20;
  
  // Scales
  const values = data.map(d => d.value);
  const minVal = Math.min(...values, 0);
  const maxVal = Math.max(...values, 0);
  const range = maxVal - minVal || 1;

  const getY = (val) => height - padding - ((val - minVal) / range) * (height - 2 * padding);
  const getX = (index) => (index / (data.length - 1)) * 100;

  // Generate Path
  const points = data.map((d, i) => `${getX(i)},${getY(d.value)}`).join(' ');
  const areaPoints = `${0},${height} ${points} ${100},${height}`;

  return (
    <div className="w-full h-[250px] sm:h-[300px] relative overflow-hidden">
      <svg 
        className="w-full h-full overflow-visible" 
        viewBox={`0 0 100 ${height}`} 
        preserveAspectRatio="none"
      >
        {/* Gradient Definition */}
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Grid Lines */}
        <line x1="0" y1={getY(0)} x2="100" y2={getY(0)} stroke="#374151" strokeWidth="0.5" strokeDasharray="2" />

        {/* Area Fill */}
        <motion.polygon
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          points={areaPoints}
          fill="url(#gradient)"
        />

        {/* Line */}
        <motion.polyline
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          points={points}
          fill="none"
          stroke="#10b981"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />

        {/* Interactive Points */}
        {data.map((d, i) => (
          <circle
            key={i}
            cx={`${getX(i)}%`}
            cy={getY(d.value)}
            r="0" // invisible target
            className="stroke-transparent fill-transparent cursor-pointer hover:fill-emerald-400 hover:stroke-white hover:stroke-2 active:fill-emerald-400"
            style={{ r: 6, transition: 'all 0.2s' }}
            onMouseEnter={() => setHoveredPoint(d)}
            onMouseLeave={() => setHoveredPoint(null)}
            onClick={() => setHoveredPoint(d)} // Touch support
          />
        ))}
      </svg>
       
      {/* Tooltip Overlay */}
      <AnimatePresence>
        {hoveredPoint && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute top-4 left-1/2 -translate-x-1/2 bg-gray-900 border border-emerald-500/50 shadow-xl rounded-lg p-3 text-center pointer-events-none min-w-[140px] max-w-[200px] z-20"
          >
            <p className="text-gray-400 text-xs mb-1">
              {new Date(hoveredPoint.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </p>
            <p className="text-base sm:text-lg font-bold text-emerald-400">
              {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(hoveredPoint.value)}
            </p>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider">Cumulative P/L</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CumulativeProfitChart;
