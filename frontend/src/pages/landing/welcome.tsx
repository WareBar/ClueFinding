import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSound } from "@/hooks/useSound";


import csharp      from "@/assets/houses/CSHARP_SHOOTERS.png";
import java        from "@/assets/houses/JAVA_RAPTORS.png";
import python      from "@/assets/houses/PYTHON_LEGIONS.png";
import perl        from "@/assets/houses/PERL_HUNTERS.png";
import department  from "@/assets/department.png";


// ─── Constants ────────────────────────────────────────────────────────────────
const GOLD      = "#f5c842";
const DEEP_GOLD = "#c9952a";
const CRIMSON   = "#c0392b";
const NAVY      = "#071525";

const HOUSES = [
  { name: "Python's Legions", logo: python, color: "#007446", accent: "#ff9a5c", exitX:  "75vw", exitY: "-65vh" },
  { name: "Java Raptors",     logo: java,   color: "#F98037", accent: "#b8e8ff", exitX: "-75vw", exitY: "-65vh" },
  { name: "CSharp Shooters",  logo: csharp, color: "#A34848", accent: "#4fa3d4", exitX:  "75vw", exitY: "-65vh" },
  { name: "Perl Hunters",     logo: perl,   color: "#3138DB", accent: "#9dc49d", exitX: "-75vw", exitY: "-65vh" },
];

