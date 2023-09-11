import httpStatus from 'http-status';
import isNil from 'lodash/isNil.js';
import mergeWith from 'lodash/mergeWith.js';
import startCase from 'lodash/startCase.js';
import pick from 'lodash/fp/pick.js';

import BusinessUnitRepo from '../../../repos/businessUnit.js';
import BusinessUnitLineRepo from '../../../repos/businessUnitLine.js';
import BusinessUnitMailSettings from '../../../repos/businessUnitMailSettings.js';
import BUServiceDaysRepo from '../../../repos/businessUnitServiceDays.js';
import MerchantRepo from '../../../repos/merchant.js';
import DomainRepository from '../../../repos/domain.js';
import InventoryRepo from '../../../repos/inventory/inventory.js';
import CustomerRepo from '../../../repos/customer.js';

import { deleteFileByUrl, storeFile } from '../../../services/mediaStorage.js';
import { encryptMidPassword } from '../../../services/password.js';
import * as billingService from '../../../services/billing.js';
import MqSender from '../../../services/amqp/sender.js';
import { search } from '../../../services/elasticsearch/ElasticSearch.js';

import allowMimeUtil from '../../../utils/allowedMimeTypes.js';
import { joinAddress } from '../../../utils/joinAddress.js';

import ApiError from '../../../errors/ApiError.js';

import { MEDIA_STORAGE_KEY } from '../../../consts/mediaStorage.js';
import { BUSINESS_UNIT_TYPE } from '../../../consts/businessUnitTypes.js';
import { NON_TENANT_INDEX } from '../../../consts/searchIndices.js';

import { AMQP_BUSINESS_UNITS_EXCHANGE } from '../../../config.js';
import { customerFieldsForBilling } from '../../../services/billingProcessor.js';

const { allowedMimeTypes, isMimeTypeAllowed } = allowMimeUtil('png', 'jpeg');

const handleFileRemovalError = (ctx, error) => ctx.logger.error(error, 'Failed to remove file');

