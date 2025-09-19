"use client";

import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { createNoise3D } from "simplex-noise";
import { Snowflake, Wind, Recycle, ThermometerSun } from "lucide-react";
import { cn } from "@/lib/utils";

interface VortexProps {
  children?: React.ReactNode;
  className?: string;
  containerClassName?: string;
  particleCount?: number;
  rangeY?: number;
  baseHue?: number;
  baseSpeed?: number;
  rangeSpeed?: number;
  baseRadius?: number;
  rangeRadius?: number;
  backgroundColor?: string;
  enableWaves?: boolean;
  waveColors?: string[];
  waveOpacity?: number;
  waveSpeed?: number;
  enableSnowflakes?: boolean;
  snowflakeCount?: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
}

export const Vortex = ({
  children,
  className,
  containerClassName,
  particleCount = 100,
  rangeY = 100,
  baseHue = 220,
  baseSpeed = 0.1,
  rangeSpeed = 0.5,
  baseRadius = 1,
  rangeRadius = 2,
  backgroundColor = "transparent",
  enableWaves = true,
  waveColors = ["#38bdf8", "#818cf8", "#c084fc"],
  waveOpacity = 0.3,
  waveSpeed = 0.002,
  enableSnowflakes = true,
  snowflakeCount = 15,
}: VortexProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const noise = createNoise3D();
  const waveTime = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const initParticles = () => {
      particlesRef.current = [];
      for (let i = 0; i < particleCount; i++) {
        particlesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * rangeSpeed + baseSpeed,
          vy: (Math.random() - 0.5) * rangeSpeed + baseSpeed,
          radius: Math.random() * rangeRadius + baseRadius,
          color: `hsl(${baseHue + Math.random() * 60}, 70%, 50%)`,
        });
      }
    };

    initParticles();

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw wavy background
      if (enableWaves) {
        ctx.save();
        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          ctx.strokeStyle = waveColors[i % waveColors.length];
          ctx.globalAlpha = waveOpacity;
          ctx.lineWidth = 2;

          for (let x = 0; x < canvas.width; x += 10) {
            const y = canvas.height / 2 + 
                     noise(x / 800, i * 0.3, waveTime.current) * 150 +
                     Math.sin((x / canvas.width) * Math.PI * 2 + waveTime.current * 2) * 50;
            if (x === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
          }

          ctx.stroke();
          ctx.closePath();
        }
        ctx.restore();
        waveTime.current += waveSpeed;
      }

      particlesRef.current.forEach((particle) => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Create vortex effect
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const dx = particle.x - centerX;
        const dy = particle.y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const maxDistance = Math.min(canvas.width, canvas.height) / 2;
        
        if (distance < maxDistance) {
          const angle = Math.atan2(dy, dx);
          const force = (1 - distance / maxDistance) * 0.1;
          particle.vx += Math.cos(angle + Math.PI / 2) * force;
          particle.vy += Math.sin(angle + Math.PI / 2) * force;
        }

        // Damping
        particle.vx *= 0.99;
        particle.vy *= 0.99;

        // Bounce off walls
        if (particle.x < 0 || particle.x > canvas.width) {
          particle.vx = -particle.vx;
          particle.x = Math.max(0, Math.min(canvas.width, particle.x));
        }
        if (particle.y < 0 || particle.y > canvas.height) {
          particle.vy = -particle.vy;
          particle.y = Math.max(0, Math.min(canvas.height, particle.y));
        }

        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.fill();

        // Connections disabled for performance
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [particleCount, rangeY, baseHue, baseSpeed, rangeSpeed, baseRadius, rangeRadius, backgroundColor, enableWaves, waveColors, waveOpacity, waveSpeed, noise]);

  return (
    <div className={cn("relative h-full w-full overflow-hidden", containerClassName)}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="absolute inset-0"
      >
        <canvas
          ref={canvasRef}
          className="absolute inset-0"
        />
      </motion.div>
      
      {/* Animated Icons */}
      {enableSnowflakes && (
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: snowflakeCount }).map((_, i) => {
            // Randomly select icon type
            const icons = [Snowflake, Wind, Recycle, ThermometerSun];
            const Icon = icons[i % icons.length];
            const isWind = Icon === Wind;
            const isRecycle = Icon === Recycle;
            const isThermometer = Icon === ThermometerSun;
            
            return (
              <motion.div
                key={i}
                className={cn(
                  "absolute",
                  isWind ? "text-cyan-300/25" : 
                  isRecycle ? "text-green-400/25" : 
                  isThermometer ? "text-orange-400/25" :
                  "text-blue-200/30"
                )}
                initial={{
                  top: isWind ? `${Math.random() * 100}%` : `${Math.random() * -10}%`,
                  left: isWind ? "-10%" : `${Math.random() * 100}%`,
                  rotate: 0,
                }}
                animate={isWind ? {
                  left: "110%",
                  rotate: isRecycle ? 360 : 180,
                } : {
                  top: "110%",
                  rotate: isRecycle ? -360 : isThermometer ? 45 : 360,
                }}
                transition={{
                  duration: isWind ? Math.random() * 10 + 5 : isThermometer ? Math.random() * 15 + 8 : Math.random() * 20 + 10,
                  repeat: Infinity,
                  delay: Math.random() * 10,
                  ease: isWind ? "easeInOut" : isThermometer ? "easeInOut" : "linear",
                }}
                style={{
                  fontSize: `${Math.random() * 24 + 12}px`,
                }}
              >
                <Icon />
              </motion.div>
            );
          })}
        </div>
      )}
      
      <div className={cn("relative z-10", className)}>
        {children}
      </div>
    </div>
  );
};