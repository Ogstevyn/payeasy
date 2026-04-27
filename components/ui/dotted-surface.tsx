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
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    function render() {
      if (!canvas || !ctx) return;
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = dotColor;
      for (let x = gap / 2; x < width; x += gap) {
        for (let y = gap / 2; y < height; y += gap) {
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
      if (debounceRef.current !== null) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(syncSize, 150);
    }

    syncSize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (debounceRef.current !== null) clearTimeout(debounceRef.current);
    };
  }, [dotColor, dotSize, gap]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
      aria-hidden="true"
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import React, { useEffect, useRef } from "react";

type DottedSurfaceProps = Omit<React.ComponentProps<"div">, "ref">;

function isWebGLAvailable(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return !!(
      canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl")
    );
  } catch {
    return false;
  }
}

function isLowEndDevice(): boolean {
  return (
    typeof navigator !== "undefined" &&
    typeof navigator.hardwareConcurrency === "number" &&
    navigator.hardwareConcurrency < 4
  );
}

export function DottedSurface({ className, ...props }: DottedSurfaceProps) {
  const { theme } = useTheme();

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isWebGLAvailable()) {
      console.warn(
        "[DottedSurface] WebGL is not available in this browser. Skipping Three.js renderer."
      );
      return;
    }

    if (isLowEndDevice()) {
      return;
    }

    const container = containerRef.current;

    if (!container) {
      return;
    }

    let isDisposed = false;
    let cleanupScene = () => { };

    const loadScene = async () => {
      const THREE = await import("three");

      if (isDisposed || !container.isConnected) {
        return;
      }

      const SEPARATION = 150;
      const AMOUNTX = 40;
      const AMOUNTY = 60;

      const scene = new THREE.Scene();
      scene.fog = new THREE.Fog(0x0a0a0f, 2000, 10000);

      const camera = new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        1,
        10000
      );
      camera.position.set(0, 355, 1220);

      const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
      });
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setClearColor(scene.fog.color, 0);

      container.appendChild(renderer.domElement);

      const positions: number[] = [];
      const colors: number[] = [];
      const geometry = new THREE.BufferGeometry();

      for (let ix = 0; ix < AMOUNTX; ix++) {
        for (let iy = 0; iy < AMOUNTY; iy++) {
          const x = ix * SEPARATION - (AMOUNTX * SEPARATION) / 2;
          const y = 0;
          const z = iy * SEPARATION - (AMOUNTY * SEPARATION) / 2;

          positions.push(x, y, z);

          if (theme === "dark" || !theme) {
            const blueInfluence = Math.random();
            if (blueInfluence > 0.5) {
              colors.push(0.36, 0.49, 0.98);
            } else {
              colors.push(0.13, 0.79, 0.59);
            }
          } else {
            colors.push(0, 0, 0);
          }
        }
      }

      geometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(positions, 3)
      );
      geometry.setAttribute(
        "color",
        new THREE.Float32BufferAttribute(colors, 3)
      );

      const material = new TßHREE.PointsMaterial({
        size: 6,
        vertexColors: true,
        transparent: true,
        opacity: 0.35,
        sizeAttenuation: true,
      });

      const points = new THREE.Points(geometry, material);
      scene.add(points);

      let count = 0;
      let animationId = 0;

      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      const animate = () => {
        if (!prefersReducedMotion) {
          animationId = window.requestAnimationFrame(animate);
        }

        const positionAttribute = geometry.attributes.position;
        const posArray = positionAttribute.array as Float32Array;

        let i = 0;
        for (let ix = 0; ix < AMOUNTX; ix++) {
          for (let iy = 0; iy < AMOUNTY; iy++) {
            const index = i * 3;

            posArray[index + 1] =
              Math.sin((ix + count) * 0.3) * 50 +
              Math.sin((iy + count) * 0.5) * 50;

            i++;
          }
        }

        positionAttribute.needsUpdate = true;
        renderer.render(scene, camera);
        count += 0.1;
      };

      const handleResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        if (prefersReducedMotion) {
          renderer.render(scene, camera);
        }
      };

      window.addEventListener("resize", handleResize);
      animate();

      cleanupScene = () => {
        window.removeEventListener("resize", handleResize);
        window.cancelAnimationFrame(animationId);

        scene.traverse((object) => {
          if (object instanceof THREE.Points) {
            object.geometry.dispose();
            if (Array.isArray(object.material)) {
              object.material.forEach((currentMaterial) =>
                currentMaterial.dispose()
              );
            } else {
              object.material.dispose();
            }
          }
        });

        renderer.dispose();

        if (container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
      };
    };

    void loadScene();

    return () => {
      isDisposed = true;
      cleanupScene();
    };
  }, [theme]);

  return (
    <div
      ref={containerRef}
      className={cn("pointer-events-none fixed inset-0 -z-[1]", className)}
      {...props}
    />
  );
}
