const round = (num: number, numOfDecimal: number) =>
  +`${Math.round(+`${num}e+${numOfDecimal}`)}e-${numOfDecimal}`;

export const mathRound = (num: number, decimalPlaces = 1): number =>
  round(round(num, decimalPlaces + 1), decimalPlaces);

export const mathRound2 = (num: number): number => mathRound(num, 2);
