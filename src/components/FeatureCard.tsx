import React from 'react';
import { LucideIcon } from 'lucide-react';
import TryNowButton from './TryNowButton';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  buttonType: 'try-now' | 'coming-soon';
  buttonProps?: {
    to?: string;
    onClick?: () => void;
    disabled?: boolean;
  };
  className?: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  icon: Icon,
  title,
  description,
  buttonType,
  buttonProps = {},
  className = ''
}) => {
  return (
    <div className={`
      flex flex-col items-start p-6 gap-6 
      w-full max-w-[462px] h-[264px]
      bg-[#101117] border border-white/12 
      shadow-[0px_12px_12px_rgba(0,0,0,0.12)] 
      rounded-2xl
      ${className}
    `}>
      {/* Featured icon */}
      <div className="
        flex items-center justify-center
        w-12 h-12 
        bg-white/4 
        rounded-[10px]
      ">
        <Icon className="w-6 h-6 text-transparent bg-gradient-to-br from-[#6542BF] to-[#717CE1] bg-clip-text" 
              style={{
                background: 'linear-gradient(135deg, #6542BF 0%, #717CE1 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }} 
        />
      </div>

      {/* Content */}
      <div className="flex flex-col items-start gap-5 w-full flex-1">
        {/* Text and supporting text */}
        <div className="flex flex-col items-start gap-2 w-full">
          {/* Title */}
          <h3 className="
            w-full h-6
            font-medium text-base leading-6 
            flex items-center
            tracking-[-0.256px]
            text-[#F7F8F8]
          ">
            {title}
          </h3>
          
          {/* Description */}
          <p className="
            w-full
            font-normal text-sm leading-[140%]
            flex items-center
            text-[#8A8F98]
          ">
            {description}
          </p>
        </div>

        {/* Button */}
        <div className="flex-none">
          {buttonType === 'try-now' ? (
            <TryNowButton {...buttonProps} />
          ) : (
            <button 
              disabled
              className="
                inline-flex items-center justify-center gap-1 
                px-2.5 py-1 w-[89px] h-8 
                text-white/60 font-semibold text-xs 
                bg-white/10 border border-white/20 
                rounded-md cursor-not-allowed
              "
            >
              Coming Soon
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeatureCard;