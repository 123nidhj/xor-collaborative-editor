import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { NeonWave } from '../components/NeonWave';

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[#fff0f4] text-pink-950 flex flex-col relative overflow-hidden bg-pink-grid">
      <Navbar />

      <main className="flex-1 flex flex-col items-center justify-center pt-16 pb-20 px-4 sm:px-6 text-center max-w-5xl mx-auto w-full">
        {/* Requested Headline: Write Code. Together. Live. */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-pink-950 max-w-4xl leading-[1.08] mb-4">
          Write Code.{' '}
          <span className="bg-gradient-to-r from-pink-600 via-rose-500 to-pink-500 bg-clip-text text-transparent">
            Together.
          </span>{' '}
          Live.
        </h1>

        {/* Requested Subtitle */}
        <p className="text-sm sm:text-base md:text-lg text-pink-900/85 max-w-2xl mx-auto leading-relaxed mb-6 font-medium">
          Open a room, share a link, and code with your team in real time. No setup, no friction.
        </p>

        {/* Requested Buttons: Open a Room & Try the Editor */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 mb-6 z-20">
          <Link
            to="/Collaborate"
            className="inline-flex items-center px-7 py-3 rounded-full bg-pink-500 hover:bg-pink-600 text-white text-sm font-bold shadow-lg shadow-pink-300/60 hover:shadow-xl hover:scale-105 transition-all duration-150 border border-pink-400"
          >
            Open a Room 🚀
          </Link>

          <Link
            to="/editor/xor-preview"
            className="inline-flex items-center px-7 py-3 rounded-full bg-pink-100/90 hover:bg-pink-200 text-[#4A0E2A] text-sm font-bold border border-pink-300/90 transition-all duration-150 shadow-sm"
          >
            Try the Editor ✨
          </Link>
        </div>

        {/* Centerpiece Neon Wave in Baby Pink */}
        <NeonWave />

        {/* Section: Make Coding Together an Enjoyable Experience */}
        <div className="w-full mt-10 pt-10 border-t border-pink-200/60 text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-pink-950 tracking-tight">
            Make Coding Together an Enjoyable Experience
          </h2>
          <p className="text-xs sm:text-sm text-pink-800/80 mt-1 max-w-md mx-auto font-medium">
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
                🔒
              </div>
              <h3 className="text-sm font-bold text-pink-950 mb-1">Room Lock &amp; PIN</h3>
              <p className="text-xs text-pink-700/80">Keep strangers out with secret 4-digit PINs and host room locks.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
