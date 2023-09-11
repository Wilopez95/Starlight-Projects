import httpStatus from 'http-status';
import ExcelJS from 'exceljs';
import startCase from 'lodash/startCase.js';
import camelCase from 'lodash/camelCase.js';
import uniqWith from 'lodash/uniqWith.js';

import { hashPassword } from '../../../services/qbIntegration/utils/auth.js';
import { getAllDataForQB } from '../../../services/core.js';
import ApplicationError from '../../../errors/ApplicationError.js';
import { AccountType } from '../../../consts/qbAccountTypes.js';

import { labelToDistrictType, districtTypeToLabel } from '../../../utils/taxDistrict.js';
import { generateId } from '../../../utils/qbUniqueIdGenerator.js';
import { accountsSchema } from './schema.js';

export const getQBConfigurationsList = async ctx => {
  const { QBConfiguration } = ctx.state.models;
  const { tenantId } = ctx.state.user;
  const { id } = ctx.query;
  const conditions = { tenantId };
  if (id) {
    conditions.id = id;
  }
  const qBConfigurations = await QBConfiguration.getAll({ condition: conditions });

  ctx.body = qBConfigurations || [];
  ctx.status = httpStatus.OK;
};

export const deleteQBConfiguration = async ctx => {
  const { QBConfiguration } = ctx.state.models;
  const { id } = ctx.request.validated.params;
  const conditions = { id };
  try {
    const response = await QBConfiguration.deleteOne({ condition: conditions });
    ctx.body = response || [];
    ctx.status = httpStatus.OK;
  } catch (err) {
    throw ApplicationError.badRequest('couldnt delete config', err);
  }
};

export const createQBConfiguration = async ctx => {
  const { QBConfiguration } = ctx.state.models;
  const { tenantId } = ctx.state.user;
  const {
    lastSuccessfulIntegration,
    password,
    integrationBuList,
    dateToAdjustment,
    description,
    systemType,
    integrationPeriod,
  } = ctx.request.validated.body;
  const ownerId = generateId(),
    fileId = generateId();

  // check that user already has the bussiness unit in another qb configuration
  const currentQBConfiguration = await QBConfiguration.getAll({ condition: { tenantId } });
  if (currentQBConfiguration.length) {
    const buList = [];
    currentQBConfiguration.forEach(qbConfiguration =>
      qbConfiguration.integrationBuList.forEach(bu => buList.push(bu)),
    );
    if (buList.some(bu => integrationBuList.includes(bu))) {
      throw ApplicationError.badRequest(
        'one or more of the BUs listed are already assigned to one qb config',
      );
    }
  }

  try {
    const hash = await hashPassword(password);
    const result = await QBConfiguration.createOne({
      data: {
        tenantId: +tenantId,
        lastSuccessfulIntegration,
        password: hash,
        integrationBuList,
        dateToAdjustment,
        description,
        systemType,
        integrationPeriod,
        ownerId,
        fileId,
      },
      fields: ['*'],
    });

    delete result.password;
    ctx.status = httpStatus.CREATED;
    ctx.body = result;
  } catch (err) {
    throw ApplicationError.badRequest('couldnt create config', err);
  }
};

export const updateQBConfiguration = async ctx => {
  const { QBConfiguration } = ctx.state.models;
  const { tenantId } = ctx.state.user;
  const { id } = ctx.params;
  const { password, ...data } = ctx.request.validated.body;
  if (password) {
    data.password = await hashPassword(password);
  } else {
    delete data.password;
  }
  await QBConfiguration.patchBy({ condition: { tenantId, id }, data });

  ctx.status = httpStatus.OK;
};

const host = process.env.QB_HOST;
const wsdlPath = '/api/billing/wsdl';
const supportPath = '/api/billing/wsdl';
const RequestFrequency = 60;

