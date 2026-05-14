"use client";
// Name Your Price — Main Orchestrator v1.3
// FIX: useEffect wraps makeAccount in try/catch.
// If nyp_private_key in localStorage is corrupted (e.g. the string "undefined"),
// makeAccount throws "invalid private key". We catch it, clear the bad key,
// and generate a fresh account. This fixes the infinite loop crash on normal browsers.

import { useState, useEffect, useRef, useCallback } from "react";
import { Screen, Room, Verdict } from "../types";
import {
  makeAccount,
  writeContract,
  writeContractWithReturn,
  getRoom,
  submitVerdict,
  advanceRound,
} from "../lib/contract";

import LandingScreen from "../components/LandingScreen";
import LobbyScreen from "../components/LobbyScreen";
import VotingScreen from "../components/VotingScreen";
import JudgingScreen from "../components/JudgingScreen";
import ResultsScreen from "../components/ResultsScreen";
import RejoinScreen from "../components/RejoinScreen";
import LeaderboardScreen from "../components/LeaderboardScreen";

const POLL_INTERVAL = 3000;
const ADVANCE_FALLBACK = 60_000;
const CALC_FALLBACK = 30_000;

// ── Round helpers (exported so child screens can use them) ──────────────────

export function getCurrentSubmissions(room: Room) {
  if (room.status === "voting_1") return room.submissions_1;
  if (room.status === "voting_2") return room.submissions_2;
  if (room.status === "voting_3") return room.submissions_3;
  return {};
}

export function getCurrentProduct(room: Room) {
  if (room.status === "voting_1") return room.products[0];
  if (room.status === "voting_2") return room.products[1];
  if (room.status === "voting_3") return room.products[2];
  return room.products[0];
}

export function getCurrentRound(room: Room): number {
  if (room.status === "voting_1") return 1;
  if (room.status === "voting_2") return 2;
  if (room.status === "voting_3") return 3;
  return 1;
}

// ── Component ───────────────────────────────────────────────────────────────

