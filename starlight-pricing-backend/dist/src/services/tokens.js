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
exports.getUserTokenData = exports.parseServiceToken = exports.createServiceToken = void 0;
const crypto_1 = require("crypto");
const fs_1 = require("fs");
const paseto_1 = require("paseto");
const ci_info_1 = require("ci-info");
const config_1 = require("../config/config");
const redis_1 = require("./redis");
let sk;
let pk;
if (!ci_info_1.isCI) {
    if (!config_1.SERVICE_PUBLIC_KEY) {
        throw new Error('SERVICE_PUBLIC_KEY is required');
    }
    if (!config_1.SERVICE_SECRET_KEY) {
        throw new Error('SERVICE_SECRET_KEY is required');
    }
    let publicKeyContents = config_1.SERVICE_PUBLIC_KEY;
    let secretKeyContents = config_1.SERVICE_SECRET_KEY;
    if (config_1.SERVICE_PUBLIC_KEY[0] === '/') {
        publicKeyContents = (0, fs_1.readFileSync)(config_1.SERVICE_PUBLIC_KEY).toString();
    }
    if (config_1.SERVICE_SECRET_KEY[0] === '/') {
        secretKeyContents = (0, fs_1.readFileSync)(config_1.SERVICE_SECRET_KEY).toString();
    }
    pk = (0, crypto_1.createPublicKey)(publicKeyContents);
    sk = (0, crypto_1.createPrivateKey)({
        key: secretKeyContents,
        passphrase: config_1.SERVICE_SECRET_KEY_PASSPHRASE,
    });
}
const createServiceToken = (payload, { requestId, audience, subject }) => __awaiter(void 0, void 0, void 0, function* () {
    if (!sk) {
        throw new TypeError('Secret key not initialized!');
    }
    const signed = yield paseto_1.V2.sign(payload, sk, {
        issuer: 'billing',
        audience,
        subject,
        jti: requestId,
        iat: true,
        // notBefore:  token is valid after this timestamp
        expiresIn: '15 min',
    });
    return signed;
});
exports.createServiceToken = createServiceToken;
const parseServiceToken = (token, { audience, subject, issuer } = {}) => __awaiter(void 0, void 0, void 0, function* () {
    if (!pk) {
        throw new TypeError('Secret key not initialized!');
    }
    const parsed = yield paseto_1.V2.verify(token, pk, {
        audience,
        subject,
        issuer,
        clockTolerance: '1 min',
    });
    return parsed;
});
exports.parseServiceToken = parseServiceToken;
const getTokenKey = (tokenId) => `resource-user-token:access:${tokenId}`;
const getTokenData = (ctx, tokenKey) => __awaiter(void 0, void 0, void 0, function* () {
    const dataStr = yield redis_1.client.get(tokenKey);
    if (!dataStr) {
        return null;
    }
    try {
        return JSON.parse(dataStr);
    }
    catch (e) {
        ctx.logger.error(`Failed to parse token (${tokenKey}) data`, e);
        return null;
    }
});
const getUserTokenData = (ctx, token) => getTokenData(ctx, getTokenKey(token));
exports.getUserTokenData = getUserTokenData;
//# sourceMappingURL=tokens.js.map