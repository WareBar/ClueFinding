// @ts-nocheck

import { useState, useEffect, useRef } from "react";
import {
  DndContext, rectIntersection, PointerSensor, TouchSensor,
  KeyboardSensor, useSensor, useSensors, DragOverlay,
} from "@dnd-kit/core";
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates,
  useSortable, rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button }  from "@/components/ui/button";
import { Input }   from "@/components/ui/input";
import { Badge }   from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import api from "@/utils/api";

interface Star {
  id: number;
  left: number;
  top: number;
  size: number;
  opacity: number;
  dur: number;
  delay: number;
}

interface Bubble {
  id: number;
  left: number;
  size: number;
  dur: number;
  delay: number;
  drift: number;
}

interface ConfettiProps {
  x: number;
  color: string;
  size: number;
  dur: number;
  spin: number;
  drift: number;
  shape: "circle" | "square";
}


interface PhaseDotsProps {
  phase:string
}

// ─── Props Interface ───────────────────────────────────────────────────────────
interface ClueInputRowProps {
  index: number;
  placeholder: string;
  value: string;
  status: string,
  delay: number;
  inputRef: (el: HTMLInputElement | null) => void;
  onChange: (index: number, value: string) => void;
  onKeyDown: (e: KeyboardEvent<HTMLInputElement>, index: number) => void;
}

interface EnterPhaseProps {
  onVerified: (w)=>void;
}

interface PirateMapProps {
  items: { answer: string; id: string; label: string }[];
  mapProgress: number;
}

interface ShipSinkingProps {
  onDone: () => void;
}

interface SortableCardProps {
  item: { answer: string; id: string; label: string };
  position: number;
  isOverlay?: boolean;
}

interface OrderPhaseProps {
  verifiedClues: { answer: string; id: string; label: string }[];
  onSuccess: () => void;
  onReset: () => void;
}

interface VictoryDialogProps {
  open: boolean;
  onClose: () => void;
}

type Phase = "enter" | "order" | "victory";

interface VerifiedClue {
  id: string;
  answer: string;
  label: string;
}

// ─── Config ───────────────────────────────────────────────────────────────────
const CLUE_CONFIG = [
  { placeholder: "Clue 1…" },
  { placeholder: "Clue 2…" },
  { placeholder: "Clue 3…" },
  { placeholder: "Clue 4…" },
  { placeholder: "Clue 5…" },
];

const SUCCESS_MSG     = "Find the Professor with the Will of D. The One Piece is with him.";
const CONFETTI_COLORS = ["#f5c842","#e8793a","#2ecc71","#3498db","#e74c3c","#9b59b6","#f39c12"];
const CRIMSON_COLOR   = "#c0392b";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function shuffleClues(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

  function useStars(n = 110): Star[] {
    return useState(() =>
      Array.from({ length: n }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 68,
        size: 1 + Math.random() * 2.2,
        opacity: 0.15 + Math.random() * 0.55,
        dur: 2 + Math.random() * 4,
        delay: Math.random() * 6,
      }))
    )[0];
  }
  function useBubbles(n = 13): Bubble[] {
    return useState(() =>
      Array.from({ length: n }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        size: 5 + Math.random() * 16,
        dur: 6 + Math.random() * 10,
        delay: Math.random() * 8,
        drift: Math.random() * 60 - 30,
      }))
    )[0];
  } 



// ─── Global CSS ───────────────────────────────────────────────────────────────
const KF = `
  @import url('https://fonts.googleapis.com/css2?family=Pirata+One&family=Cinzel:wght@400;700;900&family=IM+Fell+English:ital@0;1&display=swap');
  @keyframes twinkle      { 0%,100%{opacity:.2;transform:scale(1)} 50%{opacity:1;transform:scale(1.6)} }
  @keyframes waveA        { to{transform:translateX(-50%)} }
  @keyframes waveB        { to{transform:translateX(-50%)} }
  @keyframes bubbleRise   { 0%{opacity:0;transform:translateY(0) translateX(0)} 10%{opacity:.6} 90%{opacity:.2} 100%{opacity:0;transform:translateY(-100vh) translateX(var(--drift))} }
  @keyframes skullDrift   { 0%,100%{transform:translateY(0) rotate(-5deg)} 50%{transform:translateY(-18px) rotate(5deg)} }
  @keyframes heroPulse    { 0%,100%{filter:drop-shadow(0 0 12px rgba(245,200,66,.4))} 50%{filter:drop-shadow(0 0 32px rgba(245,200,66,.85))} }
  @keyframes fadeDown     { from{opacity:0;transform:translateY(-28px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fadeUp       { from{opacity:0;transform:translateY(36px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fadeInLeft   { from{opacity:0;transform:translateX(-18px)} to{opacity:1;transform:translateX(0)} }
  @keyframes slidePhase   { from{opacity:0;transform:translateY(24px) scale(.97)} to{opacity:1;transform:translateY(0) scale(1)} }
  @keyframes shakeInput   { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-6px)} 40%{transform:translateX(6px)} 60%{transform:translateX(-4px)} 80%{transform:translateX(4px)} }
  @keyframes bouncePop    { 0%{transform:scale(0) rotate(-15deg)} 100%{transform:scale(1) rotate(0)} }
  @keyframes successIn    { 0%{transform:scale(.93);opacity:0} 60%{transform:scale(1.03)} 100%{transform:scale(1);opacity:1} }
  @keyframes errorWiggle  { 0%,100%{transform:translateX(0)} 15%{transform:translateX(-8px)} 30%{transform:translateX(8px)} 45%{transform:translateX(-5px)} 60%{transform:translateX(5px)} 75%{transform:translateX(-3px)} 90%{transform:translateX(3px)} }
  @keyframes confettiFall { 0%{opacity:1;transform:translateY(0) rotate(0) translateX(0)} 100%{opacity:0;transform:translateY(110vh) rotate(var(--spin)) translateX(var(--drift))} }
  @keyframes scrollOpen   { 0%{transform:scaleY(.06) scaleX(.45);opacity:0} 100%{transform:scaleY(1) scaleX(1);opacity:1} }
  @keyframes spinIn       { from{transform:scale(0) rotate(-360deg)} to{transform:scale(1) rotate(0)} }
  @keyframes pgGlow       { 0%,100%{box-shadow:0 0 6px rgba(245,200,66,.25)} 50%{box-shadow:0 0 16px rgba(245,200,66,.55)} }
  @keyframes shipSink     {
    0%   { transform: translateY(0)    rotate(0deg)   scale(1);   opacity: 1; }
    20%  { transform: translateY(6px)  rotate(-8deg)  scale(1.05);opacity: 1; }
    50%  { transform: translateY(30px) rotate(20deg)  scale(.9);  opacity: .8; }
    80%  { transform: translateY(70px) rotate(35deg)  scale(.65); opacity: .4; }
    100% { transform: translateY(110px) rotate(45deg) scale(.3);  opacity: 0; }
  }
  @keyframes ripple       { 0%{transform:scale(0);opacity:.7} 100%{transform:scale(3);opacity:0} }
  @keyframes mapReveal    { from{opacity:0;transform:scale(.97)} to{opacity:1;transform:scale(1)} }
  @keyframes routeDraw    { from{stroke-dashoffset:800} to{stroke-dashoffset:0} }
  @keyframes flagWave     { 0%,100%{transform:rotate(-5deg)} 50%{transform:rotate(5deg)} }
  @keyframes compassSpin  { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
`;

