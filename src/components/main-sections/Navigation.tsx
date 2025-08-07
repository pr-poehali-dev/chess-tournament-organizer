import React from 'react';
import Icon from '@/components/ui/icon';
import { NavigationItem, ActiveSection } from './types';

interface NavigationProps {
  activeSection: ActiveSection;
  onSectionChange: (section: ActiveSection) => void;
  navigationItems: NavigationItem[];
}

const Navigation: React.FC<NavigationProps> = ({ 
  activeSection, 
  onSectionChange, 
  navigationItems 
}) => {
  return (
    <div>
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-5">
            <div className="flex items-center">
              <img 
                src="https://cdn.poehali.dev/files/f7c22529-8aec-4d54-8fdf-65bbb1fc6ed7.png" 
                alt="Мир шахмат" 
                className="h-24 w-auto"
              />
            </div>
            <div className="hidden md:flex items-center space-x-4">
              {navigationItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onSectionChange(item.id as ActiveSection)}
                  className={`flex items-center space-x-1 px-2 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
                    activeSection === item.id
                      ? 'text-primary border-b-2 border-primary'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon name={item.icon as any} size={14} />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>
      <div className="bg-gradient-to-r from-primary/10 to-gold-100/50 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-heading font-bold text-center text-gray-900">
            Центр поддержки детского шахматного спорта "Мир шахмат"
          </h2>
        </div>
      </div>
    </div>
  );
};

export default Navigation;