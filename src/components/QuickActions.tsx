import React from 'react';
import { Plus, Terminal, FileText, Zap, Download } from 'lucide-react';

interface QuickAction {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  description: string;
  onClick: () => void;
  primary?: boolean;
}

interface QuickActionsProps {
  onAction?: (actionId: string) => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({ onAction }) => {
  const actions: QuickAction[] = [
    {
      id: 'deploy',
      label: 'Deploy Application',
      icon: Plus,
      description: 'Deploy a new application to your cluster',
      onClick: () => onAction?.('deploy'),
      primary: true
    },
    {
      id: 'terminal',
      label: 'Open Terminal',
      icon: Terminal,
      description: 'Access cluster via kubectl terminal',
      onClick: () => onAction?.('terminal')
    },
    {
      id: 'logs',
      label: 'View Logs',
      icon: FileText,
      description: 'Check application and system logs',
      onClick: () => onAction?.('logs')
    },
    {
      id: 'troubleshoot',
      label: 'Troubleshoot',
      icon: Zap,
      description: 'Run diagnostic checks on your cluster',
      onClick: () => onAction?.('troubleshoot')
    },
    {
      id: 'export',
      label: 'Export Config',
      icon: Download,
      description: 'Download cluster configuration',
      onClick: () => onAction?.('export')
    }
  ];

  return (
    <div className="bg-surface rounded-xl border border-border p-6">
      <h3 className="text-lg font-semibold text-text-primary mb-4">Quick Actions</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={action.onClick}
            className={`p-4 rounded-lg border text-left transition-all duration-200 hover:shadow-soft group ${
              action.primary
                ? 'bg-accent text-white border-accent hover:bg-accent-hover'
                : 'bg-background border-border hover:border-accent/50 hover:bg-surface-hover'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${
                action.primary
                  ? 'bg-white/20'
                  : 'bg-accent/10 group-hover:bg-accent/20'
              }`}>
                <action.icon className={`h-4 w-4 ${
                  action.primary ? 'text-white' : 'text-accent'
                }`} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className={`font-medium text-sm mb-1 ${
                  action.primary ? 'text-white' : 'text-text-primary'
                }`}>
                  {action.label}
                </h4>
                <p className={`text-xs leading-relaxed ${
                  action.primary ? 'text-white/80' : 'text-text-tertiary'
                }`}>
                  {action.description}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;