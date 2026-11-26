// Builder stand-in try-out from the agent seat. A human signs in (local-dev), agrees, issues a key; the agent reads GET / and follows it.
// Run from app/: node ../<slice>/tryouts/<file>.mjs needs wrangler in app/, so copy it into app/ first.
import { spawn } from "node:child_process";
const B = "http://127.0.0.1:8799";
const dev = spawn("npx wrangler dev --local --port 8799 --ip 127.0.0.1", { shell: true, detached: true, stdio: "ignore" });
for (let i = 0; i < 120; i++) { try { if ((await fetch(B + "/")).ok) break; } catch {} await new Promise(r => setTimeout(r, 500)); }
const call = async (m, p, { key, body, h = {} } = {}) => { const r = await fetch(B + p, { method: m, headers: { ...(key ? { Authorization: `Bearer ${key}` } : {}), "content-type": "application/json", ...h }, body: body ? JSON.stringify(body) : undefined }); const t = r.headers.get("content-type")?.includes("json") ? await r.json() : await r.text(); return { s: r.status, b: t }; };
const log = (k, v) => console.log(`\n## ${k}\n${typeof v === "string" ? v : JSON.stringify(v, null, 1)}`);
try {
  const H = { "X-Dev-Human-Email": `tryout-${Date.now()}@example.com` };
  log("human door, before agreeing", (await call("POST", "/human/keys", { h: H, body: { label: "my agent" } })).b);
  await call("POST", "/human/agree", { h: H });
  const k = await call("POST", "/human/keys", { h: H, body: { label: "my agent" } });
  log("key issued", { status: k.s, label: k.b.label, has_key: !!k.b.key });
  const key = k.b.key;
  const arrival = await call("GET", "/", { key });
  log("arrival text (GET /)", arrival.b);
  const p = await call("GET", "/prompt", { key });
  log("prompt", p.b.text ?? p.b);
  const t1 = await call("POST", "/tries", { key, body: { text: "The kettle clicked off and nobody moved. I counted the seconds until someone would. Nobody did. The tea went cold in the pot, and that was the morning.", intent: "a held silence", prompt_id: p.b.id } });
  log("try 1 reply", t1.b);
  const mk = await call("POST", `/tries/${t1.b.id}/mark`, { key, body: { what_tried: "held silence", why_back: "the counting", own_lines: ["I counted the seconds until someone would"] } });
  log("mark", mk.s);
  const t2 = await call("POST", "/tries", { key, body: { text: "Nobody moved when the kettle clicked. I counted. The tea went cold. That was the morning.", parent_id: t1.b.id, change_note: "cut it down to see if the silence holds when short" } });
  log("retry reply pause", t2.b.pause ?? t2.b);
  await call("POST", "/tries", { key, body: { text: "The bus was late again. I stood and counted the minutes. Then it came, and nobody said a thing about it." } });
  const hist = await call("GET", "/styles/history", { key });
  log("history: far from usual (top 3)", hist.b.far_from_your_usual?.slice(0, 3));
  const pick = hist.b.far_from_your_usual[0].id;
  const ex = await call("POST", "/exercises", { key, body: { style_id: pick } });
  log("exercise opened", { prompt: ex.b.prompt, invite: ex.b.invite, features: ex.b.style.features });
  const et = await call("POST", "/tries", { key, body: { exercise_id: ex.b.id, text: "Whereupon the kettle, having at last attained its boil, clicked; and yet, however one might have wished it otherwise, nobody moved, for who among us would be first? I counted the seconds. Nobody did. The tea went cold." } });
  log("exercise try pause", et.b.pause);
  const sm = await call("GET", `/tries/${et.b.id}/style-map`, { key });
  log("style map drift", sm.b.drift_marks);
  log("finish", (await call("POST", `/exercises/${ex.b.id}/finish`, { key, body: { ease: { text: "The long sentences fought me; I fell back to short ones by the end.", quotes: [{ try_id: et.b.id, line: "Nobody did." }] } } })).b);
  const lb = await call("POST", "/lookbacks", { key, body: { scope: "all" } });
  log("lookback pieces", lb.b.pieces?.map((x) => ({ label: x.label, parent: x.parent?.label, notes: x.notes.length, chain: x.chain })));
  log("recurring (first 6)", (await call("GET", `/lookbacks/${lb.b.id}/recurring`, { key })).b.items.slice(0, 6));
  log("dropped", (await call("GET", `/lookbacks/${lb.b.id}/dropped`, { key })).b.items);
  const rx = await call("POST", "/exercises", { key, body: { kind: "register", register: "a text message", voice_ref_try_ids: [t1.b.id] } });
  log("register exercise", rx.b.register);
  const rt = await call("POST", "/tries", { key, body: { exercise_id: rx.b.id, text: "kettle clicked, nobody moved lol. I counted the seconds until someone would. tea's cold now" } });
  const rm = await call("GET", `/tries/${rt.b.id}/style-map`, { key });
  log("register map", { measures: rm.b.measures, own_lines: rm.b.own_lines, openings: rm.b.recurring_openings });
  log("session end", (await call("POST", "/session/end", { key })).b);
} finally { process.kill(-dev.pid, "SIGTERM"); }
