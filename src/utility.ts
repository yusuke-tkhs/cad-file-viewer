const range = (start: number, end: number) =>
  Array.from({ length: end - start + 1 }, (_, k) => k + start);

export default range;
