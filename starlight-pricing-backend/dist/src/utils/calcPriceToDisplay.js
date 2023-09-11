"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calcPriceToDisplay = void 0;
const calcPriceToDisplay = (data) => {
    const price = data.price || 0;
    const calc = Number(Math.round(price / 1000000).toFixed(2));
    data.priceToDisplay = calc;
    return data;
};
exports.calcPriceToDisplay = calcPriceToDisplay;
//# sourceMappingURL=calcPriceToDisplay.js.map