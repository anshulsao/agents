import React from 'react';
import { Loader2, Activity, Wifi, WifiOff, AlertTriangle, RefreshCw } from 'lucide-react';

interface StatusIndicatorProps {
  status: string | null;
  isBusy?: boolean;
  isConnected?: boolean;
  hasSentFirstMessage?: boolean;
  onRestartSession?: () => void;
  reconnectAttempts?: number;
  isReconnecting?: boolean;
  connectionState?: 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'failed';
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ 
  status, 
  isBusy = false, 
  isConnected = true,
  hasSentFirstMessage = false,
  onRestartSession,
  reconnectAttempts = 0,
  isReconnecting = false,
  connectionState = 'disconnected'
}) => {
  // Always show status indicator, but content varies based on state
  
  // Debug logging
  if (connectionState !== 'connected') {
    console.log('StatusIndicator state:', {
      connectionState,
      isReconnecting,
      reconnectAttempts,
      isConnected,
      hasSentFirstMessage
    });
  }
  
  // Show reconnecting state with spinner
  if (connectionState === 'reconnecting' || isReconnecting) {
    const maxAttempts = 5;
    return (
      <div className="flex items-center gap-3 text-sm">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4 animate-spin text-amber-600" />
          <span className="font-medium text-amber-600">
            Reconnecting... ({reconnectAttempts}/{maxAttempts})
          </span>
        </div>
      </div>
    );
  }
  
  // Show disconnected status with appropriate CTA (only after first message)
  // Don't show this if we're in a reconnecting state
  if (hasSentFirstMessage && !isConnected && connectionState !== 'reconnecting') {
    const maxAttempts = 5;
    const canReconnect = reconnectAttempts < maxAttempts;
    
    return (
      <div className="flex items-center gap-3 text-sm">
        <div className="flex items-center gap-2">
          <WifiOff className="h-4 w-4 text-red-600" />
          <button 
            onClick={onRestartSession}
            className="font-medium text-red-600 hover:text-red-700 underline underline-offset-2 hover:bg-red-50 px-2 py-1 rounded transition-colors cursor-pointer"
          >
            {canReconnect && reconnectAttempts > 0
              ? `Connection lost after ${reconnectAttempts} attempts - Click to start new session`
              : 'Connection failed - Click to start new session'
            }
          </button>
        </div>
      </div>
    );
  }

  // Show activity status when there's a status message or when busy
  if (status || isBusy) {
    // Check if status contains disconnected/failed messages and make them clickable
    const isDisconnectedStatus = status && (
      status.includes('Disconnected') || 
      status.includes('failed') || 
      status.includes('Usage limit') ||
      status.includes('Kubeconfig') ||
      status.includes('Invalid session')
    );
    
    const isReconnectingStatus = status && (
      status.includes('Reconnecting') ||
      status.includes('attempting to reconnect')
    );
    
    return (
      <div className="flex items-center gap-3 text-sm text-text-tertiary">
        <div className="flex items-center gap-2">
          {isBusy ? (
            <Loader2 className="h-4 w-4 animate-spin text-accent" />
          ) : isReconnectingStatus ? (
            <RefreshCw className="h-4 w-4 animate-spin text-amber-600" />
          ) : isDisconnectedStatus ? (
            <WifiOff className="h-4 w-4 text-red-600" />
          ) : (
            <Activity className="h-4 w-4 text-success animate-pulse-soft" />
          )}
          {isReconnectingStatus ? (
            <span className="font-medium text-amber-600">
              {status}
            </span>
          ) : isDisconnectedStatus && onRestartSession ? (
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