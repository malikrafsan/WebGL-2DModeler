const MODES = {
  DILATES: "DILATES",
  TRANSLATE: "TRANSLATE",
  ROTATE: "ROTATE",
  DRAW: "DRAW",
} as const;

type MODE_TYPES = typeof MODES[keyof typeof MODES];

const SHAPE_TYPE = {
  PERSEGI_PANJANG: "persegipanjang",
  GARIS: "garis",
  PERSEGI: "persegi",
  POLIGON: "poligon",
  LINGKARAN: "lingkaran",
} as const;

type SHAPE_TYPES = typeof SHAPE_TYPE[keyof typeof SHAPE_TYPE];

const FEATURE_MODES = {
  General: "General",
  Translasi: "Translasi",
  Dilatasi: "Dilatasi",
  ConstraintMoveVertex: "ConstraintMoveVertex",
  FreeMoveVertex: "FreeMoveVertex",
  ChangeColorVertex: "ChangeColorVertex",
  ChangeColorShape: "ChangeColorShape",
} as const;

type FEATURE_MODE_TYPES = typeof FEATURE_MODES[keyof typeof FEATURE_MODES];
