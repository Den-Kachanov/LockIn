import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Target, MessageCircle, Trophy, Crown, Star, Zap } from 'lucide-react';
import { useState, useEffect } from 'react';

interface Group {
  id: number;
  name: string;
  members: number;
  active: number;
  subject: string;
  color: string;
  emoji: string;
  userIsMember: boolean; // this tells if the current user is in this group
}

interface Challenge {
  id: number;
  title: string;
  description: string;
  progress: number;
  total: number;
  unit: string;
  reward: number;
  participants: number;
  timeLeft: string;
  icon: string;
  userIsParticipant: boolean; // tells if the user joined this challenge
}

interface ActivityItem {
  user: string;
  action: string;
  type: string;
  time: string;
  avatar: string;
}

function ActivityIcon({ type }: { type: string }) {
  if (type === 'jackpot') return <Crown className="w-5 h-5 text-[#ffd700]" />;
  if (type === 'challenge') return <Trophy className="w-5 h-5 text-[#ffd700]" />;
  if (type === 'achievement') return <Star className="w-5 h-5 text-[#ff00ff]" />;
  return <Zap className="w-5 h-5 text-[#00d9ff]" />;
}

function ActivityBadge({ type }: { type: string }) {
  const styles: Record<string, { bg: string; color: string; label: string }> = {
    jackpot:     { bg: 'rgba(255,215,0,0.2)',   color: '#ffd700', label: 'JACKPOT' },
    challenge:   { bg: 'rgba(0,217,255,0.2)',   color: '#00d9ff', label: 'CHALLENGE' },
    achievement: { bg: 'rgba(255,0,255,0.2)',   color: '#ff00ff', label: 'ACHIEVEMENT' },
    session:     { bg: 'rgba(0,217,255,0.15)',  color: '#00d9ff', label: 'SESSION' },
  };
  const s = styles[type];
  if (!s) return null;
  return (
    <span className="text-xs px-2 py-0.5 rounded-full font-bold"
      style={{ background: s.bg, color: s.color }}>
      {s.label}
    </span>
  );
}


