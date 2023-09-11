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
const Router = require("koa-router");
const data_source_1 = require("../data-source");
const base_controller_1 = require("../controllers/base.controller");
const router = new Router();
const createTableOnSchema = (schemaName) => __awaiter(void 0, void 0, void 0, function* () {
    let database = yield base_controller_1.BaseController.getDataSource(schemaName);
    yield database.synchronize();
});
router.post("/", (ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { tenantName } = ctx.request.body;
    try {
        yield data_source_1.AppDataSource.createQueryRunner().createSchema(tenantName, true);
        yield createTableOnSchema(tenantName);
        ctx.body = `Tenant ${tenantName} created with success`;
        ctx.status = 200;
    }
    catch (error) {
        ctx.body = `schema ${tenantName} already exists ${error}`;
        ctx.status = 400;
    }
    return next();
}));
exports.default = router.routes();
//# sourceMappingURL=create-tenant.js.map