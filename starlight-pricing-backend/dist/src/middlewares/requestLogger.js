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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestLogger = exports.detailedLog = void 0;
const stream_1 = require("stream");
const config_1 = require("../config/config");
const logger_1 = require("./logger");
const lodash_1 = require("lodash");
const notLoggingRoutesOnSuccess = ['/api/health-check', '/api/billing/health-check', '/health-check'];
const debugging = ['debug', 'trace'].includes(config_1.LOG_LEVEL);
const detailedLog = (data, introspection = false) => {
    if (introspection)
        return 'IntrospectionQuery';
    if (config_1.LIGHT_LOGS)
        return 'Disable "LIGHT_LOGS" to see details';
    return (0, logger_1.cleanLogs)(data);
};
exports.detailedLog = detailedLog;
const requestLogger = (ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const start = Date.now();
    const { path, url, origin, search, method } = ctx.request;
    const common = { path, url, origin, search, method };
    const skipDetails = notLoggingRoutesOnSuccess.includes(url);
    const introspection = ((_a = ctx.request.body) === null || _a === void 0 ? void 0 : _a.operationName) === 'IntrospectionQuery';
    skipDetails ||
        ctx.logger.info(Object.assign(Object.assign({}, common), { headers: debugging ? (0, exports.detailedLog)(ctx.request.headers) : undefined, input: (0, exports.detailedLog)(ctx.request.body, introspection), files: (_b = ctx.request.files) === null || _b === void 0 ? void 0 : _b.map((i) => i.name) }), 'Request processing started');
    let hasError = false;
    let error;
    ctx.res.once('finish', () => {
        var _a, _b;
        const { status } = ctx.response;
        // eslint-disable-next-line no-unused-vars
        const _c = ((_a = ctx.state) === null || _a === void 0 ? void 0 : _a.user) || {}, { permissions } = _c, user = __rest(_c, ["permissions"]);
        const skipBodyLogging = ((_b = ctx.state) === null || _b === void 0 ? void 0 : _b.skipBodyLogging) || ctx.body instanceof stream_1.Stream;
        const took = Date.now() - start;
        Object.assign(common, { status, took, user: (0, exports.detailedLog)(user) });
        if (hasError || status >= 400) {
            ctx.logger.error(Object.assign(Object.assign({}, common), { output: (0, exports.detailedLog)(ctx.body, introspection), error }), 'Request processing failed');
        }
        else {
            skipDetails ||
                ctx.logger.info(Object.assign(Object.assign({}, common), { output: skipBodyLogging ? 'skipped' : (0, exports.detailedLog)(ctx.body, introspection) }), 'Request processing completed');
        }
        if (took >= config_1.SLOW_REQUEST_TIMEOUT) {
            ctx.logger.warn('Request took too long to proceed');
        }
    });
    try {
        yield next();
    }
    catch (err) {
        if (!(0, lodash_1.isEmpty)(err)) {
            error = err;
        }
        hasError = true;
        throw err;
    }
});
exports.requestLogger = requestLogger;
//# sourceMappingURL=requestLogger.js.map