export const generateQWCSettingsFile = async ctx => {
  const { tenantId } = ctx.state.user;
  const { QBConfiguration } = ctx.state.models;
  const { id } = ctx.query;

  // check that user has configuration
  const qbConfiguration = await QBConfiguration.getBy({ condition: { tenantId, id } });
  if (!qbConfiguration) {
    throw ApplicationError.notFound('Please create configuration');
  }

  ctx.response.set('content-disposition', 'attachment; filename=qwcIntegration.qwc');
  ctx.response.set('content-type', 'text/xml');

  ctx.status = httpStatus.OK;
  ctx.body = `<?xml version="1.0"?>
    <QBWCXML>
       <AppName>${qbConfiguration.description}</AppName>
       <AppID></AppID>
       <AppURL>${host}${wsdlPath}</AppURL>
       <AppDescription>${qbConfiguration.description}</AppDescription>
       <AppSupport>${host}${supportPath}</AppSupport>
       <UserName>${qbConfiguration.id}</UserName>
       <OwnerID>${qbConfiguration.ownerId}</OwnerID>
       <FileID>${qbConfiguration.fileId}</FileID>
       <QBType>${qbConfiguration.systemType}</QBType>
       <Scheduler>
          <RunEveryNSeconds>${RequestFrequency}</RunEveryNSeconds>
       </Scheduler>
       <IsReadOnly>false</IsReadOnly>
    </QBWCXML>`;
};

const defaultAccountNames = [
  'accountReceivable',
  'defaultAccountIncome',
  'defaultAccountTax',
  'defaultPaymentAccount',
  'defaultAccountFinCharges',
  'writeoffAccount',
  'creditMemoAccount',
];

export const parseExcelFile = async ctx => {
  const { QBConfiguration, QBService } = ctx.state.models;
  const { integrationId } = ctx.request.validated.query;
  const { tenantId } = ctx.state.user;

  const [file] = ctx.request.files;
  if (!file?.size) {
    throw ApplicationError.badRequest('Please add configuration file');
  }

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(file.path);

  const worksheetDA = workbook.getWorksheet('Default accounts');
  if (!worksheetDA) {
    throw ApplicationError.badRequest('Please add valid configuration file');
  }

  // check that user has configuration before parsing file
  const qbConfiguration = await QBConfiguration.getBy({
    condition: { tenantId, id: integrationId },
  });
  if (!qbConfiguration) {
    throw ApplicationError.badRequest('Please create configuration');
  }

  const accounts = worksheetDA
    .getColumn(2)
    .values.slice(2)
    .map(el => el && String(el)?.trim());

  const mappedAccountNames = defaultAccountNames.reduce((result, account, index) => {
    result[account] = accounts[index];
    return result;
  }, {});

  let validatedAccounts;
  try {
    validatedAccounts = await accountsSchema.validateAsync(mappedAccountNames);
  } catch (err) {
    throw ApplicationError.badRequest(`Please set all accounts data ${err.message}`);
  }

  const [services, lineItems, customerGroups, taxes, surcharges] = await getAllDataForQB(ctx);
  if (!lineItems.length && !services.length) {
    throw ApplicationError.badRequest('Please create billable data');
  }

  const invoiceAccounts = [];
  const worksheetInvoices = workbook.getWorksheet('Journal entries (Invoices)');
  worksheetInvoices.eachRow((row, rowNumber) => {
    //skip headers
    if (rowNumber === 1) {
      return;
    }
    const { 1: action, 2: customerGroup, 3: info, 4: accountName } = row.values;
    const actionReg = new RegExp(`^${camelCase(action)}$`, 'i');

    const serviceCheck = /service$/;
    let found;
    services.find(({ actionService }) => {
      const serviceAction = camelCase(actionService);
      if (actionReg.test(serviceAction) && serviceCheck.test(info)) {
        found = { description: serviceAction, type: AccountType.SERVICE };
        return true;
      }
      return false;
    });

    if (!found) {
      lineItems.find(({ type }) => {
        if (actionReg.test(type)) {
          found = { description: type, type: AccountType.LINE_ITEM };
          return true;
        }
        return false;
      });
    }

    if (!found) {
      surcharges.find(({ description }) => {
        if (action === description) {
          found = { description, type: AccountType.SURCHARGE };
          return true;
        }
        return false;
      });
    }

    if (!found) {
      throw ApplicationError.invalidRequest(
        `Can't find such item ${action} ${customerGroup} ${info} ${accountName ?? ''}`,
      );
    }

    customerGroups.find(({ description, id }) => {
      if (description === customerGroup) {
        found.customerGroup = description;
        found.customerGroupId = id;
        return true;
      }
      return false;
    });

    found.accountName = String(accountName ?? '');

    invoiceAccounts.push(found);
  });

  const taxAccounts = [];
  const worksheetTaxes = workbook.getWorksheet('Journal entries (Taxes)');
  worksheetTaxes.eachRow((row, rowNumber) => {
    //skip headers
    if (rowNumber === 1) {
      return;
    }

    const { 1: taxDescription, 2: typeLabel, 3: accountName } = row.values;
    let found;
    taxes.find(({ description, districtType }) => {
      if (description === taxDescription && districtType === labelToDistrictType(typeLabel)) {
        found = {
          description,
          type: AccountType.TAX,
          accountName: String(accountName ?? ''),
          districtType,
        };
        return true;
      }
      return false;
    });

    if (!found) {
      throw ApplicationError.invalidRequest(
        `Can't find such item ${taxDescription} ${typeLabel} ${accountName ?? ''}`,
      );
    }

    taxAccounts.push(found);
  });

  let result;
  try {
    result = await qbConfiguration.$patchAndFetch({
      ...validatedAccounts,
    });
  } catch (err) {
    throw ApplicationError.invalidRequest('Please set all accounts data', err.message);
  }

  delete result.password;
  await QBService.insertMany({
    configurationId: qbConfiguration.id,
    data: [...invoiceAccounts, ...taxAccounts],
    fields: ['*'],
  });

  ctx.body = result;
  ctx.status = httpStatus.OK;
};

