import { LobbyStore } from '@root/auth/stores/lobby/LobbyStore';
import { BusinessLineStore } from '@root/core/stores/businessLine/BusinessLineStore';
import { BusinessUnitStore } from '@root/core/stores/businessUnit/BusinessUnitStore';
import { I18nStore } from '@root/core/stores/i18n/I18nStore';
import { ContactStore } from '@root/customer/stores/contact/ContactStore';
import { CustomerStore } from '@root/customer/stores/customer/CustomerStore';
import { CreditCardStore } from '@root/finance/stores/creditCard/CreditCardStore';
import { ExagoStore } from '@root/finance/stores/exago/ExagoStore';
import { InvoiceStore } from '@root/finance/stores/invoice/InvoiceStore';
import { PaymentStore } from '@root/finance/stores/payment/PaymentStore';
import { ReportStore } from '@root/finance/stores/report/ReportStore';
import { StatementStore } from '@root/finance/stores/statement/StatementStore';
import { OrderStore } from '@root/orders-and-subscriptions/stores/order/OrderStore';
import { SubscriptionStore } from '@root/orders-and-subscriptions/stores/subscription/SubscriptionStore';
import { SubscriptionDraftStore } from '@root/orders-and-subscriptions/stores/subscriptionDraft/SubscriptionDraftStore';

class GlobalStore {
  // BaseStore used for storing domain entities
  i18nStore = new I18nStore();
  exagoStore = new ExagoStore();

  // BaseStore used for storing domain entities
  lobbyStore = new LobbyStore();
  orderStore = new OrderStore(this);
  contactStore = new ContactStore(this);
  creditCardStore = new CreditCardStore(this);
  customerStore = new CustomerStore(this);
  businessUnitStore = new BusinessUnitStore(this);
  businessLineStore = new BusinessLineStore(this);
  subscriptionStore = new SubscriptionStore(this);
  subscriptionDraftStore = new SubscriptionDraftStore(this);
  statementStore = new StatementStore(this);
  invoiceStore = new InvoiceStore(this);
  paymentStore = new PaymentStore(this);
  reportStore = new ReportStore(this);
}

export default GlobalStore;
