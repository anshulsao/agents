import React, { useState, useEffect } from 'react';
import { Coins, TrendingUp, Calendar, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { getUserInfo, getUsageTracker, type UserInfo, type UsageTracker } from '../api/api';

const UsageTrackerComponent: React.FC = () => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [usage, setUsage] = useState<UsageTracker | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const user = await getUserInfo();
        setUserInfo(user);
        
        const usageData = await getUsageTracker(user.id);
        setUsage(usageData);
      } catch (err: any) {
        setError(err.message || 'Failed to load usage data');
        console.error('Usage tracker error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-surface/50 rounded-lg">
        <div className="w-3 h-3 bg-accent/30 rounded-full animate-pulse" />
        <span className="text-xs text-text-muted">Loading...</span>
      </div>
    );
  }

  if (error || !usage || !userInfo) {
    return (
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-error/10 border border-error/20 rounded-lg hover:bg-error/20 transition-colors"
      >
        <AlertTriangle className="h-3 w-3 text-error" />
        {isExpanded && <span className="text-xs text-error">Usage unavailable</span>}
      </button>
    );
  }

  const usagePercentage = (usage.used_amount / usage.plan.dollar_limit) * 100;
  const isNearLimit = usagePercentage > 80;
  const isOverLimit = usagePercentage > 100;

  const formatCurrency = (amount: number) => amount.toFixed(3);

  const getStatusColor = () => {
    if (isOverLimit) return 'text-error';
    if (isNearLimit) return 'text-warning';
    return 'text-success';
  };

  const getBackgroundColor = () => {
    if (isOverLimit) return 'bg-error/10 border-error/20 hover:bg-error/20';
    if (isNearLimit) return 'bg-warning/10 border-warning/20 hover:bg-warning/20';
    return 'bg-success/10 border-success/20 hover:bg-success/20';
  };

  const getIconColor = () => {
    if (isOverLimit) return 'text-error';
    if (isNearLimit) return 'text-warning';
    return 'text-success';
  };

  return (
    <div className="relative">
      <div
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all duration-200 ${getBackgroundColor()}`}
      >
        {isExpanded ? (
          <span className={`text-xs font-medium ${getIconColor()}`}>Credits</span>
        ) : (
          <Coins className={`h-4 w-4 ${getIconColor()}`} />
        )}
        
        {isExpanded && (
          <>
            <div className="flex items-center gap-1.5 text-xs">
              <span className={`font-medium ${getStatusColor()}`}>
                {formatCurrency(usage.used_amount)}
              </span>
              <span className="text-text-muted">/</span>
              <span className="text-text-secondary">
                {formatCurrency(usage.plan.dollar_limit)}
              </span>
            </div>

            {/* Usage bar */}
            <div className="w-8 h-1.5 bg-background-tertiary rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-300 ${
                  isOverLimit ? 'bg-error' : isNearLimit ? 'bg-warning' : 'bg-success'
                }`}
                style={{ width: `${Math.min(usagePercentage, 100)}%` }}
              />
            </div>

            <span className={`text-xs font-medium ${getStatusColor()}`}>
              {usagePercentage.toFixed(0)}%
            </span>
          </>
        )}
        
      </div>
    </div>
  );
};

export default UsageTrackerComponent;