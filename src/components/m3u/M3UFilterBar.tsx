import React from 'react';
import { Search, Filter } from 'lucide-react';

interface M3UFilterBarProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (val: string) => void;
  statusFilter: 'all' | 'online' | 'error' | 'idle';
  onStatusFilterChange: (val: 'all' | 'online' | 'error' | 'idle') => void;
}

export const M3UFilterBar: React.FC<M3UFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  categories,
  selectedCategory,
  onSelectCategory,
  statusFilter,
  onStatusFilterChange,
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
      {/* Search Input */}
      <div className="relative flex-1 min-w-0 max-w-full sm:max-w-sm">
        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Filter channels by title..."
          className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none transition"
        />
      </div>

      {/* Category Dropdown & Status Filters */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <div className="flex items-center gap-1.5 flex-1 sm:flex-initial min-w-[140px]">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <select
            value={selectedCategory}
            onChange={(e) => onSelectCategory(e.target.value)}
            className="w-full sm:w-auto bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 focus:border-indigo-500 focus:outline-none cursor-pointer text-xs"
          >
            <option value="all">All Categories ({categories.length})</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5 shrink-0">
          <button
            type="button"
            onClick={() => onStatusFilterChange('all')}
            className={`px-2 py-1 rounded text-[11px] font-medium transition cursor-pointer ${
              statusFilter === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => onStatusFilterChange('online')}
            className={`px-2 py-1 rounded text-[11px] font-medium transition cursor-pointer ${
              statusFilter === 'online' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Online
          </button>
          <button
            type="button"
            onClick={() => onStatusFilterChange('error')}
            className={`px-2 py-1 rounded text-[11px] font-medium transition cursor-pointer ${
              statusFilter === 'error' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Offline
          </button>
        </div>
      </div>
    </div>
  );
};
