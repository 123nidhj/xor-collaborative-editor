import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Terminal, Check, ArrowLeft, Lock, Shield, AlertTriangle, KeyRound } from 'lucide-react';

export const Collaborate = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const defaultRoomId = new URLSearchParams(location.search).get('room') || '';
  const [roomId, setRoomId] = useState(defaultRoomId);
  const [username, setUsername] = useState(localStorage.getItem('xor_username') || '');
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');
  const [notification, setNotification] = useState('');

  // 1. Cryptographically Secure Unique Room Generator
  const handleGenerateRoom = (e) => {
    e.preventDefault();
    // 32-character set (without confusing characters 0/o/1/l)
    const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
    const randVals = new Uint8Array(8);
    window.crypto.getRandomValues(randVals);
    let part1 = '';
    let part2 = '';
    for (let i = 0; i < 4; i++) part1 += chars[randVals[i] % chars.length];
    for (let i = 4; i < 8; i++) part2 += chars[randVals[i] % chars.length];

    const uniqueId = `xor-${part1}-${part2}`;
    setRoomId(uniqueId);
    setError('');
    setNotification('✓ Generated unique Room ID! No other group will collide with this. 🌸');
    setTimeout(() => setNotification(''), 4500);
  };

  const isShortRoom = roomId.trim().length > 0 && roomId.trim().length < 5;

  const handleJoin = (e) => {
    e.preventDefault();
    const cleanRoom = roomId.trim();
    const cleanUser = username.trim();
    const cleanPass = passcode.trim();

    if (!cleanRoom) {
      setError('Please provide or generate a Room ID.');
      return;
    }
    if (!cleanUser) {
      setError('Please enter your name to join the session.');
      return;
    }

    localStorage.setItem('xor_username', cleanUser);
    navigate(`/editor/${cleanRoom}`, {
      state: {
        username: cleanUser,
        passcode: cleanPass,
      },
    });
  };

  return (
    <div className="min-h-screen bg-[#fdf2f8] text-pink-950 flex flex-col items-center justify-center p-4 relative font-sans">
      <Link
        to="/"
        className="absolute top-6 left-6 flex items-center gap-1.5 text-xs font-mono font-bold text-pink-600 hover:text-pink-900 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Home</span>
      </Link>

      <Link to="/" className="flex items-center gap-2 mb-6 select-none group">
        <span className="w-3 h-3 rounded-full bg-pink-500 shadow-sm shadow-pink-300"></span>
        <span className="font-wordmark text-2xl font-extrabold tracking-tight text-[#4A0E2A] group-hover:opacity-90 transition-opacity">
          XOR
        </span>
      </Link>

      <div className="w-full max-w-[420px] bg-white rounded-3xl p-8 shadow-md shadow-pink-100 border border-pink-200/90">
        <h1 className="text-2xl font-extrabold text-pink-950 text-center tracking-tight">
          Welcome back 💕
        </h1>
        <p className="text-xs text-pink-600 text-center mt-1 mb-5">
          Paste Your Room ID or Generate a Private One
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
            {error}
          </div>
        )}

        {notification && (
          <div className="mb-4 p-3 rounded-xl bg-pink-50 border border-pink-300 text-pink-800 text-xs flex items-center gap-1.5 font-medium">
            <Check className="w-3.5 h-3.5 text-pink-600 shrink-0" />
            <span>{notification}</span>
          </div>
        )}

        <form onSubmit={handleJoin} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-pink-900 font-mono">
                ROOM ID
              </label>
              <button
                type="button"
                onClick={handleGenerateRoom}
                className="text-[11px] font-bold text-pink-600 hover:text-pink-900 transition-colors"
              >
                + Generate Unique
              </button>
            </div>
            <input
              type="text"
              placeholder="e.g. xor-8f2a-4c9b"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-pink-200 bg-pink-50/40 text-sm text-pink-950 placeholder:text-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400 font-mono"
            />

            {/* Warning if room ID is too short and could collide */}
            {isShortRoom && (
              <div className="mt-2 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] flex items-start gap-1.5 leading-snug">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Tip:</strong> Short IDs like <code>{roomId}</code> can be guessed by other students! Click <strong>+ Generate Unique</strong> for a private room.
                </span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-pink-900 mb-1.5">Your Name</label>
            <input
              type="text"
              placeholder="e.g. Nidhi"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-pink-200 bg-pink-50/40 text-sm text-pink-950 placeholder:text-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400"
            />
          </div>



          <button
            type="submit"
            className="w-full mt-2 py-3 px-4 rounded-xl bg-pink-500 hover:bg-pink-600 text-white text-sm font-bold transition-all shadow-md shadow-pink-200 active:scale-[0.99] flex items-center justify-center gap-2"
          >
            <span>Join Now 🚀</span>
          </button>
        </form>

        <div className="text-center text-xs text-pink-700 mt-5 pt-2 border-t border-pink-100">
          Don't have a Room ID?{' '}
          <button
            type="button"
            onClick={handleGenerateRoom}
            className="underline font-bold text-pink-600 hover:text-pink-900 transition-colors"
          >
            Generate Unique Room
          </button>
        </div>
      </div>
    </div>
  );
};
