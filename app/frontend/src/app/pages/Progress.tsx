import { motion } from 'motion/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Calendar, TrendingUp, Award, Clock } from 'lucide-react';

const weeklyData = [
  { day: 'Mon', hours: 4.5 },
  { day: 'Tue', hours: 6.2 },
  { day: 'Wed', hours: 3.8 },
  { day: 'Thu', hours: 5.5 },
  { day: 'Fri', hours: 4.0 },
  { day: 'Sat', hours: 2.5 },
  { day: 'Sun', hours: 1.5 },
];

const monthlyData = [
  { week: 'Week 1', hours: 28 },
  { week: 'Week 2', hours: 32 },
  { week: 'Week 3', hours: 25 },
  { week: 'Week 4', hours: 35 },
];

export function Progress() {
  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Study Time', value: '120h 45m', icon: Clock, color: '#00d9ff' },
          { label: 'Avg. Session', value: '45 min', icon: TrendingUp, color: '#ffd700' },
          { label: 'Completed Goals', value: '24/30', icon: Award, color: '#ff00ff' },
          { label: 'Current Streak', value: '7 days', icon: Calendar, color: '#00d9ff' },
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
              <div className="relative">
                <Icon className="w-8 h-8 mb-3" style={{ color: stat.color }} />
                <div className="text-xs text-white/50 mb-1">{stat.label}</div>
                <div className="text-2xl text-white font-bold">{stat.value}</div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Chart */}
        <motion.div
          className="relative bg-gradient-to-br from-[#1a1f3a]/80 to-[#2d1b4e]/80 backdrop-blur-xl border-2 border-[#00d9ff]/30 rounded-2xl p-6 shadow-2xl"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h3 className="text-xl text-[#00d9ff] mb-4 font-bold">📊 This Week's Activity</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
              <XAxis dataKey="day" stroke="#ffffff50" />
              <YAxis stroke="#ffffff50" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a1f3a',
                  border: '1px solid #00d9ff',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="hours" fill="url(#colorGradient)" radius={[8, 8, 0, 0]} />
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00d9ff" />
                  <stop offset="100%" stopColor="#ff00ff" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Monthly Trend */}
        <motion.div
          className="relative bg-gradient-to-br from-[#1a1f3a]/80 to-[#2d1b4e]/80 backdrop-blur-xl border-2 border-[#ff00ff]/30 rounded-2xl p-6 shadow-2xl"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h3 className="text-xl text-[#ff00ff] mb-4 font-bold">📈 Monthly Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
              <XAxis dataKey="week" stroke="#ffffff50" />
              <YAxis stroke="#ffffff50" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a1f3a',
                  border: '1px solid #ff00ff',
                  borderRadius: '8px',
                }}
              />
              <Line
                type="monotone"
                dataKey="hours"
                stroke="#ffd700"
                strokeWidth={3}
                dot={{ fill: '#ffd700', r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Study Calendar */}
      <motion.div
        className="relative bg-gradient-to-br from-[#1a1f3a]/80 to-[#2d1b4e]/80 backdrop-blur-xl border-2 border-[#ffd700]/30 rounded-2xl p-6 shadow-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h3 className="text-xl text-[#ffd700] mb-6 font-bold">📅 Study Calendar</h3>
        
        {/* Month Header */}
        <div className="mb-4">
          <h4 className="text-center text-white text-lg font-semibold">February 2026</h4>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {/* Day Headers */}
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
            <div key={day} className="text-center text-sm text-white/50 font-semibold py-2">
              {day}
            </div>
          ))}

          {/* Calendar Days */}
          {Array.from({ length: 35 }, (_, i) => {
            const day = i - 2; // Start from -2 to account for offset
            const isValidDay = day > 0 && day <= 28;
            const hasActivity = isValidDay && Math.random() > 0.3;
            const intensity = hasActivity ? Math.floor(Math.random() * 4) + 1 : 0;
            const isToday = day === 11;

            return (
              <motion.div
                key={i}
                className={`aspect-square rounded-lg flex items-center justify-center text-sm relative ${
                  isValidDay ? 'cursor-pointer' : ''
                } ${isToday ? 'ring-2 ring-[#00d9ff]' : ''}`}
                style={{
                  backgroundColor: hasActivity
                    ? `rgba(0, 217, 255, ${0.2 * intensity})`
                    : 'rgba(255, 255, 255, 0.05)',
                }}
                whileHover={isValidDay ? { scale: 1.1 } : {}}
              >
                {isValidDay && (
                  <>
                    <span className={hasActivity ? 'text-white' : 'text-white/30'}>
                      {day}
                    </span>
                    {hasActivity && (
                      <div className="absolute bottom-1 w-1 h-1 bg-[#ffd700] rounded-full" />
                    )}
                  </>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 mt-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-white/5" />
            <span className="text-white/50">No activity</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-[#00d9ff]/40" />
            <span className="text-white/50">Some activity</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-[#00d9ff]/80" />
            <span className="text-white/50">High activity</span>
          </div>
        </div>
      </motion.div>

      {/* Achievements Progress */}
      <motion.div
        className="relative bg-gradient-to-br from-[#1a1f3a]/80 to-[#2d1b4e]/80 backdrop-blur-xl border-2 border-[#ff00ff]/30 rounded-2xl p-6 shadow-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h3 className="text-xl text-[#ff00ff] mb-6 font-bold">🎯 Achievement Progress</h3>
        
        <div className="space-y-4">
          {[
            { name: 'Study Marathon', progress: 75, total: 100, icon: '🏃' },
            { name: 'Night Owl', progress: 12, total: 20, icon: '🦉' },
            { name: 'Early Bird', progress: 18, total: 30, icon: '🐦' },
            { name: 'Consistency King', progress: 45, total: 50, icon: '👑' },
          ].map((achievement) => (
            <div key={achievement.name} className="p-4 bg-black/30 rounded-xl border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{achievement.icon}</span>
                  <div>
                    <h4 className="text-white font-semibold">{achievement.name}</h4>
                    <p className="text-xs text-white/50">
                      {achievement.progress}/{achievement.total} sessions
                    </p>
                  </div>
                </div>
                <span className="text-[#ffd700] font-bold">
                  {Math.round((achievement.progress / achievement.total) * 100)}%
                </span>
              </div>
              <div className="h-2 bg-black/50 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-[#00d9ff] to-[#ff00ff]"
                  initial={{ width: 0 }}
                  animate={{ width: `${(achievement.progress / achievement.total) * 100}%` }}
                  transition={{ duration: 1, delay: 0.2 }}
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