export function Community() {
  const [studyGroups, setStudyGroups] = useState<Group[]>([]);
  const [joinedGroup, setJoinedGroup] = useState<number | null>(null);

  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [joinedChallenges, setJoinedChallenges] = useState<Set<number>>(new Set());

  const [groupMembers, setGroupMembers] = useState<Record<number, number>>({});
  const [challengeParticipants, setChallengeParticipants] = useState<Record<number, number>>({});

  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [activityLoading, setActivityLoading] = useState(true);

  // Fetch activity feed
  const fetchActivity = async () => {
    try {
      const res = await fetch('/api/community/activity', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch activity');
      const data = await res.json();
      setActivity(data.activity);
    } catch (err) {
      console.error(err);
    } finally {
      setActivityLoading(false);
    }
  };

  // Fetch groups and challenges
  useEffect(() => {
    const fetchCommunity = async () => {
      try {
        // Fetch groups
        const groupsRes = await fetch('/api/community/groups', { credentials: 'include' });
        if (!groupsRes.ok) throw new Error('Failed to fetch groups');
        const groupsData = await groupsRes.json();
        setStudyGroups(groupsData.groups);
        setGroupMembers(Object.fromEntries(groupsData.groups.map((g: Group) => [g.id, g.members])));
        const userGroup = groupsData.groups.find((g: Group) => g.userIsMember);
        if (userGroup) setJoinedGroup(userGroup.id);

        // Fetch challenges
        const challengesRes = await fetch('/api/community/challenges', { credentials: 'include' });
        if (!challengesRes.ok) throw new Error('Failed to fetch challenges');
        const challengesData = await challengesRes.json();
        setChallenges(challengesData.challenges);
        setChallengeParticipants(Object.fromEntries(challengesData.challenges.map((c: Challenge) => [c.id, c.participants])));

        const joinedSet = new Set<number>(
          challengesData.challenges.filter((c: Challenge) => c.userIsParticipant).map((c: Challenge) => c.id)
        );
        setJoinedChallenges(joinedSet);

      } catch (err) {
        console.error(err);
      }
    };

    fetchCommunity();
    fetchActivity();
    const interval = setInterval(fetchActivity, 30000);
    return () => clearInterval(interval);
  }, []);

  // Group join/leave
  const handleGroupClick = async (groupId: number) => {
    const group = studyGroups.find(g => g.id === groupId)!;
    try {
      if (joinedGroup === groupId) {
        await fetch('/api/community/groups/leave', {
          method: 'POST',
          credentials: 'include',
        });
        setJoinedGroup(null);
        setGroupMembers(prev => ({ ...prev, [groupId]: prev[groupId] - 1 }));
      } else {
        if (joinedGroup !== null) {
          // Leave previous group
          await fetch('/api/community/groups/leave', {
            method: 'POST',
            credentials: 'include',
          });
          setGroupMembers(prev => ({ ...prev, [joinedGroup]: prev[joinedGroup] - 1 }));
        }

        await fetch('/api/community/groups/join', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ group_id: groupId }),
        });

        setJoinedGroup(groupId);
      }

      // **Fetch updated groups after join/leave**
      const groupsRes = await fetch('/api/community/groups', { credentials: 'include' });
      if (groupsRes.ok) {
        const groupsData = await groupsRes.json();
        setStudyGroups(groupsData.groups);
        setGroupMembers(Object.fromEntries(groupsData.groups.map((g: Group) => [g.id, g.members])));
      }

      // Add activity
      setActivity(prev => [{
        user: 'You',
        action: joinedGroup === groupId ? `left "${group.name}"` : `joined "${group.name}"`,
        type: 'achievement',
        time: 'just now',
        avatar: '🫵',
      }, ...prev.slice(0, 14)]);

    } catch (err) {
      console.error(err);
      alert('Something went wrong. Please try again.');
    }
  };

  // Challenge join/leave
  const handleChallengeClick = async (challengeId: number) => {
    const challenge = challenges.find(c => c.id === challengeId)!;
    const isJoined = joinedChallenges.has(challengeId);
    try {
      const endpoint = isJoined ? '/api/community/challenges/leave' : '/api/community/challenges/join';
      const res = await fetch(endpoint, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challenge_id: challengeId }),
      });
      if (!res.ok) throw new Error('Failed to update challenge');

      setJoinedChallenges(prev => {
        const next = new Set(prev);
        if (isJoined) next.delete(challengeId);
        else next.add(challengeId);
        return next;
      });

      setChallengeParticipants(prev => ({
        ...prev,
        [challengeId]: prev[challengeId] + (isJoined ? -1 : 1),
      }));

      // Add activity
      if (!isJoined) {
        setActivity(prev => [{
          user: 'You',
          action: `joined the "${challenge.title}" challenge!`,
          type: 'challenge',
          time: 'just now',
          avatar: '🫵',
        }, ...prev.slice(0, 14)]);
      }

    } catch (err) {
      console.error(err);
      alert('Something went wrong. Please try again.');
    }
  };

  // Compute stats dynamically
  const usersInGroups = studyGroups.reduce((acc, g) => acc + g.members, 0);
  const totalGroups = studyGroups.length;
  const totalChallenges = challenges.length;

  const stats = [
    { label: 'Users in Groups', value: usersInGroups.toLocaleString(), icon: Users, color: '#00d9ff' },
    { label: 'Study Groups', value: totalGroups, icon: Target, color: '#ffd700' },
    { label: 'Active Challenges', value: totalChallenges, icon: Trophy, color: '#ff00ff' },
  ];


  return (
    <div className="space-y-6">
      {/* Community Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, index) => {
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
              {studyGroups.find(g => g.id === joinedGroup)?.emoji}{' '}
              You're in <span className="text-[#00d9ff]">{studyGroups.find(g => g.id === joinedGroup)?.name}</span>!
            </span>
            <span className="text-white/50 text-sm ml-2">You can only be in one group at a time.</span>
          </motion.div>
        )}
      </AnimatePresence>

            {/* Study Groups */}
      <div>
        <h3 className="text-2xl text-[#00d9ff] mb-4 font-bold flex items-center gap-2">
          <Users className="w-7 h-7" /> Study Groups
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {studyGroups.map((group, index) => {
            const isJoined = joinedGroup === group.id;
            const isDisabled = joinedGroup !== null && !isJoined; // Only the joined group can be interacted with

            return (
              <motion.div
                key={group.id}
                className="relative bg-gradient-to-br from-[#1a1f3a]/80 to-[#2d1b4e]/80 backdrop-blur-xl border-2 rounded-2xl p-5 shadow-2xl"
                style={{ borderColor: isJoined ? group.color : 'rgba(255,255,255,0.1)' }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: isDisabled ? 0 : -4 }} // no hover lift if disabled
              >
                {isJoined && (
                  <div
                    className="absolute top-3 right-3 text-xs px-2 py-0.5 rounded-full font-bold text-white"
                    style={{ background: group.color }}
                  >
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
                      ? 'linear-gradient(to right, #ef4444, #f97316)' // Leave button
                      : `linear-gradient(to right, ${group.color}, #ff00ff)`, // Join button (inactive if disabled)
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
          <Target className="w-7 h-7" /> Active Challenges
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
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{challenge.icon}</span>
                  <h4 className="text-xl text-white font-bold">{challenge.title}</h4>
                  {isJoined && (
                    <span className="text-xs px-2 py-0.5 rounded-full font-bold text-black" style={{ background: '#ffd700' }}>JOINED</span>
                  )}
                </div>
                <p className="text-sm text-white/70 mb-3">{challenge.description}</p>
                <div className="flex items-center gap-4 text-sm text-white/50 mb-4">
                  <span>👥 {challengeParticipants[challenge.id]} participants</span>
                  <span>⏰ {challenge.timeLeft} left</span>
                  <span className="text-[#ffd700]">🏆 {challenge.reward} points</span>
                </div>
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-white/70">{challenge.progress} / {challenge.total} {challenge.unit}</span>
                    <span className="text-[#00d9ff] font-bold">{Math.round((challenge.progress / challenge.total) * 100)}%</span>
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

      {/* Recent Activity Feed — real data from backend */}
      <motion.div
        className="relative bg-gradient-to-br from-[#1a1f3a]/80 to-[#2d1b4e]/80 backdrop-blur-xl border-2 border-[#ff00ff]/30 rounded-2xl p-6 shadow-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h3 className="text-2xl text-[#ff00ff] mb-4 font-bold flex items-center gap-2">
          <MessageCircle className="w-7 h-7" /> Recent Activity
        </h3>

        {activityLoading ? (
          <div className="text-center text-white/50 py-8">Loading activity...</div>
        ) : activity.length === 0 ? (
          <div className="text-center text-white/50 py-8">
            No activity yet — complete study sessions or spin the casino to appear here!
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence initial={false}>
              {activity.map((item, index) => (
                <motion.div
                  key={`${item.user}-${item.time}-${index}`}
                  className="flex items-center gap-4 p-4 bg-black/30 rounded-xl border border-white/10 hover:border-[#ff00ff]/30 transition-colors"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.04 }}
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
        )}
      </motion.div>
    </div>
  );
}