import React from 'react';

export const NeonWave = () => {
  return (
    <div className="w-full max-w-2xl relative flex flex-col items-center justify-center my-1 select-none">
      {/* SVG Neon Wave in Baby Pink Palette */}
      <div className="w-full h-32 sm:h-36 overflow-visible pointer-events-none relative flex items-center justify-center">
        <svg
          className="w-full h-full animate-wave"
          viewBox="0 0 800 140"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="pinkGradient1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f472b6" stopOpacity="0" />
              <stop offset="25%" stopColor="#ec4899" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#f43f5e" stopOpacity="1" />
              <stop offset="75%" stopColor="#fb7185" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#fbcfe8" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="softBlush" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#fbcfe8" stopOpacity="0" />
              <stop offset="35%" stopColor="#f472b6" stopOpacity="0.9" />
              <stop offset="65%" stopColor="#fda4af" stopOpacity="1" />
              <stop offset="100%" stopColor="#f472b6" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="accentLine" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#fbcfe8" stopOpacity="0" />
              <stop offset="30%" stopColor="#f472b6" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#fda4af" stopOpacity="0.9" />
            </linearGradient>
          </defs>
          <line x1="40" y1="70" x2="300" y2="70" stroke="url(#accentLine)" strokeWidth="2" strokeLinecap="round" />
          <path d="M 220 70 C 270 70, 300 32, 360 42 C 410 52, 430 98, 480 65 C 530 28, 580 92, 630 65 C 670 42, 690 70, 740 70" stroke="url(#pinkGradient1)" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M 250 70 C 290 70, 320 88, 370 65 C 420 42, 450 32, 490 82 C 540 120, 590 42, 630 70 C 660 88, 690 70, 720 70" stroke="url(#softBlush)" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  );
};
