import React, { useState, useEffect } from 'react';
import { Activity, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

const WebSocketTest: React.FC = () => {
  const [testResults, setTestResults] = useState<{
    sessionCreation: 'pending' | 'success' | 'error';
    websocketConnection: 'pending' | 'success' | 'error';
    messageExchange: 'pending' | 'success' | 'error';
    errors: string[];
  }>({
    sessionCreation: 'pending',
    websocketConnection: 'pending',
    messageExchange: 'pending',
    errors: []
  });

  const [isRunning, setIsRunning] = useState(false);

  const addError = (error: string) => {
    setTestResults(prev => ({
      ...prev,
      errors: [...prev.errors, error]
    }));
  };

  const runTest = async () => {
    setIsRunning(true);
    setTestResults({
      sessionCreation: 'pending',
      websocketConnection: 'pending',
      messageExchange: 'pending',
      errors: []
    });

    try {
      // Test 1: Session Creation
      console.log('🧪 Testing session creation...');
      const sessionRes = await fetch('/ai-api/chat/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agent_name: 'kubernetes-expert' }),
      });

      if (!sessionRes.ok) {
        const errorText = await sessionRes.text();
        addError(`Session creation failed: ${sessionRes.status} - ${errorText}`);
        setTestResults(prev => ({ ...prev, sessionCreation: 'error' }));
        setIsRunning(false);
        return;
      }

      const sessionData = await sessionRes.json();
      const sessionId = sessionData.session_id;
      console.log('✅ Session created:', sessionId);
      setTestResults(prev => ({ ...prev, sessionCreation: 'success' }));

      // Test 2: WebSocket Connection
      console.log('🧪 Testing WebSocket connection...');
      const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
      const host = window.location.host;
      const wsUrl = `${protocol}://${host}/ai-api/chat/ws/${sessionId}?agent_name=kubernetes-expert`;
      
      console.log('WebSocket URL:', wsUrl);

      const ws = new WebSocket(wsUrl);
      
      const connectionPromise = new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('WebSocket connection timeout (10s)'));
        }, 10000);

        ws.onopen = () => {
          console.log('✅ WebSocket connected');
          clearTimeout(timeout);
          setTestResults(prev => ({ ...prev, websocketConnection: 'success' }));
          resolve();
        };

        ws.onerror = (error) => {
          console.error('❌ WebSocket error:', error);
          clearTimeout(timeout);
          reject(new Error('WebSocket connection failed'));
        };

        ws.onclose = (event) => {
          console.log('WebSocket closed:', event.code, event.reason);
          if (event.code !== 1000) {
            clearTimeout(timeout);
            reject(new Error(`WebSocket closed unexpectedly: ${event.code} - ${event.reason}`));
          }
        };
      });

      await connectionPromise;

      // Test 3: Message Exchange
      console.log('🧪 Testing message exchange...');
      const messagePromise = new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Message exchange timeout (15s)'));
        }, 15000);

        ws.onmessage = (event) => {
          console.log('📥 Received message:', event.data);
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'message' || data.type === 'end') {
              console.log('✅ Message exchange successful');
              clearTimeout(timeout);
              setTestResults(prev => ({ ...prev, messageExchange: 'success' }));
              resolve();
            }
          } catch (e) {
            console.error('Failed to parse message:', e);
          }
        };

        // Send test message
        const testMessage = { type: 'message', payload: { message: 'test connection' } };
        ws.send(JSON.stringify(testMessage));
        console.log('📤 Sent test message');
      });

      await messagePromise;
      ws.close();

    } catch (error: any) {
      console.error('🚨 Test failed:', error);
      addError(error.message);
      setTestResults(prev => ({
        ...prev,
        websocketConnection: prev.websocketConnection === 'success' ? 'success' : 'error',
        messageExchange: 'error'
      }));
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-success" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-error" />;
      default:
        return <Activity className="h-4 w-4 text-text-muted animate-spin" />;
    }
  };

  return (
    <div className="bg-surface rounded-xl p-4 border border-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-text-primary">WebSocket Connection Test</h3>
        <button
          onClick={runTest}
          disabled={isRunning}
          className="button-primary text-sm px-3 py-1.5"
        >
          {isRunning ? 'Testing...' : 'Run Test'}
        </button>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-3">
          {getStatusIcon(testResults.sessionCreation)}
          <span className="text-sm">Session Creation</span>
        </div>
        
        <div className="flex items-center gap-3">
          {getStatusIcon(testResults.websocketConnection)}
          <span className="text-sm">WebSocket Connection</span>
        </div>
        
        <div className="flex items-center gap-3">
          {getStatusIcon(testResults.messageExchange)}
          <span className="text-sm">Message Exchange</span>
        </div>
      </div>

      {testResults.errors.length > 0 && (
        <div className="mt-4 p-3 bg-error/10 border border-error/20 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-error" />
            <span className="text-sm font-medium text-error">Errors</span>
          </div>
          <div className="space-y-1">
            {testResults.errors.map((error, index) => (
              <p key={index} className="text-xs text-error font-mono">{error}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default WebSocketTest;