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
exports.makeHaulingRequest = exports.makeDispatchRequest = exports.makeRecyclingRequest = exports.makeUmsRequest = exports.makeBillingRequest = void 0;
const axios_1 = require("axios");
const fp_1 = require("lodash/fp");
const tokens_1 = require("../services/tokens");
const generateTraceId_1 = require("./generateTraceId");
const ApiError_1 = require("./ApiError");
const config_1 = require("../config/config");
const getToken = (ctx) => {
    var _a, _b;
    if (ctx.state && ((_a = ctx.state.userTokenData) === null || _a === void 0 ? void 0 : _a.umsAccessToken)) {
        return ctx.state.userTokenData.umsAccessToken;
    }
    const authHeaderToken = (_b = ctx.headers.authorization) === null || _b === void 0 ? void 0 : _b.split(" ");
    if ((authHeaderToken === null || authHeaderToken === void 0 ? void 0 : authHeaderToken.length) === 2 &&
        (authHeaderToken === null || authHeaderToken === void 0 ? void 0 : authHeaderToken[0].toLowerCase()) === "bearer") {
        return authHeaderToken[1];
    }
};
const omitUndefined = (0, fp_1.omitBy)((val) => val === undefined);
const makeRequest = (baseUrl, logPrefix, versioned = true) => (ctx, _a) => { var _b, _c; return __awaiter(void 0, void 0, void 0, function* () {
    var { version = versioned ? 1 : undefined, token, serviceToken } = _a, requestConfig = __rest(_a, ["version", "token", "serviceToken"]);
    const headers = Object.assign(Object.assign({}, requestConfig === null || requestConfig === void 0 ? void 0 : requestConfig.headers), { "x-amzn-trace-id": (_c = (_b = ctx.state.reqId) !== null && _b !== void 0 ? _b : ctx.reqId) !== null && _c !== void 0 ? _c : (0, generateTraceId_1.generateTraceId)() });
    if (serviceToken) {
        headers.authorization = `ServiceToken ${serviceToken}`;
    }
    else {
        const accessToken = token !== null && token !== void 0 ? token : (ctx ? getToken(ctx) : null);
        if (accessToken && !headers.authorization) {
            headers.authorization = `Bearer ${accessToken}`;
        }
    }
    let response;
    try {
        response = yield (0, axios_1.default)(Object.assign(Object.assign({ baseURL: `${baseUrl}${version ? `/v${version}` : ""}`, paramsSerializer: (params) => new URLSearchParams(omitUndefined(params)).toString() }, requestConfig), { headers }));
    }
    catch (error) {
        if (!error.response) {
            throw ApiError_1.default.unknown(`Error while calling ${logPrefix}`);
        }
        else {
            const originalError = error.response.data;
            throw new ApiError_1.default(`${logPrefix} returned an error`, error.response.data.code, error.response.status, {
                originalError: error.response.data,
            });
        }
    }
    return response === null || response === void 0 ? void 0 : response.data;
}); };
const makeBillingRequest = (ctx, paramsObj) => __awaiter(void 0, void 0, void 0, function* () {
    const _a = ctx.state.user, { permissions: _ } = _a, payload = __rest(_a, ["permissions"]);
    paramsObj.serviceToken = yield (0, tokens_1.createServiceToken)(payload, {
        subject: String(ctx.state.user.userId),
        requestId: ctx.state.reqId,
        audience: config_1.BILLING_SERVICE_API_URL,
    });
    return makeRequest(config_1.BILLING_SERVICE_API_URL ? config_1.BILLING_SERVICE_API_URL : "", "Billing API").call(this, ctx, paramsObj);
});
exports.makeBillingRequest = makeBillingRequest;
exports.makeUmsRequest = makeRequest(config_1.UMS_SERVICE_API_URL ? config_1.UMS_SERVICE_API_URL : "", "User management API", false);
const makeRecyclingRequest = (ctx, paramsObj) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    const { tenantName, businessUnitId } = ctx.state;
    const audience = "recycling";
    const srn = `srn:${tenantName}:${audience}:${businessUnitId}`;
    const payload = { resource: srn };
    paramsObj.serviceToken = yield (0, tokens_1.createServiceToken)(payload, {
        subject: String((_b = ctx.state.user) === null || _b === void 0 ? void 0 : _b.userId) || "unknown",
        requestId: ctx.state.reqId,
        audience,
    });
    return makeRequest(config_1.RECYCLING_SERVICE_API_URL ? config_1.RECYCLING_SERVICE_API_URL : "", "Recycling API", false).call(this, ctx, paramsObj);
});
exports.makeRecyclingRequest = makeRecyclingRequest;
const makeDispatchRequest = (ctx, paramsObj) => __awaiter(void 0, void 0, void 0, function* () {
    const _c = ctx.state.user, { permissions: _ } = _c, payload = __rest(_c, ["permissions"]);
    paramsObj.serviceToken = yield (0, tokens_1.createServiceToken)(payload, {
        subject: String(ctx.state.user.userId),
        requestId: ctx.state.reqId,
        audience: "dispatch",
    });
    paramsObj.headers = {
        "content-type": "application/json",
        "x-dispatch-api-sender": "core",
    };
    return makeRequest(config_1.TRASH_API_URL ? config_1.TRASH_API_URL : "", "Trash API").call(this, ctx, paramsObj);
});
exports.makeDispatchRequest = makeDispatchRequest;
const makeHaulingRequest = (ctx, paramsObj) => __awaiter(void 0, void 0, void 0, function* () {
    const payload = __rest(ctx.state.user, []);
    const newPayload = Object.assign({}, payload);
    delete newPayload.availableActions;
    delete newPayload.permissions;
    paramsObj.serviceToken = yield (0, tokens_1.createServiceToken)(newPayload, {
        subject: String(ctx.state.user.userId),
        requestId: ctx.state.reqId,
        audience: config_1.HAULING_SERVICE_API_URL,
    });
    return makeRequest(config_1.HAULING_SERVICE_API_URL ? config_1.HAULING_SERVICE_API_URL : "", "Hauling API", false).call(this, ctx, paramsObj);
});
exports.makeHaulingRequest = makeHaulingRequest;
//# sourceMappingURL=makeRequest.js.map