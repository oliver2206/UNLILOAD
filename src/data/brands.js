// Brand colors used for the network avatars and wallet dots (visual only).
export const networkBrand = {
  Globe:  { color: "#1E6BFF", short: "G" },
  Smart:  { color: "#2FA84F", short: "S" },
  TNT:    { color: "#F5A400", short: "T" },
  TM:     { color: "#F26B21", short: "TM" },
  GOMO:   { color: "#00A99D", short: "Go" },
  DITO:   { color: "#E4002B", short: "D" },
  Cignal: { color: "#D81E28", short: "C" },
};

export const appColor = {
  gcash: "#007CFF",
  maya: "#16B364",
  mbank: "#F77F00",
  saripay: "#7B4DFF",
};

export const brandOf = (n) => networkBrand[n] ?? { color: "#6B7080", short: (n || "?")[0] };
