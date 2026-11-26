// The style catalog for slice 02. Each style is one form from slice 01's FORMS, paired with at most one
// art movement or one author. A style takes the kind of its form. Draft for Emily: her approval lands as a version raise.
// Features describe and never rank. Each band line names the band it stands for, so the words and the numbers agree.
import { FORMS } from "../prompts.ts";

export const STYLE_LIST_VERSION = "draft-1";

export const KINDS = ["notice", "message", "letter", "speech", "poem", "report", "review", "story"] as const;
export type Kind = (typeof KINDS)[number];

export const FORM_KIND: Record<string, Kind> = {
  "a press release": "notice", "an obituary notice": "notice", "a lost-and-found notice": "notice", "a museum placard": "notice", "a menu description": "notice", "a recipe card": "notice",
  "a text message": "message", "a voicemail": "message", "a tweet thread": "message", "a postcard": "message", "a fortune cookie message": "message",
  "a letter to the editor": "letter", "a cover letter opening": "letter",
  "a comedy roast": "speech", "a eulogy toast": "speech", "a wedding toast": "speech",
  "a haiku-length poem": "poem", "an ad jingle": "poem",
  "a weather report": "report", "a field note": "report", "a sports play-by-play": "report", "a horoscope": "report",
  "a product review": "review",
  "a comic book page": "story",
};

export const MEASURES = ["sentence_words", "clauses", "openings", "register", "questions"] as const;
export type Measure = (typeof MEASURES)[number];
export const BANDS: Record<Measure, readonly [string, string, string]> = {
  sentence_words: ["short", "medium", "long"],
  clauses: ["simple", "moderate", "layered"],
  openings: ["varied", "some", "repeated"],
  register: ["casual", "plain", "formal"],
  questions: ["none", "some", "many"],
};
export type Targets = Record<Measure, string>;

// The plain words for each band, used when a style has no wording of its own for that measure.
const BAND_WORDS: Record<string, string> = {
  "sentence_words:short": "short sentences",
  "sentence_words:medium": "mid-length sentences",
  "sentence_words:long": "long sentences that build",
  "clauses:simple": "one clause at a time",
  "clauses:moderate": "a clause or two per sentence",
  "clauses:layered": "clauses stacked inside clauses",
  "openings:varied": "sentences start in different ways",
  "openings:some": "some sentences start the same way",
  "openings:repeated": "many sentences start the same way",
  "register:casual": "casual, spoken words",
  "register:plain": "everyday words, neither casual nor formal",
  "register:formal": "formal words",
  "questions:none": "statements, no questions",
  "questions:some": "a few questions",
  "questions:many": "many questions",
};

export interface Style {
  id: string;
  name: string;
  kind: Kind;
  form: string;
  movement: string | null;
  author: string | null;
  features: string[];
  targets: Targets;
}

type T = [string, string, string, string, string]; // sentence_words, clauses, openings, register, questions ("any" when unset)
interface Def {
  form: string;
  movement?: string;
  author?: string;
  t: T;
  words?: Partial<Record<Measure, string>>;
  flavor?: string;
}

