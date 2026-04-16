import AppShell from "@/components/AppShell";
import AiOrb from "@/components/AiOrb";
import { Send, Sparkles } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";

type Msg = { role: "user" | "ai"; text: string };

const initialMessages: Msg[] = [
  { role: "ai", text: "Namaste! Aaj main aapki kya madad kar sakta hoon?" },
];

export default function AiPage() {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<Msg[]>(initialMessages);
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = (text: string) => {
    if (!text.trim()) return;
    setMessages((m) => [...m, { role: "user", text }]);
    setInput("");
    setTimeout(() => {
      setMessages((m) => [
        ...m,
        { role: "ai", text: "Aaj ki sales ₹12,450 hai — kal se 18% zyada. Top product: Basmati Rice." },
      ]);
    }, 700);
  };

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto p-4 lg:p-6 flex flex-col h-[calc(100vh-var(--nav-height))] md:h-screen">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-auth flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-heading">{t("ai.title")}</h1>
            <p className="text-xs text-muted-foreground">{t("ai.sub")}</p>
          </div>
        </div>

        {/* Orb hero */}
        <div className="flex flex-col items-center justify-center py-6 bg-card rounded-2xl card-shadow mb-4">
          <AiOrb />
          <div className="flex flex-wrap gap-2 mt-10 justify-center px-4">
            {[t("ai.suggest1"), t("ai.suggest2"), t("ai.suggest3")].map((q) => (
              <button
                key={q}
                onClick={() => send(q)}
                className="text-[11px] bg-accent text-accent-foreground px-3 py-1.5 rounded-full font-medium hover-blue"
              >
                "{q}"
              </button>
            ))}
          </div>
        </div>

        {/* Chat */}
        <div className="flex-1 overflow-y-auto space-y-3 pb-2">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} animate-fade-up`}>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                  m.role === "user"
                    ? "bg-gradient-auth text-primary-foreground rounded-br-md"
                    : "bg-card text-foreground rounded-bl-md card-shadow"
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}
          <div ref={endRef} />
        </div>

        {/* Input */}
        <div className="flex items-center gap-2 bg-card rounded-2xl card-shadow p-2 mt-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send(input)}
            placeholder={t("ai.placeholder")}
            className="flex-1 bg-transparent outline-none text-sm px-2 placeholder:text-muted-foreground/60"
          />
          <button
            onClick={() => send(input)}
            className="w-10 h-10 rounded-full bg-gradient-auth text-primary-foreground flex items-center justify-center active:scale-95 transition"
            aria-label="Send"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </AppShell>
  );
}
