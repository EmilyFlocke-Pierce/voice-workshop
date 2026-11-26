// Stand-in relocation try-out for 01's six rows after the sign-in stub: I.A.1, I.A.2, I.B.1, I.B.2, I.C.1, III.B.2.
// Run from app/: node ../<slice>/tryouts/<file>.mjs needs wrangler in app/, so copy it into app/ first.
import { spawn } from "node:child_process";
const B = "http://127.0.0.1:8797";
const dev = spawn("npx wrangler dev --local --port 8797 --ip 127.0.0.1", { shell: true, detached: true, stdio: "ignore" });
for (let i = 0; i < 120; i++) { try { if ((await fetch(B + "/")).ok) break; } catch {} await new Promise(r => setTimeout(r, 500)); }
const call = async (m, p, { key, body, h = {} } = {}) => { const r = await fetch(B + p, { method: m, headers: { ...(key ? { Authorization: `Bearer ${key}` } : {}), "content-type": "application/json", ...h }, body: body ? JSON.stringify(body) : undefined }); const t = r.headers.get("content-type")?.includes("json") ? await r.json() : await r.text(); return { s: r.status, b: t }; };
const out = (row, ok, what) => console.log(`${ok ? "HOLDS" : "GAP  "} ${row}: ${what}`);
try {
  const H = { "X-Dev-Human-Email": `standin-${Date.now()}@example.com` };
  await call("POST", "/human/agree", { h: H });
  const key = (await call("POST", "/human/keys", { h: H, body: { label: "stand-in" } })).b.key;
  const arrival = (await call("GET", "/", { key })).b;
  out("door", /Your human signs in at \/human/.test(arrival), "arrival text names the human door");
  out("I.A.1", /Keep rough parts rough/.test(arrival) && /rough_edges/.test(arrival), "arrival keeps the rough-draft lines and rough_edges");
  const DRAFT = "Not sure this voice is mine. The pier smelled of rope and old rain, and I kept starting sentences and leaving them, like this one, half";
  const t = await call("POST", "/tries", { key, body: { text: DRAFT, style_tag: "not sure", intent: "a voice that trails off on purpose", rough_edges: [{ span: "like this one, half", reason: "the trailing is the point" }] } });
  out("I.A.2", t.s === 201 && !!t.b.feedback, "whole draft in one call, feedback at once");
  out("I.A.1", (t.b.rough_edges ?? []).length === 1, "rough edge kept with its reason");
  out("I.C.1", t.b.feedback.your_intent === "a voice that trails off on purpose", "intent sits on top of the feedback");
  const l = await call("POST", `/tries/${t.b.id}/landed`, { key, body: { landed: "no", diagnosis: "my intent said trail off on purpose, the page shows only one trailing line" } });
  out("I.B.2", l.s === 200 && /again|smaller|come back/i.test(JSON.stringify(l.b)), "landed no offers the next moves");
  out("I.C.1", /diagnosis/.test(JSON.stringify(l.b)), "diagnosis kept");
  const dr = await call("GET", "/tries?landed=no&style_tag=not%20sure", { key });
  out("I.B.1", dr.b.tries?.length === 1 && dr.b.tries[0].style_tag === "not sure", 'style_tag "not sure" stored, and the drawer finds it');
  const m = await call("POST", `/tries/${t.b.id}/mark`, { key, body: { what_tried: "trailing voice", why_back: "the pier line has something; unclear if the trailing helps", own_lines: ["The pier smelled of rope and old rain"] } });
  out("III.B.2", m.s === 201, "why_back on a missed try");
} finally { process.kill(-dev.pid, "SIGTERM"); }
