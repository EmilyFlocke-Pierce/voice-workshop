// The last step before any deploy. It fails until Emily's terms, the Neon Auth URL, and the real sign-in are in.
// It fails today on purpose.
import { readFileSync } from "node:fs";

const misses = [];
const terms = readFileSync(new URL("../src/terms.ts", import.meta.url), "utf8");
if (/TERMS_VERSION = "placeholder"/.test(terms)) misses.push("TERMS_VERSION is still the placeholder. Emily writes the terms.");
const wrangler = readFileSync(new URL("../wrangler.jsonc", import.meta.url), "utf8");
const varOf = (name) => (wrangler.match(new RegExp(`"${name}"\\s*:\\s*"([^"]*)"`)) ?? [])[1];
if (varOf("OPEN_KEYS") !== "false") misses.push('wrangler.jsonc: set OPEN_KEYS to "false".');
if (varOf("HUMAN_AUTH_MODE") !== "neon") misses.push('wrangler.jsonc: set HUMAN_AUTH_MODE to "neon".');
if (!varOf("NEON_AUTH_BASE_URL")) misses.push("wrangler.jsonc: NEON_AUTH_BASE_URL is empty. Emily passes the Auth URL along.");
const auth = readFileSync(new URL("../src/human/auth.ts", import.meta.url), "utf8");
if (/STUB\. Returns null for every token/.test(auth)) misses.push("src/human/auth.ts: verifyNeonJwt is still the STUB.");
if (/"database_id": "local-only"/.test(wrangler)) misses.push("wrangler.jsonc: the D1 database_id is local-only.");

for (const m of misses) console.log(`HOLD  ${m}`);
console.log(misses.length ? `\nDeploy holds: ${misses.length} item(s).` : "\nReady to deploy.");
process.exit(misses.length ? 1 : 0);
