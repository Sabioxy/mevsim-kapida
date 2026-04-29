export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export const makeId = (prefix = "id") => {
  // deterministic enough for UI demo; replace with server ids in real impl
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now()}`;
};
