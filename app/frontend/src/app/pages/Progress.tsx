import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Calendar, TrendingUp, Award, Clock } from 'lucide-react';

interface Achievement {
  name: string;
  icon: string;
  progress: number;
  total: number;
  desc: string;
}

interface ProgressData {
  total_study_minutes: number;
  total_sessions: number;
  avg_session_minutes: number;
  current_streak: number;
  weekly: { day: string; hours: number }[];
  monthly: { week: string; hours: number }[];
  calendar: Record<string, number>;
  achievements: Achievement[];
  today_day: number;
  month_name: string;
}

function formatTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m}m`;
}

export function Progress() {
  const [data, setData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProgress = async () => {
    try {
      const res = await fetch('/api/progress/stats', { credentials: 'include' });
      if (res.ok) setData(await res.json());
    } catch (e) {
      console.error('Failed to fetch progress:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgress();
    const interval = setInterval(fetchProgress, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="text-center text-white/50 py-20">Loading progress...</div>;
  if (!data) return <div className="text-center text-white/50 py-20">Failed to load</div>;

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = (new Date(year, month, 1).getDay() + 6) % 7;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Study Time', value: formatTime(data.total_study_minutes), icon: Clock, color: '#00d9ff' },
          { label: 'Avg. Session', value: `${data.avg_session_minutes} min`, icon: TrendingUp, color: '#ffd700' },
          { label: 'Total Sessions', value: `${data.total_sessions}`, icon: Award, color: '#ff00ff' },
          { label: 'Current Streak', value: `${data.current_streak} days`, icon: Calendar, color: '#00d9ff' },
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
        <motion.div
          className="relative bg-gradient-to-br from-[#1a1f3a]/80 to-[#2d1b4e]/80 backdrop-blur-xl border-2 border-[#00d9ff]/30 rounded-2xl p-6 shadow-2xl"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h3 className="text-xl text-[#00d9ff] mb-4 font-bold">📊 This Week's Activity</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.weekly}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
              <XAxis dataKey="day" stroke="#ffffff50" />
              <YAxis stroke="#ffffff50" />
              <Tooltip contentStyle={{ backgroundColor: '#1a1f3a', border: '1px solid #00d9ff', borderRadius: '8px' }} />
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

        <motion.div
          className="relative bg-gradient-to-br from-[#1a1f3a]/80 to-[#2d1b4e]/80 backdrop-blur-xl border-2 border-[#ff00ff]/30 rounded-2xl p-6 shadow-2xl"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h3 className="text-xl text-[#ff00ff] mb-4 font-bold">📈 Monthly Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data.monthly}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
              <XAxis dataKey="week" stroke="#ffffff50" />
              <YAxis stroke="#ffffff50" />
              <Tooltip contentStyle={{ backgroundColor: '#1a1f3a', border: '1px solid #ff00ff', borderRadius: '8px' }} />
              <Line type="monotone" dataKey="hours" stroke="#ffd700" strokeWidth={3} dot={{ fill: '#ffd700', r: 6 }} />
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
        <div className="mb-4">
          <h4 className="text-center text-white text-lg font-semibold">{data.month_name}</h4>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
            <div key={d} className="text-center text-sm text-white/50 font-semibold py-2">{d}</div>
          ))}
          {Array.from({ length: 42 }, (_, i) => {
            const dayNum = i - firstDayOfWeek + 1;
            const isValid = dayNum > 0 && dayNum <= daysInMonth;
            const dateStr = isValid ? `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}` : '';
            const mins = data.calendar[dateStr] || 0;
            const intensity = mins > 0 ? Math.min(4, Math.ceil(mins / 30)) : 0;
            const isToday = dayNum === data.today_day;

            return (
              <motion.div
                key={i}
                className={`aspect-square rounded-lg flex items-center justify-center text-sm relative ${isValid ? 'cursor-pointer' : ''} ${isToday ? 'ring-2 ring-[#00d9ff]' : ''}`}
                style={{ backgroundColor: intensity > 0 ? `rgba(0, 217, 255, ${0.2 * intensity})` : 'rgba(255, 255, 255, 0.05)' }}
                whileHover={isValid ? { scale: 1.1 } : {}}
                title={isValid && mins > 0 ? `${mins} min studied` : ''}
              >
                {isValid && (
                  <>
                    <span className={intensity > 0 ? 'text-white' : 'text-white/30'}>{dayNum}</span>
                    {intensity > 0 && <div className="absolute bottom-1 w-1 h-1 bg-[#ffd700] rounded-full" />}
                  </>
                )}
              </motion.div>
            );
          })}
        </div>
        <div className="flex items-center justify-center gap-4 mt-6 text-sm">
          <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-white/5" /><span className="text-white/50">No activity</span></div>
          <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-[#00d9ff]/40" /><span className="text-white/50">Some</span></div>
          <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-[#00d9ff]/80" /><span className="text-white/50">High</span></div>
        </div>
      </motion.div>

      {/* Achievements */}
      <motion.div
        className="relative bg-gradient-to-br from-[#1a1f3a]/80 to-[#2d1b4e]/80 backdrop-blur-xl border-2 border-[#ff00ff]/30 rounded-2xl p-6 shadow-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h3 className="text-xl text-[#ff00ff] mb-6 font-bold">🎯 Achievement Progress</h3>
        <div className="space-y-4">
          {data.achievements.map((a) => (
            <div key={a.name} className="p-4 bg-black/30 rounded-xl border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{a.icon}</span>
                  <div>
                    <h4 className="text-white font-semibold">{a.name}</h4>
                    <p className="text-xs text-white/50">{a.desc} — {a.progress}/{a.total}</p>
                  </div>
                </div>
                <span className="text-[#ffd700] font-bold">
                  {a.total > 0 ? Math.round((a.progress / a.total) * 100) : 0}%
                </span>
              </div>
              <div className="h-2 bg-black/50 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-[#00d9ff] to-[#ff00ff]"
                  initial={{ width: 0 }}
                  animate={{ width: `${a.total > 0 ? (a.progress / a.total) * 100 : 0}%` }}
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
