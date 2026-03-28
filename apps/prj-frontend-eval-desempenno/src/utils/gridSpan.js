// 100/24=4.1667%
const spans = {
  1: "col-span-1",   // 4.17%
  2: "col-span-2",   // 8.33%
  3: "col-span-3",   // 12.50%
  4: "col-span-4",   // 16.67%
  5: "col-span-5",   // 20.83%
  6: "col-span-6",   // 25.00%
  7: "col-span-7",   // 29.17%
  8: "col-span-8",   // 33.33%
  9: "col-span-9",   // 37.50%
  10: "col-span-10", // 41.67%
  11: "col-span-11", // 45.83%
  12: "col-span-12", // 50.00%
  13: "col-span-13", // 54.17%
  14: "col-span-14", // 58.33%
  15: "col-span-15", // 62.50%
  16: "col-span-16", // 66.67%
  17: "col-span-17", // 70.83%
  18: "col-span-18", // 75.00%
  19: "col-span-19", // 79.17%
  20: "col-span-20", // 83.33%
  21: "col-span-21", // 87.50%
  22: "col-span-22", // 91.67%
  23: "col-span-23", // 95.83%
  24: "col-span-24", // 100%
};

export function gridSpan(span = 24) {
  const s = Number(span);
  return spans[s] ?? "col-span-24";
}
