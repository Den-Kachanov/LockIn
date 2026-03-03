import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ShoppingBag, Coffee, Pizza, Gift, Trophy, Star, Sparkles, TrendingUp } from "lucide-react";
import axios from "axios";

const ICONS = { Coffee, Pizza, Gift, Trophy, Star, Sparkles, TrendingUp, ShoppingBag };

export function Rewards() {
  const [rewards, setRewards] = useState([]);
  const [history, setHistory] = useState([]);
  const [userPoints, setUserPoints] = useState(0);
  const [message, setMessage] = useState<string | null>(null); // for modal notification

  useEffect(() => {
    async function fetchData() {
      try {
        const [rewardsRes, historyRes, profileRes] = await Promise.all([
          axios.get("/api/rewards"),
          axios.get("/api/rewards/history"),
          axios.get("/api/profile"),
        ]);

        setRewards(rewardsRes.data || []);
        setHistory(historyRes.data || []);
        setUserPoints(profileRes.data?.points || 0);
      } catch (err) {
        console.error(err);
      }
    }
    fetchData();
  }, []);

  const handlePurchase = async (id) => {
    try {
      const res = await axios.post(`/api/rewards/purchase/${id}`);
      setUserPoints(res.data.new_points);

      // Refresh rewards and history
      const [rewardsRes, historyRes] = await Promise.all([
        axios.get("/api/rewards"),
        axios.get("/api/rewards/history"),
      ]);
      setRewards(rewardsRes.data || []);
      setHistory(historyRes.data || []);

      // Get reward info by id
      const reward = rewards.find(r => r.id === id);
      const itemName = reward?.name || "your reward";

      setMessage(`🎉 You successfully purchased "${itemName}"!`);
      setTimeout(() => setMessage(null), 2000);

    } catch (e) {
      setMessage(`❌ ${e.response?.data?.detail || "Error purchasing reward"}`);
      setTimeout(() => setMessage(null), 2000);
    }
  };


  return (
    <div className="space-y-6 p-6 relative">
      {/* Centered Modal Notification */}
      <AnimatePresence>
        {message && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Dimmed backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

            {/* Modal */}
            <motion.div
              className="relative bg-gradient-to-r from-[#00d9ff] via-[#ff00ff] to-[#ffd700] text-black font-bold px-8 py-6 rounded-3xl shadow-2xl text-center max-w-sm mx-4"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {message}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Points Balance */}
      <motion.div className="text-center" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <Sparkles className="w-12 h-12 text-[#ffd700] mx-auto mb-3" />
        <h2 className="text-2xl text-white/70 mb-2">Your Points Balance</h2>
        <motion.div className="text-6xl text-transparent bg-clip-text bg-gradient-to-r from-[#ffd700] via-[#ff00ff] to-[#00d9ff] font-bold">
          {userPoints.toLocaleString()} ⭐
        </motion.div>
      </motion.div>

      {/* Rewards Shop */}
      <div>
        <h3 className="text-2xl text-[#00d9ff] mb-4 font-bold flex items-center gap-2">
          <ShoppingBag className="w-7 h-7" />
          Rewards Shop
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rewards.map((reward) => {
            const Icon = ICONS[reward.icon] || Coffee;
            const canAfford = userPoints >= reward.cost;
            return (
              <motion.div
                key={reward.id}
                className="bg-white/5 p-4 rounded-2xl shadow-md"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="relative">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto"
                    style={{ background: `linear-gradient(135deg, ${reward.color || "#ffffff"}40, ${reward.color || "#ffffff"}20)` }}
                  >
                    <Icon className="w-8 h-8" style={{ color: reward.color || "#fff" }} />
                  </div>
                  <h4 className="text-xl text-white font-bold mb-2 text-center">{reward.name}</h4>
                  <p className="text-sm text-white/60 mb-4 text-center h-10">{reward.description}</p>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[#ffd700] font-bold text-lg">{reward.cost} ⭐</span>
                    <span className="text-xs text-white/50">{reward.available} available</span>
                  </div>
                  <motion.button
                    onClick={() => canAfford && handlePurchase(reward.id)}
                    className={`w-full py-3 rounded-xl font-bold ${canAfford ? "bg-gradient-to-r from-[#00d9ff] to-[#ff00ff] text-white" : "bg-white/10 text-white/30 cursor-not-allowed"}`}
                  >
                    {canAfford ? "Purchase" : "Not Enough Points"}
                  </motion.button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Purchase History */}
      <motion.div className="mt-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h3 className="text-2xl text-[#ff00ff] mb-4 font-bold">📜 Purchase History</h3>
        <div className="space-y-3">
          {history.length > 0 ? history.map((purchase, index) => (
            <motion.div
              key={index}
              className="bg-white/5 p-3 rounded-xl flex justify-between items-center"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div>
                <h4 className="text-white font-semibold">{purchase.item}</h4>
                <p className="text-xs text-white/50">{purchase.date}</p>
              </div>
              <div className="text-right">
                <div className="text-[#ffd700] font-bold">-{purchase.points} ⭐</div>
              </div>
            </motion.div>
          )) : (
            <div className="text-center py-12 text-white/50">No purchases yet.</div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
