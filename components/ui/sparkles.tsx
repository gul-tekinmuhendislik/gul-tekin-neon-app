"use client";

import React, { useId, useMemo, useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface SparklesProps {
  id?: string;
  background?: string;
  minSize?: number;
  maxSize?: number;
  particleDensity?: number;
  className?: string;
  particleColor?: string;
  children?: React.ReactNode;
}

export const SparklesCore = (props: SparklesProps) => {
  const {
    id,
    className,
    background, // eslint-disable-line @typescript-eslint/no-unused-vars
    minSize,
    maxSize,
    particleDensity,
    particleColor,
  } = props;
  const genratedId = useId();
  const internalId = id || genratedId;
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const particles = useMemo(() => {
    if (!isMounted) return [];

    const density = particleDensity || 50;
    const min = minSize || 1;
    const max = maxSize || 3;

    return [...Array(density)].map(() => ({
      cx: Math.random() * 100,
      cy: Math.random() * 100,
      r: Math.random() * (max - min) + min,
      animationDelay: Math.random() * 3,
      animationDuration: Math.random() * 3 + 2,
    }));
  }, [isMounted, particleDensity, minSize, maxSize]);

  return (
    <div className={cn("relative", className)}>
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={`${internalId}-gradient`}>
            <stop stopColor={particleColor || "#9E7AFF"} stopOpacity={0} />
            <stop
              stopColor={particleColor || "#9E7AFF"}
              stopOpacity={0.5}
              offset={0.5}
            />
            <stop stopColor={particleColor || "#9E7AFF"} stopOpacity={0} offset={1} />
          </linearGradient>
          <filter id={`${internalId}-filter`}>
            <feTurbulence
              baseFrequency={0.02}
              numOctaves={4}
              result="turbulence"
              seed={5}
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="turbulence"
              scale={4}
              xChannelSelector="R"
              yChannelSelector="G"
            />
            <feGaussianBlur stdDeviation="1" />
          </filter>
        </defs>
        {particles.map((particle, index) => (
          <circle
            key={index}
            cx={`${particle.cx}%`}
            cy={`${particle.cy}%`}
            r={particle.r}
            fill={`url(#${internalId}-gradient)`}
            filter={`url(#${internalId}-filter)`}
            className="animate-sparkle"
            style={{
              animationDelay: `${particle.animationDelay}s`,
              animationDuration: `${particle.animationDuration}s`,
            }}
          />
        ))}
      </svg>
    </div>
  );
};

export const Sparkles = ({
  id,
  className,
  background = "transparent",
  minSize = 0.4,
  maxSize = 1,
  particleDensity = 100,
  particleColor = "#FFF",
  children,
}: SparklesProps) => {
  return (
    <div className={cn("relative h-full w-full overflow-hidden", className)}>
      <div className="absolute inset-0">
        <SparklesCore
          id={id}
          background={background}
          minSize={minSize}
          maxSize={maxSize}
          particleDensity={particleDensity}
          className="h-full w-full"
          particleColor={particleColor}
        />
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  );
};