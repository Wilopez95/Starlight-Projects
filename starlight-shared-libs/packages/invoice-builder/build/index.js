'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var React = require('react');
var dateFns = require('date-fns');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var React__default = /*#__PURE__*/_interopDefaultLegacy(React);

const formatShortAddress = (address) => {
    const address2 = address.addressLine2 ? `, ${address.addressLine2}` : '';
    return `${address.addressLine1}${address2}`;
};
const formatAddress = (address) => `${formatShortAddress(address)}, ${address.city}, ${address.state}, ${address.zip}`;
const addressExists = (address) => Object.keys(address).some(key => address[key]);

const defaultConfig = {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
};
const formatter = new Intl.NumberFormat('en-US', defaultConfig);
const formatMoney = (value = 0, fraction = 0) => {
    if (fraction !== 0) {
        return new Intl.NumberFormat('en-US', {
            ...defaultConfig,
            minimumFractionDigits: fraction,
        }).format(value);
    }
    return formatter.format(value);
};

const getCreditCardBrand = (cardType) => {
    switch (cardType) {
        case 'AMEX':
            return 'American Express';
        case 'BML':
            return 'Bill Me Later';
        case 'DNR':
            return 'Diners';
        case 'DSCV':
            return 'Discover';
        case 'JCB':
            return 'Japan Credit Bureau';
        case 'MC':
            return 'MasterCard';
        case 'RM':
            return 'Revolution Money';
        case 'TEL':
            return 'Telecheck';
        case 'UNKN':
            return 'Unknown';
        case 'VISA':
            return 'Visa';
        case 'VYGR':
            return 'Voyager';
        case 'WEX':
            return 'Wright Express';
        default:
            return cardType;
    }
};

var styles = {"divider":"styles_divider__2X7pQ","heading":"styles_heading__17r3L","spaceBottom":"styles_spaceBottom__HK6iQ","wrapper":"styles_wrapper__doN-s","preview":"styles_preview__SLUS4","row":"styles_row___rfGi","header":"styles_header__ucTJd","logo":"styles_logo__Yk0-A","generalInformation":"styles_generalInformation__1iM3E","table":"styles_table__3VGmS","textRight":"styles_textRight__1kuXN","summary":"styles_summary__3stoU","label":"styles_label__DqcDc","total":"styles_total__3XMmf"};

/* eslint-disable default-case */
const calculateDueDate$1 = (terms) => {
    const date = new Date();
    switch (terms) {
        case 'cod':
            return date;
        case 'net15Days':
            return dateFns.addDays(date, 15);
        case 'net30Days':
            return dateFns.addDays(date, 30);
        case 'net60Days':
            return dateFns.addDays(date, 60);
    }
};
const getPaymentTermsDisplayString$1 = (terms) => {
    switch (terms) {
        case 'cod':
            return 'COD';
        case 'net15Days':
            return 'Net 15';
        case 'net30Days':
            return 'Net 30';
        case 'net60Days':
            return 'Net 60';
    }
};

var localStyles$1 = {"invoiceInformation":"styles_invoiceInformation__2NmhE","label":"styles_label__2xvBm"};

