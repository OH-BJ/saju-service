"use client";

import { useEffect, useMemo, useRef } from "react";

/** 먹 농담이 다른 산 네 겹 + 안개 + 붉은 해. CSS 3D 깊이로 시차를 주고, 포인터·기울기에 따라 움직인다. */
const LAYERS = [
  { z: -220, base: 118, amp: 46, color: "#b7ae9f", blur: 1.4 },
  { z: -140, base: 146, amp: 40, color: "#8f877a", blur: 0.8 },
  { z: -70, base: 176, amp: 36, color: "#5d564c", blur: 0.3 },
  { z: 0, base: 206, amp: 30, color: "#2a2622", blur: 0 },
];
const W = 300;
const H = 250;
const PERSPECTIVE = 520;

function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function ridge(base: number, amp: number, rand: () => number) {
  const p1 = rand() * 6;
  const p2 = rand() * 6;
  const pts: string[] = [];
  for (let x = 0; x <= W; x += 5) {
    const y = base - amp * (0.55 * Math.sin(x / 38 + p1) * Math.sin(x / 97 + p2) + 0.14 * Math.sin(x / 17 + p2) + 0.45) - rand() * 4;
    pts.push(`${x},${y.toFixed(1)}`);
  }
  return `M0,${H} L${pts.join(" L")} L${W},${H} Z`;
}

export function Sansu({ seed = 5, height = 250, children }: { seed?: number; height?: number; children?: React.ReactNode }) {
  const host = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const paths = useMemo(() => {
    const rand = seeded(seed);
    return LAYERS.map((l) => ridge(l.base, l.amp, rand));
  }, [seed]);

  useEffect(() => {
    const el = host.current;
    const st = stage.current;
    if (!el || !st || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    let tx = 0;
    let ty = 0;
    let cx = 0;
    let cy = 0;
    let lastInput = 0;
    const set = (x: number, y: number) => {
      tx = x;
      ty = y;
      lastInput = performance.now();
    };
    const onPointer = (e: PointerEvent) => {
      const b = el.getBoundingClientRect();
      set((e.clientX - b.left) / b.width - 0.5, (e.clientY - b.top) / b.height - 0.5);
    };
    const onTilt = (e: DeviceOrientationEvent) => {
      if (e.gamma == null || e.beta == null) return;
      set(Math.max(-1, Math.min(1, e.gamma / 30)) / 2, Math.max(-1, Math.min(1, (e.beta - 45) / 30)) / 2);
    };
    const tick = (t: number) => {
      // 입력이 없으면 천천히 좌우로 흔들린다
      if (t - lastInput > 2500) {
        tx = Math.sin(t / 2600) * 0.32;
        ty = Math.sin(t / 3700) * 0.08;
      }
      cx += (tx - cx) * 0.06;
      cy += (ty - cy) * 0.06;
      st.style.transform = `rotateY(${(cx * 14).toFixed(2)}deg) rotateX(${(-cy * 8).toFixed(2)}deg)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    window.addEventListener("pointermove", onPointer);
    window.addEventListener("deviceorientation", onTilt);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("deviceorientation", onTilt);
    };
  }, []);

  return (
    <div ref={host} className="relative -mx-5 overflow-hidden" style={{ height, perspective: PERSPECTIVE }} aria-hidden="true">
      <div ref={stage} className="absolute inset-0" style={{ transformStyle: "preserve-3d" }}>
        <div
          className="absolute rounded-full bg-seal"
          style={{ left: "64%", top: 44, width: 48, height: 48, opacity: 0.85, transform: `translateZ(-260px) scale(${1 + 260 / PERSPECTIVE})` }}
        />
        {LAYERS.map((l, i) => (
          <div key={i} className="contents">
            <div
              className="absolute bottom-0 h-full"
              style={{
                left: "-14%",
                width: "128%",
                transform: `translateZ(${l.z}px) scale(${(1 - l.z / PERSPECTIVE).toFixed(3)})`,
                filter: l.blur ? `blur(${l.blur}px)` : undefined,
              }}
            >
              <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="block h-full w-full">
                <defs>
                  <linearGradient id={`sansu-${seed}-${i}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset={((l.base - l.amp) / H).toFixed(2)} stopColor={l.color} />
                    <stop offset="1" stopColor={l.color} stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d={paths[i]} fill={`url(#sansu-${seed}-${i})`} />
              </svg>
            </div>
            {i < 3 && (
              <div
                className="sansu-mist absolute"
                style={{
                  top: l.base + 8,
                  left: "-30%",
                  width: "160%",
                  height: 46,
                  ["--z" as string]: `${l.z + 35}px`,
                  animationDuration: `${16 + i * 5}s`,
                  animationDirection: i % 2 ? "reverse" : "normal",
                }}
              />
            )}
          </div>
        ))}
        <div className="absolute inset-x-0 bottom-0 h-16" style={{ background: "linear-gradient(rgb(241 236 225 / 0), var(--color-hanji))", transform: "translateZ(40px)" }} />
        {children && (
          <div className="absolute inset-0" style={{ transform: "translateZ(60px)" }}>
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
