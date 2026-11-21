import { animate, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

export function CountUp({ value, decimals = 0, prefix = "", suffix = "" }: { value: number; decimals?: number; prefix?: string; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const visible = useInView(ref, { once: true });
  const reduced = useReducedMotion();
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!visible) return;
    if (reduced) { setCount(value); return; }
    const controls = animate(0, value, { duration: 1.5, ease: "easeOut", onUpdate: setCount });
    return () => controls.stop();
  }, [visible, value, reduced]);
  return <span ref={ref}>{prefix}{count.toFixed(decimals)}{suffix}</span>;
}