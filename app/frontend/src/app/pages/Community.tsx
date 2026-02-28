import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Target, MessageCircle, Trophy, Flame, Zap, Crown, Star } from 'lucide-react';

const studyGroups = [
  { id: 1, name: 'Discrete Math Masters', members: 24, active: 8, subject: 'Mathematics', color: '#00d9ff', emoji: '📐' },
  { id: 2, name: 'Algorithm Grinders', members: 18, active: 12, subject: 'Computer Science', color: '#ff00ff', emoji: '💻' },
  { id: 3, name: 'Late Night Study Crew', members: 31, active: 5, subject: 'All Subjects', color: '#ffd700', emoji: '🌙' },
  { id: 4, name: 'Final Exam Warriors', members: 42, active: 15, subject: 'All Subjects', color: '#00d9ff', emoji: '⚔️' },
  { id: 5, name: 'Physics Legends', members: 19, active: 7, subject: 'Physics', color: '#ff00ff', emoji: '⚛️' },
  { id: 6, name: 'English Pros', members: 27, active: 9, subject: 'Languages', color: '#ffd700', emoji: '📝' },
  { id: 7, name: 'Data Science Squad', members: 35, active: 11, subject: 'Computer Science', color: '#00d9ff', emoji: '📊' },
  { id: 8, name: 'Philosophy Circle', members: 14, active: 4, subject: 'Humanities', color: '#ff00ff', emoji: '🧠' },
];

const challenges = [
  {
    id: 1,
    title: '100 Hour Challenge',
    description: 'Study 100 hours this month',
    progress: 67,
    total: 100,
    unit: 'hours',
    reward: 500,
    participants: 156,
    timeLeft: '12 days',
    icon: '🔥',
  },
  {
    id: 2,
    title: 'Early Bird Week',
    description: 'Study before 8 AM for 7 days',
    progress: 4,
    total: 7,
    unit: 'days',
    reward: 300,
    participants: 89,
    timeLeft: '3 days',
    icon: '🌅',
  },
  {
    id: 3,
    title: 'Weekend Warrior',
    description: 'Complete 10 sessions on weekends',
    progress: 6,
    total: 10,
    unit: 'sessions',
    reward: 200,
    participants: 234,
    timeLeft: '2 weeks',
    icon: '⚡',
  },
  {
    id: 4,
    title: 'Pomodoro King',
    description: 'Complete 50 pomodoro sessions',
    progress: 23,
    total: 50,
    unit: 'sessions',
    reward: 400,
    participants: 112,
    timeLeft: '20 days',
    icon: '🍅',
  },
  {
    id: 5,
    title: 'Streak Master',
    description: 'Maintain a 14-day study streak',
    progress: 9,
    total: 14,
    unit: 'days',
    reward: 350,
    participants: 78,
    timeLeft: '5 days',
    icon: '🏆',
  },
];

const initialActivity = [
  { user: 'Alex Chen', action: 'hit a JACKPOT on the slot machine!', time: '2h ago', avatar: '🧑‍💻', type: 'jackpot' },
  { user: 'Sarah Kim', action: 'completed the Early Bird Week challenge!', time: '4h ago', avatar: '👩‍🎓', type: 'challenge' },
  { user: 'Mike Johnson', action: 'won the 100 Hour Challenge!', time: '6h ago', avatar: '👨‍💼', type: 'challenge' },
  { user: 'Emma Davis', action: 'unlocked the "Night Owl" achievement!', time: '8h ago', avatar: '👩‍🔬', type: 'achievement' },
  { user: 'James Wilson', action: 'hit a JACKPOT on the slot machine!', time: '10h ago', avatar: '👨‍🎨', type: 'jackpot' },
  { user: 'Olena Koval', action: 'completed the Pomodoro King challenge!', time: '12h ago', avatar: '👩‍💻', type: 'challenge' },
  { user: 'Dmytro Shev', action: 'unlocked the "Streak Master" achievement!', time: '14h ago', avatar: '🧑‍🎓', type: 'achievement' },
];

function ActivityIcon({ type }: { type: string }) {
  if (type === 'jackpot') return <Crown className="w-5 h-5 text-[#ffd700]" />;
  if (type === 'challenge') return <Trophy className="w-5 h-5 text-[#ffd700]" />;
  if (type === 'achievement') return <Star className="w-5 h-5 text-[#ff00ff]" />;
  return <Zap className="w-5 h-5 text-[#00d9ff]" />;
}

