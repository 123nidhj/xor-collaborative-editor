import React, { useState } from 'react';
import { api } from '../services/api';
import { X, UserPlus, Copy, Check, Shield, UserCheck } from 'lucide-react';

export const ShareModal = ({
  isOpen,
  onClose,
  documentId,
  documentTitle,
  owner,
  collaborators = [],
  onCollaboratorAdded,
}) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('editor');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleShare = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await api.shareDocument(documentId, { email, role });
      if (res.success) {
        setSuccessMsg(res.message || 'Collaborator added successfully');
        setEmail('');
        if (onCollaboratorAdded && res.document) {
          onCollaboratorAdded(res.document);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to share document');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-[#0d0d0d] border border-white/10 rounded-2xl shadow-2xl p-6 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-cyan via-brand-indigo to-brand-purple" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <h3 className="text-base font-semibold text-white">Share Document</h3>
            <p className="text-xs text-zinc-400 mt-0.5 truncate max-w-[260px]">
              {documentTitle || 'Untitled Document'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Share Form */}
        <form onSubmit={handleShare} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
              Add Collaborator by Email
            </label>
            <div className="flex gap-2">
              <input
                type="email"
                required
                placeholder="colleague@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-black/60 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-brand-cyan/50 focus:ring-1 focus:ring-brand-cyan/50 font-sans"
              />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-brand-cyan/50"
              >
                <option value="editor">Editor</option>
                <option value="viewer">Viewer</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="p-2.5 rounded-lg bg-red-950/40 border border-red-800/40 text-red-400 text-xs">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-800/40 text-emerald-400 text-xs">
              {successMsg}
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-brand-cyan to-brand-indigo text-white text-xs font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              <UserPlus className="w-3.5 h-3.5" />
              {loading ? 'Inviting...' : 'Invite'}
            </button>
          </div>
        </form>

        {/* Existing Collaborators List */}
        <div className="mt-6 pt-4 border-t border-white/10">
          <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-3">
            People with Access
          </label>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {/* Owner */}
            <div className="flex items-center justify-between p-2 rounded-xl bg-black/40 border border-white/5">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-black"
                  style={{ backgroundColor: owner?.avatarColor || '#06b6d4' }}
                >
                  {owner?.name ? owner.name.charAt(0).toUpperCase() : 'O'}
                </div>
                <div>
                  <div className="text-xs font-medium text-white flex items-center gap-1.5">
                    {owner?.name} <span className="text-[10px] text-zinc-500 font-normal">(You)</span>
                  </div>
                  <div className="text-[11px] text-zinc-500">{owner?.email}</div>
                </div>
              </div>
              <span className="text-[11px] font-mono text-brand-cyan bg-brand-cyan/10 px-2 py-0.5 rounded-full border border-brand-cyan/20">
                Owner
              </span>
            </div>

            {/* Other Collaborators */}
            {collaborators.map((c, i) => {
              const u = c.user || {};
              return (
                <div
                  key={u._id || i}
                  className="flex items-center justify-between p-2 rounded-xl bg-black/40 border border-white/5"
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-black"
                      style={{ backgroundColor: u.avatarColor || '#6366f1' }}
                    >
                      {u.name ? u.name.charAt(0).toUpperCase() : 'C'}
                    </div>
                    <div>
                      <div className="text-xs font-medium text-white">{u.name || 'User'}</div>
                      <div className="text-[11px] text-zinc-500">{u.email}</div>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono capitalize text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded-full">
                    {c.role || 'editor'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Copy Link Footer */}
        <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between">
          <div className="text-[11px] text-zinc-500">
            Anyone with access can view or edit
          </div>
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 text-xs font-medium text-zinc-300 hover:text-white px-3 py-1.5 rounded-lg bg-zinc-900 border border-white/10 hover:border-white/20 transition-all"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-zinc-400" />
                Copy Link
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
