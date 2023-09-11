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
exports.generateDrafts = exports.generateOrdersDrafts = exports.generateSubscriptionsDrafts = exports.aggregateInvoicing = void 0;
const ordersToInvoice = require("../../services/billingProcessor/ordersToInvoiceProcesor");
const calcSubsInvoices = require("../../services/billingProcessor/calcSubsInvoicing");
const hauling_1 = require("../../services/hauling");
const math_1 = require("../../utils/math");
const sortByCb = (i1, i2) => i2.invoicesCount - i1.invoicesCount;
const sumTotalsCb = (totals, item) => {
    totals.generatedInvoices += item.invoicesCount;
    totals.invoicesTotal += (0, math_1.mathRound2)(item.invoicesTotal);
    return totals;
};
const getUniqueCustomers = ({ onAccountSubscriptions, prepaidSubscriptions, onAccountOrders, prepaidOrders }) => {
    const onAccountSubsCustomerIds = onAccountSubscriptions.map(({ id }) => id);
    const prepaidSubsCustomerIds = prepaidSubscriptions.map(({ id }) => id);
    const subscCustomerIds = onAccountSubsCustomerIds.concat(prepaidSubsCustomerIds);
    const orderCustomerIds = onAccountOrders.concat(prepaidOrders).map(({ id }) => id);
    const uniqueIds = [...new Set([...subscCustomerIds, ...orderCustomerIds])];
    const customersCount = uniqueIds.length;
    return customersCount;
};
const aggregateInvoicing = ({ customerSubscriptions, customersOrders }) => {
    const { onAccount: onAccountOrders, prepaid: prepaidOrders, processedOrders, generatedInvoices: generatedInvoicesOrders, invoicesTotal: invoicesTotalOrders, } = customersOrders;
    const { onAccount: onAccountSubscriptions, prepaid: prepaidSubscriptions, invoicesTotal: invoicesTotalSubscriptions, processedSubscriptions, generatedInvoices: generatedInvoicesSubscriptions, } = customerSubscriptions;
    const customersCount = getUniqueCustomers({
        onAccountSubscriptions,
        prepaidSubscriptions,
        onAccountOrders,
        prepaidOrders,
    });
    return {
        onAccount: {
            subscriptions: onAccountSubscriptions,
            orders: onAccountOrders,
        },
        prepaid: {
            subscriptions: prepaidSubscriptions,
            orders: prepaidOrders,
        },
        customersCount,
        subscriptionsCount: prepaidSubscriptions.length + onAccountSubscriptions.length,
        ordersCount: prepaidOrders.length + onAccountOrders.length,
        invoicesTotal: invoicesTotalSubscriptions + invoicesTotalOrders,
        processedTotal: processedSubscriptions + processedOrders,
        processedSubscriptions,
        processedOrders,
        generatedInvoices: generatedInvoicesSubscriptions + generatedInvoicesOrders,
    };
};
exports.aggregateInvoicing = aggregateInvoicing;
const generateSubscriptionsDrafts = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const condition = ctx.request.body;
    const listOfSubscriptionsToInvoice = yield ordersToInvoice.getSubscriptionsToInvoice(ctx);
    let customersIds = [];
    if (condition.customerId) {
        customersIds.push(condition.customerId);
    }
    else {
        customersIds = listOfSubscriptionsToInvoice.reduce((ids, item) => {
            if (!ids.includes(item.customerId)) {
                ids.push(item.customerId);
            }
            return ids;
        }, []);
    }
    const responseCustomers = yield (0, hauling_1.haulingGetCustomersByIds)(ctx, customersIds);
    const customersMap = new Map();
    responseCustomers.forEach((item) => customersMap.set(item.id, item));
    for (let i = 0; i < listOfSubscriptionsToInvoice.length; i++) {
        const subscription = listOfSubscriptionsToInvoice[i];
        const currentCustomer = customersMap.get(subscription.customerId);
        if (currentCustomer.subscriptions) {
            currentCustomer.subscriptions.push(subscription);
        }
        else {
            currentCustomer.subscriptions = [subscription];
        }
    }
    const customersList = Array.from(customersMap.values());
    const onAccountCustomers = customersList.filter((customer) => customer.onAccount);
    const prepaidCustomers = customersList.filter((customer) => !customer.onAccount);
    //ToDo:<remove the any & create an interface>
    //By:<wlopez95> || Date: 12/11/2022 || TicketRelated : PS-227
    const onAccount = calcSubsInvoices.proceedCustomers(onAccountCustomers);
    const prepaid = calcSubsInvoices.proceedCustomers(prepaidCustomers);
    const customersCount = ((_a = onAccount === null || onAccount === void 0 ? void 0 : onAccount.customerInvoicingInfo) === null || _a === void 0 ? void 0 : _a.length) + ((_b = prepaid === null || prepaid === void 0 ? void 0 : prepaid.customerInvoicingInfo) === null || _b === void 0 ? void 0 : _b.length);
    const customers = {
        onAccount: onAccount.customerInvoicingInfo,
        prepaid: prepaid.customerInvoicingInfo,
        customersCount,
        processedSubscriptions: onAccount.proceedSubscriptions + prepaid.proceedSubscriptions,
        invoicesTotal: onAccount.invoicesTotal + prepaid.invoicesTotal,
        generatedInvoices: onAccount.invoicesCount + prepaid.invoicesCount,
    };
    return customers;
});
exports.generateSubscriptionsDrafts = generateSubscriptionsDrafts;
const generateOrdersDrafts = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _c, _d;
    const condition = ctx.request.body;
    const listOfordersToInvoice = yield ordersToInvoice.getOrdersToInvoice(ctx);
    if (!listOfordersToInvoice.length) {
        return {
            onAccount: [],
            prepaid: [],
            processedOrders: 0,
            generatedInvoices: 0,
            customersCount: 0,
            invoicesTotal: 0,
        };
    }
    let customersIds = [];
    if (condition === null || condition === void 0 ? void 0 : condition.customerId) {
        customersIds.push(condition === null || condition === void 0 ? void 0 : condition.customerId);
    }
    else {
        customersIds = listOfordersToInvoice.reduce((ids, item) => {
            if (!ids.includes(item.originalCustomerId)) {
                ids.push(item.originalCustomerId);
            }
            return ids;
        }, []);
    }
    const responseCustomers = yield (0, hauling_1.haulingGetCustomersByIds)(ctx, customersIds);
    const customersMap = new Map();
    responseCustomers.forEach((item) => customersMap.set(item.id, item));
    const obj = { onAccount: {}, prepaid: {} };
    for (let i = 0; i < listOfordersToInvoice.length; i++) {
        const order = listOfordersToInvoice[i];
        const invoicesTotal = Number(order.grandTotal);
        const { jobSite: { id: jobSiteId }, } = order;
        const currentCustomer = customersMap.get(order.originalCustomerId);
        const { id, onAccount: onAccountPref, invoiceConstruction } = currentCustomer;
        const customerObj = onAccountPref ? obj.onAccount[id] : obj.prepaid[id];
        if (!customerObj) {
            obj[onAccountPref ? "onAccount" : "prepaid"][id] = Object.assign({ invoicesCount: 1, invoicesTotal, drafts: [
                    {
                        orders: [order],
                        invoicesTotal,
                        jobSiteId,
                    },
                ] }, currentCustomer);
        }
        else {
            switch (invoiceConstruction) {
                case "byCustomer": {
                    customerObj.drafts[0].orders.push(order);
                    customerObj.drafts[0].invoicesTotal += invoicesTotal;
                    customerObj.invoicesTotal += invoicesTotal;
                    break;
                }
                case "byOrder": {
                    customerObj.drafts.push({
                        orders: [order],
                        invoicesTotal,
                        jobSiteId,
                    });
                    customerObj.invoicesCount++;
                    customerObj.invoicesTotal += invoicesTotal;
                    break;
                }
                case "byAddress": {
                    const draft = customerObj.drafts.find((_draft) => jobSiteId === _draft.jobSiteId);
                    if (draft) {
                        draft.orders.push(order);
                        draft.jobSiteId = jobSiteId;
                        draft.invoicesTotal += invoicesTotal;
                    }
                    else {
                        customerObj.drafts.push({
                            orders: [order],
                            invoicesTotal,
                            jobSiteId,
                        });
                        customerObj.invoicesCount++;
                    }
                    customerObj.invoicesTotal += invoicesTotal;
                    break;
                }
                default: {
                    break;
                }
            }
        }
    }
    const { onAccount, prepaid } = obj;
    const customers = {
        onAccount: Object.values(onAccount).sort(sortByCb),
        prepaid: Object.values(prepaid).sort(sortByCb),
    };
    const onAccountCount = (_c = customers.onAccount) === null || _c === void 0 ? void 0 : _c.reduce(sumTotalsCb, {
        generatedInvoices: 0,
        invoicesTotal: 0,
    });
    const prepaidCount = (_d = customers.prepaid) === null || _d === void 0 ? void 0 : _d.reduce(sumTotalsCb, onAccountCount);
    Object.assign(customers, {
        processedOrders: listOfordersToInvoice.length,
        customersCount: customers.onAccount.length + customers.prepaid.length,
        generatedInvoices: prepaidCount.generatedInvoices,
        invoicesTotal: prepaidCount.invoicesTotal,
    });
    //ToDo:<Review overpaidOrders & overlimitOrders in services/billingProcessor.js line:501 (Hauling BE)>
    //By:<wlopez95> || Date: 26/10/2022 || TicketRelated : PS-227
    // const ordersIds: number[] = listOfordersToInvoice.reduce((ids, item) => {
    //   ids.push(item.id);
    //   return ids;
    // }, []);
    return customers;
});
exports.generateOrdersDrafts = generateOrdersDrafts;
const generateDrafts = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    const customerSubscriptions = yield (0, exports.generateSubscriptionsDrafts)(ctx);
    const customersOrders = yield (0, exports.generateOrdersDrafts)(ctx);
    return (0, exports.aggregateInvoicing)({ customerSubscriptions, customersOrders });
});
exports.generateDrafts = generateDrafts;
//# sourceMappingURL=billingProcessor.js.map