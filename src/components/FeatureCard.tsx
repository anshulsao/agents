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
    <div className={`group bg-[#101117] border border-white/12 rounded-2xl p-6 text-left transition-all duration-300 ${
      isActive 
        ? 'hover:border-accent/30 shadow-[0px_12px_12px_rgba(0,0,0,0.12)] hover:shadow-lg hover:shadow-accent/10' 
        : 'hover:border-white/[0.2] shadow-[0px_12px_12px_rgba(0,0,0,0.12)]'
    } ${className}`}>
      <div className={`p-2 rounded-xl w-fit mb-3 ${
        isActive ? 'bg-accent/20' : 'bg-text-muted/20'
      }`}>
        <Icon className={`h-5 w-5 ${
          isActive ? 'text-accent' : 'text-text-muted'
        }`} />
      </div>
      
      <h3 className="text-base font-medium text-[#F7F8F8] mb-2 leading-6">
        {title}
      </h3>
      
      <p className="text-[#8A8F98] mb-4 text-sm leading-[140%]">
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