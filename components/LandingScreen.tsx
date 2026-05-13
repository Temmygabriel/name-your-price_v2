"use client";
// Name Your Price — Landing Screen v1.0
// Mirrors HTP LandingScreen structure exactly. New design system applied.

import { useState } from "react";
import { Screen } from "../types";

interface LandingProps {
  onNavigate: (screen: Screen) => void;
  onCreateRoom: (name: string) => void;
  onJoinRoom: (code: string, name: string) => void;
  onSolo: (name: string) => void;
  soloLoading: boolean;
  createLoading: boolean;
  joinLoading: boolean;
  error: string;
}

export default function LandingScreen({
  onNavigate,
  onCreateRoom,
  onJoinRoom,
  onSolo,
  soloLoading,
  createLoading,
  joinLoading,
  error,
}: LandingProps) {
  const [playerName, setPlayerName] = useState(
    typeof window !== "undefined" ? localStorage.getItem("nyp_name") || "" : ""
  );
  const [nameLocked, setNameLocked] = useState(
    typeof window !== "undefined" ? !!localStorage.getItem("nyp_name") : false
  );
  const [roomCode, setRoomCode] = useState("");

  const lockName = () => {
    if (playerName.trim()) {
      localStorage.setItem("nyp_name", playerName.trim());
      setNameLocked(true);
    }
  };

  const loading = soloLoading || createLoading || joinLoading;

  return (
    <div className="fadeIn">
      {/* ── Hero ── */}
      <div className="hero-section">
        <div className="hero-inner">
          <h1 className="hero-title">
            NAME<br />
            YOUR<br />
            <span className="highlight-green">PRICE</span>
          </h1>
          <p className="hero-subtitle">
            A multiplayer price-guessing game on the blockchain.<br />
            Vote FAIR, OVERPRICED, or STEAL — AI judges who&apos;s right.
          </p>
          <div className="stat-chips">
            {[
              ["5",  "Players"],
              ["3",  "Products"],
              ["AI", "Judge"],
              ["60", "Points"],
            ].map(([n, l]) => (
              <div key={l} className="stat-chip">
                <span className="num">{n}</span>
                <span className="lbl">{l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Actions ── */}
      <div className="landing-body">
        <div className="landing-body-inner">

          {/* Name input */}
          <div
            style={{
              fontWeight: 700,
              fontSize: "0.8rem",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: "#888899",
              marginBottom: "0.5rem",
            }}
          >
            Your Player Name
          </div>
          <div className="name-input-row">
            <input
              type="text"
              placeholder="Enter your name..."
              value={playerName}
              onChange={(e) => {
                setPlayerName(e.target.value);
                setNameLocked(false);
              }}
              onKeyDown={(e) => e.key === "Enter" && lockName()}
              disabled={nameLocked}
              maxLength={20}
            />
            {nameLocked ? (
              <button
                className="set-btn"
                style={{ background: "#00FF87", color: "#0A0A0F", borderColor: "#00FF87" }}
                onClick={() => setNameLocked(false)}
              >
                ✏️ Edit
              </button>
            ) : (
              <button className="set-btn" onClick={lockName}>
                Set →
              </button>
            )}
          </div>
          {nameLocked && (
            <div className="name-set-confirm">
              ✓ Ready as <strong>{playerName}</strong>
            </div>
          )}

          {/* Create Room */}
          <button
            className="btn-primary"
            onClick={() => onCreateRoom(playerName.trim())}
            disabled={loading || !playerName.trim()}
            style={{ marginTop: "0.5rem" }}
          >
            {createLoading ? (
              <span className="btn-loading">
                <span className="spinner" />
                Creating...
              </span>
            ) : (
              "💰 CREATE NEW ROOM"
            )}
          </button>

          {/* Join Room */}
          <div className="join-row">
            <input
              type="text"
              placeholder="Room code..."
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              onKeyDown={(e) =>
                e.key === "Enter" && onJoinRoom(roomCode, playerName.trim())
              }
              maxLength={6}
              style={{ margin: 0 }}
            />
            <button
              className="join-btn"
              onClick={() => onJoinRoom(roomCode, playerName.trim())}
              disabled={loading || !playerName.trim() || roomCode.trim().length < 6}
            >
              {joinLoading ? "..." : "JOIN"}
            </button>
          </div>

          <div className="divider-row">or play solo</div>

          {/* Solo Arena */}
          <button
            className="btn-secondary"
            onClick={() => onSolo(playerName.trim())}
            disabled={loading || !playerName.trim()}
          >
            {soloLoading ? (
              <span className="btn-loading">
                <span className="spinner" />
                Setting up arena...
              </span>
            ) : (
              "🤖 SOLO ARENA — Play vs AI Bots"
            )}
          </button>

          {error && <p className="error-text">{error}</p>}

          {/* Footer links */}
          <div className="action-grid" style={{ marginTop: "0.5rem" }}>
            <button
              className="btn-outline"
              onClick={() => onNavigate("leaderboard")}
              style={{ padding: "0.85rem" }}
            >
              🏆 Leaderboard
            </button>
            <button
              className="btn-outline"
              onClick={() => onNavigate("rejoin")}
              style={{ padding: "0.85rem" }}
            >
              🔍 Check Game
            </button>
          </div>

          {/* How it works */}
          <div
            style={{
              marginTop: "1rem",
              padding: "16px",
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: "12px",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            <div
              style={{
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "#888899",
              }}
            >
              How it works
            </div>
            {[
              ["💰", "See a real product with its real price"],
              ["🗳️", "Vote FAIR, OVERPRICED, or STEAL"],
              ["⚖️", "AI judges the correct verdict"],
              ["🏆", "Score points for nailing it — bonus for rare correct calls"],
            ].map(([emoji, text]) => (
              <div
                key={text}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "10px",
                  fontSize: "13px",
                  color: "#888899",
                  lineHeight: 1.5,
                }}
              >
                <span style={{ fontSize: "16px", flexShrink: 0 }}>{emoji}</span>
                <span>{text}</span>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
