import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, RotateCcw } from 'lucide-react';

const STUDY_SECONDS = 25 * 60;
const BREAK_SECONDS = 5 * 60;
const STARS_PER_SESSION = 10;

interface SessionResult {
  minutes: number;
  stars_earned: number;
  new_balance: number;
}

interface PomodoroTimerProps {
  onSessionComplete?: () => void;
}

export function PomodoroTimer({ onSessionComplete }: PomodoroTimerProps) {
  const [isStudying, setIsStudying] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [currentTime, setCurrentTime] = useState(STUDY_SECONDS);
  const [sessionResult, setSessionResult] = useState<SessionResult | null>(null);
  const [showReward, setShowReward] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const startedAtRef = useRef<string | null>(null);
  // Use a ref to avoid stale closure issues in the useEffect
  const isStudyingRef = useRef(isStudying);
  isStudyingRef.current = isStudying;

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setCurrentTime((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          // Trigger completion after state settles
          setTimeout(() => {
            if (isStudyingRef.current) {
              triggerStudyComplete();
            } else {
              // Break finished → reset to study
              setIsStudying(true);
              isStudyingRef.current = true;
              setCurrentTime(STUDY_SECONDS);
              setIsRunning(false);
            }
          }, 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning]);

  const triggerStudyComplete = async () => {
    setIsRunning(false);
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/study/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          duration_minutes: 25,
          started_at: startedAtRef.current,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setSessionResult(data);
        setShowReward(true);
        setTimeout(() => setShowReward(false), 5000);
        onSessionComplete?.();
      }
    } catch (e) {
      console.error('Failed to record study session:', e);
    } finally {
      setIsSubmitting(false);
      setIsStudying(false);
      isStudyingRef.current = false;
      setCurrentTime(BREAK_SECONDS);
      startedAtRef.current = null;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const resetTimer = () => {
    setIsRunning(false);
    setIsStudying(true);
    isStudyingRef.current = true;
    setCurrentTime(STUDY_SECONDS);
    setShowReward(false);
    startedAtRef.current = null;
  };

  const toggleTimer = () => {
    if (!isRunning && isStudying && !startedAtRef.current) {
      startedAtRef.current = new Date().toISOString();
    }
    setIsRunning((prev) => !prev);
  };

  const totalSeconds = isStudying ? STUDY_SECONDS : BREAK_SECONDS;
  const progressPercent = (currentTime / totalSeconds) * 100;

  return (
    <div className="relative">
      {/* Holographic Glow */}
      <motion.div
        className="absolute -inset-4 bg-gradient-to-r from-[#00d9ff]/30 via-[#ff00ff]/30 to-[#ffd700]/30 rounded-3xl blur-xl"
        animate={{ opacity: [0.5, 0.8, 0.5], scale: [1, 1.05, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Main Container */}
      <div className="relative bg-gradient-to-br from-[#1a1f3a]/90 to-[#2d1b4e]/90 backdrop-blur-xl border-2 border-[#00d9ff]/50 rounded-3xl p-8 shadow-2xl">
        {/* Glitch Overlay */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-[#00d9ff]/10 to-[#ff00ff]/10 rounded-3xl pointer-events-none"
          animate={{ opacity: [0, 0.3, 0] }}
          transition={{ duration: 0.1, repeat: Infinity, repeatDelay: 3 }}
        />

        {/* Reward Banner */}
        <AnimatePresence>
          {showReward && sessionResult && (
            <motion.div
              className="absolute inset-x-4 top-4 z-10 bg-gradient-to-r from-[#ffd700]/90 to-[#ff00ff]/90 backdrop-blur-md rounded-2xl p-4 text-center shadow-2xl border border-white/20 pointer-events-none"
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <div className="text-2xl mb-1">🎉 SESSION COMPLETE! 🎉</div>
              <div className="text-white font-bold text-lg">
                +{sessionResult.stars_earned} ⭐ earned!
              </div>
              <div className="text-white/80 text-sm mt-1">
                Studied 25 min · Balance: {sessionResult.new_balance.toLocaleString()} ⭐
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Timer Display */}
        <div className="text-center mb-8">
          <motion.div
            className="text-sm uppercase tracking-widest mb-2"
            style={{ color: isStudying ? '#00d9ff' : '#ffd700' }}
            animate={{
              textShadow: isStudying
                ? ['0 0 10px #00d9ff', '0 0 20px #00d9ff', '0 0 10px #00d9ff']
                : ['0 0 10px #ffd700', '0 0 20px #ffd700', '0 0 10px #ffd700'],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {isStudying ? '🎯 STUDY MODE' : '☕ BREAK TIME'}
          </motion.div>

          <motion.div
            className="text-8xl mb-4 text-transparent bg-clip-text bg-gradient-to-r from-[#00d9ff] via-[#ff00ff] to-[#ffd700]"
            style={{ fontWeight: 800, fontFamily: 'monospace' }}
            animate={{ scale: isRunning ? [1, 1.02, 1] : 1 }}
            transition={{ duration: 1, repeat: isRunning ? Infinity : 0 }}
          >
            {formatTime(currentTime)}
          </motion.div>

          {/* Progress Bar */}
          <div className="relative w-full h-3 bg-black/50 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-[#00d9ff] via-[#ff00ff] to-[#ffd700]"
              style={{ width: `${progressPercent}%` }}
              animate={{ boxShadow: ['0 0 10px #00d9ff', '0 0 20px #ff00ff', '0 0 10px #ffd700'] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>

          {isStudying && (
            <div className="mt-2 text-xs text-white/40">
              Complete this session to earn {STARS_PER_SESSION} ⭐
            </div>
          )}
        </div>

        {/* Control Buttons */}
        <div className="flex gap-4 justify-center">
          {/* Plain button for START/PAUSE — no framer-motion animate to avoid event conflicts */}
          <button
            onClick={toggleTimer}
            disabled={isSubmitting}
            className="px-8 py-3 bg-gradient-to-r from-[#00d9ff] to-[#ff00ff] rounded-full flex items-center gap-2 text-white font-semibold shadow-lg disabled:opacity-50 hover:scale-105 active:scale-95 transition-transform"
            style={{ boxShadow: '0 0 20px #00d9ff, 0 0 40px #ff00ff' }}
          >
            {isRunning ? (
              <><Pause className="w-5 h-5" />PAUSE</>
            ) : (
              <><Play className="w-5 h-5" />{isSubmitting ? 'SAVING...' : 'START'}</>
            )}
          </button>

          <button
            onClick={resetTimer}
            className="px-8 py-3 bg-white/10 backdrop-blur-md rounded-full flex items-center gap-2 text-white font-semibold border border-white/30 hover:bg-white/20 active:scale-95 transition-all"
          >
            <RotateCcw className="w-5 h-5" />
            RESET
          </button>
        </div>

        {/* Study/Break Times */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="text-center p-3 bg-black/30 rounded-xl border border-[#00d9ff]/30">
            <div className="text-xs text-[#00d9ff] mb-1">STUDY TIME</div>
            <div className="text-xl text-white font-mono">{formatTime(STUDY_SECONDS)}</div>
          </div>
          <div className="text-center p-3 bg-black/30 rounded-xl border border-[#ffd700]/30">
            <div className="text-xs text-[#ffd700] mb-1">BREAK TIME</div>
            <div className="text-xl text-white font-mono">{formatTime(BREAK_SECONDS)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
