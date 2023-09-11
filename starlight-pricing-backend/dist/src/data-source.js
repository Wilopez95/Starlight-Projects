"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const _entitiesAdmin_1 = require("./database/entities/_entitiesAdmin");
const config_1 = require("./config/config");
const _1663627202889_alterThresholdColumns_1 = require("./database/migration/1663627202889-alterThresholdColumns");
exports.AppDataSource = new typeorm_1.DataSource({
    type: "postgres",
    host: config_1.DB_HOST,
    port: Number(config_1.DB_PORT),
    username: config_1.DB_USER,
    password: config_1.DB_PASSWORD,
    database: config_1.DB_DATABASE,
    synchronize: true,
    logging: true,
    entities: _entitiesAdmin_1.default.entities,
    //entities: [`${__dirname}/**/database/entities/admin/*{ts,js}`],
    migrations: [_1663627202889_alterThresholdColumns_1.alterThresholdColumns1663627202889],
    // migrations: [`${__dirname}/**/database/migratios/*{ts,js}`],
    subscribers: ["./database/subscribers/**"],
    migrationsTableName: "migrations",
});
//# sourceMappingURL=data-source.js.map