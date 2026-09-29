import React, { useState } from 'react';
import { Shield, Package, Smartphone, FileCode, Globe, Server } from 'lucide-react';
import { DocsDrmOverview } from './DocsDrmOverview';
import { DocsPackaging } from './DocsPackaging';
import { DocsAndroidExoPlayer } from './DocsAndroidExoPlayer';
import { DocsM3USpecs } from './DocsM3USpecs';
import { DocsWebPlayers } from './DocsWebPlayers';
import { DocsApiReference } from './DocsApiReference';

export const DocsTab: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'overview' | 'packaging' | 'exoplayer' | 'm3u' | 'web' | 'api'>('overview');

  const navItems = [
    { id: 'overview', label: '🛡️ DRM Fundamentals', icon: Shield },
    { id: 'packaging', label: '📦 Packaging Pipeline', icon: Package },
    { id: 'exoplayer', label: '📱 Android ExoPlayer', icon: Smartphone },
    { id: 'm3u', label: '📡 IPTV & M3U Specs', icon: FileCode },
    { id: 'web', label: '🌐 Web Players', icon: Globe },
    { id: 'api', label: '⚡ REST API Reference', icon: Server },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {/* Navigation on mobile (horizontal scroll) / sidebar on desktop */}
      <div className="md:col-span-1 flex flex-row md:flex-col gap-1.5 overflow-x-auto scrollbar-none pb-1 md:pb-0">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveSection(item.id as any)}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition flex items-center gap-2 text-left shrink-0 md:w-full cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content panel */}
      <div className="md:col-span-3 bg-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm">
        {activeSection === 'overview' && <DocsDrmOverview />}
        {activeSection === 'packaging' && <DocsPackaging />}
        {activeSection === 'exoplayer' && <DocsAndroidExoPlayer />}
        {activeSection === 'm3u' && <DocsM3USpecs />}
        {activeSection === 'web' && <DocsWebPlayers />}
        {activeSection === 'api' && <DocsApiReference />}
      </div>
    </div>
  );
};
