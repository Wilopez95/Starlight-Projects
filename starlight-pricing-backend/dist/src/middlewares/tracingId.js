"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tracingId = void 0;
const config_1 = require("../config/config");
const generateTraceId_1 = require("../utils/generateTraceId");
const tracingId = (ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    let requestId = ctx.request.headers[config_1.TRACING_HEADER] || ctx.request.headers['x-amzn-trace-id'] || ctx.query[config_1.TRACING_PARAM];
    if (!requestId) {
        requestId = (0, generateTraceId_1.generateTraceId)();
    }
    ctx.state.reqId = requestId;
    yield next();
});
exports.tracingId = tracingId;
//# sourceMappingURL=tracingId.js.map