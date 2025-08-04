import React, { useEffect, useRef } from 'react';
import { MessageSquare } from 'lucide-react';
import Message from './Message';
import ConfirmationPrompt from './ConfirmationPrompt';
import StartingPrompts from './StartingPrompts';
import type { Message as MessageType } from '../hooks/useChatSession';
import type { AgentDetail } from '../hooks/useAgents';

interface ChatWindowProps {
  messages: MessageType[];
  confirmations: { id: string; command: string }[];
  onRespond: (id: string, confirmed: boolean) => void;
  currentAgent: AgentDetail | null;
  onSendMessage: (message: string) => void;
  kubeReady: boolean;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ messages, confirmations, onRespond, currentAgent, onSendMessage, kubeReady }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages or confirmations
  useEffect(() => {
    const el = containerRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages, confirmations]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto px-6 py-6 flex justify-center"
      >
        <div className="w-full max-w-4xl space-y-6">
          {messages.length === 0 ? (
            <div className="flex-1 flex items-center justify-center min-h-[60vh]">
              <div className="w-full">
                {currentAgent ? (
                  <StartingPrompts 
                    agent={currentAgent} 
                    onPromptSelect={onSendMessage}
                    kubeReady={kubeReady}
                  />
                ) : (
                  <div className="text-center max-w-md mx-auto">
                    <div className="flex flex-col items-center justify-center space-y-4">
                      <div className="relative">
                        <div className="w-12 h-12 border-2 border-accent/20 rounded-full animate-spin">
                          <div className="absolute top-0 left-0 w-12 h-12 border-2 border-transparent border-t-accent rounded-full animate-spin"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-6 w-full">
              {messages.map((msg) => (
                <Message key={msg.id} message={msg} agentName={currentAgent?.name || null} />
              ))}
            </div>
          )}
          
          {confirmations.length > 0 && (
            <div className="space-y-4">
              {confirmations.map((confirmation) => (
                <ConfirmationPrompt 
                  key={confirmation.id}
                  confirmation={confirmation} 
                  onRespond={onRespond} 
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;