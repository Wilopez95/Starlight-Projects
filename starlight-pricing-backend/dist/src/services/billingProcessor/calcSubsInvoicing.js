"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.proceedCustomers = void 0;
const lodash_1 = require("lodash");
const math_1 = require("../../utils/math");
const proceedCustomers = (customers) => {
    const customerInvoicingInfo = [];
    let invoicesTotalCount = 0;
    let proceedSubscriptionsCount = 0;
    let invoicesCount = 0;
    for (const customer of customers) {
        const { subscriptions, invoiceConstruction } = customer, rest = __rest(customer, ["subscriptions", "invoiceConstruction"]);
        const { drafts, invoicesTotal, proceedSubscriptions } = processSubscriptions({
            subscriptions,
            invoiceConstruction,
        });
        invoicesTotalCount += invoicesTotal;
        proceedSubscriptionsCount += proceedSubscriptions;
        invoicesCount += drafts.length;
        customerInvoicingInfo.push(Object.assign(Object.assign({}, rest), { invoiceConstruction,
            drafts, invoicesCount: drafts.length, invoicesTotal,
            proceedSubscriptions }));
    }
    return {
        customerInvoicingInfo,
        invoicesTotal: invoicesTotalCount,
        proceedSubscriptions: proceedSubscriptionsCount,
        invoicesCount,
    };
};
exports.proceedCustomers = proceedCustomers;
const processServiceItems = (serviceItems) => {
    let summaryPerServiceItem = [];
    if (serviceItems.length) {
        for (let i = 0; i < serviceItems.length; i++) {
            const newServiceItem = {
                price: serviceItems[i].price,
                serviceItemId: serviceItems[i].id,
                serviceName: serviceItems[i].serviceName,
                serviceItemsApplicable: [],
                lineItemsProrationInfo: [],
            };
            summaryPerServiceItem.push(newServiceItem);
        }
    }
    return summaryPerServiceItem;
};
const processSubscriptions = ({ subscriptions = [], invoiceConstruction }) => {
    const subscriptionInvoicingInfo = {
        invoicesTotal: 0,
        proceedSubscriptions: subscriptions.length,
        drafts: [],
    };
    for (const subscription of (0, lodash_1.uniqBy)(subscriptions, "id")) {
        const { serviceItems, startDate, anniversaryBilling, endDate, billingCycle, billingType, id, nextBillingPeriodTo, nextBillingPeriodFrom, jobSiteId, jobSiteAddress, customerId, businessUnitId, businessLineId, status, customerOriginalId, } = subscription;
        const summaryPerServiceItem = processServiceItems(serviceItems);
        const totalPriceForSubscription = summaryPerServiceItem.reduce(
        // eslint-disable-next-line no-constant-binary-expression
        (accum, item) => { var _a; return (0, math_1.mathRound2)((_a = accum + item.price) !== null && _a !== void 0 ? _a : 0); }, 0);
        const subscriptionObj = {
            id,
            totalPriceForSubscription,
            nextBillingPeriodTo,
            nextBillingPeriodFrom,
            summaryPerServiceItem,
            anniversaryBilling,
            billingCycle,
            billingType,
            startDate,
            endDate,
            jobSiteAddress,
            customerId,
            businessUnitId,
            businessLineId,
            status,
            customerOriginalId,
        };
        subscriptionInvoicingInfo.invoicesTotal += totalPriceForSubscription;
        switch (invoiceConstruction) {
            case "byAddress": {
                const isExistSubscription = subscriptionInvoicingInfo.drafts.find((subscriptionInfo) => subscriptionInfo.jobSiteId === jobSiteId);
                if (isExistSubscription) {
                    isExistSubscription.subscriptions.push(subscriptionObj);
                }
                else {
                    subscriptionInvoicingInfo.drafts.push({
                        jobSiteId,
                        subscriptions: [subscriptionObj],
                    });
                }
                break;
            }
            case "byCustomer": {
                const [drafts] = subscriptionInvoicingInfo.drafts;
                if (drafts) {
                    drafts.subscriptions.push(subscriptionObj);
                }
                else {
                    subscriptionInvoicingInfo.drafts.push({
                        jobSiteId,
                        subscriptions: [subscriptionObj],
                    });
                }
                break;
            }
            case "byOrder": {
                subscriptionInvoicingInfo.drafts.push({
                    jobSiteId,
                    subscriptions: [subscriptionObj],
                });
                break;
            }
            default: {
                break;
            }
        }
    }
    return subscriptionInvoicingInfo;
};
//# sourceMappingURL=calcSubsInvoicing.js.map