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
const client_1 = require("./client");
const defaultCallback = (data) => console.log(`[cb was missed]: Received message: ${JSON.stringify(data)}`);
class Receiver extends client_1.default {
    constructor() {
        super();
    }
    static getInstance() {
        return new this();
    }
    receive(queueName, callback = defaultCallback, deadLetterExchange) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.connect(1);
            try {
                yield new Promise((resolve, reject) => {
                    const { channel, connection } = this;
                    channel.once("error", reject);
                    connection.once("error", reject);
                    channel.once("close", resolve);
                    connection.once("close", resolve);
                    channel.consume(queueName, (message) => __awaiter(this, void 0, void 0, function* () {
                        var _a;
                        const msgBody = (_a = message === null || message === void 0 ? void 0 : message.content) === null || _a === void 0 ? void 0 : _a.toString();
                        if (msgBody) {
                            let data;
                            try {
                                data = JSON.parse(msgBody);
                            }
                            catch (error) {
                                console.log(error, `Received message: ${msgBody}. Parsing is failed`);
                                channel.ack(message);
                            }
                            if (data) {
                                try {
                                    yield callback(data);
                                }
                                catch (error) {
                                    console.log(error, `Received message: ${JSON.stringify(data)}. Processing by the specified callback is failed`);
                                    if (deadLetterExchange) {
                                        // eslint-disable-next-line max-depth
                                        if (deadLetterExchange === message.fields.exchange) {
                                            console.log(`Failed to process dead letter
                                            message ${msgBody} on ${queueName}. Rejecting...`);
                                            return channel.ack(message);
                                        }
                                        else if (!message.fields.redelivered) {
                                            console.log(`Requeuing ${msgBody} on ${queueName}`);
                                            return channel.nack(message, false, true);
                                        }
                                        else {
                                            console.log(`Putting ${msgBody} on ${queueName}
                                            to dead letter (if setuped)`);
                                            return channel.nack(message, false, false);
                                        }
                                    }
                                }
                            }
                        }
                        else {
                            console.log(`Certain message has no
                                content, message: ${message}, queue: ${queueName}`);
                        }
                        channel.ack(message);
                    }), { noAck: false });
                });
            }
            catch (error) {
                console.log(`Failed to consume messages from queue: ${queueName}`);
                console.log(error);
                throw error;
            }
            finally {
                yield this.disconnect();
            }
        });
    }
    subscribe(queueName, callback, deadLetterExchange) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.receive(queueName, callback, deadLetterExchange);
        });
    }
}
exports.default = Receiver;
//# sourceMappingURL=receiver.js.map