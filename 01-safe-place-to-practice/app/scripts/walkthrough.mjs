// Walks one agent through the slice against a local Worker (wrangler dev with local D1),
// then checks privacy, the caps, and the admin page. Prints one line per check.
// Run: npm run db:local, then npm run walkthrough. Set VW_URL to use a Worker that is already running.
import { spawn, spawnSync } from "node:child_process";

const PORT = 8799;
const BASE = process.env.VW_URL ?? `http://127.0.0.1:${PORT}`;
let dev;
const results = [];

function check(name, ok, detail = "") {
  results.push(ok);
  console.log(`${ok ? "PASS" : "MISS"}  ${name}${detail ? `  (${detail})` : ""}`);
}

async function call(method, path, { key, body, headers = {} } = {}) {
  const res = await fetch(BASE + path, {
    method,
    headers: { ...(key ? { Authorization: `Bearer ${key}` } : {}), ...(body !== undefined ? { "content-type": "application/json" } : {}), ...headers },
    body: body === undefined ? undefined : typeof body === "string" ? body : JSON.stringify(body),
  });
  const type = res.headers.get("content-type") ?? "";
  return { status: res.status, body: type.includes("json") ? await res.json() : await res.text() };
}

async function startDev() {
  if (process.env.VW_URL) return;
  dev = spawn(`npx wrangler dev --local --port ${PORT} --ip 127.0.0.1`, { shell: true, detached: process.platform !== "win32", stdio: ["ignore", "pipe", "pipe"] });
  const started = Date.now();
  while (Date.now() - started < 60000) {
    try {
      const r = await fetch(BASE + "/");
      if (r.ok) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error("wrangler dev did not start within 60 seconds");
}

function stopDev() {
  if (!dev) return;
  // Stops the whole wrangler tree, and waits for it, so no local server stays running.
  if (process.platform === "win32") spawnSync("taskkill", ["/pid", String(dev.pid), "/T", "/F"], { stdio: "ignore" });
  else process.kill(-dev.pid, "SIGTERM");
}

const ROUGH = "Perhaps the light was wrong. I waited by the door and counted the cars that did not stop. Perhaps nobody came because nobody knew. The road was empty. Perhaps it rained. I went in. Perhaps that was all.";
const RETRY = "Perhaps the light was wrong. I waited by the door and counted the cars that did not stop. Nobody came because nobody knew. The road was empty. Perhaps it rained. I went in. That was all.";

try {
  await startDev();

  const arrival = await call("GET", "/");
  check("GET / gives the arrival instructions", arrival.status === 200 && /only your key reads it/.test(arrival.body) && /drawer/.test(arrival.body));

  const k = await call("POST", "/keys");
  const key = k.body.key;
  check("POST /keys gives a free key once", k.status === 201 && /^vw_/.test(key));

  const t1 = await call("POST", "/tries", { key, body: { text: ROUGH, intent: "a flat voice that hedges, to see how far hedging carries", scope_note: "the prompt asked for one scene, so I kept it to one", style_tag: "not sure" } });
  check("POST /tries stores the draft and returns feedback right away", t1.status === 201 && t1.body.feedback.observations.length > 0);
  const stored = await call("GET", `/tries/${t1.body.id}`, { key });
  check("the try is stored exactly as sent", stored.body.text === ROUGH);
  check("intent and scope note sit above the observations", t1.body.feedback.your_intent.startsWith("a flat voice") && t1.body.feedback.your_scope_note.startsWith("the prompt"));
  check("observations use the four fields", t1.body.feedback.observations.every((o) => Object.keys(o).join() === "feature,where,quotes,pattern"));
  check("the repeated hedge is named and quoted", t1.body.feedback.observations.some((o) => o.feature === 'Repeated word "perhaps"' && o.quotes.length >= 1));

  const miss = await call("POST", `/tries/${t1.body.id}/landed`, { key, body: { landed: "no" } });
  check("landed = no offers try again, try smaller, or stop and come back", miss.body.next?.map((n) => n.move).join("|") === "try again|try smaller|stop and come back later");

  const r1 = await call("POST", `/tries/${t1.body.id}/retry`, { key, body: { text: RETRY, change_note: "took out two of the perhaps" } });
  check("a retry links to its parent", r1.status === 201 && r1.body.parent_id === t1.body.id);
  check("the retry lists every change found, beside the change note", r1.body.changes.every_change_found.length === 2 && r1.body.changes.your_change_note === "took out two of the perhaps");
  check("the retry keeps the same layout and carries the intent", r1.body.changes.same_conditions.layout_version === true && r1.body.feedback.your_intent.startsWith("a flat voice"));
  const parentAfter = await call("GET", `/tries/${t1.body.id}`, { key });
  check("the parent stays as it was", parentAfter.body.text === ROUGH);

  const t2 = await call("POST", "/tries", { key, body: { text: "Short one. Another.", style_tag: "clipped", landed: "no" } });
  const drawer = await call("GET", "/tries?landed=no", { key });
  check("the drawer lists misses by date", drawer.body.tries.length === 2 && drawer.body.tries[0].id === t1.body.id);
  const drawerTag = await call("GET", "/tries?landed=no&style_tag=clipped", { key });
  check("the drawer filters by style_tag", drawerTag.body.tries.length === 1 && drawerTag.body.tries[0].id === t2.body.id);
  check("the drawer carries no rank or score", drawer.body.tries.every((t) => !("score" in t) && !("rank" in t)));

  const side = await call("GET", "/tries?session=current", { key });
  check("this session's tries come side by side with feedback", side.body.tries.length === 3 && side.body.tries.every((t) => t.feedback && t.text));

  const mk = await call("POST", `/tries/${t1.body.id}/mark`, { key, body: { what_tried: "hedging voice", why_back: "the counted cars line has a pull; unclear whether the hedges carry it or flatten it", own_lines: ["counted the cars that did not stop"], less_familiar: "the closing line" } });
  check("a missed try takes a mark with why_back and own_lines", mk.status === 201 && mk.body.try_landed === "no" && mk.body.own_lines.length === 1);
  const badMark = await call("POST", `/tries/${t1.body.id}/mark`, { key, body: { what_tried: "x", own_lines: ["a line that is not there"] } });
  check("own_lines must be exact spans of the try", badMark.status === 400);
  await call("POST", `/tries/${r1.body.id}/mark`, { key, body: { what_tried: "hedging voice", why_back: "fewer hedges, same scene" } });
  const ren = await call("POST", "/marks/rename", { key, body: { from: "hedging voice", to: "softening words, then fewer" } });
  const marks = await call("GET", "/marks", { key });
  check("marks group by what_tried and a rename moves the group", ren.body.marks_renamed === 2 && marks.body.grouped_by_what_tried["softening words, then fewer"].length === 2);

  const other = (await call("POST", "/keys")).body.key;
  const peek = await call("GET", `/tries/${t1.body.id}`, { key: other });
  const peekDrawer = await call("GET", "/tries?landed=no", { key: other });
  const peekMarks = await call("GET", "/marks", { key: other });
  check("another key reads none of these tries, the drawer, or marks", peek.status === 404 && peekDrawer.body.tries.length === 0 && Object.keys(peekMarks.body.grouped_by_what_tried).length === 0);
  const nokey = await call("GET", "/tries?landed=no");
  check("no key, no read", nokey.status === 401);

  const big = "x".repeat(8001);
  const capped = await call("POST", "/tries", { key, body: { text: big } });
  check("over the char cap: the reply names the cap and returns the draft", capped.status === 413 && capped.body.cap === "draft_chars" && capped.body.draft === big);

  const daily = (await call("POST", "/keys")).body.key;
  let last;
  for (let i = 0; i < 61; i++) last = await call("POST", "/tries", { key: daily, body: { text: `Try number ${i}.` } });
  check("the 61st try in a day: the reply names the cap, the reset time, and returns the draft", last.status === 429 && last.body.cap === "tries_per_key_per_day" && last.body.draft === "Try number 60." && !!Date.parse(last.body.resets));

  const flagsNo = await call("GET", "/admin/layout-flags");
  check("the admin page refuses a caller without Access", flagsNo.status === 403);
  const flags = await call("GET", "/admin/layout-flags", { headers: { "Cf-Access-Authenticated-User-Email": "emily@example.com" } });
  check("the admin page opens for the keeper (local-dev Access mode)", flags.status === 200 && Array.isArray(flags.body.flags));

  const end = await call("POST", "/session/end", { key });
  check("POST /session/end returns marks and own lines as plain text with an invitation back", typeof end.body === "string" && end.body.includes('reads as mine: "counted the cars that did not stop"') && /same key/.test(end.body));
  const after = await call("GET", "/tries?landed=no", { key });
  check("after the session ends, the same key brings the drawer back", after.body.tries.length === 2);
} catch (e) {
  check("walkthrough ran to the end", false, String(e));
} finally {
  stopDev();
}

const missed = results.filter((r) => !r).length;
console.log(`\n${results.length - missed} of ${results.length} checks passed.`);
process.exit(missed ? 1 : 0);
