import { useState, useRef, useEffect } from 'react';
import type { AgentDetail } from './useAgents';

export type Message = {
  id: string;
  type: string;
  content: string;
  name?: string;
  args?: any;
  tools?: any[];
  summary?: string;
};

type Confirmation = { id: string; command: string };


export function useChatSession() {
  const [currentAgent, setCurrentAgent] = useState<AgentDetail | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [packets, setPackets] = useState<any[]>([]);
  const [confirmations, setConfirmations] = useState<Confirmation[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [reconnectAttempts, setReconnectAttempts] = useState<number>(0);
  const [hasSentFirstMessage, setHasSentFirstMessage] = useState<boolean>(false);
  
  const ws = useRef<WebSocket | null>(null);
  const streamingIndex = useRef<number | null>(null);
  const toolGroupIndex = useRef<number | null>(null);
  const agentRef = useRef<AgentDetail | null>(null);
  const statusTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const maxReconnectAttempts = 5;
  const reconnectDelay = 2000; // 2 seconds

  // Automatically create a session when agent changes
  useEffect(() => {
    const createSession = async () => {
      if (currentAgent && !sessionId) {
        try {
          // Get all query params as a dictionary
          const urlParams = new URLSearchParams(window.location.search);
          const agentInitArgs: Record<string, string> = {};
          urlParams.forEach((value, key) => {
            agentInitArgs[key] = value;
          });
          
          const requestBody: any = { agent_name: currentAgent.name };
          if (Object.keys(agentInitArgs).length > 0) {
            requestBody.agent_init_args = agentInitArgs;
          }
          
          const res = await fetch('/ai-api/chat/session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
          });
          
          if (!res.ok) {
            if (res.status === 429) {
              // Rate limit exceeded - show upgrade message
              setMessages([{
                id: Date.now().toString(),
                type: 'message',
                content: '**Usage Limit Reached**\n\nYou\'ve reached your current usage limit. To continue using Intelligence, please upgrade your plan for higher limits and priority access.\n\n[Contact your administrator to upgrade your plan](mailto:support@facets.cloud?subject=Intelligence%20Plan%20Upgrade%20Request)'
              }]);
              return;
            }
            throw new Error(`Session creation failed: ${res.status}`);
          }
          
          const data = await res.json();
          setSessionId(data.session_id);
        } catch (e: any) {
          console.error('Session creation error:', e);
          // Show generic error message for other failures
          setMessages([{
            id: Date.now().toString(),
            type: 'error',
            content: `Failed to create session: ${e.message || 'Unknown error occurred'}`
          }]);
        }
      }
    };
    createSession();
  }, [currentAgent, sessionId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (statusTimerRef.current) {
        clearTimeout(statusTimerRef.current);
      }
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  const clearStatus = () => {
    if (statusTimerRef.current) {
      clearTimeout(statusTimerRef.current);
      statusTimerRef.current = null;
    }
    setStatus(null);
  };

  const updateStatus = (msg: string | null, autoClear = false) => {
    if (statusTimerRef.current) {
      clearTimeout(statusTimerRef.current);
      statusTimerRef.current = null;
    }
    setStatus(msg);
    if (autoClear && msg) {
      statusTimerRef.current = setTimeout(() => {
        setStatus(null);
        statusTimerRef.current = null;
      }, 3000);
    }
  };

  const resetReconnection = () => {
    setReconnectAttempts(0);
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
  };

  const attemptReconnect = (sid: string, agent: AgentDetail) => {
    setReconnectAttempts(prev => {
      const nextAttempt = prev + 1;
      console.log(`Reconnection attempt ${nextAttempt}/${maxReconnectAttempts}`);
      
      if (nextAttempt > maxReconnectAttempts) {
        console.log('Maximum reconnection attempts reached');
        updateStatus('Connection failed - maximum retry attempts reached', true);
        return 0; // Reset for next time
      }
      
      updateStatus(`Reconnecting... (${nextAttempt}/${maxReconnectAttempts})`);
      
      reconnectTimerRef.current = setTimeout(() => {
        console.log('Executing reconnection attempt');
        connectWebSocket(sid, agent, null);
      }, reconnectDelay * Math.pow(1.5, prev)); // Exponential backoff
      
      return nextAttempt;
    });
  };

  const addPacket = (packet: any) => {
    const summary = packet.type || 'packet';
    setPackets((prev) => [...prev, { ...packet, summary, timestamp: Date.now() }]);
  };

  const createToolGroup = () => {
    setMessages((prev) => {
      const newMessage = {
        id: Date.now().toString(),
        type: 'tool_calls_group',
        content: '',
        tools: [],
        summary: 'Executing'
      };
      toolGroupIndex.current = prev.length;
      return [...prev, newMessage];
    });
  };

  const addToolToGroup = (toolCall: any) => {
    setMessages((prev) => {
      if (toolGroupIndex.current === null) {
        createToolGroup();
        return prev;
      }
      
      const msgs = [...prev];
      const groupMsg = msgs[toolGroupIndex.current];
      if (groupMsg && groupMsg.type === 'tool_calls_group') {
        const updatedTools = [...(groupMsg.tools || []), toolCall];
        msgs[toolGroupIndex.current] = {
          ...groupMsg,
          tools: updatedTools,
          summary: 'Executing'
        };
      }
      return msgs;
    });
  };

  const finalizeToolGroup = () => {
    if (toolGroupIndex.current !== null) {
      setMessages((prev) => {
        const msgs = [...prev];
        const groupMsg = msgs[toolGroupIndex.current!];
        if (groupMsg && groupMsg.type === 'tool_calls_group') {
          msgs[toolGroupIndex.current!] = {
            ...groupMsg,
            summary: 'Completed'
          };
        }
        return msgs;
      });
      toolGroupIndex.current = null;
    }
  };


  const respondConfirmation = (id: string, confirmed: boolean) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      const packet = { type: 'confirmation_response', payload: { id, confirmed } };
      ws.current.send(JSON.stringify(packet));
      addPacket({ ...packet, summary: 'confirmation_response' });
      setConfirmations((prev) => prev.filter((c) => c.id !== id));
      updateStatus(confirmed ? 'Confirmation accepted' : 'Confirmation declined', true);
    }
  };

  const selectAgent = (agent: AgentDetail) => {
    setCurrentAgent(agent);
    agentRef.current = agent;
    setSessionId(null);
    setMessages([]);
    setPackets([]);
    setConfirmations([]);
    setIsConnected(false);
    resetReconnection();
    setHasSentFirstMessage(false);
    clearStatus();
    setIsBusy(false);
    streamingIndex.current = null;
    toolGroupIndex.current = null;
    
    if (statusTimerRef.current) {
      clearTimeout(statusTimerRef.current);
      statusTimerRef.current = null;
    }
    if (ws.current) {
      ws.current.close();
      ws.current = null;
    }
  };

  const connectWebSocket = (sid: string, agent: AgentDetail, initialMessage: string | null) => {
    agentRef.current = agent;
    
    let url: string;
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const host = window.location.host;
    url = `${protocol}://${host}/ai-api/chat/ws/${sid}?agent_name=${encodeURIComponent(agent.name)}`;
    
    try {
      const socket = new WebSocket(url);
      ws.current = socket;

      socket.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        resetReconnection();
        addPacket({ type: 'connect', url });
        
        if (initialMessage) {
          const packet = { type: 'message', payload: { message: initialMessage } };
          socket.send(JSON.stringify(packet));
          addPacket({ ...packet, summary: 'send' });
          setMessages((prev) => [...prev, { 
            id: Date.now().toString(), 
            type: 'user', 
            content: initialMessage 
          }]);
          setIsBusy(true);
          updateStatus('Thinking...');
        }
      };

      socket.onmessage = (event) => {
        try {
          // Split by newlines and process each JSON object separately
          const lines = event.data.split('\n').filter((line: string) => line.trim() !== '');
          
          for (const line of lines) {
            const data = JSON.parse(line);
            addPacket(data);
            
            switch (data.type) {
              case 'error':
                finalizeToolGroup();
                setMessages((prev) => [...prev, { 
                  id: Date.now().toString(), 
                  type: 'error', 
                  content: data.payload?.message || data.message || 'An error occurred'
                }]);
                setIsBusy(false);
                clearStatus();
                break;
                
              case 'message': {
                // Start new message if not streaming
                if (streamingIndex.current === null) {
                  finalizeToolGroup(); // Finalize any pending tool group
                  updateStatus(`Typing...`);
                  setMessages((prev) => {
                    streamingIndex.current = prev.length;
                    return [...prev, { 
                      id: Date.now().toString(), 
                      type: 'message', 
                      content: data.payload.message 
                    }];
                  });
                } else {
                  // Continue streaming to existing message
                  setMessages((prev) => {
                    const msgs = [...prev];
                    if (msgs[streamingIndex.current!]) {
                      msgs[streamingIndex.current!].content += data.payload.message;
                    }
                    return msgs;
                  });
                }
                break;
              }
              
              case 'reasoning': {
                setMessages((prev) => {
                  // Check if the last message is also a reasoning message
                  const lastMessage = prev[prev.length - 1];
                  if (lastMessage && lastMessage.type === 'reasoning') {
                    // Append to existing reasoning message
                    const updatedMessages = [...prev];
                    updatedMessages[updatedMessages.length - 1] = {
                      ...lastMessage,
                      content: lastMessage.content + '\n\n' + data.payload.message
                    };
                    return updatedMessages;
                  } else {
                    // Create new reasoning message
                    updateStatus('Thinking...');
                    return [...prev, { 
                      id: Date.now().toString(), 
                      type: 'reasoning', 
                      content: data.payload.message 
                    }];
                  }
                });
                break;
              }
             
              case 'tool_call': {
                let parsedArgs = data.payload.arguments;
                if (typeof parsedArgs === 'string') {
                  try {
                    parsedArgs = JSON.parse(parsedArgs);
                  } catch {
                    // keep as string
                  }
                }
                
                // Create tool group if it doesn't exist
                if (toolGroupIndex.current === null) {
                  createToolGroup();
                  updateStatus('Executing operations...');
                }
                
                // Add tool to the group immediately
                addToolToGroup({
                  name: data.payload.name,
                  args: parsedArgs
                });
                break;
              }
              
              case 'agent_update':
                updateStatus(`Switched to ${data.payload.agent_name}`, true);
                // Note: This would need to be updated to handle full agent objects
                // For now, just update the name in the current agent
                if (agentRef.current) {
                  const updatedAgent = { ...agentRef.current, name: data.payload.agent_name };
                  setCurrentAgent(updatedAgent);
                  agentRef.current = updatedAgent;
                }
                break;
                
              case 'confirmation_request': {
                finalizeToolGroup();
                const { id, command } = data.payload;
                setConfirmations((prev) => [...prev, { id, command }]);
                updateStatus('Confirmation requested', true);
                break;
              }
              
              case 'end':
                finalizeToolGroup();
                setIsBusy(false);
                clearStatus();
                streamingIndex.current = null;
                break;
                
              default:
                break;
            }
          }
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err);
          setMessages((prev) => [...prev, { 
            id: Date.now().toString(), 
            type: 'error', 
            content: 'Invalid message received' 
          }]);
          setIsBusy(false);
          clearStatus();
        }
      };

      socket.onclose = (ev) => {
        console.log('WebSocket closed:', ev.code, ev.reason);
        setIsConnected(false);
        addPacket({ type: 'close', code: ev.code, reason: ev.reason });
        setIsBusy(false);
        clearStatus();
        
        // Handle usage limit reached (4408)
        if (ev.code === 4408) {
          setMessages((prev) => [...prev, {
            id: Date.now().toString(),
            type: 'message',
            content: '**Usage Limit Reached**\n\nYou\'ve reached your current usage limit. To continue using Intelligence, please upgrade your plan for higher limits and priority access.\n\n[Contact your administrator to upgrade your plan](mailto:support@facets.cloud?subject=Intelligence%20Plan%20Upgrade%20Request)'
          }]);
          return; // Don't attempt reconnection for usage limit errors
        }
        
        // Only attempt reconnection if it wasn't a normal closure and we have a session  
        if (ev.code !== 1000 && ev.code !== 1001 && sid && agent) {
          console.log('Attempting reconnection due to unexpected close:', ev.code);
          attemptReconnect(sid, agent);
        } else {
          console.log('Not attempting reconnection - normal closure or missing session/agent');
        }
      };
      
      socket.onerror = (err) => {
        console.error('WebSocket error:', err);
        setIsConnected(false);
        setMessages((prev) => [...prev, { 
          id: Date.now().toString(), 
          type: 'error', 
          content: 'WebSocket connection error' 
        }]);
        setIsBusy(false);
        clearStatus();
      };
    } catch (err) {
      console.error('Failed to create WebSocket connection:', err);
      setIsConnected(false);
      setMessages((prev) => [...prev, { 
        id: Date.now().toString(), 
        type: 'error', 
        content: 'Failed to establish connection' 
      }]);
      setIsBusy(false);
      clearStatus();
    }
  };

  const sendMessage = (text: string) => {
    if (!currentAgent || !sessionId) {
      console.warn('Cannot send message: missing agent or session');
      return;
    }
    
    // Mark that the first message has been sent
    setHasSentFirstMessage(true);
    
    // Reset streaming and tool group indices for new conversation
    streamingIndex.current = null;
    toolGroupIndex.current = null;
    
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
      console.log('Creating new WebSocket connection');
      connectWebSocket(sessionId, currentAgent, text);
    } else {
      console.log('Using existing WebSocket connection');
      const packet = { type: 'message', payload: { message: text } };
      ws.current.send(JSON.stringify(packet));
      addPacket({ ...packet, summary: 'send' });
      setMessages((prev) => [...prev, { 
        id: Date.now().toString(), 
        type: 'user', 
        content: text 
      }]);
      setIsBusy(true);
      updateStatus('Thinking...');
    }
  };

  return { 
    currentAgent, 
    sessionId, 
    messages, 
    packets, 
    confirmations, 
    status, 
    isBusy,
    isConnected,
    reconnectAttempts,
    hasSentFirstMessage,
    respondConfirmation, 
    selectAgent, 
    sendMessage 
  };
}