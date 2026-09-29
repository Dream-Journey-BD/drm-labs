import React, { useRef, useState } from 'react';
import { Upload, RefreshCw, X, FileVideo } from 'lucide-react';
import { DrmCredentialsInputs } from './DrmCredentialsInputs';

interface VideoUploadCardProps {
  uploading: boolean;
  errorMessage: string | null;
  onClearError: () => void;
  onSubmit: (formData: FormData) => Promise<void>;
  generateRandomHex: () => string;
}

export const VideoUploadCard: React.FC<VideoUploadCardProps> = ({
  uploading,
  errorMessage,
  onClearError,
  onSubmit,
  generateRandomHex,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [kidInput, setKidInput] = useState('00112233445566778899aabbccddeeff');
  const [keyInput, setKeyInput] = useState('ffeeddccbbaa99887766554433221100');
  const [targetFormat, setTargetFormat] = useState<'dash' | 'hls' | 'both'>('dash');
  const [targetAudio, setTargetAudio] = useState<'aac' | 'aac_hq' | 'mp3' | 'passthrough' | 'none'>('aac');
  const [targetDrm, setTargetDrm] = useState<'strict' | 'standard' | 'none'>('strict');

  const getShortenedStreamName = (fileName: string, maxLength: number = 24): string => {
    const withoutExt = fileName.replace(/\.[^/.]+$/, '');
    const cleaned = withoutExt.replace(/[._-]+/g, ' ').replace(/\s+/g, ' ').trim();
    if (cleaned.length > maxLength) {
      return cleaned.slice(0, maxLength).trim() + '...';
    }
    return cleaned || 'Stream';
  };

  const handleRandomizeBoth = () => {
    setKidInput(generateRandomHex());
    setKeyInput(generateRandomHex());
  };

  const handleResetDefaultKeys = () => {
    setKidInput('00112233445566778899aabbccddeeff');
    setKeyInput('ffeeddccbbaa99887766554433221100');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      onClearError();
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
      onClearError();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    const data = new FormData();
    data.append('video', selectedFile);
    data.append('kid', kidInput);
    data.append('key', keyInput);
    data.append('streamName', getShortenedStreamName(selectedFile.name));
    data.append('streamFormat', targetFormat);
    data.append('audioCodec', targetAudio);
    data.append('clearLeadSeconds', targetDrm === 'strict' ? '0' : '6');
    data.append('noDrm', String(targetDrm === 'none'));

    await onSubmit(data);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs sm:text-sm font-semibold text-white flex items-center gap-2">
          <Upload className="w-4 h-4 text-indigo-400" />
          Upload Video
        </h2>
        <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
          Supports MP4, MKV, MOV, WebM, TS, MPEG
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3.5">
        {/* Drag & Drop Area */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-4 sm:p-5 text-center cursor-pointer transition min-h-[80px] flex flex-col items-center justify-center ${
            isDragging
              ? 'border-indigo-500 bg-indigo-950/20'
              : 'border-slate-800 hover:border-slate-700 bg-slate-900/40'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*,.mkv,.mp4,.m4v,.mov,.webm,.ts,.avi,.flv"
            onChange={handleFileChange}
            className="hidden"
          />
          <FileVideo className="w-6 h-6 text-slate-500 mb-1.5" />
          {selectedFile ? (
            <div className="space-y-1 text-center">
              <div className="text-xs text-indigo-300 font-medium">
                Selected File: <span className="text-white font-semibold">{selectedFile.name}</span> (
                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
              </div>
              <div className="text-[11px] text-emerald-400 font-medium flex items-center justify-center gap-1.5">
                <span className="text-slate-400">Stream Name:</span>
                <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-700 font-mono text-emerald-300">
                  {getShortenedStreamName(selectedFile.name)}
                </span>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-xs text-slate-300 font-medium">
                Drag & drop any video file here, or click to browse
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                MP4, MKV, WebM, MOV, TS, MPEG up to 500MB
              </p>
            </div>
          )}
        </div>

        {/* Modular Content-Sized DRM Credentials Inputs */}
        <DrmCredentialsInputs
          kidInput={kidInput}
          keyInput={keyInput}
          onKidChange={setKidInput}
          onKeyChange={setKeyInput}
          onRandomizeBoth={handleRandomizeBoth}
          onResetDefaults={handleResetDefaultKeys}
          onRandomizeKid={() => setKidInput(generateRandomHex())}
          onRandomizeKey={() => setKeyInput(generateRandomHex())}
        />

        {errorMessage && (
          <div className="p-2.5 bg-rose-950/50 border border-rose-800/80 rounded text-xs text-rose-300 flex items-center justify-between">
            <span>{errorMessage}</span>
            <button type="button" onClick={onClearError} className="text-rose-400 hover:text-white cursor-pointer">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Packaging Settings Bar */}
        <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <label className="text-[11px] text-slate-400 font-medium whitespace-nowrap">Format:</label>
              <select
                value={targetFormat}
                onChange={(e) => setTargetFormat(e.target.value as any)}
                className="bg-slate-900 border border-slate-750 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:border-indigo-500 focus:outline-none"
              >
                <option value="dash">MPEG-DASH (.mpd)</option>
                <option value="hls">Apple HLS (.m3u8)</option>
                <option value="both">Both (DASH + HLS)</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <label className="text-[11px] text-slate-400 font-medium whitespace-nowrap">Audio:</label>
              <select
                value={targetAudio}
                onChange={(e) => setTargetAudio(e.target.value as any)}
                className="bg-slate-900 border border-slate-750 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:border-indigo-500 focus:outline-none"
              >
                <option value="aac">AAC Stereo (128k)</option>
                <option value="aac_hq">AAC HQ (192k)</option>
                <option value="mp3">MP3 Stereo (128k)</option>
                <option value="passthrough">Passthrough (Copy)</option>
                <option value="none">No Audio (Mute)</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <label className="text-[11px] text-slate-400 font-medium whitespace-nowrap">DRM:</label>
              <select
                value={targetDrm}
                onChange={(e) => setTargetDrm(e.target.value as any)}
                className="bg-slate-900 border border-slate-750 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:border-indigo-500 focus:outline-none"
              >
                <option value="strict">Strict (clear_lead=0)</option>
                <option value="standard">Standard (clear_lead=6)</option>
                <option value="none">No DRM (Clear)</option>
              </select>
            </div>
          </div>

          <div className="w-full sm:w-auto sm:ml-auto flex items-center justify-end pt-1 sm:pt-0">
            <button
              type="submit"
              disabled={uploading || !selectedFile}
              className={`w-full sm:w-auto py-2 px-4 rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-1.5 shrink-0 ${
                uploading
                  ? 'bg-indigo-950 text-indigo-300 border border-indigo-700/60 cursor-wait'
                  : !selectedFile
                  ? 'bg-slate-800 text-slate-400 border border-slate-700/60 cursor-not-allowed opacity-80'
                  : 'bg-gradient-to-r from-indigo-500 via-purple-600 to-indigo-600 hover:from-indigo-400 hover:to-purple-500 text-white shadow-md shadow-indigo-600/30 border border-indigo-300/40 cursor-pointer active:scale-95'
              }`}
            >
              {uploading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                  <span>Packaging...</span>
                </>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5 text-white" />
                  <span>Package</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
