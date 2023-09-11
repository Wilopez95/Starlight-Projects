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
exports.processSearchQuery = void 0;
// special array case with commas or null
function processSearchQuery(field, searchOnly = false, ctx, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = ctx.request.query[field];
        // should be allowed by Joi to search by "null"
        if (query === null) {
            ctx.request.query[field] = String(query);
        }
        if (!query && searchOnly) {
            // just don't perform search
            return ctx.sendArray([]);
        }
        if (Array.isArray(query)) {
            ctx.request.query[field] = query.join(",");
        }
        yield next();
    });
}
exports.processSearchQuery = processSearchQuery;
//# sourceMappingURL=requestParamsParser.js.map