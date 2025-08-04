import React from 'react';
import { Menu, Upload, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import UsageTracker from './UsageTracker';
import MobileMenu from './MobileMenu';
import KubeconfigModal from './KubeconfigModal';
import type { AgentDetail } from '../hooks/useAgents';
import type { ClusterInfo } from '../api/api';

interface HeaderProps {
  // Navigation
  showBackButton?: boolean;
  backTo?: string;
  
  // Agent selection (only for main app)
  agents?: AgentDetail[];
  agentsLoading?: boolean;
  currentAgent?: AgentDetail | null;
  onAgentChange?: (agent: AgentDetail) => void;
  
  // Kubeconfig (only for main app)
  sessionId?: string | null;
  clusterInfo?: ClusterInfo;
  showKubeConfig?: boolean;
  onConfigClick?: () => void;
  
  // Mobile menu
  isMobileMenuOpen?: boolean;
  onMobileMenuOpen?: () => void;
  onMobileMenuClose?: () => void;
  
  // Kubeconfig modal
  isModalOpen?: boolean;
  onModalClose?: () => void;
  onReady?: () => void;
  onReset?: () => void;
}

const Header: React.FC<HeaderProps> = ({
  showBackButton = false,
  backTo = "/",
  agents = [],
  agentsLoading = false,
  currentAgent = null,
  onAgentChange,
  sessionId = null,
  clusterInfo = { name: '', connected: false },
  showKubeConfig = false,
  onConfigClick,
  isMobileMenuOpen = false,
  onMobileMenuOpen,
  onMobileMenuClose,
  isModalOpen = false,
  onModalClose,
  onReady,
  onReset
}) => {
  return (
    <>
      <header className="glass-effect border-b border-border/50 px-4 py-3 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {showBackButton && (
            <Link 
              to={backTo}
              className="p-2 hover:bg-surface-hover rounded-lg transition-colors"
            >
              <svg className="h-5 w-5 text-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
          )}
          
          <div className="flex items-center gap-2">
            <div className="p-1 bg-accent/10 rounded-lg">
              <img 
                src="/fi.svg" 
                alt="Fi Icon" 
                className="h-4 w-5 filter brightness-0 invert" 
              />
            </div>
            <h1 className="text-base font-semibold text-gradient hidden sm:block">Intelligence</h1>
          </div>
          
          <div className="h-5 w-px bg-border hidden sm:block" />
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Mobile Menu Button */}
          <button
            onClick={onMobileMenuOpen}
            className="sm:hidden p-2 hover:bg-surface-hover rounded-lg transition-colors"
          >
            <Menu className="h-5 w-5 text-text-tertiary" />
          </button>

          {/* Usage Tracker - Desktop */}
          <div className="hidden sm:block">
            <UsageTracker />
          </div>

          {/* Desktop Cluster Status */}
          {sessionId && showKubeConfig && (
            <button
              onClick={onConfigClick}
              className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all duration-200 whitespace-nowrap ${
                clusterInfo.connected
                  ? 'bg-success/10 text-success border-success/20 hover:bg-success/20'
                  : 'bg-warning/10 text-warning border-warning/20 hover:bg-warning/20'
              }`}
            >
              {clusterInfo.connected ? (
                <CheckCircle2 className="h-3 w-3" />
              ) : (
                <Upload className="h-3 w-3" />
              )}
              <span>
                {clusterInfo.connected ? `Connected to ${clusterInfo.name}` : 'Upload Config'}
              </span>
            </button>
          )}
        </div>
      </header>

      {/* Mobile Menu */}
      {onMobileMenuClose && (
        <MobileMenu
          isOpen={isMobileMenuOpen}
          onClose={onMobileMenuClose}
          agents={agents}
          agentsLoading={agentsLoading}
          currentAgent={currentAgent}
          onAgentChange={onAgentChange || (() => {})}
          clusterInfo={clusterInfo}
          onConfigClick={onConfigClick || (() => {})}
          showKubeConfig={showKubeConfig}
        />
      )}

      {/* Kubeconfig Modal */}
      {sessionId && onModalClose && onReady && onReset && (
        <KubeconfigModal
          sessionId={sessionId}
          isOpen={isModalOpen}
          onClose={onModalClose}
          isReady={clusterInfo.connected}
          onReady={onReady}
          onReset={onReset}
        />
      )}
    </>
  );
};

export default Header;