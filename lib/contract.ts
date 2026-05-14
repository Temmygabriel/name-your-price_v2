// Name Your Price — GenLayer Contract Utils
// v1.1 — BUG FIX: submitVerdict now sends roundNum as String(roundNum)
// Contract's submit_verdict param is typed str, not int.
// Sending integer caused status_map.get() to return None silently — verdict never stored.

import { createClient, createAccount } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import { TransactionStatus } from "genlayer-js/types";

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`;
const MAX_ATTEMPTS = 3;

function makeClient(account: ReturnType<typeof createAccount>) {
  return createClient({ chain: studionet, account });
}

export function makeAccount(privateKey?: `0x${string}`) {
  return createAccount(privateKey);
}

export async function writeContract(
  account: ReturnType<typeof createAccount>,
  method: string,
  args: unknown[]
): Promise<void> {
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const client = makeClient(account);
      console.log(`writeContract attempt ${attempt}/${MAX_ATTEMPTS}: ${method}`);
      const hash = await client.writeContract({
        address: CONTRACT_ADDRESS,
        functionName: method,
        args,
        account,
        leaderOnly: false,
      } as any);
      await client.waitForTransactionReceipt({
        hash,
        status: TransactionStatus.ACCEPTED,
        retries: 120,
        interval: 4000,
      });
      console.log(`writeContract success: ${method}`);
      return;
    } catch (err: any) {
      console.error(`writeContract ${method} attempt ${attempt} failed:`, err?.message, err);
      if (attempt < MAX_ATTEMPTS) {
        await new Promise((r) => setTimeout(r, attempt * 3000));
        continue;
      }
      throw err;
    }
  }
}

export async function writeContractWithReturn(
  account: ReturnType<typeof createAccount>,
  method: string,
  args: unknown[]
): Promise<string> {
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const client = makeClient(account);
      console.log(`writeContractWithReturn attempt ${attempt}/${MAX_ATTEMPTS}: ${method}`);
      const returnValue = await client.simulateWriteContract({
        address: CONTRACT_ADDRESS,
        functionName: method,
        args,
      });
      const hash = await client.writeContract({
        address: CONTRACT_ADDRESS,
        functionName: method,
        args,
        account,
        leaderOnly: false,
      } as any);
      await client.waitForTransactionReceipt({
        hash,
        status: TransactionStatus.ACCEPTED,
        retries: 120,
        interval: 4000,
      });
      console.log(`writeContractWithReturn success: ${method}, returned:`, returnValue);
      return returnValue as string;
    } catch (err: any) {
      console.error(`writeContractWithReturn ${method} attempt ${attempt} failed:`, err?.message, err);
      if (attempt < MAX_ATTEMPTS) {
        await new Promise((r) => setTimeout(r, attempt * 3000));
        continue;
      }
      throw err;
    }
  }
  throw new Error("All attempts failed");
}

export async function readContract(
  method: string,
  args: unknown[]
): Promise<string> {
  const account = createAccount();
  const client = makeClient(account);
  const result = await client.readContract({
    address: CONTRACT_ADDRESS,
    functionName: method,
    args,
  });
  return result as string;
}

export async function getRoom(roomCode: string) {
  const raw = await readContract("get_room", [roomCode]);
  return JSON.parse(raw);
}

export async function getPlayerStats(address: string) {
  const raw = await readContract("get_player_stats", [address]);
  return JSON.parse(raw);
}

export async function getGlobalLeaderboard() {
  const raw = await readContract("get_global_leaderboard", []);
  return JSON.parse(raw);
}

export async function submitVerdict(
  account: ReturnType<typeof createAccount>,
  roomCode: string,
  playerAddress: string,
  roundNum: number,
  verdict: string
): Promise<void> {
  // FIX: String(roundNum) — contract expects "1"/"2"/"3" not 1/2/3
  return writeContract(account, "submit_verdict", [
    roomCode,
    playerAddress,
    String(roundNum),
    verdict,
  ]);
}

export async function advanceRound(
  account: ReturnType<typeof createAccount>,
  roomCode: string
): Promise<void> {
  return writeContract(account, "advance_round", [roomCode]);
}