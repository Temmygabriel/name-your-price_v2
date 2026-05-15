"use client";
// Name Your Price — Judging Screen v1.1
// FIXES: realistic timing text (3-5 min), room code display, escape hatch to Check Game Status

interface JudgingProps {
  roomCode: string;
}

export default function JudgingScreen({ roomCode }: JudgingProps) {
  return (
    <div className="screen screen--centered fadeIn">
      <div className="submitted-state">

        <div className="judging-block">
          <div className="judging-icon">⚖️</div>
          <div className="judging-title">AI Judges Working</div>
          <p className="judging-sub">
            All 3 rounds are in. The AI is now evaluating every product —
            determining the correct verdict for each one and calculating
            everyone&apos;s scores.
          </p>
          <div className="ai-dots" style={{ marginTop: "8px" }}>
            <span /><span /><span />
          </div>
          <p style={{ fontSize: "13px", color: "#555566", marginTop: "4px", lineHeight: 1.6 }}>
            This usually takes <strong style={{ color: "#A78BFA" }}>3–5 minutes</strong>.
            Please keep this tab open.
          </p>
        </div>

        {/* Room code + escape hatch */}
        <div
          style={{
            background: "rgba(0,212,255,0.06)",
            border: "1px solid rgba(0,212,255,0.18)",
            borderRadius: "12px",
            padding: "16px 18px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            width: "100%",
            maxWidth: "400px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#00D4FF" }}>
            Your Room Code
          </div>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "2.2rem", letterSpacing: "0.14em", color: "#F0F0F0" }}>
            {roomCode}
          </div>
          <div style={{ fontSize: "13px", color: "#888899", lineHeight: 1.6 }}>
            Can&apos;t wait? You can close this tab and come back later.
            Use <strong style={{ color: "#00D4FF" }}>Check Game</strong> on the home screen
            and enter your room code to see the results once they&apos;re ready.
          </div>
        </div>

        {/* Scoring reminder */}
        <div
          style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: "12px",
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            width: "100%",
            maxWidth: "400px",
            textAlign: "left",
          }}
        >
          <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#888899" }}>
            How scoring works
          </div>
          {[
            ["🟢", "+10", "Correct verdict"],
            ["⭐", "+7",  "Minority correct bonus (rare call)"],
            ["⚡", "+3",  "Early vote bonus"],
            ["🏆", "20",  "Max points per round"],
            ["💰", "60",  "Max points total"],
          ].map(([emoji, pts, label]) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13px", color: "#888899" }}>
              <span style={{ fontSize: "16px", width: "20px" }}>{emoji}</span>
              <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.1rem", color: "#00FF87", minWidth: "32px", letterSpacing: "0.04em" }}>
                {pts}
              </span>
              <span>{label}</span>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}