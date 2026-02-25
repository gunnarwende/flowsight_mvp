/**
 * In-memory dedupe/throttle for notifications.
 * Same (code + first ref) within THROTTLE_MS → skip.
 * Map clears naturally on Vercel cold starts (stateless functions).
 */

const THROTTLE_MS = 15 * 60 * 1000; // 15 minutes
const cache = new Map<string, number>();

export function shouldSend(code: string, ref?: string): boolean {
  const key = `${code}:${ref ?? "_"}`;
  const now = Date.now();
  const last = cache.get(key);

  if (last && now - last < THROTTLE_MS) return false;

  cache.set(key, now);

  // Prevent unbounded growth — prune stale entries
  if (cache.size > 100) {
    for (const [k, v] of cache) {
      if (now - v > THROTTLE_MS) cache.delete(k);
    }
  }

  return true;
}
