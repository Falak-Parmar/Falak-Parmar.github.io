"use client";

import { useEffect, useRef } from "react";

export default function Cursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorTextRef = useRef<HTMLDivElement>(null);

  const isTouchDevice = typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;

  useEffect(() => {
    if (isTouchDevice) return;

    const cursor = cursorRef.current;
    const cursorText = cursorTextRef.current;
    if (!cursor || !cursorText) return;

    const moveCursor = (e: MouseEvent) => {
      const mouseX = e.clientX;
      const mouseY = e.clientY;

      cursor.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;

      // Prevent cursorText from going offscreen
      if (mouseX > window.innerWidth - cursorText.clientWidth) {
        cursorText.style.left = -cursorText.clientWidth + "px";
      } else {
        cursorText.style.left = "45px";
      }

      if (mouseY > window.innerHeight - cursorText.clientHeight) {
        cursorText.style.top = -cursorText.clientHeight + "px";
      } else {
        cursorText.style.top = "45px";
      }
    };

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
      cursor.classList.add("cursor-grow");
      updateTitle(link.getAttribute("data-title"));
    };

    const handleMouseLeaveLink = () => {
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

    const handleMouseDown = () => {
      cursor.classList.add("cursor-click");
    };

    const handleMouseUp = () => {
      cursor.classList.remove("cursor-click");
    };

    window.addEventListener("mousemove", moveCursor);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);

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
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      cleanupListeners();
      observer.disconnect();
    };
  }, []);

  if (isTouchDevice) return null;

  return (
    <div
      className="cursor rounded"
      id="cursor"
      ref={cursorRef}
    >
      <div className="cursor-aon">
        <svg viewBox="0 0 40 40" width="100%" height="100%">
          {/* Outer spin ring */}
          <circle cx="20" cy="20" r="18" fill="none" stroke="currentColor" strokeWidth="1.2" />
          {/* Inner ring */}
          <circle cx="20" cy="20" r="8" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.7" />
          {/* Central core dot */}
          <circle cx="20" cy="20" r="3" fill="currentColor" />
          
          {/* Symmetrical rays representing Light / Hope / Star (Ashe) */}
          {/* Vertical and Horizontal rays */}
          <line x1="20" y1="2" x2="20" y2="12" stroke="currentColor" strokeWidth="1.2" />
          <line x1="20" y1="28" x2="20" y2="38" stroke="currentColor" strokeWidth="1.2" />
          <line x1="2" y1="20" x2="12" y2="20" stroke="currentColor" strokeWidth="1.2" />
          <line x1="28" y1="20" x2="38" y2="20" stroke="currentColor" strokeWidth="1.2" />
          
          {/* Diagonal rays */}
          <line x1="7.3" y1="7.3" x2="14.3" y2="14.3" stroke="currentColor" strokeWidth="1.2" />
          <line x1="25.7" y1="25.7" x2="32.7" y2="32.7" stroke="currentColor" strokeWidth="1.2" />
          <line x1="32.7" y1="7.3" x2="25.7" y2="14.3" stroke="currentColor" strokeWidth="1.2" />
          <line x1="14.3" y1="25.7" x2="7.3" y2="32.7" stroke="currentColor" strokeWidth="1.2" />
        </svg>
      </div>
      <div id="cursor-text" ref={cursorTextRef}></div>
    </div>
  );
}
