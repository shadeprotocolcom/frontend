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
  // Trim trailing zeros but keep at least 4 decimal places for readability,
  // or fewer if the value is smaller
  const trimmed = fracStr.replace(/0+$/, "");
  const display = trimmed.length < 4 ? trimmed.padEnd(4, "0") : trimmed;

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
