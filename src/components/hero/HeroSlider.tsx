import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type PanInfo,
  type Variants,
} from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { products } from "../../data/products";
import { site, whatsappLink } from "../../data/site";
import Decorations from "./Decorations";

const SWIPE_THRESHOLD = 80;
const WHEEL_COOLDOWN = 700;
const EASE_OUT = [0.16, 1, 0.3, 1] as const;

const productVariants: Variants = {
  enter: (dir: number) => ({ x: dir >= 0 ? "70vw" : "-70vw", rotate: dir >= 0 ? 35 : -35, scale: 0.5, opacity: 0 }),
  center: {
    x: 0,
    rotate: -6,
    scale: 1,
    opacity: 1,
    transition: { type: "spring", stiffness: 60, damping: 15, mass: 1 },
  },
  exit: (dir: number) => ({
    x: dir >= 0 ? "-70vw" : "70vw",
    rotate: dir >= 0 ? -45 : 45,
    scale: 0.4,
    opacity: 0,
    transition: { duration: 0.55, ease: [0.7, 0, 0.84, 0] },
  }),
};

const wordVariants: Variants = {
  enter: (dir: number) => ({ y: dir >= 0 ? "100%" : "-100%" }),
  center: { y: 0, transition: { duration: 0.9, ease: EASE_OUT } },
  exit: (dir: number) => ({ y: dir >= 0 ? "-100%" : "100%", transition: { duration: 0.5, ease: "easeIn" } }),
};

const textContainer: Variants = {
  center: { transition: { staggerChildren: 0.07, delayChildren: 0.15 } },
  exit: { transition: { staggerChildren: 0.04, staggerDirection: -1 } },
};

const textItem: Variants = {
  enter: { y: 30, opacity: 0 },
  center: { y: 0, opacity: 1, transition: { duration: 0.6, ease: EASE_OUT } },
  exit: { y: -20, opacity: 0, transition: { duration: 0.25 } },
};

