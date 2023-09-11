"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const codesError_1 = require("../consts/codesError");
const httpStatusCodes_1 = require("../consts/httpStatusCodes");
class ApiError extends Error {
    constructor(message, code = codesError_1.default.GENERIC, status = httpStatusCodes_1.default.INTERNAL_SERVER_ERROR, details = undefined) {
        super(message);
        this.code = code;
        this.status = status;
        this.details = details;
    }
    static codes() {
        return Object.assign({}, codesError_1.default);
    }
    static unknown(message = "An unknown error occurred") {
        return new ApiError(message, codesError_1.default.UNKNOWN, httpStatusCodes_1.default.INTERNAL_SERVER_ERROR);
    }
    static invalidRequest(message = "Invalid request", details) {
        return new ApiError(message, codesError_1.default.INVALID_REQUEST, httpStatusCodes_1.default.UNPROCESSABLE_ENTITY, details);
    }
    static badRequest(message = "Bad request", details) {
        return new ApiError(message, codesError_1.default.INVALID_REQUEST, httpStatusCodes_1.default.BAD_REQUEST, details);
    }
    static notFound(message = "Not found", details) {
        return new ApiError(message, codesError_1.default.NOT_FOUND, httpStatusCodes_1.default.NOT_FOUND, details);
    }
    static notAuthenticated() {
        return new ApiError("Not authenticated", codesError_1.default.NOT_AUTHENTICATED, httpStatusCodes_1.default.UNAUTHORIZED);
    }
    static accessDenied(details) {
        return new ApiError("Access denied", codesError_1.default.ACCESS_DENIED, httpStatusCodes_1.default.FORBIDDEN, details);
    }
    static fileUploadFailed() {
        return new ApiError("File upload failed", codesError_1.default.INVALID_REQUEST, httpStatusCodes_1.default.UNPROCESSABLE_ENTITY);
    }
    static conflict(details, message = "Conflict detected") {
        return new ApiError(message, codesError_1.default.CONFLICT, httpStatusCodes_1.default.CONFLICT, details);
    }
    static paymentRequired(message = "Payment required", details) {
        return new ApiError(message, codesError_1.default.PAYMENT_REQUIRED, httpStatusCodes_1.default.PAYMENT_REQUIRED, details);
    }
    static preconditionFailed(message = "Precondition Failed", details) {
        return new ApiError(message, codesError_1.default.PRECONDITION_FAILED, httpStatusCodes_1.default.PRECONDITION_FAILED, details);
    }
    static invalidMimeType(allowedTypes) {
        return new ApiError("Invalid MIME-type", codesError_1.default.INVALID_REQUEST, httpStatusCodes_1.default.UNSUPPORTED_MEDIA_TYPE, { allowedTypes });
    }
    static bodyParserErrorHandler(error, ctx) {
        throw new ApiError("Could not parse body", codesError_1.default.INVALID_REQUEST, httpStatusCodes_1.default.BAD_REQUEST);
    }
}
exports.default = ApiError;
//# sourceMappingURL=ApiError.js.map