// ─── Ocean Background ─────────────────────────────────────────────────────────
function OceanBg({ stars, bubbles }) {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden"
      style={{ background:"radial-gradient(ellipse at 20% 80%,#0d2b4e 0%,transparent 50%),radial-gradient(ellipse at 80% 20%,#071525 0%,transparent 50%),linear-gradient(180deg,#071525 0%,#0a1f3a 50%,#0d2b4e 100%)" }}>
      {stars.map(s => (
        <div key={s.id} className="absolute rounded-full bg-white"
          style={{ left:`${s.left}%`,top:`${s.top}%`,width:s.size,height:s.size,
            opacity:s.opacity,animation:`twinkle ${s.dur}s ease-in-out ${s.delay}s infinite` }}/>
      ))}
      {([
        { top:"9%",   left:"5%",  fontSize:60, animDelay:0  },
        { top:"19%",  right:"8%", fontSize:40, animDelay:-5 },
        { bottom:"25%",left:"9%", fontSize:80, animDelay:-8 },
        { bottom:"14%",right:"4%",fontSize:52, animDelay:-3 },
      ] as const).map((d,i) => (
        <div key={i} className="absolute select-none pointer-events-none"
          style={{ fontSize:d.fontSize,opacity:.04,
            animation:`skullDrift ${15+i*3}s ease-in-out ${d.animDelay}s infinite`,
            top:("top" in d)?d.top:undefined, bottom:("bottom" in d)?d.bottom:undefined,
            left:("left" in d)?d.left:undefined, right:("right" in d)?d.right:undefined,
          }}>ADAM</div>
      ))}
      <div className="absolute bottom-0 left-0 w-[200%] h-40" style={{ animation:"waveA 8s linear infinite" }}>
        <svg width="100%" height="160" viewBox="0 0 1440 160" preserveAspectRatio="none">
          <path fill="rgba(13,43,78,.6)" d="M0,80 C180,130 360,30 540,80 C720,130 900,30 1080,80 C1260,130 1350,60 1440,80 L1440,160 L0,160 Z"/>
        </svg>
      </div>
      <div className="absolute bottom-0 left-0 w-[200%] h-28 opacity-50" style={{ animation:"waveB 13s linear infinite reverse" }}>
        <svg width="100%" height="120" viewBox="0 0 1440 120" preserveAspectRatio="none">
          <path fill="rgba(10,22,40,.7)" d="M0,60 C200,100 400,20 600,60 C800,100 1000,20 1200,60 C1320,80 1380,40 1440,60 L1440,120 L0,120 Z"/>
        </svg>
      </div>
      {bubbles.map(b => (
        <div key={b.id} className="absolute rounded-full"
          style={{ bottom:-50,left:`${b.left}%`,width:b.size,height:b.size,
            background:"radial-gradient(circle at 30% 30%,rgba(255,255,255,.28),rgba(30,107,158,.08))",
            border:"1px solid rgba(255,255,255,.13)","--drift":`${b.drift}px`,
            animation:`bubbleRise ${b.dur}s ease-in ${b.delay}s infinite` }}/>
      ))}
    </div>
  );
}

function ConfettiPiece({ x, color, size, dur, spin, drift, shape }: ConfettiProps) {
  return (
    <div
      className="fixed pointer-events-none"
      style={{
        top: -14,
        left: `${x}vw`,
        zIndex: 999,
        width: size,
        height: size,
        background: color,
        borderRadius: shape === "circle" ? "50%" : "2px",
        animation: `confettiFall ${dur}s ease-in forwards`,
        "--spin": `${spin}deg`,
        "--drift": `${drift}px`,
      } as React.CSSProperties}
    />
  );
}

