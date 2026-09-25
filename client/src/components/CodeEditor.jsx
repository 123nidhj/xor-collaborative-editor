import React, { useRef, useState, useMemo } from 'react';

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

  const lineCount = useMemo(() => {
    return Math.max((content || '').split('\n').length, 1);
  }, [content]);

  const handleScroll = (e) => {
    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = e.target.scrollTop;
    }
  };

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

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      if (onSaveShortcut) onSaveShortcut();
      return;
    }

    if (readOnly) return;

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
    <div className="relative w-full h-full flex flex-col bg-white rounded-2xl border border-pink-200/90 overflow-hidden shadow-md shadow-pink-100/60">
      {/* Editor Sub-header Bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-pink-100 bg-[#fff5f8] text-xs font-mono text-pink-700 select-none">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-pink-400 inline-block" />
          <span className="w-2.5 h-2.5 rounded-full bg-pink-300 inline-block" />
          <span className="w-2.5 h-2.5 rounded-full bg-pink-200 inline-block" />
          <span className="ml-2 px-2 py-0.5 rounded-md bg-white border border-pink-200 text-[11px] font-bold text-pink-800">
            {language}
          </span>
          {readOnly && (
            <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-600 text-[11px] border border-rose-200 font-bold">
              Locked / Read Only
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 text-pink-600 font-medium">
          <span>Ln {cursorPos.line}, Col {cursorPos.ch}</span>
          <span>UTF-8</span>
          <span>Spaces: 2</span>
        </div>
      </div>

      {/* Editor Main Canvas */}
      <div className="relative flex-1 flex overflow-hidden font-mono text-[13px] leading-relaxed bg-[#fefcfe]">
        {/* Line Numbers Gutter */}
        <div
          ref={lineNumbersRef}
          className="w-12 sm:w-14 py-4 pr-3 pl-2 bg-[#fff0f4]/50 border-r border-pink-100 select-none text-right text-pink-400 overflow-hidden pointer-events-none font-mono"
        >
          {Array.from({ length: lineCount }).map((_, i) => (
            <div
              key={i}
              className={`leading-relaxed ${cursorPos.line === i + 1 ? 'text-pink-700 font-bold' : ''}`}
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
            placeholder={readOnly ? 'View mode only...' : '// Start typing code... Collaborators will see your edits in real-time! 🌸'}
            className="w-full h-full p-4 bg-transparent text-pink-950 placeholder:text-pink-300 resize-none focus:outline-none overflow-auto font-mono selection:bg-pink-200"
            style={{ tabSize: 2 }}
          />

          {/* Remote Collaborators Live Cursors Overlay */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden p-4">
            {Object.entries(remoteCursors).map(([socketId, remote]) => {
              if (!remote || !remote.line) return null;
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
                  <div
                    className="w-0.5 h-5 shadow-sm"
                    style={{ backgroundColor: remote.avatarColor || '#f472b6' }}
                  />
                  <div
                    className="absolute -top-5 left-1 px-1.5 py-0.5 rounded text-[10px] font-sans font-bold text-white whitespace-nowrap shadow-md flex items-center gap-1"
                    style={{ backgroundColor: remote.avatarColor || '#f472b6' }}
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