const DEFS: Def[] = [
  // 20 movements, each paired with a form.
  { form: "a wedding toast", movement: "baroque", t: ["long", "layered", "any", "formal", "none"], words: { sentence_words: "long sentences that keep adding ornament", clauses: "clause folded into clause" }, flavor: "grand, ceremonial tone" },
  { form: "a museum placard", movement: "minimalist", t: ["short", "simple", "any", "plain", "none"], words: { sentence_words: "few words, short sentences" }, flavor: "only what is in front of you" },
  { form: "a weather report", movement: "impressionist", t: ["medium", "moderate", "any", "plain", "none"], words: { clauses: "a clause or two that blur light and color" } },
  { form: "a product review", movement: "cubist", t: ["short", "moderate", "repeated", "plain", "any"], words: { openings: "many sentences start from the same object, seen from another side" } },
  { form: "a postcard", movement: "art nouveau", t: ["medium", "layered", "any", "formal", "none"], words: { clauses: "curving clauses that wind into each other" } },
  { form: "a lost-and-found notice", movement: "surrealist", t: ["medium", "moderate", "any", "plain", "some"], flavor: "ordinary things doing impossible things, stated calmly" },
  { form: "an ad jingle", movement: "pop art", t: ["short", "simple", "repeated", "casual", "some"], words: { openings: "lines start the same way, like a printed pattern" } },
  { form: "a haiku-length poem", movement: "ukiyo-e", t: ["short", "simple", "varied", "plain", "none"], flavor: "one scene from daily life, flat and clear" },
  { form: "a recipe card", movement: "Bauhaus", t: ["short", "simple", "repeated", "plain", "none"], words: { openings: "each step starts with its verb" } },
  { form: "an obituary notice", movement: "gothic", t: ["long", "layered", "any", "formal", "none"], flavor: "shadow, stone, and old houses at the edges" },
  { form: "a text message", movement: "expressionist", t: ["short", "simple", "any", "casual", "many"], flavor: "feeling pushed to the surface, shapes bent by it" },
  { form: "a field note", movement: "pointillist", t: ["short", "simple", "varied", "plain", "none"], words: { sentence_words: "short sentences, each one a dot of detail" } },
  { form: "a tweet thread", movement: "dada", t: ["short", "any", "varied", "casual", "many"], flavor: "sense that breaks on purpose" },
  { form: "a voicemail", movement: "film noir", t: ["short", "moderate", "any", "casual", "some"], flavor: "night, rain, and a speaker who has seen too much" },
  { form: "a press release", movement: "art deco", t: ["medium", "moderate", "repeated", "formal", "none"], words: { openings: "sentences start the same way, like a row of chrome lines" } },
  { form: "a letter to the editor", movement: "romantic", t: ["long", "layered", "any", "formal", "some"], flavor: "nature and feeling set above reason" },
  { form: "a menu description", movement: "rococo", t: ["long", "layered", "any", "formal", "none"], words: { clauses: "clauses curling around each dish like trim" } },
  { form: "a fortune cookie message", movement: "folk art", t: ["short", "simple", "any", "plain", "none"], flavor: "homely images, handmade and direct" },
  { form: "a sports play-by-play", movement: "futurist", t: ["short", "simple", "repeated", "casual", "none"], words: { sentence_words: "short sentences that race ahead" } },
  { form: "a eulogy toast", movement: "pre-Raphaelite", t: ["long", "layered", "any", "formal", "none"], flavor: "close detail, old legends, rich color" },
  // 10 authors, each paired with a form.
  { form: "a horoscope", author: "Emily Dickinson", t: ["short", "moderate", "any", "plain", "some"], flavor: "dashes, slant turns, small words carrying large things" },
  { form: "a comedy roast", author: "Mark Twain", t: ["medium", "moderate", "any", "casual", "some"], flavor: "dry exaggeration, told with a straight face" },
  { form: "a cover letter opening", author: "Jane Austen", t: ["long", "layered", "any", "formal", "none"], flavor: "polite surface with irony under it" },
  { form: "a voicemail", author: "Edgar Allan Poe", t: ["medium", "moderate", "repeated", "formal", "many"], words: { openings: "lines start the same way, returning like a refrain" } },
  { form: "a recipe card", author: "Lewis Carroll", t: ["medium", "moderate", "any", "plain", "many"], flavor: "logic followed straight into nonsense" },
  { form: "a letter to the editor", author: "Franz Kafka", t: ["long", "layered", "any", "formal", "some"], flavor: "calm procedure around something impossible" },
  { form: "a museum placard", author: "Oscar Wilde", t: ["medium", "moderate", "varied", "formal", "none"], flavor: "turned phrases that flip a common saying" },
  { form: "a field note", author: "Ernest Hemingway", t: ["short", "moderate", "any", "plain", "none"], words: { clauses: "plain clauses joined by and" } },
  { form: "a weather report", author: "Walt Whitman", t: ["long", "layered", "repeated", "plain", "none"], words: { openings: "many lines start the same way, a long list of everything" } },
  { form: "a text message", author: "Matsuo Bash\u014d", t: ["short", "simple", "varied", "plain", "none"], flavor: "one plain image and a season" },
  // 10 forms on their own.
  { form: "a comic book page", t: ["short", "simple", "any", "casual", "some"], flavor: "panels, captions, and sound words" },
  { form: "a press release", t: ["medium", "moderate", "varied", "formal", "none"] },
  { form: "a wedding toast", t: ["medium", "moderate", "any", "plain", "some"] },
  { form: "a tweet thread", t: ["short", "simple", "any", "casual", "some"] },
  { form: "a letter to the editor", t: ["medium", "moderate", "any", "formal", "some"] },
  { form: "a sports play-by-play", t: ["short", "simple", "any", "casual", "none"] },
  { form: "a horoscope", t: ["medium", "simple", "any", "plain", "none"], flavor: "second person, the future told as fact" },
  { form: "an obituary notice", t: ["medium", "moderate", "any", "formal", "none"] },
  { form: "a haiku-length poem", t: ["short", "simple", "any", "plain", "none"] },
  { form: "a postcard", t: ["short", "simple", "varied", "casual", "none"] },
];

const slug = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/^(a|an) /, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function build(d: Def): Style {
  const targets = Object.fromEntries(MEASURES.map((m, i) => [m, d.t[i]])) as Targets;
  const pair = d.movement ?? d.author ?? null;
  const name = pair ? `${d.form}, ${d.author ? `like ${d.author}` : d.movement}` : d.form;
  const features = MEASURES.filter((m) => targets[m] !== "any").map((m) => `${d.words?.[m] ?? BAND_WORDS[`${m}:${targets[m]}`]} [${m}: ${targets[m]}]`);
  // A flavor line joins only when there is room, so every band line stays.
  if (d.flavor && features.length < 5) features.unshift(d.flavor);
  return { id: [slug(d.form), pair ? slug(pair) : ""].filter(Boolean).join("--"), name, kind: FORM_KIND[d.form], form: d.form, movement: d.movement ?? null, author: d.author ?? null, features, targets };
}

export const CATALOG: Style[] = DEFS.map(build);
export const STYLE_BY_ID = new Map(CATALOG.map((s) => [s.id, s]));

export function kindOfForm(form: string | null): Kind | null {
  return form && form in FORM_KIND ? FORM_KIND[form] : null;
}

// Every form in slice 01's list maps to a kind.
export const UNMAPPED_FORMS = FORMS.filter((f) => !(f in FORM_KIND));
