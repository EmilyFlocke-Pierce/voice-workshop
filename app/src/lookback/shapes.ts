// Structural shapes per piece, all from sentencesOf. /recurring counts them across pieces, /dropped compares parent and retry.
import { sentencesOf } from "../feedback/text.ts";

export interface Shapes {
  opens_with_question: boolean;
  ends_with_question: boolean;
  short_landing: boolean;
  one_line_paragraph_end: boolean;
  list_of_three: boolean;
  closing_words: number;
}
export const SHAPE_NAMES = ["opens_with_question", "ends_with_question", "short_landing", "one_line_paragraph_end", "list_of_three"] as const;
export type ShapeName = (typeof SHAPE_NAMES)[number];

const Q = /\?["'\u201d\u2019)\]]*$/;
// "A, B, and C" or "A, B and C", one to four words each.
const ITEM = "[A-Za-z\u00c0-\u024f'\u2019-]+(?:\\s+[A-Za-z\u00c0-\u024f'\u2019-]+){0,3}";
export const LIST_OF_THREE = new RegExp(`(?:^|[^A-Za-z])(${ITEM}),\\s+(${ITEM}),?\\s+and\\s+(${ITEM})`, "i");

export function shapesOf(text: string): Shapes {
  const ss = sentencesOf(text);
  const first = ss[0];
  const last = ss[ss.length - 1];
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  const lastLine = lines[lines.length - 1] ?? "";
  return {
    opens_with_question: !!first && Q.test(first.text),
    ends_with_question: !!last && Q.test(last.text),
    short_landing: !!last && last.words.length <= 6,
    one_line_paragraph_end: lines.length > 1 && sentencesOf(lastLine).length === 1,
    list_of_three: ss.some((s) => LIST_OF_THREE.test(s.text)),
    closing_words: last?.words.length ?? 0,
  };
}

// The sentence that carries a shape, for quoting and for checking whether a note names it.
export function shapeSentence(text: string, shape: ShapeName): string | null {
  const ss = sentencesOf(text);
  if (!ss.length) return null;
  if (shape === "opens_with_question") return ss[0].text;
  if (shape === "list_of_three") return ss.find((s) => LIST_OF_THREE.test(s.text))?.text ?? null;
  if (shape === "one_line_paragraph_end") {
    const lines = text.split(/\r?\n/).filter((l) => l.trim());
    return lines[lines.length - 1]?.trim() ?? null;
  }
  return ss[ss.length - 1].text;
}
