import { motion } from 'motion/react';
import { useTheme } from '../contexts/ThemeContext';

export function CircuitBackground() {
  const { currentTheme } = useTheme();

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Gradient Base */}
      <div 
        className="absolute inset-0" 
        style={{
          background: `linear-gradient(to bottom right, ${currentTheme.gradientFrom}, ${currentTheme.gradientTo})`
        }}
      />

      {/* Circuit Pattern Overlay */}
      <svg className="absolute inset-0 w-full h-full opacity-20">
        <defs>
          <pattern id="circuit" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
            <circle cx="10" cy="10" r="2" fill={currentTheme.primary} opacity="0.5" />
            <circle cx="90" cy="10" r="2" fill={currentTheme.secondary} opacity="0.5" />
            <circle cx="10" cy="90" r="2" fill={currentTheme.accent} opacity="0.5" />
            <circle cx="90" cy="90" r="2" fill={currentTheme.primary} opacity="0.5" />
            <line x1="10" y1="10" x2="90" y2="10" stroke={currentTheme.primary} strokeWidth="0.5" opacity="0.3" />
            <line x1="10" y1="10" x2="10" y2="90" stroke={currentTheme.secondary} strokeWidth="0.5" opacity="0.3" />
            <line x1="90" y1="10" x2="90" y2="90" stroke={currentTheme.accent} strokeWidth="0.5" opacity="0.3" />
            <line x1="10" y1="90" x2="90" y2="90" stroke={currentTheme.primary} strokeWidth="0.5" opacity="0.3" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#circuit)" />
      </svg>

      {/* Glowing Data Streams */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute h-px"
          style={{
            top: `${20 + i * 20}%`,
            left: '-100%',
            width: '100%',
            background: `linear-gradient(to right, transparent, ${currentTheme.primary}, transparent)`
          }}
          animate={{
            left: ['0%', '100%'],
          }}
          transition={{
            duration: 10 + i * 2,
            repeat: Infinity,
            ease: 'linear',
            delay: i * 0.5,
          }}
        />
      ))}

      {/* Floating Particles */}
      {[...Array(20)].map((_, i) => {
        const colors = [currentTheme.primary, currentTheme.secondary, currentTheme.accent];
        return (
          <motion.div
            key={`particle-${i}`}
            className="absolute w-1 h-1 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              backgroundColor: colors[Math.floor(Math.random() * 3)],
            }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        );
      })}
    </div>
  );
}