function ActivityBadge({ type }: { type: string }) {
  if (type === 'jackpot') return (
    <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: 'rgba(255,215,0,0.2)', color: '#ffd700' }}>JACKPOT</span>
  );
  if (type === 'challenge') return (
    <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: 'rgba(0,217,255,0.2)', color: '#00d9ff' }}>CHALLENGE</span>
  );
  if (type === 'achievement') return (
    <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: 'rgba(255,0,255,0.2)', color: '#ff00ff' }}>ACHIEVEMENT</span>
  );
  return null;
}

export function Community() {
  const [joinedGroup, setJoinedGroup] = useState<number | null>(null);
  const [joinedChallenges, setJoinedChallenges] = useState<Set<number>>(new Set());
  const [activity, setActivity] = useState(initialActivity);
  const [groupMembers, setGroupMembers] = useState<Record<number, number>>(
    Object.fromEntries(studyGroups.map(g => [g.id, g.members]))
  );
  const [challengeParticipants, setChallengeParticipants] = useState<Record<number, number>>(
    Object.fromEntries(challenges.map(c => [c.id, c.participants]))
  );

  const handleGroupClick = (groupId: number) => {
    const group = studyGroups.find(g => g.id === groupId)!;
    if (joinedGroup === groupId) {
      // Leave group
      setJoinedGroup(null);
      setGroupMembers(prev => ({ ...prev, [groupId]: prev[groupId] - 1 }));
      setActivity(prev => [{
        user: 'You',
        action: `left "${group.name}"`,
        time: 'just now',
        avatar: '🫵',
        type: 'achievement',
      }, ...prev.slice(0, 6)]);
    } else {
      // Leave old group if any
      if (joinedGroup !== null) {
        setGroupMembers(prev => ({ ...prev, [joinedGroup]: prev[joinedGroup] - 1 }));
      }
      // Join new group
      setJoinedGroup(groupId);
      setGroupMembers(prev => ({ ...prev, [groupId]: prev[groupId] + 1 }));
      setActivity(prev => [{
        user: 'You',
        action: `joined "${group.name}"`,
        time: 'just now',
        avatar: '🫵',
        type: 'achievement',
      }, ...prev.slice(0, 6)]);
    }
  };

  const handleChallengeClick = (challengeId: number) => {
    const challenge = challenges.find(c => c.id === challengeId)!;
    setJoinedChallenges(prev => {
      const next = new Set(prev);
      if (next.has(challengeId)) {
        next.delete(challengeId);
        setChallengeParticipants(p => ({ ...p, [challengeId]: p[challengeId] - 1 }));
      } else {
        next.add(challengeId);
        setChallengeParticipants(p => ({ ...p, [challengeId]: p[challengeId] + 1 }));
        setActivity(prev => [{
          user: 'You',
          action: `joined the "${challenge.title}" challenge!`,
          time: 'just now',
          avatar: '🫵',
          type: 'challenge',
        }, ...prev.slice(0, 6)]);
      }
      return next;
    });
  };

  return (
    <div className="space-y-6">
      {/* Community Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Active Students', value: '2,847', icon: Users, color: '#00d9ff' },
          { label: 'Study Groups', value: '8', icon: Target, color: '#ffd700' },
          { label: 'Active Challenges', value: '5', icon: Trophy, color: '#ff00ff' },
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
                className="absolute -inset-1 rounded-2xl blur-lg opacity-30 pointer-events-none"
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

      {/* Joined group banner */}
      <AnimatePresence>
        {joinedGroup !== null && (
          <motion.div
            className="p-4 rounded-2xl border-2 border-[#00d9ff]/50 text-center"
            style={{ background: 'rgba(0,217,255,0.1)' }}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <span className="text-white font-bold">
              {studyGroups.find(g => g.id === joinedGroup)?.emoji} You're in{' '}
              <span className="text-[#00d9ff]">{studyGroups.find(g => g.id === joinedGroup)?.name}</span>!
            </span>
            <span className="text-white/50 text-sm ml-2">You can only be in one group at a time.</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Study Groups */}
      <div>
        <h3 className="text-2xl text-[#00d9ff] mb-4 font-bold flex items-center gap-2">
          <Users className="w-7 h-7" />
          Study Groups
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {studyGroups.map((group, index) => {
            const isJoined = joinedGroup === group.id;
            const isDisabled = joinedGroup !== null && joinedGroup !== group.id;
            return (
              <motion.div
                key={group.id}
                className="relative bg-gradient-to-br from-[#1a1f3a]/80 to-[#2d1b4e]/80 backdrop-blur-xl border-2 rounded-2xl p-5 shadow-2xl"
                style={{ borderColor: isJoined ? group.color : 'rgba(255,255,255,0.1)' }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -4 }}
              >
                {isJoined && (
                  <div className="absolute top-3 right-3 text-xs px-2 py-0.5 rounded-full font-bold text-white"
                    style={{ background: group.color }}>
                    JOINED
                  </div>
                )}
                <div className="text-3xl mb-2">{group.emoji}</div>
                <h4 className="text-base text-white font-bold mb-1 leading-tight">{group.name}</h4>
                <p className="text-xs text-white/50 mb-3">{group.subject}</p>

                <div className="flex items-center gap-4 mb-4">
                  <div>
                    <div className="text-xl text-white font-bold">{groupMembers[group.id]}</div>
                    <div className="text-xs text-white/50">Members</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold" style={{ color: group.color }}>{group.active}</div>
                    <div className="text-xs text-white/50">Active</div>
                  </div>
                </div>

                <button
                  onClick={() => handleGroupClick(group.id)}
                  disabled={isDisabled}
                  className="w-full py-2.5 rounded-xl text-white font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed"
                  style={{
                    background: isJoined
                      ? 'linear-gradient(to right, #ef4444, #f97316)'
                      : `linear-gradient(to right, ${group.color}, #ff00ff)`,
                  }}
                >
                  {isJoined ? 'Leave Group' : 'Join Group'}
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Active Challenges */}
      <div>
        <h3 className="text-2xl text-[#ffd700] mb-4 font-bold flex items-center gap-2">
          <Target className="w-7 h-7" />
          Active Challenges
        </h3>
        <div className="space-y-4">
          {challenges.map((challenge, index) => {
            const isJoined = joinedChallenges.has(challenge.id);
            return (
              <motion.div
                key={challenge.id}
                className="relative bg-gradient-to-br from-[#1a1f3a]/80 to-[#2d1b4e]/80 backdrop-blur-xl border-2 rounded-2xl p-6 shadow-2xl"
                style={{ borderColor: isJoined ? '#ffd700' : 'rgba(255,215,0,0.3)' }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{challenge.icon}</span>
                      <h4 className="text-xl text-white font-bold">{challenge.title}</h4>
                      {isJoined && (
                        <span className="text-xs px-2 py-0.5 rounded-full font-bold text-black" style={{ background: '#ffd700' }}>
                          JOINED
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-white/70 mb-3">{challenge.description}</p>

                    <div className="flex items-center gap-4 text-sm text-white/50 mb-4">
                      <span>👥 {challengeParticipants[challenge.id]} participants</span>
                      <span>⏰ {challenge.timeLeft} left</span>
                      <span className="text-[#ffd700]">🏆 {challenge.reward} points</span>
                    </div>

                    <div className="mb-2">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-white/70">
                          {challenge.progress} / {challenge.total} {challenge.unit}
                        </span>
                        <span className="text-[#00d9ff] font-bold">
                          {Math.round((challenge.progress / challenge.total) * 100)}%
                        </span>
                      </div>
                      <div className="h-3 bg-black/50 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-[#00d9ff] to-[#ffd700]"
                          initial={{ width: 0 }}
                          animate={{ width: `${(challenge.progress / challenge.total) * 100}%` }}
                          transition={{ duration: 1, delay: 0.3 }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleChallengeClick(challenge.id)}
                  className="w-full py-3 rounded-xl text-white font-bold transition-all hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    background: isJoined
                      ? 'linear-gradient(to right, #ef4444, #f97316)'
                      : 'linear-gradient(to right, #ffd700, #ff00ff)',
                  }}
                >
                  {isJoined ? 'Leave Challenge' : 'Join Challenge'}
                </button>
              </motion.div>
            );
          })}
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
          <AnimatePresence initial={false}>
            {activity.map((item, index) => (
              <motion.div
                key={`${item.user}-${item.time}-${index}`}
                className="flex items-center gap-4 p-4 bg-black/30 rounded-xl border border-white/10 hover:border-[#ff00ff]/30 transition-colors"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="text-3xl">{item.avatar}</div>
                <div className="flex-1">
                  <p className="text-white">
                    <span className="font-bold">{item.user}</span>{' '}
                    <span className="text-white/70">{item.action}</span>
                  </p>
                  <p className="text-xs text-white/50">{item.time}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <ActivityIcon type={item.type} />
                  <ActivityBadge type={item.type} />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
