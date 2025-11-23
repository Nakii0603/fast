'use client';

import { useState, useEffect, useRef } from 'react';

export default function RSVPReader() {
  const [text, setText] = useState('');
  const [words, setWords] = useState([]);
  const [playing, setPlaying] = useState(false);
  const [index, setIndex] = useState(0);
  const [wpm, setWpm] = useState(300);
  const [showWpmDropdown, setShowWpmDropdown] = useState(false);
  const intervalRef = useRef(null);
  const dropdownRef = useRef(null);
  const wpmOptions = [100, 200, 300, 400, 500, 600, 700];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowWpmDropdown(false);
      }
    };

    if (showWpmDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showWpmDropdown]);

  // Calculate interval in milliseconds based on WPM
  const getInterval = () => (60 / wpm) * 1000;

  // Start reading
  const handleStart = () => {
    if (!text.trim()) return;
    
    const wordArray = text.trim().split(/\s+/).filter(word => word.length > 0);
    setWords(wordArray);
    setIndex(0);
    setPlaying(true);
  };

  // Stop reading
  const handleStop = () => {
    setPlaying(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // Reset to beginning
  const handleReset = () => {
    handleStop();
    setIndex(0);
  };

  // Effect to handle word display when playing
  useEffect(() => {
    if (playing && words.length > 0) {
      intervalRef.current = setInterval(() => {
        setIndex((prevIndex) => {
          const nextIndex = prevIndex + 1;
          
          // Auto-stop when text ends
          if (nextIndex >= words.length) {
            setPlaying(false);
            return prevIndex;
          }
          
          return nextIndex;
        });
      }, getInterval());

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      };
    }
  }, [playing, words, wpm]);

  // Close dropdown when playing state changes
  useEffect(() => {
    setShowWpmDropdown(false);
  }, [playing]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const currentWord = words.length > 0 && index < words.length ? words[index] : '';

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-black">
      {/* Word Display Section - Full Screen when playing */}
      {playing ? (
        <div className="flex min-h-screen flex-col">
          {/* Controls Bar - Fixed at top when playing */}
          <div className="fixed top-0 left-0 right-0 z-10 border-b border-zinc-200 bg-white/95 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/95">
            <div className="mx-auto flex max-w-4xl flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300 sm:text-sm">
                  WPM:
                </span>
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setShowWpmDropdown(!showWpmDropdown)}
                    className="flex items-center gap-1.5 rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 sm:px-4 sm:py-2 sm:text-sm"
                  >
                    {wpm}
                    <svg
                      className={`h-3 w-3 transition-transform sm:h-4 sm:w-4 ${showWpmDropdown ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {showWpmDropdown && (
                    <div className="absolute left-0 top-full z-20 mt-1 w-full min-w-[80px] rounded-lg border border-zinc-300 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
                      <div className="flex flex-col p-1">
                        {wpmOptions.map((option) => (
                          <button
                            key={option}
                            onClick={() => {
                              setWpm(option);
                              setShowWpmDropdown(false);
                            }}
                            className={`rounded-md px-3 py-2 text-left text-xs font-medium transition-colors sm:px-4 sm:py-2 sm:text-sm ${
                              wpm === option
                                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                                : 'text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-700'
                            }`}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2 sm:gap-3">
                <button
                  onClick={handleStop}
                  className="rounded-lg bg-red-600 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 sm:px-6 sm:text-sm"
                >
                  STOP
                </button>
                <button
                  onClick={handleReset}
                  className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 sm:px-6 sm:text-sm"
                >
                  RESET
                </button>
              </div>
            </div>
          </div>

          {/* Word Display - Centered */}
          <div className="flex min-h-screen items-center justify-center px-4 pt-16 pb-8">
            {currentWord ? (
              <div className="text-center">
                <p className="text-5xl font-bold text-zinc-900 dark:text-zinc-100 sm:text-6xl md:text-7xl lg:text-8xl">
                  {currentWord}
                </p>
                <p className="mt-4 text-xs text-zinc-500 dark:text-zinc-400 sm:text-sm">
                  {index + 1} / {words.length}
                </p>
              </div>
            ) : null}
          </div>
        </div>
      ) : (
        /* Initial Setup - Textarea and Controls */
        <div className="mx-auto w-full max-w-4xl space-y-4 p-4 sm:space-y-6 sm:p-6 md:p-8">
          {/* Controls Section */}
          <div className="space-y-4 rounded-lg bg-white p-4 shadow-sm dark:bg-zinc-900 sm:p-6">
            <div className="space-y-2">
              <label htmlFor="text-input" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Paste your text here:
              </label>
              <textarea
                id="text-input"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter or paste text to read..."
                className="w-full rounded-lg border border-zinc-300 bg-white p-3 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:border-zinc-600 dark:focus:ring-zinc-600 sm:p-4"
                rows={8}
              />
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  WPM:
                </span>
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setShowWpmDropdown(!showWpmDropdown)}
                    className="flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                  >
                    {wpm}
                    <svg
                      className={`h-4 w-4 transition-transform ${showWpmDropdown ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {showWpmDropdown && (
                    <div className="absolute left-0 top-full z-20 mt-1 w-full min-w-[80px] rounded-lg border border-zinc-300 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
                      <div className="flex flex-col p-1">
                        {wpmOptions.map((option) => (
                          <button
                            key={option}
                            onClick={() => {
                              setWpm(option);
                              setShowWpmDropdown(false);
                            }}
                            className={`rounded-md px-4 py-2 text-left text-sm font-medium transition-colors ${
                              wpm === option
                                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                                : 'text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-700'
                            }`}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleStart}
                  disabled={!text.trim()}
                  className="flex-1 rounded-lg bg-zinc-900 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 sm:flex-none"
                >
                  START
                </button>
              </div>
            </div>
          </div>

          {/* Preview/Placeholder Section */}
          <div className="flex min-h-[300px] items-center justify-center rounded-lg bg-white shadow-sm dark:bg-zinc-900 sm:min-h-[400px]">
            <p className="px-4 text-center text-base text-zinc-400 dark:text-zinc-600 sm:text-lg">
              {text.trim() ? 'Click START to begin reading' : 'Enter text above to get started'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

