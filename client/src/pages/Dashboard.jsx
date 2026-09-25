import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Navbar } from '../components/Navbar';
import {
  Plus,
  Search,
  FileCode,
  FileText,
  Trash2,
  Share2,
  Clock,
  Sparkles,
  Users,
  FolderOpen,
  X,
  Code,
} from 'lucide-react';

const TEMPLATES = [
  {
    id: 'js',
    title: 'JavaScript Async Worker',
    language: 'javascript',
    icon: Code,
    content: `// Real-Time Collaborative JavaScript Module\n\nexport async function computeSync(data) {\n  console.log('[Worker] Processing streaming event:', data);\n  return { status: 'processed', timestamp: Date.now() };\n}\n`,
  },
  {
    id: 'py',
    title: 'Python Data Pipeline',
    language: 'python',
    icon: FileCode,
    content: `# Real-Time Python Script\n\ndef stream_processor(records):\n    """Process incoming streaming events with live collaboration."""\n    print(f"Ingesting {len(records)} events...")\n    return [r for r in records if r.get('active')]\n`,
  },
  {
    id: 'md',
    title: 'Engineering Spec / RFC',
    language: 'markdown',
    icon: FileText,
    content: `# Architecture Specification\n\n## 1. Overview\nDocumenting real-time synchronization requirements and REST schema.\n\n## 2. Protocol\n- Transport: WebSockets (Socket.io)\n- Fallback: Long polling\n`,
  },
];

