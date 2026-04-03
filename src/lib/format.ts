/**
 * Format a bigint value (in wei) to a human-readable cBTC string.
 * cBTC uses 18 decimals like ETH.
 */
export function formatBtc(value: bigint, decimals: number = 18): string {
  if (value === 0n) return "0";

  const divisor = 10n ** BigInt(decimals);
  const intPart = value / divisor;
  const fracPart = value % divisor;

  if (fracPart === 0n) {
    return intPart.toString();
  }

  const fracStr = fracPart.toString().padStart(decimals, "0");
  // Show max 8 decimal places, trim trailing zeros, keep at least 2
  const capped = fracStr.slice(0, 8);
  const trimmed = capped.replace(/0+$/, "");
  const display = trimmed.length < 2 ? trimmed.padEnd(2, "0") : trimmed;

  return `${intPart}.${display}`;
}

/**
 * Parse a human-readable cBTC string to bigint (in wei).
 */
export function parseBtc(value: string, decimals: number = 18): bigint {
  const trimmed = value.trim();
  if (!trimmed || trimmed === "." || trimmed === "0.") return 0n;

  const parts = trimmed.split(".");
  if (parts.length > 2) throw new Error("Invalid number format");

  const intPart = parts[0] || "0";
  const fracPart = (parts[1] || "").padEnd(decimals, "0").slice(0, decimals);

  return BigInt(intPart) * 10n ** BigInt(decimals) + BigInt(fracPart);
}

/**
 * Validate an Ethereum address format.
 */
export function isValidAddress(address: string): boolean {
  return /^0x[0-9a-fA-F]{40}$/.test(address);
}