function PhaseDots({ phase }:PhaseDotsProps) {
  const phases = ["enter","order","victory"];
  const cur = phases.indexOf(phase);
  return (
    <div className="flex items-center justify-center gap-2 mt-3">
      {phases.map((p,i) => (
        <div key={p} className="flex items-center gap-2">
          <div className="rounded-full transition-all duration-500"
            style={{ width:p===phase?10:7,height:p===phase?10:7,
              background:cur>i?"#f5c842":p===phase?"#f5c842":"rgba(245,200,66,.2)",
              boxShadow:p===phase?"0 0 10px rgba(245,200,66,.55)":"none" }}/>
          {i<phases.length-1 && (
            <div className="h-px w-6 transition-all duration-500"
              style={{ background:cur>i?"rgba(245,200,66,.6)":"rgba(245,200,66,.15)" }}/>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Phase 1 — Enter Clues ────────────────────────────────────────────────────
function ClueInputRow({ index, placeholder, value, onChange, onKeyDown, status, delay, inputRef }:ClueInputRowProps) {
  const isFilled  = value.length > 0;
  const isCorrect = status === "correct";
  const isWrong   = status === "wrong";
  return (
    <div className="flex items-center gap-3" style={{ animation:`fadeInLeft .45s ease-out ${delay}s both` }}>
      <div className={cn(
        "w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-sm transition-all duration-300 border",
        isCorrect ? "border-emerald-500 text-emerald-400 bg-emerald-500/15 shadow-[0_0_10px_rgba(46,204,113,.35)]"
        : isWrong  ? "border-red-500 text-red-400 bg-red-500/15"
        : isFilled ? "border-yellow-400 text-yellow-400 bg-yellow-400/15 shadow-[0_0_8px_rgba(245,200,66,.2)]"
        :            "border-yellow-400/20 text-yellow-400/70 bg-yellow-400/5"
      )} style={{ fontFamily:"'Pirata One',cursive",fontSize:".85rem" }}>
        {index + 1}
      </div>
      <Input ref={inputRef} value={value} placeholder={placeholder}
        autoComplete="off" autoCorrect="off" spellCheck={false}
        onChange={e => onChange(index, e.target.value)}
        onKeyDown={e => onKeyDown(e, index)}
        className={cn(
          "flex-1 bg-white/3 border text-amber-50 placeholder:text-amber-100/20 placeholder:italic placeholder:text-xs",
          "focus:ring-1 focus:ring-yellow-400/40 focus-visible:ring-1 focus-visible:ring-yellow-400/40",
          "transition-all duration-300 rounded-sm h-10",
          isCorrect ? "border-emerald-500/60 bg-emerald-500/5 shadow-[0_0_12px_rgba(46,204,113,.18)]"
          : isWrong  ? "border-red-500/50 bg-red-500/5"
          :            "border-yellow-400/15 focus:border-yellow-400/50",
        )}
        style={{ fontFamily:"'IM Fell English',serif",fontSize:".95rem",
          animation:isWrong?"shakeInput .4s ease":"none" }}
      />
    </div>
  );
}

function EnterPhase({ onVerified }:EnterPhaseProps) {
  const [submitting, setSubmitting] = useState(false);
  const [values,    setValues]    = useState(() => CLUE_CONFIG.map(() => ""));
  const [statuses,  setStatuses]  = useState(() => CLUE_CONFIG.map(() => "idle"));
  const [feedback,  setFeedback]  = useState({ type:"idle", msg:"" });
  const [validated, setValidated] = useState(false);
  const refs = useRef([]);

  const filledCount = values.filter(v => v.trim().length > 0).length;
  const allFilled   = filledCount === CLUE_CONFIG.length;
  const progress    = Math.round((filledCount / CLUE_CONFIG.length) * 100);

  const checkCluesAPI = async (vals) => {
    try {
      const res = await api.post("/clue/check_clue/", {
        clues: vals.map(v => v.trim())
      });

      const { correct_clues } = res.data;

      return vals.map(v => {
        const clue = v.trim().toLowerCase();
        if (!clue) return "idle";
        if (correct_clues.includes(clue)) return "correct";
        return "wrong";
      });

    } catch (err) {
      console.error(err);
      return vals.map(() => "wrong");
    }
  };

  const onChange = (idx, val) => {
    const next = values.map((v,i) => i===idx?val:v);
    setValues(next);

    // reset status when typing again
    if (validated) {
      setStatuses(CLUE_CONFIG.map(() => "idle"));
      setValidated(false);
    }
  };
  const onKeyDown = (e, idx) => {
    if (e.key==="Enter") {
      if (idx<CLUE_CONFIG.length-1) refs.current[idx+1]?.focus();
      else if (allFilled) doSubmit(values);
    }
  };
  const doSubmit = async (vals) => {
    if (submitting) return;

    setSubmitting(true);
    setValidated(true);

    const st = await checkCluesAPI(vals);
    setStatuses(st);

    if (st.every(s => s === "correct")) {
      setFeedback({ type: "success", msg: "All clues verified! Now arrange the route…" });

      setTimeout(() => {
        onVerified(vals.map((v, i) => ({
          id: `clue-${i}`,
          label: `Clue ${i+1}`,
          answer: v.trim().toLowerCase(),
        })));
      }, 900);

    } else {
      const cc = st.filter(s => s === "correct").length;
      setFeedback({
        type: "error",
        msg: `Wrong clues. Try again. (${cc}/${CLUE_CONFIG.length} correct)`
      });
    }

    setSubmitting(false);
  };
  const doReset = () => {
    setValues(CLUE_CONFIG.map(()=>""));
    setStatuses(CLUE_CONFIG.map(()=>"idle"));
    setFeedback({ type:"idle", msg:"" });
    setValidated(false);
    setTimeout(()=>refs.current[0]?.focus(), 50);
  };

  return (
    <div style={{ animation:"slidePhase .5s ease-out both" }}>
      <div className="text-center mb-6">
        <span className="text-amber-700/40 text-xs tracking-[4px]" style={{ fontFamily:"'Cinzel',serif" }}>──────</span>
        <span className="text-amber-600 uppercase tracking-[4px] text-xs mx-2" style={{ fontFamily:"'Cinzel',serif" }}>Enter the 5 Clues</span>
        <span className="text-amber-700/40 text-xs tracking-[4px]" style={{ fontFamily:"'Cinzel',serif" }}>──────</span>
      </div>
      <div className="mb-6 space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-yellow-400/50 uppercase tracking-[3px]" style={{ fontFamily:"'Cinzel',serif",fontSize:".6rem" }}>Progress</span>
          <Badge variant="outline" className="border-yellow-400/30 text-yellow-400 bg-yellow-400/5 px-2 py-0"
            style={{ fontFamily:"'Pirata One',cursive",fontSize:".95rem" }}>
            {filledCount} / {CLUE_CONFIG.length}
          </Badge>
        </div>
        <div className="h-1.5 w-full rounded-full bg-white/5 border border-yellow-400/10 overflow-hidden">
          <div className="h-full rounded-full transition-all duration-500"
            style={{ width:`${progress}%`,background:"linear-gradient(90deg,#1e6b9e,#f5c842)",
              boxShadow:"0 0 8px rgba(245,200,66,.4)",animation:progress>0?"pgGlow 2s ease-in-out infinite":"none" }}/>
        </div>
      </div>
      <div className="flex flex-col gap-3.5 mb-6">
        {CLUE_CONFIG.map((c,i) => (
          <ClueInputRow key={`row-${i}`} index={i} placeholder={c.placeholder}
            value={values[i]} onChange={onChange} onKeyDown={onKeyDown}
            status={statuses[i]} delay={.05+i*.09}
            inputRef={el=>{ refs.current[i]=el; }}/>
        ))}
      </div>
      <div className="h-px w-full mb-5" style={{ background:"linear-gradient(90deg,transparent,rgba(245,200,66,.18),transparent)" }}/>
      <div className="flex gap-3 mb-5">
      <Button
        disabled={!allFilled || submitting}
        onClick={() => doSubmit(values)}
        className={cn(
          "flex-1 tracking-widest uppercase text-xs font-bold rounded-sm h-11",
          submitting
            ? "bg-stone-700 text-stone-400 cursor-not-allowed"
            : allFilled
            ? "bg-gradient-to-r from-amber-700 via-yellow-400 to-amber-700 text-stone-900"
            : "bg-stone-800 text-stone-600 cursor-not-allowed"
        )}
      >
        {submitting ? "Checking clues..." : "Submit"}
      </Button>
        <Button variant="outline" onClick={doReset}
          className="flex-1 tracking-widest uppercase text-xs h-11 rounded-sm bg-transparent border-amber-100/15 text-amber-100/45 hover:border-amber-100/40 hover:text-amber-100 hover:bg-transparent transition-all"
          style={{ fontFamily:"'Cinzel',serif" }}>
          ↺ Reset
        </Button>
      </div>
      <Card className={cn("border rounded-sm transition-all duration-300 min-h-20 flex items-center justify-center",
        feedback.type==="success"?"bg-emerald-500/[.07] border-emerald-500/30"
        :feedback.type==="error"?"bg-red-500/[.07] border-red-500/30"
        :"bg-white/2 border-white/6",
        feedback.type==="success"?"animate-[successIn_.6s_ease-out]"
        :feedback.type==="error"?"animate-[errorWiggle_.5s_ease-out]":"",
      )}>
        <CardContent className="p-4 text-center">
          {feedback.type==="idle"
            ?<p className="text-amber-100/18 tracking-[2px] uppercase" style={{ fontFamily:"'Cinzel',serif",fontSize:".58rem" }}>AWAITING YOUR CLUES…</p>
            :<div className="space-y-1.5">
                <div className="text-3xl" style={{ animation:"bouncePop .6s cubic-bezier(.34,1.56,.64,1) both" }}>
                  {feedback.type==="success"?"🎉":"❌"}
                </div>
                <p className={cn("italic text-sm leading-relaxed",feedback.type==="success"?"text-teal-300":"text-red-300")}
                  style={{ fontFamily:"'IM Fell English',serif" }}>
                  {feedback.msg}
                </p>
              </div>
          }
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Pirate Map ───────────────────────────────────────────────────────────────
const MAP_STOPS = [
  { x: 60,  y: 160 },
  { x: 200, y: 80  },
  { x: 340, y: 155 },
  { x: 480, y: 70  },
  { x: 620, y: 148 },
  { x: 760, y: 65  },
  { x: 880, y: 155 },
];

function PirateMap({ items, mapProgress }:PirateMapProps) {
  const revealedStops = Math.round(mapProgress * (MAP_STOPS.length - 1)) + 1;
  return (
    <div className="relative w-full rounded-xl overflow-hidden"
      style={{
        animation:"mapReveal .5s ease-out both",
        background:"linear-gradient(160deg,#0a1628 0%,#0d1f3a 50%,#081220 100%)",
        border:"1.5px solid rgba(201,149,42,.4)",
        boxShadow:"inset 0 0 60px rgba(0,0,0,.6), 0 0 32px rgba(201,149,42,.1)",
      }}>
      <div className="absolute inset-0 pointer-events-none opacity-[.06] w-full"
        style={{
          backgroundImage:"linear-gradient(rgba(245,200,66,.3) 1px,transparent 1px),linear-gradient(90deg,rgba(245,200,66,.3) 1px,transparent 1px)",
          backgroundSize:"48px 48px",
        }}/>
      <svg viewBox="0 0 960 300" width="100%" height="300" style={{ display:"block" }}>
        <defs>
          <filter id="glow-gold"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          <marker id="arrowhead" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill="rgba(245,200,66,.85)"/>
          </marker>
          <radialGradient id="islandGrad" cx="50%" cy="35%" r="60%">
            <stop offset="0%" stopColor="#4a7c59"/>
            <stop offset="60%" stopColor="#2d5e3a"/>
            <stop offset="100%" stopColor="#1a3d22"/>
          </radialGradient>
          <radialGradient id="harborGrad" cx="50%" cy="35%" r="60%">
            <stop offset="0%" stopColor="#7a5c2e"/>
            <stop offset="100%" stopColor="#4a3418"/>
          </radialGradient>
          <linearGradient id="oceanBg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(8,24,48,.92)"/>
            <stop offset="100%" stopColor="rgba(5,15,35,.96)"/>
          </linearGradient>
        </defs>

        <rect width="960" height="300" fill="url(#oceanBg)" rx="8"/>

        {/* Wave lines */}
        {[50,100,150,200,250].map(y => (
          <path key={y} d={`M0,${y} Q120,${y-10} 240,${y} Q360,${y+10} 480,${y} Q600,${y-10} 720,${y} Q840,${y+10} 960,${y}`}
            fill="none" stroke="rgba(30,107,158,.1)" strokeWidth="1.5"/>
        ))}

        {/* Faint dotted full route */}
        <polyline points={MAP_STOPS.map(s=>`${s.x},${s.y}`).join(" ")}
          fill="none" stroke="rgba(245,200,66,.1)" strokeWidth="2" strokeDasharray="7 7"/>

        {/* Revealed route */}
        {mapProgress > 0 && (
          <polyline
            points={MAP_STOPS.slice(0, revealedStops+1).map(s=>`${s.x},${s.y}`).join(" ")}
            fill="none" stroke="rgba(245,200,66,.75)" strokeWidth="3"
            strokeDasharray="800" strokeDashoffset="0"
            style={{ animation:"routeDraw 1.2s ease-out forwards" }}
            markerEnd="url(#arrowhead)"/>
        )}

        {/* Clue islands (stops 1–5) */}
        {MAP_STOPS.slice(1,6).map((pos,i) => {
          const clueItem  = items[i];
          const isCorrect = false;
          const isWrong = false;
          const dotColor  = isCorrect?"#2ecc71":isWrong?"#e74c3c":"rgba(245,200,66,.85)";
          return (
            <g key={i} filter="url(#glow-gold)">
              {/* Shadow */}
              <ellipse cx={pos.x} cy={pos.y+6} rx="30" ry="14" fill="rgba(0,0,0,.35)"/>
              {/* Island */}
              <ellipse cx={pos.x} cy={pos.y} rx="28" ry="14" fill="url(#islandGrad)" stroke="rgba(201,149,42,.55)" strokeWidth="1.4"/>
              {/* Trees */}
              <circle cx={pos.x-10} cy={pos.y-10} r="6" fill="rgba(46,120,60,.85)"/>
              <circle cx={pos.x+8}  cy={pos.y-13} r="7" fill="rgba(38,100,50,.9)"/>
              <circle cx={pos.x}    cy={pos.y-7}  r="5" fill="rgba(55,140,70,.75)"/>
              {/* Dot */}
              <circle cx={pos.x} cy={pos.y} r="6" fill={dotColor}
                style={{ filter:`drop-shadow(0 0 8px ${dotColor})` }}/>
              {/* Number */}
              <text x={pos.x} y={pos.y-28} textAnchor="middle"
                style={{ fontFamily:"'Pirata One',cursive",fontSize:15,fill:"rgba(245,200,66,.95)",fontWeight:"bold" }}>
                {i+1}
              </text>
              {/* Answer */}
              {clueItem && (
                <text x={pos.x} y={pos.y+36} textAnchor="middle"
                  style={{ fontFamily:"'Cinzel',serif",fontSize:10,letterSpacing:"0.06em",
                    fill:isCorrect?"rgba(46,204,113,.95)":isWrong?"rgba(231,76,60,.95)":"rgba(245,200,66,.8)",
                    textTransform:"uppercase" }}>
                  {clueItem.answer}
                </text>
              )}
            </g>
          );
        })}

        {/* Harbour / START */}
        <g transform={`translate(${MAP_STOPS[0].x},${MAP_STOPS[0].y})`}>
          <ellipse cx="0" cy="6" rx="24" ry="11" fill="rgba(0,0,0,.35)"/>
          <ellipse cx="0" cy="0" rx="22" ry="10" fill="url(#harborGrad)" stroke="rgba(201,149,42,.6)" strokeWidth="1.4"/>
          <line x1="0" y1="-10" x2="0" y2="-34" stroke="#8B6914" strokeWidth="2.5"/>
          <path d="M0,-34 L18,-26 L0,-18 Z" fill={CRIMSON_COLOR}
            style={{ animation:"flagWave 1.8s ease-in-out infinite",transformOrigin:"0px -26px" }}/>
          <text x="0" y="24" textAnchor="middle"
            style={{ fontFamily:"'Cinzel',serif",fontSize:9,fill:"rgba(245,200,66,.75)",letterSpacing:"0.12em" }}>
            START
          </text>
        </g>

        {/* ONE PIECE / END */}
        <g transform={`translate(${MAP_STOPS[6].x},${MAP_STOPS[6].y})`}>
          <ellipse cx="0" cy="6" rx="24" ry="11" fill="rgba(0,0,0,.35)"/>
          <ellipse cx="0" cy="0" rx="22" ry="10" fill="url(#islandGrad)" stroke="rgba(245,200,66,.65)" strokeWidth="1.8"/>
          <text x="0" y="5" textAnchor="middle" style={{ fontSize:16,fill:"rgba(245,200,66,.85)" }}>☠</text>
          <text x="0" y="26" textAnchor="middle"
            style={{ fontFamily:"'Cinzel',serif",fontSize:9,fill:"rgba(245,200,66,.75)",letterSpacing:"0.12em" }}>
            ONE PIECE
          </text>
        </g>

        {/* Compass rose */}
        <g transform="translate(920,258)">
          <circle cx="0" cy="0" r="22" fill="rgba(5,18,38,.88)" stroke="rgba(201,149,42,.5)" strokeWidth="1.4"/>
          <circle cx="0" cy="0" r="3" fill="rgba(245,200,66,.75)"/>
          <line x1="0" y1="-17" x2="0" y2="-6" stroke="rgba(245,200,66,.65)" strokeWidth="1.2"/>
          <line x1="0" y1="6"   x2="0" y2="17"  stroke="rgba(245,200,66,.45)" strokeWidth="1.2"/>
          <line x1="-17" y1="0" x2="-6" y2="0"  stroke="rgba(245,200,66,.45)" strokeWidth="1.2"/>
          <line x1="6"   y1="0" x2="17"  y2="0" stroke="rgba(245,200,66,.45)" strokeWidth="1.2"/>
          <text x="0"   y="-20" textAnchor="middle" style={{ fontFamily:"'Cinzel',serif",fontSize:8,fill:"rgba(245,200,66,.9)" }}>N</text>
          <text x="0"   y="28"  textAnchor="middle" style={{ fontFamily:"'Cinzel',serif",fontSize:7,fill:"rgba(245,200,66,.5)" }}>S</text>
          <text x="-24" y="3"   textAnchor="middle" style={{ fontFamily:"'Cinzel',serif",fontSize:7,fill:"rgba(245,200,66,.5)" }}>W</text>
          <text x="24"  y="3"   textAnchor="middle" style={{ fontFamily:"'Cinzel',serif",fontSize:7,fill:"rgba(245,200,66,.5)" }}>E</text>
        </g>

        {/* Banner */}
        <g transform="translate(480,22)">
          <rect x="-88" y="-11" width="176" height="24" rx="4"
            fill="rgba(10,20,40,.8)" stroke="rgba(201,149,42,.38)" strokeWidth="1"/>
          <text x="0" y="6" textAnchor="middle"
            style={{ fontFamily:"'Cinzel',serif",fontSize:10,fill:"rgba(245,200,66,.78)",letterSpacing:"0.16em" }}>
            GRAND LINE ROUTE
          </text>
        </g>
      </svg>
    </div>
  );
}

// ─── Ship Sinking ─────────────────────────────────────────────────────────────
function ShipSinking({ onDone }:ShipSinkingProps) {
  useEffect(() => {
    const t = setTimeout(onDone, 2200);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div className="relative flex flex-col items-center justify-center py-8 overflow-hidden"
      style={{ minHeight:160 }}>
      <div className="absolute bottom-0 left-0 right-0 h-16"
        style={{ background:"linear-gradient(180deg,transparent,rgba(13,43,78,.7))" }}/>
      {[0,0.3,0.6].map((delay,i) => (
        <div key={i} className="absolute rounded-full border border-blue-400/30"
          style={{ width:60+i*30,height:20+i*10,bottom:24,
            animation:`ripple 1.5s ease-out ${delay+0.8}s both` }}/>
      ))}
      <div style={{ animation:"shipSink 2s ease-in forwards" }}>
        <svg width="80" height="60" viewBox="0 0 80 60" fill="none">
          <path d="M10,35 Q40,45 70,35 L65,50 Q40,58 15,50 Z" fill="#8B4513" stroke="rgba(201,149,42,.6)" strokeWidth="1.5"/>
          <rect x="18" y="28" width="44" height="8" fill="#A0522D" rx="1"/>
          <line x1="40" y1="8" x2="40" y2="32" stroke="#6B3A2A" strokeWidth="2.5"/>
          <path d="M41,10 L58,20 L41,30 Z" fill="rgba(242,228,184,.85)" stroke="rgba(201,149,42,.4)" strokeWidth="1"/>
          <text x="48" y="22" style={{ fontSize:8,fill:"#1a0a00" }}>☠</text>
          <path d="M40,8 L52,12 L40,16 Z" fill={CRIMSON_COLOR}/>
          <path d="M8,38 Q20,34 32,38 Q44,42 56,38 Q68,34 72,38" stroke="rgba(30,150,200,.5)" strokeWidth="1.5" fill="none"/>
        </svg>
      </div>
      <p className="mt-3 uppercase tracking-[4px] text-red-400"
        style={{ fontFamily:"'Pirata One',cursive",fontSize:"1rem",
          animation:"bouncePop .4s cubic-bezier(.34,1.56,.64,1) .6s both",
          textShadow:"0 0 12px rgba(231,76,60,.5)" }}>
        Sunk!
      </p>
      <p className="italic text-amber-100/40 text-xs mt-1"
        style={{ fontFamily:"'IM Fell English',serif",animation:"bouncePop .4s ease .9s both" }}>
        Wrong route… back to the harbor.
      </p>
    </div>
  );
}

// ─── Sortable Card ────────────────────────────────────────────────────────────
function SortableCard({ item, position, isOverlay = false }:SortableCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id:item.id });

  const transformStr = isOverlay
    ? undefined
    : CSS.Transform.toString(transform);

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={cn(
        "flex flex-col items-center gap-2 rounded-lg border select-none flex-shrink-0",
        "transition-colors duration-150",
        isDragging && !isOverlay
          ? "opacity-20 scale-95 cursor-grabbing"
          : "cursor-grab",
        isOverlay
          ? "shadow-[0_20px_60px_rgba(0,0,0,.8),0_0_32px_rgba(245,200,66,.35)] cursor-grabbing border-yellow-400/80 bg-stone-900/95"
          : "border-yellow-400/30 bg-white/[.04] hover:border-yellow-400/60 hover:bg-white/[.07]",
      )}
      style={{
        transform: transformStr,
        transition: isOverlay ? undefined : transition,
        touchAction: "none",
        userSelect:  "none",
        padding:     "18px 14px",
        width:       "clamp(100px, 17vw, 140px)",
        minHeight:   110,
      }}
    >
      {/* Grip */}
      <div className="flex gap-1 opacity-20 pointer-events-none">
        {[0,1,2,3,4].map(c=><div key={c} className="w-1 h-1 rounded-full bg-yellow-400"/>)}
      </div>
      {/* Position number */}
      <span className="text-yellow-400/50 leading-none"
        style={{ fontFamily:"'Pirata One',cursive",fontSize:"1rem" }}>
        {position+1}
      </span>
      {/* Label badge */}
      <Badge variant="outline"
        className="border-yellow-400/25 text-amber-600 bg-amber-400/5 text-[.5rem] tracking-widest uppercase w-full justify-center pointer-events-none"
        style={{ fontFamily:"'Cinzel',serif" }}>
        {item.label}
      </Badge>
      {/* Answer */}
      <span className="italic text-amber-100 text-center leading-snug pointer-events-none font-medium"
        style={{ fontFamily:"'IM Fell English',serif",fontSize:"1rem",
          textShadow:"0 1px 8px rgba(0,0,0,.6)",maxWidth:120,wordBreak:"break-word" }}>
        {item.answer}
      </span>
    </div>
  );
}

// ─── Phase 2 — Order Phase (full-page, no card wrapper) ──────────────────────
function OrderPhase({ verifiedClues, onSuccess, onReset }:OrderPhaseProps) {
  const [items,      setItems]      = useState(()=>shuffleClues(verifiedClues));
  const [checking,   setChecking]   = useState(false);
  const [sinking,    setSinking]    = useState(false);
  const [activeItem, setActiveItem] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor,  { activationConstraint:{ distance:4 } }),
    useSensor(TouchSensor,    { activationConstraint:{ delay:100,tolerance:5 } }),
    useSensor(KeyboardSensor, { coordinateGetter:sortableKeyboardCoordinates }),
  );

  const handleDragStart = ({ active }) =>
    setActiveItem(items.find(i=>i.id===active.id)||null);

  const handleDragEnd = ({ active, over }) => {
    setActiveItem(null);
    if (!over||active.id===over.id) return;
    setItems(prev=>{
      const oi=prev.findIndex(i=>i.id===active.id);
      const ni=prev.findIndex(i=>i.id===over.id);
      return arrayMove(prev,oi,ni);
    });
  };

  const checkOrder = async () => {
    if (checking) return;

    setChecking(true);

    try {
      const res = await api.post("/clue/check_order/", {
        clues: items.map(i => i.answer)
      });

      const { is_correct_order } = res.data;

      if (is_correct_order) {
        setTimeout(onSuccess, 700);
      } else {
        setSinking(true);
      }

    } catch (err) {
      console.error(err);
      setSinking(true);
    } finally {
      setChecking(false);
    }
  };

  const handleSinkDone = () => {
    setSinking(false);
    setChecking(false);
    setItems(shuffleClues(verifiedClues));
  };

  const mapProgress = 0;

  return (
    <div className="w-full" style={{ animation:"slidePhase .5s ease-out both" }}>

      {/* Phase header */}
      <div className="text-center mb-5">
        <p className="text-yellow-400 tracking-widest mb-1"
          style={{ fontFamily:"'Pirata One',cursive",fontSize:"1.2rem" }}>
          Phase II
        </p>
        <p className="text-yellow-400/55 uppercase tracking-[4px]"
          style={{ fontFamily:"'Cinzel',serif",fontSize:".65rem" }}>
          Chart the Route — Drag to Order
        </p>
      </div>

      {/* Map — full width, taller */}
      <div className="mb-6">
        <PirateMap items={items} mapProgress={mapProgress}/>
      </div>

      {sinking && <ShipSinking onDone={handleSinkDone}/>}

      {!sinking && (
        <>
          <DndContext
            sensors={sensors}
            collisionDetection={rectIntersection}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={items.map(i=>i.id)} strategy={rectSortingStrategy}>
              <div className="flex flex-wrap gap-3 mb-6 justify-center">
                {items.map((item,i) => (
                  <SortableCard key={item.id} item={item} position={i}/>
                ))}
              </div>
            </SortableContext>

            <DragOverlay
              adjustScale={false}
              dropAnimation={{ duration:140,easing:"cubic-bezier(.18,.67,.6,1.22)" }}
            >
              {activeItem && (
                <SortableCard
                  item={activeItem}
                  position={items.findIndex(i=>i.id===activeItem.id)}
                  isOverlay
                />
              )}
            </DragOverlay>
          </DndContext>

          <div className="h-px w-full mb-5"
            style={{ background:"linear-gradient(90deg,transparent,rgba(245,200,66,.2),transparent)" }}/>

          <div className="flex gap-3">
          <Button
            onClick={checkOrder}
            disabled={checking}
            className={cn(
              "flex-1 tracking-widest uppercase text-xs font-bold rounded-sm h-12 transition-all duration-300",
              checking
                ? "bg-stone-700 text-stone-400 cursor-not-allowed"
                : "bg-gradient-to-r from-amber-700 via-yellow-400 to-amber-700 text-stone-900"
            )}
          >
            {checking ? "Confirming route..." : "Confirm Route"}
          </Button>
            <Button variant="outline" onClick={onReset}
              className="flex-1 tracking-widest uppercase text-xs h-12 rounded-sm bg-transparent border-amber-100/15 text-amber-100/45 hover:border-amber-100/40 hover:text-amber-100 hover:bg-transparent transition-all"
              style={{ fontFamily:"'Cinzel',serif" }}>
              ↺ Start Over
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Victory Dialog ───────────────────────────────────────────────────────────
function VictoryDialog({ open, onClose }:VictoryDialogProps) {
  return (
    <Dialog open={open} onOpenChange={v=>!v&&onClose()}>
      <DialogContent
        className="max-w-md border-0 p-0 overflow-hidden bg-transparent shadow-none [&>button]:hidden"
        style={{ animation:open?"scrollOpen .8s cubic-bezier(.34,1.4,.64,1) both":"none" }}>
        <div className="relative rounded-lg overflow-hidden"
          style={{ background:"linear-gradient(160deg,#3d2b1f,#2a1a0e)",
            border:"3px solid #f5c842",
            boxShadow:"0 0 80px rgba(245,200,66,.45),inset 0 0 40px rgba(0,0,0,.4)" }}>
          <div className="absolute top-0 left-0 right-0 h-2"
            style={{ background:"linear-gradient(90deg,#c9952a,#f5c842,#c9952a)" }}/>
          <div className="absolute bottom-0 left-0 right-0 h-2"
            style={{ background:"linear-gradient(90deg,#c9952a,#f5c842,#c9952a)" }}/>
          <div className="px-12 py-12 text-center">
            <DialogHeader className="space-y-1 mb-0">
              <DialogTitle className="text-yellow-400 text-3xl tracking-wider leading-tight"
                style={{ fontFamily:"'Pirata One',cursive",textShadow:"0 0 30px rgba(245,200,66,.65)" }}>
                Route Confirmed!
              </DialogTitle>
            </DialogHeader>
            <div className="h-px my-4" style={{ background:"linear-gradient(90deg,transparent,rgba(245,200,66,.3),transparent)" }}/>
            <p className="italic text-amber-100 text-base leading-relaxed mb-2"
              style={{ fontFamily:"'IM Fell English',serif",textShadow:"0 1px 8px rgba(0,0,0,.5)" }}>
              {SUCCESS_MSG}
            </p>
            <p className="uppercase tracking-[3px] mb-7"
              style={{ fontFamily:"'Cinzel',serif",fontSize:".55rem",color:"rgba(245,200,66,.35)" }}>
              IT Day 2026 — Clue Hunt Complete
            </p>
            <Button onClick={onClose}
              className="w-full tracking-widest uppercase text-xs font-bold rounded-sm h-11 border-0 bg-gradient-to-r from-amber-700 via-yellow-400 to-amber-700 text-stone-900 shadow-[0_4px_20px_rgba(245,200,66,.28)] hover:-translate-y-0.5 transition-all duration-300"
              style={{ fontFamily:"'Cinzel',serif" }}>
              Claim Victory
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function ClueFinder() {
  const [phase, setPhase] = useState<Phase>("enter");
  const [verifiedClues, setVerifiedClues] = useState<VerifiedClue[] | null>(null);
  const [showVictory,   setShowVictory]   = useState(false);
  const [confetti, setConfetti] = useState<ConfettiProps[]>([]);
  const stars   = useStars();
  const bubbles = useBubbles();

  useEffect(()=>{
    if (document.getElementById("op-kf")) return;
    const s=document.createElement("style");
    s.id="op-kf"; s.textContent=KF;
    document.head.appendChild(s);
  },[]);

  const launchConfetti = () => {
    const pieces = Array.from({length:100},(_,i)=>({
      id:Date.now()+i, x:Math.random()*100,
      color:CONFETTI_COLORS[Math.floor(Math.random()*CONFETTI_COLORS.length)],
      size:6+Math.random()*8, dur:1.5+Math.random()*2,
      spin:Math.random()*720-360, drift:Math.random()*200-100,
      shape:Math.random()>.5?"circle":"square",
    }));
    setConfetti(pieces);
    setTimeout(()=>setConfetti([]),4000);
  };

  const handleVerified     = (v)=>{ setVerifiedClues(v); setPhase("order"); };
  const handleSuccess      = () =>{ launchConfetti(); setShowVictory(true); setPhase("victory"); };
  const handleVictoryClose = () =>{ setShowVictory(false); handleReset(); };
  const handleReset        = () =>{ setPhase("enter"); setVerifiedClues(null); };

  const subtitles: Record<string, string> = {
    enter: "Enter clues",
    order: "Arrange clues",
    victory: "You win!",
  };

{subtitles[phase]}
  const isOrderPhase = phase==="order"||phase==="victory";

  return (
    <div className="min-h-screen relative overflow-x-hidden" style={{ background:"#071525" }}>
      <OceanBg stars={stars} bubbles={bubbles}/>
      {confetti.map(c=><ConfettiPiece key={c.id} {...c}/>)}

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-start px-5 py-10">

        {/* Header */}
        <div className="text-center mb-7 w-full" style={{ animation:"fadeDown .8s ease-out both" }}>
          <h1 className="text-yellow-400 leading-tight tracking-wider"
            style={{ fontFamily:"'Pirata One',cursive",
              fontSize:"clamp(1.9rem,5vw,3.2rem)",
              textShadow:"0 0 30px rgba(245,200,66,.5),2px 4px 0 #1a0a00" }}>
            IT Day Clue Hunt
          </h1>
          <p className="text-yellow-400/55 uppercase tracking-[5px] mt-1.5"
            style={{ fontFamily:"'Cinzel',serif",fontSize:".68rem" }}>
            {subtitles[phase]}
          </p>
          <PhaseDots phase={phase}/>
        </div>

        {/* ── Enter phase: contained card ── */}
        {phase==="enter" && (
          <Card className="w-full max-w-[640px] relative border border-yellow-400/22 rounded bg-transparent"
            style={{
              background:"linear-gradient(135deg,rgba(18,40,70,.97) 0%,rgba(10,22,40,.99) 100%)",
              boxShadow:"0 0 0 1px rgba(245,200,66,.08),0 0 40px rgba(0,0,0,.6),0 0 80px rgba(245,200,66,.04),inset 0 1px 0 rgba(245,200,66,.12)",
              animation:"fadeUp .8s ease-out .2s both",
            }}>
            <div className="absolute top-2 right-3.5 w-5 h-5 border-t-2 border-r-2 border-yellow-400/38"/>
            <div className="absolute bottom-2 left-3.5 w-5 h-5 border-b-2 border-l-2 border-yellow-400/38"/>
            <CardContent className="p-8 pt-7">
              <EnterPhase onVerified={handleVerified}/>
            </CardContent>
          </Card>
        )}

        {/* ── Order / victory phase: full-width, no card ── */}
        {isOrderPhase && verifiedClues && (
          <div className="w-full max-w-5xl" style={{ animation:"fadeUp .6s ease-out both" }}>
            <OrderPhase
              verifiedClues={verifiedClues}
              onSuccess={handleSuccess}
              onReset={handleReset}
            />
          </div>
        )}
      </div>

      <VictoryDialog open={showVictory} onClose={handleVictoryClose}/>
    </div>
  );
}