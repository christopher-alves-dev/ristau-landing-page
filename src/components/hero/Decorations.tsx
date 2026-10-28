import { motion, useTransform, type MotionValue } from "motion/react";
import type { ReactNode } from "react";

type Props = {
  mx: MotionValue<number>;
  my: MotionValue<number>;
  index: number;
  color: string;
};

const items = [
  { shape: "yarn", className: "left-[6%] top-[18%] w-20 md:w-28", depth: 40, spin: 1 },
  { shape: "stitch", className: "left-[42%] top-[10%] w-10 md:w-14", depth: -25, spin: -1 },
  { shape: "heart", className: "right-[8%] top-[16%] w-10 md:w-12", depth: 30, spin: 1 },
  { shape: "yarn", className: "right-[4%] bottom-[22%] w-16 md:w-24", depth: -45, spin: -1 },
  { shape: "stitch", className: "left-[14%] bottom-[12%] w-8 md:w-12", depth: 55, spin: 1 },
  { shape: "flower", className: "right-[30%] bottom-[8%] w-10 md:w-14", depth: -35, spin: -1 },
  { shape: "flower", className: "left-[30%] top-[32%] w-6 md:w-8", depth: 20, spin: 1 },
] as const;

const shapes: Record<(typeof items)[number]["shape"], ReactNode> = {
  yarn: (
    <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round">
      <circle cx="50" cy="50" r="40" />
      <path d="M14 38c20 6 52 6 72 0M12 56c24 8 52 8 76 0M24 80c14-20 40-56 44-70M44 90c10-22 30-58 32-74" />
      <path d="M86 70c8 10 10 20 2 28" />
    </svg>
  ),
  stitch: (
    <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round">
      <path d="M8 8l24 24M32 8L8 32" />
    </svg>
  ),
  heart: (
    <svg viewBox="0 0 40 40" fill="currentColor">
      <path d="M20 35S4 25 4 14a8 8 0 0 1 16-2 8 8 0 0 1 16 2c0 11-16 21-16 21z" />
    </svg>
  ),
  flower: (
    <svg viewBox="0 0 40 40" fill="currentColor">
      {[0, 72, 144, 216, 288].map((a) => (
        <ellipse key={a} cx="20" cy="10" rx="6" ry="9" transform={`rotate(${a} 20 20)`} opacity=".85" />
      ))}
      <circle cx="20" cy="20" r="5" fill="white" opacity=".7" />
    </svg>
  ),
};

function Floating({ item, mx, my, index, color }: Props & { item: (typeof items)[number] }) {
  const x = useTransform(mx, (v) => v * item.depth);
  const y = useTransform(my, (v) => v * item.depth);

  return (
    <motion.div className={`absolute ${item.className}`} style={{ x, y }}>
      <motion.div
        animate={{ rotate: index * 90 * item.spin, color, scale: [1, 1.15, 1] }}
        transition={{ type: "spring", stiffness: 60, damping: 14, scale: { duration: 0.6 } }}
        style={{ opacity: 0.55 }}
      >
        {shapes[item.shape]}
      </motion.div>
    </motion.div>
  );
}

export default function Decorations(props: Props) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      {items.map((item, i) => (
        <Floating key={i} item={item} {...props} />
      ))}
    </div>
  );
}
