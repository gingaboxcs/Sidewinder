/**
 * License key validation for Sidewinder Pro.
 *
 * Key format: SW-XXXX-XXXX-XXXX (where X is alphanumeric)
 *
 * Validation approaches (in order of preference):
 * 1. Online validation via API (future — Stripe webhook generates keys, API validates)
 * 2. Offline validation via checksum (current — keys have a built-in checksum)
 *
 * For now we use a simple checksum algorithm:
 * The last 4 chars are derived from the first 8 chars using a hash.
 * This prevents random guessing while being fully offline.
 */

const KEY_PREFIX = "SW";
const CHARSET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // No I,O,0,1 to avoid confusion

function simpleHash(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash + str.charCodeAt(i)) & 0xffffffff;
  }
  return Math.abs(hash);
}

function checksumFromSegments(seg1: string, seg2: string): string {
  const hash = simpleHash(seg1 + seg2 + "sidewinder-2026");
  let result = "";
  let h = hash;
  for (let i = 0; i < 4; i++) {
    result += CHARSET[h % CHARSET.length];
    h = Math.floor(h / CHARSET.length);
  }
  return result;
}

/**
 * Validate a license key format and checksum.
 * Returns true if the key is structurally valid.
 */
export function validateLicenseKey(key: string): boolean {
  const cleaned = key.trim().toUpperCase().replace(/\s/g, "");

  // Must match SW-XXXX-XXXX-XXXX
  const parts = cleaned.split("-");
  if (parts.length !== 4) return false;
  if (parts[0] !== KEY_PREFIX) return false;
  if (parts[1].length !== 4 || parts[2].length !== 4 || parts[3].length !== 4) return false;

  // Check all chars are in charset
  for (const part of parts.slice(1)) {
    for (const ch of part) {
      if (!CHARSET.includes(ch)) return false;
    }
  }

  // Verify checksum
  const expectedChecksum = checksumFromSegments(parts[1], parts[2]);
  return parts[3] === expectedChecksum;
}

/**
 * Generate a valid license key.
 * Use this to create keys for customers after purchase.
 */
export function generateLicenseKey(): string {
  const seg1 = randomSegment();
  const seg2 = randomSegment();
  const seg3 = checksumFromSegments(seg1, seg2);
  return `${KEY_PREFIX}-${seg1}-${seg2}-${seg3}`;
}

function randomSegment(): string {
  let result = "";
  for (let i = 0; i < 4; i++) {
    result += CHARSET[Math.floor(Math.random() * CHARSET.length)];
  }
  return result;
}
