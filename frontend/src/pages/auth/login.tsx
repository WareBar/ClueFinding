import { useState, useEffect } from "react";
import { Button }   from "@/components/ui/button";
import { Input }    from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth }     from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast }       from "sonner";
import { Loader2Icon, Anchor } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";

// ─── Shared keyframe / font CSS (mirrors ClueFinder's KF block) ──────────────
const KF = `
  @import url('https://fonts.googleapis.com/css2?family=Pirata+One&family=Cinzel:wght@400;700;900&family=IM+Fell+English:ital@0;1&display=swap');

  @keyframes twinkle    { 0%,100%{opacity:.2;transform:scale(1)} 50%{opacity:1;transform:scale(1.6)} }
  @keyframes waveA      { to{transform:translateX(-50%)} }
  @keyframes waveB      { to{transform:translateX(-50%)} }
  @keyframes bubbleRise { 0%{opacity:0;transform:translateY(0) translateX(0)} 10%{opacity:.6} 90%{opacity:.2} 100%{opacity:0;transform:translateY(-100vh) translateX(var(--drift))} }
  @keyframes skullDrift { 0%,100%{transform:translateY(0) rotate(-5deg)} 50%{transform:translateY(-18px) rotate(5deg)} }
  @keyframes heroPulse  { 0%,100%{filter:drop-shadow(0 0 12px rgba(245,200,66,.4))} 50%{filter:drop-shadow(0 0 32px rgba(245,200,66,.85))} }
  @keyframes fadeDown   { from{opacity:0;transform:translateY(-28px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fadeUp     { from{opacity:0;transform:translateY(36px)} to{opacity:1;transform:translateY(0)} }
  @keyframes shakeInput { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-6px)} 40%{transform:translateX(6px)} 60%{transform:translateX(-4px)} 80%{transform:translateX(4px)} }
  @keyframes fadeInLeft { from{opacity:0;transform:translateX(-18px)} to{opacity:1;transform:translateX(0)} }
  @keyframes slidePhase { from{opacity:0;transform:translateY(24px) scale(.97)} to{opacity:1;transform:translateY(0) scale(1)} }
`;

// ─── Static star / bubble data ────────────────────────────────────────────────
const STARS = Array.from({ length: 110 }, (_, i) => ({
  id:      i,
  left:    Math.random() * 100,
  top:     Math.random() * 68,
  size:    1 + Math.random() * 2.2,
  opacity: 0.15 + Math.random() * 0.55,
  dur:     2 + Math.random() * 4,
  delay:   Math.random() * 6,
}));

const BUBBLES = Array.from({ length: 13 }, (_, i) => ({
  id:    i,
  left:  Math.random() * 100,
  size:  5 + Math.random() * 16,
  dur:   6 + Math.random() * 10,
  delay: Math.random() * 8,
  drift: Math.random() * 60 - 30,
}));

