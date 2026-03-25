// src/pages/clues/index.tsx
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Welcome from "./welcome";
import ClueFinder from "../clues";

export default function CluePage() {
  const [started, setStarted] = useState(false);

  return (
    <div className="min-h-screen bg-black overflow-hidden">
      <AnimatePresence mode="wait">
        {!started ? (
          <motion.div
            key="welcome"
            initial={{ opacity: 1 }}
            exit={{
              opacity: 0,
              scale: 1.04,
              filter: "blur(8px)",
              transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
            }}
          >
            <Welcome onStart={() => setStarted(true)} />
          </motion.div>
        ) : (
          <motion.div
            key="game"
            initial={{ opacity: 0, scale: 0.97, filter: "blur(8px)" }}
            animate={{ opacity: 1,  scale: 1,    filter: "blur(0px)" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <ClueFinder />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}