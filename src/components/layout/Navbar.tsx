import React from 'react';
import { Radio, Play, Tv, BookOpen, Activity } from 'lucide-react';

export type AppView = 'streams' | 'player' | 'playlist' | 'inspector' | 'docs';

interface NavbarProps {
  currentView: AppView;
  onViewChange: (view: AppView) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onViewChange }) => {
  const tabs = [
    { id: 'streams' as AppView, label: 'Streams', icon: Radio },
    { id: 'player' as AppView, label: 'Player', icon: Play },
    { id: 'playlist' as AppView, label: 'M3U', icon: Tv },
    { id: 'inspector' as AppView, label: 'DRM Logs', icon: Activity },
    { id: 'docs' as AppView, label: 'Docs', icon: BookOpen },
  ];

  return (
    <nav className="hidden sm:block border-b border-slate-800 bg-slate-950/60 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto flex items-center gap-2 py-2 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentView === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onViewChange(tab.id)}
              className={`min-h-[34px] px-3.5 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 shrink-0 ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive && tab.id === 'player' ? 'fill-current' : ''}`} />
              <span>{tab.label}</span>
              {tab.id === 'inspector' && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
