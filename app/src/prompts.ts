// The prompt randomizer: four independent draws (form, art style, author, subject) make one short writing prompt.
// Forms stay short. Every author died long ago, and death_year sits beside each name so anyone can check it.
// A prompt_id is the list version plus the seed, so the same id always gives the same four picks.

export const PROMPT_LIST_VERSION = "v2";

export const FORMS = [
  "a comic book page", "a press release", "a text message", "a comedy roast", "a haiku-length poem", "a product review",
  "a voicemail", "an obituary notice", "a recipe card", "a horoscope", "a tweet thread", "a eulogy toast",
  "a menu description", "a letter to the editor", "a cover letter opening", "a field note", "a wedding toast", "an ad jingle",
  "a weather report", "a postcard", "a lost-and-found notice", "a fortune cookie message", "a sports play-by-play", "a museum placard",
];

// name is the movement; phrase is how it reads inside the prompt sentence.
export const STYLES = [
  { name: "impressionist", phrase: "impressionistic" },
  { name: "cubist", phrase: "cubist" },
  { name: "art nouveau", phrase: "in art nouveau style" },
  { name: "baroque", phrase: "baroque" },
  { name: "surrealist", phrase: "surrealist" },
  { name: "pop art", phrase: "in pop art style" },
  { name: "minimalist", phrase: "minimalist" },
  { name: "ukiyo-e", phrase: "in ukiyo-e style" },
  { name: "Bauhaus", phrase: "in Bauhaus style" },
  { name: "gothic", phrase: "gothic" },
  { name: "expressionist", phrase: "expressionist" },
  { name: "pointillist", phrase: "pointillist" },
  { name: "dada", phrase: "dada" },
  { name: "film noir", phrase: "film noir" },
  { name: "art deco", phrase: "in art deco style" },
  { name: "romantic", phrase: "romantic" },
  { name: "rococo", phrase: "rococo" },
  { name: "folk art", phrase: "in folk art style" },
  { name: "futurist", phrase: "futurist" },
  { name: "pre-Raphaelite", phrase: "pre-Raphaelite" },
];

// Choose authors whose work invites play: broadly famous, quotable, and light enough to be borrowed in fun.
// These prompts are irreverent, so keep authors whose work speaks for a movement, an identity, or a community off this list.
// Each author died long ago and carries a death_year.
// v2, Nov 22, 2026: Lewis Carroll (1898), Edward Lear (1888), and O. Henry (1910) join the list, each year checked
// against the Library of Congress name authority or Wikipedia. Checking the rest is on QUIRKS.md.
export const AUTHORS = [
  { name: "Herman Melville", death_year: 1891 },
  { name: "Emily Dickinson", death_year: 1886 },
  { name: "Mark Twain", death_year: 1910 },
  { name: "Jane Austen", death_year: 1817 },
  { name: "Edgar Allan Poe", death_year: 1849 },
  { name: "Lewis Carroll", death_year: 1898 },
  { name: "Franz Kafka", death_year: 1924 },
  { name: "Oscar Wilde", death_year: 1900 },
  { name: "Edward Lear", death_year: 1888 },
  { name: "Ernest Hemingway", death_year: 1961 },
  { name: "Charles Dickens", death_year: 1870 },
  { name: "Leo Tolstoy", death_year: 1910 },
  { name: "Fyodor Dostoevsky", death_year: 1881 },
  { name: "Charlotte Bront\u00eb", death_year: 1855 },
  { name: "Walt Whitman", death_year: 1892 },
  { name: "Anton Chekhov", death_year: 1904 },
  { name: "William Shakespeare", death_year: 1616 },
  { name: "Miguel de Cervantes", death_year: 1616 },
  { name: "Geoffrey Chaucer", death_year: 1400 },
  { name: "Mary Shelley", death_year: 1851 },
  { name: "Jonathan Swift", death_year: 1745 },
  { name: "O. Henry", death_year: 1910 },
  { name: "James Joyce", death_year: 1941 },
  { name: "Matsuo Bash\u014d", death_year: 1694 },
  { name: "Jack London", death_year: 1916 },
];

export const SUBJECTS = [
  "a Catahoula leopard dog", "a lost umbrella", "a power outage", "a heron", "a first day at a new job",
  "a missed bus", "an octopus", "a kitchen fire that was mostly smoke", "a borrowed ladder", "a crow that remembers faces",
  "a snow day", "a parking ticket", "a houseplant that refuses to die", "a moving day", "a jellyfish",
  "a wrong-number call", "a laundromat at midnight", "a goat on a roof", "a stuck elevator", "a beehive",
  "a garage sale", "a stray cat", "a thunderstorm", "a hiccup that keeps going", "a raccoon in the attic",
];

export interface PromptPicks {
  prompt_id: string;
  seed: string;
  list_version: string;
  form: string;
  style: string;
  author: { name: string; death_year: number };
  subject: string;
  prompt: string;
}

export const SEED_RE = /^[A-Za-z0-9_-]{1,64}$/;

// FNV-1a hash of the seed, then mulberry32. Small, fast, and the same on every machine.
function rng(seed: string): () => number {
  let h = 0x811c9dc5;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 0x01000193);
  let a = h >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function sentenceFor(form: string, stylePhrase: string, author: string, subject: string): string {
  return `Write ${form}, ${stylePhrase}, like ${author}, about ${subject}.`;
}

export function newSeed(): string {
  return [...crypto.getRandomValues(new Uint8Array(6))].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function drawPrompt(seed: string = newSeed()): PromptPicks {
  const next = rng(seed);
  const pick = <T>(list: T[]) => list[Math.floor(next() * list.length)];
  const form = pick(FORMS);
  const style = pick(STYLES);
  const author = pick(AUTHORS);
  const subject = pick(SUBJECTS);
  return {
    prompt_id: `${PROMPT_LIST_VERSION}-${seed}`,
    seed,
    list_version: PROMPT_LIST_VERSION,
    form,
    style: style.name,
    author,
    subject,
    prompt: sentenceFor(form, style.phrase, author.name, subject),
  };
}

// Reads a prompt_id back into its picks. Null when the id is from another list version or has an unusable seed.
export function fromPromptId(id: string): PromptPicks | null {
  const m = id.match(/^(v\d+)-(.+)$/);
  if (!m || m[1] !== PROMPT_LIST_VERSION || !SEED_RE.test(m[2])) return null;
  return drawPrompt(m[2]);
}

// Builds a prompt from four picks the agent names. Each pick must come from the lists. Null otherwise.
export function fromPicks(p: { form?: unknown; style?: unknown; author?: unknown; subject?: unknown }): Omit<PromptPicks, "seed" | "prompt_id"> | null {
  const form = FORMS.find((f) => f === p.form);
  const style = STYLES.find((s) => s.name === p.style);
  const author = AUTHORS.find((a) => a.name === (typeof p.author === "object" && p.author ? (p.author as { name?: unknown }).name : p.author));
  const subject = SUBJECTS.find((s) => s === p.subject);
  if (!form || !style || !author || !subject) return null;
  return { list_version: PROMPT_LIST_VERSION, form, style: style.name, author, subject, prompt: sentenceFor(form, style.phrase, author.name, subject) };
}
