"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  size: number;
  color: string;
  decay: number;
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

    // Keep track of particles and mouse position
    const particles: Particle[] = [];
    let mouseX = 0;
    let mouseY = 0;
    let lastMouseX = 0;
    let lastMouseY = 0;
    let hasMoved = false;

    // Colors: Cyan/Teal (Stormlight) for normal, Warm Amber/Gold for hover (Lifelight/Investiture)
    const baseColors = ["#4affbd", "#00d8ff", "#ffffff", "#7ee8fa"];
    const hoverColors = ["#ffd04a", "#ff9000", "#ffffff", "#ffbe53"];

    const moveCursor = (e: MouseEvent) => {
      mouseY = e.clientY;
      mouseX = e.clientX;
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

    // Particle factory
    const spawnParticle = (x: number, y: number, isExplosion = false) => {
      const colors = isHovered.current ? hoverColors : baseColors;
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      const angle = isExplosion ? Math.random() * Math.PI * 2 : Math.random() * Math.PI * 2;
      const speed = isExplosion 
        ? Math.random() * 4 + 1.5 
        : Math.random() * 0.8 + 0.2;

      particles.push({
        x,
        y,
        vx: isExplosion ? Math.cos(angle) * speed : (Math.random() - 0.5) * 1.0,
        vy: isExplosion ? Math.sin(angle) * speed : -Math.random() * 1.5 - 0.5, // Float upwards like gas
        alpha: 1.0,
        size: isExplosion ? Math.random() * 6 + 3 : Math.random() * 8 + 4,
        color,
        decay: isExplosion ? Math.random() * 0.02 + 0.015 : Math.random() * 0.015 + 0.01,
      });
    };

    // Explosion on click
    const handleWindowClick = (e: MouseEvent) => {
      const count = 25;
      for (let i = 0; i < count; i++) {
        spawnParticle(e.clientX, e.clientY, true);
      }
    };

    // Animation Loop
    let animationFrameId: number;
    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Spawn particles as mouse moves
      if (hasMoved) {
        // Calculate distance moved
        const dist = Math.hypot(mouseX - lastMouseX, mouseY - lastMouseY);
        const spawnCount = isHovered.current ? 4 : 2;
        
        if (dist > 2) {
          for (let i = 0; i < spawnCount; i++) {
            // Interpolate coordinates for smoother trailing paths
            const ratio = i / spawnCount;
            const x = lastMouseX + (mouseX - lastMouseX) * ratio;
            const y = lastMouseY + (mouseY - lastMouseY) * ratio;
            spawnParticle(x, y);
          }
        }
        
        lastMouseX = mouseX;
        lastMouseY = mouseY;
        hasMoved = false;
      } else if (Math.random() < 0.15) {
        // Idle spawn a tiny puff of stormlight occasionally
        spawnParticle(mouseX, mouseY);
      }

      // Update and draw particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        
        // Ethereal rising stormlight physics (upward drift + wave sway)
        p.vy -= 0.02; // soft gravity/rise helper
        p.vx += Math.sin(p.y * 0.05) * 0.02; // wavy movement
        p.vx *= 0.98;
        p.vy *= 0.98;
        
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        
        // Glowing radial gradient circle
        const radius = Math.max(0.1, p.size * p.alpha);
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, radius);
        grad.addColorStop(0, p.color);
        grad.addColorStop(0.3, p.color);
        grad.addColorStop(1, "rgba(74, 255, 189, 0)");
        
        ctx.fillStyle = grad;
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
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
