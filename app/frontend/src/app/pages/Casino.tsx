import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Pizza, TrendingUp, Star, Gift, Award, Zap, Heart, Crown, Diamond } from 'lucide-react';

const slotSymbols = [
  { icon: TrendingUp, label: '+0.1 Grade', color: '#00d9ff', value: 100 },
  { icon: Pizza, label: 'Pizza Slice', color: '#ffd700', value: 80 },
  { icon: Trophy, label: 'Trophy', color: '#ff00ff', value: 120 },
  { icon: Star, label: 'Star Points', color: '#00d9ff', value: 60 },
  { icon: Gift, label: 'Mystery Box', color: '#ffd700', value: 90 },
  { icon: Award, label: 'Achievement', color: '#ff00ff', value: 110 },
  { icon: Zap, label: 'Power Up', color: '#00d9ff', value: 70 },
  { icon: Heart, label: 'Extra Life', color: '#ff00ff', value: 85 },
  { icon: Crown, label: 'Royal Bonus', color: '#ffd700', value: 150 },
  { icon: Diamond, label: 'Jackpot', color: '#00d9ff', value: 200 },
];

interface SlotMachineProps {
  id: number;
  betAmount: number;
  onWin: (amount: number) => void;
}

function SingleSlotMachine({ id, betAmount, onWin }: SlotMachineProps) {
  const [slots, setSlots] = useState([0, 1, 2]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [lastWin, setLastWin] = useState(0);
  const [spinningSlots, setSpinningSlots] = useState([false, false, false]);

  const spin = () => {
    if (isSpinning) return;
    
    setIsSpinning(true);
    setLastWin(0);
    setSpinningSlots([true, true, true]);

    const spinDurations = [1000, 1500, 2000];
    const newSlots: number[] = [];
    
    spinDurations.forEach((duration, index) => {
      setTimeout(() => {
        const newValue = Math.floor(Math.random() * slotSymbols.length);
        newSlots[index] = newValue;
        setSlots((prev) => {
          const updated = [...prev];
          updated[index] = newValue;
          return updated;
        });
        setSpinningSlots((prev) => {
          const updated = [...prev];
          updated[index] = false;
          return updated;
        });
      }, duration);
    });

    setTimeout(() => {
      setIsSpinning(false);
      
      // Calculate winnings
      if (newSlots[0] === newSlots[1] && newSlots[1] === newSlots[2]) {
        // Jackpot - all three match
        const winAmount = slotSymbols[newSlots[0]].value * 3;
        setLastWin(winAmount);
        onWin(winAmount);
      } else if (newSlots[0] === newSlots[1] || newSlots[1] === newSlots[2] || newSlots[0] === newSlots[2]) {
        // Two match
        const winAmount = betAmount * 1.5;
        setLastWin(winAmount);
        onWin(winAmount);
      }
    }, 2200);
  };

  return (
    <div className="relative bg-gradient-to-br from-[#1a1f3a]/90 to-[#2d1b4e]/90 backdrop-blur-xl border-2 border-[#ffd700]/50 rounded-2xl p-4 md:p-6 shadow-2xl">
      <motion.div
        className="absolute -inset-2 bg-gradient-to-r from-[#ffd700]/20 via-[#ff00ff]/20 to-[#00d9ff]/20 rounded-2xl blur-xl"
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 2, repeat: Infinity }}
      />

      <div className="relative">
        <h4 className="text-center text-base md:text-lg text-[#ffd700] font-bold mb-4">
          Slot Machine #{id}
        </h4>

        {/* Slots Display */}
        <div className="flex gap-2 md:gap-3 justify-center mb-4">
          {slots.map((slotIndex, i) => {
            const symbol = slotSymbols[slotIndex];
            const Icon = symbol.icon;
            return (
              <div
                key={i}
                className="relative w-20 h-20 md:w-28 md:h-28 bg-black/50 rounded-xl border-2 border-white/20 overflow-hidden"
              >
                {/* Spinning Animation Container */}
                <div className="absolute inset-0 flex flex-col items-center justify-start">
                  {spinningSlots[i] ? (
                    // When spinning, show multiple symbols scrolling
                    <motion.div
                      className="flex flex-col items-center"
                      initial={{ y: 0 }}
                      animate={{ y: -2000 }}
                      transition={{
                        duration: 1.5,
                        ease: 'linear',
                        repeat: Infinity,
                      }}
                    >
                      {[...Array(20)].map((_, idx) => {
                        const randomSymbol = slotSymbols[Math.floor(Math.random() * slotSymbols.length)];
                        const RandomIcon = randomSymbol.icon;
                        return (
                          <div
                            key={idx}
                            className="w-20 h-20 md:w-28 md:h-28 flex items-center justify-center flex-shrink-0"
                          >
                            <RandomIcon
                              className="w-10 h-10 md:w-14 md:h-14"
                              style={{ color: randomSymbol.color }}
                            />
                          </div>
                        );
                      })}
                    </motion.div>
                  ) : (
                    // When stopped, show the final symbol with bounce
                    <motion.div
                      className="w-20 h-20 md:w-28 md:h-28 flex items-center justify-center"
                      initial={false}
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.3 }}
                    >
                      <Icon
                        className="w-10 h-10 md:w-14 md:h-14"
                        style={{ color: symbol.color }}
                      />
                    </motion.div>
                  )}
                </div>
                
                {/* Glow effect */}
                <motion.div
                  className="absolute inset-0 blur-xl pointer-events-none"
                  style={{ backgroundColor: symbol.color }}
                  animate={{ opacity: spinningSlots[i] ? [0.3, 0.5, 0.3] : [0.2, 0.4, 0.2] }}
                  transition={{ duration: spinningSlots[i] ? 0.5 : 1.5, repeat: Infinity }}
                />

                {/* Center line indicator */}
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-0.5 bg-[#ffd700]/30 pointer-events-none" />
              </div>
            );
          })}
        </div>

        {/* Win Display */}
        <AnimatePresence>
          {lastWin > 0 && (
            <motion.div
              className="text-center mb-4"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
            >
              <span className="text-lg md:text-2xl text-[#ffd700] font-bold">
                🎉 Won {lastWin} Points! 🎉
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bet Amount */}
        <div className="text-center mb-4">
          <span className="text-xs md:text-sm text-white/70">Bet: </span>
          <span className="text-base md:text-lg text-[#00d9ff] font-bold">{betAmount} ⭐</span>
        </div>

        {/* Spin Button */}
        <motion.button
          onClick={spin}
          disabled={isSpinning}
          className="w-full py-3 bg-gradient-to-r from-[#ffd700] via-[#ff00ff] to-[#00d9ff] rounded-xl text-white font-bold text-sm md:text-base shadow-lg disabled:opacity-50"
          whileHover={!isSpinning ? { scale: 1.02 } : {}}
          whileTap={!isSpinning ? { scale: 0.98 } : {}}
        >
          {isSpinning ? '🎰 SPINNING...' : '🎰 SPIN'}
        </motion.button>
      </div>
    </div>
  );
}

