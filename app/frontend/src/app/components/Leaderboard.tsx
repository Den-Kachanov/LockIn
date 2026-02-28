import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Trophy, Medal, Award } from 'lucide-react';

interface LeaderboardEntry {
  rank: number;
  username: string;
  total_study_minutes: number;
}

interface LeaderboardData {
  leaderboard: LeaderboardEntry[];
  my_rank: number;
  my_study_minutes: number;
}

const avatars = ['🧑‍💻', '👩‍🎓', '👨‍💼', '👩‍🔬', '👨‍🎨', '👩‍💻', '🧑‍🎓', '👨‍🔬', '👩‍🎨', '🧑‍💼'];

function formatTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m}m`;
}

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
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch('/api/dashboard/leaderboard', { credentials: 'include' });
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.error('Failed to fetch leaderboard:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative h-full">
      <motion.div
        className="absolute -inset-2 bg-gradient-to-b from-[#00d9ff]/20 to-[#ff00ff]/20 rounded-2xl blur-xl"
        animate={{ opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 3, repeat: Infinity }}
      />

      <div className="relative bg-gradient-to-b from-[#1a1f3a]/80 to-[#2d1b4e]/80 backdrop-blur-xl border-2 border-[#00d9ff]/30 rounded-2xl p-6 shadow-2xl h-full">
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
          <p className="text-xs text-white/50">Top UCU Discrete Masters</p>
        </motion.div>

        {loading ? (
          <div className="text-center text-white/50 py-8">Loading...</div>
        ) : data && data.leaderboard.length > 0 ? (
          <div className="space-y-3">
            {data.leaderboard.map((student, index) => {
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

                    <div className="text-3xl">{avatars[index % avatars.length]}</div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-white text-sm font-semibold truncate">
                          {student.username}
                        </h4>
                        <span className="text-lg">🇺🇦</span>
                      </div>
                      <p className="text-xs text-[#00d9ff]">{formatTime(student.total_study_minutes)}</p>
                    </div>

                    <motion.div
                      className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#00d9ff]/10 to-[#ff00ff]/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center text-white/50 py-8">No data yet. Start studying!</div>
        )}

        {data && (
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
                <div className="text-white font-bold">#{data.my_rank}</div>
                <div className="text-xs text-white/70">{formatTime(data.my_study_minutes)}</div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
