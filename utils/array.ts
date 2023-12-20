export function pickRandom<T>(list: T[]): T {
  return list[Math.floor(Math.random() * list.length)];
}

export function createDivisions(params: { start: number; end: number; divisions: number }) {
  const { start, end, divisions } = params;

  if (divisions < 1 || start >= end) return [start, end];

  const step = (end - start) / divisions;
  const divisionPoints = [start];

  for (let i = 1; i <= divisions; i++) {
    divisionPoints.push(Math.round(start + step * i));
  }

  return divisionPoints;
}
