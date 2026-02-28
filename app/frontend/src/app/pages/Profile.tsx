import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { User, Mail, Calendar, Edit, Settings, Bell, Lock, Check, X } from 'lucide-react';

interface ProfileData {
  username: string;
  email: string;
  points: number;
  total_study_minutes: number;
  total_sessions: number;
  current_streak: number;
  rank: number;
  badges: { icon: string; name: string; unlocked: boolean }[];
  notifications_on: boolean;
  privacy_mode: boolean;
}

function formatTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m}m`;
}

export function Profile() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingName, setEditingName] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [editError, setEditError] = useState('');
  const [notifications, setNotifications] = useState(true);
  const [privacyMode, setPrivacyMode] = useState(false);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/profile', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setNewUsername(data.username);
        setNotifications(data.notifications_on);
        setPrivacyMode(data.privacy_mode);
      }
    } catch (e) {
      console.error('Failed to fetch profile:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProfile(); }, []);

  const handleSaveUsername = async () => {
    setEditError('');
    try {
      const res = await fetch('/api/profile/edit_username', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username: newUsername }),
      });
      const data = await res.json();
      if (!res.ok) {
        setEditError(data.detail || 'Failed');
        return;
      }
      if (data.new_token) {
        document.cookie = `access_token=${data.new_token}; path=/; SameSite=Lax`;
      }
      setEditingName(false);
      fetchProfile();
    } catch {
      setEditError('Network error');
    }
  };

  const handleReset = async () => {
    if (!window.confirm('Are you sure? This will reset ALL your progress, points, and history!')) return;
    try {
      const res = await fetch('/api/reset_progress', { method: 'POST', credentials: 'include' });
      const data = await res.json();
      alert(data.message);
      fetchProfile();
    } catch { alert('Network error'); }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure? This is PERMANENT and cannot be undone!')) return;
    try {
      const res = await fetch('/api/delete_account', { method: 'DELETE', credentials: 'include' });
      const data = await res.json();
      alert(data.message);
      if (res.ok) window.location.href = '/login';
    } catch { alert('Network error'); }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST', credentials: 'include' });
      window.location.href = '/login';
    } catch { alert('Network error'); }
  };

  if (loading) return <div className="text-center text-white/50 py-20">Loading...</div>;
  if (!profile) return <div className="text-center text-white/50 py-20">Failed to load profile</div>;

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <motion.div
        className="relative bg-gradient-to-br from-[#1a1f3a]/80 to-[#2d1b4e]/80 backdrop-blur-xl border-2 border-[#00d9ff]/30 rounded-2xl p-8 shadow-2xl"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <motion.div className="absolute -inset-2 bg-[#00d9ff]/20 rounded-2xl blur-xl" animate={{ opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 2, repeat: Infinity }} />
        <div className="relative flex flex-col md:flex-row items-center gap-6">
          <div className="relative">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#00d9ff] to-[#ff00ff] flex items-center justify-center text-6xl">👨‍🎓</div>
          </div>
          <div className="flex-1 text-center md:text-left">
            {editingName ? (
              <div className="flex items-center gap-2 mb-2">
                <input
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="text-2xl bg-black/30 border border-[#00d9ff] rounded-lg px-3 py-1 text-white focus:outline-none"
                  autoFocus
                />
                <button onClick={handleSaveUsername} className="p-2 bg-green-500/80 rounded-lg hover:bg-green-500"><Check className="w-5 h-5 text-white" /></button>
                <button onClick={() => { setEditingName(false); setEditError(''); setNewUsername(profile.username); }} className="p-2 bg-red-500/80 rounded-lg hover:bg-red-500"><X className="w-5 h-5 text-white" /></button>
              </div>
            ) : (
              <div className="flex items-center gap-2 mb-2 justify-center md:justify-start">
                <h2 className="text-3xl text-white font-bold">{profile.username}</h2>
                <motion.button onClick={() => setEditingName(true)} className="p-1 bg-[#ffd700]/20 rounded-lg hover:bg-[#ffd700]/40" whileHover={{ scale: 1.1 }}>
                  <Edit className="w-4 h-4 text-[#ffd700]" />
                </motion.button>
              </div>
            )}
            {editError && <p className="text-red-400 text-sm mb-2">{editError}</p>}
            <div className="flex flex-wrap gap-4 justify-center md:justify-start text-sm text-white/70">
              <div className="flex items-center gap-2"><Mail className="w-4 h-4" /><span>{profile.email}</span></div>
              <div className="flex items-center gap-2"><Calendar className="w-4 h-4" /><span>Streak: {profile.current_streak} days 🔥</span></div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-black/30 rounded-xl border border-white/10">
              <div className="text-2xl text-[#00d9ff] font-bold">{formatTime(profile.total_study_minutes)}</div>
              <div className="text-xs text-white/50">Total Time</div>
            </div>
            <div className="text-center p-3 bg-black/30 rounded-xl border border-white/10">
              <div className="text-2xl text-[#ffd700] font-bold">{profile.points.toLocaleString()} ⭐</div>
              <div className="text-xs text-white/50">Points</div>
            </div>
            <div className="text-center p-3 bg-black/30 rounded-xl border border-white/10">
              <div className="text-2xl text-[#ff00ff] font-bold">#{profile.rank}</div>
              <div className="text-xs text-white/50">Rank</div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Settings */}
        <motion.div
          className="relative bg-gradient-to-br from-[#1a1f3a]/80 to-[#2d1b4e]/80 backdrop-blur-xl border-2 border-[#ff00ff]/30 rounded-2xl p-6 shadow-2xl"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h3 className="text-2xl text-[#ff00ff] mb-6 font-bold flex items-center gap-2"><Settings className="w-7 h-7" /> Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-black/30 rounded-xl border border-white/10">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-[#00d9ff]" />
                <div><h4 className="text-white font-semibold">Notifications</h4><p className="text-xs text-white/50">Get study reminders</p></div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={notifications} onChange={() => setNotifications(!notifications)} />
                <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-[#00d9ff] peer-checked:to-[#ff00ff]"></div>
              </label>
            </div>
            <div className="flex items-center justify-between p-4 bg-black/30 rounded-xl border border-white/10">
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-[#ffd700]" />
                <div><h4 className="text-white font-semibold">Privacy Mode</h4><p className="text-xs text-white/50">Hide from leaderboard</p></div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={privacyMode} onChange={() => setPrivacyMode(!privacyMode)} />
                <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-[#00d9ff] peer-checked:to-[#ff00ff]"></div>
              </label>
            </div>
            <div className="p-4 bg-black/30 rounded-xl border border-white/10">
              <h4 className="text-white font-semibold mb-3">Study Preferences</h4>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-white/50 mb-1 block">Study Session Duration</label>
                  <select className="w-full px-3 py-2 bg-black/50 border border-white/20 rounded-lg text-white text-sm focus:border-[#00d9ff] focus:outline-none">
                    <option>25 minutes (Pomodoro)</option><option>45 minutes</option><option>60 minutes</option><option>90 minutes</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-white/50 mb-1 block">Break Duration</label>
                  <select className="w-full px-3 py-2 bg-black/50 border border-white/20 rounded-lg text-white text-sm focus:border-[#00d9ff] focus:outline-none">
                    <option>5 minutes</option><option>10 minutes</option><option>15 minutes</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Badges */}
        <motion.div
          className="relative bg-gradient-to-br from-[#1a1f3a]/80 to-[#2d1b4e]/80 backdrop-blur-xl border-2 border-[#ffd700]/30 rounded-2xl p-6 shadow-2xl"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h3 className="text-2xl text-[#ffd700] mb-6 font-bold flex items-center gap-2">🏆 Badges & Achievements</h3>
          <div className="grid grid-cols-3 gap-4 mb-6">
            {profile.badges.map((badge) => (
              <motion.div
                key={badge.name}
                className={`aspect-square rounded-xl border-2 flex flex-col items-center justify-center p-2 ${badge.unlocked ? 'bg-gradient-to-br from-[#ffd700]/20 to-[#ff00ff]/20 border-[#ffd700]/50' : 'bg-black/30 border-white/10 opacity-40'}`}
                whileHover={badge.unlocked ? { scale: 1.1 } : {}}
              >
                <div className="text-3xl mb-1">{badge.icon}</div>
                <div className="text-xs text-white/70 text-center">{badge.name}</div>
                {badge.unlocked && <div className="text-[8px] text-[#ffd700] mt-1">UNLOCKED</div>}
              </motion.div>
            ))}
          </div>
          <p className="text-xs text-white/40 text-center">Badges are based on your real progress and may reset monthly</p>
        </motion.div>
      </div>

      {/* Danger Zone */}
      <motion.div
        className="relative bg-gradient-to-br from-red-900/20 to-orange-900/20 backdrop-blur-xl border-2 border-red-500/30 rounded-2xl p-6 shadow-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h3 className="text-xl text-red-400 mb-4 font-bold">⚠️ Danger Zone</h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <button onClick={handleReset} className="px-6 py-3 bg-red-600/80 hover:bg-red-600 rounded-xl text-white font-semibold transition-colors">Reset All Progress</button>
          <button onClick={handleDelete} className="px-6 py-3 bg-orange-600/80 hover:bg-orange-600 rounded-xl text-white font-semibold transition-colors">Delete Account</button>
          <button onClick={handleLogout} className="px-6 py-3 bg-gray-600/80 hover:bg-gray-600 rounded-xl text-white font-semibold transition-colors">Logout</button>
        </div>
      </motion.div>
    </div>
  );
}
