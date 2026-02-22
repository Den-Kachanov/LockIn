import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Palette, X } from 'lucide-react';
import { useTheme, themes } from '../contexts/ThemeContext';

export function ThemeSwitcher() {
  const { themeName, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Theme Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 md:px-4 py-2 rounded-xl border border-white/20 bg-white/5 backdrop-blur-md hover:bg-white/10 transition-colors"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Palette className="w-4 h-4 md:w-5 md:h-5" style={{ color: 'var(--theme-primary)' }} />
        <span className="text-xs md:text-sm text-white hidden sm:inline">
          {themes[themeName].name}
        </span>
      </motion.button>

      {/* Modal Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-[9998]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />

            {/* Modal - Center of Screen */}
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none">
              <motion.div
                className="w-full max-w-2xl pointer-events-auto"
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: 'spring', bounce: 0.3, duration: 0.5 }}
              >
                <div className="relative bg-gradient-to-br from-[#1a1f3a]/98 to-[#2d1b4e]/98 backdrop-blur-2xl border-2 border-white/30 rounded-3xl p-6 md:p-8 shadow-2xl">
                  {/* Glowing border effect */}
                  <motion.div
                    className="absolute -inset-1 rounded-3xl blur-xl opacity-50 -z-10"
                    style={{
                      background: `linear-gradient(to right, var(--theme-primary), var(--theme-secondary))`,
                    }}
                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />

                  <div className="relative z-10">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                      <motion.h3
                        className="text-2xl md:text-3xl text-transparent bg-clip-text font-bold flex items-center gap-3"
                        style={{
                          backgroundImage: `linear-gradient(to right, var(--theme-primary), var(--theme-secondary))`,
                        }}
                        animate={{
                          backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                        }}
                        transition={{ duration: 3, repeat: Infinity }}
                      >
                        <Palette className="w-7 h-7 md:w-8 md:h-8" style={{ color: 'var(--theme-primary)' }} />
                        Choose Your Theme
                      </motion.h3>
                      <motion.button
                        onClick={() => setIsOpen(false)}
                        className="w-10 h-10 md:w-12 md:h-12 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors border border-white/20"
                        whileHover={{ scale: 1.1, rotate: 90 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <X className="w-5 h-5 md:w-6 md:h-6 text-white" />
                      </motion.button>
                    </div>

                    {/* Theme Grid - All visible */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 max-h-[60vh] overflow-y-auto scrollbar-hide pr-2">
                      {Object.entries(themes).map(([key, theme], index) => (
                        <motion.button
                          key={key}
                          onClick={() => {
                            setTheme(key);
                            setTimeout(() => setIsOpen(false), 300);
                          }}
                          className={`relative p-4 md:p-5 rounded-2xl border-2 transition-all ${
                            themeName === key
                              ? 'border-white/60 bg-white/15 shadow-xl'
                              : 'border-white/10 bg-black/20 hover:bg-white/10 hover:border-white/30'
                          }`}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          whileHover={{ scale: 1.05, y: -5 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {/* Gradient Preview */}
                          <motion.div
                            className="h-16 md:h-20 rounded-xl mb-3 shadow-lg"
                            style={{
                              background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary}, ${theme.accent})`,
                            }}
                            animate={
                              themeName === key
                                ? {
                                    boxShadow: [
                                      `0 0 20px ${theme.primary}40`,
                                      `0 0 30px ${theme.secondary}60`,
                                      `0 0 20px ${theme.primary}40`,
                                    ],
                                  }
                                : {}
                            }
                            transition={{ duration: 2, repeat: Infinity }}
                          />

                          {/* Theme Name */}
                          <div className="text-sm md:text-base text-white/90 font-bold mb-1">
                            {theme.name}
                          </div>

                          {/* Color Dots */}
                          <div className="flex gap-1.5 justify-center mb-2">
                            <div
                              className="w-3 h-3 md:w-4 md:h-4 rounded-full border border-white/30"
                              style={{ backgroundColor: theme.primary }}
                            />
                            <div
                              className="w-3 h-3 md:w-4 md:h-4 rounded-full border border-white/30"
                              style={{ backgroundColor: theme.secondary }}
                            />
                            <div
                              className="w-3 h-3 md:w-4 md:h-4 rounded-full border border-white/30"
                              style={{ backgroundColor: theme.accent }}
                            />
                          </div>

                          {/* Active Indicator */}
                          {themeName === key && (
                            <motion.div
                              className="text-xs text-white/70 flex items-center justify-center gap-1"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: 'spring', bounce: 0.5 }}
                            >
                              <span className="text-base">✓</span>
                              <span>Active</span>
                            </motion.div>
                          )}

                          {/* Hover glow */}
                          <motion.div
                            className="absolute inset-0 rounded-2xl blur-xl opacity-0 hover:opacity-30 transition-opacity pointer-events-none"
                            style={{
                              background: `linear-gradient(to right, ${theme.primary}, ${theme.secondary})`,
                            }}
                          />
                        </motion.button>
                      ))}
                    </div>

                    {/* Info Text */}
                    <motion.p
                      className="text-center text-white/50 text-xs md:text-sm mt-6"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      Choose a theme that matches your study vibe ✨
                    </motion.p>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}