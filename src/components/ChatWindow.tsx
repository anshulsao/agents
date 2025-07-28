import React, { useEffect, useRef } from 'react';
import { MessageSquare } from 'lucide-react';
import Message from './Message';
import ConfirmationPrompt from './ConfirmationPrompt';
import type { Message as MessageType } from '../hooks/useChatSession';

interface ChatWindowProps {
  messages: MessageType[];
  confirmations: { id: string; command: string }[];
  onRespond: (id: string, confirmed: boolean) => void;
  currentAgent: string | null;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ messages, confirmations, onRespond, currentAgent }) => {
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
              <div className="text-center max-w-md mx-auto">
                <div className="p-4 bg-accent/10 rounded-2xl w-fit mx-auto mb-4">
                  <MessageSquare className="h-8 w-8 text-accent" />
                </div>
                <h3 className="text-xl font-semibold text-text-primary mb-2">
                  Welcome to Intelligence
                </h3>
                <p className="text-text-tertiary leading-relaxed">
                  Start a conversation with your AI assistant. Ask questions about your Kubernetes cluster, 
                  get help with deployments, or explore cluster resources.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6 w-full">
              {messages.map((msg) => (
                <Message key={msg.id} message={msg} agentName={currentAgent} />
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