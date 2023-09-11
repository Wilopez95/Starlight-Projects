"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateGcd = exports.mathRound2 = exports.mathRound = void 0;
const _mathRound = (num, numOfDecimal) => +`${Math.round(Number(`${num}e+${numOfDecimal}`))}e-${numOfDecimal}`;
const mathRound = (num, numOfDecimal = 1) => _mathRound(_mathRound(num, numOfDecimal + 1), numOfDecimal);
exports.mathRound = mathRound;
const mathRound2 = (num) => (0, exports.mathRound)(num, 2);
exports.mathRound2 = mathRound2;
// gcd - greatest common divisor
const calculateGcd = (numbers = []) => {
    const calculateGcd2 = (first, second) => {
        if (!second) {
            return second === 0 ? first : Number.NaN;
        }
        return calculateGcd2(second, first % second);
    };
    return Number(numbers.reduce((acc, cur) => calculateGcd2(cur, acc), 0));
};
exports.calculateGcd = calculateGcd;
//# sourceMappingURL=math.js.map