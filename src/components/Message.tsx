import React from 'react';
import { marked } from 'marked';
import { Bot, AlertTriangle, Wrench, Info, Copy, Check, ChevronDown, ChevronRight, Terminal, Brain, Clock } from 'lucide-react';
import type { Message as MessageType } from '../hooks/useChatSession';

interface MessageProps {
  message: MessageType;
  agentName: string | null;
}

const Message: React.FC<MessageProps> = ({ message, agentName }) => {
  const { type, content, name, args, tools, summary } = message;
  const [copied, setCopied] = React.useState(false);
  const [isExpanded, setIsExpanded] = React.useState(false); // Default collapsed
  
  const isBot = type === 'message';
  const isUser = type === 'user';
  const isError = type === 'error';
  const isTool = type === 'tool_call';
  const isToolGroup = type === 'tool_calls_group';
  const isReasoning = type === 'reasoning';
  const isSystem = type === 'system' || type === 'agent_update' || type === 'end';

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const renderContent = () => {
    if (isBot) {
      const html = marked.parse(content);
      return (
        <div 
          className="prose prose-invert prose-sm max-w-none prose-pre:bg-background-tertiary prose-pre:border prose-pre:border-border prose-code:text-accent prose-a:text-accent hover:prose-a:text-accent-light prose-p:text-text-primary prose-li:text-text-primary prose-strong:text-text-primary"
          dangerouslySetInnerHTML={{ __html: html }} 
        />
      );
    }

    if (isTool && name && args !== undefined) {
      const argsString = JSON.stringify(args, null, 2);
      return (
        <div className="w-full space-y-3">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 w-full text-left group hover:bg-white/5 rounded-lg p-2 -m-2 transition-colors"
          >
            <div className="flex items-center gap-2 flex-1">
              <Wrench className="h-4 w-4 text-accent" />
              <span className="font-medium text-accent group-hover:text-accent-light transition-colors text-sm">
                {name}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-text-muted bg-background-tertiary px-2 py-1 rounded">
                Tool Call
              </span>
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-text-tertiary" />
              ) : (
                <ChevronRight className="h-4 w-4 text-text-tertiary" />
              )}
            </div>
          </button>
          
          {isExpanded && (
            <div className="relative animate-slide-down w-full">
              <div className="bg-background-tertiary border border-border rounded-xl overflow-hidden w-full">
                <div className="flex items-center justify-between p-3 border-b border-border/50 bg-background/50">
                  <span className="text-sm font-medium text-text-secondary">Arguments</span>
                </div>
                <pre className="p-4 text-sm text-text-secondary overflow-x-auto font-mono leading-relaxed w-full">
                  {argsString}
                </pre>
              </div>
            </div>
          )}
        </div>
      );
    }
    
    return (
      <div className="whitespace-pre-wrap text-sm leading-relaxed">
        {content}
      </div>
    );
  };

  const getMessageIcon = () => {
    if (isBot) return <Bot className="h-4 w-4" />;
    if (isError) return <AlertTriangle className="h-4 w-4" />;
    if (isTool || isToolGroup) return <Terminal className="h-4 w-4" />;
    if (isReasoning) return <Brain className="h-4 w-4" />;
    if (isSystem) return <Info className="h-4 w-4" />;
    return <Bot className="h-4 w-4" />;
  };

  const getMessageLabel = () => {
    if (isBot) return agentName || 'Assistant';
    if (isError) return 'Error';
    if (isTool || isToolGroup) return 'Operations';
    if (isReasoning) return 'Thinking';
    if (isSystem) return 'System';
    return 'Assistant';
  };

  // Special rendering for tool groups - no double nesting
  if (isToolGroup && tools && tools.length > 0) {
    const toolCount = tools.length;
    
    return (
      <div className="flex justify-start animate-slide-up w-full">
        <div className="w-full max-w-none relative group">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1 rounded-lg bg-accent/20">
              <Terminal className="h-4 w-4" />
            </div>
            <span className="font-medium text-sm">Operations</span>
          </div>
          
          <div className="w-full bg-accent/5 rounded-xl overflow-hidden">
            {/* Collapsible Header */}
            <div 
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center justify-between p-3 cursor-pointer hover:bg-accent/10 transition-all duration-200 group w-full"
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-accent">
                    {toolCount > 0 ? tools.map(tool => tool.name).join(' • ') : 'Executing'}
                  </span>
                </div>
                {toolCount > 0 && (
                  <div className="text-xs text-text-muted">
                    {toolCount} operation{toolCount > 1 ? 's' : ''}
                  </div>
                )}
              </div>
              
              <div className="text-text-tertiary">
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </div>
            </div>
            
            {/* Expandable Content - Individual Operations */}
            {isExpanded && toolCount > 0 && (
              <div className="border-t border-accent/20">
                {tools.map((tool, index) => (
                  <div key={index} className="border-b border-accent/10 last:border-b-0">
                    <div className="p-3 bg-background/30">
                      <div className="flex items-center gap-2 mb-2">
                        <Wrench className="h-3.5 w-3.5 text-accent" />
                        <span className="text-sm font-medium text-text-primary">{tool.name}</span>
                      </div>
                      <pre className="text-xs text-text-secondary font-mono leading-relaxed bg-background-tertiary p-2 rounded border border-border overflow-x-auto">
                        {JSON.stringify(tool.args, null, 2)}
                      </pre>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Reasoning messages - collapsible thinking sections  
  if (isReasoning && content) {
    return (
      <div className="flex justify-start animate-slide-up w-full">
        <div className="w-full max-w-4xl relative group">
          {/* Simple header with icon and arrow */}
          <div 
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 mb-2 cursor-pointer hover:opacity-80 transition-opacity text-white"
          >
            <div className="p-1 rounded-lg bg-white/10">
              <Brain className="h-4 w-4 text-white" />
            </div>
            <span className="font-medium text-sm">Thinking</span>
            <div className="text-text-tertiary ml-1">
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </div>
          </div>
          
          {/* Expandable Content */}
          {isExpanded && (
            <div className="w-full bg-accent/5 rounded-xl overflow-hidden border border-accent/20 animate-slide-down">
              <div className="p-4 space-y-3">
                <div className="text-sm leading-relaxed">
                  <div 
                    className="prose prose-invert prose-sm max-w-none prose-pre:bg-background-tertiary prose-pre:border prose-pre:border-border prose-code:text-accent prose-a:text-accent hover:prose-a:text-accent-light prose-p:text-text-primary prose-li:text-text-primary prose-strong:text-text-primary prose-ul:text-text-primary prose-ol:text-text-primary"
                    dangerouslySetInnerHTML={{ __html: marked.parse(content) }} 
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Handle reasoning messages that don't have content yet
  if (isReasoning && !content) {
    return (
      <div className="flex justify-start animate-slide-up w-full">
        <div className="w-full max-w-4xl relative group">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1 rounded-lg bg-accent/20">
              <Brain className="h-4 w-4 text-accent" />
            </div>
            <span className="font-medium text-sm text-accent">Thinking</span>
          </div>
          
          <div className="w-full bg-accent/5 rounded-xl p-3 border border-accent/20">
            <div className="flex items-center gap-2 text-sm text-accent">
              <div className="w-1 h-1 bg-accent rounded-full animate-pulse" />
              <div className="w-1 h-1 bg-accent rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
              <div className="w-1 h-1 bg-accent rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
              <span className="ml-2">Processing thoughts...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // User messages - right aligned, no label, no icon, grey background
  if (isUser) {
    return (
      <div className="flex justify-end animate-slide-up w-full">
        <div className="bg-surface text-text-primary rounded-2xl px-4 py-3 max-w-2xl relative group">
          <div className="text-sm leading-relaxed">
            {renderContent()}
          </div>
        </div>
      </div>
    );
  }

  // Bot and other messages - left aligned with label and icon, no background
  return (
    <div className="flex justify-start animate-slide-up w-full">
      <div className="max-w-4xl relative group">
        <div className="flex items-center gap-2 mb-2">
          <div className={`p-1 rounded-lg ${
            isError ? 'bg-error/20' : 
            isTool || isToolGroup ? 'bg-accent/20' : 
            isReasoning ? 'bg-accent/20' :
            'bg-accent/20'
          }`}>
            {getMessageIcon()}
          </div>
          <span className="font-medium text-sm">
            {getMessageLabel()}
          </span>
          {/* Only show copy button for bot responses */}
          {isBot && (
            <button
              onClick={() => handleCopy(content)}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/10 rounded"
              title="Copy response"
            >
              {copied ? (
                <Check className="h-3 w-3 text-success" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </button>
          )}
        </div>
        <div className={`px-4 py-3 text-sm leading-relaxed w-full ${
          isError ? 'bg-error/10 text-error-light rounded-2xl' : 'text-text-primary'
        }`}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Message;