"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unambiguousTupleCondition = void 0;
const unambiguousTupleCondition = (tableName, tupleConditions) => tupleConditions === null || tupleConditions === void 0 ? void 0 : tupleConditions.map((tupleCondition) => tupleCondition[0].includes(".")
    ? [tupleCondition[0], tupleCondition[1], tupleCondition[2]]
    : [
        `${tableName}.${tupleCondition[0]}` +
            " " +
            tupleCondition[1] +
            " " +
            `'${tupleCondition[2]}'`,
    ]);
exports.unambiguousTupleCondition = unambiguousTupleCondition;
//# sourceMappingURL=subscriptionOrderConditions.js.map