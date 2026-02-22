import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Play, Pause, RotateCcw } from 'lucide-react';

export function PomodoroTimer() {
  const [isStudying, setIsStudying] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [studyTime, setStudyTime] = useState(25 * 60); // 25 minutes in seconds
  const [breakTime, setBreakTime] = useState(5 * 60); // 5 minutes in seconds
  const [currentTime, setCurrentTime] = useState(25 * 60);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && currentTime > 0) {
      interval = setInterval(() => {
        setCurrentTime((prev) => prev - 1);
      }, 1000);
    } else if (currentTime === 0) {
      setIsStudying(!isStudying);
      setCurrentTime(isStudying ? breakTime : studyTime);
      setIsRunning(false);
    }
    return () => clearInterval(interval);
  }, [isRunning, currentTime, isStudying, studyTime, breakTime]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const resetTimer = () => {
    setIsRunning(false);
    setIsStudying(true);
    setCurrentTime(studyTime);
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  return (
    <div className="relative">
      {/* Holographic Glow Effect */}
      <motion.div
        className="absolute -inset-4 bg-gradient-to-r from-[#00d9ff]/30 via-[#ff00ff]/30 to-[#ffd700]/30 rounded-3xl blur-xl"
        animate={{
          opacity: [0.5, 0.8, 0.5],
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Main Timer Container */}
      <div className="relative bg-gradient-to-br from-[#1a1f3a]/90 to-[#2d1b4e]/90 backdrop-blur-xl border-2 border-[#00d9ff]/50 rounded-3xl p-8 shadow-2xl">
        {/* Glitch Effect Overlay */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-[#00d9ff]/10 to-[#ff00ff]/10 rounded-3xl"
          animate={{
            opacity: [0, 0.3, 0],
          }}
          transition={{
            duration: 0.1,
            repeat: Infinity,
            repeatDelay: 3,
          }}
        />

        {/* Timer Display */}
        <div className="text-center mb-8">
          <motion.div
            className="text-sm uppercase tracking-widest mb-2"
            style={{
              color: isStudying ? '#00d9ff' : '#ffd700',
            }}
            animate={{
              textShadow: isStudying
                ? ['0 0 10px #00d9ff', '0 0 20px #00d9ff', '0 0 10px #00d9ff']
                : ['0 0 10px #ffd700', '0 0 20px #ffd700', '0 0 10px #ffd700'],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
          >
            {isStudying ? '🎯 STUDY MODE' : '☕ BREAK TIME'}
          </motion.div>

          <motion.div
            className="text-8xl mb-4 text-transparent bg-clip-text bg-gradient-to-r from-[#00d9ff] via-[#ff00ff] to-[#ffd700]"
            style={{ fontWeight: 800, fontFamily: 'monospace' }}
            animate={{
              scale: isRunning ? [1, 1.02, 1] : 1,
            }}
            transition={{
              duration: 1,
              repeat: isRunning ? Infinity : 0,
            }}
          >
            {formatTime(currentTime)}
          </motion.div>

          {/* Progress Bar */}
          <div className="relative w-full h-3 bg-black/50 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-[#00d9ff] via-[#ff00ff] to-[#ffd700]"
              style={{
                width: `${(currentTime / (isStudying ? studyTime : breakTime)) * 100}%`,
              }}
              animate={{
                boxShadow: [
                  '0 0 10px #00d9ff',
                  '0 0 20px #ff00ff',
                  '0 0 10px #ffd700',
                ],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
            />
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex gap-4 justify-center">
          <motion.button
            onClick={toggleTimer}
            className="px-8 py-3 bg-gradient-to-r from-[#00d9ff] to-[#ff00ff] rounded-full flex items-center gap-2 text-white font-semibold shadow-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            animate={{
              boxShadow: [
                '0 0 20px #00d9ff',
                '0 0 30px #ff00ff',
                '0 0 20px #00d9ff',
              ],
            }}
            transition={{
              boxShadow: { duration: 2, repeat: Infinity },
            }}
          >
            {isRunning ? (
              <>
                <Pause className="w-5 h-5" />
                PAUSE
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                START
              </>
            )}
          </motion.button>

          <motion.button
            onClick={resetTimer}
            className="px-8 py-3 bg-white/10 backdrop-blur-md rounded-full flex items-center gap-2 text-white font-semibold border border-white/30"
            whileHover={{ scale: 1.05, backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
            whileTap={{ scale: 0.95 }}
          >
            <RotateCcw className="w-5 h-5" />
            RESET
          </motion.button>
        </div>

        {/* Study/Break Times Display */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="text-center p-3 bg-black/30 rounded-xl border border-[#00d9ff]/30">
            <div className="text-xs text-[#00d9ff] mb-1">STUDY TIME</div>
            <div className="text-xl text-white font-mono">{formatTime(studyTime)}</div>
          </div>
          <div className="text-center p-3 bg-black/30 rounded-xl border border-[#ffd700]/30">
            <div className="text-xs text-[#ffd700] mb-1">BREAK TIME</div>
            <div className="text-xl text-white font-mono">{formatTime(breakTime)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
