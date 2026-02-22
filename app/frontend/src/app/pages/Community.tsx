import { motion } from 'motion/react';
import { Users, Target, MessageCircle, Trophy, Flame, Zap } from 'lucide-react';

const studyGroups = [
  {
    id: 1,
    name: 'Discrete Math Masters',
    members: 24,
    active: 8,
    subject: 'Mathematics',
    color: '#00d9ff',
  },
  {
    id: 2,
    name: 'Algorithm Grinders',
    members: 18,
    active: 12,
    subject: 'Computer Science',
    color: '#ff00ff',
  },
  {
    id: 3,
    name: 'Late Night Study Crew',
    members: 31,
    active: 5,
    subject: 'All Subjects',
    color: '#ffd700',
  },
  {
    id: 4,
    name: 'Final Exam Warriors',
    members: 42,
    active: 15,
    subject: 'All Subjects',
    color: '#00d9ff',
  },
];

const challenges = [
  {
    id: 1,
    title: '100 Hour Challenge',
    description: 'Study 100 hours this month',
    progress: 67,
    total: 100,
    reward: 500,
    participants: 156,
    timeLeft: '12 days',
  },
  {
    id: 2,
    title: 'Early Bird Week',
    description: 'Study before 8 AM for 7 days',
    progress: 4,
    total: 7,
    reward: 300,
    participants: 89,
    timeLeft: '3 days',
  },
  {
    id: 3,
    title: 'Weekend Warrior',
    description: 'Complete 10 sessions on weekends',
    progress: 6,
    total: 10,
    reward: 200,
    participants: 234,
    timeLeft: '2 weeks',
  },
];

const recentActivity = [
  { user: 'Alex Chen', action: 'completed 5-hour study marathon', time: '2h ago', avatar: '🧑‍💻' },
  { user: 'Sarah Kim', action: 'joined "Discrete Math Masters"', time: '4h ago', avatar: '👩‍🎓' },
  { user: 'Mike Johnson', action: 'won "100 Hour Challenge"', time: '6h ago', avatar: '👨‍💼' },
  { user: 'Emma Davis', action: 'reached 30-day streak', time: '8h ago', avatar: '👩‍🔬' },
  { user: 'James Wilson', action: 'unlocked "Night Owl" badge', time: '10h ago', avatar: '👨‍🎨' },
];

export function Community() {
  return (
    <div className="space-y-6">
      {/* Community Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Active Students', value: '2,847', icon: Users, color: '#00d9ff' },
          { label: 'Study Groups', value: '127', icon: Target, color: '#ffd700' },
          { label: 'Active Challenges', value: '15', icon: Trophy, color: '#ff00ff' },
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              className="relative bg-gradient-to-br from-[#1a1f3a]/80 to-[#2d1b4e]/80 backdrop-blur-xl border-2 border-white/10 rounded-2xl p-6 shadow-2xl"
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
              <div className="relative flex items-center justify-between">
                <div>
                  <div className="text-xs text-white/50 mb-1">{stat.label}</div>
                  <div className="text-3xl text-white font-bold">{stat.value}</div>
                </div>
                <Icon className="w-10 h-10" style={{ color: stat.color }} />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Study Groups */}
      <div>
        <h3 className="text-2xl text-[#00d9ff] mb-4 font-bold flex items-center gap-2">
          <Users className="w-7 h-7" />
          Study Groups
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {studyGroups.map((group, index) => (
            <motion.div
              key={group.id}
              className="relative bg-gradient-to-br from-[#1a1f3a]/80 to-[#2d1b4e]/80 backdrop-blur-xl border-2 border-white/10 rounded-2xl p-6 shadow-2xl"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="text-xl text-white font-bold mb-1">{group.name}</h4>
                  <p className="text-sm text-white/50">{group.subject}</p>
                </div>
                <div
                  className="w-3 h-3 rounded-full animate-pulse"
                  style={{ backgroundColor: group.color }}
                />
              </div>

              <div className="flex items-center gap-6 mb-4">
                <div>
                  <div className="text-2xl text-white font-bold">{group.members}</div>
                  <div className="text-xs text-white/50">Members</div>
                </div>
                <div>
                  <div className="text-2xl text-[#00d9ff] font-bold">{group.active}</div>
                  <div className="text-xs text-white/50">Active Now</div>
                </div>
              </div>

              <motion.button
                className="w-full py-3 bg-gradient-to-r from-[#00d9ff] to-[#ff00ff] rounded-xl text-white font-bold"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Join Group
              </motion.button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Active Challenges */}
      <div>
        <h3 className="text-2xl text-[#ffd700] mb-4 font-bold flex items-center gap-2">
          <Target className="w-7 h-7" />
          Active Challenges
        </h3>
        <div className="space-y-4">
          {challenges.map((challenge, index) => (
            <motion.div
              key={challenge.id}
              className="relative bg-gradient-to-br from-[#1a1f3a]/80 to-[#2d1b4e]/80 backdrop-blur-xl border-2 border-[#ffd700]/30 rounded-2xl p-6 shadow-2xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Trophy className="w-6 h-6 text-[#ffd700]" />
                    <h4 className="text-xl text-white font-bold">{challenge.title}</h4>
                  </div>
                  <p className="text-sm text-white/70 mb-3">{challenge.description}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-white/50 mb-4">
                    <span>👥 {challenge.participants} participants</span>
                    <span>⏰ {challenge.timeLeft} left</span>
                    <span className="text-[#ffd700]">🏆 {challenge.reward} points</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-white/70">
                        {challenge.progress} / {challenge.total}
                      </span>
                      <span className="text-[#00d9ff] font-bold">
                        {Math.round((challenge.progress / challenge.total) * 100)}%
                      </span>
                    </div>
                    <div className="h-3 bg-black/50 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-[#00d9ff] to-[#ffd700]"
                        initial={{ width: 0 }}
                        animate={{
                          width: `${(challenge.progress / challenge.total) * 100}%`,
                        }}
                        transition={{ duration: 1, delay: 0.3 }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <motion.button
                className="w-full py-3 bg-gradient-to-r from-[#ffd700] to-[#ff00ff] rounded-xl text-white font-bold"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Join Challenge
              </motion.button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recent Activity Feed */}
      <motion.div
        className="relative bg-gradient-to-br from-[#1a1f3a]/80 to-[#2d1b4e]/80 backdrop-blur-xl border-2 border-[#ff00ff]/30 rounded-2xl p-6 shadow-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h3 className="text-2xl text-[#ff00ff] mb-4 font-bold flex items-center gap-2">
          <MessageCircle className="w-7 h-7" />
          Recent Activity
        </h3>
        
        <div className="space-y-3">
          {recentActivity.map((activity, index) => (
            <motion.div
              key={index}
              className="flex items-center gap-4 p-4 bg-black/30 rounded-xl border border-white/10 hover:border-[#ff00ff]/30 transition-colors"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="text-3xl">{activity.avatar}</div>
              <div className="flex-1">
                <p className="text-white">
                  <span className="font-bold">{activity.user}</span>{' '}
                  <span className="text-white/70">{activity.action}</span>
                </p>
                <p className="text-xs text-white/50">{activity.time}</p>
              </div>
              {activity.action.includes('won') && <Trophy className="w-5 h-5 text-[#ffd700]" />}
              {activity.action.includes('streak') && <Flame className="w-5 h-5 text-orange-500" />}
              {activity.action.includes('marathon') && <Zap className="w-5 h-5 text-[#00d9ff]" />}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
