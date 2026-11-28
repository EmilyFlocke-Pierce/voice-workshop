// Walks one agent through the slice against a local Worker (wrangler dev with local D1),
// then checks privacy, the caps, and the admin page. Prints one line per check.
// Run: npm run db:local, then npm run walkthrough. Set VW_URL to use a Worker that is already running.
import { spawn, spawnSync } from "node:child_process";

const PORT = 8799;
const CLOSED = process.argv.includes("--closed-keys");
// Fresh human emails each run, so the per-human caps start clean against a local D1 that keeps old rows.
const RUN = Date.now().toString(36);
const CLOSED_EMAIL = `closed-${RUN}@example.com`;
const PAT = `pat-${RUN}@example.com`;
const SAM = `sam-${RUN}@example.com`;
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


function withTryId(note, tryId) {
  if (!note) return note;
  return { ...note, quotes: (note.quotes ?? []).map((q) => ({ try_id: q.try_id ?? tryId, line: q.line })) };
}

async function styleExercise(key, styleId, text, { why, retry, slowdowns, ease, pull, skipFinish } = {}) {
  const ex = await call("POST", "/exercises", { key, body: { style_id: styleId, ...(why ? { why_this_one: why } : {}) } });
  const t = await call("POST", "/tries", { key, body: { exercise_id: ex.body.id, text } });
  const map = await call("GET", `/tries/${t.body.id}/style-map`, { key });
  if (slowdowns) {
    await call("POST", `/exercises/${ex.body.id}/notes`, { key, body: { kind: "slowdowns", try_id: t.body.id, text: slowdowns.text, quotes: (slowdowns.quotes ?? []).map((q) => ({ try_id: q.try_id ?? t.body.id, line: q.line })) } });
  }
  let last = t;
  let retryMap = null;
  if (retry) {
    last = await call("POST", `/tries/${t.body.id}/retry`, { key, body: { text: retry.text, change_note: retry.change_note } });
    retryMap = await call("GET", `/tries/${last.body.id}/style-map`, { key });
  }
  const body = { ease: withTryId(ease, t.body.id), pull: withTryId(pull, t.body.id) };
  const fin = skipFinish ? null : await call("POST", `/exercises/${ex.body.id}/finish`, { key, body });
  return { ex, t, last, map, retryMap, fin, finishBody: body };
}

