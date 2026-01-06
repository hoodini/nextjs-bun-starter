'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Play, Pause, Square, Volume2, VolumeX, SkipBack, Settings, X } from 'lucide-react';
import { BlogPost } from '@/lib/blog';

// Note: Blog content HTML comes from our own hardcoded lib/blog.ts file,
// not from user input, so it is safe to render.

interface ArticleContentProps {
  post: BlogPost;
}

export function ArticleContent({ post }: ArticleContentProps) {
  // Reading progress
  const [progress, setProgress] = useState(0);

  // TTS state
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [ttsSupported, setTtsSupported] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const [words, setWords] = useState<string[]>([]);
  const [showPlayer, setShowPlayer] = useState(false);

  // Voice & Speed settings
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [speed, setSpeed] = useState(1);
  const [showSettings, setShowSettings] = useState(false);

  // Refs
  const articleRef = useRef<HTMLDivElement>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Check TTS support
  useEffect(() => {
    setTtsSupported('speechSynthesis' in window);
  }, []);

  // Load available voices
  useEffect(() => {
    if (!ttsSupported) return;

    const loadVoices = () => {
      const availableVoices = speechSynthesis.getVoices();
      if (availableVoices.length === 0) return;

      // Filter for English voices, prioritize natural/enhanced ones
      const englishVoices = availableVoices.filter(v => v.lang.startsWith('en'));
      const voicesToUse = englishVoices.length > 0 ? englishVoices : availableVoices;
      setVoices(voicesToUse);

      // Set default voice (prefer Google or Microsoft voices if available)
      if (!selectedVoice) {
        const preferredVoice = voicesToUse.find(v =>
          v.name.includes('Google') || v.name.includes('Microsoft') || v.name.includes('Natural') || v.name.includes('Samantha')
        ) || voicesToUse[0];
        setSelectedVoice(preferredVoice);
      }
    };

    loadVoices();

    // Chrome loads voices asynchronously
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = null;
      }
    };
  }, [ttsSupported, selectedVoice]);

  // Parse words for progress tracking
  useEffect(() => {
    if (post.content) {
      const wordArray = post.content.split(/\s+/).filter(w => w.length > 0);
      setWords(wordArray);
    }
  }, [post.content]);

  // Reading Progress Bar (scroll-based)
  useEffect(() => {
    const handleScroll = () => {
      if (!articleRef.current) return;

      const article = articleRef.current;
      const articleTop = article.offsetTop;
      const articleHeight = article.offsetHeight;
      const windowHeight = window.innerHeight;
      const scrollY = window.scrollY;

      const start = articleTop - windowHeight + 100;
      const end = articleTop + articleHeight - windowHeight;
      const current = scrollY - start;
      const total = end - start;

      const percentage = Math.min(Math.max((current / total) * 100, 0), 100);
      setProgress(percentage);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Initialize TTS with selected voice and speed
  const initTTS = useCallback(() => {
    if (!ttsSupported || !post.content) return;

    const utterance = new SpeechSynthesisUtterance(post.content);
    utterance.rate = speed;
    utterance.pitch = 1;

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    let wordIndex = 0;
    utterance.onboundary = (event) => {
      if (event.name === 'word') {
        setCurrentWordIndex(wordIndex);
        wordIndex++;
      }
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
      setCurrentWordIndex(-1);
      setShowPlayer(false);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
      setCurrentWordIndex(-1);
    };

    utteranceRef.current = utterance;
  }, [ttsSupported, post.content, selectedVoice, speed]);

  useEffect(() => {
    initTTS();
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        speechSynthesis.cancel();
      }
    };
  }, [initTTS]);

  const handlePlay = () => {
    if (isPaused) {
      speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
    } else {
      speechSynthesis.cancel();
      setCurrentWordIndex(-1);
      initTTS();
      if (utteranceRef.current) {
        speechSynthesis.speak(utteranceRef.current);
        setIsPlaying(true);
        setShowPlayer(true);
      }
    }
  };

  const handlePause = () => {
    speechSynthesis.pause();
    setIsPaused(true);
    setIsPlaying(false);
  };

  const handleStop = () => {
    speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentWordIndex(-1);
    setShowPlayer(false);
    setShowSettings(false);
  };

  const handleRestart = () => {
    speechSynthesis.cancel();
    setCurrentWordIndex(-1);
    initTTS();
    if (utteranceRef.current) {
      speechSynthesis.speak(utteranceRef.current);
      setIsPlaying(true);
    }
  };

  // Calculate TTS progress based on word index
  const ttsProgress = words.length > 0 ? (currentWordIndex / words.length) * 100 : 0;

  return (
    <>
      {/* Reading Progress Bar - Fixed at very top */}
      <div className="fixed top-0 left-0 right-0 z-[200] h-1 bg-gray-200/50 dark:bg-gray-800/50">
        <div
          className="h-full bg-gradient-to-r from-[#FF4D8E] via-[#8B5CF6] to-[#00C2FF] transition-all duration-100 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Article */}
      <main className="pt-28 pb-32 min-h-screen">
        <article className="container mx-auto px-6 max-w-3xl">
          {/* Back Link */}
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>

          {/* Article Header */}
          <header className="mb-12">
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span className="text-sm font-medium px-3 py-1 rounded-full bg-[#FF4D8E]/10 text-[#FF4D8E]">
                {post.category}
              </span>
              <span className="text-sm text-muted-foreground">
                {post.readingTime} min read
              </span>
              <span className="text-sm text-muted-foreground">
                {post.date}
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
              {post.title}
            </h1>

            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              {post.excerpt}
            </p>

            <div className="flex items-center justify-between pb-8 border-b border-border">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FF4D8E] to-[#8B5CF6] flex items-center justify-center text-white font-semibold overflow-hidden">
                  <span>YA</span>
                </div>
                <div>
                  <p className="font-medium text-foreground">{post.author.name}</p>
                  <p className="text-sm text-muted-foreground">Author</p>
                </div>
              </div>

              {/* Listen Button */}
              {ttsSupported && !showPlayer && (
                <button
                  onClick={handlePlay}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#FF4D8E] text-white hover:bg-[#FF4D8E]/90 transition-colors shadow-lg shadow-[#FF4D8E]/25"
                >
                  <Volume2 className="w-4 h-4" />
                  <span className="text-sm font-medium">Listen to article</span>
                </button>
              )}
            </div>
          </header>

          {/* Article Body - PROPER SPACING */}
          <div
            ref={articleRef}
            className="
              prose
              prose-lg
              dark:prose-invert
              max-w-none

              prose-headings:font-semibold
              prose-headings:text-foreground

              prose-h2:text-2xl
              prose-h2:mt-14
              prose-h2:mb-6

              prose-h3:text-xl
              prose-h3:mt-10
              prose-h3:mb-4

              prose-p:text-foreground/80
              prose-p:leading-[1.8]
              prose-p:mb-6

              [&>p:first-of-type]:text-xl
              [&>p:first-of-type]:text-foreground/70
              [&>p:first-of-type]:leading-relaxed
              [&>p:first-of-type]:mb-8

              prose-a:text-[#FF4D8E]
              prose-a:no-underline
              hover:prose-a:underline

              prose-strong:text-foreground
              prose-strong:font-semibold

              prose-code:text-[#FF4D8E]
              prose-code:bg-[#FF4D8E]/10
              prose-code:px-1.5
              prose-code:py-0.5
              prose-code:rounded
              prose-code:font-normal
              prose-code:before:content-none
              prose-code:after:content-none

              prose-pre:bg-[#1C1C1E]
              prose-pre:border
              prose-pre:border-white/10
              prose-pre:rounded-xl
              prose-pre:my-8

              prose-blockquote:border-l-[#FF4D8E]
              prose-blockquote:border-l-4
              prose-blockquote:bg-[#FF4D8E]/5
              prose-blockquote:py-4
              prose-blockquote:px-6
              prose-blockquote:rounded-r-xl
              prose-blockquote:not-italic
              prose-blockquote:my-8
              prose-blockquote:text-foreground/80

              prose-ul:my-6
              prose-ul:space-y-3
              prose-ol:my-6
              prose-ol:space-y-3
              prose-li:text-foreground/80
              prose-li:leading-relaxed
            "
            dangerouslySetInnerHTML={{ __html: post.contentHtml }}
          />

          {/* Article Footer */}
          <footer className="mt-16 pt-8 border-t border-border">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-[#FF4D8E] hover:underline font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              More articles
            </Link>
          </footer>
        </article>
      </main>

      {/* Spotify-Style Bottom Audio Player */}
      {showPlayer && (
        <div className="fixed bottom-0 left-0 right-0 z-[200]">
          {/* TTS Progress Bar */}
          <div className="h-1 bg-gray-200 dark:bg-gray-800 cursor-pointer">
            <div
              className="h-full bg-[#FF4D8E] transition-all duration-300"
              style={{ width: `${ttsProgress}%` }}
            />
          </div>

          {/* Player Controls */}
          <div className="
            bg-white/95
            dark:bg-[#1C1C1E]/95
            backdrop-blur-xl
            border-t
            border-gray-200
            dark:border-white/10
            px-4
            md:px-6
            py-3
            md:py-4
          ">
            <div className="container mx-auto max-w-4xl flex items-center justify-between gap-4">
              {/* Left: Track Info */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-gradient-to-br from-[#FF4D8E] to-[#8B5CF6] flex items-center justify-center flex-shrink-0">
                  <Volume2 className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
                <div className="min-w-0 hidden sm:block">
                  <p className="font-medium text-foreground text-sm truncate">{post.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{post.author.name} • {speed}x speed</p>
                </div>
              </div>

              {/* Center: Playback Controls */}
              <div className="flex items-center gap-2 md:gap-4">
                <button
                  onClick={handleRestart}
                  className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                  title="Restart"
                >
                  <SkipBack className="w-5 h-5" />
                </button>

                <button
                  onClick={isPlaying ? handlePause : handlePlay}
                  className="w-12 h-12 rounded-full bg-[#FF4D8E] text-white flex items-center justify-center hover:bg-[#FF4D8E]/90 transition-colors shadow-lg"
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5" />
                  ) : (
                    <Play className="w-5 h-5 ml-0.5" />
                  )}
                </button>

                <button
                  onClick={handleStop}
                  className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                  title="Stop"
                >
                  <Square className="w-4 h-4" />
                </button>
              </div>

              {/* Right: Settings & Close */}
              <div className="flex items-center gap-1 flex-1 justify-end">
                {/* Settings Button */}
                <div className="relative">
                  <button
                    onClick={() => setShowSettings(!showSettings)}
                    className={`p-2 rounded-full transition-colors ${showSettings ? 'bg-[#FF4D8E]/10 text-[#FF4D8E]' : 'text-muted-foreground hover:text-foreground'}`}
                    title="Settings"
                  >
                    <Settings className="w-5 h-5" />
                  </button>

                  {/* Settings Dropdown */}
                  {showSettings && (
                    <div className="absolute bottom-full right-0 mb-3 w-72 p-4 rounded-2xl bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-white/10 shadow-2xl">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-foreground">Playback Settings</h4>
                        <button
                          onClick={() => setShowSettings(false)}
                          className="p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full"
                        >
                          <X className="w-4 h-4 text-muted-foreground" />
                        </button>
                      </div>

                      {/* Speed Control */}
                      <div className="mb-5">
                        <label className="text-sm font-medium text-foreground mb-3 flex items-center justify-between">
                          <span>Speed</span>
                          <span className="text-[#FF4D8E]">{speed}x</span>
                        </label>
                        <input
                          type="range"
                          min="0.5"
                          max="2"
                          step="0.25"
                          value={speed}
                          onChange={(e) => {
                            const newSpeed = parseFloat(e.target.value);
                            setSpeed(newSpeed);
                          }}
                          className="w-full h-2 bg-gray-200 dark:bg-white/10 rounded-full appearance-none cursor-pointer accent-[#FF4D8E]"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground mt-2">
                          <span>0.5x</span>
                          <span>1x</span>
                          <span>1.5x</span>
                          <span>2x</span>
                        </div>
                      </div>

                      {/* Voice Selection */}
                      {voices.length > 0 && (
                        <div>
                          <label className="text-sm font-medium text-foreground mb-2 block">
                            Voice
                          </label>
                          <select
                            value={selectedVoice?.name || ''}
                            onChange={(e) => {
                              const voice = voices.find(v => v.name === e.target.value);
                              setSelectedVoice(voice || null);
                            }}
                            className="w-full p-2.5 rounded-xl bg-gray-100 dark:bg-white/10 border-0 text-foreground text-sm focus:ring-2 focus:ring-[#FF4D8E] cursor-pointer"
                          >
                            {voices.map((voice) => (
                              <option key={voice.name} value={voice.name}>
                                {voice.name.replace('Microsoft ', '').replace('Google ', '').replace(' (Natural)', '')}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      <p className="text-xs text-muted-foreground mt-4">
                        Changes apply when you restart playback
                      </p>
                    </div>
                  )}
                </div>

                {/* Close Button */}
                <button
                  onClick={handleStop}
                  className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                  title="Close player"
                >
                  <VolumeX className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
