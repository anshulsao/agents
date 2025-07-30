import React from 'react';
import { Upload, Lock } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import type { StartingPrompt, AgentDetail } from '../hooks/useAgents';

interface StartingPromptsProps {
  agent: AgentDetail;
  onPromptSelect: (prompt: string) => void;
  kubeReady: boolean;
}

const StartingPrompts: React.FC<StartingPromptsProps> = ({ agent, onPromptSelect, kubeReady }) => {
  if (!agent.starting_prompts || agent.starting_prompts.length === 0) {
    return null;
  }

  return (
    <TooltipProvider>
      <div className="w-full max-w-5xl mx-auto">
        <div className="mb-6 text-center">
          <h3 className="text-lg font-semibold text-text-primary mb-2">
            Quick Start with {agent.name}
          </h3>
          <p className="text-text-tertiary text-sm max-w-md mx-auto leading-relaxed">
            {kubeReady 
              ? "Choose a starting prompt to begin your conversation"
              : "Upload your kubeconfig to unlock these conversation starters"
            }
          </p>
        </div>

        {!kubeReady && (
          <div className="mb-4 p-3 bg-warning/10 border border-warning/20 rounded-lg text-center">
            <span className="text-sm font-medium text-warning block mb-1">Kubeconfig Required</span>
            <p className="text-xs text-text-tertiary">
              These prompts require cluster access. Please upload your kubeconfig first.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
          {agent.starting_prompts.map((prompt, index) => (
            <Tooltip key={index}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => kubeReady && onPromptSelect(prompt.prompt)}
                  disabled={!kubeReady}
                  className={`group relative overflow-hidden rounded-lg p-3 text-left transition-all duration-200 w-full ${
                    kubeReady
                      ? 'bg-surface hover:bg-surface-hover border border-border hover:border-accent/50 cursor-pointer'
                      : 'bg-surface/50 border border-border/30 cursor-not-allowed opacity-50'
                  }`}
                >
                  <div className="relative">
                    <h4 className={`font-medium text-sm mb-1 transition-colors duration-200 ${
                      kubeReady 
                        ? 'text-text-primary' 
                        : 'text-text-muted'
                    }`}>
                      {prompt.title}
                    </h4>
                    
                    <p className={`text-xs leading-relaxed transition-colors duration-200 truncate ${
                      kubeReady 
                        ? 'text-text-secondary group-hover:text-text-primary' 
                        : 'text-text-muted'
                    }`}>
                      {prompt.prompt}
                    </p>
                  </div>
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-sm">
                <p className="text-xs leading-relaxed">{prompt.prompt}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      
        <div className="mt-4 text-center">
          <p className="text-xs text-text-muted">
            {kubeReady 
              ? "Or type your own message below to start a custom conversation"
              : "Upload your kubeconfig to start chatting"
            }
          </p>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default StartingPrompts;