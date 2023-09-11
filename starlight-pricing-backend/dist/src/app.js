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
require("reflect-metadata");
const Koa = require("koa");
const bodyParser = require("koa-bodyparser");
const cors = require("@koa/cors");
const helmet = require("koa-helmet");
const json = require("koa-json");
// import * as logger from "koa-logger";
const server_1 = require("./server");
const userToken_1 = require("./middlewares/userToken");
const serviceToken_1 = require("./middlewares/serviceToken");
const tracingId_1 = require("./middlewares/tracingId");
const amqp_1 = require("./services/amqp");
const data_source_1 = require("./data-source");
const syncDB_1 = require("./database/syncDB");
const logger_1 = require("./middlewares/logger");
const requestLogger_1 = require("./middlewares/requestLogger");
const app = new Koa();
const port = process.env.PORT || 3000;
const databaseConfigurations = new syncDB_1.DatabaseConfigurations();
const koaOptions = {
    //origin: "https://hauling.dev3.starlightpro.net",
    credentials: true,
};
data_source_1.AppDataSource.initialize()
    .then(() => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Data Source has been initialized!");
    app.use(helmet({
        contentSecurityPolicy: process.env.NODE_ENV === "production" ? undefined : false,
    }));
    app.use(cors(koaOptions));
    app.use(tracingId_1.tracingId);
    app.use(logger_1.logger);
    app.use(requestLogger_1.requestLogger);
    app.use(json());
    app.use(bodyParser());
    app.use(userToken_1.userToken);
    app.use(serviceToken_1.serviceToken);
    app.use(server_1.default.routes());
    app.use(server_1.default.allowedMethods());
    app.listen(port, () => {
        console.log(`🚀 App listening on the port ${port}`);
    });
    yield (0, amqp_1.setupMq)();
    yield databaseConfigurations.syncGeneralMigrations();
}))
    .catch((err) => {
    console.error("Error during Data Source initialization:", err);
});
//# sourceMappingURL=app.js.map