import { motion } from 'motion/react';
import { GraduationCap } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface LoadingScreenProps {
  onLoadingComplete: () => void;
}

export function LoadingScreen({ onLoadingComplete }: LoadingScreenProps) {
  const { currentTheme } = useTheme();

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{
        background: `linear-gradient(to bottom right, ${currentTheme.gradientFrom}, ${currentTheme.gradientTo})`
      }}
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onAnimationComplete={() => {
        setTimeout(onLoadingComplete, 2500);
      }}
    >
      {/* Glowing UCU Logo */}
      <motion.div
        className="relative mb-8"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        <motion.div
          className="absolute inset-0 blur-3xl opacity-50"
          style={{
            background: `linear-gradient(to right, ${currentTheme.primary}, ${currentTheme.secondary})`
          }}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <div 
          className="relative p-8 rounded-full"
          style={{
            background: `linear-gradient(to bottom right, ${currentTheme.primary}, ${currentTheme.secondary})`
          }}
        >
          <GraduationCap className="w-24 h-24 text-white" />
        </div>
      </motion.div>

      {/* UCU Text */}
      <motion.h1
        className="text-6xl mb-4 text-transparent bg-clip-text"
        style={{
          fontWeight: 800,
          backgroundImage: `linear-gradient(to right, ${currentTheme.primary}, ${currentTheme.accent}, ${currentTheme.secondary})`
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
      >
        UCU LOCK IN
      </motion.h1>

      {/* Loading Text */}
      <motion.div
        className="flex items-center gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.6 }}
      >
        <span className="text-xl" style={{ color: currentTheme.primary }}>LOADING...</span>
        <motion.div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: currentTheme.primary }}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </motion.div>
      </motion.div>

      <motion.p
        className="text-lg mt-4"
        style={{ color: currentTheme.accent }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.6 }}
      >
        LOCK IN FOR SUCCESS
      </motion.p>
    </motion.div>
  );
}