const dateFormat$3 = 'dd MMM, yyyy';
const InvoiceBuilder = ({ logoUrl, physicalAddress, customer, orders, invoiceNumber, payments, preview = false, }) => {
    const taxesTotal = orders.reduce((acc, order) => acc + (order.grandTotal - order.beforeTaxesTotal - order.surchargesTotal), 0);
    const surchargesTotal = orders.reduce((acc, order) => acc + order.surchargesTotal, 0);
    const invoiceTotal = orders.reduce((acc, order) => acc + order.beforeTaxesTotal, 0);
    const previewClassName = `${preview ? styles.preview : ''}`;
    return (React__default["default"].createElement("div", { className: `${styles.wrapper} ${previewClassName}` },
        React__default["default"].createElement("div", { className: styles.header },
            logoUrl ? (React__default["default"].createElement("img", { src: logoUrl, alt: "logo", className: `${styles.logo} ${previewClassName}` })) : null,
            physicalAddress && addressExists(physicalAddress) ? formatAddress(physicalAddress) : null),
        React__default["default"].createElement("div", { className: styles.generalInformation },
            React__default["default"].createElement("div", null,
                React__default["default"].createElement("div", { className: styles.heading }, "Bill to"),
                formatAddress(customer.billingAddress)),
            customer.invoiceConstruction !== 'byCustomer' && orders[0] ? (React__default["default"].createElement("div", null,
                React__default["default"].createElement("div", { className: styles.heading }, "Job Site"),
                formatAddress(orders[0].jobSite))) : null,
            React__default["default"].createElement("div", { className: localStyles$1.invoiceInformation },
                invoiceNumber ? (React__default["default"].createElement(React__default["default"].Fragment, null,
                    React__default["default"].createElement("div", { className: localStyles$1.label }, "Invoice #"),
                    React__default["default"].createElement("div", null, invoiceNumber))) : null,
                React__default["default"].createElement("div", { className: localStyles$1.label }, "Invoice Date"),
                React__default["default"].createElement("div", null, dateFns.format(new Date(), dateFormat$3)),
                React__default["default"].createElement("div", { className: localStyles$1.label }, "Due Date"),
                React__default["default"].createElement("div", null, dateFns.format(customer.paymentTerms ? calculateDueDate$1(customer.paymentTerms) : new Date(), dateFormat$3)),
                customer.paymentTerms ? (React__default["default"].createElement(React__default["default"].Fragment, null,
                    React__default["default"].createElement("div", { className: localStyles$1.label }, "Payment Terms"),
                    React__default["default"].createElement("div", null, getPaymentTermsDisplayString$1(customer.paymentTerms)))) : null)),
        React__default["default"].createElement("table", { className: styles.table },
            React__default["default"].createElement("thead", null,
                React__default["default"].createElement("tr", null,
                    React__default["default"].createElement("th", null, "Order#"),
                    React__default["default"].createElement("th", null, "PO#"),
                    React__default["default"].createElement("th", null, "WO#"),
                    React__default["default"].createElement("th", null, "Date#"),
                    React__default["default"].createElement("th", null, "Service"),
                    React__default["default"].createElement("th", null, "Ticket"),
                    React__default["default"].createElement("th", null, "Rate"),
                    React__default["default"].createElement("th", null, "Qty"),
                    React__default["default"].createElement("th", null, "Amount"),
                    React__default["default"].createElement("th", { className: styles.textRight }, "Total"))),
            React__default["default"].createElement("tbody", null, orders.map(order => (React__default["default"].createElement(React__default["default"].Fragment, { key: order.id },
                order.services.map((service, index) => index === 0 ? (React__default["default"].createElement("tr", { key: index },
                    React__default["default"].createElement("td", null, order.id),
                    React__default["default"].createElement("td", null, order.poNumber),
                    React__default["default"].createElement("td", null, order.woNumber),
                    React__default["default"].createElement("td", null, dateFns.format(order.serviceDate, dateFormat$3)),
                    React__default["default"].createElement("td", null, service.description),
                    React__default["default"].createElement("td", null, order.ticket),
                    React__default["default"].createElement("td", null, service.price.toFixed(2)),
                    React__default["default"].createElement("td", null, service.quantity),
                    React__default["default"].createElement("td", null, (service.price * service.quantity).toFixed(2)),
                    React__default["default"].createElement("td", { className: styles.textRight }, order.beforeTaxesTotal.toFixed(2)))) : (React__default["default"].createElement("tr", { key: index },
                    React__default["default"].createElement("td", null),
                    React__default["default"].createElement("td", null),
                    React__default["default"].createElement("td", null),
                    React__default["default"].createElement("td", null, service.description),
                    React__default["default"].createElement("td", null),
                    React__default["default"].createElement("td", null, service.price.toFixed(2)),
                    React__default["default"].createElement("td", null, service.quantity),
                    React__default["default"].createElement("td", null, (service.price * service.quantity).toFixed(2)),
                    React__default["default"].createElement("td", null)))),
                order.surchargesTotal > 0 ? (React__default["default"].createElement("tr", { className: styles.divider },
                    React__default["default"].createElement("td", null),
                    React__default["default"].createElement("td", null),
                    React__default["default"].createElement("td", null),
                    React__default["default"].createElement("td", null, "Surcharges"),
                    React__default["default"].createElement("td", null),
                    React__default["default"].createElement("td", null),
                    React__default["default"].createElement("td", null),
                    React__default["default"].createElement("td", null, order.surchargesTotal.toFixed(2)),
                    React__default["default"].createElement("td", null))) : null,
                order.grandTotal !== order.beforeTaxesTotal + order.surchargesTotal ? (React__default["default"].createElement("tr", { className: styles.divider },
                    React__default["default"].createElement("td", null),
                    React__default["default"].createElement("td", null),
                    React__default["default"].createElement("td", null),
                    React__default["default"].createElement("td", null, "Taxes"),
                    React__default["default"].createElement("td", null),
                    React__default["default"].createElement("td", null),
                    React__default["default"].createElement("td", null),
                    React__default["default"].createElement("td", null, (order.grandTotal - order.surchargesTotal - order.beforeTaxesTotal).toFixed(2)),
                    React__default["default"].createElement("td", null))) : null))))),
        React__default["default"].createElement("div", { className: styles.summary },
            React__default["default"].createElement("div", { className: styles.label }, "Surcharges"),
            React__default["default"].createElement("div", null, formatMoney(surchargesTotal)),
            React__default["default"].createElement("div", { className: styles.label }, "Taxes"),
            React__default["default"].createElement("div", null, formatMoney(taxesTotal)),
            React__default["default"].createElement("div", { className: styles.label }, "Invoice Total"),
            React__default["default"].createElement("div", null, formatMoney(invoiceTotal)),
            React__default["default"].createElement("div", { className: styles.label }, "Payments"),
            React__default["default"].createElement("div", null, formatMoney(payments)),
            React__default["default"].createElement("div", { className: styles.divider }),
            React__default["default"].createElement("div", { className: `${styles.label} ${styles.total} ${previewClassName}` }, "Balance"),
            React__default["default"].createElement("div", { className: `${styles.total} ${previewClassName}` }, formatMoney(invoiceTotal + surchargesTotal + taxesTotal - payments)))));
};

