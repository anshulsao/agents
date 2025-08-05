import React, { useState } from 'react';
import { X, ChevronDown, ChevronRight, Activity, Copy, Check } from 'lucide-react';

interface InspectPanelProps {
  packets: any[];
  onClose: () => void;
}

const InspectPanel: React.FC<InspectPanelProps> = ({ packets, onClose }) => {
  const [expandedPackets, setExpandedPackets] = useState<Set<number>>(new Set());
  const [copied, setCopied] = useState<number | null>(null);

  const togglePacket = (index: number) => {
    const newExpanded = new Set(expandedPackets);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedPackets(newExpanded);
  };

  const handleCopy = async (content: string, index: number) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(index);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="w-88 glass-effect border-l border-border/50 flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-border/50">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-accent" />
          <h3 className="font-semibold text-text-primary">Network Inspector</h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-surface-hover rounded-lg transition-colors"
        >
          <X className="h-4 w-4 text-text-tertiary" />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {packets.length === 0 ? (
          <div className="text-center py-8">
            <Activity className="h-8 w-8 text-text-muted mx-auto mb-3" />
            <p className="text-text-tertiary text-sm">No network activity yet</p>
          </div>
        ) : (
          packets.map((pkt, idx) => {
            const isExpanded = expandedPackets.has(idx);
            const packetContent = JSON.stringify(pkt, null, 2);
            const timestamp = pkt.timestamp ? new Date(pkt.timestamp).toLocaleTimeString() : '';
            
            return (
              <div key={idx} className="bg-surface rounded-xl border border-border overflow-hidden">
                <button
                  onClick={() => togglePacket(idx)}
                  className="w-full p-3 text-left hover:bg-surface-hover transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-text-tertiary" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-text-tertiary" />
                    )}
                    <span className="text-sm font-medium text-text-primary">
                      {pkt.type || `Packet ${idx + 1}`}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {timestamp && (
                      <span className="text-xs text-text-muted">
                        {timestamp}
                      </span>
                    )}
                    <span className="text-xs text-text-muted bg-background-tertiary px-2 py-1 rounded">
                      {pkt.type || 'unknown'}
                    </span>
                  </div>
                </button>
                
                {isExpanded && (
                  <div className="border-t border-border/50 relative">
                    <button
                      onClick={() => handleCopy(packetContent, idx)}
                      className="absolute top-2 right-2 p-1.5 bg-background hover:bg-background-secondary rounded-lg transition-colors z-10"
                    >
                      {copied === idx ? (
                        <Check className="h-3 w-3 text-success" />
                      ) : (
                        <Copy className="h-3 w-3 text-text-tertiary" />
                      )}
                    </button>
                    <pre className="p-4 text-xs text-text-secondary font-mono overflow-x-auto bg-background-tertiary">
                      {packetContent}
                    </pre>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default InspectPanel;