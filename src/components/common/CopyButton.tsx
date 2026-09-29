import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface CopyButtonProps {
  text: string;
  className?: string;
  iconClassName?: string;
  title?: string;
  showText?: boolean;
}

export const CopyButton: React.FC<CopyButtonProps> = ({
  text,
  className = 'text-slate-400 hover:text-white transition',
  iconClassName = 'w-3.5 h-3.5',
  title = 'Copy to clipboard',
  showText = false,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={className}
      title={title}
    >
      {copied ? (
        <Check className={`${iconClassName} text-emerald-400`} />
      ) : (
        <Copy className={iconClassName} />
      )}
      {showText && (
        <span className={copied ? 'text-emerald-400' : ''}>
          {copied ? 'Copied' : 'Copy'}
        </span>
      )}
    </button>
  );
};
