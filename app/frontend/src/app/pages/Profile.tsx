import { motion } from 'motion/react';
import { User, Mail, Calendar, MapPin, Edit, Settings, Bell, Lock, Palette } from 'lucide-react';

const handleReset = async () => {
  try {
    const res = await fetch("/api/reset_progress", {
      method: "POST",
      credentials: "include", // important to send JWT cookie
    });
    const data = await res.json();
    alert(data.message);
  } catch (err) {
    alert("Network error");
  }
};

const handleDelete = async () => {
  if (!window.confirm("Are you sure? This is permanent!")) return;
  try {
    const res = await fetch("/api/delete_account", {
      method: "DELETE",
      credentials: "include",
    });
    const data = await res.json();
    alert(data.message);
    if (res.ok) window.location.href = "/login"; // redirect after delete
  } catch (err) {
    alert("Network error");
  }
};

const handleLogout = async () => {
  try {
    const res = await fetch("/api/logout", {
      method: "POST",
      credentials: "include",
    });
    const data = await res.json();
    alert(data.message);
    window.location.href = "/login"; // redirect after logout
  } catch (err) {
    alert("Network error");
  }
};


export function Profile() {
  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <motion.div
        className="relative bg-gradient-to-br from-[#1a1f3a]/80 to-[#2d1b4e]/80 backdrop-blur-xl border-2 border-[#00d9ff]/30 rounded-2xl p-8 shadow-2xl"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <motion.div
          className="absolute -inset-2 bg-[#00d9ff]/20 rounded-2xl blur-xl"
          animate={{ opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
        />

        <div className="relative flex flex-col md:flex-row items-center gap-6">
          {/* Avatar */}
          <div className="relative">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#00d9ff] to-[#ff00ff] flex items-center justify-center text-6xl">
              👨‍🎓
            </div>
            <motion.button
              className="absolute bottom-0 right-0 w-10 h-10 bg-[#ffd700] rounded-full flex items-center justify-center shadow-lg"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Edit className="w-5 h-5 text-white" />
            </motion.button>
          </div>

          {/* Info */}
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-3xl text-white font-bold mb-2">Your Name</h2>
            <p className="text-[#00d9ff] mb-4">Computer Science, Year 2</p>
            
            <div className="flex flex-wrap gap-4 justify-center md:justify-start text-sm text-white/70">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>student@ucu.edu.ua</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>Joined Feb 2026</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>Lviv, Ukraine</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-black/30 rounded-xl border border-white/10">
              <div className="text-2xl text-[#00d9ff] font-bold">120h</div>
              <div className="text-xs text-white/50">Total Time</div>
            </div>
            <div className="text-center p-3 bg-black/30 rounded-xl border border-white/10">
              <div className="text-2xl text-[#ffd700] font-bold">15</div>
              <div className="text-xs text-white/50">Rewards</div>
            </div>
            <div className="text-center p-3 bg-black/30 rounded-xl border border-white/10">
              <div className="text-2xl text-[#ff00ff] font-bold">#12</div>
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
          <h3 className="text-2xl text-[#ff00ff] mb-6 font-bold flex items-center gap-2">
            <Settings className="w-7 h-7" />
            Settings
          </h3>

          <div className="space-y-4">
            {/* Notifications */}
            <div className="flex items-center justify-between p-4 bg-black/30 rounded-xl border border-white/10">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-[#00d9ff]" />
                <div>
                  <h4 className="text-white font-semibold">Notifications</h4>
                  <p className="text-xs text-white/50">Get study reminders</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-[#00d9ff] peer-checked:to-[#ff00ff]"></div>
              </label>
            </div>

            {/* Privacy */}
            <div className="flex items-center justify-between p-4 bg-black/30 rounded-xl border border-white/10">
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-[#ffd700]" />
                <div>
                  <h4 className="text-white font-semibold">Privacy Mode</h4>
                  <p className="text-xs text-white/50">Hide from leaderboard</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-[#00d9ff] peer-checked:to-[#ff00ff]"></div>
              </label>
            </div>

            {/* Theme */}
            <div className="p-4 bg-black/30 rounded-xl border border-white/10">
              <div className="flex items-center gap-3 mb-3">
                <Palette className="w-5 h-5 text-[#ff00ff]" />
                <div>
                  <h4 className="text-white font-semibold">Theme</h4>
                  <p className="text-xs text-white/50">Choose your color scheme</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { name: 'Cyber', colors: ['#00d9ff', '#ff00ff'] },
                  { name: 'Gold', colors: ['#ffd700', '#ff8800'] },
                  { name: 'Matrix', colors: ['#00ff00', '#00aa00'] },
                ].map((theme) => (
                  <button
                    key={theme.name}
                    className="p-2 bg-black/50 rounded-lg border border-white/10 hover:border-white/30 transition-colors"
                  >
                    <div
                      className="h-6 rounded mb-1"
                      style={{
                        background: `linear-gradient(to right, ${theme.colors[0]}, ${theme.colors[1]})`,
                      }}
                    />
                    <div className="text-xs text-white/70">{theme.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Study Preferences */}
            <div className="p-4 bg-black/30 rounded-xl border border-white/10">
              <h4 className="text-white font-semibold mb-3">Study Preferences</h4>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-white/50 mb-1 block">
                    Study Session Duration
                  </label>
                  <select className="w-full px-3 py-2 bg-black/50 border border-white/20 rounded-lg text-white text-sm focus:border-[#00d9ff] focus:outline-none">
                    <option>25 minutes (Pomodoro)</option>
                    <option>45 minutes</option>
                    <option>60 minutes</option>
                    <option>90 minutes</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-white/50 mb-1 block">
                    Break Duration
                  </label>
                  <select className="w-full px-3 py-2 bg-black/50 border border-white/20 rounded-lg text-white text-sm focus:border-[#00d9ff] focus:outline-none">
                    <option>5 minutes</option>
                    <option>10 minutes</option>
                    <option>15 minutes</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Badges & Achievements */}
        <motion.div
          className="relative bg-gradient-to-br from-[#1a1f3a]/80 to-[#2d1b4e]/80 backdrop-blur-xl border-2 border-[#ffd700]/30 rounded-2xl p-6 shadow-2xl"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h3 className="text-2xl text-[#ffd700] mb-6 font-bold flex items-center gap-2">
            🏆 Badges & Achievements
          </h3>

          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { icon: '🏃', name: 'Marathon', unlocked: true },
              { icon: '🔥', name: 'Streak', unlocked: true },
              { icon: '⚡', name: 'Speed', unlocked: true },
              { icon: '🦉', name: 'Night Owl', unlocked: true },
              { icon: '🐦', name: 'Early Bird', unlocked: false },
              { icon: '👑', name: 'Royalty', unlocked: false },
            ].map((badge) => (
              <motion.div
                key={badge.name}
                className={`aspect-square rounded-xl border-2 flex flex-col items-center justify-center p-2 ${
                  badge.unlocked
                    ? 'bg-gradient-to-br from-[#ffd700]/20 to-[#ff00ff]/20 border-[#ffd700]/50'
                    : 'bg-black/30 border-white/10 opacity-40'
                }`}
                whileHover={badge.unlocked ? { scale: 1.1 } : {}}
              >
                <div className="text-3xl mb-1">{badge.icon}</div>
                <div className="text-xs text-white/70 text-center">{badge.name}</div>
              </motion.div>
            ))}
          </div>

          <div className="p-4 bg-black/30 rounded-xl border border-white/10">
            <h4 className="text-white font-semibold mb-3">Next Milestone</h4>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-white/70">Complete 50 sessions</span>
                  <span className="text-[#00d9ff]">42/50</span>
                </div>
                <div className="h-2 bg-black/50 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#00d9ff] to-[#ff00ff]"
                    style={{ width: '84%' }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-white/70">Study 150 hours</span>
                  <span className="text-[#ffd700]">120/150h</span>
                </div>
                <div className="h-2 bg-black/50 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#ffd700] to-[#ff00ff]"
                    style={{ width: '80%' }}
                  />
                </div>
              </div>
            </div>
          </div>
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
          <button
            className="px-6 py-3 bg-red-600/80 hover:bg-red-600 rounded-xl text-white font-semibold transition-colors"
            onClick={handleReset}
          >
            Reset All Progress
          </button>
          <button
            className="px-6 py-3 bg-orange-600/80 hover:bg-orange-600 rounded-xl text-white font-semibold transition-colors"
            onClick={handleDelete}
          >
            Delete Account
          </button>
          <button
            className="px-6 py-3 bg-orange-600/80 hover:bg-orange-600 rounded-xl text-white font-semibold transition-colors"
            onClick={handleLogout}
          >
            Logout
          </button>

        </div>
      </motion.div>
    </div>
  );
}
