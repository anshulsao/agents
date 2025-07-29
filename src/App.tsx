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
import { getClusterInfo, type ClusterInfo } from './api/api';

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

  const [clusterInfo, setClusterInfo] = useState<ClusterInfo>({ name: '', connected: false });
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
          const info = await getClusterInfo(sessionId);
          if (!canceled) setClusterInfo(info);
        } catch {
          if (!canceled) setClusterInfo({ name: '', connected: false });
        }
      } else {
        setClusterInfo({ name: '', connected: false });
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
    // Trigger a status check to get the cluster name
    if (sessionId) {
      getClusterInfo(sessionId).then(info => {
        setClusterInfo(info);
      }).catch(() => {
        setClusterInfo({ name: '', connected: false });
      });
    }
  };

  const handleReset = () => {
    setClusterInfo({ name: '', connected: false });
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <div className="h-screen flex flex-col bg-background text-text-primary font-sans overflow-hidden">
      {/* Mobile-Optimized Header */}
      <header className="glass-effect border-b border-border/50 px-3 sm:px-4 py-2 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <div className="p-1 bg-accent/10 rounded-lg">
              <img 
                src="./6583f506bcc4b0a0f183dfe8_Group 7202.svg" 
                alt="Intelligence Logo" 
                className="h-3 w-4 sm:h-4 sm:w-5"
              />
            </div>
            <h1 className="text-sm sm:text-base font-semibold text-gradient hidden xs:block">Intelligence</h1>
          </div>
          
          <div className="h-4 sm:h-5 w-px bg-border hidden xs:block" />
          
          <div className="min-w-0 flex-1 sm:flex-none">
            <AgentSelector
              agents={agents}
              loading={agentsLoading}
              selected={currentAgent}
              onChange={selectAgent}
            />
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          {sessionId && (
            <button
              onClick={openModal}
              className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-200 whitespace-nowrap ${
                clusterInfo.connected
                  ? 'bg-success/10 text-success border border-success/20 hover:bg-success/20'
                  : 'bg-warning/10 text-warning border border-warning/20 hover:bg-warning/20'
              }`}
            >
              {clusterInfo.connected ? (
                <CheckCircle2 className="h-3 w-3" />
              ) : (
                <Upload className="h-3 w-3" />
              )}
              <span className="hidden sm:inline">
                {clusterInfo.connected ? `Connected to ${clusterInfo.name}` : 'Upload Config'}
              </span>
              <span className="sm:hidden">
                {clusterInfo.connected ? 'Connected' : 'Upload'}
              </span>
            </button>
          )}
        </div>

        {sessionId && (
          <KubeconfigModal
            sessionId={sessionId}
            isOpen={isModalOpen}
            onClose={closeModal}
            isReady={clusterInfo.connected}
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
          kubeReady={clusterInfo.connected}
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
              disabled={isBusy || !clusterInfo.connected} 
              placeholder={
                !clusterInfo.connected 
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