import { motion } from 'motion/react';
import { Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="relative z-10 py-12 px-4 border-t border-white/10 backdrop-blur-lg">
      <div className="max-w-6xl mx-auto text-center">
        <motion.div
          className="flex items-center justify-center gap-2 mb-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <span className="text-gray-400">Made with</span>
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <Heart className="w-5 h-5 text-pink-400 fill-pink-400" />
          </motion.div>
          <span className="text-gray-400">and a sprinkle of magic ✨</span>
        </motion.div>
        <p className="text-gray-500 text-sm">
          © 2026 Something Fun. Keep spreading joy! 🌈
        </p>
      </div>
    </footer>
  );
}
