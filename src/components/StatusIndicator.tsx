import React from 'react';
import { Loader2, Activity, Wifi, WifiOff, AlertTriangle } from 'lucide-react';

interface StatusIndicatorProps {
  status: string | null;
  isBusy?: boolean;
  isConnected?: boolean;
  reconnectAttempts?: number;
  hasSentFirstMessage?: boolean;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ 
  status, 
  isBusy = false, 
  isConnected = true,
  reconnectAttempts = 0,
  hasSentFirstMessage = false
}) => {
  // Add debug info in development
  React.useEffect(() => {
    console.log('🔍 Status Indicator State:', {
      status,
      isBusy,
      isConnected,
      reconnectAttempts,
      hasSentFirstMessage
    });
  }, [status, isBusy, isConnected, reconnectAttempts, hasSentFirstMessage]);
  
  // Always show status indicator, but content varies based on state
  
  // Show connection status if disconnected or reconnecting (only after first message)
  if (hasSentFirstMessage && (!isConnected || reconnectAttempts > 0)) {
    return (
      <div className="flex items-center gap-3 text-sm">
        <div className="flex items-center gap-2">
          {reconnectAttempts > 0 ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin text-warning" />
              <span className="font-medium text-warning">
                Reconnecting... ({reconnectAttempts}/5)
              </span>
            </>
          ) : (
            <>
              <WifiOff className="h-4 w-4 text-error" />
              <span className="font-medium text-error">Disconnected</span>
            </>
          )}
        </div>
      </div>
    );
  }

  // Show activity status when there's a status message or when busy
  if (status || isBusy) {
    return (
      <div className="flex items-center gap-3 text-sm text-text-tertiary">
        <div className="flex items-center gap-2">
          {isBusy ? (
            <Loader2 className="h-4 w-4 animate-spin text-accent" />
          ) : (
            <Activity className="h-4 w-4 text-success animate-pulse-soft" />
          )}
          <span className="font-medium">
            {status || (isBusy ? 'Processing...' : 'Ready')}
          </span>
        </div>
        
        {isBusy && (
          <div className="flex gap-1">
            <div className="w-1 h-1 bg-accent rounded-full animate-typing" style={{ animationDelay: '0ms' }} />
            <div className="w-1 h-1 bg-accent rounded-full animate-typing" style={{ animationDelay: '150ms' }} />
            <div className="w-1 h-1 bg-accent rounded-full animate-typing" style={{ animationDelay: '300ms' }} />
          </div>
        )}
      </div>
    );
  }

  // Show default ready state when connected and no activity
  if (hasSentFirstMessage && isConnected) {
    return (
      <div className="flex items-center gap-3 text-sm text-text-tertiary">
        <div className="flex items-center gap-2">
          <Wifi className="h-4 w-4 text-success" />
          <span className="font-medium">Ready</span>
        </div>
      </div>
    );
  }

  // Show initial state before first message
  return (
    <div className="flex items-center gap-3 text-sm text-text-tertiary">
      <div className="flex items-center gap-2">
        <Activity className="h-4 w-4 text-text-muted" />
        <span className="font-medium">Ready to chat</span>
      </div>
    </div>
  );
};

export default StatusIndicator;