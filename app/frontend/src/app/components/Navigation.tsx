import { motion } from 'motion/react';
import { Home, TrendingUp, Gift, Users, User, GraduationCap, Coins } from 'lucide-react';
import { ThemeSwitcher } from './ThemeSwitcher';
import { useTheme } from '../contexts/ThemeContext';

interface NavigationProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'progress', label: 'Progress', icon: TrendingUp },
  { id: 'casino', label: 'Casino', icon: Coins },
  { id: 'rewards', label: 'Rewards', icon: Gift },
  { id: 'community', label: 'Community', icon: Users },
  { id: 'profile', label: 'Profile', icon: User },
];

export function Navigation({ currentPage, onPageChange }: NavigationProps) {
  const { currentTheme } = useTheme();

  return (
    <header className="relative z-10 px-3 md:px-6 py-3 md:py-4 border-b border-white/10 backdrop-blur-xl bg-black/20">
      <div className="max-w-7xl mx-auto">
        {/* Top Bar */}
        <div className="flex items-center justify-between mb-3 md:mb-4">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center" style={{
              background: `linear-gradient(to bottom right, ${currentTheme.primary}, ${currentTheme.secondary})`
            }}>
              <GraduationCap className="w-6 h-6 md:w-7 md:h-7 text-white" />
            </div>
            <div>
              <h1
                className="text-lg md:text-2xl text-transparent bg-clip-text"
                style={{ 
                  fontWeight: 800,
                  backgroundImage: `linear-gradient(to right, ${currentTheme.primary}, ${currentTheme.secondary})`
                }}
              >
                UCU LOCK IN
              </h1>
              <p className="text-[10px] md:text-xs text-white/50">Study Arena</p>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <ThemeSwitcher />
            <div className="text-right">
              <div className="text-[10px] md:text-sm text-white/70">Points</div>
              <div className="text-sm md:text-xl font-bold" style={{ color: currentTheme.accent }}>1,247 ⭐</div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex gap-1 md:gap-2 overflow-x-auto scrollbar-hide">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            
            return (
              <motion.button
                key={item.id}
                onClick={() => onPageChange(item.id)}
                className={`relative px-3 md:px-6 py-2 md:py-3 rounded-xl font-semibold whitespace-nowrap transition-colors text-xs md:text-base ${
                  isActive
                    ? 'text-white'
                    : 'text-white/50 hover:text-white/80'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isActive && (
                  <motion.div
                    className="absolute inset-0 rounded-xl border"
                    style={{
                      background: `linear-gradient(to right, ${currentTheme.primary}30, ${currentTheme.secondary}30)`,
                      borderColor: `${currentTheme.primary}80`
                    }}
                    layoutId="activeTab"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <div className="relative flex items-center gap-1 md:gap-2">
                  <Icon className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="hidden sm:inline">{item.label}</span>
                </div>
              </motion.button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}