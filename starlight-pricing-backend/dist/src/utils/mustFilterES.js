"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mustFilterES = void 0;
const mustFilterES = (filters) => {
    const must = Object.keys(filters).map((key) => {
        return { match: { [key]: filters[key] } };
    });
    return { must };
};
exports.mustFilterES = mustFilterES;
//# sourceMappingURL=mustFilterES.js.map