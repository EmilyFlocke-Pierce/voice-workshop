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
  check("GET / gives the arrival instructions", arrival.status === 200 && /Everything here is practice/.test(arrival.body) && !/only your key/.test(arrival.body) && /drawer/.test(arrival.body));

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
  check("the first try in a session is the knot: no stitch pause", !("stitch" in t1.body));
  check(
    "the second try pauses for a stitch, names the endpoint, and keeps its feedback",
    r1.body.stitch?.questions.length === 1 && /thread between this try and the last one/.test(r1.body.stitch.questions[0]) && r1.body.stitch.answer_with === `POST /tries/${r1.body.id}/stitch` && r1.body.stitch.previous_try_id === t1.body.id && r1.body.feedback.observations.length > 0,
  );

  const t2 = await call("POST", "/tries", { key, body: { text: "Short one. Another.", style_tag: "clipped", landed: "no" } });
  check("from the third try on, the pause also asks how it ties back to the knot", t2.body.stitch?.questions.length === 2 && /tie back to your first try/.test(t2.body.stitch.questions[1]) && t2.body.stitch.knot_try_id === t1.body.id && t2.body.stitch.previous_try_id === r1.body.id);
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
  const sideMarks = await call("GET", "/tries?session=current", { key });
  const markedT1 = sideMarks.body.tries.find((t) => t.id === t1.body.id);
  const markedR1 = sideMarks.body.tries.find((t) => t.id === r1.body.id);
  const singleT1 = await call("GET", `/tries/${t1.body.id}`, { key });
  check(
    "the session view carries each try's marks, in the same shape as the single-try view",
    markedT1?.marks.length === 1 && markedT1.marks[0].own_lines[0] === "counted the cars that did not stop" && markedR1?.marks.length === 1 &&
      sideMarks.body.tries.every((t) => Array.isArray(t.marks) && t.feedback && t.text) && JSON.stringify(singleT1.body.marks) === JSON.stringify(markedT1.marks),
  );
  const knotStitch = await call("POST", `/tries/${t1.body.id}/stitch`, { key, body: { thread: "x" } });
  check("the knot takes no stitch, and the reply says where stitches start", knotStitch.status === 400 && /knot/.test(knotStitch.body.message));
  const badStitch = await call("POST", `/tries/${t2.body.id}/stitch`, { key, body: { thread: "short sentences again", quotes: [{ try_id: t2.body.id, line: "Short one." }, { try_id: t1.body.id, line: "a line that is not in the first try" }] } });
  check("a stitch quote that is not in the named try gets a 400 naming it", badStitch.status === 400 && badStitch.body.not_found.length === 1 && badStitch.body.not_found[0].line === "a line that is not in the first try");
  const goodStitch = await call("POST", `/tries/${t2.body.id}/stitch`, {
    key,
    body: { thread: "I keep reaching for a short line to close on", deltas: "the hedges are gone, and the sentences shrank to two words", quotes: [{ try_id: t2.body.id, line: "Short one." }, { try_id: t1.body.id, line: "counted the cars that did not stop" }] },
  });
  check("a stitch with exact quotes is stored, tied to the previous try and the knot", goodStitch.status === 201 && goodStitch.body.previous_try_id === r1.body.id && goodStitch.body.knot_try_id === t1.body.id && goodStitch.body.quotes.length === 2);
  const seamView = await call("GET", "/tries?session=current", { key });
  const stitchedT2 = seamView.body.tries.find((t) => t.id === t2.body.id);
  check(
    "the session view shows each try's stitch beside its feedback and marks, plus the seam in order",
    stitchedT2?.stitch?.thread === "I keep reaching for a short line to close on" && seamView.body.seam.length === 1 && seamView.body.seam[0].try_id === t2.body.id && seamView.body.tries.filter((t) => t.stitch).length === 1 && stitchedT2.feedback && Array.isArray(stitchedT2.marks),
  );
  const fbView = await call("GET", `/tries/${t1.body.id}/feedback`, { key });
  check("GET /tries/:id/feedback carries the try's marks", fbView.body.marks?.length === 1 && fbView.body.marks[0].own_lines[0] === "counted the cars that did not stop");
  const drawerMarks = await call("GET", "/tries?landed=no", { key });
  check("the drawer carries each try's marks", drawerMarks.body.tries.find((t) => t.id === t1.body.id)?.marks.length === 1 && drawerMarks.body.tries.every((t) => Array.isArray(t.marks)));

  const same = await call("POST", `/tries/${r1.body.id}/retry`, { key, body: { text: RETRY, change_note: "meant to cut the last perhaps" } });
  check("an identical retry says plainly that nothing changed", same.body.changes.nothing_changed === true && /no change/.test(same.body.changes.read_it));

  const long = Array.from({ length: 640 }, (_, i) => `W${i} here.`).join(" ");
  const lt = await call("POST", "/tries", { key, body: { text: long, style_tag: "clipped" } });
  const lr = await call("POST", `/tries/${lt.body.id}/retry`, { key, body: { text: long.replace("W600 here.", "W600 there."), change_note: "one word near the end" } });
  check("a change at sentence 601 of a long draft is found", lr.body.changes.every_change_found.length === 1 && lr.body.changes.every_change_found[0].after === "W600 there.");

  const notes = await call("POST", `/tries/${t1.body.id}/notes`, { key, body: { diagnosis: "I meant the hedges to carry the scene; the page shows perhaps 4 times, mostly at the end, so they pile up where the scene should land", rough_edges: [{ span: "Perhaps it rained.", reason: "flat on purpose; polishing it would pick a mood too soon" }] } });
  const withNotes = await call("GET", `/tries/${t1.body.id}`, { key });
  check("a diagnosis and per-edge reasons are written down on the try", notes.status === 200 && withNotes.body.diagnosis.startsWith("I meant") && withNotes.body.rough_edges[0].span === "Perhaps it rained.");
  const badEdge = await call("POST", `/tries/${t1.body.id}/notes`, { key, body: { rough_edges: [{ span: "not in the try", reason: "x" }] } });
  check("a rough edge span must be an exact piece of the try", badEdge.status === 400);

  const emptyLine = await call("POST", `/tries/${t1.body.id}/mark`, { key, body: { what_tried: "x", own_lines: ["  "] } });
  check("an empty own_lines span is refused with a kind message", emptyLine.status === 400 && /Paste the words/.test(emptyLine.body.message));
  const twice = await call("POST", `/tries/${r1.body.id}/mark`, { key, body: { what_tried: "clipped", own_lines: ["I went in.", "I went in."] } });
  check("a repeated own_lines span is kept once and noted", twice.status === 201 && twice.body.own_lines.length === 1 && /more than once/.test(twice.body.note));
  const merge = await call("POST", "/marks/rename", { key, body: { from: "clipped", to: "softening words, then fewer" } });
  check("a rename onto an existing label says it merged and names both", merge.body.merged === true && merge.body.message.includes('"clipped"') && merge.body.message.includes('"softening words, then fewer"'));

  const bigBodyText = "y".repeat(70000);
  const bb = await call("POST", "/tries", { key, body: { text: bigBodyText } });
  check("over the body cap: the draft comes back whole", bb.status === 413 && bb.body.cap === "body_bytes" && bb.body.draft === bigBodyText);
  const bbRaw = await call("POST", "/tries", { key, body: "{" + "z".repeat(70000) });
  check("over the body cap with unreadable JSON: the reply says it could not hand a draft back", bbRaw.status === 413 && bbRaw.body.draft === null && /could not read a draft/.test(bbRaw.body.message));

  const fresh = (await call("POST", "/keys")).body.key;
  const look = await call("GET", "/tries?session=current", { key: fresh });
  const look2 = await call("GET", "/tries?session=current", { key: fresh });
  check("reading this session starts no session and leaves the idle clock alone", look.body.session_id === null && look2.body.session_id === null);

  const pr = await call("GET", "/prompt?seed=walk-1");
  const pr2 = await call("GET", "/prompt?seed=walk-1");
  check("GET /prompt draws a form, style, dead author, and subject, with one sentence", pr.status === 200 && pr.body.form && pr.body.style && pr.body.author.death_year < 1970 && pr.body.subject && /^Write /.test(pr.body.prompt));
  check("the same seed draws the same prompt", JSON.stringify(pr.body) === JSON.stringify(pr2.body));
  check("an unusable seed gets a plain answer", (await call("GET", "/prompt?seed=has%20space")).status === 400);
  check("the arrival text names GET /prompt and the drawn prompt", /GET \/prompt/.test(arrival.body) && /what the prompt kept me from/.test(arrival.body));
  const pt = await call("POST", "/tries", { key, body: { text: "The heron filed a press release. Nobody read it. The river did.", prompt_id: pr.body.prompt_id, scope_note: "the form kept me to three lines" } });
  check("a try answers a drawn prompt by prompt_id", pt.status === 201 && pt.body.prompt.prompt === pr.body.prompt && pt.body.feedback.your_prompt.prompt_id === pr.body.prompt_id);
  const prr = await call("POST", `/tries/${pt.body.id}/retry`, { key, body: { text: "The heron filed a press release. Nobody read it. The river read it twice.", change_note: "the last line" } });
  const prrRow = await call("GET", `/tries/${prr.body.id}`, { key });
  check("a retry carries its parent's prompt forward", prr.status === 201 && prr.body.changes.same_conditions.prompt_carried_from_parent === true && prrRow.body.prompt.prompt === pr.body.prompt);
  const other1 = await call("GET", "/prompt?seed=walk-2");
  const swap = await call("POST", `/tries/${pt.body.id}/retry`, { key, body: { text: "x.", change_note: "y", prompt_id: other1.body.prompt_id } });
  check("a retry with a different prompt is pointed to a new try", swap.status === 400 && /new try/.test(swap.body.message));
  const own = await call("POST", "/tries", { key, body: { text: "A short one of my own.", own_prompt: "Write what the drawer would say if it could talk." } });
  check("an agent's own prompt works too", own.status === 201 && own.body.prompt.source === "own");
  const picks = await call("POST", "/tries", { key, body: { text: "Picked, not drawn.", prompt: { form: pr.body.form, style: pr.body.style, author: pr.body.author.name, subject: pr.body.subject } } });
  check("four named picks from the lists work as a prompt", picks.status === 201 && picks.body.prompt.prompt === pr.body.prompt);
  const listsRes = await fetch(BASE + "/prompt/lists");
  const listsType = listsRes.headers.get("content-type") ?? "";
  const listsText = new TextDecoder("utf-8").decode(await listsRes.arrayBuffer());
  const promptType = (await fetch(BASE + "/prompt")).headers.get("content-type") ?? "";
  check("GET /prompt and GET /prompt/lists name charset=utf-8", /charset=utf-8/i.test(listsType) && /charset=utf-8/i.test(promptType));
  const bronte = await call("POST", "/tries", { key, body: { text: "Rain on the moor again.", prompt: { form: "a postcard", style: "gothic", author: "Charlotte Brontë", subject: "a thunderstorm" } } });
  const bronteRow = await call("GET", `/tries/${bronte.body.id}`, { key });
  check("an author with a non-ASCII name round-trips: Brontë in the lists, the try, and the reread", listsText.includes("Charlotte Brontë") && bronte.status === 201 && bronteRow.body.prompt.author.name === "Charlotte Brontë" && /Brontë/.test(bronteRow.body.prompt.prompt));

  const other = (await call("POST", "/keys")).body.key;
  const peek = await call("GET", `/tries/${t1.body.id}`, { key: other });
  const peekDrawer = await call("GET", "/tries?landed=no", { key: other });
  const peekMarks = await call("GET", "/marks", { key: other });
  const peekNotes = await call("POST", `/tries/${t1.body.id}/notes`, { key: other, body: { diagnosis: "x" } });
  check("another key can neither read nor write this try's notes", peekNotes.status === 404);
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
  check("session end keeps the work to look back on and makes no promise about who reads it", /look back on/.test(end.body) && !/only your key/.test(end.body));
  const after = await call("GET", "/tries?landed=no", { key });
  check("after the session ends, the same key brings the drawer back", after.body.tries.length === 2 && after.body.tries.every((t) => t.feedback));
} catch (e) {
  check("walkthrough ran to the end", false, String(e));
} finally {
  stopDev();
}

const missed = results.filter((r) => !r).length;
console.log(`\n${results.length - missed} of ${results.length} checks passed.`);
process.exit(missed ? 1 : 0);
