import React from 'react';
import { Link } from 'react-router-dom';

interface TryNowButtonProps {
  to?: string;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

const TryNowButton: React.FC<TryNowButtonProps> = ({ 
  to, 
  onClick, 
  disabled = false, 
  className = '' 
}) => {
  const buttonContent = (
    <>
      <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
        <img 
          src="/fi.svg" 
          alt="Fi Icon" 
          className="w-3.5 h-3.5 filter brightness-0 invert" 
        />
      </div>
      Try Now
      
      {/* Shine effect on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div 
          className="absolute -left-10 top-0 w-20 h-full transform -skew-x-12 transition-transform duration-700 group-hover:translate-x-32"
          style={{
            background: 'linear-gradient(74.65deg, rgba(255, 255, 255, 0) 31.83%, rgba(255, 255, 255, 0.5) 37.72%, rgba(255, 255, 255, 0) 45.25%)'
          }}
        />
      </div>
    </>
  );

  const baseClasses = `
    inline-flex items-center justify-center gap-1 px-2.5 py-1 w-[89px] h-8 
    text-white font-semibold text-xs rounded-md transition-all duration-200 
    relative overflow-hidden group
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
    ${className}
  `;

  const gradientStyle = {
    background: 'linear-gradient(92.88deg, #324BA2 9.16%, #5643CC 43.89%, #673FD7 64.72%)'
  };

  if (to && !disabled) {
    return (
      <Link 
        to={to}
        className={baseClasses}
        style={gradientStyle}
      >
        {buttonContent}
      </Link>
    );
  }

  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={baseClasses}
      style={gradientStyle}
    >
      {buttonContent}
    </button>
  );
};

export default TryNowButton;