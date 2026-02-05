
import React from 'react';
import { DollarSign, TrendingUp, BarChart3, Target } from 'lucide-react';
import KPICard from './KPICard';

const KPICards = ({ kpiData, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-gray-900/50 rounded-2xl animate-pulse border border-gray-800" />
        ))}
      </div>
    );
  }

  if (!kpiData) return null;

  const formatCurrency = (val) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <KPICard
        title="Total P/L"
        value={formatCurrency(kpiData.totalPL)}
        subValue={kpiData.totalPL >= 0 ? "+ Profitable" : "- Loss"}
        icon={DollarSign}
        delay={0}
        className={kpiData.totalPL >= 0 ? "border-emerald-500/20" : "border-red-500/20"}
      />
      
      <KPICard
        title="Win Rate"
        value={`${kpiData.winRate.toFixed(1)}%`}
        subValue={`${kpiData.tradingDaysCount} Trading Days`}
        icon={Target}
        delay={0.1}
      />
      
      <KPICard
        title="Total Trades"
        value={kpiData.totalTrades}
        subValue="Executed"
        icon={BarChart3}
        delay={0.2}
      />
      
      <KPICard
        title="Avg. Daily P/L"
        value={formatCurrency(kpiData.avgDailyPL)}
        subValue={kpiData.avgDailyPL >= 0 ? "Positive Expectancy" : "Negative Expectancy"}
        icon={TrendingUp}
        delay={0.3}
      />
    </div>
  );
};

export default KPICards;
