import React from 'react';
import { MessageSquare, Zap, ArrowRight, Upload, Lock } from 'lucide-react';
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
    <div className="w-full max-w-5xl mx-auto">
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="p-2 bg-gradient-to-br from-accent/20 to-accent/10 rounded-xl">
            <Zap className="h-6 w-6 text-accent" />
          </div>
          <h3 className="text-xl font-semibold text-text-primary">
            Quick Start with {agent.name}
          </h3>
        </div>
        <p className="text-text-tertiary text-sm max-w-md mx-auto leading-relaxed">
          {kubeReady 
            ? "Choose a starting prompt to begin your conversation"
            : "Upload your kubeconfig to unlock these conversation starters"
          }
        </p>
      </div>

      {!kubeReady && (
        <div className="mb-6 p-4 bg-warning/10 border border-warning/20 rounded-xl text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Upload className="h-4 w-4 text-warning" />
            <span className="text-sm font-medium text-warning">Kubeconfig Required</span>
          </div>
          <p className="text-xs text-text-tertiary">
            These prompts require cluster access. Please upload your kubeconfig first.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {agent.starting_prompts.map((prompt, index) => (
          <button
            key={index}
            onClick={() => kubeReady && onPromptSelect(prompt.prompt)}
            disabled={!kubeReady}
            className={`group relative overflow-hidden rounded-2xl p-5 text-left transition-all duration-300 ${
              kubeReady
                ? 'bg-gradient-to-br from-surface/80 to-surface/40 hover:from-surface hover:to-surface/60 border border-border/50 hover:border-accent/30 hover:shadow-glow transform hover:-translate-y-1 cursor-pointer'
                : 'bg-surface/30 border border-border/30 cursor-not-allowed opacity-60'
            }`}
          >
            {/* Background gradient overlay */}
            <div className={`absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-accent/10 opacity-0 transition-opacity duration-300 ${
              kubeReady ? 'group-hover:opacity-100' : ''
            }`} />
            
            {/* Content */}
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2 rounded-xl transition-all duration-300 ${
                  kubeReady 
                    ? 'bg-accent/10 group-hover:bg-accent/20 group-hover:scale-110' 
                    : 'bg-border/20'
                }`}>
                  {kubeReady ? (
                    <MessageSquare className="h-4 w-4 text-accent" />
                  ) : (
                    <Lock className="h-4 w-4 text-text-muted" />
                  )}
                </div>
                
                {kubeReady && (
                  <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                    <ArrowRight className="h-4 w-4 text-accent" />
                  </div>
                )}
              </div>
              
              <h4 className={`font-semibold mb-2 transition-colors duration-300 ${
                kubeReady 
                  ? 'text-text-primary group-hover:text-accent' 
                  : 'text-text-muted'
              }`}>
                {prompt.title}
              </h4>
              
              <p className={`text-sm leading-relaxed line-clamp-3 transition-colors duration-300 ${
                kubeReady 
                  ? 'text-text-secondary group-hover:text-text-primary' 
                  : 'text-text-muted'
              }`}>
                {prompt.prompt}
              </p>
            </div>
            
            {/* Subtle border glow on hover */}
            {kubeReady && (
              <div className="absolute inset-0 rounded-2xl border border-accent/0 group-hover:border-accent/20 transition-all duration-300" />
            )}
          </button>
        ))}
      </div>
      
      {kubeReady && (
        <div className="mt-6 text-center">
          <p className="text-xs text-text-muted">
            Or type your own message below to start a custom conversation
          </p>
        </div>
      )}
    </div>
  );
};

export default StartingPrompts;