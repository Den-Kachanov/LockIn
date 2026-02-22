import { motion } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Palette, Music, Gamepad2, Camera } from 'lucide-react';

const cards = [
  {
    id: 1,
    title: 'Creative Art',
    description: 'Explore beautiful artwork and designs',
    icon: Palette,
    color: 'from-purple-500 to-pink-500',
    image: 'https://images.unsplash.com/photo-1639493115941-a70fcef4f715?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2xvcmZ1bCUyMGdyYWRpZW50JTIwYWJzdHJhY3QlMjBiYWNrZ3JvdW5kfGVufDF8fHx8MTc3MDI0OTc1OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  },
  {
    id: 2,
    title: 'Chill Vibes',
    description: 'Relax with soothing music',
    icon: Music,
    color: 'from-blue-500 to-cyan-500',
    image: 'https://images.unsplash.com/photo-1725066744443-c872351c9e2b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZXN0aGV0aWMlMjBuYXR1cmUlMjBsYW5kc2NhcGUlMjBzdW5zZXR8ZW58MXx8fHwxNzcwMzA1ODcwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  },
  {
    id: 3,
    title: 'Fun Games',
    description: 'Play interactive mini-games',
    icon: Gamepad2,
    color: 'from-green-500 to-emerald-500',
    image: 'https://images.unsplash.com/photo-1625461291092-13d0c45608b3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pbWFsJTIwbW9kZXJuJTIwd29ya3NwYWNlfGVufDF8fHx8MTc3MDMwNTg3MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  },
  {
    id: 4,
    title: 'Gallery',
    description: 'View stunning photography',
    icon: Camera,
    color: 'from-orange-500 to-red-500',
    image: 'https://images.unsplash.com/photo-1639493115941-a70fcef4f715?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2xvcmZ1bCUyMGdyYWRpZW50JTIwYWJzdHJhY3QlMjBiYWNrZ3JvdW5kfGVufDF8fHx8MTc3MDI0OTc1OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  },
];

export function InteractiveCards() {
  return (
    <section className="py-20 px-4 relative z-10">
      <motion.div
        className="max-w-7xl mx-auto"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <motion.h2
          className="text-5xl text-center mb-16 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          Discover Amazing Things
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card, index) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.id}
                className="group relative"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -10 }}
              >
                <div className="relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10 shadow-xl">
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ImageWithFallback
                        src={card.image}
                        alt={card.title}
                        className="w-full h-full object-cover"
                      />
                    </motion.div>
                    <div className={`absolute inset-0 bg-gradient-to-t ${card.color} opacity-40 group-hover:opacity-60 transition-opacity`} />
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <motion.div
                      className="mb-4"
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                    >
                      <Icon className="w-8 h-8 text-white" />
                    </motion.div>
                    <h3 className="text-xl mb-2 text-white">{card.title}</h3>
                    <p className="text-gray-400">{card.description}</p>
                  </div>

                  {/* Hover Effect */}
                  <motion.div
                    className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none`}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
}
