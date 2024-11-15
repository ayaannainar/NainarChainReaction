import { motion } from 'framer-motion';
import { Atom } from 'lucide-react';

export const Logo = () => {
  return (
    <motion.div
      className="flex items-center gap-2"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
      >
        <Atom className="w-10 h-10 text-blue-500" />
      </motion.div>
      <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
        Nainar Chain Reaction
      </h1>
    </motion.div>
  );
};