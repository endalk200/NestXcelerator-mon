export { safeAwait } from "./safe-await";

export function generateSixDigitCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString(); // Generates a number between 100000 and 999999
}
