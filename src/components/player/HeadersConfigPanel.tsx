import React, { useState } from 'react';
import {
  Globe,
  ToggleLeft,
  ToggleRight,
  RotateCcw,
  Plus,
  Trash2,
  Tv,
  Smartphone,
  Monitor,
  Radio,
  Sliders,
  Sparkles,
} from 'lucide-react';
import {
  POPULAR_DEVICE_PRESETS,
  COMMON_HEADER_SUGGESTIONS,
} from './headerPresets';
import { HeaderAutocompleteInput } from './HeaderAutocompleteInput';

export interface CustomHeaderItem {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
}

interface HeadersConfigPanelProps {
  useProxy: boolean;
  onToggleProxy: () => void;
  userAgent: string;
  onUserAgentChange: (val: string) => void;
  customHeaders: CustomHeaderItem[];
  onCustomHeadersChange: (headers: CustomHeaderItem[]) => void;
  onResetHeaders: () => void;
}

export const HeadersConfigPanel: React.FC<HeadersConfigPanelProps> = ({
  useProxy,
  onToggleProxy,
  userAgent,
  onUserAgentChange,
  customHeaders,
  onCustomHeadersChange,
  onResetHeaders,
}) => {
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>(() => {
    const match = POPULAR_DEVICE_PRESETS.find((p) => p.userAgent === userAgent);
    if (match) return match.id;
    return userAgent ? 'custom' : 'default';
  });

  const [isCustomUaOpen, setIsCustomUaOpen] = useState(false);

  // Handle device spinner change
  const handleDeviceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const devId = e.target.value;
    setSelectedDeviceId(devId);

    if (devId === 'custom') {
      setIsCustomUaOpen(true);
    } else {
      const preset = POPULAR_DEVICE_PRESETS.find((p) => p.id === devId);
      if (preset) {
        onUserAgentChange(preset.userAgent);
        setIsCustomUaOpen(false);
      }
    }
  };

  // Custom headers operations
  const handleAddHeader = (initialKey = '', initialValue = '') => {
    const newItem: CustomHeaderItem = {
      id: Math.random().toString(36).substring(2, 9),
      key: initialKey,
      value: initialValue,
      enabled: true,
    };
    onCustomHeadersChange([...customHeaders, newItem]);
  };

  const handleUpdateHeader = (id: string, field: 'key' | 'value' | 'enabled', val: any) => {
    onCustomHeadersChange(
      customHeaders.map((h) => (h.id === id ? { ...h, [field]: val } : h))
    );
  };

  const handleRemoveHeader = (id: string) => {
    onCustomHeadersChange(customHeaders.filter((h) => h.id !== id));
  };

  // Header key suggestions list for autocomplete
  const keySuggestions = COMMON_HEADER_SUGGESTIONS.map((s) => ({
    value: s.key,
    label: s.key,
    description: s.description,
  }));

  // Value suggestions based on the header's current key
  const getValueSuggestions = (headerKey: string) => {
    const match = COMMON_HEADER_SUGGESTIONS.find(
      (s) => s.key.toLowerCase() === headerKey.trim().toLowerCase()
    );
    if (match) {
      return match.commonValues.map((v) => ({
        value: v,
        label: v,
      }));
    }
    return [];
  };

  const activeHeadersCount = customHeaders.filter((h) => h.enabled && h.key.trim()).length;

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 sm:p-4 space-y-3.5 shadow-sm">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2 flex-wrap">
          <Globe className="w-4 h-4 text-sky-400 shrink-0" />
          <h3 className="text-xs font-semibold text-white">HTTP Request Headers & Stream Proxy</h3>
          {activeHeadersCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-mono border border-indigo-500/30">
              {activeHeadersCount} active
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={onToggleProxy}
            className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg transition cursor-pointer active:scale-95 ${
              useProxy
                ? 'bg-sky-950 text-sky-300 border border-sky-800/80 shadow-sm'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
            }`}
          >
            {useProxy ? (
              <ToggleRight className="w-4 h-4 text-sky-400" />
            ) : (
              <ToggleLeft className="w-4 h-4 text-slate-500" />
            )}
            <span className="text-[11px] sm:text-xs">Server Proxy</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onResetHeaders();
              setSelectedDeviceId('default');
              setIsCustomUaOpen(false);
            }}
            className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 cursor-pointer transition"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Device / User-Agent Spinner Selector */}
      <div className="bg-slate-900/70 border border-slate-800/80 rounded-lg p-3 space-y-2.5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
              {selectedDeviceId.includes('android-tv') || selectedDeviceId.includes('samsung') || selectedDeviceId.includes('lg') ? (
                <Tv className="w-3.5 h-3.5" />
              ) : selectedDeviceId.includes('android') || selectedDeviceId.includes('ios') ? (
                <Smartphone className="w-3.5 h-3.5" />
              ) : selectedDeviceId.includes('vlc') || selectedDeviceId.includes('kodi') || selectedDeviceId.includes('tivimate') ? (
                <Radio className="w-3.5 h-3.5" />
              ) : (
                <Monitor className="w-3.5 h-3.5" />
              )}
            </div>
            <div className="min-w-0">
              <label htmlFor="device-spinner-select" className="text-xs font-semibold text-slate-200 block truncate">
                Device / User-Agent Preset
              </label>
              <span className="text-[10px] sm:text-[11px] text-slate-400 block truncate">
                Select device identity or set custom string
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            {/* Spinner Dropdown for Popular Devices */}
            <select
              id="device-spinner-select"
              value={selectedDeviceId}
              onChange={handleDeviceChange}
              className="flex-1 md:w-64 bg-slate-950 border border-slate-750 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:border-indigo-500 focus:outline-none cursor-pointer font-medium truncate"
            >
              <optgroup label="General & Desktop">
                {POPULAR_DEVICE_PRESETS.filter((p) => p.category === 'Desktop').map((preset) => (
                  <option key={preset.id} value={preset.id}>
                    {preset.name}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Mobile Devices">
                {POPULAR_DEVICE_PRESETS.filter((p) => p.category === 'Mobile').map((preset) => (
                  <option key={preset.id} value={preset.id}>
                    {preset.name}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Smart TVs & Sticks">
                {POPULAR_DEVICE_PRESETS.filter((p) => p.category === 'Smart TV').map((preset) => (
                  <option key={preset.id} value={preset.id}>
                    {preset.name}
                  </option>
                ))}
              </optgroup>
              <optgroup label="IPTV & Media Players">
                {POPULAR_DEVICE_PRESETS.filter((p) => p.category === 'Media Player').map((preset) => (
                  <option key={preset.id} value={preset.id}>
                    {preset.name}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Custom">
                <option value="custom">✏️ Custom User-Agent String</option>
              </optgroup>
            </select>

            <button
              type="button"
              onClick={() => setIsCustomUaOpen(!isCustomUaOpen)}
              className={`text-xs px-2.5 py-1.5 rounded-lg border flex items-center gap-1 transition cursor-pointer shrink-0 ${
                isCustomUaOpen || selectedDeviceId === 'custom'
                  ? 'bg-indigo-600/20 border-indigo-500/40 text-indigo-300'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
              title="Toggle Custom User-Agent Editor"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
          </div>
        </div>

        {/* User-Agent String Display / Custom Input */}
        {(isCustomUaOpen || selectedDeviceId === 'custom') && (
          <div className="pt-2 border-t border-slate-800/60 space-y-1 animate-in fade-in duration-150">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>Active User-Agent String:</span>
              {userAgent && (
                <button
                  type="button"
                  onClick={() => {
                    onUserAgentChange('');
                    setSelectedDeviceId('default');
                  }}
                  className="text-slate-500 hover:text-red-400 transition"
                >
                  Clear to Default
                </button>
              )}
            </div>
            <textarea
              rows={2}
              value={userAgent}
              onChange={(e) => {
                onUserAgentChange(e.target.value);
                setSelectedDeviceId('custom');
              }}
              placeholder="Enter or modify custom User-Agent string..."
              className="w-full bg-slate-950 border border-slate-750 text-slate-200 font-mono text-xs rounded-lg p-2 focus:border-indigo-500 focus:outline-none placeholder:text-slate-600 resize-none"
            />
          </div>
        )}
      </div>

      {/* Postman-like Custom Headers */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-xs font-semibold text-slate-200 block">Custom Request Headers</span>
            <span className="text-[10px] sm:text-[11px] text-slate-400">
              Injected into player and forwarded via proxy
            </span>
          </div>

          <button
            type="button"
            onClick={() => handleAddHeader('', '')}
            className="self-start sm:self-auto px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-sm active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Header</span>
          </button>
        </div>

        {/* Quick Header Presets Chips */}
        <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
          <span className="text-slate-500 flex items-center gap-1 mr-1 text-[10px] sm:text-[11px]">
            <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
            Quick Add:
          </span>
          {[
            { key: 'Referer', val: 'https://stream-provider.com' },
            { key: 'Origin', val: 'https://stream-provider.com' },
            { key: 'Authorization', val: 'Bearer ' },
            { key: 'Cookie', val: 'session_id=' },
            { key: 'X-Forwarded-For', val: '103.99.249.139' },
            { key: 'Accept', val: '*/*' },
          ].map((item) => {
            const alreadyExists = customHeaders.some(
              (h) => h.key.toLowerCase() === item.key.toLowerCase()
            );
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => handleAddHeader(item.key, item.val)}
                className={`px-2 py-0.5 rounded-md border text-[10px] sm:text-[11px] font-mono transition cursor-pointer ${
                  alreadyExists
                    ? 'bg-slate-900/60 border-slate-800 text-slate-500 hover:border-slate-700'
                    : 'bg-slate-900 border-slate-800 hover:border-indigo-500/50 hover:text-indigo-300 text-slate-300'
                }`}
              >
                +{item.key}
              </button>
            );
          })}
        </div>

        {/* Headers Table / Rows */}
        {customHeaders.length === 0 ? (
          <div className="border border-dashed border-slate-800 rounded-lg p-5 text-center space-y-1.5">
            <p className="text-xs text-slate-400">
              No custom headers configured.
            </p>
            <p className="text-[11px] text-slate-500">
              Click &quot;Add Header&quot; or use Quick Add chips to attach custom Origin, Referer, Cookie or Authorization.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Desktop Table Header */}
            <div className="hidden sm:grid sm:grid-cols-12 gap-2 text-[11px] font-medium text-slate-400 px-1">
              <span className="col-span-1 text-center">Active</span>
              <span className="col-span-4">Header Key</span>
              <span className="col-span-6">Header Value</span>
              <span className="col-span-1 text-right">Action</span>
            </div>

            {customHeaders.map((header) => (
              <div
                key={header.id}
                className={`p-2 sm:p-1.5 rounded-lg border transition ${
                  header.enabled
                    ? 'bg-slate-900/60 border-slate-800'
                    : 'bg-slate-950/40 border-slate-900 opacity-60'
                }`}
              >
                {/* Mobile Card Layout (xs to sm) */}
                <div className="flex sm:hidden flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={header.enabled}
                        onChange={(e) => handleUpdateHeader(header.id, 'enabled', e.target.checked)}
                        className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      />
                      <span>{header.enabled ? 'Active Header' : 'Disabled'}</span>
                    </label>

                    <button
                      type="button"
                      onClick={() => handleRemoveHeader(header.id)}
                      className="p-1 rounded text-slate-500 hover:text-red-400 transition"
                      title="Remove Header"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 block font-medium">Header Key:</span>
                    <HeaderAutocompleteInput
                      value={header.key}
                      onChange={(val) => handleUpdateHeader(header.id, 'key', val)}
                      suggestions={keySuggestions}
                      placeholder="e.g. Referer, Cookie"
                      className="w-full bg-slate-950 border border-slate-750 text-slate-200 font-mono text-xs rounded-lg px-2.5 py-1.5 focus:border-indigo-500 focus:outline-none placeholder:text-slate-600"
                    />
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 block font-medium">Header Value:</span>
                    <HeaderAutocompleteInput
                      value={header.value}
                      onChange={(val) => handleUpdateHeader(header.id, 'value', val)}
                      suggestions={getValueSuggestions(header.key)}
                      placeholder="Enter value or pick suggestion"
                      className="w-full bg-slate-950 border border-slate-750 text-slate-200 font-mono text-xs rounded-lg px-2.5 py-1.5 focus:border-indigo-500 focus:outline-none placeholder:text-slate-600"
                    />
                  </div>
                </div>

                {/* Desktop Grid Layout (sm and up) */}
                <div className="hidden sm:grid sm:grid-cols-12 gap-2 items-center">
                  {/* Active Checkbox */}
                  <div className="col-span-1 flex justify-center">
                    <input
                      type="checkbox"
                      checked={header.enabled}
                      onChange={(e) => handleUpdateHeader(header.id, 'enabled', e.target.checked)}
                      className="w-4 h-4 rounded bg-slate-950 border-slate-750 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      title={header.enabled ? 'Enabled' : 'Disabled'}
                    />
                  </div>

                  {/* Key with Autocomplete Suggestions */}
                  <div className="col-span-4 min-w-0">
                    <HeaderAutocompleteInput
                      value={header.key}
                      onChange={(val) => handleUpdateHeader(header.id, 'key', val)}
                      suggestions={keySuggestions}
                      placeholder="e.g. Referer, Cookie"
                      className="w-full bg-slate-950 border border-slate-750 text-slate-200 font-mono text-xs rounded-lg px-2.5 py-1.5 focus:border-indigo-500 focus:outline-none placeholder:text-slate-600"
                    />
                  </div>

                  {/* Value with Suggestions */}
                  <div className="col-span-6 min-w-0">
                    <HeaderAutocompleteInput
                      value={header.value}
                      onChange={(val) => handleUpdateHeader(header.id, 'value', val)}
                      suggestions={getValueSuggestions(header.key)}
                      placeholder="Enter value or pick suggested template"
                      className="w-full bg-slate-950 border border-slate-750 text-slate-200 font-mono text-xs rounded-lg px-2.5 py-1.5 focus:border-indigo-500 focus:outline-none placeholder:text-slate-600"
                    />
                  </div>

                  {/* Delete button */}
                  <div className="col-span-1 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleRemoveHeader(header.id)}
                      className="p-1.5 rounded text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition cursor-pointer"
                      title="Remove Header"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
