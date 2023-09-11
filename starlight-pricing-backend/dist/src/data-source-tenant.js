"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
const _1660258294514_testMigration_1 = require("./database/migration/1660258294514-testMigration");
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const _entitiesTenant_1 = require("./database/entities/_entitiesTenant");
const config_1 = require("./config/config");
exports.AppDataSource = new typeorm_1.DataSource({
    type: "postgres",
    host: config_1.DB_HOST,
    port: Number(config_1.DB_PORT),
    username: config_1.DB_USER,
    password: config_1.DB_PASSWORD,
    database: config_1.DB_DATABASE,
    // synchronize: true, //Should no run in prod
    logging: true,
    entities: _entitiesTenant_1.default.entities,
    //entities: [`${__dirname}/**/database/entities/admin/*{ts,js}`],
    migrations: [_1660258294514_testMigration_1.testMigration1660258294514],
    // migrations: [`${__dirname}/**/database/migratios/*{ts,js}`],
    subscribers: ["./database/subscribers/**"],
    migrationsTableName: "custom_migration_table",
});
//# sourceMappingURL=data-source-tenant.js.map