export const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Create Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newLanguage, setNewLanguage] = useState('javascript');
  const [creating, setCreating] = useState(false);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const res = await api.getDocuments();
      if (res.success) {
        setDocuments(res.documents || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleCreateDocument = async (e, customTemplate = null) => {
    if (e) e.preventDefault();
    setCreating(true);

    try {
      const title = customTemplate ? customTemplate.title : (newTitle.trim() || 'Untitled Workspace');
      const language = customTemplate ? customTemplate.language : newLanguage;
      const content = customTemplate ? customTemplate.content : '// Start collaborating live with your team\n';

      const res = await api.createDocument({ title, language, content });
      if (res.success && res.document) {
        setIsModalOpen(false);
        setNewTitle('');
        navigate(`/document/${res.document._id}`);
      }
    } catch (err) {
      setError(err.message || 'Failed to create document');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to permanently delete this document room?')) return;

    try {
      await api.deleteDocument(id);
      setDocuments((prev) => prev.filter((doc) => doc._id !== id));
    } catch (err) {
      alert(`Deletion failed: ${err.message}`);
    }
  };

  const filteredDocs = documents.filter((doc) =>
    (doc.title || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 flex flex-col bg-tech-grid relative">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 border-b border-white/10">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-2.5">
              <span>Developer Workspaces</span>
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Active document rooms, collaborative snippets, and shared code canvases
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsModalOpen(true)}
              className="relative group inline-flex items-center justify-center p-[1px] rounded-full overflow-hidden text-xs font-semibold shadow-glow-cyan"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-brand-cyan to-brand-indigo rounded-full opacity-90 group-hover:opacity-100 transition-opacity" />
              <span className="relative flex items-center gap-1.5 px-4 py-2 rounded-full bg-black text-white group-hover:bg-black/80 transition-colors">
                <Plus className="w-4 h-4 text-brand-cyan" />
                New Document
              </span>
            </button>
          </div>
        </div>

        {/* Quick Starters / Templates */}
        <div className="my-8">
          <div className="text-xs font-mono uppercase tracking-wider text-zinc-400 mb-3 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-brand-cyan" />
            Instant Collaborative Templates
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {TEMPLATES.map((tmpl) => {
              const Icon = tmpl.icon;
              return (
                <button
                  key={tmpl.id}
                  onClick={() => handleCreateDocument(null, tmpl)}
                  disabled={creating}
                  className="p-4 rounded-xl bg-[#0d0d0d] border border-white/10 hover:border-brand-cyan/40 text-left transition-all group hover:scale-[1.01] flex items-start gap-3.5 shadow-sm"
                >
                  <div className="p-2.5 rounded-lg bg-zinc-900 border border-white/10 text-brand-cyan group-hover:border-brand-cyan/50">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white group-hover:text-brand-cyan transition-colors">
                      {tmpl.title}
                    </h3>
                    <p className="text-xs text-zinc-500 font-mono mt-0.5">
                      Launch {tmpl.language} room
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-zinc-500" />
            <input
              type="text"
              placeholder="Search workspaces by title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0d0d0d] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-brand-cyan/50"
            />
          </div>

          <div className="text-xs font-mono text-zinc-400 flex items-center gap-2 self-end sm:self-center">
            <span>{filteredDocs.length} Workspaces</span>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-3 mb-6 rounded-xl bg-red-950/40 border border-red-800/40 text-red-400 text-xs">
            {error}
          </div>
        )}

        {/* Loading Spinner */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-brand-cyan/20 border-t-brand-cyan animate-spin" />
            <span className="text-xs font-mono text-zinc-500">FETCHING WORKSPACES...</span>
          </div>
        ) : filteredDocs.length === 0 ? (
          /* Empty State */
          <div className="py-20 text-center rounded-2xl border border-dashed border-white/10 bg-[#0a0a0a]/50 p-8">
            <FolderOpen className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-white">No documents found</h3>
            <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
              {searchQuery
                ? `No documents match "${searchQuery}". Try a different keyword.`
                : 'Create your first collaborative document room to code together in real time.'}
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-5 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-zinc-900 border border-white/10 text-xs font-medium text-white hover:border-brand-cyan/40"
            >
              <Plus className="w-3.5 h-3.5 text-brand-cyan" />
              Create Document
            </button>
          </div>
        ) : (
          /* Documents Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredDocs.map((doc) => {
              const isOwner = doc.owner?._id === user?._id || doc.owner === user?._id;
              const collaboratorCount = (doc.collaborators || []).length;

              return (
                <Link
                  key={doc._id}
                  to={`/document/${doc._id}`}
                  className="group relative p-5 rounded-2xl bg-[#0a0a0a] border border-white/10 hover:border-brand-cyan/40 transition-all shadow-glow-card flex flex-col justify-between"
                >
                  <div>
                    {/* Top Row: Language Tag & Delete */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono uppercase tracking-wider bg-zinc-900 border border-white/10 text-brand-cyan">
                        {doc.language || 'code'}
                      </span>

                      {isOwner && (
                        <button
                          onClick={(e) => handleDelete(e, doc._id)}
                          title="Delete Document"
                          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-zinc-900 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="text-base font-semibold text-white group-hover:text-brand-cyan transition-colors truncate">
                      {doc.title || 'Untitled Document'}
                    </h3>

                    {/* Snippet Preview */}
                    <p className="text-xs text-zinc-500 font-mono mt-2 line-clamp-2 bg-black/40 p-2 rounded-lg border border-white/5">
                      {doc.content
                        ? doc.content.slice(0, 120)
                        : '// Empty document canvas'}
                    </p>
                  </div>

                  {/* Bottom Meta */}
                  <div className="mt-5 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-zinc-500 font-mono">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>
                        {new Date(doc.updatedAt || doc.createdAt).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {collaboratorCount > 0 && (
                        <span className="flex items-center gap-1 text-zinc-400">
                          <Users className="w-3.5 h-3.5 text-brand-indigo" />
                          <span>{collaboratorCount}</span>
                        </span>
                      )}

                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full border ${
                          isOwner
                            ? 'text-brand-cyan bg-brand-cyan/10 border-brand-cyan/20'
                            : 'text-zinc-400 bg-zinc-900 border-white/10'
                        }`}
                      >
                        {isOwner ? 'Owner' : 'Shared'}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>

      {/* New Document Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="w-full max-w-md bg-[#0d0d0d] border border-white/10 rounded-2xl p-6 relative shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <h3 className="text-base font-semibold text-white">Create New Workspace</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDocument} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                  Document Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Realtime Microservice API"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-brand-cyan/50"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                  Language / File Type
                </label>
                <select
                  value={newLanguage}
                  onChange={(e) => setNewLanguage(e.target.value)}
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-brand-cyan/50 font-mono"
                >
                  <option value="javascript">JavaScript (.js)</option>
                  <option value="typescript">TypeScript (.ts)</option>
                  <option value="python">Python (.py)</option>
                  <option value="markdown">Markdown (.md)</option>
                  <option value="html">HTML5 (.html)</option>
                  <option value="json">JSON (.json)</option>
                  <option value="plaintext">Plain Text</option>
                </select>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-white bg-zinc-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-brand-cyan to-brand-indigo text-white text-xs font-semibold hover:opacity-90 disabled:opacity-50"
                >
                  {creating ? 'Creating...' : 'Create Workspace'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
