"use client";
// Name Your Price — Lobby Screen v1.0
// Identical to HTP LobbyScreen. No logic changes. NYP colour tokens applied inline.

import { Room } from "../types";

interface LobbyProps {
  room: Room;
  playerAddress: string;
  isHost: boolean;
  onToggleReady: () => void;
  onStartGame: () => void;
  loading: string;
}

export default function LobbyScreen({
  room,
  playerAddress,
  isHost,
  onToggleReady,
  onStartGame,
  loading,
}: LobbyProps) {
  const players = Object.values(room.players);
  const me = room.players[playerAddress];
  const isSolo = room.is_solo;

  // Host can start with 3+ players — no ready requirement (same as HTP)
  const canStart = isHost && players.length >= (isSolo ? 1 : 3);

  const copyCode = () => {
    navigator.clipboard.writeText(room.code);
    alert("Room code copied!");
  };

  return (
    <div className="screen fadeIn">
      <div className="lobby-header">
        <div>
          <div className="lobby-title">{isSolo ? "SOLO ARENA" : "LOBBY"}</div>
          <div className="lobby-meta">
            Room: <strong style={{ letterSpacing: "0.08em" }}>{room.code}</strong>
          </div>
        </div>
        <div className="lobby-header-actions">
          {!isSolo && (
            <button
              className="btn-outline"
              onClick={copyCode}
              style={{ width: "auto", padding: "0.5rem 1rem", fontSize: "0.85rem" }}
            >
              📋 Copy Code
            </button>
          )}
        </div>
      </div>

      <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "#F0F0F0" }}>
        Players ({players.length}/5)
      </div>

      <div className="player-list">
        {players.map((p) => (
          <div
            key={p.address}
            className={`player-row ${p.address === playerAddress ? "player-row--me" : ""}`}
          >
            <div className="player-avatar">
              {p.address.startsWith("bot_") ? "🤖" : p.name.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: "0.95rem", color: "#F0F0F0" }}>
                {p.name}
                {p.address === room.host && (
                  <span
                    style={{ color: "#00FF87", marginLeft: "0.4rem", fontSize: "0.78rem" }}
                  >
                    👑 HOST
                  </span>
                )}
                {p.address === playerAddress && (
                  <span
                    style={{ color: "#888899", marginLeft: "0.4rem", fontSize: "0.75rem" }}
                  >
                    (you)
                  </span>
                )}
              </div>
              <div style={{ color: "#555566", fontSize: "0.75rem" }}>
                {p.address.startsWith("bot_")
                  ? "AI Bot"
                  : p.address.slice(0, 12) + "..."}
              </div>
            </div>
            <span
              className={`ready-badge ${p.ready ? "ready-badge--yes" : "ready-badge--no"}`}
            >
              {p.ready ? "✓ READY" : "Waiting..."}
            </span>
          </div>
        ))}

        {/* Empty slot */}
        {players.length < 5 && (
          <div className="player-row player-row--empty">
            <div className="player-avatar">?</div>
            <span style={{ color: "#555566", fontSize: "0.9rem" }}>
              Waiting for player...
            </span>
          </div>
        )}
      </div>

      {/* What's coming */}
      <div
        style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: "12px",
          padding: "14px 16px",
          display: "flex",
          flexDirection: "column",
          gap: "6px",
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
          Game Preview
        </div>
        <div style={{ fontSize: "13px", color: "#888899", lineHeight: 1.6 }}>
          3 real products · 3 rounds of voting · AI judges every verdict
          · up to 20 points per round · 60 points max
        </div>
      </div>

      <div className="lobby-actions">
        {/* Ready toggle for non-host non-solo players */}
        {!isHost && !isSolo && (
          <button
            className={me?.ready ? "btn-ready--ready" : "btn-ready--unready"}
            onClick={onToggleReady}
            disabled={!!loading}
          >
            {loading ? "..." : me?.ready ? "✓ Ready!" : "Mark Ready"}
          </button>
        )}

        {/* Start button for host */}
        {isHost && (
          <button
            className="btn-primary"
            onClick={onStartGame}
            disabled={!canStart || !!loading}
          >
            {loading ? (
              <span className="btn-loading">
                <span className="spinner" />
                Starting...
              </span>
            ) : (
              "🚀 START GAME"
            )}
          </button>
        )}
      </div>

      {/* Hints */}
      {isHost && !canStart && (
        <p className="hint-text">
          Need at least 3 players to start ({players.length}/3)
        </p>
      )}
      {!isHost && (
        <p className="hint-text pulse">⏳ Waiting for host to start the game...</p>
      )}
    </div>
  );
}
