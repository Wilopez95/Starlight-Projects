const _mathRound = (num, numOfDecimal) =>
  +`${Math.round(`${num}e+${numOfDecimal}`)}e-${numOfDecimal}`;

export const mathRound = (num, numOfDecimal = 1) =>
  _mathRound(_mathRound(num, numOfDecimal + 1), numOfDecimal);

export const mathRound2 = num => mathRound(num, 2);

// gcd - greatest common divisor
export const calculateGcd = (numbers = []) => {
  const calculateGcd2 = (first, second) => {
    if (!second) {
      return second === 0 ? first : Number.NaN;
    }
    return calculateGcd2(second, first % second);
  };

  return Number(numbers.reduce((acc, cur) => calculateGcd2(cur, acc), 0));
};