const mapAddressFields = data => {
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

const clearSensitiveMerchantData = merchant => {
  delete merchant.password;
  delete merchant.salespointPassword;
};

const buildBULoginUrl = (businessUnit, tenantName) =>
  `/${tenantName}/business-units/${businessUnit.id}/login?auto=true`;

const uploadLogo = async (ctx, schemaName, logoUrl, id, file) => {
  if (!file) {
    return null;
  }
  if (!isMimeTypeAllowed(file)) {
    throw ApiError.invalidMimeType(allowedMimeTypes);
  }
  if (logoUrl !== undefined) {
    throw ApiError.invalidRequest(
      'logoUrl and logo found',
      'Both logoUrl and logo fields found. Only one can be preset at a time.',
    );
  }

  let result;
  try {
    result = await storeFile(
      schemaName,
      MEDIA_STORAGE_KEY.businessUnitLogo,
      { businessUnitId: id, type: file.type },
      file,
    );
  } catch (error) {
    ctx.logger.error(error);
    throw ApiError.fileUploadFailed();
  }

  return result;
};

const getBuFieldsForBilling = pick([
  'id',
  'nameLine1',
  'active',
  'timeZoneName',
  'logoUrl',
  'type',
  'merchant',
]);

const encryptMerchantData = async data => {
  if (data.password) {
    data.password = await encryptMidPassword(data.password);
  }

  if (data.salespointPassword) {
    data.salespointPassword = await encryptMidPassword(data.salespointPassword);
  }
};

export const getBusinessUnits = async ctx => {
  const condition = {};
  if (ctx.request.query.activeOnly) {
    condition.active = true;
  }

  const businessUnits = await BusinessUnitRepo.getInstance(ctx.state).getAllPopulated({
    condition,
  });

  ctx.sendArray(businessUnits);
};

export const getBusinessUnitById = async ctx => {
  const { id } = ctx.params;

  const businessUnit = await BusinessUnitRepo.getInstance(ctx.state).getWithMerchant({
    condition: { id },
  });

  if (businessUnit?.merchant) {
    clearSensitiveMerchantData(businessUnit.merchant);
  }

  ctx.sendObj(businessUnit);
};

export const getBusinessUnitMerchants = async ctx => {
  const { id } = ctx.params;

  const merchants = await MerchantRepo.getInstance(ctx.state).getByBusinessUnit({
    condition: { businessUnitId: id },
  });

  ctx.sendArray(merchants);
};

export const createBusinessUnit = async ctx => {
  const { schemaName, tenantId, tenantName } = ctx.state.user;
  const {
    validated: { body: data },
    files,
  } = ctx.request;
  const [file] = files;

  if (data.merchant) {
    await encryptMerchantData(data.merchant);

    await billingService.validateMerchantData(ctx, { data: data.merchant });
  }

  mapAddressFields(data);

  const repo = BusinessUnitRepo.getInstance(ctx.state);
  const {
    businessUnit: createdBusinessUnit,
    walkupCustomer,
    facilityJobSite,
  } = await repo.createOne({
    data,
    log: true,
  });

  const { id } = createdBusinessUnit;
  if (!id) {
    throw ApiError.invalidRequest('Failed to create BU');
  }

  await InventoryRepo.getInstance(ctx.state).registerAllEquipmentsForBusinessUnit(
    createdBusinessUnit,
  );

  const logoUrl = await uploadLogo(ctx, schemaName, data.logoUrl, id, file);
  if (logoUrl) {
    try {
      await repo.updateBy({ condition: { id }, data: { logoUrl }, log: true });
    } catch (error) {
      deleteFileByUrl(logoUrl).catch(handleFileRemovalError.bind(null, ctx));

      repo
        .deleteBy({ condition: { id }, log: true })
        .catch(() => `Failed to remove BU with id ${id}`);

      throw error;
    }
  }

  const businessUnit = await repo.getWithMerchant({ condition: { id } });

  const businessUnitForBilling = getBuFieldsForBilling(businessUnit);

  if (walkupCustomer) {
    const walkupCustomerForBilling = await CustomerRepo.getInstance(ctx.state, {
      schemaName,
    }).getById({
      id: walkupCustomer.id,
      fields: customerFieldsForBilling,
    });

    walkupCustomerForBilling.mainPhoneNumber = walkupCustomer.mainPhoneNumber;

    businessUnitForBilling.customer = walkupCustomerForBilling;
  }

  if (businessUnit) {
    await Promise.all([
      billingService.upsertBusinessUnit(ctx, {
        tenantId,
        schemaName,
        tenantName: schemaName,
        ...businessUnitForBilling,
      }),
      MqSender.getInstance().sendToExchange(ctx, AMQP_BUSINESS_UNITS_EXCHANGE, '', {
        id: businessUnit.id,
        tenantName,
        tenantId,
        type: businessUnit.type,
        loginUrl: buildBULoginUrl(businessUnit, tenantName),
      }),
      facilityJobSite
        ? billingService.upsertJobSite(ctx, {
            schemaName,
            id: facilityJobSite.id,
            ...facilityJobSite.address,
          })
        : Promise.resolve(),
    ]);
  }

  if (businessUnit?.merchant) {
    clearSensitiveMerchantData(businessUnit.merchant);
  }

  ctx.status = httpStatus.CREATED;
  ctx.body = businessUnit;
};

export const addBusinessLines = async ctx => {
  const { id } = ctx.params;
  const { businessLines } = ctx.request.validated.body;

  await BusinessUnitRepo.getInstance(ctx.state).addBusinessLines({
    businessUnitId: id,
    businessLinesInfo: businessLines,
    log: true,
  });

  ctx.status = httpStatus.OK;
};

export const updateBusinessLines = async ctx => {
  const { id } = ctx.params;

  const { businessLines } = ctx.request.validated.body;

  await BusinessUnitLineRepo.getInstance(ctx.state).updateDefaultBillingItem({
    data: {
      businessUnitId: id,
      businessLines,
    },
  });

  ctx.status = httpStatus.OK;
};

const assertMerchantDataValid = (originalMerchant, merchant) => {
  if (merchant.mid && originalMerchant.mid && originalMerchant.mid !== merchant.mid) {
    throw ApiError.invalidRequest('Changing mid is not allowed');
  } else if (
    merchant.salespointMid &&
    originalMerchant.salespointMid &&
    originalMerchant.salespointMid !== merchant.salespointMid
  ) {
    throw ApiError.invalidRequest('Changing salespoint mid is not allowed');
  }

  if (originalMerchant.username !== merchant.username && !merchant.password) {
    throw ApiError.invalidRequest('Password is required in case username changed');
  } else if (
    merchant.salespointUsername &&
    merchant.salespointUsername !== originalMerchant.salespointUsername &&
    !merchant.salespointPassword
  ) {
    throw ApiError.invalidRequest('Password is required in case username changed');
  }
};

const merchantCredentialsChanged = (originalMerchant, merchant) => {
  if (originalMerchant.username !== merchant.username || merchant.password) {
    return true;
  }
  if (
    merchant.salespointMid &&
    (merchant.salespointPassword ||
      merchant.salespointUsername !== originalMerchant.salespointUsername)
  ) {
    return true;
  }

  return false;
};

export const editBusinessUnit = async ctx => {
  const { id } = ctx.params;
  const { schemaName, tenantId, tenantName } = ctx.state.user;
  const {
    validated: {
      body: { businessLinesInfo, ...body },
    },
    files,
  } = ctx.request;
  const [file] = files;

  const { merchant } = body;

  const repo = BusinessUnitRepo.getInstance(ctx.state);

  const originalBusinessUnit = await repo.getBy({ condition: { id } });

  if (merchant) {
    await encryptMerchantData(merchant);

    const originalMerchant = await MerchantRepo.getInstance(ctx.state).getBy({
      condition: { businessUnitId: id, paymentGateway: merchant.paymentGateway },
    });

    if (originalMerchant) {
      assertMerchantDataValid(originalMerchant, merchant);
      if (merchantCredentialsChanged(originalMerchant, merchant)) {
        await billingService.validateMerchantData(ctx, { data: merchant });
      }

      mergeWith(
        merchant,
        {
          mid: originalMerchant.mid,
          username: originalMerchant.username,
          password: originalMerchant.password,
          salespointMid: originalMerchant.salespointMid,
          salespointUsername: originalMerchant.salespointUsername,
          salespointPassword: originalMerchant.salespointPassword,
        },
        (a, b) => (isNil(a) ? b : a),
      );
    } else {
      await billingService.validateMerchantData(ctx, { data: merchant });
    }
  }

  if (
    originalBusinessUnit.type === BUSINESS_UNIT_TYPE.recyclingFacility &&
    joinAddress(originalBusinessUnit.physicalAddress) !== joinAddress(body.physicalAddress)
  ) {
    Object.assign(body, {
      facilityAddressChanged: true,
      jobSiteId: originalBusinessUnit.jobSiteId,
    });
  }

  mapAddressFields(body);

  const logoUrl = await uploadLogo(ctx, schemaName, body.logoUrl, id, file);

  const { facilityJobSite } = await repo.updateBy({
    condition: { id },
    data: {
      ...body,
      merchant,
      logoUrl: logoUrl || body.logoUrl,
    },
    log: true,
  });

  // in order to populate business lines
  const businessUnit = await repo.getWithMerchant({ condition: { id } });

  if (businessUnit) {
    await Promise.all([
      billingService.upsertBusinessUnit(ctx, {
        tenantId,
        tenantName: schemaName, // TODO refactor to use just one set of fields in one queue
        schemaName,
        loginUrl: buildBULoginUrl(businessUnit, schemaName),
        ...getBuFieldsForBilling(businessUnit),
      }),
      MqSender.getInstance().sendToExchange(ctx, AMQP_BUSINESS_UNITS_EXCHANGE, '', {
        id: businessUnit.id,
        tenantName,
        tenantId,
        type: businessUnit.type,
        loginUrl: buildBULoginUrl(businessUnit, tenantName),
      }),
      facilityJobSite
        ? billingService.upsertJobSite(ctx, {
            schemaName,
            id: facilityJobSite.id,
            ...facilityJobSite.address,
          })
        : Promise.resolve(),
    ]);
  }

  if (businessUnit?.merchant) {
    clearSensitiveMerchantData(businessUnit.merchant);
  }

  ctx.status = httpStatus.OK;
  ctx.body = businessUnit;
};

export const deleteBusinessUnit = async ctx => {
  if (process.env.NODE_ENV !== 'local') {
    ctx.logger.info(ctx.state.user, 'Attempt to remove BU');
    ctx.status = httpStatus.FORBIDDEN;
    return;
  }
  const { id } = ctx.params;
  const { confirmed } = ctx.request.query;

  const repo = BusinessUnitRepo.getInstance(ctx.state);

  const bu = await repo.getById({ id, fields: ['type'] });
  if (!bu) {
    throw ApiError.notFound(`No such BU exists with id ${id}`);
  }
  if (bu.type === BUSINESS_UNIT_TYPE.recyclingFacility && !confirmed) {
    throw ApiError.invalidRequest('This BU has recycling type. Pls confirm such removal');
  }

  // it will delete successfully in case of no other data refs to this BU
  await repo.deleteBy({
    condition: { id },
    buType: bu.type,
    log: true,
  });

  ctx.status = httpStatus.NO_CONTENT;
};

export const searchRecyclingFacilities = async ctx => {
  const { schemaName } = ctx.state.user;
  const { query } = ctx.request.validated;

  const results = await search(
    ctx,
    NON_TENANT_INDEX.recyclingFacilities,
    NON_TENANT_INDEX.recyclingFacilities,
    {
      query,
      limit: 5,
    },
  );

  const { recyclingFacilities } = results ?? {};

  ctx.sendArray(
    recyclingFacilities?.map(facility => {
      facility.sameTenant = facility.tenantName === schemaName;
      return facility;
    }) ?? [],
  );
};

export const getBusinessUnitMailSettings = async ctx => {
  const { id } = ctx.params;

  const data = await BusinessUnitMailSettings.getInstance(ctx.state).getBy({
    condition: { businessUnitId: id },
  });

  ctx.sendObj(data);
};

export const updateBusinessUnitMailSettings = async ctx => {
  const {
    user: { schemaName },
    concurrentData,
  } = ctx.state;
  const { id } = ctx.params;
  const mailSettings = ctx.request.validated.body;

  const settings = await BusinessUnitMailSettings.getInstance(ctx.state).upsert({
    data: { businessUnitId: id, ...mailSettings },
    concurrentData,
  });

  let domain;
  if (settings.domainId) {
    const domainRep = await DomainRepository.getInstance(ctx.state).getBy({
      condition: { id: settings.domainId },
      fields: ['name'],
    });

    if (domainRep) {
      domain = domainRep.name;
    }
  }

  // Billing service is not involved in configuring domains,
  // so we only store domain as text there and omit `domainId`.
  await billingService.updateBusinessUnitMailSettings(ctx, {
    ...mailSettings,
    domainId: undefined,
    id: settings.id,
    businessUnitId: id,
    domain,
    schemaName,
  });

  ctx.sendObj(settings);
};

export const getBUServiceDays = async ctx => {
  const { id } = ctx.params;

  const serviceDays = await BUServiceDaysRepo.getInstance(ctx.state).getByBusinessUnit({
    condition: { businessUnitId: id },
  });

  ctx.sendArray(serviceDays);
};

export const addBUServiceDays = async ctx => {
  const { id } = ctx.params;

  const { serviceDays } = ctx.request.validated.body;

  await BUServiceDaysRepo.getInstance(ctx.state).addServiceDays(id, serviceDays);

  ctx.status = httpStatus.CREATED;
};

export const updateBUServiceDays = async ctx => {
  const { id } = ctx.params;

  const { serviceDays } = ctx.request.validated.body;

  await BUServiceDaysRepo.getInstance(ctx.state).updateServiceDays(id, serviceDays);

  ctx.status = httpStatus.OK;
};
