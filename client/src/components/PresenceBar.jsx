import React from 'react';
import { Users, Wifi, WifiOff, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export const PresenceBar = ({
  collaborators = [],
  isConnected = false,
  saveStatus = 'saved', // 'saved', 'saving', 'error'
  lastSavedAt = null,
}) => {
  return (
    <div className="flex items-center gap-3 sm:gap-4 select-none">
      {/* Save Status Badge */}
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-900/90 border border-white/10 text-xs font-mono">
        {saveStatus === 'saving' && (
          <>
            <Clock className="w-3.5 h-3.5 text-amber-400 animate-spin" />
            <span className="text-zinc-400 hidden sm:inline">Saving...</span>
          </>
        )}
        {saveStatus === 'saved' && (
          <>
            <CheckCircle2 className="w-3.5 h-3.5 text-brand-emerald" />
            <span className="text-zinc-400 hidden sm:inline">
              {lastSavedAt ? `Saved ${new Date(lastSavedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Saved to Cloud'}
            </span>
          </>
        )}
        {saveStatus === 'error' && (
          <>
            <AlertCircle className="w-3.5 h-3.5 text-red-400" />
            <span className="text-red-400 hidden sm:inline">Save Error</span>
          </>
        )}
      </div>

      {/* WebSocket Status Indicator */}
      <div
        className="flex items-center gap-1.5 text-[11px] font-mono"
        title={isConnected ? 'Real-time WebSocket Live' : 'Reconnecting to WebSocket...'}
      >
        {isConnected ? (
          <span className="flex items-center gap-1 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="hidden md:inline">SYNCED</span>
          </span>
        ) : (
          <span className="flex items-center gap-1 text-amber-400">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="hidden md:inline">RECONNECTING</span>
          </span>
        )}
      </div>

      {/* Active Collaborators Avatars */}
      <div className="flex items-center -space-x-1.5 overflow-hidden pl-2 border-l border-white/10">
        {collaborators.map((c, index) => {
          const initial = c.name ? c.name.charAt(0).toUpperCase() : '?';
          return (
            <div
              key={c.socketId || index}
              className="relative group cursor-pointer transition-transform hover:scale-110 hover:z-20"
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-black border-2 border-[#0a0a0a] shadow-sm"
                style={{ backgroundColor: c.avatarColor || '#06b6d4' }}
              >
                {initial}
              </div>

              {/* Hover Tooltip */}
              <div className="absolute top-9 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col items-center z-50 pointer-events-none">
                <div className="bg-zinc-900 text-zinc-100 text-[11px] font-sans px-2 py-1 rounded shadow-xl border border-white/10 whitespace-nowrap">
                  <div className="font-semibold flex items-center gap-1">
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: c.avatarColor || '#06b6d4' }}
                    />
                    {c.name}
                  </div>
                  <div className="text-[10px] text-zinc-400">{c.email}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {collaborators.length > 0 && (
        <span className="text-[11px] font-mono text-zinc-500 hidden lg:inline">
          {collaborators.length} {collaborators.length === 1 ? 'user active' : 'users active'}
        </span>
      )}
    </div>
  );
};
