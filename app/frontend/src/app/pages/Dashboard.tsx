import { useState, useEffect } from 'react';
import { PomodoroTimer } from '../components/PomodoroTimer';
import { SlotMachine } from '../components/SlotMachine';
import { Leaderboard } from '../components/Leaderboard';
import { ReportSection } from '../components/ReportSection';

interface UserStats {
  username: string;
  total_study_minutes: number;
  sessions_today: number;
  current_streak: number;
  points: number;
  weekly_minutes: number;
  weekly_goal_minutes: number;
}

interface DashboardProps {
  onNavigate?: (page: string) => void;
}

function formatTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m}m`;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/dashboard/stats', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (e) {
      console.error('Failed to fetch stats:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval);
  }, []);

  const weeklyPercent = stats
    ? Math.min(100, Math.round((stats.weekly_minutes / stats.weekly_goal_minutes) * 100))
    : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
      <div className="lg:col-span-3 order-2 lg:order-1">
        <Leaderboard />
      </div>

      <div className="lg:col-span-6 order-1 lg:order-2 flex flex-col gap-4 md:gap-6">
        <SlotMachine onNavigate={onNavigate} />
        <PomodoroTimer onSessionComplete={fetchStats} />
        <ReportSection />
      </div>

      <div className="lg:col-span-3 order-3">
        <div className="relative bg-gradient-to-b from-[#1a1f3a]/80 to-[#2d1b4e]/80 backdrop-blur-xl border-2 border-[#ff00ff]/30 rounded-2xl p-4 md:p-6 shadow-2xl">
          <h3
            className="text-lg md:text-xl text-transparent bg-clip-text bg-gradient-to-r from-[#ff00ff] to-[#00d9ff] mb-4 md:mb-6"
            style={{ fontWeight: 700 }}
          >
            📊 YOUR STATS
          </h3>

          {loading ? (
            <div className="text-center text-white/50 py-8">Loading...</div>
          ) : stats ? (
            <div className="space-y-3 md:space-y-4">
              <div className="p-3 md:p-4 bg-black/30 rounded-xl border border-white/10">
                <div className="text-xs text-white/50 mb-1">Total Study Time</div>
                <div className="text-xl md:text-2xl text-[#00d9ff] font-bold">
                  {formatTime(stats.total_study_minutes)}
                </div>
              </div>

              <div className="p-3 md:p-4 bg-black/30 rounded-xl border border-white/10">
                <div className="text-xs text-white/50 mb-1">Sessions Today</div>
                <div className="text-xl md:text-2xl text-[#ffd700] font-bold">
                  {stats.sessions_today}
                </div>
              </div>

              <div className="p-3 md:p-4 bg-black/30 rounded-xl border border-white/10">
                <div className="text-xs text-white/50 mb-1">Current Streak</div>
                <div className="text-xl md:text-2xl text-[#ff00ff] font-bold">
                  🔥 {stats.current_streak} days
                </div>
              </div>

              <div className="p-3 md:p-4 bg-black/30 rounded-xl border border-white/10">
                <div className="text-xs text-white/50 mb-1">Points Balance</div>
                <div className="text-xl md:text-2xl text-[#00d9ff] font-bold">
                  {stats.points.toLocaleString()} ⭐
                </div>
              </div>

              <div className="p-3 md:p-4 bg-gradient-to-r from-[#00d9ff]/20 to-[#ff00ff]/20 rounded-xl border border-[#00d9ff]/30">
                <div className="text-xs text-white/70 mb-1">Weekly Goal</div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs md:text-sm text-white">
                    {formatTime(stats.weekly_minutes)} / {formatTime(stats.weekly_goal_minutes)}
                  </span>
                  <span className="text-xs md:text-sm text-[#ffd700]">{weeklyPercent}%</span>
                </div>
                <div className="h-2 bg-black/50 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#00d9ff] to-[#ff00ff]"
                    style={{ width: `${weeklyPercent}%` }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-white/50 py-8">Failed to load stats</div>
          )}
        </div>
      </div>
    </div>
  );
}
