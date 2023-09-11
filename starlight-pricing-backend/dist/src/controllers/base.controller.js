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
exports.BaseController = void 0;
const typeorm_1 = require("typeorm");
const config_1 = require("../config/config");
const _entitiesTenant_1 = require("../database/entities/_entitiesTenant");
const lodash_1 = require("lodash");
class BaseController {
    static getDataSource(schemaName, logging = true) {
        return __awaiter(this, void 0, void 0, function* () {
            let dataSource = new typeorm_1.DataSource({
                type: "postgres",
                host: config_1.DB_HOST,
                port: Number(config_1.DB_PORT),
                username: config_1.DB_USER,
                password: config_1.DB_PASSWORD,
                database: config_1.DB_DATABASE,
                entities: _entitiesTenant_1.default.entities,
                schema: schemaName,
                logging: logging,
            });
            yield dataSource.initialize();
            return dataSource;
        });
    }
    getAll(ctx, next, type) {
        return __awaiter(this, void 0, void 0, function* () {
            let dataSource = yield BaseController.getDataSource(ctx.state.user.tenantName);
            const data = yield dataSource.manager.find(type);
            ctx.body = data;
            ctx.status = 200;
            yield dataSource.destroy();
            return next();
        });
    }
    getBy(ctx, next, type) {
        return __awaiter(this, void 0, void 0, function* () {
            let dataSource = yield BaseController.getDataSource(ctx.state.user.tenantName);
            let data = yield dataSource.manager.find(type, ctx.request.body);
            ctx.body = data;
            ctx.status = 200;
            yield dataSource.destroy();
            return next();
        });
    }
    getDataBy(ctx, type) {
        return __awaiter(this, void 0, void 0, function* () {
            let dataSource = yield BaseController.getDataSource(ctx.state.user.tenantName);
            let tmp = yield dataSource.manager.find(type, ctx.request.body);
            yield dataSource.destroy();
            return tmp;
        });
    }
    insert(ctx, next, type, historicalType = undefined) {
        return __awaiter(this, void 0, void 0, function* () {
            let input = ctx.request.body;
            let dataSource = yield BaseController.getDataSource(ctx.state.user.tenantName);
            let response = yield dataSource.manager.insert(type, input);
            let responseItem = response.identifiers.pop();
            ctx.body = "OK";
            ctx.status = 200;
            if (responseItem) {
                let body = yield dataSource.manager.findOne(type, {
                    where: { id: responseItem.id },
                });
                ctx.body = body;
                if (historicalType) {
                    input = Object.assign(Object.assign({}, body), BaseController.historicalAttributes("created", responseItem.id, ctx));
                    yield dataSource.manager.insert(historicalType, input);
                }
            }
            yield dataSource.destroy();
            return next();
        });
    }
    insertMany(ctx, next, type, historicalType = undefined) {
        return __awaiter(this, void 0, void 0, function* () {
            let input = ctx.request.body;
            let dataSource = yield BaseController.getDataSource(ctx.state.user.tenantName);
            let response = yield dataSource.manager.insert(type, input);
            let responseItem = response.identifiers;
            let responseArray = [];
            ctx.status = 200;
            if (responseItem) {
                for (let index = 0; index < responseItem.length; index++) {
                    let body = yield dataSource.manager.findOne(type, {
                        where: { id: responseItem[index].id },
                    });
                    responseArray.push(body);
                    if (historicalType) {
                        input = Object.assign(Object.assign({}, body), BaseController.historicalAttributes("created", responseItem[index].id, ctx));
                        yield dataSource.manager.insert(historicalType, input);
                    }
                }
            }
            yield dataSource.destroy();
            ctx.body = responseArray;
            return next();
        });
    }
    insertVoid(ctx, type, historicalType = undefined) {
        return __awaiter(this, void 0, void 0, function* () {
            let input = ctx.request.body;
            let dataSource = yield BaseController.getDataSource(ctx.state.user.tenantName);
            let response = yield dataSource.manager.insert(type, input);
            let responseItem = response.identifiers.pop();
            if (responseItem) {
                let body = yield dataSource.manager.findOne(type, {
                    where: { id: responseItem.id },
                });
                if (historicalType) {
                    input = Object.assign(Object.assign({}, body), BaseController.historicalAttributes("created", responseItem.id, ctx));
                    yield dataSource.manager.insert(historicalType, input);
                }
            }
            yield dataSource.destroy();
        });
    }
    bulkInsert(ctx, next, type, historicalType = undefined) {
        return __awaiter(this, void 0, void 0, function* () {
            const input = ctx.request.body;
            const dataSource = yield BaseController.getDataSource(ctx.state.user.tenantName);
            const insertResult = yield dataSource.manager.insert(type, input);
            const insertResultIds = insertResult.identifiers;
            if (historicalType) {
                const ids = insertResultIds.map((item) => item.id);
                const createdElements = yield dataSource.manager.find(type, {
                    where: { id: (0, typeorm_1.In)(ids) },
                });
                const historicalElements = createdElements.map((element, i) => {
                    return Object.assign(Object.assign({}, element), BaseController.historicalAttributes("created", ids[i], ctx));
                });
                yield dataSource.manager.insert(historicalType, historicalElements);
            }
            yield dataSource.destroy();
            ctx.status = 200;
            ctx.body = insertResultIds;
            return next();
        });
    }
    bulkInserts(ctx, next, type, historicalType = undefined) {
        return __awaiter(this, void 0, void 0, function* () {
            const input = ctx.request.body;
            const dataSource = yield BaseController.getDataSource(ctx.state.user.tenantName);
            const insertResult = yield dataSource.manager.insert(type, input);
            const ids = insertResult.identifiers.map((result) => result.id);
            const createdElements = yield dataSource.manager.find(type, {
                where: { id: (0, typeorm_1.In)(ids) },
            });
            if (historicalType) {
                const historicalElements = createdElements.map((element, i) => {
                    return Object.assign(Object.assign({}, element), BaseController.historicalAttributes("created", ids[i], ctx));
                });
                yield dataSource.manager.insert(historicalType, historicalElements);
            }
            yield dataSource.destroy();
            ctx.status = 200;
            ctx.body = createdElements;
            return next();
        });
    }
    updateVoid(ctx, type, historicalType = undefined, id_query = undefined) {
        return __awaiter(this, void 0, void 0, function* () {
            let input = ctx.request.body;
            let id;
            if (id_query) {
                id = id_query;
            }
            else {
                id = Number(ctx.query.id);
            }
            let dataSource = yield BaseController.getDataSource(ctx.state.user.tenantName);
            yield dataSource.manager.update(type, { id: id }, input);
            let data = yield dataSource.manager.findOneBy(type, { id });
            if (historicalType) {
                let historical = Object.assign(Object.assign({}, data), BaseController.historicalAttributes("edited", id, ctx));
                yield dataSource.manager.insert(historicalType, historical);
            }
            yield dataSource.destroy();
        });
    }
    update(ctx, next, type, historicalType = undefined, id_query = undefined) {
        return __awaiter(this, void 0, void 0, function* () {
            let input = ctx.request.body;
            let id = parseInt(ctx.request.url.split("/")[4]);
            if (id_query) {
                id = id_query;
            }
            let dataSource = yield BaseController.getDataSource(ctx.state.user.tenantName);
            yield dataSource.manager.update(type, { id: id }, input);
            let data = yield dataSource.manager.findOneBy(type, { id });
            ctx.body = data;
            ctx.status = 200;
            if (historicalType) {
                let historical = Object.assign(Object.assign({}, data), BaseController.historicalAttributes("edited", id, ctx));
                yield dataSource.manager.insert(historicalType, historical);
            }
            yield dataSource.destroy();
            return next();
        });
    }
    delete(ctx, next, type, historicalType = undefined) {
        return __awaiter(this, void 0, void 0, function* () {
            let dataSource = yield BaseController.getDataSource(ctx.state.user.tenantName);
            let data = yield dataSource.manager.findOneBy(type, ctx.request.body);
            //Validate if exist any item before the delete action
            if (!(0, lodash_1.isEmpty)(data)) {
                yield dataSource.manager.delete(type, ctx.request.body);
                if (historicalType) {
                    let historical = Object.assign(Object.assign({}, data), BaseController.historicalAttributes("deleted", data.id, ctx));
                    yield dataSource.manager.insert(historicalType, historical);
                }
            }
            yield dataSource.destroy();
            ctx.body = "OK";
            ctx.status = 200;
            return next();
        });
    }
    execQuery(query, ctx) {
        return __awaiter(this, void 0, void 0, function* () {
            let dataSource = yield BaseController.getDataSource(ctx.state.user.tenantName);
            let data = yield dataSource.manager.query(query);
            yield dataSource.destroy();
            return data;
        });
    }
    static historicalAttributes(eventType, original_id = undefined, ctx) {
        return {
            originalId: original_id ? original_id : 1,
            eventType: eventType,
            userId: ctx.state.user.id || 1,
            createdAt: new Date(),
            updatedAt: new Date(),
            traceId: ctx.state.reqId,
        };
    }
}
exports.BaseController = BaseController;
//# sourceMappingURL=base.controller.js.map