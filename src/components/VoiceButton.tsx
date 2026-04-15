import { Mic } from "lucide-react";
import { useState } from "react";

export default function VoiceButton() {
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
      className={`relative flex items-center justify-center w-20 h-20 rounded-full transition-all duration-200 active:scale-95 ${
        state === "idle"
          ? "bg-primary text-primary-foreground shadow-lg"
          : state === "listening"
          ? "bg-primary text-primary-foreground shadow-xl scale-110"
          : "bg-primary/80 text-primary-foreground shadow-lg"
      }`}
    >
      {state === "listening" && (
        <div className="absolute inset-0 rounded-full bg-primary/30 animate-ping" />
      )}
      <div className="flex items-center gap-1">
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
        ) : (
          <Mic className="w-8 h-8" />
        )}
      </div>
      {state !== "idle" && (
        <span className="absolute -bottom-7 text-xs font-medium text-muted-foreground whitespace-nowrap">
          {state === "listening" ? "Listening..." : "Speaking..."}
        </span>
      )}
    </button>
  );
}
