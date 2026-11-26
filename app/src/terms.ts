// The terms a human agrees to before issuing a key. Emily writes the wording; until then the version is "placeholder".
// canAgree is pure: it reads no env and no request, so test:terms runs it with plain values.
export const TERMS_VERSION = "placeholder";
export const TERMS_TEXT = "Terms and privacy: Emily writes this.";

export function canAgree(termsVersion: string, humanAuthMode: string): { ok: boolean; reason?: string } {
  if (termsVersion === "placeholder" && humanAuthMode !== "local-dev")
    return { ok: false, reason: "The terms are still a placeholder. Agreement opens once Emily's wording is in." };
  return { ok: true };
}
