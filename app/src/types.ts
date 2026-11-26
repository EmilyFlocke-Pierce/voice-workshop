export interface Env {
  DB: D1Database;
  OUTSIDE_MODEL_URL: string;
  ADMIN_EMAIL: string;
  ACCESS_TEAM_DOMAIN: string;
  ACCESS_AUD: string;
  ACCESS_MODE: string;
  // Sign-in STUB: OPEN_KEYS=true keeps POST /keys open for local runs. HUMAN_AUTH_MODE is local-dev or neon.
  OPEN_KEYS?: string;
  HUMAN_AUTH_MODE?: string;
  NEON_AUTH_BASE_URL?: string;
}

export interface Quote {
  quote: string;
  place: string;
}

// The fixed layout, version 1: four fields on every line.
export interface Observation {
  feature: string;
  where: string;
  quotes: Quote[];
  pattern: string;
}

export interface Unplaced {
  observation: unknown;
  why_it_does_not_fit: string;
}

export interface Feedback {
  layout_version: number;
  code_version: string;
  intent: string | null;
  scope_note: string | null;
  observations: Observation[];
  unplaced: Unplaced[];
  held_back: number;
}
