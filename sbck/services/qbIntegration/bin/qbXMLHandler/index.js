import data2xml from 'data2xml';
import xml2js from 'xml2js';
import { mathRound2 } from '../../../../utils/math.js';
import { logger } from '../../../../utils/logger.js';
import {
  QBConfiguration,
  QBIntegrationLog,
  QBAccount,
  QBService,
} from '../../../../models/index.js';
import { getScopedModels } from '../../../../utils/getScopedModels.js';
import { LogType } from '../../../../consts/qbLogTypes.js';
import { getAllCustomers, getAllJobSites } from '../../../core.js';
import {
  mapSumOnAccount,
  calculateRangeFrom,
  calculateRangeTo,
  formatJournalSection,
} from '../../utils/helpers.js';

/**
 * It takes a string, and returns a promise that resolves to the parsed XML
 * @param {string} xmlString - The XML string to parse
 * @returns A promise that will resolve to the parsed XML string.
 */
const parseXML = string => {
  return new Promise((res, rej) => {
    return xml2js.parseString(string, (err, result) => {
      if (err) {
        return rej(err);
      }
      return res(result);
    });
  });
};

const convert = data2xml({
  xmlHeader: '<?xml version="1.0" encoding="utf-8"?>\n<?qbxml version="14.0"?>\n',
});

const getPayments = async (Payment, addCondition, customerIds) => {
  const payments = [];
  const condition = {
    customerIds,
    ...addCondition,
  };
  payments.push(Payment.getQBData({ condition }));
  return await Promise.all(payments);
};

const getInvoices = async (Invoice, addCondition, customerIds) => {
  const invoices = [];
  const condition = {
    customerIds,
    ...addCondition,
  };
  invoices.push(Invoice.getQBData({ condition }));
  return await Promise.all(invoices);
};

const getPayouts = async (Payout, addCondition, customerIds) => {
  const payouts = [];
  const condition = {
    customerIds,
    ...addCondition,
  };
  payouts.push(Payout.getQBData({ condition }));
  return await Promise.all(payouts);
};

const getReversedPayments = async (ReversedPayment, addCondition, customerIds) => {
  const reversedPayments = [];
  const condition = {
    customerIds,
    ...addCondition,
  };
  reversedPayments.push(ReversedPayment.getQBData({ condition }));
  return await Promise.all(reversedPayments);
};

const buildRequests = async (args, statusCode) => {
  let qbConfiguration;
  const total = {};
  let condition;
  let trx;
  try {
    const { strUserName } = args;
    const integrationId = Number(strUserName);
    qbConfiguration = await QBConfiguration.getBy({
      condition: { 'quick_books_configuration.id': integrationId },
      joinAccounts: true,
    });
    if (!qbConfiguration) {
      throw new Error('No existing qb configuration found');
    }
    const ctx = {
      state: {
        user: { tenantId: qbConfiguration.tenantId, schemaName: qbConfiguration.tenant.name },
      },
    };
    const buList = qbConfiguration.integrationBuList;
    const customers = await getAllCustomers(ctx, { buList });
    const customerIds = customers.map(customer => customer.id);
    const jobSites = await getAllJobSites(ctx);
    const { Payment, Payout, ReversedPayment, Invoice } = getScopedModels(
      qbConfiguration.tenant.name,
    );
    const rangeFrom = calculateRangeFrom(qbConfiguration.lastSuccessfulIntegration);
    const rangeTo = calculateRangeTo(qbConfiguration.dateToAdjustment);

    condition = {
      rangeFrom,
      rangeTo,
      integrationBuList: qbConfiguration.integrationBuList,
    };
    const invoices = await getInvoices(Invoice, condition, customerIds);
    const payments = await getPayments(Payment, condition, customerIds);
    const payouts = await getPayouts(Payout, condition, customerIds);
    const reversedPayments = await getReversedPayments(ReversedPayment, condition, customerIds);
    const result = [];
    const defaultAccountNames = [
      'accountReceivable',
      'defaultAccountIncome',
      'defaultAccountTax',
      'defaultPaymentAccount',
      'defaultAccountFinCharges',
      'writeoffAccount',
      'creditMemoAccount',
    ];
    const qbIntegrationServices = await QBService.query().where({ configurationId: integrationId });
    const qbDefaultAccounts = {};
    defaultAccountNames.forEach(defaultAccount => {
      if (qbConfiguration[defaultAccount]) {
        qbDefaultAccounts[defaultAccount] = qbConfiguration[defaultAccount];
      }
    });
    const integrationCreditData = [];
    const integrationDebitData = [];

    /*
      NEW JOURNAL ENTRIES CONFIGURATION DEC 16 2022

      JE 1 (all the others)
        DEBIT
          D sum of invoices /                                         Starlight A/R
          D sum of incoming payments /                                DefaultPaymentAccount
          D sum of payouts /                                          DefaultPaymentAccount
          D sum of creditmemos /                                      CreditMemoAccountDebit
          D sum of writeoffs /                                        WriteOffAccountDebit

        CREDIT
          D sum of invoices - taxes /                                 DefaultAccountIncomeCredit
          D sum of taxes /                                            DefaultAccountTaxCredit
          D sum of incoming payments /                                Starlight A/R
          D sum of payouts /                                          DefaultPaymentAccount
          D sum of credit memos /                                     Starlight A/R
          D sum of writeoffs /                                        Starlight A/R

      JE 2 (only reversed payments)
        DEBIT
          reversed payment /                                        Starlight A/R

        CREDIT
          reversed payment /                                        DefaultPaymentAccount
    */
    let noDataToSync = true;
    let testDebit = [],
      testCredit = [];
    invoices[0].forEach(invoice => {
      let targetAccountIndex = null;
      const taxDistrict = jobSites.find(js => js.jobSiteId == invoice.jobsiteid);
      const customer = customers.find(c => invoice.customerid == c.id);
      noDataToSync = false;
      testDebit.push({
        account: qbDefaultAccounts.accountReceivable,
        type: 'invoices',
        ammount: parseFloat(invoice.invoicetotalwithtaxes),
      });
      targetAccountIndex = qbIntegrationServices.find(
        service =>
          service.customerGroupId === customer.customerGroupId &&
          parseInt(service.lineOfBussinessId, 10) === invoice.businesslineid,
      );
      if (targetAccountIndex || qbDefaultAccounts.defaultAccountIncome) {
        const totalInvoice = invoice.surchargestotal
          ? parseFloat(invoice.invoicetotal) + parseFloat(invoice.surchargestotal)
          : parseFloat(invoice.invoicetotal);
        testCredit.push({
          account: targetAccountIndex
            ? targetAccountIndex?.accountName
            : qbDefaultAccounts.defaultAccountIncome,
          type: 'invoicesnotaxes',
          ammount: parseFloat(totalInvoice),
        });
      }
      targetAccountIndex = null;
      if (taxDistrict) {
        targetAccountIndex = qbIntegrationServices.find(
          service => service.districtId === taxDistrict.taxDistrictId,
        );
      }
      if (invoice.invoicetaxes && (targetAccountIndex || qbDefaultAccounts.defaultAccountTax)) {
        const totalInvoice = invoice.surchargestotal
          ? parseFloat(invoice.invoicetaxes) - parseFloat(invoice.surchargestotal)
          : parseFloat(invoice.invoicetaxes);
        testCredit.push({
          account: targetAccountIndex?.accountName || qbDefaultAccounts.defaultAccountTax,
          type: 'taxes',
          ammount: parseFloat(totalInvoice),
        });
      }
    });

    payouts[0].forEach(payout => {
      noDataToSync = false;
      testCredit.push({
        account: qbDefaultAccounts.defaultPaymentAccount,
        type: 'payouts',
        ammount: parseFloat(payout.payouttotal),
      });
      testDebit.push({
        account: qbDefaultAccounts.accountReceivable,
        type: 'payouts',
        ammount: parseFloat(payout.payouttotal),
      });
    });

    payments[0].forEach(payment => {
      let targetAccountIndex = null;
      noDataToSync = false;
      if (payment.paymenttype != 'creditMemo' && payment.paymenttype != 'writeOff') {
        targetAccountIndex = qbIntegrationServices.find(
          service => service.paymentMethodId === payment.paymenttype,
        );
        if (targetAccountIndex || qbDefaultAccounts.defaultPaymentAccount) {
          testDebit.push({
            account: targetAccountIndex?.accountName || qbDefaultAccounts.defaultPaymentAccount,
            type: 'payments',
            ammount: parseFloat(payment.paymenttotal),
          });
        }
        testCredit.push({
          account: qbDefaultAccounts.accountReceivable,
          type: 'payments',
          ammount: parseFloat(payment.paymenttotal),
        });
      } else if (payment.paymenttype === 'writeOff') {
        testDebit.push({
          account: qbDefaultAccounts.writeoffAccount,
          type: 'writeoffs',
          ammount: parseFloat(payment.paymenttotal),
        });
        testCredit.push({
          account: qbDefaultAccounts.accountReceivable,
          type: 'writeoffs',
          ammount: parseFloat(payment.paymenttotal),
        });
      } else {
        testDebit.push({
          account: qbDefaultAccounts.creditMemoAccount,
          type: 'creditmemos',
          ammount: parseFloat(payment.paymenttotal),
        });
        testCredit.push({
          account: qbDefaultAccounts.accountReceivable,
          type: 'creditmemos',
          ammount: parseFloat(payment.paymenttotal),
        });
      }
    });
    if (testDebit.length && testCredit.length) {
      testDebit = formatJournalSection(testDebit).filter(record => record.ammount > 0);
      testCredit = formatJournalSection(testCredit).filter(record => record.ammount > 0);
      testDebit.forEach(record => {
        const recordSum = parseFloat(Math.abs(mathRound2(record.ammount)));
        integrationDebitData.push(mapSumOnAccount(recordSum, record.account));
      });
      testCredit.forEach(record => {
        const recordSum = parseFloat(Math.abs(mathRound2(record.ammount)));
        integrationCreditData.push(mapSumOnAccount(recordSum, record.account));
      });
      const xml = convert('QBXML', {
        QBXMLMsgsRq: {
          _attr: { onError: 'stopOnError' },
          JournalEntryAddRq: {
            JournalEntryAdd: {
              JournalCreditLine: integrationCreditData,
              JournalDebitLine: integrationDebitData,
            },
          },
        },
      });
      result.push(xml);
    }

    reversedPayments[0].forEach(reversedPayment => {
      noDataToSync = false;
      const xml = convert('QBXML', {
        QBXMLMsgsRq: {
          _attr: { onError: 'stopOnError' },
          JournalEntryAddRq: {
            JournalEntryAdd: {
              JournalCreditLine: {
                AccountRef: {
                  FullName: qbConfiguration.defaultPaymentAccount,
                },
                Amount: Math.abs(
                  mathRound2(parseFloat(reversedPayment.reversepaymenttotal)),
                ).toFixed(2),
              },
              JournalDebitLine: {
                AccountRef: {
                  FullName: qbConfiguration.accountReceivable,
                },
                Amount: Math.abs(
                  mathRound2(parseFloat(reversedPayment.reversepaymenttotal)),
                ).toFixed(2),
              },
            },
          },
        },
      });
      result.push(xml);
    });
    if (!noDataToSync) {
      await QBIntegrationLog.createOne(
        {
          data: {
            type: LogType.WARN,
            description: 'No data to integrate with QB',
            ...condition,
            ...total,
            configurationId: qbConfiguration?.id,
            lastSuccessfulIntegration: qbConfiguration?.lastSuccessfulIntegration,
            dateToAdjustment: qbConfiguration?.dateToAdjustment,
            tenantId: qbConfiguration.tenantId,
            statusCode,
          },
        },
        trx,
      );
    }
    result.push(
      convert('QBXML', {
        QBXMLMsgsRq: {
          _attr: { onError: 'stopOnError' },
          AccountQueryRq: {
            _attr: { requestID: '1' },
          },
        },
      }),
    );
    return { requests: result, total };
  } catch (err) {
    if (trx) {
      await trx.rollback();
    }
    await QBIntegrationLog.createOne({
      data: {
        type: LogType.ERROR,
        description: `Error while aggregating QB data: ${err.message}`,
        ...condition,
        ...total,
        configurationId: qbConfiguration?.id,
        lastSuccessfulIntegration: qbConfiguration?.lastSuccessfulIntegration,
        dateToAdjustment: qbConfiguration?.dateToAdjustment,
        tenantId: qbConfiguration?.tenantId,
      },
    }).catch(error => {
      logger.error(error, `Error with QB integration: ${error?.message || error}`);
    });
    throw err;
  }
};

export default {
  /**
   * Builds an array of qbXML commands
   * to be run by QBWC.
   *
   * @param args - params from QWC
   */
  fetchRequests: buildRequests,

  /**
   * Called when a qbXML response
   * is returned from QBWC.
   *
   * @param response - qbXML response
   * @param integrationId - the QB integration id
   */
  handleResponse: async (response, integrationId) => {
    const parsedResponse = await parseXML(response);
    parsedResponse.QBXML.QBXMLMsgsRs.map(async data => {
      if (data.AccountQueryRs) {
        const qbConfiguration = await QBConfiguration.getBy({
          condition: { id: integrationId },
          fields: [
            'accountReceivable',
            'defaultAccountIncome',
            'defaultAccountTax',
            'defaultPaymentAccount',
            'defaultAccountFinCharges',
            'writeoffAccount',
            'creditMemoAccount',
          ],
        });
        const defaultAccountKeys = Object.keys(qbConfiguration).filter(element => {
          return element != 'tenant';
        });
        const qbAccounts = data.AccountQueryRs[0].AccountRet;
        qbAccounts.forEach(async qbAccount => {
          let addAccount = true;
          defaultAccountKeys.forEach(account => {
            if (qbConfiguration[account] == qbAccount.Name[0]) {
              addAccount = false;
            }
          });
          if (addAccount) {
            await QBAccount.createOne({
              data: {
                integrationId,
                quickBooksId: qbAccount.ListID[0],
                name: qbAccount.Name[0],
                fullName: qbAccount.FullName[0],
                type: qbAccount.AccountType[0],
              },
            });
          }
        });
      }
    });
  },

  /**
   * Called when there is an error
   * returned processing qbXML from QBWC.
   *
   * @param error - qbXML error response
   */
  didReceiveError: async (
    error,
    method,
    {
      tenantId,
      statusCode,
      surchargesTotal,
      paymentsTotal,
      invoicesTotal,
      taxesTotal,
      adjustmentsTotal,
      finChargesTotal,
      creditMemosTotal,
      writeOffsTotal,
      reversedPaymentsTotal,
    } = {},
  ) => {
    logger.error(error, `Error with QB integration ${method ?? ''}: ${error.message || error}`);

    try {
      if (tenantId) {
        const qbConfiguration = await QBConfiguration.getBy({
          condition: { tenantId },
          fields: ['id', 'integrationBuList', 'lastSuccessfulIntegration', 'dateToAdjustment'],
        });

        const rangeFrom = calculateRangeFrom(qbConfiguration.lastSuccessfulIntegration);
        const rangeTo = calculateRangeTo(qbConfiguration.dateToAdjustment);

        await QBIntegrationLog.createOne({
          data: {
            type: LogType.ERROR,
            description: `Error while sharing data with QB ${method ?? ''}: ${
              error?.message || error
            }`,
            integrationBuList: qbConfiguration?.integrationBuList,
            configurationId: qbConfiguration?.id,
            lastSuccessfulIntegration: qbConfiguration?.lastSuccessfulIntegration,
            dateToAdjustment: qbConfiguration?.dateToAdjustment,
            surchargesTotal: Number(surchargesTotal) || 0,
            paymentsTotal: Number(paymentsTotal) || 0,
            invoicesTotal: Number(invoicesTotal) || 0,
            taxesTotal: Number(taxesTotal) || 0,
            adjustmentsTotal: Number(adjustmentsTotal) || 0,
            finChargesTotal: Number(finChargesTotal) || 0,
            creditMemosTotal: Number(creditMemosTotal) || 0,
            writeOffsTotal: Number(writeOffsTotal) || 0,
            reversedPaymentsTotal: Number(reversedPaymentsTotal) || 0,
            rangeFrom,
            rangeTo,
            tenantId,
            statusCode,
          },
        });
      }
    } catch (err) {
      logger.error(err, `Error with QB integration handling: ${err?.message || err}`);
    }
  },
};