// ─── Global CSS ───────────────────────────────────────────────────────────────
const FONT_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Pirata+One&family=Cinzel:wght@400;700;900&family=IM+Fell+English:ital@0;1&display=swap');
  *, *::before, *::after { box-sizing: border-box; }
  ::selection { background: rgba(245,200,66,.35); color: #f5c842; }

  @keyframes shimmer     { 0%  { background-position: -200% center } 100% { background-position:  200% center } }
  @keyframes floatBob    { 0%,100%{transform:translateY(0) rotate(0deg)} 33%{transform:translateY(-12px) rotate(1.2deg)} 66%{transform:translateY(-6px) rotate(-1deg)} }
  @keyframes scanLine    { 0%  { transform: translateY(-100%) } 100% { transform: translateY(100vh) } }
  @keyframes waveScroll  { 0%  { transform: translateX(0)    } 100% { transform: translateX(-50%) } }
  @keyframes rubyFlicker { 0%,100%{opacity:1} 3%{opacity:.5} 6%{opacity:1} 40%{opacity:.9} 42%{opacity:.2} 44%{opacity:1} }
  @keyframes filmGrain   { 0%{transform:translate(0,0)} 10%{transform:translate(-1%,-1%)} 20%{transform:translate(1%,1%)} 30%{transform:translate(-1%,1%)} 40%{transform:translate(1%,-1%)} 50%{transform:translate(-2%,0)} 60%{transform:translate(2%,1%)} 70%{transform:translate(0,-2%)} 80%{transform:translate(-1%,2%)} 90%{transform:translate(1%,0)} 100%{transform:translate(0,0)} }
  @keyframes vignettePulse { 0%,100%{opacity:.7} 50%{opacity:.5} }
  @keyframes textFlicker { 0%,100%{opacity:1} 92%{opacity:1} 93%{opacity:.4} 94%{opacity:1} 97%{opacity:.8} 98%{opacity:1} }
  @keyframes badgeScan   { 0%{transform:translateX(-100%)} 100%{transform:translateX(400%)} }
  @keyframes impactShake  { 0%{transform:translate(0,0)} 10%{transform:translate(-6px,-4px)} 20%{transform:translate(6px,4px)} 30%{transform:translate(-5px,3px)} 40%{transform:translate(5px,-3px)} 50%{transform:translate(-3px,2px)} 60%{transform:translate(3px,-2px)} 70%{transform:translate(-2px,1px)} 100%{transform:translate(0,0)} }
  @keyframes numberSlam   { 0%{transform:scale(2.6) rotate(-8deg);opacity:0;filter:blur(10px)} 55%{transform:scale(.9) rotate(1.5deg);opacity:1;filter:blur(0)} 75%{transform:scale(1.07) rotate(-.5deg)} 100%{transform:scale(1) rotate(0)} }
  @keyframes shockwave    { 0%{transform:scale(0);opacity:.85} 100%{transform:scale(4);opacity:0} }
  @keyframes scanFlash    { 0%{opacity:0;transform:translateY(-100%)} 30%{opacity:.5} 100%{opacity:0;transform:translateY(100%)} }
  @keyframes rgbSplit     { 0%,100%{filter:none} 50%{filter:drop-shadow(-4px 0 0 rgba(255,0,80,.75)) drop-shadow(4px 0 0 rgba(0,220,255,.75))} }
  @keyframes slashWipe    { from{transform:scaleX(0) skewX(-18deg);opacity:0} to{transform:scaleX(1) skewX(-18deg);opacity:1} }
  @keyframes battleLineIn { from{scaleX:0;opacity:0} to{scaleX:1;opacity:1} }
  @keyframes pulseGlow    { 0%,100%{opacity:.5} 50%{opacity:1} }
  @keyframes glitch1 {
    0%,89%,100%{ clip-path:inset(0 0 100% 0); transform:translate(0) }
    90%{ clip-path:inset(15% 0 55% 0); transform:translate(-5px,2px) }
    92%{ clip-path:inset(55% 0 15% 0); transform:translate(5px,-2px) }
    94%{ clip-path:inset(75% 0  8% 0); transform:translate(-3px,1px) }
    96%{ clip-path:inset(0 0 100% 0); transform:translate(0) }
  }
  @keyframes glitch2 {
    0%,91%,100%{ clip-path:inset(0 0 100% 0); opacity:0; transform:translate(0) }
    91%{ clip-path:inset(35% 0 45% 0); transform:translate(5px,-3px); opacity:.6 }
    93%{ clip-path:inset(65% 0 15% 0); transform:translate(-5px,3px); opacity:.6 }
    95%{ clip-path:inset(0 0 100% 0); opacity:0 }
  }
  @keyframes letterDrop  { from{opacity:0;transform:translateY(50px) rotateX(-80deg);filter:blur(10px)} to{opacity:1;transform:translateY(0) rotateX(0);filter:blur(0)} }
  @keyframes horizontalWipe { from{width:0;opacity:0} to{width:100%;opacity:1} }
`;

interface WelcomeProps { onStart: () => void; }

export default function Welcome({ onStart }: WelcomeProps) {
  const [scene, setScene] = useState(0);
  // 0 = cold open   1 = house roll   2 = title card   3 = main landing
  const playOpening = useSound()

  // playOpening("opening")
  
  useEffect(() => {
    if (document.getElementById("wkf")) return;
    const s = document.createElement("style");
    s.id = "wkf"; s.textContent = FONT_CSS;
    document.head.appendChild(s);
  }, []);

  useEffect(()=>{
    playOpening("opening")
  },[])

  return (
    <div className="fixed inset-0 overflow-hidden bg-black">
      <AnimatePresence>
        {scene === 0 && <ColdOpen     key="cold"    onDone={() => setScene(1)} />}
        {scene === 1 && <HouseRoll    key="roll"    onDone={() => setScene(2)} />}
        {scene === 2 && <TitleCard    key="title"   onDone={() => setScene(3)} />}
      </AnimatePresence>
      <AnimatePresence>
        {scene === 3 && <MainLanding  key="landing" onStart={onStart} />}
      </AnimatePresence>

      {/* ── Skip Story button — visible on scenes 0-2, hidden once MainLanding shows ── */}
      <AnimatePresence>
        {scene < 3 && (
          <motion.button
            key="skip-btn"
            onClick={() => setScene(3)}
            className="fixed z-[9999] flex items-center gap-2 rounded border cursor-pointer select-none"
            style={{
              bottom:        24,
              right:         24,
              padding:       "8px 18px",
              fontFamily:    "'Cinzel', serif",
              fontSize:      ".62rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color:         "rgba(245,200,66,.55)",
              borderColor:   "rgba(245,200,66,.2)",
              background:    "rgba(2,10,18,.72)",
              backdropFilter:"blur(6px)",
              WebkitBackdropFilter: "blur(6px)",
            }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{    opacity: 0, y: 8, transition: { duration: 0.2 } }}
            transition={{ delay: 0.8, duration: 0.4, ease: "easeOut" }}
            whileHover={{
              color:       "rgba(245,200,66,.9)",
              borderColor: "rgba(245,200,66,.5)",
              background:  "rgba(2,10,18,.9)",
            }}
            whileTap={{ scale: 0.96 }}
          >
            {/* Skip icon */}
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none" style={{ opacity: 0.7 }}>
              <path d="M2 2 L8 6 L2 10 Z"         fill="currentColor"/>
              <rect x="9" y="2" width="1.5" height="8" rx=".5" fill="currentColor"/>
            </svg>
            Skip Story
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}


// ══════════════════════════════════════════════════════════════════════════════
// SCENE 0 — COLD OPEN  (cinematic black → story text → flash)
// "In a world where code is power…"
// ══════════════════════════════════════════════════════════════════════════════
function ColdOpen({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 4200);
    return () => clearTimeout(t);
  }, [onDone]);

  const lines = [
    "In a world where code is power…",
    "Four houses clash for supremacy.",
    "Five clues. One Piece. One winner.",
  ];

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black"
      exit={{ opacity: 0, transition: { duration: 0.5 } }}
    >
      {/* Film grain overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[.06]"
        style={{
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          backgroundSize: "180px",
          animation: "filmGrain .08s steps(1) infinite",
        }}
      />

      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at 50% 50%, transparent 30%, rgba(0,0,0,.92) 100%)",
          animation: "vignettePulse 3s ease-in-out infinite",
        }}
      />

      {/* Cinematic bars */}
      <div className="absolute top-0 left-0 right-0 h-16 bg-black z-10" />
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-black z-10" />

      {/* Story lines — fade in one by one */}
      <div className="relative z-20 text-center flex flex-col gap-6">
        {lines.map((line, i) => (
          <motion.p
            key={i}
            className="text-white/80 text-center"
            style={{
              fontFamily: "'IM Fell English', serif",
              fontStyle:  "italic",
              fontSize:   "clamp(1rem, 2.5vw, 1.35rem)",
              letterSpacing: "0.06em",
              animation: "textFlicker 4s ease-in-out infinite",
            }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + i * 0.9, duration: 0.8, ease: "easeOut" }}
          >
            {line}
          </motion.p>
        ))}
      </div>

      {/* White flash just before exit */}
      <motion.div
        className="absolute inset-0 bg-white pointer-events-none z-30"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0, 0, 0, 1] }}
        transition={{ duration: 4.2, times: [0, 0.7, 0.8, 0.9, 1], ease: "easeIn" }}
      />
    </motion.div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// SCENE 1 — HOUSE ROLL  (action anime intro — impact, shockwave, RGB split)
// ══════════════════════════════════════════════════════════════════════════════
function HouseRoll({ onDone }: { onDone: () => void }) {
  const [current,   setCurrent]   = useState(0);
  const [done,      setDone]      = useState(false);
  const [impacting, setImpacting] = useState(false); // triggers screen-shake frame
  const house = HOUSES[current];

  // Sequence: impact flash (80ms) → hold (900ms) → next (total ~1400ms per card)
  useEffect(() => {
    if (done) return;
    // Trigger impact shake the moment a new card arrives
    setImpacting(true);
    const shake = setTimeout(() => setImpacting(false), 280);

    const advance = setTimeout(() => {
      if (current < HOUSES.length - 1) setCurrent(c => c + 1);
      else { setDone(true); onDone(); }
    }, 1400);

    return () => { clearTimeout(shake); clearTimeout(advance); };
  }, [current, done, onDone]);

  return (
    <motion.div
      className="fixed inset-0 z-40 overflow-hidden flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.35 } }}
      // Screen-shake on impact
      style={{ animation: impacting ? "impactShake .28s ease-out" : "none" }}
    >

      {/* ── Background ── */}
      <motion.div
        key={`bg-${current}`}
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.18 }}
        style={{
          background: `
            radial-gradient(ellipse at 50% 55%, ${house.color}28 0%, transparent 58%),
            radial-gradient(ellipse at 85% 15%, ${house.color}10 0%, transparent 42%),
            linear-gradient(180deg, #010609 0%, #02080f 40%, ${NAVY} 100%)
          `,
        }}
      />

      {/* ── Full-screen white impact flash ── */}
      <AnimatePresence>
        {impacting && (
          <motion.div
            key={`flash-${current}`}
            className="absolute inset-0 z-50 pointer-events-none bg-white"
            initial={{ opacity: 0.85 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
          />
        )}
      </AnimatePresence>

      {/* ── Expanding shockwave ring on impact ── */}
      <motion.div
        key={`shock-${current}`}
        className="absolute rounded-full pointer-events-none z-30"
        style={{
          width: 80, height: 80,
          top: "50%", left: "50%",
          marginLeft: -40, marginTop: -40,
          border: `2px solid ${house.color}`,
          animation: "shockwave .55s ease-out forwards",
        }}
      />
      {/* Second ring (delayed) */}
      <motion.div
        key={`shock2-${current}`}
        className="absolute rounded-full pointer-events-none z-30"
        style={{
          width: 80, height: 80,
          top: "50%", left: "50%",
          marginLeft: -40, marginTop: -40,
          border: `1px solid ${house.accent}88`,
          animation: "shockwave .7s .08s ease-out forwards",
        }}
      />

      {/* ── Cinematic letterbox bars ── */}
      <div className="absolute top-0 left-0 right-0 h-12 bg-black z-20 pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-12 bg-black z-20 pointer-events-none" />

      {/* ── Diagonal battle lines (manga-style speed burst) ── */}
      {Array.from({ length: 14 }).map((_, i) => (
        <motion.div
          key={`bl-${current}-${i}`}
          className="absolute pointer-events-none left-0 right-0"
          style={{
            top:       `${4 + i * 7}%`,
            height:    i % 4 === 0 ? 2 : 1,
            background:`linear-gradient(90deg, transparent 0%, ${house.color}${i % 3 === 0 ? "35" : i % 2 === 0 ? "18" : "0a"} 50%, transparent 100%)`,
            transform: "skewY(-3deg)",
            transformOrigin: "left",
          }}
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ delay: i * 0.015, duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        />
      ))}

      {/* ── Full-height scan beam sweeping down ── */}
      <div
        key={`scan-${current}`}
        className="absolute left-0 right-0 pointer-events-none z-10"
        style={{
          height: "100%",
          background: `linear-gradient(180deg, transparent 0%, ${house.color}18 48%, ${house.color}28 50%, ${house.color}18 52%, transparent 100%)`,
          animation: "scanFlash .45s ease-out forwards",
        }}
      />

      {/* ── Massive ghosted VS watermark ── */}
      {current > 0 && (
        <motion.div
          key={`vs-${current}`}
          className="absolute z-10 pointer-events-none select-none"
          style={{
            fontFamily:    "'Pirata One', cursive",
            fontSize:      "clamp(8rem, 22vw, 18rem)",
            color:         "rgba(255,255,255,.028)",
            letterSpacing: "-0.06em",
            lineHeight:    1,
          }}
          initial={{ scale: 1.8, opacity: 0, rotate: -5 }}
          animate={{ scale: 1,   opacity: 1, rotate: 0  }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          HOUSES
        </motion.div>
      )}

      {/* ── House card ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`card-${current}`}
          className="relative flex flex-col items-center z-10"
          style={{ userSelect: "none" }}
          // Slams in from bottom with overshoot
          initial={{ y: "60vh", opacity: 0, scale: 0.75, rotate: -3 }}
          animate={{ y: 0,      opacity: 1, scale: 1,    rotate: 0  }}
          exit={{
            x: house.exitX, y: house.exitY,
            opacity: 0, scale: 0.55, rotate: current % 2 === 0 ? 8 : -8,
            transition: { duration: 0.32, ease: [0.55, 0, 1, 0.5] },
          }}
          transition={{ duration: 0.42, ease: [0.12, 1.6, 0.5, 1] }}
        >
          {/* Outer shatter glow */}
          <div
            className="absolute pointer-events-none"
            style={{
              width: 340, height: 340,
              top: "50%", left: "50%",
              transform: "translate(-50%, -58%)",
              background: `radial-gradient(circle, ${house.color}38 0%, ${house.color}10 40%, transparent 70%)`,
              filter: "blur(40px)",
              animation: "pulseGlow 1.2s ease-in-out infinite",
            }}
          />

          {/* Logo — RGB split on arrival then settles */}
          <motion.img
            src={house.logo} alt={house.name}
            className="object-contain relative z-10"
            style={{
              width: 176, height: 176,
              animation: "rgbSplit .6s ease-out",
              filter: `drop-shadow(0 0 18px ${house.color}aa) drop-shadow(0 0 36px ${house.color}44)`,
            }}
            initial={{ scale: 0.55, opacity: 0, y: 30 }}
            animate={{ scale: 1,    opacity: 1, y: 0  }}
            transition={{ delay: 0.04, duration: 0.48, ease: [0.34, 1.5, 0.64, 1] }}
          />

          {/* ── Slash decoration behind name ── */}
          <div
            className="relative z-10 overflow-hidden"
            style={{ marginTop: 18, marginBottom: -8 }}
          >
            <motion.div
              style={{
                height: 2,
                width:  220,
                background: `linear-gradient(90deg, transparent, ${house.color}, ${house.accent}, ${house.color}, transparent)`,
                transform:  "skewX(-18deg)",
                transformOrigin: "left",
              }}
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>

          {/* Name — slams in with chroma shift */}
          <motion.p
            className="relative z-10 font-black uppercase text-center"
            style={{
              fontFamily:    "'Cinzel', serif",
              fontSize:      "clamp(1.5rem, 5vw, 2.8rem)",
              color:          house.color,
              letterSpacing: "0.32em",
              marginTop:     14,
              textShadow:    `0 0 24px ${house.color}cc, 0 0 48px ${house.color}66, 0 3px 0 rgba(0,0,0,.98)`,
              animation:     "numberSlam .45s ease-out",
            }}
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0,  scale: 1   }}
            transition={{ delay: 0.12, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            {house.name}
          </motion.p>

          {/* Bottom slash */}
          <motion.div
            style={{
              height:        2,
              marginTop:     8,
              width:         180,
              background:    `linear-gradient(90deg, transparent, ${house.accent}cc, transparent)`,
              transform:     "skewX(-18deg)",
              transformOrigin: "left",
            }}
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.3, ease: "easeOut" }}
          />

          {/* Animated scan sweep */}
          <div
            className="relative z-10 overflow-hidden"
            style={{ marginTop: 12, height: 1, width: 180, background: `${house.color}22` }}
          >
            <div
              style={{
                position: "absolute", top: 0, height: "100%",
                width: "45%",
                background: `linear-gradient(90deg, transparent, ${house.accent}ee, transparent)`,
                animation:  "badgeScan .9s ease-in-out infinite",
              }}
            />
          </div>
        </motion.div>
      </AnimatePresence>

      {/* ── Progress pips ── */}
      <div className="absolute bottom-16 z-30 flex items-center gap-3">
        {HOUSES.map((h, i) => (
          <motion.div
            key={i}
            className="rounded-sm"
            style={{ transform: "skewX(-8deg)" }}
            animate={{
              width:      i === current ? 36 : i < current ? 14 : 8,
              height:     5,
              opacity:    i <= current ? 1 : 0.2,
              background: i <= current ? h.color : "rgba(255,255,255,.18)",
            }}
            transition={{ duration: 0.15 }}
          />
        ))}
      </div>

      {/* ── Counter (top-right, slams in) ── */}
      <div className="absolute top-16 right-8 z-30 flex items-baseline gap-1">
        <motion.span
          key={`num-${current}`}
          style={{
            fontFamily: "'Pirata One', cursive",
            fontSize:   "2.2rem",
            color:       house.color,
            animation:  "numberSlam .4s ease-out",
            textShadow: `0 0 20px ${house.color}aa`,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.15 }}
        >
          {current + 1}
        </motion.span>
        <span style={{ fontFamily: "'Cinzel', serif", fontSize: ".72rem", color: "rgba(255,255,255,.22)" }}>
          / {HOUSES.length}
        </span>
      </div>

    </motion.div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// SCENE 2 — TITLE CARD  (redesigned: dept emblem top + title slam + tagline)
// ══════════════════════════════════════════════════════════════════════════════
function TitleCard({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState(0);
  // 0=dark  1=dept logo  2=title letters  3=tagline+dividers

  useEffect(() => {
    const ts = [200, 700, 1400, 2300];
    const timers = ts.map((t, i) => setTimeout(() => setPhase(i + 1), t));
    const done   = setTimeout(onDone, 3800);
    return () => { timers.forEach(clearTimeout); clearTimeout(done); };
  }, [onDone]);

  return (
    <motion.div
      className="fixed inset-0 z-30 overflow-hidden flex flex-col items-center justify-center"
      style={{ background: "#010608" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.3 } }}
      exit={{ opacity: 0, transition: { duration: 0.6 } }}
    >

      {/* ── BACKGROUND: concentric ring grid (like a radar/targeting scope) ── */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        {[320, 520, 720, 920, 1100].map((r, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full border"
            style={{
              width: r, height: r,
              borderColor: `rgba(245,200,66,${0.04 - i * 0.006})`,
              borderWidth: 1,
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 + i * 0.08, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          />
        ))}
        {/* Cross-hairs */}
        {[0, 90].map(rot => (
          <motion.div
            key={rot}
            className="absolute"
            style={{
              width: "100vmax", height: 1,
              background: "linear-gradient(90deg, transparent 0%, rgba(245,200,66,.04) 50%, transparent 100%)",
              transform:  `rotate(${rot}deg)`,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          />
        ))}
      </div>

      {/* ── BACKGROUND: subtle gold bloom that grows with phase ── */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(245,200,66,.1) 0%, transparent 60%)" }}
        initial={{ opacity: 0, scale: 0.2 }}
        animate={{
          opacity: phase >= 1 ? 1 : 0,
          scale:   phase >= 1 ? 1 : 0.2,
        }}
        transition={{ duration: 1.0, ease: "easeOut" }}
      />

      {/* ── SPEED LINES (phase 2) ── */}
      {phase >= 2 && Array.from({ length: 16 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute pointer-events-none left-0 right-0"
          style={{
            top:        `${3 + i * 6}%`,
            height:     i % 4 === 0 ? 2 : 1,
            background: `linear-gradient(90deg, transparent, rgba(245,200,66,${i % 4 === 0 ? .08 : .025}), transparent)`,
          }}
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ delay: i * 0.015, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        />
      ))}

      {/* ── MAIN CONTENT — vertical stack, all in normal flow, no absolute ── */}
      <div
        className="relative z-10 flex flex-col items-center text-center"
        style={{ gap: 0, padding: "0 24px", maxWidth: 680, width: "100%" }}
      >

        {/* 1. DEPARTMENT LOGO — stamps in from above */}
        <motion.div
          className="flex flex-col items-center"
          style={{ marginBottom: 8 }}
          initial={{ y: -60, opacity: 0, scale: 0.7 }}
          animate={{ y: 0,   opacity: phase >= 1 ? 1 : 0, scale: phase >= 1 ? 1 : 0.7 }}
          transition={{ delay: 0, duration: 0.65, ease: [0.12, 1.6, 0.5, 1] }}
        >
          {/* Dept image inside a glowing circle frame */}
          <div
            className="relative flex items-center justify-center rounded-full"
            style={{
              width:     148,
              height:    148,
              background:"radial-gradient(circle, rgba(245,200,66,.06) 0%, rgba(2,10,18,.9) 70%)",
              boxShadow: `0 0 0 1px rgba(245,200,66,.18), 0 0 32px rgba(245,200,66,.14), 0 0 64px rgba(245,200,66,.06)`,
            }}
          >
            {/* Spinning outer ring */}
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{ border: "1px dashed rgba(245,200,66,.2)" }}
              animate={{ rotate: 360 }}
              transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
            />
            {/* Logo */}
            <img
              src={department}
              alt="IT Department"
              style={{
                width:     108,
                height:    108,
                objectFit: "contain",
                filter:    "drop-shadow(0 0 12px rgba(245,200,66,.45)) brightness(1.05)",
              }}
            />
          </div>

          {/* "IT DEPARTMENT" label below logo */}
          <motion.p
            className="uppercase text-amber-400/55 tracking-widest"
            style={{
              fontFamily:  "'Cinzel', serif",
              fontSize:    "clamp(.52rem, .75vw, .65rem)",
              letterSpacing: "0.45em",
              marginTop:   10,
            }}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: phase >= 1 ? 1 : 0, y: phase >= 1 ? 0 : 6 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            Information Technology Department
          </motion.p>

          {/* Thin divider line */}
          <motion.div
            style={{
              marginTop:  8,
              height:     1,
              background: `linear-gradient(90deg, transparent, ${DEEP_GOLD}88, transparent)`,
            }}
            initial={{ width: 0 }}
            animate={{ width: phase >= 1 ? 180 : 0 }}
            transition={{ delay: 0.45, duration: 0.5, ease: "easeOut" }}
          />
        </motion.div>

        {/* 2. EVENT BADGE */}
        <motion.div
          className="flex items-center"
          style={{ gap: 12, marginBottom: 16 }}
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: phase >= 1 ? 1 : 0, scale: phase >= 1 ? 1 : 0.85 }}
          transition={{ delay: 0.5, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <div style={{ width: 32, height: 1, background: `linear-gradient(90deg, transparent, ${DEEP_GOLD})` }} />
          <span
            className="uppercase text-amber-500/70"
            style={{ fontFamily: "'Cinzel', serif", fontSize: "clamp(.52rem, .78vw, .68rem)", letterSpacing: "0.5em" }}
          >
            IT Day 2026
          </span>
          <div style={{ width: 32, height: 1, background: `linear-gradient(90deg, ${DEEP_GOLD}, transparent)` }} />
        </motion.div>

        {/* 3. MAIN TITLE — letters slam up */}
        {phase >= 2 && (
          <div className="relative" style={{ perspective: 900 }}>
            {/* Glitch red layer */}
            <div
              className="absolute inset-0 text-center pointer-events-none select-none"
              style={{
                fontFamily: "'Pirata One', cursive",
                fontSize:   "clamp(3rem, 10vw, 7.5rem)",
                lineHeight: 0.95,
                color:      CRIMSON,
                animation:  "glitch1 4.5s linear .3s infinite",
              }}
            >
              IT DAY<br />CLUE HUNT
            </div>
            {/* Glitch cyan layer */}
            <div
              className="absolute inset-0 text-center pointer-events-none select-none"
              style={{
                fontFamily: "'Pirata One', cursive",
                fontSize:   "clamp(3rem, 10vw, 7.5rem)",
                lineHeight: 0.95,
                color:      "#00ccff",
                animation:  "glitch2 4.5s linear .8s infinite",
              }}
            >
              IT DAY<br />CLUE HUNT
            </div>

            {/* Real shimmer title */}
            <h1
              className="relative select-none font-black text-center leading-none"
              style={{
                fontFamily:           "'Pirata One', cursive",
                fontSize:             "clamp(3rem, 10vw, 7.5rem)",
                lineHeight:           0.95,
                background:           `linear-gradient(135deg, ${DEEP_GOLD} 0%, ${GOLD} 32%, #fffde8 50%, ${GOLD} 68%, ${DEEP_GOLD} 100%)`,
                backgroundSize:       "200% auto",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor:  "transparent",
                backgroundClip:       "text",
                animation:            "shimmer 2.5s linear infinite",
                filter:               "drop-shadow(0 0 28px rgba(245,200,66,.65)) drop-shadow(0 0 56px rgba(245,200,66,.3))",
              }}
            >
              {/* Line 1 */}
              <span className="block">
                {"IT DAY".split("").map((ch, i) => (
                  <motion.span
                    key={`a${i}`}
                    className="inline-block"
                    initial={{ opacity: 0, y: 60, rotateX: -80, filter: "blur(8px)" }}
                    animate={{ opacity: 1, y: 0,  rotateX: 0,   filter: "blur(0px)" }}
                    transition={{ delay: i * 0.05, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {ch === " " ? "\u00A0" : ch}
                  </motion.span>
                ))}
              </span>
              {/* Line 2 */}
              <span className="block">
                {"CLUE HUNT".split("").map((ch, i) => (
                  <motion.span
                    key={`b${i}`}
                    className="inline-block"
                    initial={{ opacity: 0, y: 60, rotateX: -80, filter: "blur(8px)" }}
                    animate={{ opacity: 1, y: 0,  rotateX: 0,   filter: "blur(0px)" }}
                    transition={{ delay: 0.3 + i * 0.05, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {ch === " " ? "\u00A0" : ch}
                  </motion.span>
                ))}
              </span>
            </h1>
          </div>
        )}

        {/* 4. TAGLINE + bottom ornament */}
        {phase >= 3 && (
          <motion.div
            className="flex flex-col items-center"
            style={{ marginTop: 20 }}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0  }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Thin gold rule */}
            <div style={{ width: 220, height: 1, background: `linear-gradient(90deg, transparent, ${DEEP_GOLD}99, transparent)`, marginBottom: 12 }} />

            <p
              className="italic text-center text-amber-100/60"
              style={{
                fontFamily: "'IM Fell English', serif",
                fontSize:   "clamp(.85rem, 1.7vw, 1.05rem)",
                lineHeight: 1.65,
                maxWidth:   400,
              }}
            >
              Four houses. Four rivalries. One hidden cipher.
              <br />
              <span style={{ color: GOLD }}>Find all the clues. Prove your house.</span>
            </p>

            {/* Bottom rule */}
            <div style={{ width: 220, height: 1, background: `linear-gradient(90deg, transparent, ${DEEP_GOLD}99, transparent)`, marginTop: 12 }} />
          </motion.div>
        )}
      </div>

      {/* ── Pulse ring burst (phase 3) ── */}
      {phase >= 3 && (
        <motion.div
          className="absolute pointer-events-none rounded-full"
          style={{
            width: 260, height: 260,
            top: "50%", left: "50%",
            marginLeft: -130, marginTop: -130,
            border: "1px solid rgba(245,200,66,.18)",
          }}
          animate={{ scale: [0.4, 3.2], opacity: [0.65, 0] }}
          transition={{ duration: 2, ease: "easeOut", repeat: Infinity, repeatDelay: 0.4 }}
        />
      )}
    </motion.div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// SCENE 3 — MAIN LANDING
// ══════════════════════════════════════════════════════════════════════════════
function MainLanding({ onStart }: { onStart: () => void }) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Code token particles — float across the screen like ambient background code
  const [codeTokens] = useState(() => {
    const tokens = [
      // Python
      "def", "class", "import", "lambda", "yield", "self", "None", "True", "False",
      "print()", "range()", "len()", "append()", "for i in", "if __name__",
      // Java
      "public", "static", "void", "class", "extends", "implements", "new", "this",
      "System.out", "ArrayList<>", "HashMap<>", "@Override", "throws", "interface",
      // C#
      "using", "namespace", "var", "async", "await", "LINQ", "delegate", "event",
      ".Select()", ".Where()", "Console.Write", "Task<T>", "IEnumerable",
      // Perl
      "my $", "sub", "push @", "foreach", "print", "chomp", "split", "join",
      "qw()", "->", "$$ref", "%hash", "@array",
      // Generic
      "{ }", "[ ]", "=>", "!=", "===", "&&", "||", "++i", "n++",
      "return", "break", "null", "0x1F", "EOF", "stdin",

      // hinanakit
      "Ayaw ko na","Bakit naman ganon","Si peter may anak",
    ];
    return Array.from({ length: 38 }, (_, i) => ({
      id:      i,
      text:    tokens[i % tokens.length],
      x:       Math.random() * 100,
      y:       Math.random() * 100,
      dur:     14 + Math.random() * 18,
      delay:   Math.random() * 12,
      opacity: 0.055 + Math.random() * 0.1,
      size:    10 + Math.random() * 4,
      driftX:  (Math.random() - 0.5) * 160,
      driftY:  -(60 + Math.random() * 140),
      // Colour-code by language roughly
      color:   ["#e8793a","#87ceeb","#4fa3d4","#9dc49d","rgba(245,200,66,.7)"][i % 5],
    }));
  });

  const [embers] = useState(() => {
    const symbols = ["{}", "[]", "()", "=>", "//", "/*", "*/", "++", "--", "??", "!!", "::", "->", "&&", "||"];
    return Array.from({ length: 20 }, (_, i) => ({
      id:    i,
      text:  symbols[i % symbols.length],
      x:     4 + Math.random() * 92,
      dur:   5 + Math.random() * 8,
      delay: Math.random() * 12,
      drift: (Math.random() - .5) * 100,
      rise:  420 + Math.random() * 320,
      size:  9 + Math.random() * 5,
      color: ["rgba(245,200,66,.55)", "rgba(232,121,58,.45)", "rgba(135,206,235,.4)", "rgba(79,163,212,.4)"][i % 4],
    }));
  });

  const onMouseMove = (e: React.MouseEvent) => {
    setMousePos({
      x: (e.clientX / window.innerWidth  - 0.5) * 2,
      y: (e.clientY / window.innerHeight - 0.5) * 2,
    });
  };

  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.1, ease: "easeOut" }}
      onMouseMove={onMouseMove}
    >
      {/* Ocean BG */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse at 50% 28%, rgba(30,107,158,.28) 0%, transparent 58%),
            radial-gradient(ellipse at 18% 82%, rgba(13,43,78,.85)   0%, transparent 48%),
            linear-gradient(180deg, #071525 0%, #0a1f3a 45%, #0d2b4e 100%)
          `,
        }}
      />

      {/* Scanline */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity:    0.22,
          background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,.1) 2px, rgba(0,0,0,.1) 4px)",
          animation:  "scanLine 10s linear infinite",
        }}
      />

      {/* ── Floating code tokens ── */}
      {codeTokens.map(t => (
        <motion.span
          key={t.id}
          className="absolute pointer-events-none select-none font-mono"
          style={{
            left:        `${t.x}%`,
            top:         `${t.y}%`,
            fontSize:    t.size,
            color:       t.color,
            opacity:     0,
            whiteSpace:  "nowrap",
            letterSpacing: "0.04em",
            // Monospace so code reads correctly
            fontFamily:  "'Courier New', 'Fira Code', monospace",
          }}
          animate={{
            opacity:   [0, t.opacity, t.opacity * 0.7, 0],
            x:         [0, t.driftX * 0.4, t.driftX],
            y:         [0, t.driftY * 0.5, t.driftY],
          }}
          transition={{
            duration:   t.dur,
            delay:      t.delay,
            repeat:     Infinity,
            ease:       "linear",
            repeatDelay: Math.random() * 4,
          }}
        >
          {t.text}
        </motion.span>
      ))}

      {/* ── Rising code symbols (embers) ── */}
      {embers.map(e => (
        <motion.span
          key={e.id}
          className="absolute pointer-events-none select-none font-mono"
          style={{
            left:       `${e.x}%`,
            bottom:     -28,
            fontSize:   e.size,
            color:      e.color,
            opacity:    0,
            whiteSpace: "nowrap",
            fontFamily: "'Courier New', 'Fira Code', monospace",
            letterSpacing: "0.04em",
          }}
          animate={{
            y:       [0, -e.rise],
            x:       [0, e.drift],
            opacity: [0, 0.75, 0.5, 0],
          }}
          transition={{ duration: e.dur, delay: e.delay, repeat: Infinity, ease: "easeOut" }}
        >
          {e.text}
        </motion.span>
      ))}

      {/* Mouse parallax glow */}
      <motion.div
        className="absolute pointer-events-none"
        style={{
          width: 1000, height: 340, borderRadius: "50%",
          background:   "radial-gradient(ellipse, rgba(245,200,66,.07) 0%, transparent 70%)",
          top: "50%", left: "50%", translateX: "-50%", translateY: "-50%",
        }}
        animate={{ x: mousePos.x * -28, y: mousePos.y * -18 }}
        transition={{ type: "spring", stiffness: 55, damping: 20 }}
      />

      {/* Ocean wave */}
      <div
        className="absolute bottom-0 left-0 pointer-events-none"
        style={{ width: "200%", animation: "waveScroll 11s linear infinite" }}
      >
        <svg viewBox="0 0 1440 110" preserveAspectRatio="none" style={{ width: "100%", height: 110 }}>
          <path fill="rgba(13,43,78,.52)" d="M0,55 C200,92 400,18 600,55 C800,92 1000,18 1200,55 C1310,76 1375,36 1440,55 L1440,110 L0,110 Z"/>
        </svg>
      </div>

      {/* ── Content ── */}
      <div
        className="relative z-10 flex flex-col items-center text-center w-full"
        style={{ maxWidth: 680, padding: "0 24px" }}
      >
        {/* Jolly Roger icon + pulse rings */}
        <div className="relative" style={{ marginBottom: 28 }}>
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              className="absolute rounded-full border pointer-events-none"
              style={{
                borderColor: `rgba(245,200,66,${0.28 - i * 0.08})`,
                top: "50%", left: "50%",
                width:      80 + i * 44, height: 80 + i * 44,
                marginLeft: -(40 + i * 22), marginTop: -(40 + i * 22),
              }}
              animate={{ scale: [1, 1.3], opacity: [0.55, 0] }}
              transition={{ duration: 2.6, delay: i * 0.85, repeat: Infinity, ease: "easeOut" }}
            />
          ))}
          <img
            src={department}
            alt="IT Department"
            style={{
              width:     108,
              height:    108,
              objectFit: "contain",
              filter:    "drop-shadow(0 0 12px rgba(245,200,66,.45)) brightness(1.05)",
            }}
          />
        </div>

        {/* Title */}
        <motion.h1
          style={{
            fontFamily:           "'Pirata One', cursive",
            fontSize:             "clamp(2.4rem, 6.5vw, 4.2rem)",
            lineHeight:           1.08,
            letterSpacing:        "0.05em",
            background:           `linear-gradient(135deg, ${DEEP_GOLD} 0%, ${GOLD} 38%, #fffde0 52%, ${GOLD} 68%, ${DEEP_GOLD} 100%)`,
            backgroundSize:       "200% auto",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor:  "transparent",
            backgroundClip:       "text",
            animation:            "shimmer 3.2s linear infinite",
            filter:               "drop-shadow(0 0 22px rgba(245,200,66,.52))",
          }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0  }}
          transition={{ delay: 0.22, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          IT Day Clue Hunt
        </motion.h1>

        {/* Gold ornamental divider */}
        <motion.div
          className="flex items-center w-full"
          style={{ maxWidth: 340, margin: "18px 0" }}
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 0.42, duration: 0.7, ease: "easeOut" }}
        >
          <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, transparent, ${DEEP_GOLD})` }} />
          <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, ${DEEP_GOLD}, transparent)` }} />
        </motion.div>

        {/* Lore */}
        <motion.p
          className="italic text-amber-100/60 leading-relaxed"
          style={{
            fontFamily:   "'IM Fell English', serif",
            fontSize:     "clamp(.88rem, 1.9vw, 1.08rem)",
            maxWidth:     480,
            marginBottom: 8,
          }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0  }}
          transition={{ delay: 0.58, duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
        >
          Four houses stand ready. 5 clues scattered across the realm.
          <br />
          Only the sharpest minds will crack the one piece.
        </motion.p>

        <motion.p
          className="italic text-amber-100/38"
          style={{
            fontFamily:   "'IM Fell English', serif",
            fontSize:     "clamp(.8rem, 1.5vw, .95rem)",
            marginBottom: 28,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.82, duration: 0.85 }}
        >
          Can your house claim glory before the others?
        </motion.p>

        {/* House chips */}
        <motion.div
          className="flex flex-wrap justify-center"
          style={{ gap: 10, marginBottom: 34 }}
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.08, delayChildren: 0.92 } } }}
        >
          {HOUSES.map(h => (
            <motion.div
              key={h.name}
              className="flex items-center rounded-full border cursor-default select-none text-white"
              style={{
                padding:     "6px 14px",
                gap:          8,
                borderColor: `${h.color}55`,
                background:  `${h.color}12`,
                // color:        h.color,
              }}
              variants={{ hidden: { opacity: 0, scale: 0.55, y: 14 }, visible: { opacity: 1, scale: 1, y: 0 } }}
              transition={{ type: "spring", stiffness: 200, damping: 16 }}
              whileHover={{ scale: 1.08, y: -3 }}
            >
              <img src={h.logo} alt={h.name} style={{ width: 20, height: 20, objectFit: "contain" }} />
              <span style={{ fontFamily: "'Cinzel', serif", fontSize: ".5rem", textTransform: "uppercase", letterSpacing: "0.2em" }}>
                {h.name}
              </span>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.88 }}
          animate={{ opacity: 1, y: 0,  scale: 1    }}
          transition={{ delay: 1.55, duration: 0.8, type: "spring", stiffness: 130, damping: 14 }}
        >
          <motion.button
            onClick={onStart}
            className="relative overflow-hidden rounded font-black uppercase text-stone-900 cursor-pointer border-0 outline-none"
            style={{
              padding:        "17px 56px",
              letterSpacing:  "0.26em",
              fontFamily:     "'Cinzel', serif",
              fontSize:       "clamp(.78rem, 1.5vw, .92rem)",
              background:     `linear-gradient(135deg, ${DEEP_GOLD} 0%, ${GOLD} 40%, #fffde0 55%, ${GOLD} 70%, ${DEEP_GOLD} 100%)`,
              backgroundSize: "200% auto",
              animation:      "shimmer 2.6s linear infinite",
              boxShadow:      "0 0 0 1px rgba(245,200,66,.32), 0 8px 32px rgba(245,200,66,.38), inset 0 2px 0 rgba(255,255,255,.22)",
            }}
            whileHover={{
              scale:     1.07,
              boxShadow: "0 0 0 1px rgba(245,200,66,.6), 0 16px 48px rgba(245,200,66,.58), inset 0 2px 0 rgba(255,255,255,.28)",
            }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 280, damping: 18 }}
          >
            {/* Shine sweep */}
            <motion.span
              className="absolute inset-0 pointer-events-none"
              style={{
                background:         "linear-gradient(108deg, transparent 32%, rgba(255,255,255,.48) 50%, transparent 68%)",
                backgroundSize:     "220% 100%",
                backgroundPosition: "220% 0",
              }}
              whileHover={{ backgroundPosition: "-220% 0" }}
              transition={{ duration: 0.58, ease: "easeInOut" }}
            />
            Begin the Hunt
          </motion.button>
        </motion.div>

      </div>
    </motion.div>
  );
}