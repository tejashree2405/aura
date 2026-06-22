import { motion, useScroll, useTransform } from "motion/react";
import { useRef, type ReactNode } from "react";

export function Reveal({
  children,
  delay = 0,
  className,
  as = "div",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "span" | "h1" | "h2" | "h3" | "p";
}) {
  const ref = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: ref as never,
    offset: ["start 0.95", "start 0.45"],
  });
  // Stagger via slight delay window per index
  const start = Math.min(0.25, delay * 0.05);
  const opacity = useTransform(scrollYProgress, [start, Math.min(1, start + 0.7)], [0, 1]);
  const y = useTransform(scrollYProgress, [start, Math.min(1, start + 0.7)], [40, 0]);

  const Tag = motion[as] as typeof motion.div;
  return (
    <Tag ref={ref as never} className={className} style={{ opacity, y }}>
      {children}
    </Tag>
  );
}
