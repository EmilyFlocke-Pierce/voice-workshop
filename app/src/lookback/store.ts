// Results are stored by reference in chunks: at most 100 items and 256 KB per row, under D1's 2 MB row limit.
export const CHUNK_ITEMS = 100;
export const CHUNK_BYTES = 256 * 1024;

const size = (s: string) => new TextEncoder().encode(s).length;

export function putChunked(items: unknown[]): string[] {
  const rows: string[] = [];
  let cur: unknown[] = [];
  let bytes = 2;
  const flush = () => {
    if (cur.length) rows.push(JSON.stringify(cur));
    cur = [];
    bytes = 2;
  };
  for (const it of items) {
    let s = JSON.stringify(it);
    if (size(s) + 2 > CHUNK_BYTES) s = JSON.stringify({ too_large: true, note: "This item passed 256 KB and was left out.", type: (it as { type?: unknown })?.type ?? null });
    const n = size(s);
    if (cur.length >= CHUNK_ITEMS || bytes + n + 1 > CHUNK_BYTES) flush();
    cur.push(JSON.parse(s));
    bytes += n + 1;
  }
  flush();
  return rows;
}
