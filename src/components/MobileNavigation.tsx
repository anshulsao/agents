import React, { useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { 
  X, 
  Menu, 
  Home, 
  Server, 
  Database, 
  Shield, 
  Activity, 
  Settings,
  ChevronRight,
  Search,
  Bell,
  HelpCircle
} from 'lucide-react';

interface MobileNavigationProps {
  isOpen: boolean;
  onClose: () => void;
  currentPath?: string;
  onNavigate?: (path: string) => void;
}

const navigationItems = [
  { id: 'overview', label: 'Overview', icon: Home, href: '/overview' },
  { 
    id: 'workloads', 
    label: 'Workloads', 
    icon: Server, 
    children: [
      { id: 'pods', label: 'Pods', href: '/workloads/pods' },
      { id: 'deployments', label: 'Deployments', href: '/workloads/deployments' },
      { id: 'services', label: 'Services', href: '/workloads/services' },
      { id: 'ingress', label: 'Ingress', href: '/workloads/ingress' }
    ]
  },
  { 
    id: 'storage', 
    label: 'Storage', 
    icon: Database,
    children: [
      { id: 'volumes', label: 'Persistent Volumes', href: '/storage/volumes' },
      { id: 'claims', label: 'Volume Claims', href: '/storage/claims' },
      { id: 'classes', label: 'Storage Classes', href: '/storage/classes' }
    ]
  },
  { 
    id: 'security', 
    label: 'Security', 
    icon: Shield,
    children: [
      { id: 'rbac', label: 'RBAC', href: '/security/rbac' },
      { id: 'policies', label: 'Network Policies', href: '/security/policies' },
      { id: 'secrets', label: 'Secrets', href: '/security/secrets' }
    ]
  },
  { id: 'monitoring', label: 'Monitoring', icon: Activity, href: '/monitoring', badge: '3' },
  { id: 'settings', label: 'Settings', icon: Settings, href: '/settings' }
];

const MobileNavigation: React.FC<MobileNavigationProps> = ({ 
  isOpen, 
  onClose, 
  currentPath = '', 
  onNavigate 
}) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const handleNavigate = (href: string) => {
    if (onNavigate) {
      onNavigate(href);
    }
    onClose();
  };

  const isActive = (href?: string) => {
    if (!href) return false;
    return currentPath.startsWith(href);
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="ease-in duration-200"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="w-80 max-w-sm bg-surface border-r border-border shadow-strong text-left transition-all flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-border/50">
                  <h2 className="text-lg font-semibold text-text-primary">Navigation</h2>
                  <button
                    type="button"
                    className="p-2 hover:bg-surface-hover rounded-lg transition-colors"
                    onClick={onClose}
                  >
                    <X className="h-5 w-5 text-text-tertiary" />
                  </button>
                </div>

                {/* Search */}
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
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                  {navigationItems.map((item) => (
                    <div key={item.id}>
                      <button
                        onClick={() => {
                          if (item.children) {
                            toggleSection(item.id);
                          } else if (item.href) {
                            handleNavigate(item.href);
                          }
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-200 rounded-lg ${
                          isActive(item.href)
                            ? 'bg-accent text-white'
                            : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
                        }`}
                      >
                        <item.icon className="h-5 w-5 flex-shrink-0" />
                        <span className="flex-1 font-medium">{item.label}</span>
                        {item.badge && (
                          <span className="px-2 py-1 bg-accent text-white text-xs rounded-full">
                            {item.badge}
                          </span>
                        )}
                        {item.children && (
                          <ChevronRight 
                            className={`h-4 w-4 transition-transform duration-200 ${
                              expandedSections.has(item.id) ? 'rotate-90' : ''
                            }`} 
                          />
                        )}
                      </button>
                      
                      {item.children && expandedSections.has(item.id) && (
                        <div className="mt-2 ml-4 space-y-1">
                          {item.children.map((child) => (
                            <button
                              key={child.id}
                              onClick={() => handleNavigate(child.href)}
                              className={`w-full flex items-center gap-3 px-4 py-2 text-left transition-all duration-200 rounded-lg text-sm ${
                                isActive(child.href)
                                  ? 'bg-accent/20 text-accent font-medium'
                                  : 'text-text-tertiary hover:text-text-primary hover:bg-surface-hover'
                              }`}
                            >
                              {child.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Quick Actions */}
                <div className="p-4 border-t border-border/50 space-y-2">
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
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default MobileNavigation;