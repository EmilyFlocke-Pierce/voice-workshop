// Register word lists for the register measure. A word counts when it matches a list entry exactly after wordsOf.
export const REGISTER_WORDS_VERSION = "v1";

export const FORMAL = new Set([
  "therefore", "however", "moreover", "furthermore", "thus", "hence", "whom", "shall", "regarding", "accordingly",
  "consequently", "nevertheless", "notwithstanding", "whereas", "wherein", "hereby", "herein", "thereby", "pursuant", "albeit",
  "henceforth", "insofar", "inasmuch", "indeed", "ought", "upon", "amongst", "whilst", "aforementioned", "respectively",
]);

export const CASUAL = new Set([
  "gonna", "wanna", "gotta", "kinda", "sorta", "yeah", "yep", "nope", "nah", "okay", "ok", "hey", "wow", "whoa", "huh",
  "um", "uh", "lol", "stuff", "guys", "folks", "pretty", "really", "totally", "super", "awesome", "cool", "basically", "dunno", "y'all",
]);

// Contractions count as casual. A word ending in 's counts neither way.
const CONTRACTION = /(n't|'re|'ll|'ve|'m|'d)$/;

export function registerOf(word: string): "formal" | "casual" | null {
  if (FORMAL.has(word)) return "formal";
  if (CASUAL.has(word)) return "casual";
  if (CONTRACTION.test(word)) return "casual";
  return null;
}
