"use client";

import { useEffect, useRef } from "react";

interface Wisp {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  size: number;
  colorRGB: { r: number; g: number; b: number };
  decay: number;
  growth: number;
  rotation: number;
  rotationSpeed: number;
  scaleX: number;
  scaleY: number;
}

export default function Cursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorTextRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isHovered = useRef(false);

  const isTouchDevice = typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;

  useEffect(() => {
    if (isTouchDevice) return;

    const cursor = cursorRef.current;
    const cursorText = cursorTextRef.current;
    const canvas = canvasRef.current;
    if (!cursor || !cursorText || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Resize canvas to full window size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Keep track of wisps and mouse position
    const wisps: Wisp[] = [];
    let mouseX = 0;
    let mouseY = 0;
    let lastMouseX = 0;
    let lastMouseY = 0;
    let hasMoved = false;

    // Mistborn mist colors: Translucent charcoal, dark gray, and smoky shadow tones
    const mistColors = [
      { r: 25, g: 25, b: 30 },
      { r: 40, g: 42, b: 50 },
      { r: 18, g: 18, b: 22 },
      { r: 55, g: 58, b: 65 }
    ];

    const moveCursor = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      hasMoved = true;

      cursor.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;

      // Prevent cursorText from going offscreen
      if (mouseX > window.innerWidth - cursorText.clientWidth) {
        cursorText.style.left = -cursorText.clientWidth + "px";
      } else {
        cursorText.style.left = "50px";
      }

      if (mouseY > window.innerHeight - cursorText.clientHeight) {
        cursorText.style.top = -cursorText.clientHeight + "px";
      } else {
        cursorText.style.top = "50px";
      }
    };

    // Wisp factory
    const spawnWisp = (x: number, y: number, isExplosion = false) => {
      const colorRGB = mistColors[Math.floor(Math.random() * mistColors.length)];
      
      const angle = Math.random() * Math.PI * 2;
      const speed = isExplosion 
        ? Math.random() * 2.0 + 0.5 
        : Math.random() * 0.2 + 0.05;

      // Subtle mouse velocity drag
      const dx = mouseX - lastMouseX;
      const dy = mouseY - lastMouseY;
      const mvx = dx * 0.05;
      const mvy = dy * 0.05;

      // Very low velocities so mists "hang" in place
      const vx = mvx + (isExplosion ? Math.cos(angle) * speed : (Math.random() - 0.5) * 0.2);
      const vy = mvy + (isExplosion ? Math.sin(angle) * speed : -Math.random() * 0.1 - 0.05); // extremely slow upward drift

      wisps.push({
        x,
        y,
        vx,
        vy,
        alpha: 0.8,
        size: isExplosion ? Math.random() * 15 + 10 : Math.random() * 12 + 12, // initial puff size
        colorRGB,
        // Slower decay so they hang on screen for ~3 to 5 seconds
        decay: isExplosion ? Math.random() * 0.015 + 0.01 : Math.random() * 0.0025 + 0.0025,
        // Steady expansion to represent diffusion
        growth: Math.random() * 0.15 + 0.12, 
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.006, // slow spin
        scaleX: Math.random() * 0.6 + 1.5, // wispy elongated proportions
        scaleY: Math.random() * 0.3 + 0.6,
      });
    };

    // Burst of mists on click
    const handleWindowClick = (e: MouseEvent) => {
      const count = 20;
      for (let i = 0; i < count; i++) {
        spawnWisp(e.clientX, e.clientY, true);
      }
    };

    // Animation Loop
    let animationFrameId: number;
    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (hasMoved) {
        const dist = Math.hypot(mouseX - lastMouseX, mouseY - lastMouseY);
        
        // Spawn mists at intervals along the path to keep trails smooth and unified
        const stepSize = 12;
        if (dist > stepSize) {
          const steps = Math.floor(dist / stepSize);
          for (let i = 0; i < steps; i++) {
            const ratio = (i + 1) / steps;
            const x = lastMouseX + (mouseX - lastMouseX) * ratio;
            const y = lastMouseY + (mouseY - lastMouseY) * ratio;
            
            spawnWisp(x, y);
          }
          lastMouseX = mouseX;
          lastMouseY = mouseY;
          hasMoved = false;
        }
      } else if (Math.random() < 0.05) {
        // Idle slow puff
        spawnWisp(mouseX, mouseY);
      }

      // Update and draw wisps
      for (let i = wisps.length - 1; i >= 0; i--) {
        const p = wisps[i];
        p.x += p.vx;
        p.y += p.vy;
        
        // Minimal drift & gentle waving turbulence
        p.vy -= 0.004; // very slight upward float
        p.vx += Math.sin(p.y * 0.015 + p.rotation) * 0.02; // slow sway
        p.vx *= 0.98;
        p.vy *= 0.98;
        
        p.size += p.growth;
        p.rotation += p.rotationSpeed;
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          wisps.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        
        // Translate, rotate, and scale to create the stretched wispy shape
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.scale(p.scaleX, p.scaleY);
        
        const radius = Math.max(0.1, p.size);
        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
        
        const c = p.colorRGB;
        // Super soft, misty opacity transitions
        grad.addColorStop(0, `rgba(${c.r}, ${c.g}, ${c.b}, 0.22)`);
        grad.addColorStop(0.3, `rgba(${c.r}, ${c.g}, ${c.b}, 0.12)`);
        grad.addColorStop(0.7, `rgba(${c.r}, ${c.g}, ${c.b}, 0.04)`);
        grad.addColorStop(1, "rgba(0, 0, 0, 0)");
        
        ctx.fillStyle = grad;
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(tick);
    };
    tick();

    const updateTitle = (titleText: string | null) => {
      if (titleText) {
        cursorText.style.scale = "1";
        if (
          titleText.includes(".jpg") ||
          titleText.includes(".png") ||
          titleText.includes(".jpeg")
        ) {
          cursorText.style.backgroundImage = `url(${titleText})`;
          cursorText.innerHTML = "";
          cursorText.classList.add("image-view");
        } else {
          cursorText.style.backgroundImage = "none";
          cursorText.classList.remove("image-view");
          cursorText.innerHTML = titleText;
        }
      } else {
        cursorText.style.scale = "0";
      }
    };

    const handleMouseEnterLink = (e: Event) => {
      const link = e.currentTarget as HTMLElement;
      isHovered.current = true;
      cursor.classList.add("cursor-grow");
      updateTitle(link.getAttribute("data-title"));
    };

    const handleMouseLeaveLink = () => {
      isHovered.current = false;
      cursor.classList.remove("cursor-grow");
      updateTitle("");
    };

    const handleMouseEnterHoverable = () => {
      cursor.style.opacity = "0";
      document.body.style.cursor = "pointer";
    };

    const handleMouseLeaveHoverable = () => {
      cursor.style.opacity = "1";
      document.body.style.cursor = "none";
    };

    window.addEventListener("mousemove", moveCursor);
    window.addEventListener("click", handleWindowClick);

    // Apply listeners to current elements
    const attachListeners = () => {
      const links = document.querySelectorAll("a, button");
      const hoverables = document.querySelectorAll(".hover-state");

      links.forEach((link) => {
        link.addEventListener("mouseenter", handleMouseEnterLink);
        link.addEventListener("mouseleave", handleMouseLeaveLink);
      });

      hoverables.forEach((hoverable) => {
        hoverable.addEventListener("mouseenter", handleMouseEnterHoverable);
        hoverable.addEventListener("mouseleave", handleMouseLeaveHoverable);
      });

      return () => {
        links.forEach((link) => {
          link.removeEventListener("mouseenter", handleMouseEnterLink);
          link.removeEventListener("mouseleave", handleMouseLeaveLink);
        });

        hoverables.forEach((hoverable) => {
          hoverable.removeEventListener(
            "mouseenter",
            handleMouseEnterHoverable,
          );
          hoverable.removeEventListener(
            "mouseleave",
            handleMouseLeaveHoverable,
          );
        });
      };
    };

    let cleanupListeners = attachListeners();

    // Re-attach listeners if DOM changes (Next.js route changes)
    const observer = new MutationObserver(() => {
      cleanupListeners();
      cleanupListeners = attachListeners();
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener("mousemove", moveCursor);
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("click", handleWindowClick);
      cancelAnimationFrame(animationFrameId);
      cleanupListeners();
      observer.disconnect();
    };
  }, []);

  if (isTouchDevice) return null;

  return (
    <>
      <canvas ref={canvasRef} className="cursor-canvas" />
      <div
        className="cursor rounded"
        id="cursor"
        ref={cursorRef}
      >
        <div className="cursor-ring"></div>
        <div className="cursor-core"></div>
        <div id="cursor-text" ref={cursorTextRef}></div>
      </div>
    </>
  );
}
