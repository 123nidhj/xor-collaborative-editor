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
  Lock,
  Unlock,
  ShieldAlert,
  Play,
  LogOut,
  KeyRound,
} from 'lucide-react';

const LANGUAGE_TEMPLATES = {
  javascript: `// XOR Collaborative JavaScript Session 🌸
// Real-time synchronization active across all peers

function calculateXOR(a, b) {
  const result = a ^ b;
  console.log(\`Bitwise XOR of \${a} and \${b} is: \${result}\`);
  return result;
}

calculateXOR(42, 137);
`,
  python: `# XOR Collaborative Python Session 🌸

def calculate_xor(a: int, b: int) -> int:
    result = a ^ b
    print(f"XOR Result: {result}")
    return result

if __name__ == "__main__":
    calculate_xor(42, 137)
`,
  cpp: `// XOR Collaborative C++ Session 🌸
#include <iostream>

int main() {
    int a = 42, b = 137;
    std::cout << "Bitwise XOR: " << (a ^ b) << std::endl;
    return 0;
}
`,
  html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>XOR Real-Time Collaborative Canvas</title>
  <style>
    body { font-family: monospace; background: #fff0f4; color: #831843; padding: 2rem; }
  </style>
</head>
<body>
  <h1>Welcome to &lt;XOR/&gt; Collaborative Editor 🌸</h1>
</body>
</html>
`,
  markdown: `# XOR Collaborative Notes 🌸

## Session Overview
- Real-time WebSockets synchronization
- Connected peers actively editing
- Private group room protection active
`,
};

export const EditorPage = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { socket, isConnected } = useSocket();

  const username =
    location.state?.username ||
    localStorage.getItem('xor_username') ||
    `Developer_${Math.floor(Math.random() * 1000)}`;

  const initialPasscode = location.state?.passcode || '';

  const [content, setContent] = useState(LANGUAGE_TEMPLATES.javascript);
  const [language, setLanguage] = useState('javascript');
  const [collaborators, setCollaborators] = useState([]);
  const [remoteCursors, setRemoteCursors] = useState({});
  const [copiedRoom, setCopiedRoom] = useState(false);
  const [saveStatus, setSaveStatus] = useState('saved');
  const [toastMessage, setToastMessage] = useState(null);
  const [consoleOutput, setConsoleOutput] = useState('');
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);

  // Security features: Lock Room & Passcode
  const [isRoomLocked, setIsRoomLocked] = useState(false);
  const [isPasscodeRequired, setIsPasscodeRequired] = useState(false);
  const [pinPrompt, setPinPrompt] = useState(initialPasscode);
  const [isBlockedLocked, setIsBlockedLocked] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Socket Lifecycle & Room Security Events
  useEffect(() => {
    if (!socket || !roomId) return;

    // Join room with username and passcode
    socket.emit('join-document', roomId, {
      username,
      passcode: initialPasscode,
    });

    const handleLoadDocument = (data) => {
      if (data && data.content !== undefined) {
        setContent(data.content || LANGUAGE_TEMPLATES[language]);
        if (data.language) setLanguage(data.language);
        if (data.isLocked !== undefined) setIsRoomLocked(data.isLocked);
      }
    };

    const handleRoomCollaborators = (users) => {
      setCollaborators(users || []);
    };

    const handleUserJoined = (u) => {
      showToast(`${u.name || 'Teammate'} joined room 🌸`);
    };

    const handleUserLeft = (u) => {
      showToast(`${u.name || 'A teammate'} left`);
      setRemoteCursors((prev) => {
        const next = { ...prev };
        delete next[u.socketId];
        return next;
      });
    };

    const handleReceiveChanges = ({ content: incomingContent }) => {
      setContent(incomingContent);
    };

    const handleCursorUpdate = (cursorData) => {
      setRemoteCursors((prev) => ({
        ...prev,
        [cursorData.socketId]: cursorData,
      }));
    };

    const handleSaveStatus = ({ status }) => {
      setSaveStatus(status);
    };

    // Room Lock & Security Events
    const handleRoomLockChanged = ({ isLocked }) => {
      setIsRoomLocked(isLocked);
      showToast(isLocked ? '🔒 Room is now LOCKED to outsiders' : '🔓 Room is now UNLOCKED');
    };

    const handleRoomLocked = () => {
      setIsBlockedLocked(true);
    };

    const handleInvalidPasscode = () => {
      setIsPasscodeRequired(true);
    };

    socket.on('load-document', handleLoadDocument);
    socket.on('room-collaborators', handleRoomCollaborators);
    socket.on('user-joined', handleUserJoined);
    socket.on('user-left', handleUserLeft);
    socket.on('receive-changes', handleReceiveChanges);
    socket.on('cursor-update', handleCursorUpdate);
    socket.on('save-status', handleSaveStatus);
    socket.on('room-lock-changed', handleRoomLockChanged);
    socket.on('room-locked', handleRoomLocked);
    socket.on('invalid-passcode', handleInvalidPasscode);

    return () => {
      socket.emit('leave-document', roomId);
      socket.off('load-document', handleLoadDocument);
      socket.off('room-collaborators', handleRoomCollaborators);
      socket.off('user-joined', handleUserJoined);
      socket.off('user-left', handleUserLeft);
      socket.off('receive-changes', handleReceiveChanges);
      socket.off('cursor-update', handleCursorUpdate);
      socket.off('save-status', handleSaveStatus);
      socket.off('room-lock-changed', handleRoomLockChanged);
      socket.off('room-locked', handleRoomLocked);
      socket.off('invalid-passcode', handleInvalidPasscode);
    };
  }, [socket, roomId, username, initialPasscode]);

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

  // Toggle Room Lock feature 🔒
  const handleToggleLock = () => {
    if (socket) {
      socket.emit('toggle-lock-room', {
        documentId: roomId,
      });
    }
  };

  // Submit Room PIN modal
  const handleRetryPasscode = (e) => {
    e.preventDefault();
    if (!pinPrompt.trim()) return;
    setIsPasscodeRequired(false);
    if (socket) {
      socket.emit('join-document', roomId, {
        username,
        passcode: pinPrompt.trim(),
      });
    }
  };

  // Copy Room ID to clipboard
  const handleCopyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    setCopiedRoom(true);
    showToast('Room ID copied to clipboard! 📋');
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
    showToast(`Downloaded ${filename} 🌸`);
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
        `[${language.toUpperCase()} Runner]\nCode synchronized across ${collaborators.length || 1} active peers in real-time.`
      );
    }
  };

  return (
    <div className="h-screen bg-[#fdf2f8] text-pink-950 flex flex-col overflow-hidden font-sans">
      {/* Top Navigation Bar */}
      <header className="h-14 border-b border-pink-200/90 bg-white px-4 flex items-center justify-between select-none shrink-0 z-30 shadow-sm shadow-pink-100/50">
        {/* Left: <XOR/> Monospace Logo & Room Badge */}
        <div className="flex items-center gap-3">
          <Link
            to="/Collaborate"
            className="p-1.5 rounded-xl text-pink-600 hover:text-pink-950 hover:bg-pink-50 transition-colors"
            title="Leave room and return to Lobby"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <Link to="/" className="flex items-center gap-1.5 select-none group">
            <span className="w-2.5 h-2.5 rounded-full bg-pink-500 shadow-sm shadow-pink-300"></span>
            <span className="font-wordmark text-lg font-extrabold tracking-tight text-[#4A0E2A] group-hover:opacity-90 transition-opacity">
              XOR
            </span>
          </Link>

          {/* Room ID Pill with Click to Copy */}
          <button
            onClick={handleCopyRoomId}
            title="Click to copy Room ID"
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-50 border border-pink-200 hover:border-pink-300 text-xs font-mono text-pink-900 transition-all group"
          >
            <span className="text-pink-400 font-bold">Room:</span>
            <span className="text-pink-950 font-bold">{roomId}</span>
            {copiedRoom ? (
              <Check className="w-3.5 h-3.5 text-pink-600 ml-0.5" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-pink-400 group-hover:text-pink-600 ml-0.5" />
            )}
          </button>
        </div>

        {/* Center: Language Selector & Status */}
        <div className="hidden md:flex items-center gap-3">
          <select
            value={language}
            onChange={handleLanguageChange}
            className="bg-pink-50/70 border border-pink-200 text-xs font-bold text-pink-900 rounded-xl px-2.5 py-1 font-mono focus:outline-none focus:ring-2 focus:ring-pink-300"
          >
            <option value="javascript">JavaScript (.js)</option>
            <option value="python">Python (.py)</option>
            <option value="cpp">C++ (.cpp)</option>
            <option value="html">HTML5 (.html)</option>
            <option value="markdown">Markdown (.md)</option>
          </select>

          {/* Save Status */}
          <div className="flex items-center gap-1.5 text-xs font-mono">
            {saveStatus === 'saving' ? (
              <span className="text-amber-600 flex items-center gap-1 font-medium">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                Syncing...
              </span>
            ) : (
              <span className="text-pink-600 flex items-center gap-1 font-medium">
                <span className="w-2 h-2 rounded-full bg-pink-500" />
                Saved
              </span>
            )}
          </div>
        </div>

        {/* Right: Security Lock, Active Participants & Actions */}
        <div className="flex items-center gap-2.5">
          {/* Room Lock Button (Guarantees no outside groups can enter!) */}
          <button
            onClick={handleToggleLock}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all border ${
              isRoomLocked
                ? 'bg-rose-500 text-white border-rose-600 shadow-sm shadow-rose-200'
                : 'bg-pink-100 hover:bg-pink-200 text-pink-800 border-pink-300'
            }`}
            title={isRoomLocked ? 'Room is LOCKED to outside people. Click to unlock.' : 'Click to lock this room from strangers'}
          >
            {isRoomLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3 text-pink-600" />}
            <span className="text-[11px]">{isRoomLocked ? 'Locked 🔒' : 'Lock Room 🔓'}</span>
          </button>

          {/* Active Participants Avatars */}
          <div className="flex items-center gap-1.5 pl-2 border-l border-pink-200">
            <div className="flex items-center -space-x-1.5">
              {collaborators.map((c, i) => (
                <div
                  key={c.socketId || i}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-extrabold text-white border-2 border-white shadow-sm"
                  style={{ backgroundColor: c.avatarColor || '#f472b6' }}
                  title={`${c.name || 'User'} (Connected)`}
                >
                  {(c.name || 'U').charAt(0).toUpperCase()}
                </div>
              ))}
            </div>
            <span className="text-[11px] font-mono font-bold text-pink-700 hidden sm:inline">
              {collaborators.length || 1} online
            </span>
          </div>

          {/* Run Code Button */}
          <button
            onClick={handleRunCode}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white text-xs font-bold transition-all shadow-sm shadow-pink-200"
            title="Execute Code"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span className="hidden sm:inline">Run</span>
          </button>

          {/* Export Code File */}
          <button
            onClick={handleExport}
            className="p-1.5 rounded-xl bg-pink-50 border border-pink-200 text-pink-700 hover:bg-pink-100 transition-colors"
            title="Download Code File"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Leave Room Button */}
          <Link
            to="/Collaborate"
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-pink-50 border border-pink-200 text-xs font-bold text-pink-800 hover:bg-pink-100 transition-colors"
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
          <div className="h-44 md:h-full md:w-80 border-t md:border-t-0 md:border-l border-pink-200/90 bg-white flex flex-col shrink-0 shadow-lg">
            <div className="h-9 px-3 border-b border-pink-100 flex items-center justify-between text-xs font-mono text-pink-700 select-none bg-pink-50/50">
              <span className="flex items-center gap-1.5 text-pink-950 font-bold">
                <Terminal className="w-3.5 h-3.5 text-pink-500" />
                Console Output
              </span>
              <button
                onClick={() => setIsConsoleOpen(false)}
                className="text-pink-400 hover:text-pink-800 text-xs font-bold"
              >
                ✕
              </button>
            </div>
            <pre className="flex-1 p-3 text-xs font-mono text-pink-950 overflow-auto whitespace-pre-wrap selection:bg-pink-200">
              {consoleOutput || 'Click "Run" to execute current script...'}
            </pre>
          </div>
        )}
      </main>

      {/* MODAL: Room Locked by Host ⛔ */}
      {isBlockedLocked && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 text-center border border-rose-200 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-extrabold text-pink-950 mb-1">Room Locked by Host 🔒</h2>
            <p className="text-xs text-pink-700 mb-5 leading-relaxed">
              This room has been locked to prevent outsiders from joining. Please ask your group member to click <strong>"Lock Room"</strong> in the top bar to unlock it.
            </p>
            <button
              onClick={() => navigate('/Collaborate')}
              className="w-full py-2.5 px-4 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs shadow-md shadow-pink-200"
            >
              Back to Room Lobby
            </button>
          </div>
        </div>
      )}

      {/* MODAL: Incorrect or Missing Passcode PIN 🔑 */}
      {isPasscodeRequired && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleRetryPasscode}
            className="w-full max-w-sm bg-white rounded-3xl p-6 text-center border border-pink-200 shadow-2xl space-y-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-pink-100 text-pink-600 flex items-center justify-center mx-auto mb-2">
              <KeyRound className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-extrabold text-pink-950">Room PIN Required 🔑</h2>
            <p className="text-xs text-pink-700 leading-relaxed">
              This room is password-protected by the creator. Enter the secret PIN to join:
            </p>
            <input
              type="password"
              placeholder="Enter Room PIN"
              maxLength={8}
              value={pinPrompt}
              onChange={(e) => setPinPrompt(e.target.value)}
              className="w-full px-3.5 py-2.5 text-center tracking-widest rounded-xl border border-pink-200 bg-pink-50 text-sm font-mono text-pink-950 focus:outline-none focus:ring-2 focus:ring-pink-400"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => navigate('/Collaborate')}
                className="flex-1 py-2 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-800 font-bold text-xs border border-pink-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs shadow-md shadow-pink-200"
              >
                Unlock & Join
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Floating Status Notification Toast */}
      {toastMessage && (
        <div className="absolute bottom-5 right-5 z-50 animate-in slide-in-from-bottom-2 duration-150 pointer-events-none">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-pink-200 text-xs font-mono text-pink-950 shadow-lg shadow-pink-100">
            <Sparkles className="w-3.5 h-3.5 text-pink-500" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
};
