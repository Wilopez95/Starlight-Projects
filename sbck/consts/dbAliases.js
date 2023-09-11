// import Invoice from '../models/invoice.js';
import Customer from '../models/customer.js';
import CreditCard from '../models/creditCard.js';
import Order from '../models/order.js';
import InvoiceEmail from '../models/invoiceEmail.js';
import FinanceChargeEmail from '../models/financeChargeEmail.js';
import BusinessLine from '../models/businessLine.js';
import Subscription from '../models/subscription.js';

export const dbAliases = {
  [Customer.tableName]: 'c',
  [CreditCard.tableName]: 'cc',
  [Order.tableName]: 'o',
  invoices: 'i',
  [InvoiceEmail.tableName]: 'ie',
  [FinanceChargeEmail.tableName]: 'fe',
  [BusinessLine.tableName]: 'lob',
  [Subscription.tableName]: 'sub',
};
