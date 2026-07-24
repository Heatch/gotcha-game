// Pseudonyms follow the format [Adjective][Animal]## (e.g. "SharpBear77"),
// see schemas/users.schema.json. Each part of the pseudonym contributes one
// hardcoded RGB channel, so every adjective+animal+number combination gets
// its own distinct color instead of picking from a small fixed palette.

// Adjective -> red channel. Values kept within ~[15, 255] and spread apart so
// adjectives read as visually distinct reds.
export const ADJECTIVE_RED: Record<string, number> = {
  Sharp: 200,
  Cheery: 235,
  Swift: 55,
  Jolly: 250,
  Lucky: 140,
  Fuzzy: 95,
  Calm: 35,
  Misty: 175,
  Sly: 15,
  Rusty: 185,
  Sunny: 255,
};

// Animal -> green channel.
export const ANIMAL_GREEN: Record<string, number> = {
  Bear: 60,
  Falcon: 120,
  Owl: 190,
  Elk: 90,
  Koi: 150,
  Tiger: 215,
  Gecko: 30,
  Dolphin: 240,
};

export const ADJECTIVES = Object.keys(ADJECTIVE_RED);
export const ANIMALS = Object.keys(ANIMAL_GREEN);

const PSEUDONYM_RE = /^([A-Z][a-z]+)([A-Z][a-z]+)(\d{2})$/;

export interface ParsedPseudonym {
  adjective: string;
  animal: string;
  number: string;
}

export function parsePseudonym(pseudonym: string): ParsedPseudonym | null {
  const m = PSEUDONYM_RE.exec(pseudonym);
  return m ? { adjective: m[1], animal: m[2], number: m[3] } : null;
}

export function hashIndex(word: string, mod: number): number {
  let hash = 0;
  for (let i = 0; i < word.length; i++) hash = (hash * 31 + word.charCodeAt(i)) | 0;
  return Math.abs(hash) % mod;
}

// Unknown words (not yet in the lookup tables above) still get a stable
// channel value via hashing, so new adjectives/animals degrade gracefully.
function redForAdjective(adjective: string): number {
  return ADJECTIVE_RED[adjective] ?? hashIndex(adjective, 256);
}

function greenForAnimal(animal: string): number {
  return ANIMAL_GREEN[animal] ?? hashIndex(animal, 256);
}

// Number -> blue channel, scaled from the pseudonym's 00-99 suffix. Bounded
// away from the extremes (0 / 255) so the color never goes pure-black or
// pure-white on the blue channel alone.
function blueForNumber(number: string): number {
  const n = Math.min(99, Math.max(0, parseInt(number, 10) || 0));
  return Math.round(40 + (n / 99) * 175);
}

export function rgbForPseudonym(pseudonym: string): string {
  const parsed = parsePseudonym(pseudonym);
  if (!parsed) return rgbForRawString(pseudonym);
  const r = redForAdjective(parsed.adjective);
  const g = greenForAnimal(parsed.animal);
  const b = blueForNumber(parsed.number);
  return `rgb(${r}, ${g}, ${b})`;
}

// Fallback for senders with no known pseudonym: hash the raw name into its
// own RGB triple so the color is still stable and distinct.
function rgbForRawString(value: string): string {
  const r = hashIndex(`${value}r`, 256);
  const g = hashIndex(`${value}g`, 256);
  const b = hashIndex(`${value}b`, 256);
  return `rgb(${r}, ${g}, ${b})`;
}

// Prefer the sender's pseudonym when known; fall back to hashing the raw
// sender string so unrecognized names (or pseudonyms not yet loaded) still
// get a stable, distinct color.
export function colorForSender(sender: string, pseudonymByName: Map<string, string>): string {
  const pseudonym = pseudonymByName.get(sender);
  return pseudonym ? rgbForPseudonym(pseudonym) : rgbForRawString(sender);
}
