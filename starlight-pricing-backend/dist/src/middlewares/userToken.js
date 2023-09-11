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
exports.userToken = void 0;
const userToken_1 = require("../utils/userToken");
const userToken = (ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    const tokenId = (0, userToken_1.extractToken)(ctx);
    yield (0, userToken_1.proceedToken)(ctx, { tokenId });
    yield next();
});
exports.userToken = userToken;
//# sourceMappingURL=userToken.js.map