export default function HeroSlider() {
  const [[index, direction], setSlide] = useState<[number, number]>([0, 0]);
  const indexRef = useRef(0);
  const heroRef = useRef<HTMLElement>(null);
  const lastWheel = useRef(0);
  const thumbsRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  const product = products[index];
  indexRef.current = index;

  const goTo = useCallback((next: number, dir: number) => {
    const wrapped = (next + products.length) % products.length;
    if (wrapped !== indexRef.current) setSlide([wrapped, dir]);
  }, []);
  const paginate = useCallback((dir: number) => goTo(indexRef.current + dir, dir), [goTo]);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const smx = useSpring(mx, { stiffness: 50, damping: 18 });
  const smy = useSpring(my, { stiffness: 50, damping: 18 });
  const tiltY = useTransform(smx, (v) => v * 18);
  const tiltX = useTransform(smy, (v) => v * -12);
  const blobX = useTransform(smx, (v) => v * 120);
  const blobY = useTransform(smy, (v) => v * 120);
  const blob2X = useTransform(smx, (v) => v * -80);
  const blob2Y = useTransform(smy, (v) => v * -80);

  const onPointerMove = (e: React.PointerEvent) => {
    if (reduceMotion || e.pointerType !== "mouse") return;
    const rect = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - rect.left) / rect.width - 0.5);
    my.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  useEffect(() => {
    const list = thumbsRef.current;
    const thumb = list?.children[index] as HTMLElement | undefined;
    if (!list || !thumb) return;
    list.scrollTo({
      left: thumb.offsetLeft - (list.clientWidth - thumb.offsetWidth) / 2,
      behavior: reduceMotion ? "auto" : "smooth",
    });
  }, [index, reduceMotion]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const rect = heroRef.current?.getBoundingClientRect();
      if (!rect || rect.bottom < window.innerHeight / 2) return;
      if (e.key === "ArrowRight") paginate(1);
      if (e.key === "ArrowLeft") paginate(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [paginate]);

  // Só o swipe horizontal do trackpad troca de capa; o scroll vertical fica livre para a página.
  // Cada gesto (incluindo a inércia do trackpad) conta como uma troca só.
  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY) || Math.abs(e.deltaX) < 4) return;
      const dir = e.deltaX > 0 ? 1 : -1;
      const next = indexRef.current + dir;
      if (next < 0 || next >= products.length) return;

      e.preventDefault();
      const now = performance.now();
      const idle = now - lastWheel.current > WHEEL_COOLDOWN;
      lastWheel.current = now;
      if (idle) goTo(next, dir);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [goTo]);

  const onDragEnd = (_: unknown, info: PanInfo) => {
    const power = info.offset.x + info.velocity.x * 0.2;
    if (power < -SWIPE_THRESHOLD) paginate(1);
    else if (power > SWIPE_THRESHOLD) paginate(-1);
  };

  return (
    <motion.section
      ref={heroRef}
      onPointerMove={onPointerMove}
      animate={{ backgroundColor: product.colors.bg, color: product.colors.ink }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className="relative isolate flex min-h-svh flex-col overflow-hidden"
      aria-roledescription="carrossel"
      aria-label="Capas de Kindle em crochê"
    >
      <motion.div
        aria-hidden
        className="absolute -left-[10%] -top-[20%] -z-10 size-[70vmax] rounded-full blur-3xl"
        animate={{ backgroundColor: product.colors.blob }}
        transition={{ duration: 1 }}
        style={{ x: blobX, y: blobY, opacity: 0.55 }}
      />
      <motion.div
        aria-hidden
        className="absolute -bottom-[30%] -right-[10%] -z-10 size-[60vmax] rounded-full blur-3xl"
        animate={{ backgroundColor: product.colors.accent }}
        transition={{ duration: 1 }}
        style={{ x: blob2X, y: blob2Y, opacity: 0.18 }}
      />

      <AnimatePresence initial={false}>
        <motion.svg
          key={product.id}
          aria-hidden
          viewBox="0 0 1200 600"
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-0 -z-10 h-full w-full"
          exit={{ opacity: 0, transition: { duration: 0.4 } }}
        >
          <motion.path
            d="M-50 420 C 200 260, 380 560, 600 380 S 980 120, 1250 260"
            fill="none"
            stroke={product.colors.accent}
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="1 14"
            initial={{ pathLength: 0, opacity: 0.5 }}
            animate={{ pathLength: 1, opacity: 0.5 }}
            transition={{ duration: 1.4, ease: "easeInOut" }}
          />
        </motion.svg>
      </AnimatePresence>

      <Decorations mx={smx} my={smy} index={index} color={product.colors.accent} />

      <header className="absolute inset-x-0 top-0 z-10 mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-5 md:px-10 md:py-7">
        <a href="/" className="-my-2 block">
          <img src={site.logo} alt={site.brand} width={94} height={80} className="h-16 w-auto md:h-20" />
        </a>
        <nav className="hidden items-center gap-8 text-sm font-semibold md:flex">
          <a href="#feito-a-mao" className="hover:opacity-70">Feito à mão</a>
          <a href="#como-encomendar" className="hover:opacity-70">Como encomendar</a>
          <a href={site.instagram} target="_blank" rel="noreferrer" className="hover:opacity-70">Instagram</a>
        </nav>
      </header>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-1/2 -z-10 -translate-y-1/2 overflow-hidden text-center leading-none"
      >
        <AnimatePresence initial={false} custom={direction}>
          <motion.span
            key={product.id}
            custom={direction}
            variants={wordVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="font-display absolute inset-x-0 top-0 block text-[28vw] font-black tracking-tight whitespace-nowrap uppercase opacity-15 md:text-[22vw]"
          >
            {product.word}
          </motion.span>
        </AnimatePresence>
        <span className="font-display invisible block text-[28vw] font-black uppercase md:text-[22vw]">.</span>
      </div>

      <div className="mx-auto grid w-full max-w-7xl flex-1 grid-cols-1 items-center gap-6 px-6 pt-24 pb-36 md:grid-cols-[1fr_1.1fr] md:gap-10 md:px-10 md:pb-32">
        <div className="relative order-2 min-h-56 md:order-1" aria-live="polite">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={product.id} variants={textContainer} initial="enter" animate="center" exit="exit">
              <motion.p variants={textItem} className="text-sm font-semibold tracking-[0.2em] uppercase opacity-70">
                {product.tagline}
              </motion.p>
              <motion.h1 variants={textItem} className="font-display mt-3 text-5xl leading-[0.95] font-black md:text-7xl">
                {product.name}
              </motion.h1>
              <motion.p variants={textItem} className="mt-5 max-w-md text-base leading-relaxed opacity-80 md:text-lg">
                {product.description}
              </motion.p>
              <motion.div variants={textItem} className="mt-8 flex flex-wrap items-center gap-5">
                <a
                  href={whatsappLink(`Olá! Quero encomendar a capa ${product.name} para o meu Kindle.`)}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full px-7 py-4 font-semibold text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
                  style={{ backgroundColor: product.colors.accent }}
                >
                  Quero a minha
                </a>
                <span className="text-lg">
                  a partir de <strong className="text-2xl">{product.price}</strong>
                </span>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="relative order-1 flex h-[46svh] items-center justify-center md:order-2 md:h-[70svh]" style={{ perspective: 1200 }}>
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={product.id}
              custom={direction}
              variants={reduceMotion ? undefined : productVariants}
              initial="enter"
              animate="center"
              exit="exit"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.5}
              onDragEnd={onDragEnd}
              className="absolute h-full cursor-grab touch-pan-y active:cursor-grabbing"
            >
              <motion.div style={{ rotateX: tiltX, rotateY: tiltY }} className="h-full">
                <motion.img
                  src={product.image}
                  alt={`Capa de Kindle em crochê ${product.name}`}
                  draggable={false}
                  className="h-full w-auto select-none"
                  style={{ filter: `drop-shadow(0 40px 40px ${product.colors.ink}40)` }}
                  animate={reduceMotion ? undefined : { y: [0, -16, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                />
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 mx-auto flex w-full max-w-7xl items-end justify-between gap-4 px-6 pb-6 md:px-10 md:pb-10">
        <div
          ref={thumbsRef}
          className="relative -m-2 flex min-w-0 gap-2 overflow-x-auto p-2 [scrollbar-width:none] md:gap-3"
          role="tablist"
          aria-label="Escolha uma capa"
        >
          {products.map((p, i) => (
            <button
              key={p.id}
              role="tab"
              aria-selected={i === index}
              aria-label={p.name}
              onClick={() => goTo(i, i > index ? 1 : -1)}
              className="relative size-12 shrink-0 rounded-2xl bg-white/40 p-1.5 backdrop-blur transition-transform hover:scale-110 sm:size-14 md:size-16"
            >
              <img src={p.image} alt="" className="h-full w-full object-contain" />
              {i === index && (
                <motion.span
                  layoutId="thumb-ring"
                  className="absolute inset-0 rounded-2xl border-2"
                  style={{ borderColor: product.colors.accent }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <span className="font-display hidden text-lg font-bold whitespace-nowrap tabular-nums sm:block">
            {String(index + 1).padStart(2, "0")}
            <span className="opacity-40"> / {String(products.length).padStart(2, "0")}</span>
          </span>
          {[-1, 1].map((dir) => (
            <button
              key={dir}
              onClick={() => paginate(dir)}
              aria-label={dir < 0 ? "Capa anterior" : "Próxima capa"}
              className="grid size-11 place-items-center rounded-full border-2 border-current transition-colors hover:bg-white/50 sm:size-12 md:size-14"
            >
              <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d={dir < 0 ? "M15 18l-6-6 6-6" : "M9 6l6 6-6 6"} />
              </svg>
            </button>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
