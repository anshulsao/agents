import React from 'react';
import { marked } from 'marked';
import { Bot, AlertTriangle, Wrench, Info, Copy, Check, ChevronDown, ChevronRight, Terminal, Brain, Clock } from 'lucide-react';
import type { Message as MessageType } from '../hooks/useChatSession';

interface MessageProps {
  message: MessageType;
  agentName: string | null;
}

const Message: React.FC<MessageProps> = ({ message, agentName }) => {
  const { type, content, name, args, tools, summary, agentName: messageAgentName } = message;
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
        <div className="w-full">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            <Wrench className="h-3 w-3" />
            <span>{name}</span>
            {isExpanded ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
          </button>
          
          {isExpanded && (
            <div className="mt-2 pl-4 border-l border-border">
              <pre className="text-xs text-text-tertiary font-mono bg-background-secondary p-2 rounded overflow-x-auto">
                {argsString}
              </pre>
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
    if (isBot) return <Bot className="h-3 w-3 text-text-tertiary" />;
    if (isError) return <AlertTriangle className="h-3 w-3 text-error" />;
    if (isTool || isToolGroup) return <Terminal className="h-3 w-3 text-text-tertiary" />;
    if (isReasoning) return <Brain className="h-3 w-3 text-text-tertiary" />;
    if (isSystem) return <Info className="h-3 w-3 text-text-tertiary" />;
    return <Bot className="h-3 w-3 text-text-tertiary" />;
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
      <div className="flex justify-start w-full">
        <div className="w-full max-w-4xl relative group">
          <div className="border-l-2 border-accent/30 pl-3">
            <div className="flex gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <Terminal className="h-3 w-3 text-text-tertiary" />
              </div>
              
              <div className="flex-1 min-w-0">
                {/* Collapsible Header */}
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
                >
                  <span>
                    {toolCount > 0 ? tools.map(tool => tool.name).join(' • ') : 'Executing'}
                  </span>
                  <span className="text-xs text-text-muted">
                    ({toolCount} operation{toolCount > 1 ? 's' : ''})
                  </span>
                  {isExpanded ? (
                    <ChevronDown className="h-3 w-3" />
                  ) : (
                    <ChevronRight className="h-3 w-3" />
                  )}
                </button>
                
                {/* Expandable Content */}
                {isExpanded && toolCount > 0 && (
                  <div className="mt-2 space-y-2">
                    {tools.map((tool, index) => (
                      <div key={index} className="pl-4 border-l border-border">
                        <div className="text-xs font-medium text-text-secondary mb-1">{tool.name}</div>
                        <pre className="text-xs text-text-tertiary font-mono bg-background-secondary p-2 rounded overflow-x-auto">
                          {JSON.stringify(tool.args, null, 2)}
                        </pre>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Reasoning messages - subtle collapsible sections  
  if (isReasoning && content) {
    // Simple duration calculation based on content length (rough estimate)
    const estimatedSeconds = Math.max(2, Math.min(15, Math.ceil(content.length / 100)));
    
    return (
      <div className="flex justify-start w-full">
        <div className="w-full max-w-4xl relative group">
          <div className="flex-1 min-w-0">
            {/* Collapsible header */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1.5 text-sm text-text-tertiary hover:text-text-secondary transition-colors"
            >
              <span>Thought for {estimatedSeconds} seconds</span>
              {isExpanded ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
            </button>
            
            {/* Expandable Content */}
            {isExpanded && (
              <div className="mt-2 pl-4 border-l border-border">
                <div className="text-sm text-text-secondary leading-relaxed">
                  <div 
                    className="prose prose-invert prose-sm max-w-none prose-p:text-text-secondary prose-li:text-text-secondary"
                    dangerouslySetInnerHTML={{ __html: marked.parse(content) }} 
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Handle reasoning messages that don't have content yet
  if (isReasoning && !content) {
    return (
      <div className="flex justify-start w-full">
        <div className="w-full max-w-4xl relative group">
          <div className="flex items-center gap-2 text-sm text-text-tertiary">
            <span>Thinking</span>
            <div className="flex gap-1">
              <div className="w-1 h-1 bg-text-tertiary rounded-full animate-pulse" />
              <div className="w-1 h-1 bg-text-tertiary rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
              <div className="w-1 h-1 bg-text-tertiary rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // User messages - right aligned bubble with subtle styling
  if (isUser) {
    return (
      <div className="flex justify-end w-full">
        <div className="bg-surface text-text-primary rounded-2xl px-4 py-2.5 max-w-2xl border border-border">
          <div className="text-sm leading-relaxed">
            {renderContent()}
          </div>
        </div>
      </div>
    );
  }

  // Bot and other messages - left aligned with agent name
  return (
    <div className="flex justify-start w-full">
      <div className="max-w-4xl relative group w-full">
        <div className={`${
          isError ? 'border-l-2 border-error pl-3' : 
          isTool || isToolGroup ? 'border-l-2 border-accent/30 pl-3' : 
          ''
        }`}>
          {/* Agent name for bot messages, icon for others */}
          {isBot && (
            <div className="text-sm font-semibold text-text-primary mb-2">
              {messageAgentName || agentName || 'Assistant'}
            </div>
          )}
          {!isBot && (
            <div className="flex gap-3">
              <div className="flex-shrink-0 mt-0.5">
                {getMessageIcon()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm leading-relaxed text-text-primary">
                  {renderContent()}
                </div>
              </div>
            </div>
          )}
          
          {/* Bot message content */}
          {isBot && (
            <div className="text-sm leading-relaxed text-text-primary">
              {renderContent()}
            </div>
          )}
          
          {/* Copy button for bot messages */}
          {isBot && (
            <button
              onClick={() => handleCopy(content)}
              className="opacity-0 group-hover:opacity-100 transition-opacity mt-2 p-1.5 hover:bg-white/5 rounded text-text-tertiary hover:text-text-secondary"
              title="Copy response"
            >
              {copied ? (
                <Check className="h-3 w-3" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Message;