const pageConfig = {
  pageSetup: { paperSize: 9, orientation: 'landscape' },
};

const createDefaultAccountsWorksheet = (workbook, qbConfiguration) => {
  const worksheetDA = workbook.addWorksheet('Default accounts', pageConfig);

  worksheetDA.columns = [
    { header: 'Account', id: 'account', width: 32 },
    { header: 'Account Name', id: 'accountName', width: 32 },
  ];
  // this was map, changed to forEach
  // see sonar https://sonar.starlightsoftware.io/project/issues?pullRequest=1015&issues=AYQ99LMjmp-8mskhxpa_&open=AYQ99LMjmp-8mskhxpa_&id=Starlightpro_starlight-billing-backend_AYE_hKCI1UkZ7gl6uZTe
  // - Steven
  defaultAccountNames.forEach(el => {
    worksheetDA.addRow([startCase(el), qbConfiguration[el]]);
  });

  return workbook;
};

const createInvoicesJE = (
  workbook,
  qbConfiguration,
  { services, lineItems, customerGroups, surcharges },
) => {
  const worksheet = workbook.addWorksheet('Journal entries (Invoices)', pageConfig);

  worksheet.columns = [
    { header: 'Action or Line Item', id: 'action', width: 32 },
    { header: 'Customer Group', id: 'customerGroup', width: 32 },
    { header: 'Income Type', id: 'incomeType', height: 21, width: 32 },
    {
      header: 'IncomeAccount_<Criteria>',
      id: 'icomeAccount',
      width: 32,
      style: { alignment: { wrapText: true } },
    },
  ];

  Object.values(customerGroups).forEach(({ description: customerGroup }) => {
    services.forEach(action => {
      const account = qbConfiguration.accounts?.find(customerAccount => {
        if (
          customerAccount.description === action &&
          customerAccount.type === AccountType.SERVICE &&
          customerAccount.customerGroup === customerGroup
        ) {
          return customerAccount;
        }
        return undefined;
      });

      // startCase removes special chars like '&'
      const a = startCase(action);
      worksheet.addRow([a, customerGroup, `${a}_${customerGroup}_service`, account?.accountName]);
    });

    lineItems.forEach(type => {
      const account = qbConfiguration.accounts?.find(customerAccount => {
        if (
          customerAccount.description === type &&
          customerAccount.type === AccountType.LINE_ITEM &&
          customerAccount.customerGroup === customerGroup
        ) {
          return customerAccount;
        }
        return undefined;
      });

      const t = startCase(type);
      worksheet.addRow([t, customerGroup, `${t}_${customerGroup}_lineItem`, account?.accountName]);
    });

    surcharges.forEach(({ description }) => {
      const account = qbConfiguration.accounts?.find(customerAccount => {
        if (
          customerAccount.description === description &&
          customerAccount.type === AccountType.SURCHARGE &&
          customerAccount.customerGroup === customerGroup
        ) {
          return customerAccount;
        }
        return undefined;
      });

      worksheet.addRow([
        description,
        customerGroup,
        `${description}_${customerGroup}_surcharge`,
        account?.accountName,
      ]);
    });
  });

  return workbook;
};