var receiptStyles = {"tableHeader":"styles_tableHeader__19C2k","tableDivider":"styles_tableDivider__3Nio1","total":"styles_total__r7B0h"};

const dateFormat$2 = 'dd MMM, yyyy';
const ReceiptBuilder = ({ logoUrl, physicalAddress, customer, order, payment, preview = false, }) => {
    const previewClassName = `${preview ? styles.preview : ''}`;
    let paymentIdentifier;
    if (payment.paymentMethod === 'creditCard') {
        paymentIdentifier = `${getCreditCardBrand(payment.cardType)}•••• ${payment.paymentIdentifier.slice(payment.paymentIdentifier.length - 4)}`;
    }
    else if (payment.paymentMethod === 'check') {
        paymentIdentifier = `Check# ${payment.paymentIdentifier}`;
    }
    else {
        paymentIdentifier = 'Cash';
    }
    return (React__default["default"].createElement("div", { className: `${styles.wrapper} ${previewClassName}` },
        React__default["default"].createElement("div", { className: styles.header },
            logoUrl ? (React__default["default"].createElement("img", { src: logoUrl, alt: "logo", className: `${styles.logo} ${previewClassName}` })) : null,
            physicalAddress && addressExists(physicalAddress) ? formatAddress(physicalAddress) : null),
        React__default["default"].createElement("div", { className: styles.generalInformation },
            React__default["default"].createElement("div", null,
                React__default["default"].createElement("div", { className: styles.heading }, "Receipt For"),
                customer.name),
            customer.invoiceConstruction !== 'byCustomer' && order ? (React__default["default"].createElement("div", null,
                React__default["default"].createElement("div", { className: styles.heading }, "Job Site"),
                formatAddress(order.jobSite))) : null),
        React__default["default"].createElement("div", { className: receiptStyles.tableHeader }, "Order Information"),
        React__default["default"].createElement("table", { className: styles.table },
            React__default["default"].createElement("thead", null,
                React__default["default"].createElement("tr", null,
                    React__default["default"].createElement("th", null, "Order#"),
                    React__default["default"].createElement("th", null, "Date"),
                    React__default["default"].createElement("th", null, "Service"),
                    React__default["default"].createElement("th", null, "Rate"),
                    React__default["default"].createElement("th", null, "Qty"),
                    React__default["default"].createElement("th", null, "Amount"),
                    React__default["default"].createElement("th", { className: styles.textRight }, "Total"))),
            React__default["default"].createElement("tbody", null,
                order.services.map((service, index) => index === 0 ? (React__default["default"].createElement("tr", { key: index },
                    React__default["default"].createElement("td", null, order.id),
                    React__default["default"].createElement("td", null, dateFns.format(order.serviceDate, dateFormat$2)),
                    React__default["default"].createElement("td", null, service.description),
                    React__default["default"].createElement("td", null, service.price.toFixed(2)),
                    React__default["default"].createElement("td", null, service.quantity),
                    React__default["default"].createElement("td", null, (service.price * service.quantity).toFixed(2)),
                    React__default["default"].createElement("td", { className: styles.textRight }, order.beforeTaxesTotal.toFixed(2)))) : (React__default["default"].createElement("tr", { key: index },
                    React__default["default"].createElement("td", null),
                    React__default["default"].createElement("td", null),
                    React__default["default"].createElement("td", null, service.description),
                    React__default["default"].createElement("td", null, service.price.toFixed(2)),
                    React__default["default"].createElement("td", null, service.quantity),
                    React__default["default"].createElement("td", null, (service.price * service.quantity).toFixed(2)),
                    React__default["default"].createElement("td", null)))),
                order.surchargesTotal != null && order.surchargesTotal !== 0 ? (React__default["default"].createElement("tr", null,
                    React__default["default"].createElement("td", null),
                    React__default["default"].createElement("td", null),
                    React__default["default"].createElement("td", null, "Surcharges"),
                    React__default["default"].createElement("td", null),
                    React__default["default"].createElement("td", null),
                    React__default["default"].createElement("td", null, order.surchargesTotal.toFixed(2)),
                    React__default["default"].createElement("td", null))) : null,
                order.grandTotal !== order.beforeTaxesTotal ? (React__default["default"].createElement("tr", null,
                    React__default["default"].createElement("td", null),
                    React__default["default"].createElement("td", null),
                    React__default["default"].createElement("td", null, "Taxes"),
                    React__default["default"].createElement("td", null),
                    React__default["default"].createElement("td", null),
                    React__default["default"].createElement("td", null, (order.grandTotal -
                        order.beforeTaxesTotal -
                        (Number(order.surchargesTotal) || 0)).toFixed(2)),
                    React__default["default"].createElement("td", null))) : null)),
        React__default["default"].createElement("div", { className: receiptStyles.tableDivider }),
        React__default["default"].createElement("div", { className: receiptStyles.total }, order.grandTotal),
        React__default["default"].createElement("div", { className: receiptStyles.tableHeader }, "Order Payment"),
        React__default["default"].createElement("table", { className: styles.table },
            React__default["default"].createElement("thead", null,
                React__default["default"].createElement("tr", null,
                    React__default["default"].createElement("th", null, "Payment"),
                    React__default["default"].createElement("th", null, "Date"),
                    React__default["default"].createElement("th", null, "Transaction #"),
                    React__default["default"].createElement("th", { className: styles.textRight }, "Paid Amount,$"))),
            React__default["default"].createElement("tbody", null,
                React__default["default"].createElement("tr", null,
                    React__default["default"].createElement("td", null, paymentIdentifier),
                    React__default["default"].createElement("td", null, dateFns.format(payment.date, dateFormat$2)),
                    React__default["default"].createElement("td", null, payment.paymentMethod === 'creditCard' ? payment.paymentRetRef : null),
                    React__default["default"].createElement("td", { className: styles.textRight }, formatMoney(payment.amount, 2))))),
        React__default["default"].createElement("div", { className: receiptStyles.tableDivider }),
        React__default["default"].createElement("div", { className: receiptStyles.total }, formatMoney(payment.amount, 2))));
};

