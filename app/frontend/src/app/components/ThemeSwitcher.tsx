import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'motion/react';
import { Palette, X } from 'lucide-react';
import { useTheme, themes } from '../contexts/ThemeContext';

export function ThemeSwitcher() {
  const { themeName, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    async function loadTheme() {
      try {
        const res = await axios.get('/api/theme', { withCredentials: true });
        if (res.data.theme && themes[res.data.theme]) {
          setTheme(res.data.theme);
        } else {
          setTheme('cyber'); // fallback
        }
      } catch (e) {
        console.error('Failed to fetch theme:', e);
        setTheme('cyber');
      }
    }
    loadTheme();
  }, []);

  const handleSetTheme = async (key: string) => {
    try {
      const res = await axios.post('/api/theme', { theme: key }, { withCredentials: true });
      if (res.status === 200) {
        setTheme(key);
        setIsOpen(false);
      }
    } catch (e) {
      console.error('Failed to save theme:', e);
      alert('Failed to save theme. Please try again.');
    }
  };

  return (
    <>
      {/* Button to open modal */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 md:px-4 py-2 rounded-xl border border-white/20 bg-white/5 backdrop-blur-md hover:bg-white/10 transition-colors"
      >
        <Palette className="w-4 h-4 md:w-5 md:h-5" style={{ color: 'var(--theme-primary)' }} />
        <span className="text-xs md:text-sm text-white hidden sm:inline">
          {themes[themeName].name}
        </span>
      </motion.button>

      {/* Modal using portal */}
      {isOpen &&
        createPortal(
          <AnimatePresence>
            <motion.div
              className="fixed inset-0 z-[9999] flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Dimmed backdrop */}
              <motion.div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.7 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsOpen(false)}
              />

              {/* Modal card */}
              <motion.div
                className="relative bg-gradient-to-br from-[#1a1f3a]/98 to-[#2d1b4e]/98 rounded-3xl p-6 md:p-8 shadow-2xl w-full max-w-2xl mx-4 z-[10000] overflow-y-auto"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                <button
                  onClick={() => setIsOpen(false)}
                  className="absolute top-4 right-4 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors border border-white/20"
                >
                  <X className="w-5 h-5 text-white" />
                </button>

                <h3 className="text-2xl md:text-3xl font-bold text-center text-white mb-6">
                  Choose Your Theme
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 max-h-[60vh] overflow-y-auto scrollbar-hide">
                  {Object.entries(themes).map(([key, theme]) => (
                    <button
                      key={key}
                      onClick={() => handleSetTheme(key)}
                      className={`relative p-4 md:p-5 rounded-2xl border-2 transition-all ${
                        themeName === key
                          ? 'border-white/60 bg-white/15 shadow-xl'
                          : 'border-white/10 bg-black/20 hover:bg-white/10 hover:border-white/30'
                      }`}
                    >
                      <div
                        className="h-16 md:h-20 rounded-xl mb-3 shadow-lg"
                        style={{
                          background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary}, ${theme.accent})`,
                        }}
                      />
                      <div className="text-sm md:text-base text-white/90 font-bold mb-1">{theme.name}</div>
                    </button>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}
