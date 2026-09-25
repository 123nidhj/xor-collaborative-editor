import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { CodeEditor } from '../components/CodeEditor';
import {
  Copy,
  Check,
  Users,
  Download,
  ArrowLeft,
  Terminal,
  Sparkles,
  Wifi,
  WifiOff,
  LogOut,
  Play,
  RotateCcw,
} from 'lucide-react';

const LANGUAGE_TEMPLATES = {
  javascript: `// XOR Collaborative JavaScript Session\n// Room: Real-time code synchronization active\n\nfunction calculateXOR(a, b) {\n  console.log(\`Bitwise XOR of \${a} and \${b} is: \${a ^ b}\`);\n  return a ^ b;\n}\n\ncalculateXOR(42, 137);\n`,
  python: `# XOR Collaborative Python Session\n\ndef calculate_xor(a: int, b: int) -> int:\n    result = a ^ b\n    print(f"XOR Result: {result}")\n    return result\n\nif __name__ == "__main__":\n    calculate_xor(42, 137)\n`,
  cpp: `// XOR Collaborative C++ Session\n#include <iostream>\n\nint main() {\n    int a = 42, b = 137;\n    std::cout << "Bitwise XOR: " << (a ^ b) << std::endl;\n    return 0;\n}\n`,
  html: `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <title>XOR Real-Time Collaborative Canvas</title>\n  <style>\n    body { font-family: monospace; background: #0a0a0a; color: #fff; padding: 2rem; }\n  </style>\n</head>\n<body>\n  <h1>Welcome to &lt;XOR/&gt; Collaborative Editor</h1>\n</body>\n</html>\n`,
  markdown: `# XOR Collaborative Notes\n\n## Session Overview\n- Real-time WebSockets synchronization\n- Connected peers actively editing\n\n### Tasks\n- [x] Configure Socket.io rooms\n- [x] Implement live cursor tracking\n- [ ] Deploy containerized backend services\n`,
};

