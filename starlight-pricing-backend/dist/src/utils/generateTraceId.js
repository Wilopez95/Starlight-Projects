"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTraceId = void 0;
const nanoid_1 = require("nanoid");
exports.generateTraceId = (0, nanoid_1.customAlphabet)('1234567890abcdef', 64);
//# sourceMappingURL=generateTraceId.js.map