const dateFormat$1 = 'dd MMM, yyyy';
const fallback = '-';
const SettlementBuilder = ({ transactions, settlementDate }) => {
    return (React__default["default"].createElement("div", { className: styles.wrapper },
        React__default["default"].createElement("h1", null, "\u0421redit Card Settlements"),
        React__default["default"].createElement("div", { className: styles.spaceBottom },
            dateFns.format(settlementDate, dateFormat$1),
            " / ",
            transactions.length,
            " Transactions"),
        React__default["default"].createElement("table", { className: styles.table },
            React__default["default"].createElement("thead", null,
                React__default["default"].createElement("tr", null,
                    React__default["default"].createElement("th", null, "Customer"),
                    React__default["default"].createElement("th", null, "Transaction Note"),
                    React__default["default"].createElement("th", { className: styles.textRight }, "Amount,$"),
                    React__default["default"].createElement("th", { className: styles.textRight }, "Fee,$"),
                    React__default["default"].createElement("th", { className: styles.textRight }, "Adjustment,$"),
                    React__default["default"].createElement("th", { className: styles.textRight }, "Net,$"))),
            React__default["default"].createElement("tbody", null, transactions.map((transaction, index) => {
                var _a, _b;
                return (React__default["default"].createElement("tr", { key: index, className: styles.divider },
                    React__default["default"].createElement("td", null, (_a = transaction.customerName) !== null && _a !== void 0 ? _a : fallback),
                    React__default["default"].createElement("td", null, (_b = transaction.transactionNote) !== null && _b !== void 0 ? _b : fallback),
                    React__default["default"].createElement("td", { className: styles.textRight }, formatMoney(transaction.amount)),
                    React__default["default"].createElement("td", { className: styles.textRight }, formatMoney(transaction.adjustment)),
                    React__default["default"].createElement("td", { className: styles.textRight }, formatMoney(transaction.fee)),
                    React__default["default"].createElement("td", { className: styles.textRight }, formatMoney(transaction.amount - transaction.fee - transaction.adjustment))));
            })))));
};

