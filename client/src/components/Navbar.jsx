import React from 'react';
import { Link } from 'react-router-dom';

export const Navbar = () => {
  return (
    <header className="sticky top-0 z-50 w-full bg-white/70 backdrop-blur-md border-b border-pink-200/70 transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-1 group font-mono font-bold text-base sm:text-lg tracking-wider text-pink-900">
          <span className="text-pink-500 font-extrabold">&lt;</span>XOR<span className="text-pink-500 font-extrabold">/&gt;</span>
        </Link>

        <div>
          <Link
            to="/Collaborate"
            className="px-5 py-2 rounded-full text-xs sm:text-sm font-semibold text-pink-700 bg-pink-100/90 hover:bg-pink-200 border border-pink-300 transition-all shadow-sm shadow-pink-100"
          >
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
};
