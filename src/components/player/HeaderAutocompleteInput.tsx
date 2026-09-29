import React, { useState, useRef, useEffect } from 'react';

interface SuggestionOption {
  value: string;
  label?: string;
  description?: string;
}

interface HeaderAutocompleteInputProps {
  value: string;
  onChange: (val: string) => void;
  suggestions: SuggestionOption[];
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
}

export const HeaderAutocompleteInput: React.FC<HeaderAutocompleteInputProps> = ({
  value,
  onChange,
  suggestions,
  placeholder = '',
  className = '',
  autoFocus = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredSuggestions = suggestions.filter((item) => {
    if (!value) return true;
    const query = value.toLowerCase().trim();
    return (
      item.value.toLowerCase().includes(query) ||
      (item.label && item.label.toLowerCase().includes(query)) ||
      (item.description && item.description.toLowerCase().includes(query))
    );
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (itemValue: string) => {
    onChange(itemValue);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' && filteredSuggestions.length > 0) {
        setIsOpen(true);
        setHighlightedIndex(0);
        e.preventDefault();
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev < filteredSuggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : filteredSuggestions.length - 1));
    } else if (e.key === 'Enter') {
      if (highlightedIndex >= 0 && highlightedIndex < filteredSuggestions.length) {
        e.preventDefault();
        handleSelect(filteredSuggestions[highlightedIndex].value);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setIsOpen(true);
          setHighlightedIndex(-1);
        }}
        onFocus={() => setIsOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className={className}
      />

      {isOpen && filteredSuggestions.length > 0 && (
        <ul className="absolute z-50 left-0 right-0 mt-1 max-h-56 overflow-y-auto bg-slate-900 border border-slate-700/80 rounded-lg shadow-xl py-1 text-xs divide-y divide-slate-800/60">
          {filteredSuggestions.map((item, idx) => (
            <li
              key={`${item.value}-${idx}`}
              onMouseDown={(e) => {
                e.preventDefault(); // Prevent input blur
                handleSelect(item.value);
              }}
              onMouseEnter={() => setHighlightedIndex(idx)}
              className={`px-3 py-2 cursor-pointer transition flex flex-col gap-0.5 ${
                highlightedIndex === idx
                  ? 'bg-indigo-600/30 text-white'
                  : 'hover:bg-slate-800/80 text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between font-mono font-medium">
                <span className="text-indigo-300">{item.label || item.value}</span>
              </div>
              {item.description && (
                <span className="text-[11px] text-slate-400 font-sans line-clamp-1">
                  {item.description}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
