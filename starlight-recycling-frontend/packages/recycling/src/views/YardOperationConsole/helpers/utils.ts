export const preventUpdate = (nextV: number, v: number) => isNaN(nextV) || nextV === v;
