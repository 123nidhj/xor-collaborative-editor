import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { NeonWave } from '../components/NeonWave';

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[#fff0f4] text-pink-950 flex flex-col relative overflow-hidden bg-pink-grid">
      <Navbar />

      <main className="flex-1 flex flex-col items-center justify-center pt-16 pb-20 px-4 sm:px-6 text-center max-w-5xl mx-auto w-full">
        {/* Bold Heading in Luxurious Rose Pink */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-pink-950 max-w-4xl leading-[1.08] mb-4">
          Code Together, <span className="bg-gradient-to-r from-pink-600 via-rose-500 to-pink-500 bg-clip-text text-transparent">Anywhere.</span>
        </h1>

        {/* Subtitle */}
        <p className="text-sm sm:text-base md:text-lg text-pink-800/80 max-w-xl mx-auto leading-relaxed mb-6 font-medium">
          Collaborate in Realtime, Boost Productivity &amp; Streamline Your Development Workflow.
        </p>

        {/* Centerpiece Neon Wave in Baby Pink */}
        <NeonWave />

        {/* Section: Make Coding Together an Enjoyable Experience */}
        <div className="w-full mt-12 pt-10 border-t border-pink-200/60 text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-pink-950 tracking-tight">
            Make Coding Together an Enjoyable Experience
          </h2>
          <p className="text-xs sm:text-sm text-pink-800/80 mt-1 max-w-md mx-auto">
            Real-time code synchronization, persistent room states, and cute participant presence for pair programmers.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 text-left">
            <div className="p-5 rounded-2xl bg-white/90 border border-pink-200/80 shadow-sm hover:shadow-md transition-all">
              <div className="w-8 h-8 rounded-xl bg-pink-100 flex items-center justify-center text-pink-600 mb-3 font-bold text-sm">
                ⚡
              </div>
              <h3 className="text-sm font-bold text-pink-950 mb-1">Instant Room Sync</h3>
              <p className="text-xs text-pink-700/80">Sub-15ms broadcast latency using Socket.io room multiplexing.</p>
            </div>

            <div className="p-5 rounded-2xl bg-white/90 border border-pink-200/80 shadow-sm hover:shadow-md transition-all">
              <div className="w-8 h-8 rounded-xl bg-pink-100 flex items-center justify-center text-pink-600 mb-3 font-bold text-sm">
                👥
              </div>
              <h3 className="text-sm font-bold text-pink-950 mb-1">Live Participant Tracking</h3>
              <p className="text-xs text-pink-700/80">Track connected peers with colored avatars and cursor positions.</p>
            </div>

            <div className="p-5 rounded-2xl bg-white/90 border border-pink-200/80 shadow-sm hover:shadow-md transition-all">
              <div className="w-8 h-8 rounded-xl bg-pink-100 flex items-center justify-center text-pink-600 mb-3 font-bold text-sm">
                💻
              </div>
              <h3 className="text-sm font-bold text-pink-950 mb-1">Multi-Language Code</h3>
              <p className="text-xs text-pink-700/80">JavaScript, Python, C++, HTML5, and Markdown with line gutters.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