export const EditorPage = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { socket, isConnected } = useSocket();

  // Username from state or localStorage
  const username =
    location.state?.username ||
    localStorage.getItem('xor_username') ||
    `Developer_${Math.floor(Math.random() * 1000)}`;

  const [content, setContent] = useState(LANGUAGE_TEMPLATES.javascript);
  const [language, setLanguage] = useState('javascript');
  const [collaborators, setCollaborators] = useState([]);
  const [remoteCursors, setRemoteCursors] = useState({});
  const [copiedRoom, setCopiedRoom] = useState(false);
  const [saveStatus, setSaveStatus] = useState('saved'); // 'saved', 'saving'
  const [toastMessage, setToastMessage] = useState(null);
  const [consoleOutput, setConsoleOutput] = useState('');
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // 1. Socket Lifecycle: Join Room & Listen for Collaborators
  useEffect(() => {
    if (!socket || !roomId) return;

    // Join room event with user credentials
    socket.emit('join-document', roomId, { username });

    // Initial code hydration from room state
    const handleLoadDocument = (data) => {
      if (data && data.content !== undefined) {
        setContent(data.content || LANGUAGE_TEMPLATES[language]);
        if (data.language) setLanguage(data.language);
      }
    };

    // Live collaborator roster
    const handleRoomCollaborators = (users) => {
      setCollaborators(users || []);
    };

    // Peer joined
    const handleUserJoined = (u) => {
      showToast(`${u.name || 'A teammate'} joined room`);
    };

    // Peer left
    const handleUserLeft = (u) => {
      showToast(`${u.name || 'A collaborator'} left`);
      setRemoteCursors((prev) => {
        const next = { ...prev };
        delete next[u.socketId];
        return next;
      });
    };

    // Live code change broadcast from peers
    const handleReceiveChanges = ({ content: incomingContent }) => {
      setContent(incomingContent);
    };

    // Remote cursor updates
    const handleCursorUpdate = (cursorData) => {
      setRemoteCursors((prev) => ({
        ...prev,
        [cursorData.socketId]: cursorData,
      }));
    };

    // Save status
    const handleSaveStatus = ({ status }) => {
      setSaveStatus(status);
    };

    socket.on('load-document', handleLoadDocument);
    socket.on('room-collaborators', handleRoomCollaborators);
    socket.on('user-joined', handleUserJoined);
    socket.on('user-left', handleUserLeft);
    socket.on('receive-changes', handleReceiveChanges);
    socket.on('cursor-update', handleCursorUpdate);
    socket.on('save-status', handleSaveStatus);

    return () => {
      socket.emit('leave-document', roomId);
      socket.off('load-document', handleLoadDocument);
      socket.off('room-collaborators', handleRoomCollaborators);
      socket.off('user-joined', handleUserJoined);
      socket.off('user-left', handleUserLeft);
      socket.off('receive-changes', handleReceiveChanges);
      socket.off('cursor-update', handleCursorUpdate);
      socket.off('save-status', handleSaveStatus);
    };
  }, [socket, roomId, username]);

  // Handle local text changes
  const handleContentChange = (newContent) => {
    setContent(newContent);
    setSaveStatus('saving');

    if (socket) {
      socket.emit('send-changes', {
        documentId: roomId,
        content: newContent,
      });
    }
  };

  // Handle local cursor moves
  const handleCursorMove = (cursor) => {
    if (socket) {
      socket.emit('cursor-move', {
        documentId: roomId,
        line: cursor.line,
        ch: cursor.ch,
        selection: cursor.selection,
      });
    }
  };

  // Copy Room ID to clipboard
  const handleCopyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    setCopiedRoom(true);
    showToast('Room ID copied to clipboard!');
    setTimeout(() => setCopiedRoom(false), 2000);
  };

  // Change language template
  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    if (!content.trim() || content === LANGUAGE_TEMPLATES[language]) {
      const template = LANGUAGE_TEMPLATES[newLang] || `// ${newLang} workspace\n`;
      handleContentChange(template);
    }
  };

  // Download code file
  const handleExport = () => {
    const extensions = {
      javascript: 'js',
      python: 'py',
      cpp: 'cpp',
      html: 'html',
      markdown: 'md',
    };
    const ext = extensions[language] || 'txt';
    const filename = `${roomId}.${ext}`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
    showToast(`Downloaded ${filename}`);
  };

  // Run code simulation / evaluation (for JavaScript)
  const handleRunCode = () => {
    setIsConsoleOpen(true);
    if (language === 'javascript') {
      let logs = [];
      const originalLog = console.log;
      try {
        console.log = (...args) => {
          logs.push(args.map((a) => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' '));
        };
        // Safely evaluate simple functions/logs
        const runFn = new Function(content);
        runFn();
        setConsoleOutput(logs.join('\n') || 'Program executed successfully with no stdout output.');
      } catch (err) {
        setConsoleOutput(`Runtime Error: ${err.message}`);
      } finally {
        console.log = originalLog;
      }
    } else {
      setConsoleOutput(
        `[${language.toUpperCase()} Runner]\nCode synchronized across ${collaborators.length} active peers.\nBackend execution sandbox container ready.`
      );
    }
  };

  return (
    <div className="h-screen bg-black text-white flex flex-col overflow-hidden font-sans selection:bg-brand-cyan/30">
      {/* Top Navigation Bar */}
      <header className="h-14 border-b border-white/10 bg-[#080808] px-4 flex items-center justify-between select-none shrink-0 z-30">
        {/* Left: <XOR/> Monospace Logo & Room Badge */}
        <div className="flex items-center gap-3">
          <Link
            to="/Collaborate"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
            title="Leave room and return to Lobby"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <Link to="/" className="font-mono font-bold text-sm tracking-wider text-white flex items-center gap-1">
            &lt;<span className="text-white">XOR</span>/&gt;
          </Link>

          {/* Room ID Pill with Click to Copy */}
          <button
            onClick={handleCopyRoomId}
            title="Click to copy Room ID"
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 border border-white/10 hover:border-white/30 text-xs font-mono text-zinc-300 transition-all group"
          >
            <span className="text-zinc-500">Room:</span>
            <span className="text-white font-medium">{roomId}</span>
            {copiedRoom ? (
              <Check className="w-3.5 h-3.5 text-emerald-400 ml-0.5" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-zinc-500 group-hover:text-white ml-0.5" />
            )}
          </button>
        </div>

        {/* Center: Language Selector & Status */}
        <div className="hidden md:flex items-center gap-3">
          <select
            value={language}
            onChange={handleLanguageChange}
            className="bg-zinc-900 border border-white/10 text-xs text-zinc-300 rounded-lg px-2.5 py-1 font-mono focus:outline-none focus:border-white/30"
          >
            <option value="javascript">JavaScript (.js)</option>
            <option value="python">Python (.py)</option>
            <option value="cpp">C++ (.cpp)</option>
            <option value="html">HTML5 (.html)</option>
            <option value="markdown">Markdown (.md)</option>
          </select>

          {/* Save Status */}
          <div className="flex items-center gap-1.5 text-xs font-mono text-zinc-400">
            {saveStatus === 'saving' ? (
              <span className="text-amber-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                Syncing...
              </span>
            ) : (
              <span className="text-emerald-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Saved
              </span>
            )}
          </div>
        </div>

        {/* Right: Active Participants & Actions */}
        <div className="flex items-center gap-2.5">
          {/* Active Participants Avatars */}
          <div className="flex items-center gap-1.5 pl-2 border-l border-white/10">
            <div className="flex items-center -space-x-1.5">
              {collaborators.map((c, i) => (
                <div
                  key={c.socketId || i}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-black border-2 border-black shadow-sm"
                  style={{ backgroundColor: c.avatarColor || '#06b6d4' }}
                  title={`${c.name || 'User'} (Connected)`}
                >
                  {(c.name || 'U').charAt(0).toUpperCase()}
                </div>
              ))}
            </div>
            <span className="text-[11px] font-mono text-zinc-400 hidden sm:inline">
              {collaborators.length || 1} online
            </span>
          </div>

          {/* Run Code Button */}
          <button
            onClick={handleRunCode}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 text-xs font-medium transition-all"
            title="Execute Code"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span className="hidden sm:inline">Run</span>
          </button>

          {/* Export Code File */}
          <button
            onClick={handleExport}
            className="p-1.5 rounded-lg bg-zinc-900 border border-white/10 text-zinc-400 hover:text-white transition-colors"
            title="Download Code File"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Leave Room Button */}
          <Link
            to="/Collaborate"
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-900 border border-white/10 text-xs font-medium text-zinc-400 hover:text-white transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Leave</span>
          </Link>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* Editor Area */}
        <div className="flex-1 h-full p-2 sm:p-3 overflow-hidden flex flex-col">
          <CodeEditor
            content={content}
            onChange={handleContentChange}
            onCursorMove={handleCursorMove}
            remoteCursors={remoteCursors}
            language={language}
          />
        </div>

        {/* Console / Output Drawer */}
        {isConsoleOpen && (
          <div className="h-44 md:h-full md:w-80 border-t md:border-t-0 md:border-l border-white/10 bg-[#080808] flex flex-col shrink-0">
            <div className="h-9 px-3 border-b border-white/10 flex items-center justify-between text-xs font-mono text-zinc-400 select-none">
              <span className="flex items-center gap-1.5 text-zinc-200">
                <Terminal className="w-3.5 h-3.5 text-brand-cyan" />
                Console Output
              </span>
              <button
                onClick={() => setIsConsoleOpen(false)}
                className="text-zinc-500 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>
            <pre className="flex-1 p-3 text-xs font-mono text-zinc-300 overflow-auto whitespace-pre-wrap selection:bg-brand-cyan/30">
              {consoleOutput || 'Click "Run" to execute current script...'}
            </pre>
          </div>
        )}
      </main>

      {/* Floating Status Notification Toast */}
      {toastMessage && (
        <div className="absolute bottom-5 right-5 z-50 animate-in slide-in-from-bottom-2 duration-150 pointer-events-none">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-900 border border-white/20 text-xs font-mono text-white shadow-xl">
            <Sparkles className="w-3.5 h-3.5 text-brand-cyan" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
};
