"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

// Tek bir kelime için bağımsız flip bileşeni
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const SingleWordFlip = ({
  words,
  className,
  minDuration = 3000,
  maxDuration = 6000,
}: {
  words: string[];
  className?: string;
  minDuration?: number;
  maxDuration?: number;
}) => {
  const [currentWord, setCurrentWord] = React.useState(
    words[Math.floor(Math.random() * words.length)]
  );

  React.useEffect(() => {
    // Rastgele bir süre belirle
    const randomDuration = Math.random() * (maxDuration - minDuration) + minDuration;
    
    const interval = setInterval(() => {
      setCurrentWord((prev) => {
        let newWord;
        do {
          newWord = words[Math.floor(Math.random() * words.length)];
        } while (newWord === prev && words.length > 1);
        return newWord;
      });
    }, randomDuration);

    return () => clearInterval(interval);
  }, [words, minDuration, maxDuration]);

  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={currentWord}
        initial={{ rotateX: 90, opacity: 0 }}
        animate={{ rotateX: 0, opacity: 1 }}
        exit={{ rotateX: -90, opacity: 0 }}
        transition={{
          duration: 0.4,
          ease: "easeInOut",
        }}
        className={cn("inline-block", className)}
        style={{ transformStyle: "preserve-3d" }}
      >
        {currentWord}
      </motion.span>
    </AnimatePresence>
  );
};

// Çoklu kelime için bağımsız flip bileşeni - aynı anda aynı kelime görünmez
const MultiWordFlip = ({
  words,
  className,
  duration = 4000,
  randomCount = 3,
}: {
  words: string[];
  className?: string;
  duration?: number;
  randomCount?: number;
}) => {
  const [currentWords, setCurrentWords] = React.useState<string[]>([]);

  // İlk render'da ve kelime değişimlerinde benzersiz kelimeler seç
  const selectUniqueWords = React.useCallback(() => {
    const shuffled = [...words].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(randomCount, words.length));
    return selected;
  }, [words, randomCount]);

  React.useEffect(() => {
    // İlk seçim
    setCurrentWords(selectUniqueWords());

    // Periyodik güncelleme
    const interval = setInterval(() => {
      setCurrentWords(selectUniqueWords());
    }, duration);

    return () => clearInterval(interval);
  }, [selectUniqueWords, duration]);

  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={currentWords.join(',')}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{
          duration: 0.5,
          ease: "easeInOut",
        }}
        className={cn("inline-flex items-center gap-x-1", className)}
      >
        {currentWords.map((word, index) => (
          <React.Fragment key={`${word}-${index}`}>
            <span className="font-bold whitespace-nowrap">{word}</span>
            {index < currentWords.length - 1 && <span>,</span>}
          </React.Fragment>
        ))}
      </motion.span>
    </AnimatePresence>
  );
};

export const TextFlip = MultiWordFlip;