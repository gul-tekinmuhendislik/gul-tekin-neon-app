"use client";

import React, { useEffect, useRef, useState } from "react";
import { createNoise3D } from "simplex-noise";
import { cn } from "@/lib/utils";

interface WavyBackgroundProps {
  children?: React.ReactNode;
  className?: string;
  containerClassName?: string;
  colors?: string[];
  waveWidth?: number;
  backgroundFill?: string;
  blur?: number;
  speed?: "slow" | "fast";
  waveOpacity?: number;
}

export const WavyBackground = ({
  children,
  className,
  containerClassName,
  colors = ["#38bdf8", "#818cf8", "#c084fc", "#e879f9", "#22d3ee"],
  waveWidth = 50,
  backgroundFill = "transparent",
  blur = 10,
  speed = "fast",
  waveOpacity = 0.5,
  ...props
}: WavyBackgroundProps) => {
  const noise = createNoise3D();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const getSpeed = () => {
      switch (speed) {
        case "slow":
          return 0.001;
        case "fast":
          return 0.002;
        default:
          return 0.001;
      }
    };

    let w = (ctx.canvas.width = window.innerWidth);
    let h = (ctx.canvas.height = window.innerHeight);
    ctx.filter = `blur(${blur}px)`;

    const handleResize = () => {
      w = ctx.canvas.width = window.innerWidth;
      h = ctx.canvas.height = window.innerHeight;
      ctx.filter = `blur(${blur}px)`;
    };

    window.addEventListener("resize", handleResize);

    let nt = 0;
    const render = () => {
      if (backgroundFill !== "transparent") {
        ctx.fillStyle = backgroundFill;
        ctx.fillRect(0, 0, w, h);
      } else {
        ctx.clearRect(0, 0, w, h);
      }

      const waveColors = colors ?? [
        "#38bdf8",
        "#818cf8",
        "#c084fc",
        "#e879f9",
        "#22d3ee",
      ];

      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.lineWidth = waveWidth || 50;
        ctx.strokeStyle = waveColors[i % waveColors.length];
        ctx.globalAlpha = waveOpacity ?? 0.5;

        for (let x = 0; x < w; x += 5) {
          const y = h / 2 + noise(x / 800, i * 0.3, nt) * 200;
          ctx.lineTo(x, y);
        }

        ctx.stroke();
        ctx.closePath();
      }

      nt += getSpeed();
      animationRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener("resize", handleResize);
    };
  }, [
    isMounted,
    blur,
    colors,
    speed,
    waveOpacity,
    waveWidth,
    backgroundFill,
    noise,
  ]);

  const isServer = typeof window === "undefined";

  return (
    <div
      className={cn(
        "h-screen flex flex-col items-center justify-center relative",
        containerClassName
      )}
      {...props}
    >
      <canvas
        className="absolute inset-0 z-0"
        ref={canvasRef}
        id="canvas"
        style={{
          ...(isServer ? { display: "none" } : {}),
        }}
      />
      <div className={cn("relative z-10", className)}>{children}</div>
    </div>
  );
};