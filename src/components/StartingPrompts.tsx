import React from 'react';
import { MessageSquare, Zap, ArrowRight } from 'lucide-react';
import type { StartingPrompt, AgentDetail } from '../hooks/useAgents';

interface StartingPromptsProps {
  agent: AgentDetail;
  onPromptSelect: (prompt: string) => void;
}

const StartingPrompts: React.FC<StartingPromptsProps> = ({ agent, onPromptSelect }) => {
  if (!agent.starting_prompts || agent.starting_prompts.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="mb-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Zap className="h-5 w-5 text-accent" />
          <h3 className="text-lg font-semibold text-text-primary">
            Quick Start with {agent.name}
          </h3>
        </div>
        <p className="text-text-tertiary text-sm">
          Choose a starting prompt to begin your conversation
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {agent.starting_prompts.map((prompt, index) => (
          <button
            key={index}
            onClick={() => onPromptSelect(prompt.prompt)}
            className="group relative bg-surface hover:bg-surface-hover border border-border hover:border-accent/50 rounded-xl p-4 text-left transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 bg-accent/10 rounded-lg group-hover:bg-accent/20 transition-colors">
                <MessageSquare className="h-4 w-4 text-accent" />
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-text-primary mb-2 group-hover:text-accent transition-colors">
                  {prompt.title}
                </h4>
                <p className="text-sm text-text-secondary leading-relaxed line-clamp-3">
                  {prompt.prompt}
                </p>
              </div>
              
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowRight className="h-4 w-4 text-accent" />
              </div>
            </div>
            
            {/* Subtle gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl pointer-events-none" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default StartingPrompts;