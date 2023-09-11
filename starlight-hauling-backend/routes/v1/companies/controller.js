import httpStatus from 'http-status';
import startCase from 'lodash/startCase.js';
import pick from 'lodash/fp/pick.js';

import CompanyRepository from '../../../repos/company.js';
import CompanyMailSettingsRepository from '../../../repos/companyMailSettings.js';
import DomainRepository from '../../../repos/domain.js';
import TenantRepository from '../../../repos/tenant.js';

import { storeFile, deleteFileByUrl } from '../../../services/mediaStorage.js';
import {
  authenticateDomain,
  validateAuthentication,
  deleteDomainAuthentication,
} from '../../../services/domainAuthentication.js';
import * as billingService from '../../../services/billing.js';

import allowMimeUtil from '../../../utils/allowedMimeTypes.js';

import ApiError from '../../../errors/ApiError.js';

import { MEDIA_STORAGE_KEY } from '../../../consts/mediaStorage.js';
import { MAIL_FIELDS_TO_BILLING } from '../../../consts/mailSettings.js';
import { DOMAIN_AUTHENTICATION_STATUS } from '../../../consts/domainAuthenticationStatus.js';

const { allowedMimeTypes, isMimeTypeAllowed } = allowMimeUtil('png', 'jpeg');

const handleFileRemovalError = (ctx, error) => {
  ctx.logger.error(error, 'Failed to remove file');
};

const pickAddressFields = data => {
  delete data.mailingAddress.region;
  delete data.physicalAddress.region;
  Object.assign(
    data,
    Object.entries(data.mailingAddress).reduce((obj, [key, value]) => {
      obj[`mailing${startCase(key)}`] = value;
      return obj;
    }, {}),
    Object.entries(data.physicalAddress).reduce((obj, [key, value]) => {
      obj[`physical${startCase(key)}`] = value;
      return obj;
    }, {}),
  );
  delete data.mailingAddress;
  delete data.physicalAddress;
};

export const updateCompanyLogoInformation = async ctx => {
  const {
    user: { schemaName, tenantId },
    concurrentData,
  } = ctx.state;
  const { files } = ctx.request;
  const [file] = files;
  const data = ctx.request.validated.body;

  if (file && !isMimeTypeAllowed(file)) {
    throw ApiError.invalidMimeType(allowedMimeTypes);
  } else if (file && ctx.request.body.logoUrl !== undefined) {
    throw ApiError.invalidRequest(
      'logoUrl and logo found',
      'Both logoUrl and logo fields found. Only one can be preset at a time.',
    );
  }

  const repo = CompanyRepository.getInstance(ctx.state);
  let company = await repo.upsert({
    data: { tenantId, ...data },
    concurrentData,
    log: true,
  });

  const { id } = company;
  let logoUrl;

  if (file) {
    try {
      logoUrl = await storeFile(
        schemaName,
        MEDIA_STORAGE_KEY.companyLogo,
        { companyId: id, type: file.type },
        file,
      );
    } catch (error) {
      ctx.logger.error(error);

      throw ApiError.fileUploadFailed();
    }
  } else if (!file && !data.logoUrl) {
    logoUrl = null;
  }

  try {
    company = await repo.updateBy({
      condition: { id, tenantId },
      data: { logoUrl },
      log: true,
    });
  } catch (error) {
    if (logoUrl) {
      deleteFileByUrl(logoUrl).catch(handleFileRemovalError.bind(null, ctx));
    }
    throw error;
  }

  await billingService.updateCompany(ctx, { tenantId, logoUrl });

  ctx.sendObj(company);
};

export const updateCompanyInformation = async ctx => {
  const {
    user: { tenantId },
    concurrentData,
  } = ctx.state;
  const companyInformation = ctx.request.validated.body;

  pickAddressFields(companyInformation);

  const company = await CompanyRepository.getInstance(ctx.state).upsert({
    data: { tenantId, ...companyInformation },
    concurrentData,
    log: true,
  });

  const { physicalAddress } = company;
  const mappedBackPa = {
    physicalAddressLine1: physicalAddress.addressLine1,
    physicalAddressLine2: physicalAddress.addressLine2,
    physicalCity: physicalAddress.city,
    physicalState: physicalAddress.state,
    physicalZip: physicalAddress.zip,
  };
  await billingService.updateCompany(ctx, { tenantId, ...mappedBackPa });

  ctx.sendObj(company);
};

export const getCurrentCompany = async ctx => {
  const { tenantId } = ctx.state.user;

  const company = tenantId
    ? await CompanyRepository.getInstance(ctx.state).getBy({
        condition: { tenantId },
      })
    : {};

  ctx.sendObj(company, httpStatus.OK);
};

export const updateCompanyMailSettings = async ctx => {
  const {
    user: { tenantId },
    concurrentData,
  } = ctx.state;
  const mailSettings = ctx.request.validated.body;

  const settings = await CompanyMailSettingsRepository.getInstance(ctx.state).upsert({
    data: { tenantId, ...mailSettings },
    concurrentData,
    log: true,
  });

  let domain;
  if (settings.domainId) {
    const { name } = await DomainRepository.getInstance(ctx.state).getBy({
      condition: { id: settings.domainId },
      fields: ['name'],
    });

    domain = name;
  }

  const mailSettingsToBilling = pick(MAIL_FIELDS_TO_BILLING)(mailSettings);

  // Billing service is not involved in configuring domains,
  // so we only store domain as text there and omit `domainId`.
  await billingService.updateCompany(ctx, {
    tenantId,
    ...mailSettingsToBilling,
    domainId: undefined,
    domain,
  });

  ctx.sendObj(settings);
};

