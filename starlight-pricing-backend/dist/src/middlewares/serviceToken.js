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
exports.serviceToken = void 0;
const tokens_1 = require("../services/tokens");
const serviceToken = (ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { authorization } = ctx.request.headers;
    if (authorization) {
        const [tokenHeader, token] = authorization.split(" ");
        if ((tokenHeader === null || tokenHeader === void 0 ? void 0 : tokenHeader.toLowerCase()) === "servicetoken") {
            try {
                ctx.state.serviceToken = yield (0, tokens_1.parseServiceToken)(token);
            }
            catch (e) {
                ctx.logger.error(e);
            }
            const payload = ctx.state.serviceToken;
            if (payload) {
                ctx.state.user = Object.assign(Object.assign({}, payload), { subscriberName: payload.schemaName || payload.tenantName, tenantName: payload.schemaName || payload.tenantName });
            }
        }
    }
    yield next();
});
exports.serviceToken = serviceToken;
//# sourceMappingURL=serviceToken.js.map