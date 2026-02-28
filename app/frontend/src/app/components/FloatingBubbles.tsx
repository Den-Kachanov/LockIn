import { motion } from 'motion/react';

export function FloatingBubbles() {
  const bubbles = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    size: Math.random() * 60 + 20,
    x: Math.random() * 100,
    delay: Math.random() * 5,
    duration: Math.random() * 10 + 15,
  }));

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {bubbles.map((bubble) => (
        <motion.div
          key={bubble.id}
          className="absolute rounded-full bg-gradient-to-br from-purple-400/20 to-pink-400/20 backdrop-blur-sm"
          style={{
            width: bubble.size,
            height: bubble.size,
            left: `${bubble.x}%`,
            bottom: -100,
          }}
          animate={{
            y: [-100, -window.innerHeight - 100],
            x: [0, Math.sin(bubble.id) * 100, 0],
            scale: [1, 1.2, 1],
            opacity: [0, 0.6, 0],
          }}
          transition={{
            duration: bubble.duration,
            delay: bubble.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}
