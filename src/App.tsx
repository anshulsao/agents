import React, { useEffect, useState } from 'react';
import { Upload, CheckCircle2, AlertCircle } from 'lucide-react';
import AgentSelector from './components/AgentSelector';
import ChatWindow from './components/ChatWindow';
import InputBar from './components/InputBar';
import InspectPanel from './components/InspectPanel';
import StatusIndicator from './components/StatusIndicator';
import KubeconfigModal from './components/KubeconfigModal';
import { useAgents } from './hooks/useAgents';
import { useChatSession } from './hooks/useChatSession';
import { getKubeconfigStatus } from './api/api';

const App: React.FC = () => {
  const { agents, loading: agentsLoading } = useAgents();
  const {
    currentAgent,
    sessionId,
    messages,
    sendMessage,
    packets,
    selectAgent,
    confirmations,
    respondConfirmation,
    status,
    isBusy,
    isConnected,
    reconnectAttempts,
    hasSentFirstMessage,
  } = useChatSession();

  const [kubeReady, setKubeReady] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showInspectPanel, setShowInspectPanel] = useState(false);
  const inputRef = React.useRef<HTMLTextAreaElement>(null);

  // Auto-select first agent
  useEffect(() => {
    if (!agentsLoading && agents.length > 0 && !currentAgent) {
      selectAgent(agents[0]);
    }
  }, [agentsLoading, agents, currentAgent, selectAgent]);

  // Check kubeconfig status on sessionId change
  useEffect(() => {
    let canceled = false;
    const checkStatus = async () => {
      if (sessionId) {
        try {
          const ok = await getKubeconfigStatus(sessionId);
          if (!canceled) setKubeReady(ok);
        } catch {
          if (!canceled) setKubeReady(false);
        }
      } else {
        setKubeReady(false);
      }
    };
    checkStatus();
    return () => {
      canceled = true;
    };
  }, [sessionId]);

  // Restore focus to input when agent finishes responding
  useEffect(() => {
    if (!isBusy && hasSentFirstMessage && inputRef.current) {
      // Small delay to ensure the UI has updated
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
    }
  }, [isBusy, hasSentFirstMessage]);
  // Add hotkey listener for Cmd+Shift+S
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'i') {
        event.preventDefault();
        console.log('Hotkey triggered: Ctrl+I (or Cmd+I)');
        setShowInspectPanel(prev => !prev);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
  const handleReady = () => {
    setKubeReady(true);
  };

  const handleReset = () => {
    setKubeReady(false);
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <div className="h-screen flex flex-col bg-background text-text-primary font-sans overflow-hidden">
      {/* Compact Header */}
      <header className="glass-effect border-b border-border/50 px-4 py-2 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="p-1 bg-accent/10 rounded-lg">
              <img 
                src="./6583f506bcc4b0a0f183dfe8_Group 7202.svg" 
                alt="Intelligence Logo" 
                className="h-4 w-5"
              />
            </div>
            <h1 className="text-base font-semibold text-gradient">Intelligence</h1>
          </div>
          
          <div className="h-5 w-px bg-border" />
          
          <AgentSelector
            agents={agents}
            loading={agentsLoading}
            selected={currentAgent}
            onChange={selectAgent}
          />
        </div>

        <div className="flex items-center gap-2">
          {sessionId && (
            <button
              onClick={openModal}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-200 ${
                kubeReady
                  ? 'bg-success/10 text-success border border-success/20 hover:bg-success/20'
                  : 'bg-warning/10 text-warning border border-warning/20 hover:bg-warning/20'
              }`}
            >
              {kubeReady ? (
                <CheckCircle2 className="h-3 w-3" />
              ) : (
                <Upload className="h-3 w-3" />
              )}
              <span>
                {kubeReady ? 'Config Ready' : 'Upload Config'}
              </span>
            </button>
          )}
        </div>

        {sessionId && (
          <KubeconfigModal
            sessionId={sessionId}
            isOpen={isModalOpen}
            onClose={closeModal}
            isReady={kubeReady}
            onReady={handleReady}
            onReset={handleReset}
          />
        )}
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        <ChatWindow
          messages={messages}
          confirmations={confirmations}
          onRespond={respondConfirmation}
          currentAgent={currentAgent}
          onSendMessage={sendMessage}
          kubeReady={kubeReady}
        />
        
        {showInspectPanel && (
          <InspectPanel 
            packets={packets} 
            onClose={() => setShowInspectPanel(false)}
          />
        )}
      </div>

      {/* Compact Footer */}
      <footer className="px-4 py-2 space-y-1.5 relative z-10">
        <div className="flex justify-center">
          <div className="w-full max-w-4xl space-y-1.5">
            <StatusIndicator 
              status={status} 
              isBusy={isBusy} 
              isConnected={isConnected}
              reconnectAttempts={reconnectAttempts}
              hasSentFirstMessage={hasSentFirstMessage}
            />
            <InputBar 
              ref={inputRef}
              onSend={sendMessage} 
              disabled={isBusy || !kubeReady} 
              placeholder={
                !kubeReady 
                  ? "Please upload kubeconfig to start chatting..." 
                  : "Ask me anything about your Kubernetes cluster..."
              }
            />
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;