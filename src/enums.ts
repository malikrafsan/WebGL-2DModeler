const MODES = {
  DILATES: "DILATES",
  TRANSLATE: "TRANSLATE",
  ROTATE: "ROTATE",
  DRAW: "DRAW",
} as const;

type MODE_TYPES = typeof MODES[keyof typeof MODES];

// export {
//   MODES,
//   MODE_TYPES,
// }