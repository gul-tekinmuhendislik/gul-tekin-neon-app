"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const TextFlip = ({
  words,
  duration = 3000,
  className,
}: {
  words: string[];
  duration?: number;
  className?: string;
}) => {
  const [currentWord, setCurrentWord] = React.useState(words[0]);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWord((prev) => {
        const currentIndex = words.indexOf(prev);
        const nextIndex = (currentIndex + 1) % words.length;
        return words[nextIndex];
      });
    }, duration);

    return () => clearInterval(interval);
  }, [words, duration]);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentWord}
        initial={{ rotateX: 90, opacity: 0 }}
        animate={{ rotateX: 0, opacity: 1 }}
        exit={{ rotateX: -90, opacity: 0 }}
        transition={{
          duration: 0.3,
          ease: "easeInOut",
        }}
        className={cn(
          "inline-block text-left font-bold text-neutral-900 dark:text-neutral-100",
          className
        )}
        style={{ transformStyle: "preserve-3d", perspective: "1000px" }}
      >
        {currentWord}
      </motion.div>
    </AnimatePresence>
  );
};