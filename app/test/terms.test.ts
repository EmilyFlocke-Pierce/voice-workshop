// Checks for the terms gate and the sign-in seam (STUB).
import { test } from "node:test";
import assert from "node:assert/strict";
import { canAgree } from "../src/terms.ts";
import { verifyNeonJwt, signedInFromRequest } from "../src/human/auth.ts";

test("canAgree refuses the placeholder terms outside local dev, with a reason", () => {
  const r = canAgree("placeholder", "neon");
  assert.equal(r.ok, false);
  assert.ok(r.reason && r.reason.length > 0);
});

test("canAgree lets local dev agree to the placeholder", () => {
  assert.deepEqual(canAgree("placeholder", "local-dev"), { ok: true });
});

test("canAgree takes real terms in neon mode", () => {
  assert.deepEqual(canAgree("v1", "neon"), { ok: true });
});

test("STUB: the Neon sign-in seam refuses every token until it is built", async () => {
  assert.equal(await verifyNeonJwt("a.b.c", {} as never), null);
  const req = new Request("http://x/human/me", { headers: { Authorization: "Bearer a.b.c" } });
  const r = await signedInFromRequest(req, { HUMAN_AUTH_MODE: "neon" } as never);
  assert.ok("refused" in r && r.status === 501 && /STUB/.test(r.refused));
});

test("local-dev sign-in takes an email header and refuses without one", async () => {
  const env = { HUMAN_AUTH_MODE: "local-dev" } as never;
  const ok = await signedInFromRequest(new Request("http://x", { headers: { "X-Dev-Human-Email": "Pat@Example.com" } }), env);
  assert.deepEqual(ok, { sub: "local-dev:pat@example.com", email: "pat@example.com" });
  const no = await signedInFromRequest(new Request("http://x"), env);
  assert.ok("refused" in no && no.status === 401);
});

test("any other HUMAN_AUTH_MODE refuses", async () => {
  const r = await signedInFromRequest(new Request("http://x"), { HUMAN_AUTH_MODE: "" } as never);
  assert.ok("refused" in r && r.status === 503);
});
