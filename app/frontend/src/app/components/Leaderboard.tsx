import { motion } from 'motion/react';
import { Trophy, Medal, Award } from 'lucide-react';

const topStudents = [
  { rank: 1, name: 'Alex Chen', time: '47h 32m', avatar: '🧑‍💻', country: '🇺🇦' },
  { rank: 2, name: 'Sarah Kim', time: '45h 18m', avatar: '👩‍🎓', country: '🇺🇦' },
  { rank: 3, name: 'Mike Johnson', time: '43h 55m', avatar: '👨‍💼', country: '🇺🇦' },
  { rank: 4, name: 'Emma Davis', time: '41h 20m', avatar: '👩‍🔬', country: '🇺🇦' },
  { rank: 5, name: 'James Wilson', time: '39h 45m', avatar: '👨‍🎨', country: '🇺🇦' },
];

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return { icon: Trophy, color: '#ffd700' };
    case 2:
      return { icon: Medal, color: '#c0c0c0' };
    case 3:
      return { icon: Award, color: '#cd7f32' };
    default:
      return null;
  }
};

export function Leaderboard() {
  return (
    <div className="relative h-full">
      {/* Glow Effect */}
      <motion.div
        className="absolute -inset-2 bg-gradient-to-b from-[#00d9ff]/20 to-[#ff00ff]/20 rounded-2xl blur-xl"
        animate={{
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
        }}
      />

      {/* Leaderboard Container */}
      <div className="relative bg-gradient-to-b from-[#1a1f3a]/80 to-[#2d1b4e]/80 backdrop-blur-xl border-2 border-[#00d9ff]/30 rounded-2xl p-6 shadow-2xl h-full">
        {/* Title */}
        <motion.div
          className="mb-6 pb-4 border-b border-white/10"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h3
            className="text-2xl text-transparent bg-clip-text bg-gradient-to-r from-[#00d9ff] to-[#ff00ff] mb-1"
            style={{ fontWeight: 700 }}
          >
            🏆 LEADERBOARD
          </h3>
          <p className="text-xs text-white/50">Top-5 UCU Discrete Masters</p>
        </motion.div>

        {/* Students List */}
        <div className="space-y-3">
          {topStudents.map((student, index) => {
            const rankInfo = getRankIcon(student.rank);
            const RankIcon = rankInfo?.icon;

            return (
              <motion.div
                key={student.rank}
                className="relative group"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ x: 5 }}
              >
                {/* Rank Badge */}
                <div className="flex items-center gap-3 p-3 bg-black/30 rounded-xl border border-white/10 group-hover:border-[#00d9ff]/50 transition-all">
                  <div
                    className="flex items-center justify-center w-10 h-10 rounded-lg text-white font-bold"
                    style={{
                      background:
                        student.rank <= 3
                          ? `linear-gradient(135deg, ${rankInfo?.color}40, ${rankInfo?.color}20)`
                          : 'rgba(255, 255, 255, 0.1)',
                    }}
                  >
                    {RankIcon ? (
                      <RankIcon className="w-5 h-5" style={{ color: rankInfo?.color }} />
                    ) : (
                      <span>#{student.rank}</span>
                    )}
                  </div>

                  {/* Avatar */}
                  <div className="text-3xl">{student.avatar}</div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-white text-sm font-semibold truncate">
                        {student.name}
                      </h4>
                      <span className="text-lg">{student.country}</span>
                    </div>
                    <p className="text-xs text-[#00d9ff]">{student.time}</p>
                  </div>

                  {/* Glow on hover */}
                  <motion.div
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#00d9ff]/10 to-[#ff00ff]/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                  />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Your Rank */}
        <motion.div
          className="mt-6 pt-4 border-t border-white/10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <div className="flex items-center justify-between p-3 bg-gradient-to-r from-[#00d9ff]/20 to-[#ff00ff]/20 rounded-xl border border-[#00d9ff]/30">
            <div className="flex items-center gap-3">
              <div className="text-2xl">👤</div>
              <div>
                <h4 className="text-white text-sm font-semibold">You</h4>
                <p className="text-xs text-[#ffd700]">Keep grinding! 💪</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-white font-bold">#12</div>
              <div className="text-xs text-white/70">28h 15m</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
