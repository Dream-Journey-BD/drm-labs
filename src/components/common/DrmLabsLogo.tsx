import React from 'react';

interface DrmLabsLogoProps {
  className?: string;
  size?: number;
}

export const DrmLabsLogo: React.FC<DrmLabsLogoProps> = ({
  className = '',
  size = 32,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 128 128"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
    >
      <defs>
        <linearGradient id="svBrandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="50%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>

        <linearGradient id="svGlowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#818cf8" />
        </linearGradient>
      </defs>

      {/* Outer Squircle Container */}
      <rect x="4" y="4" width="120" height="120" rx="30" fill="#090d16" />
      <rect x="4" y="4" width="120" height="120" rx="30" stroke="#1e293b" strokeWidth="2" />
      <rect
        x="6"
        y="6"
        width="116"
        height="116"
        rx="28"
        stroke="url(#svBrandGrad)"
        strokeWidth="1.2"
        strokeOpacity="0.3"
      />

      {/* Vault Shield */}
      <path
        d="M64 22 L94 34 V60 C94 80 81 97 64 104 C47 97 34 80 34 60 V34 Z"
        fill="#0f172a"
        stroke="#334155"
        strokeWidth="2"
      />
      <path
        d="M64 25 L91 36 V59 C91 77 79 93 64 100 C49 93 37 77 37 59 V36 Z"
        stroke="url(#svBrandGrad)"
        strokeWidth="1.5"
        strokeOpacity="0.45"
        fill="none"
      />

      {/* Play Symbol */}
      <path
        d="M54 44.5 C54 42.8 55.9 41.7 57.4 42.6 L78.8 54.8 C80.3 55.6 80.3 57.8 78.8 58.7 L57.4 70.9 C55.9 71.7 54 70.7 54 68.9 Z"
        fill="url(#svBrandGrad)"
      />

      {/* Keyhole / DRM Vault Notch */}
      <circle cx="64" cy="56.5" r="4.2" fill="#090d16" />
      <path d="M62.6 57.5 L61.5 67 H66.5 L65.4 57.5 Z" fill="#090d16" />

      {/* Broadcast Signal Waves */}
      <path
        d="M97 42 C103 48 103 64 97 70"
        stroke="url(#svGlowGrad)"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <path
        d="M104 35 C112 43.5 112 72.5 104 81"
        stroke="#6366f1"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeOpacity="0.8"
      />
    </svg>
  );
};
