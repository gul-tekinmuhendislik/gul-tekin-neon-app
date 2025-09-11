"use client";

import React, { useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { ArrowUpRight } from "lucide-react";

interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  withArrow?: boolean;
  circleSize?: number;
  gradientColors?: string[];
}

export const AnimatedCard = ({
  children,
  className,
  withArrow = false,
  circleSize = 400,
  gradientColors = ["#3BC4F2", "#7A69F9", "#F26378", "#F5833F"],
}: AnimatedCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!cardRef.current || !isHovering) return;
      
      const rect = cardRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      setMousePosition({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [isHovering]);

  return (
    <div
      ref={cardRef}
      className={cn(
        "group relative transform-gpu overflow-hidden rounded-2xl bg-white/10 p-[2px] transition-all duration-300",
        "hover:scale-[1.02] active:scale-[0.98]",
        className
      )}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Arrow icon */}
      {withArrow && (
        <ArrowUpRight className="absolute right-4 top-4 z-20 size-5 translate-y-2 text-gray-700 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100" />
      )}
      
      {/* Gradient effect that follows mouse */}
      <div
        className={cn(
          "absolute -translate-x-1/2 -translate-y-1/2 transform-gpu rounded-full transition-all duration-500",
          isHovering ? "opacity-100 scale-100" : "opacity-0 scale-0"
        )}
        style={{
          width: `${circleSize}px`,
          height: `${circleSize}px`,
          left: `${mousePosition.x}px`,
          top: `${mousePosition.y}px`,
          background: `radial-gradient(circle, ${gradientColors.join(", ")})`,
          filter: "blur(40px)",
        }}
      />

      {/* Inner background */}
      <div className="absolute inset-[1px] rounded-[calc(1rem-1px)] bg-white" />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Animated border gradient */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: `linear-gradient(135deg, ${gradientColors.join(", ")})`,
          padding: "1px",
        }}
      >
        <div className="h-full w-full rounded-2xl bg-white" />
      </div>
    </div>
  );
};