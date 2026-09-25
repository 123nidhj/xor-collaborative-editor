import React from 'react';
import { Link } from 'react-router-dom';

export const Navbar = () => {
  return (
    <header className="sticky top-0 z-50 w-full bg-white/75 backdrop-blur-md border-b border-pink-200/70 transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Rounded Friendly Wordmark in dark maroon #4A0E2A */}
        <Link to="/" className="flex items-center gap-2 group select-none">
          <span className="w-3 h-3 rounded-full bg-pink-500 shadow-sm shadow-pink-300"></span>
          <span className="font-wordmark text-2xl font-extrabold tracking-tight text-[#4A0E2A] group-hover:opacity-90 transition-opacity">
            XOR
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            to="/Collaborate"
            className="px-5 py-2 rounded-full text-xs sm:text-sm font-bold text-white bg-pink-500 hover:bg-pink-600 transition-all shadow-sm shadow-pink-200"
          >
            Open a Room
          </Link>
        </div>
      </div>
    </header>
  );
};
