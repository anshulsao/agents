import React from 'react';
import { Loader2, Activity, Wifi, WifiOff, AlertTriangle } from 'lucide-react';

interface StatusIndicatorProps {
  status: string | null;
  isBusy?: boolean;
  isConnected?: boolean;
  hasSentFirstMessage?: boolean;
  onRestartSession?: () => void;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ 
  status, 
  isBusy = false, 
  isConnected = true,
  hasSentFirstMessage = false,
  onRestartSession
}) => {
  // Always show status indicator, but content varies based on state
  
  // Show disconnected status with clickable CTA (only after first message)
  if (hasSentFirstMessage && !isConnected) {
    return (
      <div className="flex items-center gap-3 text-sm">
        <div className="flex items-center gap-2">
          <WifiOff className="h-4 w-4 text-red-600" />
          <button 
            onClick={onRestartSession}
            className="font-medium text-red-600 hover:text-red-700 underline underline-offset-2 hover:bg-red-50 px-2 py-1 rounded transition-colors cursor-pointer"
          >
            Disconnected - Click to start new session
          </button>
        </div>
      </div>
    );
  }

  // Show activity status when there's a status message or when busy
  if (status || isBusy) {
    // Check if status contains disconnected/failed messages and make them clickable
    const isDisconnectedStatus = status && (status.includes('Disconnected') || status.includes('failed'));
    
    return (
      <div className="flex items-center gap-3 text-sm text-text-tertiary">
        <div className="flex items-center gap-2">
          {isBusy ? (
            <Loader2 className="h-4 w-4 animate-spin text-accent" />
          ) : isDisconnectedStatus ? (
            <WifiOff className="h-4 w-4 text-red-600" />
          ) : (
            <Activity className="h-4 w-4 text-success animate-pulse-soft" />
          )}
          {isDisconnectedStatus && onRestartSession ? (
            <button 
              onClick={onRestartSession}
              className="font-medium text-red-600 hover:text-red-700 underline underline-offset-2 hover:bg-red-50 px-2 py-1 rounded transition-colors cursor-pointer"
            >
              {status}
            </button>
          ) : (
            <span className="font-medium">
              {status || (isBusy ? 'Processing...' : 'Ready')}
            </span>
          )}
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