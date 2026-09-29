import React, { useState, useRef, useEffect } from 'react';
import {
  Radio,
  Wifi,
  Menu,
  X,
  Check,
  Copy,
  Play,
  Tv,
  BookOpen,
  Activity,
} from 'lucide-react';
import type { AppView } from './Navbar';
import { DrmLabsLogo } from '../common/DrmLabsLogo';

interface HeaderProps {
  serverLanIp: string;
  currentView: AppView;
  onViewChange: (view: AppView) => void;
}

const TABS: { id: AppView; label: string; icon: React.ElementType }[] = [
  { id: 'streams', label: 'Streams', icon: Radio },
  { id: 'player', label: 'Player', icon: Play },
  { id: 'playlist', label: 'M3U', icon: Tv },
  { id: 'inspector', label: 'DRM Logs', icon: Activity },
  { id: 'docs', label: 'Docs', icon: BookOpen },
];

export const Header: React.FC<HeaderProps> = ({
  serverLanIp,
  currentView,
  onViewChange,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [copiedIp, setCopiedIp] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const activeTab = TABS.find((t) => t.id === currentView) || TABS[0];
  const ActiveIcon = activeTab.icon;

  const handleCopyIp = () => {
    if (!serverLanIp) return;
    navigator.clipboard.writeText(`http://${serverLanIp}:3000`);
    setCopiedIp(true);
    setTimeout(() => setCopiedIp(false), 2000);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <header className="border-b border-slate-800 bg-slate-950/95 backdrop-blur sticky top-0 z-30 px-3.5 sm:px-6 py-2.5 relative">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-2">
        {/* Brand Logo & Name */}
        <div
          onClick={() => onViewChange('streams')}
          className="flex items-center gap-2.5 min-w-0 shrink-0 cursor-pointer select-none group"
          title="DRM Labs"
        >
          <DrmLabsLogo size={28} className="group-hover:scale-105 transition-transform" />
          <div className="flex items-center min-w-0">
            <span className="text-base sm:text-lg font-black tracking-tight text-white group-hover:text-slate-100 transition-colors">
              DRM
            </span>
            <span className="text-base sm:text-lg font-bold tracking-tight bg-gradient-to-r from-indigo-400 via-sky-400 to-cyan-300 bg-clip-text text-transparent ml-1.5">
              Labs
            </span>
            <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded-full bg-indigo-950/80 border border-indigo-800/60 text-indigo-300 font-semibold hidden xs:inline ml-2 tracking-wider">
              ClearKey
            </span>
          </div>
        </div>

        {/* Desktop View: LAN IP, DRM Logs, Online Status */}
        <div className="hidden sm:flex items-center gap-2 shrink-0">
          {serverLanIp && (
            <button
              type="button"
              onClick={handleCopyIp}
              className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300 flex items-center gap-1.5 shadow-sm hover:border-slate-700 cursor-pointer transition"
              title="Copy LAN IP for ExoPlayer testing"
            >
              <Wifi className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="text-slate-400">LAN:</span>
              <span className="text-emerald-300 font-medium">{serverLanIp}:3000</span>
              {copiedIp ? (
                <Check className="w-3 h-3 text-emerald-400 ml-0.5" />
              ) : (
                <Copy className="w-3 h-3 text-slate-500 hover:text-slate-300 ml-0.5" />
              )}
            </button>
          )}

          <button
            type="button"
            onClick={() => onViewChange('inspector')}
            className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium flex items-center gap-1.5 transition cursor-pointer ${
              currentView === 'inspector'
                ? 'bg-indigo-600 border-indigo-500 text-white shadow-sm'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span>DRM Logs</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </button>

          <div className="px-2 py-1 rounded-lg bg-emerald-950/40 border border-emerald-800/50 text-[11px] font-medium text-emerald-400 flex items-center gap-1.5 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Online</span>
          </div>
        </div>

        {/* Mobile View: Clean Unified Menu Trigger */}
        <div className="flex sm:hidden items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            aria-label="Toggle navigation menu"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 text-xs font-medium cursor-pointer hover:border-slate-700 active:scale-95 transition"
          >
            <ActiveIcon className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="max-w-[70px] truncate text-[11px]">{activeTab.label}</span>
            {isMenuOpen ? (
              <X className="w-3.5 h-3.5 text-indigo-300 ml-0.5" />
            ) : (
              <Menu className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu Sheet */}
      {isMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 sm:hidden"
            onClick={() => setIsMenuOpen(false)}
          />

          <div
            ref={menuRef}
            className="absolute right-3.5 top-[calc(100%+6px)] left-3.5 max-w-sm ml-auto bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 sm:hidden p-3 space-y-2.5 animate-in fade-in duration-150"
          >
            {/* Navigation Tabs List */}
            <div className="grid grid-cols-2 gap-1.5">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = currentView === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      onViewChange(tab.id);
                      setIsMenuOpen(false);
                    }}
                    className={`flex items-center gap-2 p-2 rounded-xl text-xs font-medium transition cursor-pointer ${
                      isActive
                        ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white bg-slate-950/60 border border-slate-800/60'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Quick Network IP info */}
            {serverLanIp && (
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs bg-slate-950/80 px-2.5 py-1.5 rounded-lg border border-slate-800">
                <span className="font-mono text-emerald-300 text-[11px] truncate">
                  {serverLanIp}:3000
                </span>
                <button
                  type="button"
                  onClick={handleCopyIp}
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium px-2 py-0.5 rounded bg-indigo-950/60 border border-indigo-800/50"
                >
                  {copiedIp ? 'Copied' : 'Copy IP'}
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </header>
  );
};