export default function App() {
  const [screen, setScreen] = useState<Screen>("landing");
  const [room, setRoom] = useState<Room | null>(null);
  const [roomCode, setRoomCode] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const accountRef = useRef<ReturnType<typeof makeAccount> | null>(null);
  const playerAddressRef = useRef<string>("");
  const screenRef = useRef<Screen>("landing");
  const pollRoomCodeRef = useRef<string>("");
  const calculatingRef = useRef(false);
  const advancingRef = useRef(false);
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const allSubmittedAtRef = useRef<number>(0);
  const allJudgingAtRef = useRef<number>(0);
  const lastAdvancedStatusRef = useRef<string>("");

  useEffect(() => {
    const savedName = localStorage.getItem("nyp_name");

    // FIX: Wrap makeAccount in try/catch.
    // If nyp_private_key stored value is corrupted (e.g. the string "undefined"
    // from a previous broken session), makeAccount throws "invalid private key".
    // We catch it, wipe all nyp_ keys, and generate a fresh account.
    let acc: ReturnType<typeof makeAccount>;
    const savedKey = localStorage.getItem("nyp_private_key");

    try {
      if (savedKey && savedKey !== "undefined" && savedKey !== "null" && savedKey.startsWith("0x")) {
        acc = makeAccount(savedKey as `0x${string}`);
      } else {
        // No valid key — generate fresh
        if (savedKey !== null) {
          // Had a bad key — clear all stale nyp_ data
          localStorage.removeItem("nyp_private_key");
          localStorage.removeItem("nyp_address");
        }
        acc = makeAccount();
        localStorage.setItem("nyp_private_key", acc.privateKey);
      }
    } catch {
      // makeAccount threw on the saved key — clear everything and start fresh
      localStorage.removeItem("nyp_private_key");
      localStorage.removeItem("nyp_address");
      localStorage.removeItem("nyp_name");
      acc = makeAccount();
      localStorage.setItem("nyp_private_key", acc.privateKey);
    }

    accountRef.current = acc;
    playerAddressRef.current = acc.address;
    localStorage.setItem("nyp_address", acc.address);

    if (savedName) setPlayerName(savedName);
  }, []);

  useEffect(() => { screenRef.current = screen; }, [screen]);

  const stopPolling = useCallback(() => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }, []);

  const startPolling = useCallback((code: string) => {
    stopPolling();
    pollRoomCodeRef.current = code;

    const poll = async () => {
      if (!pollRoomCodeRef.current) return;
      if (!["lobby", "voting", "judging"].includes(screenRef.current)) return;

      try {
        const data: Room = await getRoom(pollRoomCodeRef.current);
        if (!data || !data.code) return;
        setRoom(data);

        const myAddr = playerAddressRef.current;
        const isHost = data.host === myAddr;
        const isSolo = data.is_solo;
        const humanPlayers = Object.keys(data.players).filter((id) => !id.startsWith("bot_"));

        // ── LOBBY ──────────────────────────────────────────────────────────
        if (data.status === "lobby") {
          setScreen("lobby");
          return;
        }

        // ── VOTING ROUNDS ──────────────────────────────────────────────────
        if (
          data.status === "voting_1" ||
          data.status === "voting_2" ||
          data.status === "voting_3"
        ) {
          setScreen("voting");

          const currentSubs = getCurrentSubmissions(data);
          const humanSubmitted = humanPlayers.filter((id) => currentSubs[id]).length;
          const allHumanSubmitted = humanSubmitted === humanPlayers.length;

          setSubmitted(!!currentSubs[myAddr]);

          // Reset advance refs when round changes
          if (lastAdvancedStatusRef.current !== data.status) {
            lastAdvancedStatusRef.current = data.status;
            advancingRef.current = false;
            allSubmittedAtRef.current = 0;
          }

          if (allHumanSubmitted && !advancingRef.current) {
            if (allSubmittedAtRef.current === 0) allSubmittedAtRef.current = Date.now();
            const elapsed = Date.now() - allSubmittedAtRef.current;
            if (isHost || isSolo || elapsed > ADVANCE_FALLBACK) {
              advancingRef.current = true;
              try {
                await advanceRound(accountRef.current!, pollRoomCodeRef.current);
              } catch {
                advancingRef.current = false;
              }
            }
          }
          return;
        }

        // ── JUDGING ────────────────────────────────────────────────────────
        if (data.status === "judging") {
          allSubmittedAtRef.current = 0;
          setScreen("judging");

          if (!calculatingRef.current) {
            if (allJudgingAtRef.current === 0) allJudgingAtRef.current = Date.now();
            const elapsed = Date.now() - allJudgingAtRef.current;
            if (isHost || isSolo || elapsed > CALC_FALLBACK) {
              calculatingRef.current = true;
              try {
                await writeContract(accountRef.current!, "calculate_results", [pollRoomCodeRef.current]);
              } catch {
                calculatingRef.current = false;
              }
            }
          }
          return;
        }

        // ── COMPLETED ──────────────────────────────────────────────────────
        if (data.status === "completed") {
          allJudgingAtRef.current = 0;
          stopPolling();
          setScreen("results");
        }
      } catch {
        /* Network blip — keep polling */
      }
    };

    poll();
    pollTimerRef.current = setInterval(poll, POLL_INTERVAL);
  }, [stopPolling]);

  useEffect(() => { return () => stopPolling(); }, [stopPolling]);

  function getAccount() {
    if (!accountRef.current) {
      const savedKey = localStorage.getItem("nyp_private_key");
      try {
        if (savedKey && savedKey !== "undefined" && savedKey !== "null" && savedKey.startsWith("0x")) {
          accountRef.current = makeAccount(savedKey as `0x${string}`);
        } else {
          accountRef.current = makeAccount();
          localStorage.setItem("nyp_private_key", accountRef.current.privateKey);
        }
      } catch {
        localStorage.removeItem("nyp_private_key");
        accountRef.current = makeAccount();
        localStorage.setItem("nyp_private_key", accountRef.current.privateKey);
      }
      playerAddressRef.current = accountRef.current.address;
      localStorage.setItem("nyp_address", playerAddressRef.current);
    }
    return accountRef.current;
  }

  function resetRoomState() {
    setSubmitted(false);
    advancingRef.current = false;
    calculatingRef.current = false;
    allSubmittedAtRef.current = 0;
    allJudgingAtRef.current = 0;
    lastAdvancedStatusRef.current = "";
  }

  // ── Handlers ───────────────────────────────────────────────────────────────

  async function handleCreateRoom(name: string) {
    if (!name.trim()) return;
    setLoading("Creating room...");
    setError("");
    const acc = getAccount();
    localStorage.setItem("nyp_name", name);
    setPlayerName(name);
    try {
      const code = await writeContractWithReturn(acc, "create_room", [acc.address, name]);
      setRoomCode(code);
      resetRoomState();
      setScreen("lobby");
      startPolling(code);
    } catch (e: any) {
      console.error("handleCreateRoom failed:", e?.message, e);
      setError("Failed to create room. Try again.");
    } finally {
      setLoading("");
    }
  }

  async function handleJoinRoom(code: string, name: string) {
    if (!code.trim() || !name.trim()) return;
    setLoading("Joining room...");
    setError("");
    const acc = getAccount();
    localStorage.setItem("nyp_name", name);
    setPlayerName(name);
    try {
      await writeContract(acc, "join_room", [code.toUpperCase(), acc.address, name]);
      setRoomCode(code.toUpperCase());
      resetRoomState();
      setScreen("lobby");
      startPolling(code.toUpperCase());
    } catch {
      setError("Could not join room. Check the code.");
    } finally {
      setLoading("");
    }
  }

  async function handleSoloArena(name: string) {
    const playerN = name || playerName || "Player";
    setLoading("Setting up Solo Arena...");
    setError("");
    const acc = getAccount();
    localStorage.setItem("nyp_name", playerN);
    setPlayerName(playerN);
    try {
      const code = await writeContractWithReturn(acc, "create_solo_room", [acc.address, playerN]);
      setRoomCode(code);
      resetRoomState();
      setScreen("voting");
      startPolling(code);
    } catch {
      setError("Failed to start Solo Arena. Try again.");
    } finally {
      setLoading("");
    }
  }

  async function handleToggleReady() {
    if (!roomCode) return;
    setLoading("Updating...");
    const acc = getAccount();
    try {
      await writeContract(acc, "toggle_ready", [roomCode, acc.address]);
    } catch {
      /* silent */
    } finally {
      setLoading("");
    }
  }

  async function handleStartGame() {
    if (!roomCode) return;
    setLoading("Starting game...");
    const acc = getAccount();
    try {
      await writeContract(acc, "start_game", [roomCode, acc.address]);
    } catch {
      setError("Could not start game.");
    } finally {
      setLoading("");
    }
  }

  async function handleSubmitVerdict(roundNum: number, verdict: Verdict) {
    if (!roomCode) return;
    setLoading("Submitting verdict...");
    const acc = getAccount();
    try {
      await submitVerdict(acc, roomCode, acc.address, roundNum, verdict);
      setSubmitted(true);
    } catch {
      setError("Could not submit verdict.");
    } finally {
      setLoading("");
    }
  }

  function handleRejoin(rejoinedRoom: Room, code: string) {
    setRoom(rejoinedRoom);
    setRoomCode(code);
    resetRoomState();

    const myAddr = playerAddressRef.current;
    const subs = getCurrentSubmissions(rejoinedRoom);
    setSubmitted(!!subs[myAddr]);

    if (rejoinedRoom.status === "completed") {
      stopPolling();
      setScreen("results");
    } else if (
      rejoinedRoom.status === "voting_1" ||
      rejoinedRoom.status === "voting_2" ||
      rejoinedRoom.status === "voting_3"
    ) {
      setScreen("voting");
      startPolling(code);
    } else if (rejoinedRoom.status === "judging") {
      setScreen("judging");
      startPolling(code);
    } else {
      setScreen("lobby");
      startPolling(code);
    }
  }

  function handlePlayAgain() {
    stopPolling();
    setRoom(null);
    setRoomCode("");
    setError("");
    resetRoomState();
    setScreen("landing");
  }

  // ── Render ────────────────────────────────────────────────────────────────

  const playerAddress = playerAddressRef.current;
  const isHost = room ? room.host === playerAddress : false;

  const renderScreen = () => {
    switch (screen) {
      case "landing":
        return (
          <LandingScreen
            onNavigate={setScreen}
            onCreateRoom={handleCreateRoom}
            onJoinRoom={handleJoinRoom}
            onSolo={handleSoloArena}
            soloLoading={loading === "Setting up Solo Arena..."}
            createLoading={loading === "Creating room..."}
            joinLoading={loading === "Joining room..."}
            error={error}
          />
        );
      case "lobby":
        if (!room) return null;
        return (
          <LobbyScreen
            room={room}
            playerAddress={playerAddress}
            isHost={isHost}
            onToggleReady={handleToggleReady}
            onStartGame={handleStartGame}
            loading={loading}
          />
        );
      case "voting":
        if (!room) return null;
        return (
          <VotingScreen
            room={room}
            playerAddress={playerAddress}
            onSubmitVerdict={handleSubmitVerdict}
            loading={loading}
            submitted={submitted}
          />
        );
      case "judging":
        return <JudgingScreen />;
      case "results":
        if (!room) return null;
        return (
          <ResultsScreen
            room={room}
            playerAddress={playerAddress}
            onPlayAgain={handlePlayAgain}
            onHome={handlePlayAgain}
          />
        );
      case "rejoin":
        return (
          <RejoinScreen
            playerAddress={playerAddress}
            onRejoin={handleRejoin}
            onBack={() => setScreen("landing")}
          />
        );
      case "leaderboard":
        return (
          <LeaderboardScreen
            playerAddress={playerAddress}
            onBack={() => setScreen("landing")}
          />
        );
      default:
        return null;
    }
  };

  return (
    <main className="app-root">
      <div className="app-container">{renderScreen()}</div>
    </main>
  );
}