const calculateDueDate = (terms) => {
    const date = new Date();
    switch (terms) {
        case 'cod':
            return date;
        case 'net15Days':
            return dateFns.addDays(date, 15);
        case 'net30Days':
            return dateFns.addDays(date, 30);
        case 'net60Days':
            return dateFns.addDays(date, 60);
    }
};
const getPaymentTermsDisplayString = (terms) => {
    switch (terms) {
        case 'cod':
            return 'COD';
        case 'net15Days':
            return 'Net 15';
        case 'net30Days':
            return 'Net 30';
        case 'net60Days':
            return 'Net 60';
    }
};

var localStyles = {"invoiceInformation":"styles_invoiceInformation__2uDSi","label":"styles_label__2P_0w","subsField":"styles_subsField__zLzAq","dateField":"styles_dateField__2yN7W","quantityField":"styles_quantityField__2EnD1","title":"styles_title__1TWIY","subtitle":"styles_subtitle__2PrMf"};

const dateFormat = 'dd MMM, yyyy';
const SubscriptionInvoiceBuilder = ({ payments, logoUrl, physicalAddress, customer, subscriptions, preview = false, }) => {
    const [totalAmount, setTotalAmount] = React.useState(0);
    const [totalInvoice, setTotalInvoice] = React.useState(0);
    const [totalTaxes] = React.useState(0);
    const [totalSurcharges] = React.useState(0);
    React.useEffect(() => {
        if (subscriptions === null || subscriptions === void 0 ? void 0 : subscriptions.length) {
            const total = subscriptions
                .map((obj) => obj.totalPriceForSubscription)
                .reduce((acc, curr) => acc + curr);
            setTotalInvoice(total);
        }
    }, [subscriptions]);
    React.useEffect(() => {
        setTotalAmount(totalInvoice + totalTaxes + totalSurcharges);
    }, [totalInvoice, totalTaxes, totalSurcharges]);
    const previewClassName = `${preview ? styles.preview : ''}`;
    return (React__default["default"].createElement("div", { className: `${styles.wrapper} ${previewClassName}` },
        React__default["default"].createElement("div", { className: styles.header },
            logoUrl ? React__default["default"].createElement("img", { src: logoUrl, alt: "logo", className: `${styles.logo} ${previewClassName}` }) : null,
            physicalAddress && addressExists(physicalAddress) ? formatAddress(physicalAddress) : null),
        React__default["default"].createElement("div", { className: styles.generalInformation },
            React__default["default"].createElement("div", null,
                React__default["default"].createElement("div", { className: styles.heading }, "Bill to"),
                formatAddress(customer.billingAddress)),
            customer.invoiceConstruction !== 'byCustomer' ? React__default["default"].createElement("div", null,
                React__default["default"].createElement("div", { className: styles.heading }, "Job Site"),
                physicalAddress && addressExists(physicalAddress) ? formatAddress(physicalAddress) : null) : null,
            React__default["default"].createElement("div", { className: localStyles.invoiceInformation },
                React__default["default"].createElement("div", { className: localStyles.label }, "Invoice Date"),
                React__default["default"].createElement("div", null, dateFns.format(new Date(), dateFormat)),
                React__default["default"].createElement("div", { className: localStyles.label }, "Due Date"),
                React__default["default"].createElement("div", null, dateFns.format(customer.paymentTerms ? calculateDueDate(customer.paymentTerms) : new Date(), dateFormat)),
                customer.paymentTerms ? React__default["default"].createElement(React__default["default"].Fragment, null,
                    React__default["default"].createElement("div", { className: localStyles.label }, "Payment Terms"),
                    React__default["default"].createElement("div", null, getPaymentTermsDisplayString(customer.paymentTerms))) : null)),
        React__default["default"].createElement("table", { className: styles.table },
            React__default["default"].createElement("thead", null,
                React__default["default"].createElement("tr", null,
                    React__default["default"].createElement("th", { className: localStyles.subsField }, "Subscription#"),
                    React__default["default"].createElement("th", { className: localStyles.dateField }, "Date / Billing Period"),
                    React__default["default"].createElement("th", null, "Billable Item"),
                    React__default["default"].createElement("th", null, "Rate"),
                    React__default["default"].createElement("th", { className: localStyles.quantityField }, "Qty"),
                    React__default["default"].createElement("th", { className: styles.textRight }, "Amount"))),
            React__default["default"].createElement("tbody", null, subscriptions === null || subscriptions === void 0 ? void 0 : subscriptions.map((subscription, index) => (React__default["default"].createElement(React__default["default"].Fragment, { key: subscription.id },
                React__default["default"].createElement("tr", { key: index },
                    React__default["default"].createElement("td", { className: localStyles.title }, `Subscription #${subscription.id}`),
                    React__default["default"].createElement("td", null, `${dateFns.format(subscription.nextBillingPeriodFrom, dateFormat)}-${dateFns.format(subscription.nextBillingPeriodTo, dateFormat)}`),
                    React__default["default"].createElement("td", null, subscription.serviceItems[0].billableService.description),
                    React__default["default"].createElement("td", null, formatMoney(subscription.serviceItems[0].price)),
                    React__default["default"].createElement("td", { className: localStyles.quantityField }, subscription.serviceItems[0].quantity),
                    React__default["default"].createElement("td", { className: styles.textRight }, formatMoney(subscription.totalPriceForSubscription))),
                subscription.serviceItems[0].lineItems.length ? (React__default["default"].createElement(React__default["default"].Fragment, null,
                    React__default["default"].createElement("tr", null,
                        React__default["default"].createElement("td", { className: localStyles.subtitle }, "Line Items")),
                    subscription.serviceItems[0].lineItems.map((lineItem, index2) => (React__default["default"].createElement("tr", { key: index2 },
                        React__default["default"].createElement("td", null),
                        React__default["default"].createElement("td", null, `${dateFns.format(subscription.nextBillingPeriodFrom, dateFormat)}-${dateFns.format(subscription.nextBillingPeriodTo, dateFormat)}`),
                        React__default["default"].createElement("td", null),
                        React__default["default"].createElement("td", null, formatMoney(lineItem.price)),
                        React__default["default"].createElement("td", { className: localStyles.quantityField }, lineItem.quantity),
                        React__default["default"].createElement("td", { className: styles.textRight }, formatMoney(lineItem.quantity * lineItem.price))))))) : null,
                subscription.serviceItems[0].subscriptionOrders.length ? (React__default["default"].createElement(React__default["default"].Fragment, null,
                    React__default["default"].createElement("tr", null,
                        React__default["default"].createElement("td", { className: localStyles.subtitle }, " Subscriptions Orders")),
                    subscription.serviceItems[0].subscriptionOrders.map((subsOrder, index3) => (React__default["default"].createElement("tr", { key: index3 },
                        React__default["default"].createElement("td", { className: localStyles.subsField }, `Subscription Order #${subsOrder.sequenceId}`)))))) : null))))),
        React__default["default"].createElement("div", { className: styles.summary },
            React__default["default"].createElement("div", { className: styles.label }, "Surcharges"),
            React__default["default"].createElement("div", null, formatMoney(totalSurcharges)),
            React__default["default"].createElement("div", { className: styles.label }, "Taxes"),
            React__default["default"].createElement("div", null, formatMoney(totalTaxes)),
            React__default["default"].createElement("div", { className: styles.label }, "Invoice Total"),
            React__default["default"].createElement("div", null, formatMoney(totalInvoice)),
            React__default["default"].createElement("div", { className: styles.label }, "Payments"),
            React__default["default"].createElement("div", null, formatMoney(payments)),
            React__default["default"].createElement("div", { className: styles.divider }),
            React__default["default"].createElement("div", { className: `${styles.label} ${styles.total} ${previewClassName}` }, "Balance"),
            React__default["default"].createElement("div", { className: `${styles.total} ${previewClassName}` }, formatMoney(totalAmount)))));
};

exports.InvoiceBuilder = InvoiceBuilder;
exports.ReceiptBuilder = ReceiptBuilder;
exports.SettlementBuilder = SettlementBuilder;
exports.SubscriptionInvoiceBuilder = SubscriptionInvoiceBuilder;
