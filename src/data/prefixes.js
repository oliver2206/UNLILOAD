// Philippine mobile prefixes (first 4 digits) grouped by the company that originally issued them.
// A prefix cannot tell sub-brands apart (Globe/TM/GOMO, Smart/TNT), and numbers can be moved to
// another network (Mobile Number Portability), so detection is a best guess. Users can always
// change the network manually.
export const prefixGroups = [
  {
    candidates: ["Globe", "TM", "GOMO"],
    prefixes: [
      "0817", "0904", "0905", "0906", "0915", "0916", "0917", "0926", "0927",
      "0935", "0936", "0937", "0945", "0953", "0954", "0955", "0956", "0965",
      "0966", "0967", "0975", "0976", "0977", "0978", "0979", "0995", "0996", "0997",
    ],
  },
  {
    // Includes former Sun Cellular prefixes (Sun prepaid is now Smart)
    candidates: ["Smart", "TNT"],
    prefixes: [
      "0813", "0900", "0907", "0908", "0909", "0910", "0911", "0912", "0913", "0914",
      "0918", "0919", "0920", "0921", "0922", "0923", "0924", "0925", "0928", "0929",
      "0930", "0931", "0932", "0933", "0934", "0938", "0939", "0940", "0941", "0942",
      "0943", "0944", "0946", "0947", "0948", "0949", "0950", "0951", "0961", "0963",
      "0968", "0969", "0970", "0973", "0974", "0998", "0999",
    ],
  },
  {
    candidates: ["DITO"],
    prefixes: ["0895", "0896", "0897", "0898", "0991", "0992", "0993", "0994"],
  },
];

export function detectNetworks(prefix4) {
  const group = prefixGroups.find((g) => g.prefixes.includes(prefix4));
  return group ? group.candidates : [];
}
