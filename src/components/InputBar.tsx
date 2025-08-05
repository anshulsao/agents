import React, { useState, KeyboardEvent, useRef, useEffect, forwardRef } from 'react';
import { Send } from 'lucide-react';

interface InputBarProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  sendButtonDisabled?: boolean;
  placeholder?: string;
}

const InputBar = forwardRef<HTMLTextAreaElement, InputBarProps>(({ 
  onSend, 
  disabled = false, 
  sendButtonDisabled = false,
  placeholder = "Type your message..." 
}, ref) => {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Merge external ref with internal ref
  React.useImperativeHandle(ref, () => textareaRef.current!);
  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const scrollHeight = textarea.scrollHeight;
      const maxHeight = 300; // Approximately 12 lines (tripled from 100px)
      textarea.style.height = Math.min(scrollHeight, maxHeight) + 'px';
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [text]);

  const send = () => {
    const msg = text.trim();
    if (msg && !disabled && !sendButtonDisabled) {
      onSend(msg);
      setText('');
      
      // Maintain focus on the textarea after sending
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
        }
      }, 0);
    }
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="flex gap-3 items-end">
      <div className="flex-1 relative">
        <textarea
          ref={textareaRef}
          disabled={disabled}
          className="w-full resize-none bg-surface border border-border rounded-xl px-4 py-3 pr-12 text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm leading-6"
          placeholder={placeholder}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKeyDown}
          rows={3}
          style={{
            minHeight: '96px', // Triple the original height (32px * 3)
            maxHeight: '300px',
            overflowY: text.length > 200 ? 'auto' : 'hidden'
          }}
        />
        
        <button
          disabled={disabled || !text.trim() || sendButtonDisabled}
          className="absolute right-3 bottom-3 p-2.5 bg-accent hover:bg-accent-hover disabled:bg-surface disabled:text-text-muted text-white rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent/50 disabled:cursor-not-allowed disabled:hover:bg-surface"
          onClick={send}
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
});

InputBar.displayName = 'InputBar';

export default InputBar;