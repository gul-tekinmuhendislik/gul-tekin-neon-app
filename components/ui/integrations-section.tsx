"use client";

import { motion, useAnimation, useInView } from "framer-motion";
import {
  Droplets,
  Sun,
  Thermometer,
  ShowerHead,
  Waves,
  AirVent,
} from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const tiles = [
  {
    icon: <Droplets className="size-full" />,
    bg: (
      <div className="pointer-events-none absolute left-1/2 top-1/2 size-1/2 -translate-x-1/2 -translate-y-1/2 overflow-visible rounded-full bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-400 opacity-70 blur-[20px]"></div>
    ),
  },
  {
    icon: <Sun className="size-full" />,
    bg: (
      <div className="pointer-events-none absolute left-1/2 top-1/2 size-1/2 -translate-x-1/2 -translate-y-1/2 overflow-visible rounded-full bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-500 opacity-70 blur-[20px]"></div>
    ),
  },
  {
    icon: <Thermometer className="size-full" />,
    bg: (
      <div className="pointer-events-none absolute left-1/2 top-1/2 size-1/2 -translate-x-1/2 -translate-y-1/2 overflow-visible rounded-full bg-gradient-to-r from-red-500 via-orange-500 to-red-400 opacity-70 blur-[20px]"></div>
    ),
  },
  {
    icon: <ShowerHead className="size-full" />,
    bg: (
      <div className="pointer-events-none absolute left-1/2 top-1/2 size-1/2 -translate-x-1/2 -translate-y-1/2 overflow-visible rounded-full bg-gradient-to-r from-gray-500 via-slate-500 to-gray-600 opacity-70 blur-[20px]"></div>
    ),
  },
  {
    icon: <AirVent className="size-full" />,
    bg: (
      <div className="pointer-events-none absolute left-1/2 top-1/2 size-1/2 -translate-x-1/2 -translate-y-1/2 overflow-visible rounded-full bg-gradient-to-r from-green-500 via-emerald-500 to-green-400 opacity-70 blur-[20px]"></div>
    ),
  },
  {
    icon: <Waves className="size-full" />,
    bg: (
      <div className="pointer-events-none absolute left-1/2 top-1/2 size-1/2 -translate-x-1/2 -translate-y-1/2 overflow-visible rounded-full bg-gradient-to-r from-teal-500 via-cyan-500 to-teal-400 opacity-70 blur-[20px]"></div>
    ),
  },
];

function shuffleArray<T>(array: T[]): T[] {
  let currentIndex = array.length;
  let randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }
  return array;
}

function Card(card: { icon: React.ReactElement; bg: React.ReactElement }) {
  const id = useId();
  const controls = useAnimation();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (inView) {
      controls.start({
        opacity: 1,
        transition: { delay: Math.random() * 2, ease: "easeOut", duration: 1 },
      });
    }
  }, [controls, inView]);

  return (
    <motion.div
      key={id}
      ref={ref}
      initial={{ opacity: 0 }}
      animate={controls}
      className={cn(
        "relative size-20 cursor-pointer overflow-hidden rounded-2xl border p-4",
        "bg-white [box-shadow:0_0_0_1px_rgba(0,0,0,.03),0_2px_4px_rgba(0,0,0,.05),0_12px_24px_rgba(0,0,0,.05)]",
        "transform-gpu transition-all duration-300 ease-out hover:scale-[1.15] hover:shadow-xl"
      )}
    >
      {card.bg}
      <div className="relative z-10 flex size-full items-center justify-center text-gray-600">
        {card.icon}
      </div>
    </motion.div>
  );
}

export function IntegrationsSection() {
  const [randomTiles1, setRandomTiles1] = useState<typeof tiles>(tiles);
  const [randomTiles2, setRandomTiles2] = useState<typeof tiles>(tiles);

  useEffect(() => {
    setRandomTiles1(shuffleArray([...tiles]));
    setRandomTiles2(shuffleArray([...tiles]));
  }, []);

  return (
    <section id="integrations" className="relative py-16">
      <div className="container mx-auto px-4 md:px-8">
        <div className="mx-auto max-w-5xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Hizmetler
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Sıhhi tesisat, güneş enerjisi sistemleri ve ısı pompası çözümleri
          </p>
        </div>

        <div className="relative mt-12 flex w-full max-w-6xl flex-col items-center justify-center overflow-hidden rounded-lg border bg-white md:shadow-xl mx-auto py-8">
          <div className="flex flex-col gap-4 w-full">
            <Marquee
              className="w-full justify-center overflow-hidden [--duration:30s] [--gap:2rem]"
              pauseOnHover
            >
              {randomTiles1.map((review, idx) => (
                <Card key={idx} {...review} />
              ))}
            </Marquee>
            <Marquee
              reverse
              className="w-full justify-center overflow-hidden [--duration:30s] [--gap:2rem]"
              pauseOnHover
            >
              {randomTiles2.map((review, idx) => (
                <Card key={idx} {...review} />
              ))}
            </Marquee>
          </div>

          <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-white to-transparent"></div>
          <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-white to-transparent"></div>
        </div>
      </div>
    </section>
  );
}

function Marquee({
  className,
  reverse,
  pauseOnHover = false,
  children,
  vertical = false,
  repeat = 4,
  ...props
}: {
  className?: string;
  reverse?: boolean;
  pauseOnHover?: boolean;
  children?: React.ReactNode;
  vertical?: boolean;
  repeat?: number;
  style?: React.CSSProperties;
}) {
  return (
    <div
      {...props}
      className={cn(
        "group flex overflow-hidden p-2 [--duration:40s] [--gap:1rem] [gap:var(--gap)]",
        {
          "flex-row": !vertical,
          "flex-col": vertical,
        },
        className
      )}
    >
      {Array(repeat)
        .fill(0)
        .map((_, i) => (
          <div
            key={i}
            className={cn("flex shrink-0 justify-around [gap:var(--gap)]", {
              "animate-marquee flex-row": !vertical,
              "animate-marquee-vertical flex-col": vertical,
              "group-hover:[animation-play-state:paused]": pauseOnHover,
              "[animation-direction:reverse]": reverse,
            })}
          >
            {children}
          </div>
        ))}
    </div>
  );
}