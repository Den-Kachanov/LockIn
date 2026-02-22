import { motion } from 'motion/react';
import { ShoppingBag, Coffee, Pizza, Gift, Trophy, Star, Sparkles } from 'lucide-react';

const rewards = [
  {
    id: 1,
    name: 'Free Coffee',
    description: 'Get a free coffee at UCU Café',
    cost: 100,
    icon: Coffee,
    color: '#ffd700',
    available: 5,
  },
  {
    id: 2,
    name: 'Pizza Slice',
    description: 'Free pizza slice at cafeteria',
    cost: 150,
    icon: Pizza,
    color: '#ff00ff',
    available: 3,
  },
  {
    id: 3,
    name: 'Mystery Box',
    description: 'Random reward between 50-500 points',
    cost: 200,
    icon: Gift,
    color: '#00d9ff',
    available: 10,
  },
  {
    id: 4,
    name: 'Grade Boost',
    description: '+0.1 to final grade (one-time)',
    cost: 500,
    icon: TrendingUp,
    color: '#ffd700',
    available: 1,
  },
  {
    id: 5,
    name: 'Skip Assignment',
    description: 'Skip one homework assignment',
    cost: 800,
    icon: Star,
    color: '#ff00ff',
    available: 2,
  },
  {
    id: 6,
    name: 'VIP Study Room',
    description: '2 hours in premium study room',
    cost: 300,
    icon: Trophy,
    color: '#00d9ff',
    available: 4,
  },
];

const purchaseHistory = [
  { item: 'Free Coffee', date: '2026-02-10', points: 100 },
  { item: 'Pizza Slice', date: '2026-02-08', points: 150 },
  { item: 'Mystery Box', date: '2026-02-05', points: 200 },
];

import { TrendingUp } from 'lucide-react';

export function Rewards() {
  const userPoints = 1247;

  return (
    <div className="space-y-6">
      {/* Points Balance */}
      <motion.div
        className="relative bg-gradient-to-br from-[#1a1f3a]/80 to-[#2d1b4e]/80 backdrop-blur-xl border-2 border-[#ffd700]/50 rounded-2xl p-8 shadow-2xl text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <motion.div
          className="absolute -inset-2 bg-[#ffd700]/20 rounded-2xl blur-xl"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <div className="relative">
          <Sparkles className="w-12 h-12 text-[#ffd700] mx-auto mb-3" />
          <h2 className="text-2xl text-white/70 mb-2">Your Points Balance</h2>
          <motion.div
            className="text-6xl text-transparent bg-clip-text bg-gradient-to-r from-[#ffd700] via-[#ff00ff] to-[#00d9ff] font-bold"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {userPoints.toLocaleString()} ⭐
          </motion.div>
        </div>
      </motion.div>

      {/* Rewards Shop */}
      <div>
        <h3 className="text-2xl text-[#00d9ff] mb-4 font-bold flex items-center gap-2">
          <ShoppingBag className="w-7 h-7" />
          Rewards Shop
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rewards.map((reward, index) => {
            const Icon = reward.icon;
            const canAfford = userPoints >= reward.cost;

            return (
              <motion.div
                key={reward.id}
                className={`relative bg-gradient-to-br from-[#1a1f3a]/80 to-[#2d1b4e]/80 backdrop-blur-xl border-2 rounded-2xl p-6 shadow-2xl ${
                  canAfford ? 'border-white/20' : 'border-white/10 opacity-60'
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={canAfford ? { y: -5, scale: 1.02 } : {}}
              >
                {/* Glow Effect */}
                {canAfford && (
                  <motion.div
                    className="absolute -inset-1 rounded-2xl blur-lg"
                    style={{ backgroundColor: reward.color, opacity: 0.2 }}
                    animate={{ opacity: [0.2, 0.4, 0.2] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}

                <div className="relative">
                  {/* Icon */}
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto"
                    style={{
                      background: `linear-gradient(135deg, ${reward.color}40, ${reward.color}20)`,
                    }}
                  >
                    <Icon className="w-8 h-8" style={{ color: reward.color }} />
                  </div>

                  {/* Content */}
                  <h4 className="text-xl text-white font-bold mb-2 text-center">
                    {reward.name}
                  </h4>
                  <p className="text-sm text-white/60 mb-4 text-center h-10">
                    {reward.description}
                  </p>

                  {/* Cost and Available */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[#ffd700] font-bold text-lg">
                      {reward.cost} ⭐
                    </span>
                    <span className="text-xs text-white/50">
                      {reward.available} available
                    </span>
                  </div>

                  {/* Purchase Button */}
                  <motion.button
                    className={`w-full py-3 rounded-xl font-bold ${
                      canAfford
                        ? 'bg-gradient-to-r from-[#00d9ff] to-[#ff00ff] text-white'
                        : 'bg-white/10 text-white/30 cursor-not-allowed'
                    }`}
                    disabled={!canAfford}
                    whileHover={canAfford ? { scale: 1.05 } : {}}
                    whileTap={canAfford ? { scale: 0.95 } : {}}
                  >
                    {canAfford ? 'Purchase' : 'Not Enough Points'}
                  </motion.button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Purchase History */}
      <motion.div
        className="relative bg-gradient-to-br from-[#1a1f3a]/80 to-[#2d1b4e]/80 backdrop-blur-xl border-2 border-[#ff00ff]/30 rounded-2xl p-6 shadow-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h3 className="text-2xl text-[#ff00ff] mb-4 font-bold">📜 Purchase History</h3>
        
        <div className="space-y-3">
          {purchaseHistory.map((purchase, index) => (
            <motion.div
              key={index}
              className="flex items-center justify-between p-4 bg-black/30 rounded-xl border border-white/10"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div>
                <h4 className="text-white font-semibold">{purchase.item}</h4>
                <p className="text-xs text-white/50">{purchase.date}</p>
              </div>
              <div className="text-right">
                <div className="text-[#ffd700] font-bold">-{purchase.points} ⭐</div>
              </div>
            </motion.div>
          ))}
        </div>

        {purchaseHistory.length === 0 && (
          <div className="text-center py-12 text-white/50">
            No purchases yet. Start redeeming rewards!
          </div>
        )}
      </motion.div>
    </div>
  );
}
