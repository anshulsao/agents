import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  onNavigate?: (href: string) => void;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, onNavigate }) => {
  const handleClick = (href?: string) => {
    if (href && onNavigate) {
      onNavigate(href);
    }
  };

  return (
    <nav className="flex items-center space-x-2 text-sm text-text-secondary mb-6">
      <button
        onClick={() => handleClick('/')}
        className="flex items-center hover:text-text-primary transition-colors duration-200"
      >
        <Home className="h-4 w-4" />
      </button>
      
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <ChevronRight className="h-3 w-3 text-text-muted" />
          {item.current ? (
            <span className="font-medium text-text-primary">{item.label}</span>
          ) : (
            <button
              onClick={() => handleClick(item.href)}
              className="hover:text-text-primary transition-colors duration-200"
            >
              {item.label}
            </button>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumbs;