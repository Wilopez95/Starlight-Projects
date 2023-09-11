import httpStatus from 'http-status';
import * as dateFns from 'date-fns';

import groupBy from 'lodash/groupBy.js';
import isEmpty from 'lodash/isEmpty.js';
import camelCase from 'lodash/camelCase.js';

import { mergePdfs } from '../../../services/pdfMerger.js';
import * as exagoService from '../../../services/reporting/exago.js';
import { AprType } from '../../../consts/aprTypes.js';
import { FinanceChargeMethod } from '../../../consts/financeChargeMethod.js';

import { mathRound2 } from '../../../utils/math.js';
import { getAttachmentFileName } from '../../../utils/attachmentFileName.js';

const DAYS_30 = 30;

export const statementsDownload = async ctx => {
  const { Statement } = ctx.state.models;
  const { id } = ctx.request.validated.query;

  const pdfUrls = await Statement.getPdfUrls(id);

  const fileName = getAttachmentFileName('Statement(s)', pdfUrls);
  let buffer;
  try {
    buffer = await mergePdfs(
      pdfUrls.map(({ pdfUrl }) => pdfUrl),
      fileName,
    );
  } catch (error) {
    ctx.logger.error(`Could not merge PDFs for documents: ${pdfUrls}`);
    throw error;
  }

  ctx.attachment(`${fileName}.pdf`);
  ctx.status = httpStatus.OK;
  ctx.body = buffer;
};

export const statementView = async ctx => {
  const { Company } = ctx.state.models;
  const { id } = ctx.request.validated.query;
  const { subscriberName, tenantId } = ctx.state.user;

  const company = await Company.getByTenantId(tenantId);

  const { logoUrl, statementsDisclaimerText } = company;
  const params = { companyLogoUrl: logoUrl, statementId: id };

  if (statementsDisclaimerText) {
    params.statementDisclaimerText = statementsDisclaimerText;
  }

  const session = await exagoService.batchInit(ctx, { haulingSchema: subscriberName }, params);

  ctx.status = httpStatus.OK;
  ctx.body = session;
};

const addressFields = ['addressLine1', 'addressLine2', 'city', 'state', 'zip'];
const mapAddressFields = obj => {
  Object.entries(obj)
    .filter(([key]) => key.startsWith('mailing') || key.startsWith('billing'))
    .forEach(([key, value]) => {
      const addressField = camelCase(key.slice(7));
      if (addressFields.includes(addressField)) {
        const field = key.startsWith('mailing') ? 'mailingAddress' : 'billingAddress';
        if (obj[field]) {
          obj[field][addressField] = value;
        } else {
          obj[field] = { [addressField]: value };
        }
        delete obj[key];
      }
    });

  return obj;
};

const calculateFine = (invoice, rate, minFine, minRange) => {
  const totalDays = dateFns.differenceInCalendarDays(
    invoice.endStatementDate,
    invoice.lastChargeDate,
  );

  if (totalDays && totalDays >= minRange) {
    //TODO calculate by payments difference
    invoice.totalDays = totalDays;
    invoice.fine = mathRound2(
      Math.max(minFine, (invoice.balance * rate * totalDays) / (100 * 365)),
    );
  }

  delete invoice.payments;
  delete invoice.paymentApplications;

  return { ...invoice, total: Number(invoice.total), balance: Number(invoice.balance) };
};

export const financeChargeDraft = async ctx => {
  const { Company, Invoice, Statement } = ctx.state.models;
  const { tenantId } = ctx.state.user;
  const { id } = ctx.request.validated.body;

  const [company, customers, statements] = await Promise.all([
    Company.getByTenantId(tenantId),
    Statement.getCustomersForFinanceCharge(id),
    Statement.getByIds(id, ['id', 'customerId']),
  ]);
  const minRange = company.financeChargeMethod === FinanceChargeMethod.DAYSPERIOD30 ? DAYS_30 : 0;

  let customersData = customers.reduce((result, customer) => {
    if (customer.addFinanceCharges) {
      result.push({
        ...customer,
        statements: statements.filter(statement => statement.customerId === customer.id),
        financeChargeApr: Number(
          customer.aprType === AprType.CUSTOM ? customer.financeCharge : company.financeChargeApr,
        ),
      });
    }
    return result;
  }, []);

  const statementIds = customersData.flatMap(customer =>
    customer.statements.map(statement => statement.id),
  );

  let invoices = await Invoice.getForFinanceCharges(statementIds, company.financeChargeMinBalance);

  invoices = groupBy(invoices, 'customerId');
  customersData.forEach(customer => {
    customer.invoices = invoices[customer.id]
      ?.map(invoice =>
        calculateFine(invoice, customer.financeChargeApr, company.financeChargeMinValue, minRange),
      )
      ?.filter(invoice => invoice.fine);
    delete customer.statements;
  });

  customersData = customersData.filter(customer => !isEmpty(customer.invoices));

  ctx.status = httpStatus.OK;
  ctx.body = customersData.map(mapAddressFields);
};
