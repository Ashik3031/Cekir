import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

const toastVariants = {
  hidden: { opacity: 0, y: -30, scale: 0.9 },
  visible: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -30, scale: 0.9 },
};

const Toast = ({ message, type, duration = 3000 }) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => Math.max(prev - 1, 0));
    }, duration / 100);

    return () => clearInterval(interval);
  }, [duration]);

  const backgroundColors = {
    success: "bg-green-600",
    error: "bg-red-600",
    warning: "bg-yellow-600",
    info: "bg-blue-600",
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={toastVariants}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`fixed top-5 left-1/2 transform z-[9999] -translate-x-1/2 px-6 py-3 rounded-lg shadow-lg text-white font-medium flex items-center gap-3 ${
        backgroundColors[type] || "bg-gray-800"
      }`}
      style={{ minWidth: "280px", maxWidth: "400px" }}
    >
      {message}
      {/* Auto-dismiss progress bar */}
      <motion.div
        className="absolute bottom-0 left-0 h-1 bg-white/50 rounded-b-lg"
        initial={{ width: "100%" }}
        animate={{ width: "0%" }}
        transition={{ duration, ease: "linear" }}
        style={{ position: "absolute", height: "3px", width: `${progress}%` }}
      />
    </motion.div>
  );
};

export default Toast;
