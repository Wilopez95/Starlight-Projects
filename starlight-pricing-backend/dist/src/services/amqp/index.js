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
exports.setupMq = void 0;
const subscriptionOrders_1 = require("./subscriptionOrders");
const Amqp = require("amqp-ts");
const config_1 = require("../../config/config");
const subscriptions_1 = require("./subscriptions");
const queuesMap = {
    AMQP_PRICING_DEAD_LETTER: config_1.AMQP_PRICING_DEAD_LETTER,
    AMQP_CREATE_TENANTS_QUEUE: config_1.AMQP_CREATE_TENANTS_QUEUE,
    AMQP_DELETE_TENANTS_QUEUE: config_1.AMQP_DELETE_TENANTS_QUEUE,
    AMQP_UPDATE_COMPANY_QUEUE: config_1.AMQP_UPDATE_COMPANY_QUEUE,
    AMQP_QUEUE_UPDATE_SUBSCRIPTIONS_ORDERS_STATUS: config_1.AMQP_QUEUE_UPDATE_SUBSCRIPTIONS_ORDERS_STATUS
};
const exchangesMap = {
    AMQP_COMPANIES_EXCHANGE: config_1.AMQP_COMPANIES_EXCHANGE,
    AMQP_TENANTS_EXCHANGE: config_1.AMQP_TENANTS_EXCHANGE,
    AMQP_PRICING_DEAD_LETTER: config_1.AMQP_PRICING_DEAD_LETTER,
};
const fullList = Object.assign(Object.assign({}, queuesMap), exchangesMap);
const deadLetteredQueues = [
    config_1.AMQP_CREATE_TENANTS_QUEUE,
    config_1.AMQP_DELETE_TENANTS_QUEUE,
    config_1.AMQP_UPDATE_COMPANY_QUEUE,
];
const AMQP_URL = `amqp://${config_1.AMQP_USERNAME}:${config_1.AMQP_PASSWORD}@${config_1.AMQP_HOSTNAME}:${config_1.AMQP_PORT}`;
const setupMq = () => __awaiter(void 0, void 0, void 0, function* () {
    let connection;
    const url = AMQP_URL;
    if (config_1.AMQP_SKIP_SETUP === "true") {
        console.log("MQ: setup is skipped");
        return;
    }
    //Check all the var related to rabbit the env file
    const missedQueues = Object.entries(fullList).filter(([, value]) => value == null || value == "null" || value == "");
    if (missedQueues === null || missedQueues === void 0 ? void 0 : missedQueues.length) {
        const list = missedQueues.map(([value]) => value).join(", ");
        console.log(`Queues or exchanges: ${list} is missed in env vars`);
        return process.exit(1);
    }
    //Check all the var related to rabbit the env file
    try {
        connection = new Amqp.Connection(url);
    }
    catch (error) {
        console.log(`Failed to connect via amqp for URL, host: ${config_1.AMQP_HOSTNAME}`);
        throw error;
    }
    if (connection) {
        console.log(`MQ succesfull connected , host: ${config_1.AMQP_HOSTNAME}`);
        const exchange = connection.declareExchange(config_1.AMQP_TENANTS_EXCHANGE, "direct");
        const args = {
            deadLetterExchange: config_1.AMQP_PRICING_DEAD_LETTER,
            deadLetterRoutingKey: config_1.AMQP_CREATE_TENANTS_QUEUE,
        };
        const queue = connection.declareQueue(config_1.AMQP_CREATE_TENANTS_QUEUE, args);
        queue.bind(exchange, "create");
        queue.activateConsumer((message) => {
            try {
                (0, subscriptions_1.createTenantSub)(message.getContent());
                queue._channel.deleteQueue(config_1.AMQP_CREATE_TENANTS_QUEUE);
            }
            catch (error) {
                console.log(error);
            }
        });
        const queue2 = connection.declareQueue(config_1.AMQP_QUEUE_UPDATE_SUBSCRIPTIONS_ORDERS_STATUS, args);
        queue2.bind(exchange, "created");
        queue2.activateConsumer((message) => {
            try {
                (0, subscriptionOrders_1.updateSubscriptionOrderStatus)(message);
                queue2._channel.deleteQueue(config_1.AMQP_QUEUE_UPDATE_SUBSCRIPTIONS_ORDERS_STATUS);
            }
            catch (error) {
                console.log("####", error);
            }
        });
    }
});
exports.setupMq = setupMq;
//# sourceMappingURL=index.js.map