// ─── Ocean Background (identical to ClueFinder) ───────────────────────────────
function OceanBg() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden"
      style={{ background:"radial-gradient(ellipse at 20% 80%,#0d2b4e 0%,transparent 50%),radial-gradient(ellipse at 80% 20%,#071525 0%,transparent 50%),linear-gradient(180deg,#071525 0%,#0a1f3a 50%,#0d2b4e 100%)" }}>

      {STARS.map(s => (
        <div key={s.id} className="absolute rounded-full bg-white"
          style={{ left:`${s.left}%`, top:`${s.top}%`, width:s.size, height:s.size,
            opacity:s.opacity, animation:`twinkle ${s.dur}s ease-in-out ${s.delay}s infinite` }}/>
      ))}

      {[
        { t:"9%",  l:"5%",  sz:60, dl:0  },
        { t:"19%", r:"8%",  sz:40, dl:-5 },
        { b:"25%", l:"9%",  sz:80, dl:-8 },
        { b:"14%", r:"4%",  sz:52, dl:-3 },
      ].map((d, i) => (
        <div key={i} className="absolute select-none pointer-events-none"
          style={{ fontSize:d.sz, opacity:.04,
            animation:`skullDrift ${15+i*3}s ease-in-out ${d.dl}s infinite`,
            ...(d.t?{top:d.t}:{}), ...(d.b?{bottom:d.b}:{}),
            ...(d.l?{left:d.l}:{}), ...(d.r?{right:d.r}:{}) }}>☠</div>
      ))}

      <div className="absolute bottom-0 left-0 w-[200%] h-40"
        style={{ animation:"waveA 8s linear infinite" }}>
        <svg width="100%" height="160" viewBox="0 0 1440 160" preserveAspectRatio="none">
          <path fill="rgba(13,43,78,.6)"
            d="M0,80 C180,130 360,30 540,80 C720,130 900,30 1080,80 C1260,130 1350,60 1440,80 L1440,160 L0,160 Z"/>
        </svg>
      </div>
      <div className="absolute bottom-0 left-0 w-[200%] h-28 opacity-50"
        style={{ animation:"waveB 13s linear infinite reverse" }}>
        <svg width="100%" height="120" viewBox="0 0 1440 120" preserveAspectRatio="none">
          <path fill="rgba(10,22,40,.7)"
            d="M0,60 C200,100 400,20 600,60 C800,100 1000,20 1200,60 C1320,80 1380,40 1440,60 L1440,120 L0,120 Z"/>
        </svg>
      </div>

      {BUBBLES.map(b => (
        <div key={b.id} className="absolute rounded-full"
          style={{ bottom:-50, left:`${b.left}%`, width:b.size, height:b.size,
            background:"radial-gradient(circle at 30% 30%,rgba(255,255,255,.28),rgba(30,107,158,.08))",
            border:"1px solid rgba(255,255,255,.13)",
            "--drift":`${b.drift}px`,
            animation:`bubbleRise ${b.dur}s ease-in ${b.delay}s infinite` }}/>
      ))}
    </div>
  );
}

// ─── Shared gold rule ─────────────────────────────────────────────────────────
function GoldRule() {
  return (
    <div className="h-px w-full my-1"
      style={{ background:"linear-gradient(90deg,transparent,rgba(245,200,66,.22),transparent)" }}/>
  );
}

