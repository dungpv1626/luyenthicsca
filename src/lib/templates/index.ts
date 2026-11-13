import type { Template } from "./core.ts";
import { MATH_TEMPLATES } from "./math.ts";
import { PHYSICS_TEMPLATES } from "./physics.ts";
import { CHEMISTRY_TEMPLATES } from "./chemistry.ts";
import { EXTRA_TEMPLATES } from "./extra.ts";
import { GAP_TEMPLATES } from "./gaps.ts";

export const TEMPLATES: Template[] = [...MATH_TEMPLATES, ...PHYSICS_TEMPLATES, ...CHEMISTRY_TEMPLATES, ...EXTRA_TEMPLATES, ...GAP_TEMPLATES];
export { mkRng, validateVariant, LANGS } from "./core.ts";
export type { Template, Variant, Lang } from "./core.ts";

const hash = (s: string) => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
export const seedFor = (key: string, i: number) => (hash(key) + Math.imul(i + 1, 0x9e3779b1)) >>> 0;
