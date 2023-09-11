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
exports.searchSubscriptionsES = void 0;
const searchIndices_1 = require("../../consts/searchIndices");
const elasticSearch_1 = require("./elasticSearch");
const searchSubscriptionsES = (ctx, schemaName, conditions) => __awaiter(void 0, void 0, void 0, function* () {
    return (0, elasticSearch_1.search)(ctx, searchIndices_1.TENANT_INDEX.subscriptions, (0, elasticSearch_1.applyTenantToIndex)(searchIndices_1.TENANT_INDEX.subscriptions, schemaName), conditions);
});
exports.searchSubscriptionsES = searchSubscriptionsES;
//# sourceMappingURL=subscriptions.js.map