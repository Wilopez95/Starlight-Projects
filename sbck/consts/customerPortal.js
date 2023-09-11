const portal = 'customer-portal';

const view = 'view';
const list = 'list';
const create = 'create';
const update = 'update';
const perform = 'perform';

const profile = 'profile';
const cards = 'credit-cards';
const statements = 'statements';
const payments = 'payments';
const invoices = 'invoices';
const reports = 'reports';

export const PORTAL_ACTIONS = {
  portalProfile: {
    view: `${portal}:${profile}:${view}`,
    list: `${portal}:${profile}:${list}`,
    update: `${portal}:${profile}:${update}`,
  },
  portalCards: {
    view: `${portal}:${cards}:${view}`,
    list: `${portal}:${cards}:${list}`,
    create: `${portal}:${cards}:${create}`,
    update: `${portal}:${cards}:${update}`,
  },
  portalStatements: {
    view: `${portal}:${statements}:${view}`,
    list: `${portal}:${statements}:${list}`,
  },
  portalPayments: {
    view: `${portal}:${payments}:${view}`,
    list: `${portal}:${payments}:${list}`,
    create: `${portal}:${payments}:${create}`,
    update: `${portal}:${payments}:${update}`,
  },
  portalInvoices: {
    view: `${portal}:${invoices}:${view}`,
    list: `${portal}:${invoices}:${list}`,
    create: `${portal}:${invoices}:${create}`,
    update: `${portal}:${invoices}:${update}`,
  },
  portalReports: {
    perform: `${portal}:${reports}:${perform}`,
  },
};