const createTaxesJE = (workbook, qbConfiguration, taxes, region) => {
  const worksheetTaxes = workbook.addWorksheet('Journal entries (Taxes)', pageConfig);

  worksheetTaxes.columns = [
    { header: 'Tax district', id: 'taxDistrict', width: 32 },
    { header: 'Tax district type', id: 'taxDistrictType', width: 32 },
    { header: 'Tax Account', id: 'taxAccount', width: 32 },
  ];

  const uniqueTaxes = uniqWith(
    taxes,
    (a, b) => a.description === b.description && a.districtType === b.districtType,
  );
  uniqueTaxes.forEach(({ description, districtType }) => {
    const account = qbConfiguration.accounts?.find(customerAccount => {
      if (customerAccount.description === description && customerAccount.type === AccountType.TAX) {
        return customerAccount;
      }
      return false;
    });

    worksheetTaxes.addRow([
      description,
      districtTypeToLabel(districtType, region),
      account?.accountName,
    ]);
  });

  return workbook;
};

export const exportExcelFile = async ctx => {
  const { integrationId } = ctx.request.validated.query;
  const { QBConfiguration, Tenant } = ctx.state.models;
  const { tenantId } = ctx.state.user;

  const [qbConfiguration, tenant] = await Promise.all([
    QBConfiguration.getBy({
      condition: { tenantId, id: integrationId },
      joinAccounts: true,
    }),
    Tenant.getById(tenantId),
  ]);

  if (!qbConfiguration) {
    throw ApplicationError.invalidRequest('Configuration do not exist');
  }

  const [services, lineItems, customerGroups, taxes, surcharges] = await getAllDataForQB(ctx);
  const uniqueLineItems = Array.from(new Set(lineItems.map(({ type }) => type)));
  const uniqueActions = Array.from(new Set(services.map(({ action }) => action)));
  const workbook = new ExcelJS.Workbook();

  createDefaultAccountsWorksheet(workbook, qbConfiguration);
  createInvoicesJE(workbook, qbConfiguration, {
    customerGroups,
    surcharges,
    services: uniqueActions,
    lineItems: uniqueLineItems,
  });
  createTaxesJE(workbook, qbConfiguration, taxes, tenant.region);

  ctx.response.set('content-disposition', 'attachment; filename="qbIntegration.xlsx"');
  ctx.response.set(
    'content-type',
    'text/xmlapplication/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  );
  ctx.body = await workbook.xlsx.writeBuffer();
};
