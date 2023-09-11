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
// import client, { Connection } from "amqplib";
const Amqp = require("amqp-ts");
const config_1 = require("../../config/config");
const AMQP_URL = `amqp://${config_1.AMQP_USERNAME}:${config_1.AMQP_PASSWORD}@${config_1.AMQP_HOSTNAME}:${config_1.AMQP_PORT}`;
// Decision to use default exchange since future queues auto-bind to it with the same route key
// const DEFAULT_EXCHANGE = '';
class Client {
    constructor() {
        this.url = AMQP_URL;
        this.connection = null;
        this.channel = null;
    }
    static getInstance() {
        return new this();
    }
    assertQueue(queue, { singleConsumer } = {}, options = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            Object.assign(options, { durable: true, exclusive: false });
            if (singleConsumer) {
                options.arguments = {
                    "x-single-active-consumer": true,
                };
            }
            yield this.channel.assertQueue(queue, options).catch((error) => {
                console.log(`Failed to assert a queue: ${queue}`);
                throw error;
            });
        });
    }
    deleteQueue(queue) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.channel.deleteQueue(queue);
            }
            catch (error) {
                console.log(`Failed to delete a queue: ${queue}`);
                throw error;
            }
        });
    }
    deleteExchange(exchange) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.channel.deleteExchange(exchange);
            }
            catch (error) {
                console.log(`Failed to delete a queue: ${exchange}`);
                throw error;
            }
        });
    }
    connect(prefetchLimit) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.connection) {
                try {
                    this.connection = new Amqp.Connection(this.url);
                }
                catch (error) {
                    console.log(`Failed to connect via amqp for URL, host: ${config_1.AMQP_HOSTNAME}`);
                    throw error;
                }
                this.connection.once("close", this.disconnect.bind(this, true));
                this.connection.once("error", this.disconnect.bind(this));
            }
            if (!this.channel) {
                try {
                    this.channel = yield this.connection.createChannel();
                }
                catch (error) {
                    console.log(`Failed to create a channel for the established connection`);
                    throw error;
                }
                this.channel.once("close", this.dropChannel.bind(this, true));
                this.channel.once("error", this.dropChannel.bind(this));
            }
            if (prefetchLimit) {
                yield this.channel.prefetch(prefetchLimit);
            }
        });
    }
    disconnect(closed) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            if (this.connection) {
                if (!closed) {
                    try {
                        yield this.connection.close();
                    }
                    catch (error) {
                        console.log(error);
                    }
                }
                // eslint-disable-next-line no-unused-expressions
                (_a = this.connection) === null || _a === void 0 ? void 0 : _a.removeAllListeners();
            }
            this.connection = null;
            yield this.dropChannel(closed);
        });
    }
    dropChannel(closed) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            if (this.channel) {
                if (!closed) {
                    try {
                        yield this.channel.close();
                    }
                    catch (error) {
                        console.log(error);
                    }
                }
                // eslint-disable-next-line no-unused-expressions
                (_a = this.channel) === null || _a === void 0 ? void 0 : _a.removeAllListeners();
            }
            this.channel = null;
        });
    }
    toBuffer(data) {
        return Buffer.from(JSON.stringify(data), "utf-8");
    }
}
exports.default = Client;
//# sourceMappingURL=client.js.map