export function Casino() {
  const [totalPoints, setTotalPoints] = useState(1247);
  const [totalWinnings, setTotalWinnings] = useState(0);
  const [spinsCount, setSpinsCount] = useState(0);

  const handleWin = (amount: number) => {
    setTotalPoints((prev) => prev + amount);
    setTotalWinnings((prev) => prev + amount);
    setSpinsCount((prev) => prev + 1);
  };

  return (
    <div className="space-y-6">
      {/* Casino Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Points', value: totalPoints.toLocaleString(), icon: '⭐', color: '#ffd700' },
          { label: 'Total Winnings', value: totalWinnings.toLocaleString(), icon: '💰', color: '#00d9ff' },
          { label: 'Spins Today', value: spinsCount, icon: '🎰', color: '#ff00ff' },
          { label: 'Win Rate', value: '47%', icon: '📊', color: '#00d9ff' },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            className="relative bg-gradient-to-br from-[#1a1f3a]/80 to-[#2d1b4e]/80 backdrop-blur-xl border-2 border-white/10 rounded-2xl p-6 shadow-2xl text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <motion.div
              className="absolute -inset-1 rounded-2xl blur-lg opacity-30"
              style={{ backgroundColor: stat.color }}
              animate={{ opacity: [0.2, 0.4, 0.2] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <div className="relative">
              <div className="text-4xl mb-2">{stat.icon}</div>
              <div className="text-xs text-white/50 mb-1">{stat.label}</div>
              <div className="text-2xl text-white font-bold">{stat.value}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Welcome Banner */}
      <motion.div
        className="relative bg-gradient-to-r from-[#1a1f3a]/90 to-[#2d1b4e]/90 backdrop-blur-xl border-2 border-[#ffd700]/50 rounded-2xl p-8 shadow-2xl text-center overflow-hidden"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <motion.div
          className="absolute inset-0 opacity-10"
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
          style={{
            backgroundImage: 'linear-gradient(45deg, #ffd700 25%, transparent 25%, transparent 75%, #ffd700 75%, #ffd700)',
            backgroundSize: '20px 20px',
          }}
        />
        <div className="relative">
          <motion.h2
            className="text-5xl mb-4 text-transparent bg-clip-text bg-gradient-to-r from-[#ffd700] via-[#ff00ff] to-[#00d9ff]"
            style={{ fontWeight: 800 }}
            animate={{
              textShadow: [
                '0 0 20px #ffd700',
                '0 0 40px #ff00ff',
                '0 0 20px #00d9ff',
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            🎰 LOCK IN CASINO 🎰
          </motion.h2>
          <p className="text-xl text-white/70 mb-6">
            Spin to win amazing rewards and boost your study game!
          </p>
          <div className="flex gap-4 justify-center">
            <div className="px-4 py-2 bg-black/30 rounded-lg border border-[#ffd700]/30">
              <span className="text-sm text-white/70">Today's Jackpot: </span>
              <span className="text-lg text-[#ffd700] font-bold">5,000 ⭐</span>
            </div>
            <div className="px-4 py-2 bg-black/30 rounded-lg border border-[#ff00ff]/30">
              <span className="text-sm text-white/70">Online Now: </span>
              <span className="text-lg text-[#ff00ff] font-bold">247 players</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Slot Machines Grid */}
      <div>
        <h3 className="text-2xl text-[#ffd700] mb-4 font-bold">🎰 Available Machines</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <SingleSlotMachine id={1} betAmount={50} onWin={handleWin} />
          <SingleSlotMachine id={2} betAmount={100} onWin={handleWin} />
          <SingleSlotMachine id={3} betAmount={200} onWin={handleWin} />
        </div>
      </div>

      {/* Payout Table */}
      <motion.div
        className="relative bg-gradient-to-br from-[#1a1f3a]/80 to-[#2d1b4e]/80 backdrop-blur-xl border-2 border-[#00d9ff]/30 rounded-2xl p-6 shadow-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h3 className="text-2xl text-[#00d9ff] mb-6 font-bold">💎 Payout Table</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {slotSymbols.map((symbol) => {
            const Icon = symbol.icon;
            return (
              <motion.div
                key={symbol.label}
                className="p-4 bg-black/30 rounded-xl border border-white/10 text-center"
                whileHover={{ scale: 1.05, borderColor: symbol.color }}
              >
                <Icon className="w-10 h-10 mx-auto mb-2" style={{ color: symbol.color }} />
                <div className="text-xs text-white/70 mb-1">{symbol.label}</div>
                <div className="text-sm font-bold" style={{ color: symbol.color }}>
                  {symbol.value * 3} pts
                </div>
              </motion.div>
            );
          })}
        </div>
        <div className="mt-6 p-4 bg-black/30 rounded-xl border border-[#ffd700]/30">
          <h4 className="text-white font-bold mb-2">🎯 How to Win:</h4>
          <ul className="text-sm text-white/70 space-y-1">
            <li>• Match 3 symbols = 3x symbol value</li>
            <li>• Match 2 symbols = 1.5x your bet</li>
            <li>• Special combos unlock bonus rounds</li>
            <li>• Complete study sessions to earn free spins!</li>
          </ul>
        </div>
      </motion.div>

      {/* Recent Winners */}
      <motion.div
        className="relative bg-gradient-to-br from-[#1a1f3a]/80 to-[#2d1b4e]/80 backdrop-blur-xl border-2 border-[#ff00ff]/30 rounded-2xl p-6 shadow-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h3 className="text-2xl text-[#ff00ff] mb-6 font-bold">🏆 Recent Winners</h3>
        <div className="space-y-3">
          {[
            { user: 'Alex Chen', won: 450, symbol: '👑', time: '2 min ago' },
            { user: 'Sarah Kim', won: 300, symbol: '💎', time: '5 min ago' },
            { user: 'Mike Johnson', won: 240, symbol: '🏆', time: '8 min ago' },
            { user: 'Emma Davis', won: 360, symbol: '⚡', time: '12 min ago' },
            { user: 'James Wilson', won: 180, symbol: '⭐', time: '15 min ago' },
          ].map((winner, index) => (
            <motion.div
              key={index}
              className="flex items-center justify-between p-4 bg-black/30 rounded-xl border border-white/10"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-center gap-3">
                <div className="text-2xl">{winner.symbol}</div>
                <div>
                  <div className="text-white font-semibold">{winner.user}</div>
                  <div className="text-xs text-white/50">{winner.time}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg text-[#ffd700] font-bold">+{winner.won} ⭐</div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}