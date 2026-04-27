"use client";

import { useEffect, useRef } from "react";

interface DottedSurfaceProps {
  dotColor?: string;
  dotSize?: number;
  gap?: number;
  className?: string;
}

export default function DottedSurface({
  dotColor = "rgba(255,255,255,0.15)",
  dotSize = 1.5,
  gap = 24,
  className = "",
}: DottedSurfaceProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    function render() {
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = dotColor;
      for (let x = gap / 2; x < canvas.width; x += gap) {
        for (let y = gap / 2; y < canvas.height; y += gap) {
          ctx.beginPath();
          ctx.arc(x, y, dotSize, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    function syncSize() {
      if (!canvas) return;
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      render();
    }

    function handleResize() {
      if (debounceTimer.current !== null) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(syncSize, 150);
    }

    syncSize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (debounceTimer.current !== null) clearTimeout(debounceTimer.current);
    };
  }, [dotColor, dotSize, gap]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
      aria-hidden="true"
    />
  );
}
