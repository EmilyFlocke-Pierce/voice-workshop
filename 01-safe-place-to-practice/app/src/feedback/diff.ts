// Compares a retry with its parent sentence by sentence and lists every change the workshop finds.
// The agent's change note sits on top, so the agent can tell the change it meant from the rest.
import { sentencesOf } from "./text.ts";

export interface Change {
  kind: "changed" | "added" | "removed";
  before: string | null;
  after: string | null;
  place: string;
}

const MAX = 400;

export function diffTries(parent: string, retry: string): Change[] {
  const a = sentencesOf(parent).slice(0, MAX);
  const b = sentencesOf(retry).slice(0, MAX);
  const n = a.length;
  const m = b.length;
  const lcs: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) lcs[i][j] = a[i].text === b[j].text ? lcs[i + 1][j + 1] + 1 : Math.max(lcs[i + 1][j], lcs[i][j + 1]);
  const raw: Change[] = [];
  let i = 0;
  let j = 0;
  while (i < n || j < m) {
    if (i < n && j < m && a[i].text === b[j].text) {
      i++;
      j++;
    } else if (i < n && (j === m || lcs[i + 1][j] >= lcs[i][j + 1])) {
      raw.push({ kind: "removed", before: a[i].text, after: null, place: `${a[i].third}, line ${a[i].line}` });
      i++;
    } else {
      raw.push({ kind: "added", before: null, after: b[j].text, place: `${b[j].third}, line ${b[j].line}` });
      j++;
    }
  }
  // A removal followed by an addition at the same spot reads as one changed sentence.
  const out: Change[] = [];
  for (let k = 0; k < raw.length; k++) {
    const c = raw[k];
    const next = raw[k + 1];
    if (c.kind === "removed" && next?.kind === "added") {
      out.push({ kind: "changed", before: c.before, after: next.after, place: next.place });
      k++;
    } else out.push(c);
  }
  return out;
}
