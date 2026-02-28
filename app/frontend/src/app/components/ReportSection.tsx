import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, Camera, Upload, X } from 'lucide-react';

export function ReportSection() {
  const [showModal, setShowModal] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => {
      setShowModal(false);
      setSubmitted(false);
    }, 2000);
  };

  return (
    <>
      {/* Report Button */}
      <motion.button
        onClick={() => setShowModal(true)}
        className="w-full mt-6 py-4 bg-gradient-to-r from-red-600/80 to-orange-600/80 backdrop-blur-md rounded-xl border border-red-500/50 flex items-center justify-center gap-3 text-white font-semibold shadow-lg"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        animate={{
          boxShadow: [
            '0 0 10px rgba(239, 68, 68, 0.3)',
            '0 0 20px rgba(239, 68, 68, 0.5)',
            '0 0 10px rgba(239, 68, 68, 0.3)',
          ],
        }}
        transition={{
          boxShadow: { duration: 2, repeat: Infinity },
        }}
      >
        <AlertTriangle className="w-5 h-5" />
        REPORT VIOLATOR
        <Camera className="w-5 h-5" />
      </motion.button>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !submitted && setShowModal(false)}
            />

            {/* Modal Content */}
            <motion.div
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md"
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
            >
              <div className="relative bg-gradient-to-br from-[#1a1f3a] to-[#2d1b4e] border-2 border-red-500/50 rounded-2xl p-6 shadow-2xl">
                {/* Glow Effect */}
                <motion.div
                  className="absolute -inset-2 bg-red-500/20 rounded-2xl blur-xl"
                  animate={{
                    opacity: [0.3, 0.5, 0.3],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                  }}
                />

                <div className="relative">
                  {/* Close Button */}
                  {!submitted && (
                    <button
                      onClick={() => setShowModal(false)}
                      className="absolute -top-2 -right-2 w-8 h-8 bg-red-500/80 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}

                  {!submitted ? (
                    <>
                      {/* Title */}
                      <div className="flex items-center gap-3 mb-6">
                        <AlertTriangle className="w-8 h-8 text-red-500" />
                        <h3 className="text-2xl text-white font-bold">Report Violator</h3>
                      </div>

                      {/* Form */}
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm text-white/70 mb-2">
                            Student Name
                          </label>
                          <input
                            type="text"
                            className="w-full px-4 py-3 bg-black/30 border border-white/20 rounded-xl text-white placeholder-white/30 focus:border-[#00d9ff] focus:outline-none transition-colors"
                            placeholder="Enter name..."
                          />
                        </div>

                        <div>
                          <label className="block text-sm text-white/70 mb-2">
                            Violation Type
                          </label>
                          <select className="w-full px-4 py-3 bg-black/30 border border-white/20 rounded-xl text-white focus:border-[#00d9ff] focus:outline-none transition-colors">
                            <option>Cheating</option>
                            <option>Not studying</option>
                            <option>Fake study time</option>
                            <option>Other</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm text-white/70 mb-2">
                            Upload Proof
                          </label>
                          <div className="border-2 border-dashed border-white/20 rounded-xl p-6 text-center hover:border-[#00d9ff]/50 transition-colors cursor-pointer">
                            <Upload className="w-8 h-8 text-white/50 mx-auto mb-2" />
                            <p className="text-sm text-white/50">Click to upload image</p>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm text-white/70 mb-2">
                            Description
                          </label>
                          <textarea
                            className="w-full px-4 py-3 bg-black/30 border border-white/20 rounded-xl text-white placeholder-white/30 focus:border-[#00d9ff] focus:outline-none transition-colors h-24 resize-none"
                            placeholder="Describe the violation..."
                          />
                        </div>

                        {/* Submit Button */}
                        <motion.button
                          onClick={handleSubmit}
                          className="w-full py-4 bg-gradient-to-r from-red-600 to-orange-600 rounded-xl text-white font-bold shadow-lg"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          SUBMIT REPORT
                        </motion.button>
                      </div>
                    </>
                  ) : (
                    /* Success Message */
                    <motion.div
                      className="text-center py-8"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <motion.div
                        className="w-20 h-20 bg-green-500 rounded-full mx-auto mb-4 flex items-center justify-center"
                        animate={{ scale: [0, 1.2, 1] }}
                        transition={{ duration: 0.5 }}
                      >
                        <span className="text-4xl">✓</span>
                      </motion.div>
                      <h3 className="text-2xl text-white font-bold mb-2">
                        Report Submitted!
                      </h3>
                      <p className="text-white/70">
                        Thank you for keeping UCU honest.
                      </p>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
