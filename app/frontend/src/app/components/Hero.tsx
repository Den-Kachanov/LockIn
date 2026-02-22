import { motion } from 'motion/react';
import { Sparkles, Heart, Star } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 opacity-20" />
      
      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="inline-flex items-center gap-2 mb-6"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
          >
            <Sparkles className="w-8 h-8 text-yellow-400" />
            <span className="text-2xl">Welcome to Something Fun!</span>
            <Sparkles className="w-8 h-8 text-yellow-400" />
          </motion.div>

          <motion.h1
            className="text-6xl md:text-8xl mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Let's Have Fun
          </motion.h1>

          <motion.p
            className="text-xl md:text-2xl text-gray-300 mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            A playful space with aesthetic vibes and delightful interactions
          </motion.p>

          <motion.div
            className="flex gap-4 justify-center flex-wrap"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <motion.button
              className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-white font-semibold shadow-lg"
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              Explore Magic ✨
            </motion.button>
            <motion.button
              className="px-8 py-4 bg-white/10 backdrop-blur-md rounded-full text-white font-semibold border border-white/20"
              whileHover={{ scale: 1.1, rotate: -5, backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
              whileTap={{ scale: 0.95 }}
            >
              Learn More 🚀
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Floating Icons */}
        <motion.div
          className="absolute top-20 left-10"
          animate={{ y: [0, -20, 0], rotate: [0, 360] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Heart className="w-12 h-12 text-pink-400 fill-pink-400" />
        </motion.div>
        <motion.div
          className="absolute bottom-20 right-10"
          animate={{ y: [0, 20, 0], rotate: [0, -360] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Star className="w-12 h-12 text-yellow-400 fill-yellow-400" />
        </motion.div>
      </div>
    </section>
  );
}
