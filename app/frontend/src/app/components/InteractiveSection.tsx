import { useState } from 'react';
import { motion } from 'motion/react';
import { Smile, Zap, Sparkles, Trophy } from 'lucide-react';

const emojis = ['😊', '🎉', '✨', '🚀', '🌈', '🎨', '🎵', '🎮', '📸', '🌟', '💫', '🔥', '💖', '🦄', '🌸'];

export function InteractiveSection() {
  const [clicks, setClicks] = useState<Array<{ id: number; x: number; y: number; emoji: string }>>([]);
  const [score, setScore] = useState(0);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const emoji = emojis[Math.floor(Math.random() * emojis.length)];
    const id = Date.now();

    setClicks((prev) => [...prev, { id, x, y, emoji }]);
    setScore((prev) => prev + 1);

    setTimeout(() => {
      setClicks((prev) => prev.filter((click) => click.id !== id));
    }, 1000);
  };

  return (
    <section className="py-20 px-4 relative z-10">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-5xl mb-4 bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
            Click for Fun!
          </h2>
          <p className="text-xl text-gray-400">
            Click anywhere in the box below and watch the magic happen!
          </p>
        </motion.div>

        {/* Score Display */}
        <motion.div
          className="flex items-center justify-center gap-4 mb-8"
          initial={{ opacity: 0, scale: 0 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          <Trophy className="w-8 h-8 text-yellow-400" />
          <span className="text-3xl text-white">Score: {score}</span>
          <Sparkles className="w-8 h-8 text-yellow-400" />
        </motion.div>

        {/* Interactive Area */}
        <motion.div
          className="relative bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-3xl border-2 border-white/20 backdrop-blur-lg overflow-hidden cursor-pointer"
          style={{ height: '400px' }}
          onClick={handleClick}
          whileHover={{ scale: 1.02 }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-10 left-10">
              <Smile className="w-16 h-16 text-yellow-400" />
            </div>
            <div className="absolute bottom-10 right-10">
              <Zap className="w-16 h-16 text-blue-400" />
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <Sparkles className="w-20 h-20 text-pink-400" />
            </div>
          </div>

          {/* Click Message */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <motion.p
              className="text-2xl text-white/60"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Click anywhere! 👆
            </motion.p>
          </div>

          {/* Click Animations */}
          {clicks.map((click) => (
            <motion.div
              key={click.id}
              className="absolute text-4xl pointer-events-none"
              style={{ left: click.x, top: click.y }}
              initial={{ opacity: 1, scale: 0, rotate: 0 }}
              animate={{
                opacity: 0,
                scale: 2,
                rotate: 360,
                y: -100,
              }}
              transition={{ duration: 1 }}
            >
              {click.emoji}
            </motion.div>
          ))}
        </motion.div>

        {/* Fun Stats */}
        <motion.div
          className="grid grid-cols-3 gap-4 mt-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-4 text-center border border-white/10">
            <p className="text-3xl mb-1">🎯</p>
            <p className="text-gray-400 text-sm">Total Clicks</p>
            <p className="text-2xl text-white">{score}</p>
          </div>
          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-4 text-center border border-white/10">
            <p className="text-3xl mb-1">⚡</p>
            <p className="text-gray-400 text-sm">Energy Level</p>
            <p className="text-2xl text-white">{Math.min(100, score * 2)}%</p>
          </div>
          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-4 text-center border border-white/10">
            <p className="text-3xl mb-1">🌟</p>
            <p className="text-gray-400 text-sm">Fun Level</p>
            <p className="text-2xl text-white">MAX!</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
