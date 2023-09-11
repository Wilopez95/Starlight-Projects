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
exports.count = exports.search = exports.applyTenantToIndex = exports.getAuditLogClient = exports.getClient = void 0;
const elasticsearch = require("@opensearch-project/opensearch");
const fp_1 = require("lodash/fp");
const config_1 = require("../../config/config");
const searchIndices_1 = require("../../consts/searchIndices");
const { Client } = elasticsearch;
const DEFAULT_LIMIT = 5;
let client;
let auditLogClient;
const getClient = (ctx) => {
    if (!client) {
        try {
            client = new Client({
                node: `${config_1.ELASTIC_URL}:${config_1.ELASTIC_PORT}`,
                ssl: { rejectUnauthorized: false },
            });
        }
        catch (error) {
            ctx.logger.error("ES connection cannot be established");
            throw error;
        }
    }
    return client;
};
exports.getClient = getClient;
const getAuditLogClient = (ctx) => {
    if (!auditLogClient) {
        try {
            auditLogClient = new Client({
                node: `${config_1.AUDIT_LOGS_ELASTIC_URL}:${config_1.AUDIT_LOGS_ELASTIC_PORT}`,
                ssl: { rejectUnauthorized: false },
            });
        }
        catch (error) {
            ctx.logger.error("ES [al] connection cannot be established");
            throw error;
        }
    }
    return auditLogClient;
};
exports.getAuditLogClient = getAuditLogClient;
const applyTenantToIndex = (indexName, tenant) => `${indexName}__${tenant.toLowerCase()}`;
exports.applyTenantToIndex = applyTenantToIndex;
const search = (ctx, templateName, indexName, _a = {}) => { var _b, _c, _d, _e, _f, _g, _h, _j, _k; return __awaiter(void 0, void 0, void 0, function* () {
    var { query, limit = DEFAULT_LIMIT, skip = 0, sort, bool } = _a, params = __rest(_a, ["query", "limit", "skip", "sort", "bool"]);
    const template = {
        id: templateName,
        params: Object.assign({ size: limit, from: skip, query, sort }, params),
        source: { size: limit, from: skip, sort, query: { bool } },
    };
    const isAuditLogTemplate = templateName === searchIndices_1.TENANT_INDEX.auditLogs;
    const esClient = isAuditLogTemplate ? (0, exports.getAuditLogClient)(ctx) : (0, exports.getClient)(ctx);
    try {
        const results = yield esClient.searchTemplate({
            index: indexName,
            body: template,
        });
        const items = (_b = results === null || results === void 0 ? void 0 : results.body) === null || _b === void 0 ? void 0 : _b.hits;
        return {
            [(0, fp_1.camelCase)(templateName)]: ((_c = items === null || items === void 0 ? void 0 : items.hits) === null || _c === void 0 ? void 0 : _c.map((hit) => (Object.assign(Object.assign({}, hit._source), { id: hit._id, highlight: hit.highlight })))) || [],
            total: ((_d = items === null || items === void 0 ? void 0 : items.total) === null || _d === void 0 ? void 0 : _d.value) || 0,
            length: ((_e = items === null || items === void 0 ? void 0 : items.hits) === null || _e === void 0 ? void 0 : _e.length) || 0,
        };
    }
    catch (error) {
        if ((error === null || error === void 0 ? void 0 : error.type) !== "index_not_found_exception") {
            ctx.logger.error(`Failed to perform search for: "${templateName}"`);
        }
        const cause = (_h = (_g = (_f = error === null || error === void 0 ? void 0 : error.body) === null || _f === void 0 ? void 0 : _f.error) === null || _g === void 0 ? void 0 : _g.root_cause) === null || _h === void 0 ? void 0 : _h[0];
        cause && ctx.logger.debug(cause);
        if (((_k = (_j = error === null || error === void 0 ? void 0 : error.body) === null || _j === void 0 ? void 0 : _j.error) === null || _k === void 0 ? void 0 : _k.type) === "json_parse_exception") {
            ctx.logger.info(`Search template ${templateName} is invalid`);
        }
        ctx.logger.error(error);
        return null;
    }
}); };
exports.search = search;
const count = (ctx, templateName, indexName, { value, query } = {}) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f;
    const isAuditLogTemplate = templateName === searchIndices_1.TENANT_INDEX.auditLogs;
    const esClient = isAuditLogTemplate ? (0, exports.getAuditLogClient)(ctx) : (0, exports.getClient)(ctx);
    try {
        const results = yield esClient.count({
            index: indexName,
            body: query,
        });
        const result = {
            status: value,
            count: ((_a = results === null || results === void 0 ? void 0 : results.body) === null || _a === void 0 ? void 0 : _a.count) || 0,
        };
        return result;
    }
    catch (error) {
        if ((error === null || error === void 0 ? void 0 : error.type) !== "index_not_found_exception") {
            ctx.logger.error(`Failed to perform search for: "${templateName}"`);
        }
        const cause = (_d = (_c = (_b = error === null || error === void 0 ? void 0 : error.body) === null || _b === void 0 ? void 0 : _b.error) === null || _c === void 0 ? void 0 : _c.root_cause) === null || _d === void 0 ? void 0 : _d[0];
        cause && ctx.logger.debug(cause);
        if (((_f = (_e = error === null || error === void 0 ? void 0 : error.body) === null || _e === void 0 ? void 0 : _e.error) === null || _f === void 0 ? void 0 : _f.type) === "json_parse_exception") {
            ctx.logger.info(`Search template ${templateName} is invalid`);
        }
        ctx.logger.error(error);
        return null;
    }
});
exports.count = count;
//# sourceMappingURL=elasticSearch.js.map