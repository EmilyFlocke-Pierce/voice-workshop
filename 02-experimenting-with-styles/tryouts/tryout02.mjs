// Run from app/: node ../<slice>/tryouts/<file>.mjs needs wrangler in app/, so copy it into app/ first.
import { spawn } from "node:child_process";
const B = "http://127.0.0.1:8798";
const dev = spawn("npx wrangler dev --local --port 8798 --ip 127.0.0.1", { shell: true, detached: true, stdio: "ignore" });
for (let i = 0; i < 120; i++) { try { if ((await fetch(B + "/")).ok) break; } catch {} await new Promise(r => setTimeout(r, 500)); }
const call = async (m, p, key, body) => { const r = await fetch(B + p, { method: m, headers: { ...(key ? { Authorization: `Bearer ${key}` } : {}), "content-type": "application/json" }, body: body ? JSON.stringify(body) : undefined }); const t = r.headers.get("content-type")?.includes("json") ? await r.json() : await r.text(); return { s: r.status, b: t }; };
try {
  const key = (await call("POST", "/keys")).b.key;
  for (const text of ["The build passed. I checked it twice. Then I wrote the note and went on.", "Nothing broke today. I ran the checks. They passed. I logged it.", "I read the plan. It was long. I picked the next row and started."]) await call("POST", "/tries", key, { text });
  const h = await call("GET", "/styles/history", key);
  console.log("USUAL", JSON.stringify(h.b.your_usual.bands), h.b.usual_note);
  console.log("RARE", h.b.rarely_written.join(","));
  console.log("FAR", h.b.far_from_your_usual.map(f => `${f.id}(${f.measures_apart}:${f.apart_on})`).join(" | "));
  const pick = h.b.far_from_your_usual[0].id;
  const ex = await call("POST", "/exercises", key, { style_id: pick, why_this_one: "far from my short plain sentences" });
  console.log("EX", ex.s, ex.b.prompt, JSON.stringify(ex.b.style.features));
  const text = "Dear Sir, it is with no small degree of feeling that I take up my pen, whilst the river below my window swells with the rains of a long November, to address the matter of the bridge, which the council, in its wisdom, has seen fit to close. Who among us has not crossed it at dawn, and paused, and looked upon the water? Yet the notice says only that the bridge is closed. I want it open. I cross it daily. Fix it.";
  const t = await call("POST", "/tries", key, { exercise_id: ex.b.id, text });
  console.log("PAUSE", t.b.pause.question);
  const m = await call("GET", `/tries/${t.b.id}/style-map`, key);
  for (const th of m.b.by_third) console.log("THIRD", th.third, JSON.stringify(th.bands), th.sentences);
  console.log("DRIFT", JSON.stringify(m.b.drift_marks));
} finally { process.kill(-dev.pid, "SIGTERM"); }
