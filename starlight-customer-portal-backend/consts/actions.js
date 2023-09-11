const portal = 'customer-portal';

const view = 'view';
const list = 'list';
const create = 'create';
const update = 'update';
const del = 'delete';
const perform = 'perform';

const profile = 'profile';
const cards = 'credit-cards';
const statements = 'statements';
const payments = 'payments';
const payout = 'payout';
const invoices = 'invoices';
const contacts = 'contacts';
const subscriptions = 'subscriptions';
const reports = 'reports';

const ACTIONS = {
  profile: {
    view: `${portal}:${profile}:${view}`,
    list: `${portal}:${profile}:${list}`,
    update: `${portal}:${profile}:${update}`,
  },
  cards: {
    view: `${portal}:${cards}:${view}`,
    list: `${portal}:${cards}:${list}`,
    create: `${portal}:${cards}:${create}`,
    update: `${portal}:${cards}:${update}`,
  },
  statements: {
    view: `${portal}:${statements}:${view}`,
    list: `${portal}:${statements}:${list}`,
  },
  payments: {
    view: `${portal}:${payments}:${view}`,
    list: `${portal}:${payments}:${list}`,
    create: `${portal}:${payments}:${create}`,
    update: `${portal}:${payments}:${update}`,
  },
  payout: {
    view: `${portal}:${payout}:${view}`,
    list: `${portal}:${payout}:${list}`,
  },
  invoices: {
    view: `${portal}:${invoices}:${view}`,
    list: `${portal}:${invoices}:${list}`,
  },
  contacts: {
    view: `${portal}:${contacts}:${view}`,
    list: `${portal}:${contacts}:${list}`,
    create: `${portal}:${contacts}:${create}`,
    update: `${portal}:${contacts}:${update}`,
    del: `${portal}:${contacts}:${del}`,
  },
  subscriptions: {
    view: `${portal}:${subscriptions}:${view}`,
    list: `${portal}:${subscriptions}:${list}`,
  },
  reports: {
    perform: `${portal}:${reports}:${perform}`,
  },
};

export default ACTIONS;
