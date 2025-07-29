import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, Bot, Upload, CheckCircle2 } from 'lucide-react';
import AgentSelector from './AgentSelector';
import UsageTracker from './UsageTracker';
import type { AgentDetail } from '../hooks/useAgents';
import type { ClusterInfo } from '../api/api';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  agents: AgentDetail[];
  agentsLoading: boolean;
  currentAgent: AgentDetail | null;
  onAgentChange: (agent: AgentDetail) => void;
  clusterInfo: ClusterInfo;
  onConfigClick: () => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  onClose,
  agents,
  agentsLoading,
  currentAgent,
  onAgentChange,
  clusterInfo,
  onConfigClick
}) => {
  const handleConfigClick = () => {
    onConfigClick();
    onClose();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-start justify-center p-4 pt-16">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95 translate-y-4"
              enterTo="opacity-100 scale-100 translate-y-0"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100 translate-y-0"
              leaveTo="opacity-0 scale-95 translate-y-4"
            >
              <Dialog.Panel className="w-full max-w-sm transform overflow-hidden rounded-2xl bg-surface border border-border shadow-strong text-left align-middle transition-all">
                <div className="flex items-center justify-between p-4 border-b border-border/50">
                  <h3 className="text-lg font-semibold text-text-primary">Menu</h3>
                  <button
                    type="button"
                    className="p-2 hover:bg-surface-hover rounded-lg transition-colors"
                    onClick={onClose}
                  >
                    <X className="h-5 w-5 text-text-tertiary" />
                  </button>
                </div>
                
                <div className="p-4 space-y-6">
                  {/* Agent Selection */}
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-3">
                      Select Agent
                    </label>
                    <AgentSelector
                      agents={agents}
                      loading={agentsLoading}
                      selected={currentAgent}
                      onChange={onAgentChange}
                    />
                  </div>

                  {/* Usage Tracker - Mobile */}
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-3">
                      Usage
                    </label>
                    <UsageTracker />
                  </div>

                  {/* Cluster Status */}
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-3">
                      Cluster Connection
                    </label>
                    <button
                      onClick={handleConfigClick}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-200 ${
                        clusterInfo.connected
                          ? 'bg-success/10 border border-success/20 hover:bg-success/20'
                          : 'bg-warning/10 border border-warning/20 hover:bg-warning/20'
                      }`}
                    >
                      {clusterInfo.connected ? (
                        <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0" />
                      ) : (
                        <Upload className="h-5 w-5 text-warning flex-shrink-0" />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className={`font-medium text-sm ${
                          clusterInfo.connected ? 'text-success' : 'text-warning'
                        }`}>
                          {clusterInfo.connected ? 'Connected' : 'Not Connected'}
                        </div>
                        <div className="text-xs text-text-tertiary truncate">
                          {clusterInfo.connected 
                            ? `Cluster: ${clusterInfo.name}` 
                            : 'Upload kubeconfig to connect'
                          }
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default MobileMenu;