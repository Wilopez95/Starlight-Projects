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
exports.logger = exports.cleanLogs = exports.pinoLogger = void 0;
const pino_1 = require("pino");
const config_1 = require("../config/config");
const lodash_1 = require("lodash");
const formatters = {
    log(data) {
        if (!(0, lodash_1.isObjectLike)(data)) {
            return { content: String(data) || "NO_CONTENT" };
        }
        if ((0, lodash_1.isEmpty)(data)) {
            return { content: "NO_CONTENT" };
        }
        const { method, origin, path, status, search, took, url } = data, content = __rest(data, ["method", "origin", "path", "status", "search", "took", "url"]);
        const res = { content };
        method && (res.method = method);
        origin && (res.origin = origin);
        path && (res.path = path);
        status && (res.status = status);
        search && (res.search = search);
        !Number.isNaN(took) && (res.took = took);
        url && (res.url = url);
        return res;
    },
};
const prettyPrint = !!config_1.PRETTY_LOGS && { colorize: true, translateTime: true, levelFirst: true };
exports.pinoLogger = (0, pino_1.default)({
    prettyPrint,
    level: config_1.LOG_LEVEL || "info",
    timestamp: pino_1.stdTimeFunctions.isoTime,
    formatters,
});
const cleanLogs = (data) => {
    if (Array.isArray(data)) {
        return data.map((value) => (Array.isArray(value) || ((0, lodash_1.isObject)(value) && !(0, lodash_1.isEmpty)(value)) ? (0, exports.cleanLogs)(value) : value));
    }
    if ((0, lodash_1.isObject)(data) && !(0, lodash_1.isEmpty)(data)) {
        return Object.entries(data).reduce((res, [key, value]) => {
            if (!config_1.LOGGING_REMOVE.includes(key)) {
                if (config_1.LOGGING_HIDE.includes(key)) {
                    res[key] = "***";
                }
                else {
                    res[key] = Array.isArray(value) || ((0, lodash_1.isObject)(value) && !(0, lodash_1.isEmpty)(value)) ? (0, exports.cleanLogs)(value) : value;
                }
            }
            return res;
        }, {});
    }
    return data;
};
exports.cleanLogs = cleanLogs;
const logger = (ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    ctx.logger = exports.pinoLogger.child({ reqId: ctx.state.reqId });
    ctx.state.logger = ctx.logger;
    yield next();
});
exports.logger = logger;
//# sourceMappingURL=logger.js.map