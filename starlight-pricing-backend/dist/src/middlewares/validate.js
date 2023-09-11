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
exports.validate = void 0;
const ApiError_1 = require("../utils/ApiError");
const validate = (schema, reqPart = "body") => (ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    // const dataToValidate = { ...ctx.request.body };
    const dataToValidate = reqPart === "params" ? ctx.params : ctx.request[reqPart];
    ctx.request.body = {};
    let validatedData;
    try {
        validatedData = yield schema.validateAsync(dataToValidate, {
            stripUnknown: true,
            convert: true,
            context: undefined,
        });
    }
    catch (err) {
        throw ApiError_1.default.invalidRequest("Invalid request", err.details || err.message);
    }
    if (validatedData) {
        if (Array.isArray(validatedData)) {
            if (!Array.isArray(ctx.request.body)) {
                ctx.request.body = Array.from(validatedData);
            }
            ctx.request.body = validatedData;
        }
        Object.assign(ctx.request.body, validatedData);
    }
    yield next();
});
exports.validate = validate;
//# sourceMappingURL=validate.js.map