// ─── Login Page ───────────────────────────────────────────────────────────────
export default function LoginPage() {
  const [email,         setEmail]         = useState("");
  const [password,      setPassword]      = useState("");
  const [isLogging,     setIsLogging]     = useState(false);
  const [shakeEmail,    setShakeEmail]    = useState(false);
  const [shakePassword, setShakePassword] = useState(false);

  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (document.getElementById("op-login-kf")) return;
    const s = document.createElement("style");
    s.id = "op-login-kf";
    s.textContent = KF;
    document.head.appendChild(s);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLogging(true);
    const result = await login(email, password);
    if (result.success) {
      toast.success("Set sail! Login successful!");
      navigate("/");
    } else {
      setShakeEmail(true); setShakePassword(true);
      setTimeout(() => { setShakeEmail(false); setShakePassword(false); }, 500);
      if (result.error?.detail)             toast.error(result.error.detail);
      else if (result.error?.non_field_errors) toast.error(result.error.non_field_errors[0]);
      else                                  toast.error("Wrong coordinates, navigator. Try again.");
    }
    setIsLogging(false);
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    const result = await loginWithGoogle(credentialResponse.credential);
    if (result.success) {
      toast.success(`Welcome ${result.user?.username || "back"}, nakama!`);
      navigate("/");
    } else {
      toast.error(result.error?.detail || "Den Den Mushi connection failed.");
    }
  };

  // shared input class string
  const inputCls = `h-11 bg-white/[.03] border border-yellow-400/15 text-amber-50
    placeholder:text-amber-100/20 placeholder:italic placeholder:text-xs
    focus:border-yellow-400/50 focus:ring-1 focus:ring-yellow-400/40
    focus-visible:ring-1 focus-visible:ring-yellow-400/40
    rounded-sm transition-all duration-300`;

  return (
    <div className="min-h-screen relative overflow-x-hidden" style={{ background:"#071525" }}>
      <OceanBg />

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-5 py-10">

        {/* ── Page Header ── */}
        <div className="text-center mb-7" style={{ animation:"fadeDown .8s ease-out both" }}>
          <div className="text-5xl leading-none mb-2"
            style={{ animation:"heroPulse 3s ease-in-out infinite" }}>☠️</div>

          <h1 className="text-yellow-400 leading-tight tracking-wider"
            style={{
              fontFamily:"'Pirata One', cursive",
              fontSize:"clamp(1.9rem,5vw,3.2rem)",
              textShadow:"0 0 30px rgba(245,200,66,.5),2px 4px 0 #1a0a00",
            }}>
            Straw Hat Crew
          </h1>

          <p className="text-yellow-400/55 uppercase tracking-[5px] mt-1.5"
            style={{ fontFamily:"'Cinzel',serif", fontSize:".68rem" }}>
            Chart your course to the Grand Line
          </p>
        </div>

        {/* ── Main Card ── */}
        <Card
          className="w-full max-w-[540px] relative border border-yellow-400/22 rounded bg-transparent overflow-visible"
          style={{
            background:"linear-gradient(135deg,rgba(18,40,70,.97) 0%,rgba(10,22,40,.99) 100%)",
            boxShadow:"0 0 0 1px rgba(245,200,66,.08),0 0 40px rgba(0,0,0,.6),0 0 80px rgba(245,200,66,.04),inset 0 1px 0 rgba(245,200,66,.12)",
            animation:"fadeUp .8s ease-out .2s both",
          }}>

          {/* Corner ornaments */}
          <span className="absolute top-2.5 left-3.5 text-yellow-400 opacity-40 select-none pointer-events-none" style={{ fontSize:17 }}>✦</span>
          <span className="absolute top-2.5 right-3.5 text-yellow-400 opacity-40 select-none pointer-events-none" style={{ fontSize:17 }}>✦</span>
          <span className="absolute bottom-2.5 left-3.5 text-yellow-400 opacity-40 select-none pointer-events-none" style={{ fontSize:17 }}>✦</span>
          <span className="absolute bottom-2.5 right-3.5 text-yellow-400 opacity-40 select-none pointer-events-none" style={{ fontSize:17 }}>✦</span>
          <div className="absolute top-2 right-8 w-5 h-5 border-t-2 border-r-2 border-yellow-400/35 pointer-events-none"/>
          <div className="absolute bottom-2 left-8 w-5 h-5 border-b-2 border-l-2 border-yellow-400/35 pointer-events-none"/>

          <CardContent className="p-8 pt-7" style={{ animation:"slidePhase .5s ease-out both" }}>

            {/* Section label */}
            <div className="text-center mb-6">
              <span className="text-amber-700/40 text-xs tracking-[4px]"
                style={{ fontFamily:"'Cinzel',serif" }}>──────</span>
              <span className="text-amber-600 uppercase tracking-[4px] text-xs mx-2"
                style={{ fontFamily:"'Cinzel',serif" }}>
                Identify Yourself
              </span>
              <span className="text-amber-700/40 text-xs tracking-[4px]"
                style={{ fontFamily:"'Cinzel',serif" }}>──────</span>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">

              {/* Email */}
              <div className="flex flex-col gap-1.5"
                style={{ animation:"fadeInLeft .45s ease-out .05s both" }}>
                <label htmlFor="email"
                  className="text-amber-700 uppercase tracking-widest"
                  style={{ fontFamily:"'Cinzel',serif", fontSize:".6rem", letterSpacing:2 }}>
                  Navigator&apos;s Coordinates
                </label>
                <Input
                  id="email" type="email"
                  placeholder="nakama@grandline.sea"
                  required autoComplete="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className={inputCls}
                  style={{
                    fontFamily:"'IM Fell English',serif",
                    fontSize:"1rem", fontStyle:"italic",
                    animation: shakeEmail ? "shakeInput .4s ease" : "none",
                  }}
                />
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5"
                style={{ animation:"fadeInLeft .45s ease-out .14s both" }}>
                <div className="flex items-center justify-between">
                  <label htmlFor="password"
                    className="text-amber-700 uppercase tracking-widest"
                    style={{ fontFamily:"'Cinzel',serif", fontSize:".6rem", letterSpacing:2 }}>
                    Secret Passphrase
                  </label>
                  <a href="#"
                    className="text-yellow-400/55 hover:text-yellow-300 transition-colors duration-200"
                    style={{ fontFamily:"'IM Fell English',serif", fontStyle:"italic", fontSize:".75rem" }}>
                    Forgot the code?
                  </a>
                </div>
                <Input
                  id="password" type="password"
                  required autoComplete="current-password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className={inputCls}
                  style={{
                    fontFamily:"'IM Fell English',serif",
                    animation: shakePassword ? "shakeInput .4s ease" : "none",
                  }}
                />
              </div>

              <GoldRule />

              {/* Submit — gold gradient, same as ClueFinder's confirm button */}
              <Button
                type="submit"
                disabled={isLogging}
                className="w-full tracking-widest uppercase text-xs font-bold rounded-sm h-11 border-0 transition-all duration-300 hover:-translate-y-0.5"
                style={{
                  fontFamily:"'Cinzel',serif",
                  background: isLogging
                    ? "linear-gradient(90deg,#3a3020,#2a2010,#3a3020)"
                    : "linear-gradient(90deg,#c9952a,#f5c842,#c9952a)",
                  color:      isLogging ? "rgba(245,200,66,.3)" : "#1a0f00",
                  boxShadow:  isLogging ? "none" : "0 4px 20px rgba(245,200,66,.28)",
                  cursor:     isLogging ? "not-allowed" : "pointer",
                }}>
                {isLogging ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2Icon className="animate-spin w-4 h-4" />
                    Setting Sail…
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Anchor size={14}/> Set Sail
                  </span>
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px"
                style={{ background:"linear-gradient(90deg,transparent,rgba(245,200,66,.2))" }}/>
              <span style={{ fontFamily:"'IM Fell English',serif", fontStyle:"italic",
                fontSize:".82rem", color:"rgba(245,200,66,.35)" }}>
                or continue with
              </span>
              <div className="flex-1 h-px"
                style={{ background:"linear-gradient(90deg,rgba(245,200,66,.2),transparent)" }}/>
            </div>

            {/* Google OAuth */}
            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => toast.error("The Den Den Mushi failed to connect.")}
                shape="circle" size="large" text="signin_with"
              />
            </div>

            <GoldRule />

            {/* Sign-up link */}
            <p className="text-center mt-4"
              style={{ fontFamily:"'IM Fell English',serif", fontStyle:"italic",
                fontSize:".88rem", color:"rgba(245,237,224,.28)" }}>
              No crew yet?{" "}
              <a href="#"
                onClick={e => { e.preventDefault(); navigate("/signup"); }}
                className="hover:text-yellow-200 transition-colors duration-200"
                style={{ color:"#f5c842", fontStyle:"normal" }}>
                Join the crew →
              </a>
            </p>

            {/* Flavour footer */}
            <p className="text-center mt-4 uppercase tracking-[2px]"
              style={{ fontFamily:"'Cinzel',serif", fontSize:".52rem",
                color:"rgba(245,200,66,.14)" }}>
              ☠ The seas hold their secrets, navigator ☠
            </p>

          </CardContent>
        </Card>

        {/* Terms */}
        <p className="mt-5 text-center px-6"
          style={{ fontFamily:"'IM Fell English',serif", fontStyle:"italic",
            fontSize:".8rem", color:"rgba(245,237,224,.18)" }}>
          By continuing, you agree to our{" "}
          <a href="#" className="hover:text-yellow-300 transition-colors duration-200"
            style={{ color:"rgba(245,200,66,.4)", textDecoration:"none" }}>
            Terms of Service
          </a>{" "}and{" "}
          <a href="#" className="hover:text-yellow-300 transition-colors duration-200"
            style={{ color:"rgba(245,200,66,.4)", textDecoration:"none" }}>
            Privacy Policy
          </a>.
        </p>

      </div>
    </div>
  );
}