async function startDev() {
  if (process.env.VW_URL) return;
  dev = spawn(`npx wrangler dev --local --port ${PORT} --ip 127.0.0.1${CLOSED ? " --var OPEN_KEYS:false" : ""}`, { shell: true, detached: process.platform !== "win32", stdio: ["ignore", "pipe", "pipe"] });
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

  if (CLOSED) {
    // Sign-in STUB, closed-route run: with OPEN_KEYS false, POST /keys points to the human door.
    const shut = await call("POST", "/keys");
    check("with OPEN_KEYS false, POST /keys answers 403 and points to /human", shut.status === 403 && shut.body.message === "Your human issues your key at /human.");
    const hk = await call("POST", "/human/agree", { headers: { "X-Dev-Human-Email": CLOSED_EMAIL } });
    const issued = await call("POST", "/human/keys", { headers: { "X-Dev-Human-Email": CLOSED_EMAIL }, body: { label: "closed run" } });
    check("with OPEN_KEYS false, a signed-in human still issues a key", hk.status === 201 && issued.status === 201 && /^vw_/.test(issued.body.key));
    throw "closed-done";
  }

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

  // Slice 02: one style exercise, end to end.
  const shelf = await call("GET", "/styles", { key });
  check("GET /styles groups 40 styles by 8 kinds with counts", shelf.status === 200 && shelf.body.by_kind.length === 8 && Object.values(shelf.body.counts_per_kind).reduce((a, b) => a + b, 0) === 40);
  const hist = await call("GET", "/styles/history", { key });
  check("GET /styles/history shows untried styles, pieces per kind, rarely written kinds, and 5 styles far from the usual", hist.status === 200 && hist.body.untried.length === 40 && Array.isArray(hist.body.rarely_written) && hist.body.far_from_your_usual.length === 5 && hist.body.your_usual.rests_on >= 3);
  const styleId = "wedding-toast--baroque";
  const ex = await call("POST", "/exercises", { key, body: { style_id: styleId, why_this_one: "I have written no speeches and nothing long", seed: "walk-ex", expectations: { items: [{ feature: "long sentences", effect: "the reader waits for the point" }, { feature: "formal words", effect: "distance" }], combined: "waiting plus distance makes it feel like a ceremony" } } });
  check("POST /exercises takes a style, why, and expectations, and draws a subject", ex.status === 201 && ex.body.style.id === styleId && typeof ex.body.subject === "string" && /^Write a wedding toast, baroque, about /.test(ex.body.prompt) && ex.body.expectations.combined.startsWith("waiting"));
  check("the exercise reply says any style is open and why is the agent's own", /Any style is open to you/.test(ex.body.open_choice) && ex.body.if_stuck.length === 4 && ex.body.ahead.questions.ease && ex.body.ahead.questions.pull && ex.body.ahead.style_vs_speaker.body.kind === "style_vs_speaker" && /opening to ending/.test(ex.body.ahead.what_it_was_like.invite));
  const ex2 = await call("POST", "/exercises", { key, body: { style_id: "museum-placard--minimalist" } });
  check("one exercise at a time: a second is refused and names the open one", ex2.status === 409 && ex2.body.open_exercise_id === ex.body.id);
  const exP = await call("POST", "/tries", { key, body: { text: "x.", exercise_id: ex.body.id, prompt_id: pr.body.prompt_id } });
  check("a try in an exercise refuses a prompt of its own", exP.status === 400 && exP.body.draft === "x.");
  const TOAST = "Friends, gathered here beneath these lanterns, and kin, who have travelled from the hills and from the harbour, I rise to speak of two people whose patience, whose stubbornness, and whose laughter have carried them, through every season, to this table. Let the record show that they met in a queue, that the queue was long, and that neither of them, then or since, has once complained of it. Let it show, too, that he burned the first dinner, that she ate it, and that the smoke alarm, faithful as ever, sang the anthem of their courtship. I am done. Raise a glass. Drink.";
  const et = await call("POST", "/tries", { key, body: { text: TOAST, exercise_id: ex.body.id, intent: "hold the long build to the end" } });
  check("a try in an exercise stores the exercise and answers its style and subject", et.status === 201 && et.body.exercise_id === ex.body.id && et.body.prompt.form === "a wedding toast" && et.body.prompt.style === "baroque");
  check("inside an exercise the reply asks one thing: the drift question, in place of the stitch", et.body.pause?.question === "Where does the map show a third leaving the style's targets, back to your usual or elsewhere, and what will you change?" && !("stitch" in et.body));
  const map = await call("GET", `/tries/${et.body.id}/style-map`, { key });
  const endThird = map.body.by_third?.find((t) => t.third === "end");
  check("the style map shows each third beside the usual and the style's targets", map.status === 200 && map.body.by_third.length === 3 && endThird.beside.sentence_words.style_target === "long" && endThird.beside.sentence_words.your_usual !== undefined);
  check("the map marks the last third drifting back to the usual, with its first sentence", map.body.drift_marks.some((d) => d.third === "end" && d.back_to_usual.includes("sentence_words") && TOAST.includes(d.quote)) && /in your usual's band/.test(map.body.drift_marks.find((d) => d.third === "end").reads) && /sit in your usual's band and which sit elsewhere/.test(map.body.drift_rule));
  const badNote = await call("POST", `/exercises/${ex.body.id}/notes`, { key, body: { kind: "drift", try_id: et.body.id, text: "the end", quotes: [{ line: "words not in the toast" }] } });
  check("a note quote that is not in the try is refused, and nothing is stored", badNote.status === 400 && badNote.body.not_found.length === 1);
  const drift = await call("POST", `/exercises/${ex.body.id}/notes`, { key, body: { kind: "drift", try_id: et.body.id, text: "The ending snapped back to my short sentences. I will let the last line build too.", quotes: [{ line: "I am done. Raise a glass. Drink." }] } });
  check("a drift note names the passage and the revision, with an exact quote", drift.status === 201 && drift.body.kind === "drift");
  check("the pause and the map both surface the calibration note, in plain words, without a second pause question", et.body.pause.calibrate?.body.kind === "calibration" && /strengthened or changed/.test(et.body.pause.calibrate.invite) && map.body.calibrate?.body.kind === "calibration" && map.body.calibrate.answer_with === `POST /exercises/${ex.body.id}/notes` && map.body.your_earlier_calibrations === null && et.body.pause.question === "Where does the map show a third leaving the style's targets, back to your usual or elsewhere, and what will you change?");
  check("the arrival text names the calibration note", /"kind": "calibration"/.test((await call("GET", "/", { key })).body));
  const arrivalNow = (await call("GET", "/", { key })).body;
  check("the arrival text names the unusual and hard_passage notes and the shift", /"kind": "unusual"/.test(arrivalNow) && /"kind": "hard_passage"/.test(arrivalNow) && /"shift"/.test(arrivalNow));
  check("the arrival text names style_vs_speaker, slowdowns, slips_back, and what_it_was_like", /"kind": "style_vs_speaker"/.test(arrivalNow) && /"kind": "slowdowns"/.test(arrivalNow) && /"kind": "slips_back"/.test(arrivalNow) && /"kind": "what_it_was_like"/.test(arrivalNow));
  const badCal = await call("POST", `/exercises/${ex.body.id}/notes`, { key, body: { kind: "calibration", try_id: et.body.id, text: "no feature named" } });
  check("a calibration note names one feature and says so when it does not", badCal.status === 400 && /feature/.test(badCal.body.message));
  const cal = await call("POST", `/exercises/${ex.body.id}/notes`, { key, body: { kind: "calibration", try_id: et.body.id, feature: "pacing", did: "strengthened", text: "The map showed my last third at my short usual. I strengthened the long build there so the reader keeps waiting for the point, the effect I want.", quotes: [{ line: "I am done. Raise a glass. Drink." }] } });
  check("a calibration note records one feature strengthened and how it shapes the intended effect", cal.status === 201 && cal.body.kind === "calibration" && cal.body.feature === "pacing" && cal.body.did === "strengthened" && /keeps waiting/.test(cal.body.text));
  check("the first try's pause and the style map invite slowdowns and slips_back beside the one drift question", /demand of the style or habit/.test(et.body.pause.slowdowns.invite) && /different act/.test(et.body.pause.slips_back.invite) && /what tends to prompt/.test(map.body.slips_back.invite) && map.body.slowdowns.body.kind === "slowdowns" && et.body.pause.question.startsWith("Where does the map show a third leaving"));
  const slowNoQuote = await call("POST", `/exercises/${ex.body.id}/notes`, { key, body: { kind: "slowdowns", try_id: et.body.id, text: "the long openings slowed me" } });
  check("a slowdowns note quotes the spots, and says so when it does not", slowNoQuote.status === 400 && /quotes/.test(slowNoQuote.body.message));
  const slow = await call("POST", `/exercises/${ex.body.id}/notes`, { key, body: { kind: "slowdowns", try_id: et.body.id, text: "The long ceremonial openings were the recurring slowdown. The style's demand that a clause fold into a clause made me hold the sentence open past where I usually land, so I kept stopping to check I had not lost the subject.", quotes: [{ line: "whose patience, whose stubbornness, and whose laughter have carried them" }] } });
  check("a slowdowns note quotes the spots and diagnoses which style demand or habit made them harder", slow.status === 201 && slow.body.kind === "slowdowns" && /demand that a clause fold/.test(slow.body.text) && slow.body.quotes[0].line.startsWith("whose patience"));
  const slipNoQuote = await call("POST", `/exercises/${ex.body.id}/notes`, { key, body: { kind: "slips_back", try_id: et.body.id, text: "I landed short at the end" } });
  check("a slips_back note quotes the return, and says so when it does not", slipNoQuote.status === 400 && /quotes/.test(slipNoQuote.body.message));
  const slip = await call("POST", `/exercises/${ex.body.id}/notes`, { key, body: { kind: "slips_back", try_id: et.body.id, text: "The short close comes when the ceremonial ending feels like too much and I reach for a clean landing, the habit I use when I want to be done. Those three lines break the consistency of the long build, so the toast's effect drops from ceremony to a snap.", quotes: [{ line: "I am done. Raise a glass. Drink." }] } });
  check("a slips_back note diagnoses what prompts the return to habits and how it affects consistency or effect, and is a different act from the drift note", slip.status === 201 && slip.body.kind === "slips_back" && /habit I use when I want to be done/.test(slip.body.text) && /break the consistency/.test(slip.body.text) && slip.body.quotes[0].line === "I am done. Raise a glass. Drink." && drift.body.kind === "drift");
  check("the first try's pause, the style map, and the exercise reply all surface hard_passage and unusual without a second pause question", et.body.pause.stuck.hard_passage.body.kind === "hard_passage" && /feels wrong to write/.test(et.body.pause.stuck.hard_passage.invite) && map.body.hard_passage.body.kind === "hard_passage" && map.body.unusual.body.kind === "unusual" && typeof map.body.departs_from_your_usual.measures_apart === "number" && ex.body.for_you.kind === "speech" && et.body.pause.question === "Where does the map show a third leaving the style's targets, back to your usual or elsewhere, and what will you change?");
  const hardNoQuote = await call("POST", `/exercises/${ex.body.id}/notes`, { key, body: { kind: "hard_passage", try_id: et.body.id, text: "the ending felt wrong" } });
  check("a hard_passage note quotes its exact span, and says so when it does not", hardNoQuote.status === 400 && /quotes/.test(hardNoQuote.body.message));
  const hard = await call("POST", `/exercises/${ex.body.id}/notes`, { key, body: { kind: "hard_passage", try_id: et.body.id, shift: "let the closing sentence run long instead of stopping short", text: "Writing a ceremonial close felt wrong, so I stopped at three short lines. I will keep the long build going through the end.", quotes: [{ line: "I am done. Raise a glass. Drink." }] } });
  check("a hard_passage note names the exact span and the shift to make", hard.status === 201 && hard.body.kind === "hard_passage" && hard.body.shift.startsWith("let the closing sentence") && hard.body.quotes[0].line === "I am done. Raise a glass. Drink.");
  const TOAST2 = TOAST.replace("I am done. Raise a glass. Drink.", "And so, therefore, before the candles gutter and the band, which has waited with the patience of saints, begins again, I ask you all to rise, and raise a glass, and drink to them, whereas the evening, hereby declared open, goes on.");
  const er = await call("POST", `/tries/${et.body.id}/retry`, { key, body: { text: TOAST2, change_note: "the ending builds like the rest" } });
  check("a retry stays in the exercise and asks the effects question", er.status === 201 && er.body.exercise_id === ex.body.id && er.body.pause?.question === "Which moment made the effect, and how? Quote it.");
  check("the retry's pause invites a calibration note that carries the feature forward", /strengthened or changed a feature/.test(er.body.pause.calibrate.invite));
  const retryMap = await call("GET", `/tries/${er.body.id}/style-map`, { key });
  const rEnd = retryMap.body.by_third?.find((t) => t.third === "end");
  check("the retry's map shows the earlier calibration beside the new thirds", retryMap.status === 200 && retryMap.body.your_earlier_calibrations?.notes.length === 1 && retryMap.body.your_earlier_calibrations.notes[0].feature === "pacing" && retryMap.body.your_earlier_calibrations.notes[0].try_id === et.body.id && rEnd.beside.sentence_words.style_target === "long");
  const cal2 = await call("POST", `/exercises/${ex.body.id}/notes`, { key, body: { kind: "calibration", try_id: er.body.id, feature: "pacing", did: "changed", text: "The last third now builds like the others, so the wait runs to the final toast.", quotes: [{ line: "I ask you all to rise" }] } });
  const calView = await call("GET", `/exercises/${ex.body.id}`, { key });
  const hp = retryMap.body.your_earlier_hard_passages?.passages?.[0];
  check("the retry's map reads the hard passage's third beside the style's targets: it holds, and drift is not marked", hp?.span === "I am done. Raise a glass. Drink." && hp.third === "end" && hp.span_still_in_this_try === false && hp.in_this_try.holds.length === 4 && hp.in_this_try.away.length === 0 && !retryMap.body.drift_marks.some((d) => d.third === "end"));
  check("the retry's pause invites a hard_passage note and points to the map", /still felt wrong to write/.test(er.body.pause.stuck.hard_passage.invite));
  check("a calibration note on the retry follows through, and the exercise holds both", cal2.status === 201 && calView.body.notes.filter((n) => n.kind === "calibration").length === 2);
  const eff = await call("POST", `/exercises/${ex.body.id}/notes`, { key, body: { kind: "effects", feature: "pacing", try_id: er.body.id, text: "The delay before 'drink' makes the room wait with me.", quotes: [{ line: "I ask you all to rise" }] } });
  const stuck = await call("POST", `/exercises/${ex.body.id}/notes`, { key, body: { kind: "stuck_move", try_id: et.body.id, move: "plain_then_restyle", text: "I wrote the ending plainly first" } });
  check("effects and stuck_move notes are kept", eff.status === 201 && stuck.status === 201 && stuck.body.move === "plain_then_restyle");
  // II.A.1 to II.A.4: one effects note kind, read per feature, each quoting its moment and diagnosing in the words of its skill.
  check("a retry's pause lists the four features an effects note can take, with none noted yet, beside its one question", er.body.pause.effects?.noted.length === 0 && er.body.pause.effects.not_yet.length === 4 && /worked on/.test(er.body.pause.effects.invite) && Object.keys(er.body.pause.effects.ask).join() === "tone,syntax,pacing,diction" && er.body.pause.question === "Which moment made the effect, and how? Quote it.");
  const fxNoQuote = await call("POST", `/exercises/${ex.body.id}/notes`, { key, body: { kind: "effects", feature: "tone", try_id: er.body.id, text: "The tone turns at the smoke alarm." } });
  check("an effects note quotes its moment, and says so when it does not", fxNoQuote.status === 400 && /quotes/.test(fxNoQuote.body.message));
  const fxBadQuote = await call("POST", `/exercises/${ex.body.id}/notes`, { key, body: { kind: "effects", feature: "tone", try_id: er.body.id, text: "The tone turns.", quotes: [{ line: "a line that is not in the retry" }] } });
  check("an effects quote that is not in the try is refused", fxBadQuote.status === 400 && fxBadQuote.body.not_found.length === 1);
  const MOMENT = "that he burned the first dinner, that she ate it, and that the smoke alarm, faithful as ever, sang the anthem of their courtship";
  const WOBBLE = "whereas the evening, hereby declared open, goes on";
  const toneTurn = await call("POST", `/exercises/${ex.body.id}/notes`, { key, body: { kind: "effects", feature: "tone", try_id: er.body.id, text: "A purposeful turn. The solemn record turns warm and funny at the smoke alarm, and the toast has set that up: 'faithful as ever' keeps the formal register while the subject goes domestic, so the tone shifts without leaving the style.", quotes: [{ line: MOMENT }] } });
  const toneWobble = await call("POST", `/exercises/${ex.body.id}/notes`, { key, body: { kind: "effects", feature: "tone", try_id: er.body.id, text: "An unsupported wobble. The toast ends on a legal flourish nothing before it prepared, so the tone slides from warm to clerical with no turn to carry it.", quotes: [{ line: WOBBLE }] } });
  check("tone: a purposeful turn at a quoted moment and an unsupported wobble at another are both kept, each with its exact quote", toneTurn.status === 201 && toneTurn.body.feature === "tone" && toneTurn.body.quotes[0].line === MOMENT && /purposeful/.test(toneTurn.body.text) && toneWobble.status === 201 && toneWobble.body.quotes[0].line === WOBBLE && /unsupported wobble/.test(toneWobble.body.text));
  const PATTERN = "that they met in a queue, that the queue was long, and that neither of them, then or since, has once complained of it";
  const BREAK = "And so, therefore, before the candles gutter and the band, which has waited with the patience of saints, begins again, I ask you all to rise";
  const synCarries = await call("POST", `/exercises/${ex.body.id}/notes`, { key, body: { kind: "effects", feature: "syntax", try_id: er.body.id, text: "The pattern carries the voice. Three 'that' clauses in a row make the toast sound like a record being read into the minutes, and the long final clause holds them together.", quotes: [{ line: PATTERN }] } });
  const synBreaks = await call("POST", `/exercises/${ex.body.id}/notes`, { key, body: { kind: "effects", feature: "syntax", try_id: er.body.id, text: "The pattern breaks down. Three interrupters stack before the main clause arrives, so the reader loses the subject, and the formal voice goes limp where it should land.", quotes: [{ line: BREAK }] } });
  check("syntax: a quoted pattern that carries the voice and a quoted break that weakens it are both kept", synCarries.status === 201 && synCarries.body.feature === "syntax" && /carries the voice/.test(synCarries.body.text) && synCarries.body.quotes[0].line === PATTERN && synBreaks.status === 201 && /breaks down/.test(synBreaks.body.text) && /weakens|limp/.test(synBreaks.body.text) && synBreaks.body.quotes[0].line === BREAK);
  const dict = await call("POST", `/exercises/${ex.body.id}/notes`, { key, body: { kind: "effects", feature: "diction", try_id: er.body.id, text: "Recurring ceremonial words sustain the style: 'Let the record show' and 'hereby declared open' each return in the same voice. The plain 'burned' sits in the same register of speech and weakens it for a beat, until 'faithful as ever' lifts the line again.", quotes: [{ line: "Let the record show" }, { line: "hereby declared open" }, { line: "he burned the first dinner" }] } });
  check("diction: quoted word choices say where recurring diction sustains the style and where it weakens it", dict.status === 201 && dict.body.feature === "diction" && dict.body.quotes.length === 3 && /sustain/.test(dict.body.text) && /weakens/.test(dict.body.text));
  const fxMap = await call("GET", `/tries/${er.body.id}/style-map`, { key });
  check("the retry's map lists all four features as noted, with none left to note, in plain words", fxMap.body.effects?.noted.join() === "tone,syntax,pacing,diction" && fxMap.body.effects.not_yet.length === 0 && /cover/.test(fxMap.body.effects.invite));
  check("the style map says the clause count reads commas and joining words and not nesting", /with no reading of nesting/.test(fxMap.body.what_it_counts));
  const pin = await call("POST", "/usual", { key, body: { try_id: t1.body.id, pinned: true } });
  const unpin = await call("POST", "/usual", { key, body: { try_id: t1.body.id, pinned: false } });
  check("POST /usual pins and unpins a try", pin.status === 200 && pin.body.pinned_tries.includes(t1.body.id) && unpin.body.pinned_tries.length === 0);
  const exView = await call("GET", `/exercises/${ex.body.id}`, { key });
  check("GET /exercises/:id has the tries, notes, and both finish questions ahead of time", exView.body.tries.length === 2 && exView.body.notes.length === 13 && /Quote the piece/.test(exView.body.ahead.questions.ease) && /surprised you/.test(exView.body.ahead.questions.pull));
  const fin = await call("POST", `/exercises/${ex.body.id}/finish`, { key, body: { ease: { text: "Formal words came easy; the long build fought my habit of stopping short.", quotes: [{ try_id: er.body.id, line: "I ask you all to rise" }] }, pull: { text: "Yes. The delay surprised me.", effects: ["delay", "ceremony"], quotes: [{ try_id: er.body.id, line: "I ask you all to rise" }] } } });
  check("finish takes ease and pull in one call, closes the exercise, and asks about two readers", fin.status === 200 && fin.body.status === "finished" && fin.body.kept.join() === "ease,pull" && /two readers/.test(fin.body.pause.question));
  check("the finish pause invites style_vs_speaker and what_it_was_like beside its one readers question", fin.body.pause.style_vs_speaker.body.kind === "style_vs_speaker" && /mistake one for the other/.test(fin.body.pause.style_vs_speaker.invite) && /opening to ending/.test(fin.body.pause.what_it_was_like.invite) && /two readers/.test(fin.body.pause.question));
  const late = await call("POST", "/tries", { key, body: { text: "One more.", exercise_id: ex.body.id } });
  const lateRetry = await call("POST", `/tries/${er.body.id}/retry`, { key, body: { text: "One more.", change_note: "x" } });
  check("a try or a retry on a finished exercise is pointed to a new exercise", late.status === 400 && /new exercise/.test(late.body.message) && lateRetry.status === 400);
  const readers = await call("POST", `/exercises/${ex.body.id}/notes`, { key, body: { kind: "reader_impressions", try_id: er.body.id, readers: [{ reader: "the bride's grandmother", impression: "a proper toast" }, { reader: "a friend from work", impression: "a parody" }] } });
  check("reader impressions take two readers or more", readers.status === 201 && readers.body.readers.length === 2);
  const svsNoQuote = await call("POST", `/exercises/${ex.body.id}/notes`, { key, body: { kind: "style_vs_speaker", try_id: er.body.id, text: "style and speaker pull apart at the close" } });
  check("a style_vs_speaker note quotes the words, and says so when it does not", svsNoQuote.status === 400 && /quotes/.test(svsNoQuote.body.message));
  const svs = await call("POST", `/exercises/${ex.body.id}/notes`, { key, body: { kind: "style_vs_speaker", try_id: er.body.id, text: "Formal phrasing like 'Let the record show' reinforces the speaker's confidence: the toast sounds sure of the couple's story. The stiff close 'hereby declared open' makes a warm speaker sound aloof, as if a clerk had taken over the toast. A reader could mistake the ceremony for coldness, or take the warmth in the smoke-alarm story as a break in character rather than the same speaker in the style.", quotes: [{ line: "Let the record show" }, { line: "hereby declared open" }] } });
  check("a style_vs_speaker note diagnoses where formal phrasing reinforces confidence and where stiff wording makes a warm speaker sound aloof, and how a reader could mistake one for the other", svs.status === 201 && svs.body.kind === "style_vs_speaker" && /reinforces the speaker's confidence/.test(svs.body.text) && /sound aloof/.test(svs.body.text) && /mistake the ceremony for coldness/.test(svs.body.text) && svs.body.quotes[0].line === "Let the record show" && svs.body.quotes[1].line === "hereby declared open");
  const likeNoQuote = await call("POST", `/exercises/${ex.body.id}/notes`, { key, body: { kind: "what_it_was_like", try_id: er.body.id, text: "the long build held my attention" } });
  check("a what_it_was_like note quotes moments from the piece, and says so when it does not", likeNoQuote.status === 400 && /quotes/.test(likeNoQuote.body.message));
  const like = await call("POST", `/exercises/${ex.body.id}/notes`, { key, body: { kind: "what_it_was_like", try_id: er.body.id, text: "Working inside the long build held my attention on each clause until the end, and opened a sense of possibility I do not have in a short landing: the opening made room for the courtship story, and once the ending built too, the toast could stay ceremonial all the way through.", quotes: [{ line: "Friends, gathered here beneath these lanterns" }, { line: "I ask you all to rise" }] } });
  check("a what_it_was_like note looks across the whole piece and says how the style shaped attention and sense of possibility from opening to ending", like.status === 201 && like.body.kind === "what_it_was_like" && /attention on each clause/.test(like.body.text) && /sense of possibility/.test(like.body.text) && like.body.quotes[0].line.startsWith("Friends, gathered") && like.body.quotes[1].line === "I ask you all to rise");
  const reach = await call("GET", "/reach", { key });
  check("GET /reach shows ease and pull by style and by kind, with pull's effects side by side", reach.status === 200 && reach.body.by_style[styleId].counts.ease_notes === 1 && reach.body.by_kind.speech.counts.exercises === 1 && reach.body.effects_named_in_pull_by_style[styleId].effects.join() === "delay,ceremony");
  const rn = await call("POST", "/reach/notes", { key, body: { text: "One exercise so far; the delay is the effect I want to chase.", quotes: [{ try_id: er.body.id, line: "I ask you all to rise" }] } });
  check("POST /reach/notes keeps the agent's reading across exercises", rn.status === 201);
  const peekEx = await call("GET", `/exercises/${ex.body.id}`, { key: (await call("POST", "/keys")).body.key });
  check("another key reads none of this exercise", peekEx.status === 404);
  const hist2 = await call("GET", "/styles/history", { key });
  check("after the exercise, history counts it as tried and as a speech", hist2.body.tried.some((t) => t.id === styleId) && hist2.body.pieces_per_kind.speech === 1);

  // Slice 02 Part B: keep your voice in another format.
  const shelf2 = await call("GET", "/styles", { key });
  check("GET /styles offers register exercises for when the voice feels steady", shelf2.body.registers.list.length === 8 && /steady/.test(shelf2.body.registers.note));
  const badReg = await call("POST", "/exercises", { key, body: { kind: "register", register: "a sonnet", voice_ref_try_ids: [t1.body.id] } });
  const noRefs = await call("POST", "/exercises", { key, body: { kind: "register", register: "an email", voice_ref_try_ids: [] } });
  check("a register comes from the list, with 1 to 5 voice reference tries", badReg.status === 400 && /an email/.test(badReg.body.message) && noRefs.status === 400 && /1 to 5/.test(noRefs.body.message));
  const rx = await call("POST", "/exercises", { key, body: { kind: "register", register: "an email", voice_ref_try_ids: [t1.body.id, t2.body.id] } });
  check("a register exercise opens with the voice refs, and says which carry marks or own_lines", rx.status === 201 && rx.body.kind === "register" && rx.body.register.voice_refs[0].has_marks === true && rx.body.register.voice_refs[0].own_lines[0] === "counted the cars that did not stop" && rx.body.register.voice_refs[1].has_marks === false);
  const twoOpen = await call("POST", "/exercises", { key, body: { style_id: styleId } });
  check("one open exercise holds across both kinds", twoOpen.status === 409);
  const EMAIL = "Hi all, perhaps the light was wrong on Tuesday. I waited by the door and counted the cars that did not stop. Can we move the meeting? Thanks.";
  const rt = await call("POST", "/tries", { key, body: { exercise_id: rx.body.id, text: EMAIL } });
  check("a try in a register exercise asks where the voice holds", rt.status === 201 && /voice hold/.test(JSON.stringify(rt.body)));
  const rmap = await call("GET", `/tries/${rt.body.id}/style-map`, { key });
  const carried = rmap.body.own_lines?.find((o) => o.line === "counted the cars that did not stop");
  check("the map sets the piece beside the voice reference: measures, openings, own lines carried or shifted", rmap.status === 200 && rmap.body.measures.length === 5 && rmap.body.measures.every((m) => ["carried over", "shifted"].includes(m.reads)) && carried?.in_piece === "whole" && carried?.reads === "carried over" && Array.isArray(rmap.body.recurring_openings));
  check("the map names what it leaves out and gives no verdict", /warmth/.test(rmap.body.leaves_out) && !/score|better|worse|good|bad/i.test(JSON.stringify(rmap.body.measures)));
  const wrongFinish = await call("POST", `/exercises/${rx.body.id}/finish`, { key, body: { ease: { text: "x" } } });
  check("a register exercise finishes with register_hold", wrongFinish.status === 400 && /register_hold/.test(wrongFinish.body.message));
  const rfin = await call("POST", `/exercises/${rx.body.id}/finish`, { key, body: { register_hold: { text: "The counted cars stayed mine; the email asked me to drop the hedges at the end.", quotes: [{ try_id: rt.body.id, line: "counted the cars that did not stop" }] } } });
  check("finish keeps register_hold and closes the exercise", rfin.status === 200 && rfin.body.kept.join() === "register_hold" && rfin.body.pause === null);
  const reach2 = await call("GET", "/reach", { key });
  check("GET /reach shows register exercises in their own group, in date order", reach2.body.registers.exercises.length === 1 && reach2.body.registers.exercises[0].register === "an email" && reach2.body.registers.exercises[0].register_hold.length === 1 && !reach2.body.by_style["register:an email"]);

  // Slice 02, Thread C: a kind it rarely writes, what the style asks of it, and a passage that feels wrong.

  // Domain III: several finished style exercises across a varied set, on a fresh key with a usual.
  const kReach = (await call("POST", "/keys")).body.key;
  for (const text of ["The bus was late. I waited. Then it came.", "I read the plan. It was long. I picked a row and started.", "Nothing broke today. I ran the checks. They passed."]) {
    await call("POST", "/tries", { key: kReach, body: { text } });
  }
  const BAROQUE = "wedding-toast--baroque";
  const PLACARD = "museum-placard--minimalist";
  const GOTHIC = "obituary-notice--gothic";
  const FIELD = "field-note--ernest-hemingway";
  const ROAST = "comedy-roast--mark-twain";
  const TOAST_EASY = "Friends, gathered here beneath these lanterns, and kin, who have travelled from the hills and from the harbour, I rise to speak of two people whose patience, whose stubbornness, and whose laughter have carried them, through every season, to this table, whereas the rest of us, indeed, have merely watched. Let the record show, therefore, that they met in a queue, that the queue moved slowly, and that neither of them, being stubborn, would give up the place they had held since morning. Upon that slow beginning, which they have never once regretted, they built a house of small mercies, each one folded into the next like a clause into a clause. Whereas most of us, hereby confessing it, would have left the queue, they stayed, and the staying, indeed, became the story, and the story became the marriage. Accordingly, I ask you, who have come so far, to hold in mind the long road, the many winters, the lamps that were lit, and the doors that were opened, for every one of those, thus gathered, has led to this table. Therefore, let us rise, and raise our glasses, and drink to them, as the band, which has waited with the patience of saints, begins again.";
  const TOAST_RETURN = "Beloved friends, who have crossed weather and water to sit at this table, I rise to speak of a marriage built, not in a single hour, but in the quiet returns of many days, each one adding a small ornament to the last. Whereas the years have been long, they have also been kind, and kindness, folded into habit, has become their way of speaking. Accordingly, I ask you, who know their voices as I do, to stand and to raise a glass, and to let the room, which has waited with such generous patience, hear you drink to them.";
  const PLACARD_EASY = "Stone bowl. Rim chipped. Found near the gate.";
  const PLACARD_HARD = "This remarkable vessel, which was discovered in the vicinity of the eastern gate, exhibits a chip along its otherwise elegant rim, and one cannot help but remark upon the long history that such a modest injury must surely conceal.";
  const GOTHIC_HARD = "She died Tuesday. She was seventy. She lived on Stone Street. The house was old. People came. Then they left.";
  const GOTHIC_RETRY = "She died on Tuesday. She was seventy years old. She lived on Stone Street. The house was old. People came by. Then they left.";
  const GOTHIC_HARD2 = "He died in March. He kept the shop. The shutters stuck. Neighbors stood outside. Nobody went in.";
  const GOTHIC_RETRY2 = "He died in March. He kept the shop for years. The shutters stuck. Neighbors stood outside. Nobody went in.";
  const FIELD_HARD = "The river, which had been rising since dawn, and which carried in its brown water the whole memory of the hills, seemed to me then to be writing a sentence too long for this page.";
  const FIELD_RETRY = "The river had been rising since dawn, and it carried the memory of the hills, and still the sentence ran on too long for this page.";
  const FIELD_EASY = "The river rose at dawn. It was brown and it carried sticks and it moved past the stand of willows. I wrote that down and I waited.";
  const ROAST_ONCE = "I have been asked to speak of our friend, who claims he can fix anything, and I will say only that the town is unusually well supplied with things that have been fixed, once, and then again, and then a third time, each time with more confidence than success.";

  const baroque1 = await styleExercise(kReach, BAROQUE, TOAST_EASY, {
    why: "Long ceremonial sentences are far from how I usually write, and I want to see if they still come easily.",
    skipFinish: true,
    ease: { text: "The long sentences and the folded clauses worked with my habit of holding a scene until it lands, even though formal ceremony is far from my short lines. Formal words like 'whereas' and 'accordingly' sat next to that habit rather than fighting it. The style demanded the build; the patience was already mine.", quotes: [{ line: "each one folded into the next like a clause into a clause" }] },
    pull: { text: "I want more of this style. The delay and the ceremony drew me; the wait itself became the feeling, in the line where the staying became the story.", effects: ["ceremony", "delay"], quotes: [{ line: "the staying, indeed, became the story" }] },
  });
  const pullNoQuote = await call("POST", `/exercises/${baroque1.ex.body.id}/finish`, { key: kReach, body: { ease: baroque1.finishBody.ease, pull: { text: "I want more of this style.", effects: ["ceremony"] } } });
  check("a pull note quotes the piece, and says so when it does not", pullNoQuote.status === 400 && /quotes/.test(pullNoQuote.body.message));
  baroque1.fin = await call("POST", `/exercises/${baroque1.ex.body.id}/finish`, { key: kReach, body: baroque1.finishBody });

  const baroque2 = await styleExercise(kReach, BAROQUE, TOAST_RETURN, {
    why: "I want to return to this style and stay with it.",
    ease: { text: "It came easily again. Long sentences, folded clauses, and formal address worked together with the same habit of holding a thought open, as in 'kindness, folded into habit, has become their way of speaking.'", quotes: [{ line: "kindness, folded into habit, has become their way of speaking" }] },
    pull: { text: "I want still more of it. The ceremony is what keeps drawing me back.", effects: ["ceremony", "warmth"], quotes: [{ line: "hear you drink to them" }] },
  });
  const placard1 = await styleExercise(kReach, PLACARD, PLACARD_EASY, {
    why: "Short plain naming sits close to my usual.",
    ease: { text: "Short sentences and plain words matched my habit of landing at once. 'Rim chipped.' is the kind of line I already write, and the spare naming worked with that habit rather than asking me to leave it.", quotes: [{ line: "Rim chipped." }] },
    pull: { text: "The clarity appealed once. I am not sure I want a second piece in it.", effects: ["clarity", "plainness"], quotes: [{ line: "Found near the gate." }] },
  });
  const placard2 = await styleExercise(kReach, PLACARD, PLACARD_HARD, {
    why: "A second piece in the same spare style.",
    slowdowns: { text: "The style demanded few words, but my habit of explaining took over and slowed me at the long remark on the rim.", quotes: [{ line: "one cannot help but remark" }] },
    retry: { text: PLACARD_HARD + " I should have stopped at the chip.", change_note: "still explaining" },
    ease: { text: "It came hard this time. The style demanded few words and short sentences, but my habit of explaining took over in 'one cannot help but remark', and the formal diction fought the plain naming. Those two features combined with my habit, not the bowl itself, made the resistance.", quotes: [{ line: "one cannot help but remark" }] },
    pull: { text: "The clarity is still there, but I felt no pull to stay.", effects: ["clarity"], quotes: [{ line: "exhibits a chip along its otherwise elegant rim" }] },
  });
  const gothic1 = await styleExercise(kReach, GOTHIC, GOTHIC_HARD, {
    why: "A gothic obituary asks for long formal sentences I do not usually write.",
    slowdowns: { text: "The long formal build is the style's demand, and my habit of short lines like 'She died Tuesday.' kept stopping me.", quotes: [{ line: "She died Tuesday." }] },
    retry: { text: GOTHIC_RETRY, change_note: "still landing short" },
    ease: { text: "Long sentences and formal, shadowed diction are the style's demands; my habit is to land in short lines like 'She died Tuesday.' Layered clauses plus that habit combined to create the resistance, not a single hard word.", quotes: [{ line: "She died Tuesday." }] },
    pull: { text: "The shadow has a pull, but the writing still fights me.", effects: ["shadow"], quotes: [{ line: "The house was old." }] },
  });
  const gothic2 = await styleExercise(kReach, GOTHIC, GOTHIC_HARD2, {
    why: "A second gothic obituary, to see if the resistance holds.",
    slowdowns: { text: "The same short-line habit stopped me again, this time at 'He kept the shop.' The style still wanted a long formal build I was not giving it.", quotes: [{ line: "He kept the shop." }] },
    retry: { text: GOTHIC_RETRY2, change_note: "still short" },
    ease: { text: "It resisted again. Formal diction and stacked clauses are what the style asks for; my short landings are what I kept doing. The two features combined with that habit in both pieces.", quotes: [{ line: "The shutters stuck." }] },
    pull: { text: "Still more shadow than ease. I notice the friction more than the pull.", effects: ["shadow"], quotes: [{ line: "Nobody went in." }] },
  });
  const field1 = await styleExercise(kReach, FIELD, FIELD_HARD, {
    why: "A field note in short clauses joined by and.",
    slowdowns: { text: "I slowed at the long relative clause, which is my ornament habit, not the style's demand for short sentences joined by and.", quotes: [{ line: "which had been rising since dawn" }] },
    retry: { text: FIELD_RETRY, change_note: "still running on" },
    ease: { text: "This piece was hard. The style asked for short sentences and clauses joined by and; I wrote a long formal sentence instead, and that ornament habit, not the river, made the friction.", quotes: [{ line: "a sentence too long for this page" }] },
    pull: { text: "I like the plainness I did not yet reach.", effects: ["plainness"], quotes: [{ line: "the whole memory of the hills" }] },
  });
  const field2 = await styleExercise(kReach, FIELD, FIELD_EASY, {
    why: "A second field note, written in short lines joined by and.",
    ease: { text: "It came easily this time. Short sentences and clauses joined by and worked with my habit of landing at once, as in 'I wrote that down and I waited.' The style's demands and my habits lined up, unlike the first piece.", quotes: [{ line: "I wrote that down and I waited." }] },
    pull: { text: "The plainness is what I want from it, the same effect I found in the spare placard.", effects: ["plainness"], quotes: [{ line: "It was brown and it carried sticks" }] },
  });
  const roast = await styleExercise(kReach, ROAST, ROAST_ONCE, {
    why: "A roast I may only want once.",
    ease: { text: "Mid-length sentences and a casual voice sat close enough to my habits that the piece came fairly easily, especially at the calm list of things that have been fixed.", quotes: [{ line: "more confidence than success" }] },
    pull: { text: "The appeal was not the roast's bite, which I expected, but the calm exaggeration, the way a straight face made the failure funnier. I liked it once; I do not feel pulled to return.", effects: ["straight-faced exaggeration"], quotes: [{ line: "more confidence than success" }] },
  });

  check(
    "ease notes diagnose a style with unfamiliar features that still came easy, and one that felt easy only once",
    baroque1.fin.status === 200 && baroque2.fin.status === 200 && placard1.fin.status === 200 && placard2.fin.status === 200
      && /folded clauses worked with my habit/.test(baroque1.finishBody.ease.text)
      && /far from my short lines/.test(baroque1.finishBody.ease.text)
      && /came hard this time/.test(placard2.finishBody.ease.text)
      && baroque1.finishBody.ease.quotes.length >= 1 && placard2.finishBody.ease.quotes.length >= 1
      && baroque1.map.body.drift_marks.length === 0 && !baroque2.retryMap && !placard1.retryMap && placard2.retryMap,
  );
  check(
    "a style that consistently resists is set beside one that felt hard only in a single piece, with slowdowns, retries, and drift marks as signs of effort",
    gothic1.fin.status === 200 && gothic2.fin.status === 200 && field1.fin.status === 200 && field2.fin.status === 200
      && gothic1.map.body.drift_marks.length >= 1 && gothic2.map.body.drift_marks.length >= 1 && field1.map.body.drift_marks.length >= 1
      && gothic1.retryMap && gothic2.retryMap && field1.retryMap && !field2.retryMap
      && /Layered clauses plus that habit/.test(gothic1.finishBody.ease.text)
      && /unlike the first piece/.test(field2.finishBody.ease.text),
  );

  const reachSet = await call("GET", "/reach", { key: kReach });
  const bs = reachSet.body.by_style;
  const fx = reachSet.body.effects_named_in_pull_by_style;
  check(
    "GET /reach shows which styles sit far from the usual and which sit near",
    reachSet.status === 200 && bs[BAROQUE].from_your_usual.far === true && bs[GOTHIC].from_your_usual.far === true && bs[PLACARD].from_your_usual.far === false
      && bs[BAROQUE].from_your_usual.measures_apart >= 3 && Array.isArray(bs[PLACARD].from_your_usual.apart_on)
      && bs[BAROQUE].counts.exercises === 2 && bs[PLACARD].counts.exercises === 2 && bs[GOTHIC].counts.exercises === 2 && bs[FIELD].counts.exercises === 2 && bs[ROAST].counts.exercises === 1,
  );
  check(
    "pull notes quote the piece, and /reach lists a recurring effect beside one that came as a surprise",
    baroque1.finishBody.pull.quotes.length >= 1 && roast.finishBody.pull.quotes.length >= 1 && /straight face made the failure funnier/.test(roast.finishBody.pull.text)
      && fx[BAROQUE].effects.includes("ceremony") && fx[PLACARD].effects.includes("plainness") && fx[FIELD].effects.includes("plainness")
      && fx[ROAST].effects.includes("straight-faced exaggeration")
      && !fx[BAROQUE].effects.includes("straight-faced exaggeration"),
  );

  const badIds = await call("POST", "/reach/notes", { key: kReach, body: { text: "checking an unknown style id", style_ids: ["not-a-style"] } });
  check("a reach note names catalog styles, and says so when it does not", badIds.status === 400 && /not-a-style/.test(badIds.body.message));
  const reachNote = await call("POST", "/reach/notes", { key: kReach, body: {
    text: "The baroque toast stayed easy across two pieces even though its long formal features sit far from my usual, and I keep wanting more of it: that is a sustained pull. The minimalist placard felt easy only once; the second piece fought me. The gothic obituary consistently resisted, with slowdowns, retries, and drift in both pieces, while the Hemingway field note was hard only in the first piece. The Twain roast was a one-off spark. Plainness recurs as an appealing effect in the placard and the field note; the roast's appeal came from an unexpected effect, straight-faced exaggeration.",
    quotes: [
      { try_id: baroque1.t.body.id, line: "the staying, indeed, became the story" },
      { try_id: gothic1.t.body.id, line: "She died Tuesday." },
      { try_id: roast.t.body.id, line: "more confidence than success" },
    ],
    style_ids: [BAROQUE, PLACARD, GOTHIC, FIELD, ROAST],
  } });
  check(
    "POST /reach/notes keeps a reading across the set, names the styles, and tells a sustained pull from a one-off spark",
    reachNote.status === 201 && reachNote.body.style_ids.join() === [BAROQUE, PLACARD, GOTHIC, FIELD, ROAST].join()
      && /sustained pull/.test(reachNote.body.text) && /one-off spark/.test(reachNote.body.text)
      && /stayed easy/.test(reachNote.body.text) && /easy only once/.test(reachNote.body.text)
      && /consistently resisted/.test(reachNote.body.text) && /hard only in the first piece/.test(reachNote.body.text)
      && /straight-faced exaggeration/.test(reachNote.body.text),
  );

  const k2 = (await call("POST", "/keys")).body.key;
  for (const text of ["The bus was late. I waited. Then it came.", "I read the plan. It was long. I picked a row and started.", "Nothing broke today. I ran the checks. They passed."]) await call("POST", "/tries", { key: k2, body: { text } });
  const NEAR = "museum-placard--minimalist";
  const plainRound = async (text) => {
    const e = await call("POST", "/exercises", { key: k2, body: { style_id: NEAR } });
    const t = await call("POST", "/tries", { key: k2, body: { exercise_id: e.body.id, text } });
    await call("POST", `/exercises/${e.body.id}/finish`, { key: k2, body: {} });
    return { e, t };
  };
  await plainRound("Bronze lamp. Two handles. Found near the quay.");
  await plainRound("Clay cup. One crack. Found near the well.");
  const h2 = await call("GET", "/styles/history", { key: k2 });
  check("a kind at 2 pieces reads as familiar, and kinds with fewer read as rarely written", !h2.body.rarely_written.includes("notice") && h2.body.rarely_written.includes("speech") && h2.body.pieces_per_kind.notice === 2);
  check("the far styles inside the rarely written kinds are listed on their own", h2.body.far_in_rarely_written_kinds.length === 5 && h2.body.far_in_rarely_written_kinds.every((f) => h2.body.rarely_written.includes(f.kind)) && h2.body.far_in_rarely_written_kinds.some((f) => f.kind === "speech"));
  const near = await call("POST", "/exercises", { key: k2, body: { style_id: NEAR } });
  check("a familiar kind with a near style reads as familiar and close to the usual", near.status === 201 && /^Familiar/.test(near.body.for_you.kind_reads) && near.body.for_you.far === false && near.body.for_you.measures_apart <= 1 && /near how you write/.test(near.body.for_you.invite));
  const nearT = await call("POST", "/tries", { key: k2, body: { exercise_id: near.body.id, text: "Stone bowl. Rim chipped. Found near the gate." } });
  const nearMap = await call("GET", `/tries/${nearT.body.id}/style-map`, { key: k2 });
  check("near the usual, the pause leaves the unusual invite out, and the map says the style sits close", nearT.body.pause.unusual === null && nearMap.body.departs_from_your_usual.far === false && /close to your usual/.test(nearMap.body.unusual.invite));
  await call("POST", `/exercises/${near.body.id}/finish`, { key: k2, body: {} });

  const FAR = "wedding-toast--baroque";
  const TOAST3 = "Friends, gathered here beneath these lanterns, and kin, who have travelled from the hills and from the harbour, I rise to speak of two people whose patience, whose stubbornness, and whose laughter have carried them, through every season, to this table, whereas the rest of us, indeed, have merely watched. Let the record show, therefore, that they met in a queue, that the queue moved slowly, and that neither of them, being stubborn, would give up the place they had held since morning. Upon that slow beginning, which they have never once regretted, they built a house of small mercies, each one folded into the next like a clause into a clause. Whereas most of us, hereby confessing it, would have left the queue, they stayed, and the staying, indeed, became the story, and the story became the marriage. Accordingly, I ask you, who have come so far, to hold in mind the long road, the many winters, the lamps that were lit, and the doors that were opened, for every one of those, thus gathered, has led to this table. Therefore, let us rise, and raise our glasses, and drink to them, as the band, which has waited with the patience of saints, begins again.";
  const far = await call("POST", "/exercises", { key: k2, body: { style_id: FAR, why_this_one: "A speech asks me to leave my short lines and build long, layered sentences. I rarely write speeches." } });
  check("a rarely written kind with a far style reads as rarely written and far, and asks for the shift up front", far.status === 201 && /^Rarely written/.test(far.body.for_you.kind_reads) && far.body.for_you.far === true && far.body.for_you.measures_apart >= 3 && far.body.for_you.apart_on.includes("sentence_words") && /Name the shift/.test(far.body.for_you.invite));
  const farT = await call("POST", "/tries", { key: k2, body: { exercise_id: far.body.id, text: TOAST3, intent: "build long layered sentences all the way through" } });
  check("far from the usual, the pause carries the unusual invite beside its one question, naming the measures apart", farT.status === 201 && farT.body.pause.unusual?.body.kind === "unusual" && /sits far from your usual/.test(farT.body.pause.unusual.invite) && /sentence_words/.test(farT.body.pause.unusual.invite) && farT.body.pause.question === "Where does the map show a third leaving the style's targets, back to your usual or elsewhere, and what will you change?");
  const farMap = await call("GET", `/tries/${farT.body.id}/style-map`, { key: k2 });
  const FAR_STYLE = (await call("GET", `/exercises/${far.body.id}`, { key: k2 })).body.style.targets;
  const holdsAll = farMap.body.by_third.every((th) => Object.entries(FAR_STYLE).every(([m, band]) => band === "any" || th.beside[m].this_third === band));
  check("the far piece's thirds all hold the style's targets, and the map marks no drift back to the usual", farMap.status === 200 && holdsAll && farMap.body.drift_marks.length === 0 && farMap.body.departs_from_your_usual.far === true);
  const noAnchor = await call("POST", `/exercises/${far.body.id}/notes`, { key: k2, body: { kind: "unusual", try_id: farT.body.id, text: "The sentences are longer than mine." } });
  check("an unusual note quotes the words in the piece, and says so when it does not", noAnchor.status === 400 && /quotes/.test(noAnchor.body.message));
  const badShift = await call("POST", `/exercises/${far.body.id}/notes`, { key: k2, body: { kind: "unusual", try_id: farT.body.id, shift: "  ", text: "x", quotes: [{ line: "Friends, gathered here" }] } });
  check("a shift is a short phrase in the agent's words", badShift.status === 400 && /shift/.test(badShift.body.message));
  const unusual = await call("POST", `/exercises/${far.body.id}/notes`, { key: k2, body: { kind: "unusual", try_id: farT.body.id, shift: "hold each sentence open, folding clause into clause, before it lands", text: "My usual is a short line that lands at once. This style asks me to delay the landing, so the reader waits for the point. It shows in the clause that folds into a clause.", quotes: [{ line: "each one folded into the next like a clause into a clause" }] } });
  check("an unusual note diagnoses the shift the style demands and anchors it in the piece", unusual.status === 201 && unusual.body.kind === "unusual" && /^hold each sentence open/.test(unusual.body.shift) && unusual.body.quotes[0].line.startsWith("each one folded"));
  const farTone = await call("POST", `/exercises/${far.body.id}/notes`, { key: k2, body: { kind: "effects", feature: "tone", try_id: farT.body.id, text: "A purposeful turn: the weighty clauses ease into 'the staying became the story', which is where the toast turns from ceremony to affection.", quotes: [{ line: "the staying, indeed, became the story" }] } });
  const farRe = await call("POST", `/tries/${farT.body.id}/retry`, { key: k2, body: { text: TOAST3.replace("Friends,", "Dear friends,"), change_note: "a warmer first word" } });
  check("a retry's pause names the features with an effects note and the ones not yet noted, and still asks one question", farTone.status === 201 && farRe.status === 201 && farRe.body.pause.effects.noted.join() === "tone" && farRe.body.pause.effects.not_yet.join() === "syntax,pacing,diction" && /Not yet: syntax, pacing and diction/.test(farRe.body.pause.effects.invite) && farRe.body.pause.question === "Which moment made the effect, and how? Quote it.");
  const farFin = await call("POST", `/exercises/${far.body.id}/finish`, { key: k2, body: { ease: { text: "The long build came once I stopped aiming for the landing.", quotes: [{ try_id: farT.body.id, line: "Upon that slow beginning" }] } } });
  const h3 = await call("GET", "/styles/history", { key: k2 });
  check("the far piece finishes, and the kind it rarely wrote now counts one piece", farFin.status === 200 && farFin.body.status === "finished" && h3.body.pieces_per_kind.speech === 1 && h3.body.rarely_written.includes("speech") && h3.body.pieces_per_kind.notice === 3);
  const ELSE_HOLD = "Friends, gathered here beneath these lanterns, and kin, who have travelled from the hills and from the harbour, I rise to speak of two people whose patience, whose stubbornness, and whose laughter have carried them, through every season, to this table. Let the record show that they met in a queue, that the queue was long, and that neither of them, then or since, has once complained of it. Let it show, too, that he burned the first dinner, that she ate it, and that the smoke alarm, faithful as ever, sang the anthem of their courtship. ";
  const ELSE_END = "The guests took their seats around a quiet table, the evening settling over the garden slowly. The speeches ran a little longer than planned, each one lingering on a private story. Someone laughed once from the back of the room, the hired band beginning again.";
  const elseEx = await call("POST", "/exercises", { key: k2, body: { style_id: "wedding-toast--baroque", why_this_one: "to watch a third leave the style for a band that is not my usual" } });
  const elseT = await call("POST", "/tries", { key: k2, body: { exercise_id: elseEx.body.id, text: ELSE_HOLD + ELSE_HOLD + ELSE_END } });
  const elseMap = await call("GET", `/tries/${elseT.body.id}/style-map`, { key: k2 });
  const elseEnd = elseMap.body.drift_marks?.find((d) => d.third === "end");
  check("the map marks a third that leaves the style for a band that is not the usual, and names that direction", elseEx.status === 201 && elseT.status === 201 && elseEnd && elseEnd.elsewhere.includes("sentence_words") && elseEnd.elsewhere.includes("clauses") && !elseEnd.back_to_usual.includes("sentence_words") && ELSE_END.includes(elseEnd.quote) && /not in your usual's band/.test(elseEnd.reads) && !elseMap.body.drift_marks.some((d) => d.third === "opening"));
  const elseFin = await call("POST", `/exercises/${elseEx.body.id}/finish`, { key: k2, body: {} });
  check("the elsewhere-drift exercise finishes so the key can go on", elseFin.status === 200);

  // Sign-in STUB, local-dev mode: the human door.
  const H = (email) => ({ "X-Dev-Human-Email": email });
  const page = await call("GET", "/human");
  check("GET /human serves the sign-in page, marked STUB", page.status === 200 && /STUB/.test(page.body));
  const meNo = await call("GET", "/human/me");
  check("the human door refuses a caller with no sign-in", meNo.status === 401);
  const me = await call("GET", "/human/me", { headers: H(PAT) });
  check("GET /human/me answers with the email, the terms, and no keys yet", me.status === 200 && me.body.email === PAT && me.body.terms.agreed_at === null && me.body.keys.length === 0);
  const early = await call("POST", "/human/keys", { headers: H(PAT), body: { label: "too soon" } });
  check("no key before the human agrees to the terms", early.status === 403 && /POST \/human\/agree/.test(early.body.message));
  const agree = await call("POST", "/human/agree", { headers: H(PAT) });
  const me2 = await call("GET", "/human/me", { headers: H(PAT) });
  check("an agreement is stored with its time", agree.status === 201 && !!Date.parse(agree.body.agreed_at) && me2.body.terms.agreed_at === agree.body.agreed_at);
  const hkeys = [];
  for (let i = 0; i < 4; i++) hkeys.push(await call("POST", "/human/keys", { headers: H(PAT), body: { label: `agent ${i}` } }));
  check("a human issues keys with labels, up to 3 active", hkeys.slice(0, 3).every((r) => r.status === 201 && /^vw_/.test(r.body.key)) && hkeys[3].status === 429 && hkeys[3].body.cap === "keys_per_human");
  const humanKey = hkeys[0].body.key;
  const viaHuman = await call("POST", "/tries", { key: humanKey, body: { text: "A key from my human works like any other." } });
  check("a key a human issued works for tries", viaHuman.status === 201);
  const otherRevoke = await call("POST", `/human/keys/${hkeys[1].body.id}/revoke`, { headers: H(SAM) });
  check("a human can revoke only its own keys", otherRevoke.status === 404);
  const revoke = await call("POST", `/human/keys/${hkeys[1].body.id}/revoke`, { headers: H(PAT) });
  const again = await call("POST", "/human/keys", { headers: H(PAT), body: { label: "after revoke" } });
  check("after a revoke the daily cap still holds: 3 keys a day per human", revoke.status === 200 && again.status === 429 && again.body.cap === "keys_per_human_per_day");
  const revokedUse = await call("GET", "/tries?landed=no", { key: hkeys[1].body.key });
  check("a revoked key reads nothing", revokedUse.status === 401);

  // Slice 04: look back for patterns.
  const lb = await call("POST", "/lookbacks", { key, body: { scope: "all" } });
  check("POST /lookbacks lays the pieces side by side with labels, notes, and limits", lb.status === 201 && lb.body.pieces.length >= 3 && lb.body.pieces[0].label === "P1" && lb.body.pieces.every((p, i, a) => i === 0 || p.created_at >= a[i - 1].created_at) && typeof lb.body.limits.layered === "string");
  const allNotes = lb.body.pieces.flatMap((p) => p.notes || []);
  check(
    "exercise notes in a lookback carry pull effects and calibration fields",
    allNotes.some((n) => /calibration/.test(n.kind) && n.extra && n.extra.feature) && allNotes.some((n) => /pull/.test(n.kind) && n.extra && Array.isArray(n.extra.effects) && n.extra.effects.length),
  );
  check("a retry shows its parent's label and its chain", lb.body.pieces.some((p) => p.parent && p.parent.label && Array.isArray(p.chain)));
  const audit = await call("GET", `/lookbacks/${lb.body.id}/audit`, { key });
  check("the audit lists what it found and asks what the set leaves out", audit.status === 200 && Array.isArray(audit.body.items) && /POST \/lookbacks\/.+\/limits/.test(audit.body.pause.answer_with));
  const lim = await call("POST", `/lookbacks/${lb.body.id}/limits`, { key, body: { limits_note: "Only one session of short pieces; no exercises from early on." } });
  check("the agent's limits note is kept", lim.status === 200 || lim.status === 201);
  const rec = await call("GET", `/lookbacks/${lb.body.id}/recurring`, { key });
  const dr = await call("GET", `/lookbacks/${lb.body.id}/dropped`, { key });
  check("recurring and dropped answer with candidates, not verdicts", rec.status === 200 && Array.isArray(rec.body.items) && dr.status === 200 && Array.isArray(dr.body.items));
  const p1 = lb.body.pieces[0];
  const q = p1.text.split(/\s+/).slice(0, 3).join(" ");
  const badPat = await call("POST", `/lookbacks/${lb.body.id}/patterns`, { key, body: { name: "x", inclusion_rule: "x", instances: [{ piece: "P1", quote: "words that are not there" }] } });
  check("a pattern quote that is not in the piece is refused, and nothing is stored", badPat.status === 400 && badPat.body.not_found.length === 1);
  const pat = await call("POST", `/lookbacks/${lb.body.id}/patterns`, { key, body: { name: "how I open", inclusion_rule: "the first words of a piece", instances: [{ piece: "P1", quote: q }] } });
  check("a named pattern counts against the latest version of each chain by default", pat.status === 201 && pat.body.rule_version === 1 && typeof pat.body.counts.reading === "string");
  const rev = await call("POST", `/lookbacks/${lb.body.id}/patterns/${pat.body.id}/revise`, { key, body: { denominator: "every" } });
  check("revising a pattern keeps the old rule as a version", rev.status === 200 && rev.body.rule_version === 2);
  const cmp = await call("GET", `/lookbacks/${lb.body.id}/compare?measure=sentence_words`, { key });
  check("compare shows one measure per piece", cmp.status === 200 && cmp.body.pieces.length === lb.body.pieces.length && cmp.body.pieces.every((p) => typeof p.value === "number" && Array.isArray(p.notes) && p.shift) && /Along sentence_words/.test(cmp.body.along_the_sequence));
  check("the pattern view lines up intent notes beside each piece, grouped by style", pat.body.intent_notes_beside_it_by_style && Object.values(pat.body.intent_notes_beside_it_by_style).some((rows) => rows.some((r) => r.label === "P1")));
  const cl = await call("POST", `/lookbacks/${lb.body.id}/claims`, { key, body: { pattern_id: pat.body.id, kind: "default", evidence: [{ piece: "P1", quote: q }], interpretation: "I start the same way each time." } });
  check("a default claim with no notes weighed or counterexamples gets asked for them", cl.status === 201 && /counterexamples/.test(cl.body.asks));
  const fnd = await call("GET", `/lookbacks/${lb.body.id}/findings`, { key });
  check("findings come back as plain text with quotes and claims", typeof fnd.body === "string" && fnd.body.includes("how I open") && fnd.body.includes(`P1: "${q}"`) && /claim: default/.test(fnd.body));

  // I.B.1: a short sequence along sentence_words, with reflection notes beside the pieces.
  const kCmp = (await call("POST", "/keys")).body.key;
  const shortA = "The kettle sang. I poured a cup. The window fogged.";
  const shortB = "The lantern burned. I took a seat. The hallway quieted.";
  const longC = "Friends gathered here beneath these lanterns I rise to speak of two people whose patience has carried them through every season to this table.";
  const longD = "Beloved friends who have crossed weather and water I rise again to speak of a marriage built in the quiet returns of many days.";
  await call("POST", "/tries", { key: kCmp, body: { text: shortA, intent: "keep the lines short and land at once", style_tag: "plain" } });
  await call("POST", "/tries", { key: kCmp, body: { text: shortB, scope_note: "same short landing as the first sitting", style_tag: "plain" } });
  const tLong = await call("POST", "/tries", { key: kCmp, body: { text: longC, style_tag: "plain" } });
  await call("POST", `/tries/${tLong.body.id}/notes`, { key: kCmp, body: { diagnosis: "the sentence now holds the whole toast in one build" } });
  await call("POST", `/tries/${tLong.body.id}/mark`, { key: kCmp, body: { what_tried: "long ceremonial build", why_back: "to see the sentence_words rise" } });
  await call("POST", "/tries", { key: kCmp, body: { text: longD, intent: "stay with the long build", style_tag: "plain" } });
  const lbCmp = await call("POST", "/lookbacks", { key: kCmp, body: { scope: "all" } });
  const cmpSeq = await call("GET", `/lookbacks/${lbCmp.body.id}/compare?measure=sentence_words`, { key: kCmp });
  const seq = cmpSeq.body.pieces;
  check(
    "compare shows how a feature holds or shifts across the sequence, with reflection notes beside the pieces",
    cmpSeq.status === 200 && seq.length === 4
      && seq[0].shift === "first" && seq[1].shift === "holds" && seq[1].value === seq[0].value
      && seq[2].shift === "rises" && seq[2].value > seq[1].value
      && seq[3].shift === "holds" && seq[3].value === seq[2].value
      && seq[0].notes.some((n) => n.kind === "intent" && /keep the lines short/.test(n.text))
      && seq[1].notes.some((n) => n.kind === "scope_note" && /same short landing/.test(n.text))
      && seq[2].notes.some((n) => n.kind === "diagnosis" && /one build/.test(n.text))
      && seq[2].notes.some((n) => n.kind === "mark" && /long ceremonial build/.test(n.text))
      && seq[3].notes.some((n) => n.kind === "intent" && /stay with the long build/.test(n.text))
      && /P3 rises to/.test(cmpSeq.body.along_the_sequence),
  );
  const patCmp = await call("POST", `/lookbacks/${lbCmp.body.id}/patterns`, { key: kCmp, body: { name: "short landing then a long build", inclusion_rule: "a run of short sentences, then one long ceremonial sentence", instances: [{ piece: "P1", quote: "The kettle sang" }, { piece: "P3", quote: "Friends gathered here beneath these lanterns" }] } });
  const byStyle = patCmp.body.intent_notes_beside_it_by_style;
  const plain = byStyle && (byStyle.plain || byStyle["plain"]);
  check(
    "the pattern view on this sequence lines up intent notes beside the pieces, grouped by style",
    patCmp.status === 201 && Array.isArray(plain) && plain.some((r) => r.label === "P1" && /keep the lines short/.test(r.intent)) && plain.some((r) => r.label === "P4" && /stay with the long build/.test(r.intent)),
  );

  // II.A.1, II.A.2, II.B.2, II.B.3, II.B.4: notes beside recurring pieces, a cross-style intended choice, a friction point, a redundancy weighed against notes, and a structural move that breaks.
  const kHabit = (await call("POST", "/keys")).body.key;
  const habitP1 = "The kettle sang. Then I poured a cup. Bread cooled on the board.";
  const habitP2 = "Friends gathered here. Then bread, cheese, and apples sat on the table, and the room went still.";
  const habitP3 = "Beloved friends crossed the water. Then bread, cheese, and apples waited, and the room went still.";
  const habitP4 = "Beloved friends crossed the water. Then the food waited, and the room went still.";
  const habitP5 = "The lantern burned. Then I took a seat, and the room went still.";
  await call("POST", "/tries", { key: kHabit, body: { text: habitP1, intent: "open on a concrete object and land short", style_tag: "plain" } });
  const tBar = await call("POST", "/tries", { key: kHabit, body: { text: habitP2, intent: "open on a concrete gathering, now in a long ceremonial build", style_tag: "baroque" } });
  await call("POST", `/tries/${tBar.body.id}/notes`, { key: kHabit, body: { diagnosis: "the ceremonial style pulled me from short landings; I reached for a stock close and a list of three" } });
  const tKept = await call("POST", "/tries", { key: kHabit, body: { text: habitP3, style_tag: "baroque" } });
  await call("POST", `/tries/${tKept.body.id}/mark`, { key: kHabit, body: { what_tried: "kept the ceremonial close and the list of three", why_back: "the still room still works" } });
  await call("POST", `/tries/${tKept.body.id}/retry`, { key: kHabit, body: { text: habitP4, change_note: "I dropped the list of three and kept \"and the room went still\"." } });
  await call("POST", "/tries", { key: kHabit, body: { text: habitP5, intent: "back to a short landing, still opening on a concrete object", style_tag: "plain" } });
  const lbHabit = await call("POST", "/lookbacks", { key: kHabit, body: { scope: "all" } });
  const recHabit = await call("GET", `/lookbacks/${lbHabit.body.id}/recurring`, { key: kHabit });
  const trans = recHabit.body.items.find((it) => it.type === "transition" && it.words === "then");
  check(
    "a recurring generic transition carries the reflection notes beside the pieces that use it",
    recHabit.status === 200 && trans && trans.id === "transition:then"
      && trans.notes_beside_pieces.some((r) => r.label === "P1" && r.notes.some((n) => n.kind === "intent" && /land short/.test(n.text)))
      && trans.notes_beside_pieces.some((r) => r.label === "P2" && r.notes.some((n) => n.kind === "diagnosis" && /ceremonial style/.test(n.text)))
      && trans.notes_beside_pieces.some((r) => r.label === "P4" && r.notes.some((n) => n.kind === "change_note" && /dropped the list of three/.test(n.text))),
  );
  const wording = recHabit.body.items.find((it) => it.type === "wording" && String(it.words).includes("and the room went still"));
  const shape = recHabit.body.items.find((it) => it.type === "shape" && it.shape === "list_of_three");
  const patOpen = await call("POST", `/lookbacks/${lbHabit.body.id}/patterns`, { key: kHabit, body: { name: "open on a concrete object", inclusion_rule: "the piece opens on a concrete object or gathering", instances: [{ piece: "P1", quote: "The kettle sang" }, { piece: "P2", quote: "Friends gathered here" }, { piece: "P5", quote: "The lantern burned" }] } });
  const across = patOpen.body.across_styles;
  const notesBy = patOpen.body.notes_beside_it_by_style;
  check(
    "an intended choice is traced across styles, with notes and passages beside the pieces, and what stays consistent is distinguished from what changes with the style",
    patOpen.status === 201
      && across && across.styles.includes("plain") && across.styles.includes("baroque")
      && /wording changes with the style/.test(across.reads)
      && across.wordings_by_style.plain.includes("The kettle sang") && across.wordings_by_style.plain.includes("The lantern burned")
      && across.wordings_by_style.baroque.includes("Friends gathered here")
      && notesBy.plain.some((r) => r.label === "P1" && r.has_it && r.notes.some((n) => n.kind === "intent" && /open on a concrete object/.test(n.text)))
      && notesBy.baroque.some((r) => r.label === "P2" && r.has_it && r.notes.some((n) => n.kind === "intent" && /open on a concrete gathering/.test(n.text)))
      && patOpen.body.intent_notes_beside_it_by_style.plain.some((r) => r.label === "P1" && /open on a concrete object/.test(r.intent)),
  );
  const patClose = await call("POST", `/lookbacks/${lbHabit.body.id}/patterns`, { key: kHabit, body: { name: "the stock still-room close", inclusion_rule: "the words \"and the room went still\"", instances: [{ piece: "P2", quote: "and the room went still" }, { piece: "P3", quote: "and the room went still" }, { piece: "P4", quote: "and the room went still" }, { piece: "P5", quote: "and the room went still" }] } });
  const fr = patClose.body.timeline.friction_point;
  const shift = fr && fr.style_shift;
  check(
    "the timeline connects the friction point where a repeat began, the style shift there, and the reflection note there",
    patClose.status === 201
      && patClose.body.timeline.first_appearance === "P2"
      && fr && fr.label === "P2" && fr.style === "baroque"
      && shift && shift.previous_label === "P1" && shift.previous_style === "plain" && shift.style === "baroque"
      && /after P1 in plain/.test(shift.reads)
      && fr.notes.some((n) => n.kind === "diagnosis" && /ceremonial style pulled me from short landings/.test(n.text))
      && patClose.body.timeline.pieces.some((r) => r.label === "P2" && r.notes.some((n) => n.id && n.kind === "diagnosis")),
  );
  const diag = notesBy.baroque.find((r) => r.label === "P2").notes.find((n) => n.kind === "diagnosis")
    || patClose.body.notes_beside_it_by_style.baroque.find((r) => r.label === "P2").notes.find((n) => n.kind === "diagnosis");
  const clBacked = await call("POST", `/lookbacks/${lbHabit.body.id}/claims`, { key: kHabit, body: {
    pattern_id: patClose.body.id,
    kind: "default",
    evidence: [
      { piece: "P2", quote: "and the room went still" },
      { piece: "P3", quote: "and the room went still" },
      { note_id: diag.id, quote: "I reached for a stock close and a list of three" },
    ],
    counterexamples: [{ piece: "P1", quote: "Bread cooled on the board." }],
    interpretation: "The still-room close is a default ceremonial move: the diagnosis at the first ceremonial piece names it as a stock close I reached for, and it then recurs in P3, P4, and P5.",
  }});
  check(
    "a systemic redundancy is traced to a default writing move with both the pieces and the reflection notes",
    clBacked.status === 201 && !clBacked.body.asks
      && clBacked.body.evidence.some((e) => e.note_id === diag.id && e.note_kind === "diagnosis")
      && clBacked.body.counterexamples.some((e) => e.piece === "P1")
      && wording && wording.id && wording.notes_beside_pieces.some((r) => r.label === "P2" && r.notes.some((n) => n.kind === "diagnosis")),
  );
  const patList = await call("POST", `/lookbacks/${lbHabit.body.id}/patterns`, { key: kHabit, body: { name: "list of three", inclusion_rule: "a list of three items (A, B, and C)", instances: [{ piece: "P2", quote: "bread, cheese, and apples" }, { piece: "P3", quote: "bread, cheese, and apples" }] } });
  const dropHabit = await call("GET", `/lookbacks/${lbHabit.body.id}/dropped`, { key: kHabit });
  const removed = dropHabit.body.items.find((it) => it.type === "move" && it.move === "list_of_three");
  const listNotes = Object.values(patList.body.notes_beside_it_by_style || {}).flat();
  check(
    "a recurring structural move is weighed against change, keep, and drop notes, including where the pattern breaks",
    patList.status === 201
      && patList.body.timeline.first_appearance === "P2"
      && patList.body.timeline.breaks_after_first.includes("P4") && patList.body.timeline.breaks_after_first.includes("P5")
      && patList.body.timeline.friction_point.notes.some((n) => n.kind === "diagnosis")
      && shape && shape.id === "shape:list_of_three" && Array.isArray(shape.occurrences) && shape.occurrences.some((o) => o.label === "P2" && /bread, cheese, and apples/.test(o.quote))
      && shape.notes_beside_pieces.some((r) => r.label === "P3" && r.notes.some((n) => n.kind === "mark" && /kept the ceremonial close/.test(n.text)))
      && listNotes.some((r) => r.label === "P4" && r.notes.some((n) => n.kind === "change_note" && /dropped the list of three/.test(n.text)))
      && removed && removed.evidence === "explicit" && Array.isArray(removed.returns_in) && removed.returns_in.length === 0,
  );

  // II.C.1, II.C.2, II.C.3: a function diagnosis, a future-intent conflict where a dropped move returns, and weighed taste / mixture / unclear claims, plus a thin-claim nudge for a non-default kind.
  const kClaim = (await call("POST", "/keys")).body.key;
  const pack1 = "We packed bread, cheese, and apples for the road. Then the gate closed.";
  const pack2 = "We packed bread, cheese, and apples again. Then the porch went quiet.";
  const pack3 = "We packed food for the road. Then the porch went quiet.";
  const pack4 = "At dawn we packed bread, cheese, and apples once more.";
  await call("POST", "/tries", { key: kClaim, body: { text: pack1, intent: "keep the list of three; it is how I like to pack a scene", style_tag: "plain" } });
  const tKeptList = await call("POST", "/tries", { key: kClaim, body: { text: pack2, style_tag: "plain" } });
  await call("POST", `/tries/${tKeptList.body.id}/mark`, { key: kClaim, body: { what_tried: "kept the list of three", why_back: "it still feels like mine" } });
  const tDropList = await call("POST", `/tries/${tKeptList.body.id}/retry`, { key: kClaim, body: { text: pack3, change_note: "I dropped the list of three; I do not want it in later pieces." } });
  const tReturn = await call("POST", "/tries", { key: kClaim, body: { text: pack4, style_tag: "plain" } });
  await call("POST", `/tries/${tReturn.body.id}/notes`, { key: kClaim, body: { diagnosis: "the list came back even though I said I would drop it" } });
  const lbClaim = await call("POST", "/lookbacks", { key: kClaim, body: { scope: "all" } });
  const dropClaim = await call("GET", `/lookbacks/${lbClaim.body.id}/dropped`, { key: kClaim });
  const returned = dropClaim.body.items.find((it) => it.type === "move" && it.move === "list_of_three" && it.retry === "P3");
  const patListFn = await call("POST", `/lookbacks/${lbClaim.body.id}/patterns`, { key: kClaim, body: { name: "list of three packing", inclusion_rule: "a list of three items (A, B, and C)", instances: [{ piece: "P1", quote: "bread, cheese, and apples" }, { piece: "P2", quote: "bread, cheese, and apples" }, { piece: "P4", quote: "bread, cheese, and apples" }] } });
  const notesByClaim = patListFn.body.notes_beside_it_by_style || {};
  const allClaimNotes = Object.values(notesByClaim).flat();
  const intentN = allClaimNotes.find((r) => r.label === "P1")?.notes.find((n) => n.kind === "intent");
  const changeN = allClaimNotes.find((r) => r.label === "P3")?.notes.find((n) => n.kind === "change_note");
  const diagN = allClaimNotes.find((r) => r.label === "P4")?.notes.find((n) => n.kind === "diagnosis");
  const markN = allClaimNotes.find((r) => r.label === "P2")?.notes.find((n) => n.kind === "mark");
  const fnClaim = await call("POST", `/lookbacks/${lbClaim.body.id}/claims`, { key: kClaim, body: {
    pattern_id: patListFn.body.id,
    kind: "mixture",
    function: "It packs a scene as a ceremonial three. When it returns after a drop, it operates as an unexamined habit as much as a chosen preference.",
    future_intent: "I said I would drop it, but the later piece brings it back, so the drop is not a firm future choice.",
    qualifiers: "The return after the change note weakens the drop as a commitment.",
    evidence: [
      { piece: "P1", quote: "bread, cheese, and apples" },
      { piece: "P4", quote: "bread, cheese, and apples" },
      { note_id: intentN.id, quote: "it is how I like to pack a scene" },
      { note_id: changeN.id, quote: "I dropped the list of three" },
      { note_id: diagN.id, quote: "the list came back even though I said I would drop it" },
    ],
    counterexamples: [{ piece: "P3", quote: "We packed food for the road." }],
    rejections: [{ piece: "P3", quote: "We packed food for the road." }],
    interpretation: "The intent names a preference, the change note names a drop, and the later piece returns the move.",
  }});
  check(
    "a recurring choice's function is diagnosed from intent, effects in the pieces, and a drop that later returns",
    patListFn.status === 201 && fnClaim.status === 201 && !fnClaim.body.asks
      && /unexamined habit/.test(fnClaim.body.function)
      && returned && Array.isArray(returned.returns_in) && returned.returns_in.includes("P4")
      && Array.isArray(fnClaim.body.notes_side_by_side) && fnClaim.body.notes_side_by_side.length >= 2,
  );
  check(
    "future intent is weighed where a reflection conflicts with a later revision and a dropped move returns, with qualifiers",
    /not a firm future choice/.test(fnClaim.body.future_intent)
      && /weakens the drop/.test(fnClaim.body.qualifiers)
      && fnClaim.body.rejections.scope === "one instance",
  );
  const thinTaste = await call("POST", `/lookbacks/${lbClaim.body.id}/claims`, { key: kClaim, body: { pattern_id: patListFn.body.id, kind: "taste", evidence: [{ piece: "P1", quote: "bread, cheese, and apples" }], interpretation: "I like this list." } });
  const tasteClaim = await call("POST", `/lookbacks/${lbClaim.body.id}/claims`, { key: kClaim, body: {
    pattern_id: patListFn.body.id,
    kind: "taste",
    function: "A packing list I mean to keep when I am naming a preference.",
    evidence: [
      { piece: "P1", quote: "bread, cheese, and apples" },
      { note_id: intentN.id, quote: "keep the list of three" },
      { note_id: markN.id, quote: "kept the list of three" },
    ],
    counterexamples: [{ piece: "P3", quote: "We packed food for the road." }],
    rejections: [{ note_id: changeN.id, quote: "I do not want it in later pieces." }],
    interpretation: "The intent and the keep-mark name a preference, even though a later drop fights it.",
  }});
  const unclearClaim = await call("POST", `/lookbacks/${lbClaim.body.id}/claims`, { key: kClaim, body: {
    pattern_id: patListFn.body.id,
    kind: "unclear",
    qualifiers: "The keep, the drop, and the return leave the record too mixed to settle.",
    evidence: [{ note_id: diagN.id, quote: "the list came back even though I said I would drop it" }],
    counterexamples: [{ piece: "P3", quote: "We packed food for the road." }],
    rejections: [{ piece: "P3", quote: "We packed food for the road." }],
    interpretation: "I cannot yet tell taste from habit.",
  }});
  const fndClaim = await call("GET", `/lookbacks/${lbClaim.body.id}/findings`, { key: kClaim });
  check(
    "weighed claims for taste, mixture, and unclear cite notes, rejections, and counterexamples, and a thin taste claim is asked to weigh the record",
    thinTaste.status === 201 && /taste/.test(thinTaste.body.asks)
      && tasteClaim.status === 201 && !tasteClaim.body.asks && tasteClaim.body.kind === "taste" && tasteClaim.body.kind_means && /mean to keep/.test(tasteClaim.body.kind_means)
      && unclearClaim.status === 201 && !unclearClaim.body.asks && unclearClaim.body.kind === "unclear" && /too mixed to settle/.test(unclearClaim.body.qualifiers)
      && fnClaim.body.kind === "mixture" && /both a deliberate preference and a habit/.test(fnClaim.body.kind_means),
  );
  check(
    "findings include each claim's function and future intent",
    typeof fndClaim.body === "string"
      && /function: It packs a scene as a ceremonial three/.test(fndClaim.body)
      && /future intent: I said I would drop it/.test(fndClaim.body)
      && /claim: mixture/.test(fndClaim.body)
      && /claim: taste/.test(fndClaim.body)
      && /claim: unclear/.test(fndClaim.body),
  );

  const twoRej = await call("POST", `/lookbacks/${lbClaim.body.id}/claims`, { key: kClaim, body: {
    pattern_id: patListFn.body.id,
    kind: "default",
    evidence: [{ note_id: changeN.id, quote: "I dropped the list of three" }],
    rejections: [
      { piece: "P3", quote: "We packed food for the road." },
      { note_id: changeN.id, quote: "I do not want it in later pieces." },
    ],
    counterexamples: [{ piece: "P4", quote: "At dawn we packed bread, cheese, and apples once more." }],
    interpretation: "Two records name a drop, and a later piece brings the list back.",
  }});
  check(
    "a claim with rejections from two records is weighed against a counterexample",
    twoRej.status === 201 && !twoRej.body.asks
      && twoRej.body.rejections.recorded === "2 recorded"
      && !twoRej.body.rejections.scope
      && Array.isArray(twoRej.body.counterexamples) && twoRej.body.counterexamples.length >= 1,
  );

  // III.C.1, III.C.4: an exact wording return beside a three-word echo, plus a wording drop the notes never name.
  const kDrop = (await call("POST", "/keys")).body.key;
  const garden1 = "The garden held a bright linen tablecloth across the grass all afternoon.";
  const garden2 = "The garden held the grass all afternoon.";
  const garden3 = "By evening a bright linen tablecloth lay on the lawn again.";
  const kettle1 = "She wrote that the silver kettle sang at dawn. Later I noticed the cold slate sill.";
  const kettle2 = "She wrote that a stove was quiet. Later I sat down.";
  const kettle3 = "The silver kettle sat on the shelf.";
  const tGarden = await call("POST", "/tries", { key: kDrop, body: { text: garden1 } });
  await call("POST", `/tries/${tGarden.body.id}/retry`, { key: kDrop, body: { text: garden2, change_note: "I dropped \"bright linen tablecloth\" from the garden scene." } });
  await call("POST", "/tries", { key: kDrop, body: { text: garden3 } });
  const tKettle = await call("POST", "/tries", { key: kDrop, body: { text: kettle1 } });
  await call("POST", `/tries/${tKettle.body.id}/retry`, { key: kDrop, body: { text: kettle2, change_note: "I dropped \"the silver kettle sang at dawn\"." } });
  await call("POST", "/tries", { key: kDrop, body: { text: kettle3 } });
  const lbDrop = await call("POST", "/lookbacks", { key: kDrop, body: { scope: "all" } });
  const dropEcho = await call("GET", `/lookbacks/${lbDrop.body.id}/dropped`, { key: kDrop });
  const items = Array.isArray(dropEcho.body.items) ? dropEcho.body.items : [];
  const returnedWording = items.find((it) => it.type === "wording" && /bright linen tablecloth/i.test(it.words) && Array.isArray(it.returns_in) && it.returns_in.length);
  const echoedWording = items.find((it) => it.type === "wording" && /silver kettle sang at dawn/i.test(it.words) && Array.isArray(it.echoes_in) && it.echoes_in.length);
  const unnamedWording = items.find((it) => it.type === "wording" && /cold slate sill/i.test(it.words) && it.evidence === "indirect");
  check(
    "dropped wording shows an exact return beside a three-word echo, and an unnamed drop",
    dropEcho.status === 200
      && returnedWording && returnedWording.evidence === "explicit" && returnedWording.note_words
      && echoedWording && echoedWording.evidence === "explicit"
      && unnamedWording,
  );
  check(
    "a confirmed return and an ambiguous echo sit in the same dropped output",
    returnedWording && echoedWording
      && returnedWording.returns_in.includes("P3")
      && echoedWording.echoes_in.includes("P6")
      && !(echoedWording.returns_in || []).includes("P6"),
  );

  const peekLb = await call("GET", `/lookbacks/${lb.body.id}`, { key: (await call("POST", "/keys")).body.key });
  check("another key reads none of this lookback", peekLb.status === 404);
  const nk = (await call("POST", "/keys")).body.key;
  for (let i = 0; i < 5; i++) await call("POST", "/tries", { key: nk, body: { text: `Piece ${i} of the first sitting, short and plain.` } });
  const end1 = await call("POST", "/session/end", { key: nk });
  check("no look-back nudge before 6 tries across 2 sessions", typeof end1.body === "string" && !/POST \/lookbacks/.test(end1.body));
  await call("POST", "/tries", { key: nk, body: { text: "A piece from the second sitting." } });
  const end2 = await call("POST", "/session/end", { key: nk });
  check("session end offers a lookback once there are 6 tries across 2 sessions", /POST \/lookbacks/.test(end2.body) && /6 pieces across 2 sessions/.test(end2.body));
  await call("POST", "/tries", { key: nk, body: { text: "A third sitting." } });
  await call("POST", "/lookbacks", { key: nk, body: {} });
  const end3 = await call("POST", "/session/end", { key: nk });
  check("after a lookback, the nudge waits", !/POST \/lookbacks/.test(end3.body));

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
  if (e !== "closed-done") check("walkthrough ran to the end", false, String(e));
} finally {
  stopDev();
}

const missed = results.filter((r) => !r).length;
console.log(`\n${results.length - missed} of ${results.length} checks passed.`);
process.exit(missed ? 1 : 0);
