import React, { useRef, useEffect, useState, useMemo } from 'react';

export const CodeEditor = ({
  content = '',
  onChange,
  onCursorMove,
  remoteCursors = {},
  readOnly = false,
  language = 'javascript',
  onSaveShortcut,
}) => {
  const textareaRef = useRef(null);
  const lineNumbersRef = useRef(null);
  const [cursorPos, setCursorPos] = useState({ line: 1, ch: 1 });

  // Compute lines for line numbers gutter
  const lineCount = useMemo(() => {
    return Math.max((content || '').split('\n').length, 1);
  }, [content]);

  // Sync scroll between textarea and line gutter
  const handleScroll = (e) => {
    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = e.target.scrollTop;
    }
  };

  // Track cursor position on selection changes or clicks
  const updateCursorPosition = () => {
    if (!textareaRef.current) return;
    const text = textareaRef.current.value;
    const selStart = textareaRef.current.selectionStart;
    const linesUpToCursor = text.substring(0, selStart).split('\n');
    const currentLine = linesUpToCursor.length;
    const currentCh = linesUpToCursor[linesUpToCursor.length - 1].length + 1;

    setCursorPos({ line: currentLine, ch: currentCh });

    if (onCursorMove) {
      onCursorMove({
        line: currentLine,
        ch: currentCh,
        selection: {
          start: selStart,
          end: textareaRef.current.selectionEnd,
        },
      });
    }
  };

  // Handle Tab, Indentation, and Keyboard Shortcuts (e.g., Ctrl+S)
  const handleKeyDown = (e) => {
    // Ctrl+S or Cmd+S
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      if (onSaveShortcut) onSaveShortcut();
      return;
    }

    if (readOnly) return;

    // Tab key indentation
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;

      const newContent = content.substring(0, start) + '  ' + content.substring(end);
      if (onChange) onChange(newContent);

      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2;
          updateCursorPosition();
        }
      }, 0);
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-[#0a0a0a] rounded-xl border border-white/10 overflow-hidden shadow-2xl">
      {/* Editor Top Bar Info */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-[#0d0d0d] text-xs font-mono text-zinc-400 select-none">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
          <span className="ml-2 px-2 py-0.5 rounded bg-zinc-800 text-[11px] text-zinc-300">
            {language}
          </span>
          {readOnly && (
            <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 text-[11px] border border-amber-500/20">
              Read Only
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <span>Ln {cursorPos.line}, Col {cursorPos.ch}</span>
          <span>UTF-8</span>
          <span>Spaces: 2</span>
        </div>
      </div>

      {/* Editor Workspace */}
      <div className="relative flex-1 flex overflow-hidden font-mono text-[13px] leading-relaxed">
        {/* Line Numbers Gutter */}
        <div
          ref={lineNumbersRef}
          className="w-12 sm:w-14 py-4 pr-3 pl-2 bg-[#090909] border-r border-white/5 select-none text-right text-zinc-600 overflow-hidden pointer-events-none"
        >
          {Array.from({ length: lineCount }).map((_, i) => (
            <div
              key={i}
              className={`leading-relaxed ${cursorPos.line === i + 1 ? 'text-brand-cyan font-semibold' : ''}`}
            >
              {i + 1}
            </div>
          ))}
        </div>

        {/* Text Area Canvas */}
        <div className="relative flex-1 h-full">
          <textarea
            ref={textareaRef}
            value={content}
            readOnly={readOnly}
            onChange={(e) => onChange && onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onKeyUp={updateCursorPosition}
            onClick={updateCursorPosition}
            onScroll={handleScroll}
            spellCheck={false}
            placeholder={readOnly ? 'View mode only...' : '// Start typing code or text... Collaborators will see your edits live!'}
            className="w-full h-full p-4 bg-transparent text-zinc-100 placeholder:text-zinc-700 resize-none focus:outline-none overflow-auto font-mono selection:bg-brand-cyan/25 selection:text-white"
            style={{ tabSize: 2 }}
          />

          {/* Remote Collaborators Live Cursors Overlay */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden p-4">
            {Object.entries(remoteCursors).map(([socketId, remote]) => {
              if (!remote || !remote.line) return null;
              // Approximate line height (22.75px for 13px font + relaxed leading)
              const topPx = (remote.line - 1) * 22.75;
              const leftPx = Math.min((remote.ch - 1) * 7.8, 600);

              return (
                <div
                  key={socketId}
                  className="absolute transition-all duration-150 ease-out z-30"
                  style={{
                    top: `${topPx}px`,
                    left: `${leftPx}px`,
                  }}
                >
                  {/* Glowing Vertical Cursor Line */}
                  <div
                    className="w-0.5 h-5 shadow-sm"
                    style={{ backgroundColor: remote.avatarColor || '#06b6d4' }}
                  />

                  {/* Remote User Name Tag */}
                  <div
                    className="absolute -top-5 left-1 px-1.5 py-0.5 rounded text-[10px] font-sans font-medium text-black whitespace-nowrap shadow-md flex items-center gap-1"
                    style={{ backgroundColor: remote.avatarColor || '#06b6d4' }}
                  >
                    <span>{remote.name || 'Collaborator'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
