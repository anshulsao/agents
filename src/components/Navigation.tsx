import React, { useState } from 'react';
import { 
  Home, 
  Server, 
  Database, 
  Shield, 
  Activity, 
  Settings, 
  ChevronDown,
  ChevronRight,
  Search,
  Bell,
  HelpCircle
} from 'lucide-react';

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  href?: string;
  children?: NavigationItem[];
  badge?: string | number;
}

interface NavigationProps {
  currentPath?: string;
  onNavigate?: (path: string) => void;
}

const navigationItems: NavigationItem[] = [
  {
    id: 'overview',
    label: 'Overview',
    icon: Home,
    href: '/overview'
  },
  {
    id: 'workloads',
    label: 'Workloads',
    icon: Server,
    children: [
      { id: 'pods', label: 'Pods', icon: Server, href: '/workloads/pods' },
      { id: 'deployments', label: 'Deployments', icon: Server, href: '/workloads/deployments' },
      { id: 'services', label: 'Services', icon: Server, href: '/workloads/services' },
      { id: 'ingress', label: 'Ingress', icon: Server, href: '/workloads/ingress' }
    ]
  },
  {
    id: 'storage',
    label: 'Storage',
    icon: Database,
    children: [
      { id: 'volumes', label: 'Persistent Volumes', icon: Database, href: '/storage/volumes' },
      { id: 'claims', label: 'Volume Claims', icon: Database, href: '/storage/claims' },
      { id: 'classes', label: 'Storage Classes', icon: Database, href: '/storage/classes' }
    ]
  },
  {
    id: 'security',
    label: 'Security',
    icon: Shield,
    children: [
      { id: 'rbac', label: 'RBAC', icon: Shield, href: '/security/rbac' },
      { id: 'policies', label: 'Network Policies', icon: Shield, href: '/security/policies' },
      { id: 'secrets', label: 'Secrets', icon: Shield, href: '/security/secrets' }
    ]
  },
  {
    id: 'monitoring',
    label: 'Monitoring',
    icon: Activity,
    href: '/monitoring',
    badge: '3'
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    href: '/settings'
  }
];

const Navigation: React.FC<NavigationProps> = ({ currentPath = '', onNavigate }) => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set(['workloads']));

  const toggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const handleNavigate = (href: string) => {
    if (onNavigate) {
      onNavigate(href);
    }
  };

  const isActive = (href?: string) => {
    if (!href) return false;
    return currentPath.startsWith(href);
  };

  const renderNavigationItem = (item: NavigationItem, level = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.has(item.id);
    const active = isActive(item.href);

    return (
      <div key={item.id} className="w-full">
        <button
          onClick={() => {
            if (hasChildren) {
              toggleExpanded(item.id);
            } else if (item.href) {
              handleNavigate(item.href);
            }
          }}
          className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all duration-200 rounded-lg group ${
            level === 0 ? 'mb-1' : 'mb-0.5 ml-4'
          } ${
            active
              ? 'bg-accent text-white shadow-soft'
              : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
          }`}
        >
          <item.icon className={`h-4 w-4 flex-shrink-0 ${
            active ? 'text-white' : 'text-text-tertiary group-hover:text-accent'
          }`} />
          
          <span className={`flex-1 text-sm font-medium ${level > 0 ? 'text-xs' : ''}`}>
            {item.label}
          </span>
          
          {item.badge && (
            <span className="px-1.5 py-0.5 bg-accent text-white text-xs rounded-full font-medium">
              {item.badge}
            </span>
          )}
          
          {hasChildren && (
            <div className={`transition-transform duration-200 ${
              isExpanded ? 'rotate-90' : ''
            }`}>
              <ChevronRight className="h-3 w-3" />
            </div>
          )}
        </button>
        
        {hasChildren && isExpanded && (
          <div className="mt-1 space-y-0.5">
            {item.children!.map(child => renderNavigationItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <nav className="w-64 bg-surface border-r border-border flex flex-col h-full">
      {/* Search Bar */}
      <div className="p-4 border-b border-border/50">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-tertiary" />
          <input
            type="text"
            placeholder="Search resources..."
            className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-sm text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all duration-200"
          />
        </div>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        {navigationItems.map(item => renderNavigationItem(item))}
      </div>

      {/* Quick Actions */}
      <div className="p-4 border-t border-border/50">
        <div className="space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-2 text-left text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded-lg transition-all duration-200">
            <Bell className="h-4 w-4" />
            <span className="text-sm">Alerts</span>
            <span className="ml-auto px-1.5 py-0.5 bg-error text-white text-xs rounded-full">2</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-2 text-left text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded-lg transition-all duration-200">
            <HelpCircle className="h-4 w-4" />
            <span className="text-sm">Help & Support</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;