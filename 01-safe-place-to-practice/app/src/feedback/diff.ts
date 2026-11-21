// Compares a retry with its parent sentence by sentence, across the whole draft, and lists every change.
// The agent's change note sits on top, so the agent can tell the change it meant from the rest.
// Matching sentences at the start and the end are set aside first, so a late change in a long draft
// costs little. When the middle that differs is very large, the workshop pairs its sentences by position
// and says so with by_position = true.
import { sentencesOf, type Sentence } from "./text.ts";

export interface Change {
  kind: "changed" | "added" | "removed";
  before: string | null;
  after: string | null;
  place: string;
}

export interface Diff {
  changes: Change[];
  sentences_compared: { parent: number; retry: number };
  by_position: boolean;
}

const MAX_CELLS = 1_000_000;
const at = (s: Sentence) => `${s.third}, line ${s.line}`;

export function diffTries(parent: string, retry: string): Diff {
  const a = sentencesOf(parent);
  const b = sentencesOf(retry);
  let lo = 0;
  while (lo < a.length && lo < b.length && a[lo].text === b[lo].text) lo++;
  let ha = a.length;
  let hb = b.length;
  while (ha > lo && hb > lo && a[ha - 1].text === b[hb - 1].text) {
    ha--;
    hb--;
  }
  const ma = a.slice(lo, ha);
  const mb = b.slice(lo, hb);
  const n = ma.length;
  const m = mb.length;
  // raw holds a null between runs wherever sentences match, so runs on either side stay apart.
  const raw: (Change | null)[] = [];
  let byPosition = false;

  if ((n + 1) * (m + 1) <= MAX_CELLS) {
    const w = m + 1;
    const lcs = new Uint16Array((n + 1) * w);
    for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) lcs[i * w + j] = ma[i].text === mb[j].text ? lcs[(i + 1) * w + j + 1] + 1 : Math.max(lcs[(i + 1) * w + j], lcs[i * w + j + 1]);
    let i = 0;
    let j = 0;
    while (i < n || j < m) {
      if (i < n && j < m && ma[i].text === mb[j].text) {
        raw.push(null);
        i++;
        j++;
      } else if (i < n && (j === m || lcs[(i + 1) * w + j] >= lcs[i * w + j + 1])) {
        raw.push({ kind: "removed", before: ma[i].text, after: null, place: at(ma[i]) });
        i++;
      } else {
        raw.push({ kind: "added", before: null, after: mb[j].text, place: at(mb[j]) });
        j++;
      }
    }
  } else {
    byPosition = true;
    for (let k = 0; k < Math.max(n, m); k++) {
      const x = ma[k];
      const y = mb[k];
      if (x && y && x.text === y.text) {
        raw.push(null);
        continue;
      }
      if (x && y) raw.push({ kind: "removed", before: x.text, after: null, place: at(x) }, { kind: "added", before: null, after: y.text, place: at(y) }, null);
      else if (x) raw.push({ kind: "removed", before: x.text, after: null, place: at(x) });
      else if (y) raw.push({ kind: "added", before: null, after: y.text, place: at(y) });
    }
  }

  // A run of removals followed by a run of additions at the same spot reads as one change:
  // these sentences became those. Three sentences rewritten as one show as one change.
  const changes: Change[] = [];
  for (let k = 0; k < raw.length; ) {
    if (!raw[k]) {
      k++;
      continue;
    }
    let r = k;
    while (r < raw.length && raw[r]?.kind === "removed") r++;
    let e = r;
    while (e < raw.length && raw[e]?.kind === "added") e++;
    if (r > k && e > r) {
      changes.push({ kind: "changed", before: raw.slice(k, r).map((c) => c!.before).join(" "), after: raw.slice(r, e).map((c) => c!.after).join(" "), place: raw[r]!.place });
    } else {
      changes.push(...(raw.slice(k, Math.max(e, k + 1)) as Change[]));
    }
    k = Math.max(e, k + 1);
  }
  return { changes, sentences_compared: { parent: a.length, retry: b.length }, by_position: byPosition };
}
