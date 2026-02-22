import { PomodoroTimer } from '../components/PomodoroTimer';
import { SlotMachine } from '../components/SlotMachine';
import { Leaderboard } from '../components/Leaderboard';
import { ReportSection } from '../components/ReportSection';

export function Dashboard() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
      {/* Left Sidebar - Leaderboard */}
      <div className="lg:col-span-3 order-2 lg:order-1">
        <Leaderboard />
      </div>

      {/* Center - Timer and Casino */}
      <div className="lg:col-span-6 order-1 lg:order-2">
        <SlotMachine />
        <PomodoroTimer />
        <ReportSection />
      </div>

      {/* Right Sidebar - Stats */}
      <div className="lg:col-span-3 order-3">
        <div className="relative bg-gradient-to-b from-[#1a1f3a]/80 to-[#2d1b4e]/80 backdrop-blur-xl border-2 border-[#ff00ff]/30 rounded-2xl p-4 md:p-6 shadow-2xl">
          <h3
            className="text-lg md:text-xl text-transparent bg-clip-text bg-gradient-to-r from-[#ff00ff] to-[#00d9ff] mb-4 md:mb-6"
            style={{ fontWeight: 700 }}
          >
            📊 YOUR STATS
          </h3>

          <div className="space-y-3 md:space-y-4">
            <div className="p-3 md:p-4 bg-black/30 rounded-xl border border-white/10">
              <div className="text-xs text-white/50 mb-1">Total Study Time</div>
              <div className="text-xl md:text-2xl text-[#00d9ff] font-bold">28h 15m</div>
            </div>

            <div className="p-3 md:p-4 bg-black/30 rounded-xl border border-white/10">
              <div className="text-xs text-white/50 mb-1">Sessions Today</div>
              <div className="text-xl md:text-2xl text-[#ffd700] font-bold">6</div>
            </div>

            <div className="p-3 md:p-4 bg-black/30 rounded-xl border border-white/10">
              <div className="text-xs text-white/50 mb-1">Current Streak</div>
              <div className="text-xl md:text-2xl text-[#ff00ff] font-bold">🔥 7 days</div>
            </div>

            <div className="p-3 md:p-4 bg-black/30 rounded-xl border border-white/10">
              <div className="text-xs text-white/50 mb-1">Rewards Earned</div>
              <div className="text-xl md:text-2xl text-[#00d9ff] font-bold">15 🏆</div>
            </div>

            <div className="p-3 md:p-4 bg-gradient-to-r from-[#00d9ff]/20 to-[#ff00ff]/20 rounded-xl border border-[#00d9ff]/30">
              <div className="text-xs text-white/70 mb-1">Weekly Goal</div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs md:text-sm text-white">28h / 40h</span>
                <span className="text-xs md:text-sm text-[#ffd700]">70%</span>
              </div>
              <div className="h-2 bg-black/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#00d9ff] to-[#ff00ff]"
                  style={{ width: '70%' }}
                />
              </div>
            </div>

            <div className="p-3 md:p-4 bg-black/30 rounded-xl border border-white/10">
              <div className="text-xs text-white/50 mb-2">Recent Achievements</div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs md:text-sm">
                  <span>🏆</span>
                  <span className="text-white/70">First Week Warrior</span>
                </div>
                <div className="flex items-center gap-2 text-xs md:text-sm">
                  <span>⚡</span>
                  <span className="text-white/70">Speed Studier</span>
                </div>
                <div className="flex items-center gap-2 text-xs md:text-sm">
                  <span>🎯</span>
                  <span className="text-white/70">Focus Master</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}