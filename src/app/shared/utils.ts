export function binarySearch(ar: number[], el: number) {
  let m = 0;
  let n = ar.length - 1;
  while (m <= n) {
    const k = (n + m) >> 1;
    const cmp = el - ar[k];
    if (cmp > 0) {
      m = k + 1;
    } else if (cmp < 0) {
      n = k - 1;
    } else {
      return k;
    }
  }
  return -m - 1;
}
