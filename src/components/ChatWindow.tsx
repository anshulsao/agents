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
}

const ChatWindow: React.FC<ChatWindowProps> = ({ messages, confirmations, onRespond, currentAgent, onSendMessage }) => {
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
                  />
                ) : (
                  <div className="text-center max-w-md mx-auto">
                    <div className="p-4 bg-accent/10 rounded-2xl w-fit mx-auto mb-4">
                      <MessageSquare className="h-8 w-8 text-accent" />
                    </div>
                    <h3 className="text-xl font-semibold text-text-primary mb-2">
                      Welcome to Intelligence
                    </h3>
                    <p className="text-text-tertiary leading-relaxed">
                      Select an agent to start your conversation with AI-powered Kubernetes management.
                    </p>
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