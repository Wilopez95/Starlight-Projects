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
exports.proceedToken = exports.setTokenId = exports.pickRequiredTokenData = exports.setTokenData = exports.extractTokenData = exports.extractToken = void 0;
const tokens_1 = require("../services/tokens");
const extractToken = (ctx) => {
    const authorizationHeader = ctx.request.headers.authorization;
    if (authorizationHeader) {
        const [, tokenId] = authorizationHeader.split(' ');
        return tokenId;
    }
    return "";
};
exports.extractToken = extractToken;
const extractTokenData = (ctx, tokenId) => __awaiter(void 0, void 0, void 0, function* () {
    const tokenData = yield (0, tokens_1.getUserTokenData)(ctx, tokenId);
    return tokenData;
});
exports.extractTokenData = extractTokenData;
const setTokenData = (ctx, tokenData) => {
    var _a;
    if (!tokenData) {
        return;
    }
    const { userInfo } = tokenData;
    const firstName = userInfo.firstName || '';
    const lastName = userInfo.lastName || '';
    ctx.state.user = Object.assign(Object.assign({}, userInfo), { name: userInfo.name || `${firstName || ''} ${lastName || ''}`.trim() || 'Root', firstName,
        lastName, subscriberName: userInfo.tenantName, 
        // TODO: yaaay, more aliases! Remove this eventually at some point.
        schemaName: userInfo.tenantName, userId: userInfo.id, tenantId: Number(userInfo.tenantId) });
    ctx.state.userTokenData = tokenData;
    ctx.state.userId = (_a = ctx.state.user.userId) !== null && _a !== void 0 ? _a : 'system';
    // because there are a lot of places where manually constructed cut ctx uses short format TODO: refactor
    ctx.user = ctx.state.user;
    // because there are a lot of places where manually constructed cut ctx uses short format TODO: refactor
    ctx.models = ctx.state.models;
};
exports.setTokenData = setTokenData;
const pickRequiredTokenData = (ctx) => {
    if (!ctx.state.userTokenData) {
        return {};
    }
    const { userInfo: { id, userId, customerId, contactId, email, firstName, lastName, subscriberName, schemaName, tenantId, tenantName }, umsAccessToken: accessToken, } = ctx.state.userTokenData;
    return {
        userInfo: {
            id,
            userId,
            customerId,
            contactId,
            email,
            firstName,
            lastName,
            subscriberName,
            schemaName,
            tenantId,
            tenantName,
        },
        accessToken,
    };
};
exports.pickRequiredTokenData = pickRequiredTokenData;
const setTokenId = (ctx, tokenId) => {
    if (!tokenId) {
        return;
    }
    ctx.state.tokenId = tokenId;
};
exports.setTokenId = setTokenId;
const proceedToken = (ctx, { tokenId, existingTokenData, dontCheck = false }) => __awaiter(void 0, void 0, void 0, function* () {
    let tokenData;
    if (!dontCheck) {
        if (!tokenId) {
            return;
        }
        tokenData = yield (0, exports.extractTokenData)(ctx, tokenId);
        if (!tokenData) {
            return;
        }
    }
    else {
        tokenData = existingTokenData;
    }
    (0, exports.setTokenId)(ctx, tokenId);
    (0, exports.setTokenData)(ctx, tokenData);
});
exports.proceedToken = proceedToken;
//# sourceMappingURL=userToken.js.map