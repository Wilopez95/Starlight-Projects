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
exports.DatabaseConfigurations = void 0;
const base_controller_1 = require("../controllers/base.controller");
const data_source_1 = require("../data-source");
class DatabaseConfigurations {
    constructor() { }
    syncGeneralMigrations() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                /*
                This function start the general miration in this backend
                */
                const existTenants = yield data_source_1.AppDataSource.createQueryRunner().query("SELECT * FROM public.tenants");
                if (existTenants.length > 0) {
                    yield data_source_1.AppDataSource.runMigrations();
                    yield Promise.all(existTenants.map((tenant) => __awaiter(this, void 0, void 0, function* () {
                        try {
                            yield this.synchTenant(tenant.name);
                            console.log(`Tenant ${tenant.name} updated successfully`);
                        }
                        catch (errorSynch) {
                            console.error(`Error updating tenant${tenant.name} : ${errorSynch}`);
                        }
                    })));
                }
            }
            catch (error) {
                console.error(`General Migrations error:${error}`);
            }
        });
    }
    synchTenant(schemaName) {
        return __awaiter(this, void 0, void 0, function* () {
            let database = yield base_controller_1.BaseController.getDataSource(schemaName, false);
            yield database.synchronize();
        });
    }
    ;
}
exports.DatabaseConfigurations = DatabaseConfigurations;
//# sourceMappingURL=syncDB.js.map