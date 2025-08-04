import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';
import TryNowButton from './TryNowButton';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  isActive?: boolean;
  buttonProps?: {
    to?: string;
    onClick?: () => void;
    disabled?: boolean;
    text?: string;
  };
  className?: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  icon: Icon,
  title,
  description,
  isActive = true,
  buttonProps = {},
  className = ''
}) => {
  const {
    to,
    onClick,
    disabled = false,
    text = disabled ? 'Coming Soon' : 'Try Now'
  } = buttonProps;

  return (
    <div className={`group bg-surface/20 backdrop-blur-xl border border-border/40 rounded-xl p-5 text-left hover:bg-surface/30 transition-all duration-300 ${
      isActive 
        ? 'hover:border-accent/30 hover:shadow-lg hover:shadow-accent/10' 
        : 'hover:border-border-light'
    } ${className}`}>
      <div className="w-12 h-12 bg-white/[0.04] rounded-[10px] flex items-center justify-center mb-3 relative">
        <Icon className="h-6 w-6 text-transparent bg-gradient-to-br from-[#6542BF] to-[#717CE1] bg-clip-text" 
              style={{
                background: 'linear-gradient(135deg, #6542BF 0%, #717CE1 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }} />
      </div>
      
      <h3 className="text-lg font-bold text-text-primary mb-2">
        {title}
      </h3>
      
      <p className="text-text-secondary mb-4 leading-relaxed text-sm">
        {description}
      </p>
      
      {disabled ? (
        <button 
          disabled
          className="inline-flex items-center gap-2 bg-surface/40 text-text-muted font-medium px-3 py-1.5 rounded-lg cursor-not-allowed opacity-60 text-xs border border-border/30"
        >
          <Icon className="h-3 w-3" />
          {text}
        </button>
      ) : (
        <TryNowButton
          to={to}
          onClick={onClick}
        />
      )}
    </div>
  );
};

export default FeatureCard;