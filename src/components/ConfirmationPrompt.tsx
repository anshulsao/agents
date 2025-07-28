import React from 'react';
import { AlertTriangle, Check, X } from 'lucide-react';

interface Confirmation {
  id: string;
  command: string;
}

interface ConfirmationPromptProps {
  confirmation: Confirmation;
  onRespond: (id: string, confirmed: boolean) => void;
}

const ConfirmationPrompt: React.FC<ConfirmationPromptProps> = ({ confirmation, onRespond }) => {
  const { id, command } = confirmation;

  return (
    <div className="animate-slide-up">
      <div className="bg-warning/10 rounded-2xl p-6 max-w-2xl">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-warning/20 rounded-xl">
            <AlertTriangle className="h-5 w-5 text-warning" />
          </div>
          
          <div className="flex-1 space-y-4">
            <div>
              <h3 className="font-semibold text-text-primary mb-2 text-sm">
                Confirmation Required
              </h3>
              <p className="text-text-secondary text-sm mb-3">
                The following command requires your approval before execution:
              </p>
            </div>
            
            <div className="bg-background-tertiary rounded-xl p-4">
              <pre className="text-sm text-text-primary font-mono whitespace-pre-wrap break-all">
                {command}
              </pre>
            </div>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => onRespond(id, false)}
                className="flex items-center gap-2 px-4 py-2 bg-surface hover:bg-surface-hover text-text-primary rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-border-accent/50 text-sm"
              >
                <X className="h-4 w-4" />
                Deny
              </button>
              <button
                onClick={() => onRespond(id, true)}
                className="flex items-center gap-2 button-primary text-sm"
              >
                <Check className="h-4 w-4" />
                Approve
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationPrompt;