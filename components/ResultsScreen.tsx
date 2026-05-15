"use client";
// Name Your Price — Results Screen v1.1
// FIX: Products section now shows AI's correct verdict per product,
// and each player's verdict is marked ✅ (correct) or ❌ (wrong) clearly.

import { Room, Verdict } from "../types";

interface ResultsProps {
  room: Room;
  playerAddress: string;
  onPlayAgain: () => void;
  onHome: () => void;
}

const VERDICT_COLOR: Record<string, string> = {
  FAIR:       "#00D4FF",
  OVERPRICED: "#FF4D6D",
  STEAL:      "#00FF87",
};

const RANK_MEDALS = ["🥇", "🥈", "🥉"];

function VerdictChip({ verdict }: { verdict: string }) {
  return (
    <span style={{ fontSize: "11px", fontWeight: 700, color: VERDICT_COLOR[verdict] ?? "#888899", letterSpacing: "0.04em" }}>
      {verdict}
    </span>
  );
}

function RoundScorePips({ scores }: { scores: number[] }) {
  return (
    <div style={{ display: "flex", gap: "4px" }}>
      {scores.map((s, i) => (
        <span key={i} style={{ fontSize: "11px", color: s > 0 ? "#00FF87" : "#555566", fontWeight: 600 }}>
          R{i + 1}:{s}
        </span>
      ))}
    </div>
  );
}

export default function ResultsScreen({ room, playerAddress, onPlayAgain, onHome }: ResultsProps) {
  const rankings = room.rankings;
  const myRank = rankings.findIndex((r) => r.player === playerAddress);
  const myResult = rankings[myRank];
  const winner = rankings[0];
  const isWinner = winner?.player === playerAddress;

  // product_verdicts stored on room by calculate_results
  const productVerdicts: Record<string, { correct_verdict: string; reason: string }> =
    (room as any).product_verdicts ?? {};

  function getPlayerVerdicts(playerId: string): (string | null)[] {
    const isBotId = playerId.startsWith("bot_");
    const subs1 = isBotId ? room.bot_submissions_1 : room.submissions_1;
    const subs2 = isBotId ? room.bot_submissions_2 : room.submissions_2;
    const subs3 = isBotId ? room.bot_submissions_3 : room.submissions_3;
    return [
      subs1[playerId]?.verdict ?? null,
      subs2[playerId]?.verdict ?? null,
      subs3[playerId]?.verdict ?? null,
    ];
  }

  return (
    <div className="screen fadeIn">

      {/* ── Winner Banner ── */}
      <div className={`winner-banner ${isWinner ? "winner-banner--mine" : ""}`}>
        <div className="winner-crown">
          {isWinner ? "👑 You won!" : `👑 ${winner?.name} wins!`}
        </div>
        {winner && (
          <div className="winner-verdict">
            <span className="winner-verdict-label">Winning score</span>
            <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "2.5rem", color: "#00FF87", letterSpacing: "0.04em" }}>
              {winner.total_score} pts
            </span>
          </div>
        )}
        <div style={{ fontSize: "13px", color: "#888899" }}>
          {winner?.correct_verdicts ?? 0}/3 correct verdicts
        </div>
      </div>

      {/* ── My Result (if not winner) ── */}
      {!isWinner && myResult && (
        <div className="my-result">
          <span className="my-rank-label">Your rank</span>
          <span className="my-rank-num">#{myRank + 1}</span>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "2px" }}>
            <span className="my-score">{myResult.total_score} pts</span>
            <span style={{ fontSize: "12px", color: "#888899" }}>{myResult.correct_verdicts}/3 correct</span>
          </div>
        </div>
      )}

      {/* ── Products — what the AI decided + how you did ── */}
      <div className="section-label">How you did — product by product</div>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {room.products.map((product, i) => {
          const correctData = productVerdicts[String(product.id)];
          const correctVerdict = correctData?.correct_verdict ?? null;
          const reason = correctData?.reason ?? null;

          const isBotPlayer = playerAddress.startsWith("bot_");
          const mySubs = [
            isBotPlayer ? room.bot_submissions_1 : room.submissions_1,
            isBotPlayer ? room.bot_submissions_2 : room.submissions_2,
            isBotPlayer ? room.bot_submissions_3 : room.submissions_3,
          ];
          const myVerdictForRound = mySubs[i]?.[playerAddress]?.verdict ?? null;
          const isCorrect = correctVerdict && myVerdictForRound === correctVerdict;
          const hasVoted = myVerdictForRound !== null;

          return (
            <div
              key={product.id}
              style={{
                background: isCorrect
                  ? "rgba(0,255,135,0.05)"
                  : hasVoted
                  ? "rgba(255,77,109,0.05)"
                  : "rgba(255,255,255,0.03)",
                border: isCorrect
                  ? "1px solid rgba(0,255,135,0.25)"
                  : hasVoted
                  ? "1px solid rgba(255,77,109,0.2)"
                  : "1px solid rgba(255,255,255,0.08)",
                borderRadius: "12px",
                padding: "14px 16px",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "1.1rem", color: "#555566", minWidth: "20px" }}>
                  {i + 1}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "14px", fontWeight: 600, color: "#F0F0F0" }}>{product.name}</div>
                  <div style={{ fontSize: "12px", color: "#888899" }}>${product.price.toLocaleString()} {product.currency}</div>
                </div>
                {/* Your verdict vs AI correct verdict */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
                  {hasVoted && (
                    <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                      <span style={{ fontSize: "11px", color: "#555566" }}>You:</span>
                      <VerdictChip verdict={myVerdictForRound!} />
                      <span style={{ fontSize: "14px" }}>{isCorrect ? "✅" : "❌"}</span>
                    </div>
                  )}
                  {correctVerdict && (
                    <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                      <span style={{ fontSize: "11px", color: "#555566" }}>AI says:</span>
                      <VerdictChip verdict={correctVerdict} />
                    </div>
                  )}
                </div>
              </div>
              {reason && (
                <div style={{ fontSize: "12px", color: "#555566", fontStyle: "italic", paddingLeft: "30px" }}>
                  {reason}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Full Rankings ── */}
      <div className="section-label">Full Rankings</div>
      <div className="rankings-list">
        {rankings.map((entry, i) => {
          const isMe = entry.player === playerAddress;
          const medal = RANK_MEDALS[i] || `#${i + 1}`;
          const verdicts = getPlayerVerdicts(entry.player);

          const verdictResults = verdicts.map((v, ri) => {
            const pv = productVerdicts[String(room.products[ri]?.id)];
            const correct = pv?.correct_verdict ?? null;
            return { verdict: v, isCorrect: correct && v === correct };
          });

          return (
            <div key={entry.player} className={`rank-row ${isMe ? "rank-row--me" : ""}`}>
              <span className="rank-medal">{medal}</span>
              <div className="rank-info">
                <div className="rank-name">
                  {entry.player.startsWith("bot_") ? `🤖 ${entry.name}` : entry.name}
                  {isMe && <span style={{ color: "#888899", fontWeight: 400, marginLeft: "0.4rem", fontSize: "0.8rem" }}>(you)</span>}
                </div>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {verdictResults.map((vr, ri) =>
                    vr.verdict ? (
                      <span key={ri} style={{ fontSize: "11px", color: "#888899" }}>
                        R{ri + 1}: <VerdictChip verdict={vr.verdict} />
                        <span style={{ marginLeft: "2px" }}>{vr.isCorrect ? "✅" : "❌"}</span>
                      </span>
                    ) : null
                  )}
                </div>
                {entry.round_scores?.length > 0 && <RoundScorePips scores={entry.round_scores} />}
              </div>
              <div className="rank-scores">
                <div className="rank-total" style={{ color: isMe ? "#00FF87" : "#F0F0F0" }}>
                  {entry.total_score}
                </div>
                <div style={{ fontSize: "11px", color: "#888899" }}>{entry.correct_verdicts}/3 ✓</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="score-legend">
        <span>✅ correct verdict +10</span>
        <span>·</span>
        <span>rare correct +7 bonus</span>
        <span>·</span>
        <span>early vote +3 bonus</span>
        <span>·</span>
        <span>max 20/round</span>
      </div>

      <div className="results-actions">
        <button className="btn-primary" onClick={onPlayAgain}>Play Again</button>
        <button className="btn-outline" onClick={onHome}>Back to Home</button>
      </div>

      <p className="results-note">
        Room <strong>{room.code}</strong> · Results saved on-chain permanently.
        Use <strong>Check Game</strong> on the home screen to find this game anytime.
      </p>
    </div>
  );
}