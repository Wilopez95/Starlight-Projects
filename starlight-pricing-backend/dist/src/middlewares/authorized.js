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
exports.authorized = exports.checkPermissions = void 0;
const ApiError_1 = require("../utils/ApiError");
const checkPermissions = (user, permissions) => {
    if (permissions.length === 0) {
        return true;
    }
    //permissions.push("starlight-admin");
    return permissions.some((permission) => user.permissions.includes(permission));
};
exports.checkPermissions = checkPermissions;
const authorized = (permissions = []) => {
    if (!Array.isArray(permissions)) {
        throw new TypeError('Expected permissions to be an array');
    }
    const authorizedMiddleware = (ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
        const { user, serviceToken } = ctx.state;
        if (!user && !serviceToken) {
            throw ApiError_1.default.notAuthenticated();
        }
        if (serviceToken) {
            yield next();
            return;
        }
        if (!(0, exports.checkPermissions)(user, permissions)) {
            throw ApiError_1.default.accessDenied("check Permissions failed");
        }
        yield next();
    });
    return authorizedMiddleware;
};
exports.authorized = authorized;
//# sourceMappingURL=authorized.js.map