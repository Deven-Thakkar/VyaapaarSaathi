import { useState } from "react";

export default function AiOrb() {
  const [state, setState] = useState<"idle" | "listening" | "speaking">("idle");

  const handleTap = () => {
    if (state === "idle") {
      setState("listening");
      setTimeout(() => setState("speaking"), 2500);
      setTimeout(() => setState("idle"), 4500);
    } else {
      setState("idle");
    }
  };

  return (
    <button
      onClick={handleTap}
      className="relative flex items-center justify-center w-24 h-24 rounded-full transition-all duration-300 active:scale-95"
    >
      {/* Glow ring */}
      <div className={`absolute inset-0 rounded-full transition-all duration-500 ${
        state === "idle"
          ? "animate-glow-pulse"
          : state === "listening"
          ? "bg-primary/20 animate-ping"
          : ""
      }`} />
      
      {/* Ripple for speaking */}
      {state === "speaking" && (
        <>
          <div className="absolute inset-0 rounded-full bg-primary/15" style={{ animation: "ripple 1.5s ease-out infinite" }} />
          <div className="absolute inset-0 rounded-full bg-primary/10" style={{ animation: "ripple 1.5s ease-out infinite 0.5s" }} />
        </>
      )}
      
      {/* Core orb */}
      <div className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ${
        state === "idle"
          ? "bg-gradient-to-br from-primary to-primary/80 shadow-lg"
          : state === "listening"
          ? "bg-gradient-to-br from-primary to-primary/90 shadow-xl scale-110"
          : "bg-gradient-to-br from-primary/90 to-primary/70 shadow-lg"
      }`}>
        {state === "listening" ? (
          <div className="flex items-end gap-0.5 h-6">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="w-1 bg-primary-foreground rounded-full wave-bar"
                style={{ height: "12px", animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
        ) : state === "speaking" ? (
          <div className="flex items-center gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 bg-primary-foreground rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        ) : (
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-foreground">
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" x2="12" y1="19" y2="22" />
          </svg>
        )}
      </div>
      
      {state !== "idle" && (
        <span className="absolute -bottom-8 text-xs font-medium text-muted-foreground whitespace-nowrap">
          {state === "listening" ? "Listening..." : "Speaking..."}
        </span>
      )}
    </button>
  );
}
