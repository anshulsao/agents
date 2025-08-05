import { useState, useRef, useEffect, useCallback } from 'react';
import type { AgentDetail } from './useAgents';

export type Message = {
  id: string;
  type: 'user' | 'message' | 'error' | 'reasoning' | 'tool_calls_group';
  content: string;
  name?: string;
  args?: any;
  tools?: any[];
  summary?: string;
};

type Confirmation = {
  id: string;
  command: string;
};

type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'failed';

export function useChatSession() {
  // Core state - session persists throughout page lifecycle
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentAgent, setCurrentAgent] = useState<AgentDetail | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [confirmations, setConfirmations] = useState<Confirmation[]>([]);
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
  const [status, setStatus] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState<boolean>(false);
  const [hasSentFirstMessage, setHasSentFirstMessage] = useState<boolean>(false);
  const [isCreatingSession, setIsCreatingSession] = useState<boolean>(false);
  const [rawMessages, setRawMessages] = useState<any[]>([]);

  // Refs for managing state and avoiding stale closures
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const statusTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef<number>(0);
  const streamingMessageIndexRef = useRef<number | null>(null);
  const toolGroupIndexRef = useRef<number | null>(null);
  const pendingMessageRef = useRef<string | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  const currentAgentRef = useRef<AgentDetail | null>(null);
  const isReconnectingRef = useRef<boolean>(false);

  const MAX_RECONNECT_ATTEMPTS = 5;
  const BASE_RECONNECT_DELAY = 2000;
  const HEARTBEAT_INTERVAL = 30000; // 30 seconds
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Keep refs in sync with state
  useEffect(() => {
    sessionIdRef.current = sessionId;
  }, [sessionId]);

  useEffect(() => {
    currentAgentRef.current = currentAgent;
  }, [currentAgent]);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (statusTimeoutRef.current) {
      clearTimeout(statusTimeoutRef.current);
      statusTimeoutRef.current = null;
    }
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close(1000, 'Component cleanup');
      wsRef.current = null;
    }
    isReconnectingRef.current = false;
  }, []);

  // Status management
  const updateStatus = useCallback((message: string | null, autoClear = false) => {
    if (statusTimeoutRef.current) {
      clearTimeout(statusTimeoutRef.current);
      statusTimeoutRef.current = null;
    }
    setStatus(message);
    if (autoClear && message) {
      statusTimeoutRef.current = setTimeout(() => {
        setStatus(null);
        statusTimeoutRef.current = null;
      }, 3000);
    }
  }, []);

  // Session creation - only happens once per page load or when explicitly needed
  const createSession = useCallback(async (agent: AgentDetail): Promise<string | null> => {
    if (isCreatingSession || sessionIdRef.current) {
      return sessionIdRef.current; // Return existing session or wait for current creation
    }

    setIsCreatingSession(true);
    updateStatus('Creating session...');

    try {
      // Get URL parameters for agent initialization
      const urlParams = new URLSearchParams(window.location.search);
      const agentInitArgs: Record<string, string> = {};
      urlParams.forEach((value, key) => {
        agentInitArgs[key] = value;
      });

      const requestBody: any = { agent_name: agent.name };
      if (Object.keys(agentInitArgs).length > 0) {
        requestBody.agent_init_args = agentInitArgs;
      }

      const response = await fetch('/ai-api/chat/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        if (response.status === 429) {
          const errorMessage = {
            id: Date.now().toString(),
            type: 'message' as const,
            content: '**Usage Limit Reached**\n\nYou\'ve reached your current usage limit. To continue using Intelligence, please upgrade your plan for higher limits and priority access.\n\n[Contact your administrator to upgrade your plan](mailto:support@facets.cloud?subject=Intelligence%20Plan%20Upgrade%20Request)'
          };
          setMessages([errorMessage]);
          return null;
        }
        throw new Error(`Session creation failed: ${response.status}`);
      }

      const data = await response.json();
      const newSessionId = data.session_id;

      setSessionId(newSessionId);
      updateStatus(null);
      return newSessionId;

    } catch (error: any) {
      console.error('Session creation error:', error);
      const errorMessage = {
        id: Date.now().toString(),
        type: 'error' as const,
        content: `Failed to create session: ${error.message || 'Unknown error occurred'}`
      };
      setMessages([errorMessage]);
      updateStatus(null);
      return null;
    } finally {
      setIsCreatingSession(false);
    }
  }, [updateStatus]);

  // Tool group management
  const createToolGroup = useCallback(() => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type: 'tool_calls_group',
      content: '',
      tools: [],
      summary: 'Executing'
    };
    
    setMessages(prev => {
      toolGroupIndexRef.current = prev.length;
      return [...prev, newMessage];
    });
    
    return toolGroupIndexRef.current;
  }, []);

  const addToolToGroup = useCallback((toolCall: any) => {
    setMessages(prev => {
      // If no group exists, create one and add the tool immediately
      if (toolGroupIndexRef.current === null) {
        const newMessage: Message = {
          id: Date.now().toString(),
          type: 'tool_calls_group',
          content: '',
          tools: [toolCall],
          summary: 'Executing'
        };
        toolGroupIndexRef.current = prev.length;
        return [...prev, newMessage];
      }
      
      // Add to existing group
      const newMessages = [...prev];
      const groupMessage = newMessages[toolGroupIndexRef.current!];

      if (groupMessage?.type === 'tool_calls_group') {
        newMessages[toolGroupIndexRef.current!] = {
          ...groupMessage,
          tools: [...(groupMessage.tools || []), toolCall],
          summary: 'Executing'
        };
      }
      return newMessages;
    });
  }, []);

  const finalizeToolGroup = useCallback(() => {
    if (toolGroupIndexRef.current !== null) {
      setMessages(prev => {
        const newMessages = [...prev];
        const groupMessage = newMessages[toolGroupIndexRef.current!];

        if (groupMessage?.type === 'tool_calls_group') {
          newMessages[toolGroupIndexRef.current!] = {
            ...groupMessage,
            summary: 'Completed'
          };
        }
        return newMessages;
      });
      toolGroupIndexRef.current = null;
    }
  }, []);

  // WebSocket message handlers
  const handleWebSocketMessage = useCallback((data: any) => {
    // Capture raw message for inspector
    setRawMessages(prev => [...prev, {
      timestamp: new Date().toISOString(),
      ...data
    }]);

    switch (data.type) {
      case 'error':
        finalizeToolGroup();
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          type: 'error',
          content: data.payload?.message || data.message || 'An error occurred'
        }]);
        setIsBusy(false);
        updateStatus(null);
        break;

      case 'message':
        if (streamingMessageIndexRef.current === null) {
          finalizeToolGroup();
          updateStatus('Typing...');
          setMessages(prev => {
            streamingMessageIndexRef.current = prev.length;
            return [...prev, {
              id: Date.now().toString(),
              type: 'message',
              content: data.payload.message
            }];
          });
        } else {
          setMessages(prev => {
            const newMessages = [...prev];
            const streamingMessage = newMessages[streamingMessageIndexRef.current!];
            if (streamingMessage) {
              newMessages[streamingMessageIndexRef.current!] = {
                ...streamingMessage,
                content: streamingMessage.content + data.payload.message
              };
            }
            return newMessages;
          });
        }
        break;

      case 'reasoning':
        setMessages(prev => {
          const lastMessage = prev[prev.length - 1];
          if (lastMessage?.type === 'reasoning') {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1] = {
              ...lastMessage,
              content: lastMessage.content + '\n\n' + data.payload.message
            };
            return newMessages;
          } else {
            updateStatus('Thinking...');
            return [...prev, {
              id: Date.now().toString(),
              type: 'reasoning',
              content: data.payload.message
            }];
          }
        });
        break;

      case 'tool_call':
        // Always update status when we get a tool call
        updateStatus('Executing operations...');

        let parsedArgs = data.payload.arguments;
        if (typeof parsedArgs === 'string') {
          try {
            parsedArgs = JSON.parse(parsedArgs);
          } catch {
            // Keep as string if parsing fails
          }
        }

        addToolToGroup({
          name: data.payload.name,
          args: parsedArgs
        });
        break;

      case 'agent_update':
        updateStatus(`Switched to ${data.payload.agent_name}`, true);
        // Update current agent name but keep the same session
        setCurrentAgent(prev => prev ? { ...prev, name: data.payload.agent_name } : null);
        break;

      case 'confirmation_request':
        finalizeToolGroup();
        setConfirmations(prev => [...prev, {
          id: data.payload.id,
          command: data.payload.command
        }]);
        updateStatus('Confirmation requested', true);
        break;

      case 'end':
        finalizeToolGroup();
        setIsBusy(false);
        updateStatus(null);
        streamingMessageIndexRef.current = null;
        break;

      default:
        // Silently ignore unknown message types to reduce noise
        // Only log if it's not a known ignorable type
        if (!['end'].includes(data.type)) {
          console.warn('Unknown message type:', data.type);
        }
        break;
    }
  }, [finalizeToolGroup, updateStatus, addToolToGroup]);

  // Heartbeat management
  const startHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
    }

    heartbeatIntervalRef.current = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        try {
          wsRef.current.send(JSON.stringify({ type: 'ping' }));
        } catch (error) {
          console.warn('Failed to send heartbeat:', error);
          // Trigger reconnection if heartbeat fails
          if (sessionIdRef.current && currentAgentRef.current) {
            attemptReconnection();
          }
        }
      }
    }, HEARTBEAT_INTERVAL);
  }, []);

  const stopHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
  }, []);

  // Reconnection logic - uses existing session
  const attemptReconnection = useCallback(() => {
    // Don't reconnect if no session or already reconnecting
    if (!sessionIdRef.current || !currentAgentRef.current || isReconnectingRef.current) {
      return;
    }

    // Don't exceed max attempts
    if (reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
      setConnectionState('failed');
      updateStatus('Connection failed - maximum retry attempts reached', true);
      isReconnectingRef.current = false;
      return;
    }

    isReconnectingRef.current = true;
    reconnectAttemptsRef.current += 1;
    setConnectionState('reconnecting');
    updateStatus(`Reconnecting... (${reconnectAttemptsRef.current}/${MAX_RECONNECT_ATTEMPTS})`);

    const delay = BASE_RECONNECT_DELAY * Math.pow(1.5, reconnectAttemptsRef.current - 1);

    // Clear any existing reconnection timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    reconnectTimeoutRef.current = setTimeout(() => {
      // Use current session and agent for reconnection
      if (sessionIdRef.current && currentAgentRef.current) {
        connectWebSocket(sessionIdRef.current, currentAgentRef.current);
      }
      isReconnectingRef.current = false;
    }, delay);
  }, [updateStatus]);

  // Reset reconnection state
  const resetReconnection = useCallback(() => {
    reconnectAttemptsRef.current = 0;
    isReconnectingRef.current = false;
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  // WebSocket connection management - reuses existing session
  const connectWebSocket = useCallback((sessionId: string, agent: AgentDetail, initialMessage?: string) => {
    // Prevent multiple simultaneous connections
    if (wsRef.current?.readyState === WebSocket.CONNECTING) {
      return;
    }

    // Close existing connection
    if (wsRef.current) {
      stopHeartbeat();
      wsRef.current.close(1000, 'Creating new connection');
      wsRef.current = null;
    }

    setConnectionState('connecting');
    updateStatus('Connecting...');

    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const host = window.location.host;
    const url = `${protocol}://${host}/ai-api/chat/ws/${sessionId}?agent_name=${encodeURIComponent(agent.name)}`;

    try {
      const socket = new WebSocket(url);
      wsRef.current = socket;

      socket.onopen = () => {
        console.log('WebSocket connected');
        setConnectionState('connected');
        resetReconnection();
        updateStatus(null);
        startHeartbeat();

        // Send initial message if provided
        if (initialMessage) {
          const packet = { type: 'message', payload: { message: initialMessage } };
          socket.send(JSON.stringify(packet));
          setMessages(prev => [...prev, {
            id: Date.now().toString(),
            type: 'user',
            content: initialMessage
          }]);
          setIsBusy(true);
          updateStatus('Thinking...');
          setHasSentFirstMessage(true);
        }

        // Send pending message if exists
        if (pendingMessageRef.current) {
          const packet = { type: 'message', payload: { message: pendingMessageRef.current } };
          socket.send(JSON.stringify(packet));
          pendingMessageRef.current = null;
        }
      };

      socket.onmessage = (event) => {
        const rawData = event.data.trim();
        if (!rawData) return;

        try {
          const data = JSON.parse(rawData);

          // Handle pong responses
          if (data.type === 'pong') {
            return; // Just acknowledgment of our ping
          }

          handleWebSocketMessage(data);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
          console.error('Raw message data:', rawData);
          
          // Only show error to user if it's not just empty/whitespace
          if (rawData && rawData.trim()) {
            setMessages(prev => [...prev, {
              id: Date.now().toString(),
              type: 'error',
              content: `Failed to parse server message: ${rawData.substring(0, 100)}${rawData.length > 100 ? '...' : ''}`
            }]);
          }
        }
      };

      socket.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason);
        wsRef.current = null;
        stopHeartbeat();
        setConnectionState('disconnected');
        setIsBusy(false);
        updateStatus(null);

        // Handle specific close codes
        if (event.code === 4408) {
          // Usage limit reached - don't reconnect
          setMessages(prev => [...prev, {
            id: Date.now().toString(),
            type: 'message',
            content: '**Usage Limit Reached**\n\nYou\'ve reached your current usage limit. To continue using Intelligence, please upgrade your plan for higher limits and priority access.\n\n[Contact your administrator to upgrade your plan](mailto:support@facets.cloud?subject=Intelligence%20Plan%20Upgrade%20Request)'
          }]);
          return;
        }

        // Don't reconnect for normal closures or if component is cleaning up
        if (event.code === 1000 || event.code === 1001) {
          return;
        }

        // Attempt reconnection for unexpected closures
        attemptReconnection();
      };

      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        stopHeartbeat();

        // Only set to failed if we're not already reconnecting
        if (!isReconnectingRef.current) {
          setConnectionState('failed');
          updateStatus('Connection error', true);

          // Trigger reconnection after a brief delay
          setTimeout(() => {
            attemptReconnection();
          }, 1000);
        }
      };

    } catch (error) {
      console.error('Failed to create WebSocket:', error);
      setConnectionState('failed');
      updateStatus('Failed to establish connection', true);

      // Try to reconnect after error
      setTimeout(() => {
        attemptReconnection();
      }, 2000);
    }
  }, [handleWebSocketMessage, updateStatus, startHeartbeat, stopHeartbeat, resetReconnection, attemptReconnection]);

  // Agent selection - DOES NOT create new session, just updates current agent
  const selectAgent = useCallback((agent: AgentDetail) => {
    // Always update the current agent
    setCurrentAgent(agent);

    // If this is the first agent selection and no session exists, create one
    if (!sessionIdRef.current && !isCreatingSession) {
      createSession(agent);
    }
  }, [createSession, isCreatingSession]);

  // Send message - creates session if needed, but reuses existing session
  const sendMessage = useCallback(async (text: string) => {
    if (!currentAgentRef.current) {
      console.warn('Cannot send message: no agent selected');
      return;
    }

    let sessionId = sessionIdRef.current;

    // Create session if it doesn't exist (only happens on first message)
    if (!sessionId && !isCreatingSession) {
      sessionId = await createSession(currentAgentRef.current);
      if (!sessionId) return; // Session creation failed
    }

    // If session is still being created, store message as pending
    if (!sessionId) {
      pendingMessageRef.current = text;
      return;
    }

    // Mark first message sent
    setHasSentFirstMessage(true);

    // Reset streaming state
    streamingMessageIndexRef.current = null;
    toolGroupIndexRef.current = null;

    // Connect or send message
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      // Send immediately if connected
      const packet = { type: 'message', payload: { message: text } };
      wsRef.current.send(JSON.stringify(packet));
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        type: 'user',
        content: text
      }]);
      setIsBusy(true);
      updateStatus('Thinking...');
    } else if (sessionId && currentAgentRef.current) {
      // Connect with initial message
      connectWebSocket(sessionId, currentAgentRef.current, text);
    }
  }, [createSession, connectWebSocket, updateStatus, isCreatingSession]);

  const respondConfirmation = useCallback((id: string, confirmed: boolean) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const packet = { type: 'confirmation_response', payload: { id, confirmed } };
      wsRef.current.send(JSON.stringify(packet));
      setConfirmations(prev => prev.filter(c => c.id !== id));
      updateStatus(confirmed ? 'Confirmation accepted' : 'Confirmation declined', true);
    }
  }, [updateStatus]);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return {
    // State
    currentAgent,
    sessionId,
    messages,
    confirmations,
    status,
    isBusy,
    isConnected: connectionState === 'connected',
    connectionState,
    hasSentFirstMessage,
    rawMessages,

    // Actions
    selectAgent,
    sendMessage,
    respondConfirmation
  };
}
