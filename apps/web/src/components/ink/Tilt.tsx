"use client";

import { useEffect, useRef } from "react";

/** 포인터를 따라 살짝 기울고, 가만히 있으면 천천히 흔들리는 3D 판 */
export function Tilt({
  children,
  max = 12,
  idle = true,
  className = "",
}: {
  children: React.ReactNode;
  max?: number;
  idle?: boolean;
  className?: string;
}) {
  const host = useRef<HTMLDivElement>(null);
  const plate = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = host.current;
    const p = plate.current;
    if (!h || !p || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    let tx = 0;
    let ty = 0;
    let cx = 0;
    let cy = 0;
    let last = -1e9;
    const onMove = (e: PointerEvent) => {
      const b = h.getBoundingClientRect();
      tx = Math.max(-0.6, Math.min(0.6, (e.clientX - b.left) / b.width - 0.5));
      ty = Math.max(-0.6, Math.min(0.6, (e.clientY - b.top) / b.height - 0.5));
      last = performance.now();
    };
    const tick = (t: number) => {
      if (idle && t - last > 2000) {
        tx = Math.sin(t / 2300) * 0.35;
        ty = 0.25 + Math.sin(t / 3100) * 0.1;
      }
      cx += (tx - cx) * 0.08;
      cy += (ty - cy) * 0.08;
      p.style.transform = `rotateY(${(cx * max * 1.6).toFixed(2)}deg) rotateX(${(-cy * max).toFixed(2)}deg)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    h.addEventListener("pointermove", onMove);
    return () => {
      cancelAnimationFrame(raf);
      h.removeEventListener("pointermove", onMove);
    };
  }, [idle, max]);

  return (
    <div ref={host} className={className} style={{ perspective: 700 }}>
      <div ref={plate} style={{ transformStyle: "preserve-3d" }}>
        {children}
      </div>
    </div>
  );
}
