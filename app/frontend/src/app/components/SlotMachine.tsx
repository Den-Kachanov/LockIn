import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Pizza, TrendingUp, Star, Gift, Award } from 'lucide-react';

const rewards = [
  { icon: TrendingUp, label: '+0.1 Grade', color: '#00d9ff' },
  { icon: Pizza, label: 'Pizza Slice', color: '#ffd700' },
  { icon: Trophy, label: 'Trophy', color: '#ff00ff' },
  { icon: Star, label: 'Star Points', color: '#00d9ff' },
  { icon: Gift, label: 'Mystery Box', color: '#ffd700' },
  { icon: Award, label: 'Achievement', color: '#ff00ff' },
];

export function SlotMachine() {
  const [slots, setSlots] = useState([0, 1, 2]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [showWin, setShowWin] = useState(false);

  const spin = () => {
    if (isSpinning) return;
    
    setIsSpinning(true);
    setShowWin(false);

    // Animate each slot
    const spinDurations = [800, 1200, 1600];
    
    spinDurations.forEach((duration, index) => {
      setTimeout(() => {
        const newValue = Math.floor(Math.random() * rewards.length);
        setSlots((prev) => {
          const newSlots = [...prev];
          newSlots[index] = newValue;
          return newSlots;
        });
      }, duration);
    });

    setTimeout(() => {
      setIsSpinning(false);
      // Check for win (all same)
      if (slots[0] === slots[1] && slots[1] === slots[2]) {
        setShowWin(true);
        setTimeout(() => setShowWin(false), 3000);
      }
    }, 1800);
  };

  return (
    <div className="relative mb-8">
      {/* Title */}
      <motion.h3
        className="text-center mb-4 text-xl text-transparent bg-clip-text bg-gradient-to-r from-[#ffd700] via-[#ff00ff] to-[#00d9ff]"
        style={{ fontWeight: 700 }}
        animate={{
          textShadow: [
            '0 0 10px #ffd700',
            '0 0 20px #ff00ff',
            '0 0 10px #00d9ff',
          ],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
        }}
      >
        🎰 REWARD CASINO 🎰
      </motion.h3>

      {/* Slot Machine Container */}
      <div className="relative bg-gradient-to-br from-[#1a1f3a]/90 to-[#2d1b4e]/90 backdrop-blur-xl border-2 border-[#ffd700]/50 rounded-2xl p-6 shadow-2xl">
        {/* Glow Effect */}
        <motion.div
          className="absolute -inset-2 bg-gradient-to-r from-[#ffd700]/20 via-[#ff00ff]/20 to-[#00d9ff]/20 rounded-2xl blur-xl"
          animate={{
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        />

        {/* Slots Display */}
        <div className="relative flex gap-4 justify-center mb-6">
          {slots.map((slotIndex, i) => {
            const reward = rewards[slotIndex];
            const Icon = reward.icon;
            return (
              <motion.div
                key={i}
                className="relative w-24 h-24 bg-black/50 rounded-xl border-2 border-white/20 flex items-center justify-center overflow-hidden"
                animate={isSpinning ? {
                  y: [0, -400, 0],
                } : {}}
                transition={{
                  duration: 0.5,
                  repeat: isSpinning ? Infinity : 0,
                  ease: 'linear',
                }}
              >
                <motion.div
                  animate={{
                    scale: isSpinning ? [1, 0.8, 1] : 1,
                  }}
                  transition={{
                    duration: 0.3,
                    repeat: isSpinning ? Infinity : 0,
                  }}
                >
                  <Icon
                    className="w-12 h-12"
                    style={{ color: reward.color }}
                  />
                </motion.div>
                
                {/* Glow around icon */}
                <motion.div
                  className="absolute inset-0 blur-xl"
                  style={{ backgroundColor: reward.color }}
                  animate={{
                    opacity: [0.2, 0.4, 0.2],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                  }}
                />
              </motion.div>
            );
          })}
        </div>

        {/* Reward Labels */}
        <div className="flex gap-4 justify-center mb-4">
          {slots.map((slotIndex, i) => (
            <div key={i} className="w-24 text-center">
              <span className="text-xs text-white/70">{rewards[slotIndex].label}</span>
            </div>
          ))}
        </div>

        {/* Win Message */}
        <AnimatePresence>
          {showWin && (
            <motion.div
              className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#ffd700] via-[#ff00ff] to-[#00d9ff] text-white px-6 py-2 rounded-full text-sm font-bold whitespace-nowrap"
              initial={{ opacity: 0, y: 20, scale: 0.5 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.5 }}
            >
              🎉 JACKPOT! YOU WIN! 🎉
            </motion.div>
          )}
        </AnimatePresence>

        {/* Spin Button */}
        <motion.button
          onClick={spin}
          disabled={isSpinning}
          className="w-full py-4 bg-gradient-to-r from-[#ffd700] via-[#ff00ff] to-[#00d9ff] rounded-xl text-white font-bold text-lg shadow-lg disabled:opacity-50"
          whileHover={!isSpinning ? { scale: 1.02 } : {}}
          whileTap={!isSpinning ? { scale: 0.98 } : {}}
          animate={{
            boxShadow: [
              '0 0 20px #ffd700',
              '0 0 40px #ff00ff',
              '0 0 20px #00d9ff',
            ],
          }}
          transition={{
            boxShadow: { duration: 2, repeat: Infinity },
          }}
        >
          {isSpinning ? '🎰 SPINNING...' : '🎰 RISK IT IN THE CASINO'}
        </motion.button>

        <p className="text-center text-xs text-white/50 mt-3">
          Complete study sessions to earn spins!
        </p>
      </div>
    </div>
  );
}
