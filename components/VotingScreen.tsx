"use client";
// Name Your Price — Voting Screen v1.1
// Handles voting_1, voting_2, voting_3 statuses.

import { useState } from "react";
import { Room, Verdict } from "../types";
import {
  getCurrentProduct,
  getCurrentSubmissions,
  getCurrentRound,
} from "../app/App";

interface VotingProps {
  room: Room;
  playerAddress: string;
  onSubmitVerdict: (roundNum: number, verdict: Verdict) => void;
  loading: string;
  submitted: boolean;
}

const VERDICTS: {
  value: Verdict;
  emoji: string;
  label: string;
  desc: string;
}[] = [
  { value: "FAIR",       emoji: "🟦", label: "FAIR",       desc: "The price is about right" },
  { value: "OVERPRICED", emoji: "🔴", label: "OVERPRICED", desc: "They're charging too much" },
  { value: "STEAL",      emoji: "🟩", label: "STEAL",      desc: "This is a bargain" },
];

export default function VotingScreen({
  room,
  playerAddress,
  onSubmitVerdict,
  loading,
  submitted,
}: VotingProps) {
  const [selected, setSelected] = useState<Verdict | null>(null);

  const product = getCurrentProduct(room);
  const currentSubs = getCurrentSubmissions(room);
  const roundNum = getCurrentRound(room);

  const humanPlayers = Object.keys(room.players).filter((id) => !id.startsWith("bot_"));
  const submittedCount = humanPlayers.filter((id) => currentSubs[id]).length;
  const waitingCount = humanPlayers.length - submittedCount;

  // ── Submitted / waiting state ─────────────────────────────────────────────
  if (submitted) {
    const myVerdict = currentSubs[playerAddress]?.verdict;

    return (
      <div className="screen screen--centered">
        <div className="submitted-state">
          <div className="submitted-icon">✓</div>
          <h2 className="screen-title">Verdict in!</h2>

          {myVerdict && (
            <div
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: "2rem",
                letterSpacing: "0.06em",
                color:
                  myVerdict === "FAIR"
                    ? "#00D4FF"
                    : myVerdict === "OVERPRICED"
                    ? "#FF4D6D"
                    : "#00FF87",
              }}
            >
              {myVerdict === "FAIR" ? "🟦" : myVerdict === "OVERPRICED" ? "🔴" : "🟩"}{" "}
              {myVerdict}
            </div>
          )}

          <p className="screen-sub">
            {submittedCount}/{humanPlayers.length} players have voted
          </p>

          {waitingCount > 0 ? (
            <>
              <div className="waiting-tip">
                <span className="spinner" />
                Waiting for {waitingCount} more player{waitingCount > 1 ? "s" : ""}...
              </div>
              <div className="timer-banner">
                ⏱ After 60 seconds the game moves forward automatically.
              </div>
            </>
          ) : (
            <div className="waiting-tip">
              <span className="spinner" />
              All votes in — advancing...
            </div>
          )}

          <p className="genlayer-note">
            {roundNum < 3
              ? `Round ${roundNum} of 3 complete. Next product loading soon.`
              : "All 3 rounds complete — AI judges are calculating scores now."}
          </p>
        </div>
      </div>
    );
  }

  // ── Main voting UI ────────────────────────────────────────────────────────
  return (
    <div className="screen fadeIn">

      <div className="round-header">
        <span className="round-badge">Round {roundNum} of 3</span>
        <span className="round-meta">
          {submittedCount}/{humanPlayers.length} voted · Room {room.code}
        </span>
      </div>

      <h2 className="screen-title">Name Your Price</h2>
      <p className="screen-sub">Is this price FAIR, OVERPRICED, or a STEAL?</p>

      {product && (
        <div className="product-card">
          <div className="product-cat">{product.cat.toUpperCase()}</div>
          <div className="product-name">{product.name}</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
            <div className="product-price">${product.price.toLocaleString()}</div>
            <div className="product-price-label">{product.currency}</div>
          </div>
          <div className="product-context">{product.context}</div>
        </div>
      )}

      <div className="section-label">Your verdict</div>
      <div className="verdict-grid">
        {VERDICTS.map((v) => {
          const isSelected = selected === v.value;
          return (
            <button
              key={v.value}
              className={`verdict-btn verdict-btn--${v.value.toLowerCase()} ${isSelected ? "selected" : ""}`}
              onClick={() => setSelected(v.value)}
            >
              <span className="verdict-emoji">{v.emoji}</span>
              <div className="verdict-info">
                <span className={`verdict-label verdict-label--${v.value.toLowerCase()}`}>
                  {v.label}
                </span>
                <span className="verdict-desc">{v.desc}</span>
              </div>
              {isSelected && <span className="verdict-selected-indicator">✓</span>}
            </button>
          );
        })}
      </div>

      <button
        className="btn-primary"
        onClick={() => selected && onSubmitVerdict(roundNum, selected)}
        disabled={!selected || !!loading}
      >
        {loading ? (
          <span className="btn-loading"><span className="spinner" />Submitting...</span>
        ) : (
          `Lock In ${selected ?? "Verdict"} →`
        )}
      </button>

      {!selected && <p className="hint-text">Tap a verdict to select it</p>}

      <div
        style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: "12px",
          padding: "12px 14px",
          fontSize: "12px",
          color: "#555566",
          lineHeight: 1.7,
        }}
      >
        <span style={{ color: "#00FF87", fontWeight: 700 }}>+10</span> correct verdict ·{" "}
        <span style={{ color: "#00FF87", fontWeight: 700 }}>+7</span> minority correct bonus ·{" "}
        <span style={{ color: "#00FF87", fontWeight: 700 }}>+3</span> early vote bonus
      </div>
    </div>
  );
}