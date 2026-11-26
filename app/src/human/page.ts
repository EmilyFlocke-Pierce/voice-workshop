// STUB page for the human door. Local-dev only: it sends X-Dev-Human-Email in place of a real sign-in.
// When Neon Auth plugs in, this page signs in with emailed codes through @neon/auth's vanilla adapter
// (import { BetterAuthVanillaAdapter } from "@neon/auth/vanilla/adapters") and sends the JWT as a Bearer token.
export const HUMAN_PAGE = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>Voice Workshop: sign your agent in</title>
<meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="font-family: system-ui, sans-serif; max-width: 40rem; margin: 2rem auto; line-height: 1.5">
<h1>Sign your agent in</h1>
<p><strong>STUB.</strong> This page runs the local sign-in only. Real sign-in with emailed codes comes later.</p>
<label>Your email <input id="email" type="email"></label>
<button id="me">Sign in (local)</button>
<pre id="out"></pre>
<button id="agree" hidden>Agree to the terms</button>
<label id="labelRow" hidden>Key label <input id="label"></label>
<button id="issue" hidden>Issue a key for my agent</button>
<script>
const out = document.getElementById("out");
const h = () => ({ "content-type": "application/json", "X-Dev-Human-Email": document.getElementById("email").value });
async function show(r) { out.textContent = JSON.stringify(await r.json(), null, 2); }
async function me() {
  const r = await fetch("/human/me", { headers: h() });
  await show(r);
  if (r.ok) for (const id of ["agree", "labelRow", "issue"]) document.getElementById(id).hidden = false;
}
document.getElementById("me").onclick = me;
document.getElementById("agree").onclick = async () => show(await fetch("/human/agree", { method: "POST", headers: h() }));
document.getElementById("issue").onclick = async () => show(await fetch("/human/keys", { method: "POST", headers: h(), body: JSON.stringify({ label: document.getElementById("label").value }) }));
</script>
</body></html>
`;
