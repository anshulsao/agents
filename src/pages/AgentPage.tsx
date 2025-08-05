import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import ChatWindow from '../components/ChatWindow';
import InputBar from '../components/InputBar';
import InspectPanel from '../components/InspectPanel';
import StatusIndicator from '../components/StatusIndicator';
import { useAgents } from '../hooks/useAgents';
import { useChatSession } from '../hooks/useChatSession';
import { getClusterInfo, type ClusterInfo } from '../api/api';

const AgentPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showInspectPanel, setShowInspectPanel] = useState(false);
  const [showKubeConfig, setShowKubeConfig] = useState(false);
  const inputRef = React.useRef<HTMLTextAreaElement>(null);

  // Agent selection based on URL parameter or default to first agent
  useEffect(() => {
    if (!agentsLoading && agents.length > 0) {
      const agentParam = searchParams.get('agent');
      
      if (agentParam) {
        // Try to find agent by name from URL parameter
        const foundAgent = agents.find(agent => agent.name === agentParam);
        if (foundAgent && (!currentAgent || currentAgent.name !== foundAgent.name)) {
          selectAgent(foundAgent);
          setShowKubeConfig(foundAgent.name === 'kubernetes-expert');
        } else if (!foundAgent && (!currentAgent || currentAgent.name !== agents[0].name)) {
          // If agent not found, fall back to first agent and update URL
          selectAgent(agents[0]);
          setShowKubeConfig(agents[0].name === 'kubernetes-expert');
          setSearchParams(prev => {
            const newParams = new URLSearchParams(prev);
            newParams.set('agent', agents[0].name);
            return newParams;
          });
        }
      } else if (!currentAgent) {
        // No agent parameter, select first agent and update URL
        selectAgent(agents[0]);
        setShowKubeConfig(agents[0].name === 'kubernetes-expert');
        setSearchParams(prev => {
          const newParams = new URLSearchParams(prev);
          newParams.set('agent', agents[0].name);
          return newParams;
        });
      }
    }
  }, [agentsLoading, agents, currentAgent, selectAgent, searchParams, setSearchParams]);

  // Handle agent selection and update URL parameter
  const handleAgentChange = (agent: typeof agents[0]) => {
    selectAgent(agent);
    setShowKubeConfig(agent.name === 'kubernetes-expert');
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      newParams.set('agent', agent.name);
      return newParams;
    });
  };

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

  // Add hotkey listener for Cmd+I
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
  const openMobileMenu = () => setIsMobileMenuOpen(true);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <div className="h-screen flex flex-col bg-background text-text-primary font-sans overflow-hidden">
      <Header
        showBackButton={true}
        backTo="/intelligence"
        agents={agents}
        agentsLoading={agentsLoading}
        currentAgent={currentAgent}
        onAgentChange={handleAgentChange}
        sessionId={sessionId}
        clusterInfo={clusterInfo}
        showKubeConfig={showKubeConfig}
        onConfigClick={openModal}
        isMobileMenuOpen={isMobileMenuOpen}
        onMobileMenuOpen={openMobileMenu}
        onMobileMenuClose={closeMobileMenu}
        isModalOpen={isModalOpen}
        onModalClose={closeModal}
        onReady={handleReady}
        onReset={handleReset}
      />

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        <ChatWindow
          messages={messages}
          confirmations={confirmations}
          onRespond={respondConfirmation}
          currentAgent={currentAgent}
          onSendMessage={sendMessage}
          kubeReady={!showKubeConfig || clusterInfo.connected}
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
              disabled={!(!showKubeConfig || clusterInfo.connected)}
              sendButtonDisabled={isBusy}
            />
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AgentPage;