export const getCompanyMailSettings = async ctx => {
  const { tenantId } = ctx.state.user;

  const settings = await CompanyMailSettingsRepository.getInstance(ctx.state).getBy({
    condition: { tenantId },
  });

  ctx.sendObj(settings, httpStatus.OK);
};

export const createDomain = async ctx => {
  const { tenantId } = ctx.state.user;
  const domainData = ctx.request.validated.body;

  const settings = await CompanyMailSettingsRepository.getInstance(ctx.state).getBy({
    condition: { tenantId },
    fields: ['adminEmail'],
  });

  if (!settings?.adminEmail) {
    throw ApiError.invalidRequest('You need to set up admin email before you can add domains');
  }

  const domainId = await authenticateDomain(ctx, {
    domain: domainData.name,
    adminEmail: settings.adminEmail,
  });

  const domain = await DomainRepository.getInstance(ctx.state).createOne({
    data: {
      tenantId,
      id: domainId,
      name: domainData.name,
      validationStatus: DOMAIN_AUTHENTICATION_STATUS.pending,
    },
    log: true,
  });

  ctx.sendObj(domain);
};

export const getAllDomains = async ctx => {
  const { tenantId } = ctx.state.user;
  const { validatedOnly } = ctx.request.query;

  const condition = { tenantId };

  if (validatedOnly) {
    condition.validationStatus = DOMAIN_AUTHENTICATION_STATUS.validated;
  }

  const domains = await DomainRepository.getInstance(ctx.state).getAll({
    condition,
    orderBy: 'name',
  });

  ctx.sendArray(domains);
};

export const validateDomainAuthentication = async ctx => {
  const { id } = ctx.params;

  const authenticated = await validateAuthentication(ctx, { domainId: id });

  if (authenticated) {
    const validated = { validationStatus: DOMAIN_AUTHENTICATION_STATUS.validated };

    await DomainRepository.getInstance(ctx.state).updateBy({
      condition: { id },
      data: validated,
      log: true,
    });

    ctx.sendObj(validated);
  } else {
    ctx.sendObj({ validationStatus: DOMAIN_AUTHENTICATION_STATUS.pending });
  }
};

export const deleteDomain = async ctx => {
  const { tenantId } = ctx.state.user;
  const { id } = ctx.params;

  const [currentSettings, domain] = await Promise.all([
    CompanyMailSettingsRepository.getInstance(ctx.state).getBy({
      condition: { tenantId },
      fields: ['domainId'],
    }),
    DomainRepository.getInstance(ctx.state).getBy({
      condition: { id },
      fields: ['tenantId'],
    }),
  ]);

  if (Number(currentSettings?.domainId) === Number(id)) {
    throw ApiError.conflict('You can not delete domain you are currently using');
  } else if (Number(domain?.tenantId) !== Number(tenantId)) {
    // We pretend it does not exist if it does not belong to the current tenant.
    throw ApiError.notFound('No such domain exists');
  }

  await DomainRepository.getInstance(ctx.state).deleteBy({
    condition: { id },
    log: true,
  });

  try {
    await deleteDomainAuthentication(ctx, { domainId: id });
  } catch {
    ctx.logger.info('Suppressing SendGrid error');
  }

  ctx.status = httpStatus.NO_CONTENT;
};

export const getGeneralCompanySettings = async ctx => {
  const { tenantId } = ctx.state.user;

  const settings = await CompanyRepository.getInstance(ctx.state).getBy({
    condition: { tenantId },
    fields: ['id', 'timeZoneName', 'clockIn', 'unit'],
  });

  ctx.sendObj(settings, httpStatus.OK);
};

export const updateGeneralCompanySettings = async ctx => {
  const {
    user: { tenantId },
    concurrentData,
  } = ctx.state;
  const { timeZoneName, clockIn, unit } = ctx.request.validated.body;

  const companyRepo = CompanyRepository.getInstance(ctx.state);
  const existCompany = await companyRepo.getBy({ condition: { tenantId }, fields: ['id'] });
  if (!existCompany) {
    throw ApiError.notFound('No such company exists');
  }
  const company = await companyRepo.updateBy({
    condition: { tenantId },
    data: { timeZoneName, clockIn, unit },
    concurrentData,
    log: true,
  });

  await billingService.updateCompany(ctx, { tenantId, timeZoneName, unit });

  ctx.sendObj(company);
};

export const getFinanceChargeSettings = async ctx => {
  const { tenantId } = ctx.state.user;

  const company = await CompanyRepository.getInstance(ctx.state).getBy({
    condition: { tenantId },
    fields: [
      'id',
      'financeChargeApr',
      'financeChargeMethod',
      'financeChargeMinValue',
      'financeChargeMinBalance',
    ],
  });

  ctx.sendObj(company, httpStatus.OK);
};

export const getRegionalSettings = async ctx => {
  const { tenantId } = ctx.state.user;

  const tenant = await TenantRepository.getInstance(ctx.state).getBy({
    condition: { id: tenantId },
    fields: ['id', 'region'],
  });

  ctx.sendObj(tenant, httpStatus.OK);
};

export const updateFinanceChargeSettings = async ctx => {
  const {
    user: { tenantId },
    concurrentData,
  } = ctx.state;
  const data = ctx.request.validated.body;

  const company = await CompanyRepository.getInstance(ctx.state).updateBy({
    condition: { tenantId },
    data,
    concurrentData,
    log: true,
  });

  await billingService.updateCompany(ctx, { tenantId, ...data });

  ctx.sendObj(company);
};
