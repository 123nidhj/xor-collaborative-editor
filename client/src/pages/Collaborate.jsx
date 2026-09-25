import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Terminal, Check, ArrowLeft } from 'lucide-react';

export const Collaborate = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const defaultRoomId = new URLSearchParams(location.search).get('room') || '';
  const [roomId, setRoomId] = useState(defaultRoomId);
  const [username, setUsername] = useState(localStorage.getItem('xor_username') || '');
  const [error, setError] = useState('');
  const [notification, setNotification] = useState('');

  const handleGenerateRoom = (e) => {
    e.preventDefault();
    const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let randomPart = '';
    for (let i = 0; i < 8; i++) {
      if (i === 4) randomPart += '-';
      randomPart += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    const newId = `xor-${randomPart}`;
    setRoomId(newId);
    setError('');
    setNotification('✓ New Room ID generated! Enter your name and click Join Now. 🌸');
    setTimeout(() => setNotification(''), 4000);
  };

  const handleJoin = (e) => {
    e.preventDefault();
    const cleanRoom = roomId.trim();
    const cleanUser = username.trim();

    if (!cleanRoom) {
      setError('Please provide or generate a Room ID.');
      return;
    }
    if (!cleanUser) {
      setError('Please enter your name to join the session.');
      return;
    }

    localStorage.setItem('xor_username', cleanUser);
    navigate(`/editor/${cleanRoom}`, { state: { username: cleanUser } });
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

      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 rounded-xl bg-pink-500 flex items-center justify-center text-white shadow-sm shadow-pink-300">
          <Terminal className="w-4 h-4 text-white" />
        </div>
        <span className="font-bold text-base tracking-wider text-pink-950 font-mono">XOR</span>
      </div>

      <div className="w-full max-w-[400px] bg-white rounded-3xl p-8 shadow-md shadow-pink-100 border border-pink-200/90">
        <h1 className="text-2xl font-extrabold text-pink-950 text-center tracking-tight">
          Welcome back 💕
        </h1>
        <p className="text-xs text-pink-600 text-center mt-1 mb-6">
          Paste Your Room ID
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
            <label className="block text-xs font-bold uppercase tracking-wider text-pink-900 mb-1.5 font-mono">
              ROOM ID
            </label>
            <input
              type="text"
              placeholder="Enter Your Room ID"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-pink-200 bg-pink-50/40 text-sm text-pink-950 placeholder:text-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-pink-900 mb-1.5">Name</label>
            <input
              type="text"
              placeholder="Enter Your Name"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-pink-200 bg-pink-50/40 text-sm text-pink-950 placeholder:text-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400"
            />
          </div>

          <button
            type="submit"
            className="w-full mt-2 py-3 px-4 rounded-xl bg-pink-500 hover:bg-pink-600 text-white text-sm font-bold transition-all shadow-md shadow-pink-200 active:scale-[0.99]"
          >
            Join Now 🚀
          </button>
        </form>

        <div className="text-center text-xs text-pink-700 mt-6 pt-2">
          Don't have Any Room ID?{' '}
          <button
            type="button"
            onClick={handleGenerateRoom}
            className="underline font-bold text-pink-600 hover:text-pink-900 transition-colors"
          >
            Generate Now
          </button>
        </div>
      </div>
    </div>
  );
};
