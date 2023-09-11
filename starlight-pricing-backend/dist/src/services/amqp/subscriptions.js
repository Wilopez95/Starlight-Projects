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
exports.createTenantSub = void 0;
const data_source_1 = require("../../data-source");
const base_controller_1 = require("../../controllers/base.controller");
const Tenants_1 = require("../../database/entities/admin/Tenants");
const createTableOnSchema = (schameName) => __awaiter(void 0, void 0, void 0, function* () {
    let schema = yield base_controller_1.BaseController.getDataSource(schameName);
    yield schema.synchronize();
    console.log(`Tenant ${schameName} created with success`);
});
const createTenantSub = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, legalName, region } = data;
    const tenant = yield data_source_1.AppDataSource.manager.findOne(Tenants_1.Tenants, {
        where: { name: name },
    });
    if (!tenant) {
        const newTenant = { name, legalName, region };
        yield data_source_1.AppDataSource.manager.insert(Tenants_1.Tenants, newTenant);
        try {
            yield data_source_1.AppDataSource.createQueryRunner().createSchema(name, true);
            yield createTableOnSchema(name);
        }
        catch (error) {
            console.error(error);
        }
    }
    else {
        console.error(`The tenant ${name} alreary exist`);
    }
});
exports.createTenantSub = createTenantSub;
//# sourceMappingURL=subscriptions.js.map