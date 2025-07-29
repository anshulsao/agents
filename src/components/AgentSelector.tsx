import React from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { ChevronsUpDownIcon as ChevronUpDownIcon, CheckIcon, Bot, Loader2 } from 'lucide-react';
import type { AgentDetail } from '../hooks/useAgents';

interface AgentSelectorProps {
  agents: AgentDetail[];
  loading: boolean;
  selected: AgentDetail | null;
  onChange: (agent: AgentDetail) => void;
}

const AgentSelector: React.FC<AgentSelectorProps> = ({ agents, loading, selected, onChange }) => {
  return (
    <div className="w-full text-sm">
      <Listbox value={selected} onChange={onChange} disabled={loading}>
        <div className="relative">
          <Listbox.Button className="relative w-full cursor-pointer rounded-lg bg-surface hover:bg-surface-hover border border-border py-2 pl-2.5 pr-7 text-left text-text-primary transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent disabled:opacity-50 min-w-0">
            <div className="flex items-center gap-1.5">
              {loading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-text-tertiary" />
              ) : (
                <Bot className="h-3.5 w-3.5 text-accent" />
              )}
              <span className="block truncate text-xs font-medium min-w-0">
                {loading ? 'Loading agents...' : selected?.name || 'Select Agent'}
              </span>
            </div>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronUpDownIcon className="h-3.5 w-3.5 text-text-tertiary" aria-hidden="true" />
            </span>
          </Listbox.Button>
          
          <Transition
            as={React.Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute z-50 mt-1 max-h-48 w-full overflow-auto rounded-lg bg-surface border border-border shadow-strong py-0.5 text-sm focus:outline-none">
              {agents.map((agent) => (
                <Listbox.Option
                  key={agent.name}
                  value={agent}
                  className={({ active }) =>
                    `relative cursor-pointer select-none py-1.5 pl-7 pr-3 transition-colors duration-150 ${
                      active ? 'bg-surface-hover text-text-primary' : 'text-text-secondary'
                    }`
                  }
                >
                  {({ selected: isSelected }) => (
                    <>
                      <div className="flex items-center gap-1.5">
                        <Bot className="h-3.5 w-3.5 text-accent" />
                        <span className={`block truncate text-xs ${isSelected ? 'font-semibold text-text-primary' : 'font-normal'}`}>
                          {agent.name}
                        </span>
                      </div>
                      {isSelected && (
                        <span className="absolute inset-y-0 left-0 flex items-center pl-1.5 text-accent">
                          <CheckIcon className="h-3.5 w-3.5" aria-hidden="true" />
                        </span>
                      )}
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
    </div>
  );
};

export default AgentSelector;