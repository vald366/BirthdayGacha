"use client";

import { useEffect, useRef, ReactNode } from "react";

type Animation =
  | "fadeIn"
  | "fadeInUp"
  | "fadeInDown"
  | "fadeInLeft"
  | "fadeInRight"
  | "zoomIn"
  | "flash";

export function AnimateOnScroll({
  animation = "fadeIn",
  delay = 0,
  duration = 600,
  threshold = 0.15,
  className = "",
  children,
}: {
  animation?: Animation;
  delay?: number;
  duration?: number;
  threshold?: number;
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            el.classList.add("animate-visible");
          }, delay);
          observer.unobserve(el);
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay, threshold]);

  return (
    <div
      ref={ref}
      className={`animate-on-scroll animate-${animation} ${className}`}
      style={{ "--animate-duration": `${duration}ms` } as React.CSSProperties}
    >
      {children}
    </div>
  );
}
