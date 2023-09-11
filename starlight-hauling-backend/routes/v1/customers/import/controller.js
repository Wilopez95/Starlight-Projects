import ApiError from '../../../../errors/ApiError.js';

import CustomerGroupRepository from '../../../../repos/customerGroup.js';
import CustomerRepository from '../../../../repos/customer.js';

import { excel2Json } from '../../../../services/excel.js';
import { syncCustomerData } from '../../../../services/billingProcessor.js';

import { CUSTOMER_FIELDS_BY_GROUP_TYPE } from '../../../../consts/importCustomer.js';
import { CUSTOMER_GROUP_TYPE } from '../../../../consts/customerGroups.js';
import { IMPORT_CUSTOMERS_MAX_ROWS_COUNT } from '../../../../config.js';
import { customerData } from './schema.js';

const mapCustomerFieldsFromExcel = (data, groupType, customerGroupId, businessUnitId) => {
  const customerFields = CUSTOMER_FIELDS_BY_GROUP_TYPE[groupType];
  return data.map(customer => {
    const mappedCustomer = {};
    Object.keys(customer).forEach(key => {
      mappedCustomer[customerFields[key]] = customer[key];
      mappedCustomer.customerGroupId = customerGroupId;
      mappedCustomer.businessUnitId = businessUnitId;
      mappedCustomer.commercial = groupType === CUSTOMER_GROUP_TYPE.commercial;
    });

    return {
      ...mappedCustomer,
      invoiceEmails: mappedCustomer.invoiceEmails.split(',').map(element => element.trim()),
    };
  });
};

const mapCustomerFieldsToSave = data => {
  const mailingAddress = {
    addressLine1: data.mailingAddressLine1,
    addressLine2: data.mailingAddressLine2,
    city: data.mailingCity,
    state: data.mailingState,
    zip: data.mailingZip,
  };
  return {
    referenceNumber: data.referenceNumber,
    email: data.email,
    customerGroupId: data.customerGroupId,
    businessUnitId: data.businessUnitId,
    businessName: data.businessName,
    phoneNumbers: [
      {
        type: 'main',
        number: data.phoneNumber.toString(),
        extension: data.phoneNumberExt,
      },
    ],
    firstName: data.firstName,
    lastName: data.lastName,
    mainFirstName: data.contactFirstName,
    mainLastName: data.contactLastName,
    mainEmail: data.contactEmail,
    mainPhoneNumbers: [
      {
        type: 'main',
        number: data.contactPhone.toString(),
        extension: data.contactPhoneExt,
      },
    ],
    invoiceConstruction: data.invoiceByType,
    onAccount: data.onAccount,
    paymentTerms: data.paymentTerms,
    billingCycle: data.billingCycle,
    mailingAddress,
    billingAddress: data.billingSameAsMailing
      ? mailingAddress
      : {
          addressLine1: data.billingAddressLine1,
          addressLine2: data.billingAddressLine2,
          city: data.billingCity,
          state: data.billingState,
          zip: data.billingZip,
        },
    sendInvoicesByEmail: data.sendInvoicesByEmail,
    invoiceEmails: data.invoiceEmails,
    generalNote: data.generalNote,
    popupNote: data.popupNote,
  };
};

const getValidationResult = async data => {
  const notUniqReferenceNumbers = data
    .map(element => element.referenceNumber)
    .filter((element, index, array) => array.indexOf(element) !== index);

  const results = await Promise.allSettled(
    data.map(customer => customerData.validateAsync(customer)),
  );

  const validationResult = { approved: [], rejected: [], approvedCount: 0, rejectedCount: 0 };

  results.forEach(result => {
    if (
      result.status === 'fulfilled' &&
      !notUniqReferenceNumbers.includes(result.value.referenceNumber)
    ) {
      validationResult.approved.push({ referenceNumber: result.value.referenceNumber });
      validationResult.approvedCount += 1;
    } else if (
      result.status === 'fulfilled' &&
      notUniqReferenceNumbers.includes(result.value.referenceNumber)
    ) {
      validationResult.rejected.push({
        referenceNumber: result.value.referenceNumber,
        message: 'Reference number must be uniq',
      });
      validationResult.rejectedCount += 1;
    } else {
      validationResult.rejected.push({
        referenceNumber: result.reason._original.referenceNumber,
        message: result.reason.details,
      });
      validationResult.rejectedCount += 1;
    }
  });
  return validationResult;
};

const prepareFileData = async (ctx, stream, customerGroupId, businessUnitId) => {
  const customerGroup = await CustomerGroupRepository.getInstance(ctx.state).getById({
    id: customerGroupId,
    fields: ['type'],
  });

  if (!customerGroup) {
    throw ApiError.invalidRequest(`Customer group with id ${customerGroupId} not exist`);
  }

  const [parsed] = await excel2Json({ stream, maxRowsCount: IMPORT_CUSTOMERS_MAX_ROWS_COUNT });

  return mapCustomerFieldsFromExcel(
    parsed.data,
    customerGroup.type,
    customerGroupId,
    businessUnitId,
  );
};

export const validateExcelData = async ctx => {
  const [file] = ctx.request.files;
  const { customerGroupId, businessUnitId } = ctx.request.query;

  const mappedCustomers = await prepareFileData(ctx, file.stream, customerGroupId, businessUnitId);

  const validationResult = await getValidationResult(mappedCustomers);

  ctx.sendObj(validationResult);
};

export const importCustomers = async ctx => {
  const [file] = ctx.request.files;
  const { customerGroupId, businessUnitId } = ctx.request.query;

  let mappedCustomers = await prepareFileData(ctx, file.stream, customerGroupId, businessUnitId);

  const validationResult = await getValidationResult(mappedCustomers);
  if (validationResult.rejectedCount > 0) {
    throw ApiError.badRequest(`Validation error`, validationResult);
  }

  const results = {
    approved: [],
    rejected: [],
    duplications: [],
    approvedCount: 0,
    rejectedCount: 0,
    duplicationsCount: 0,
  };

  const customerRepo = CustomerRepository.getInstance(ctx.state);

  const customerRefNumbers = mappedCustomers.map(customer => customer.referenceNumber);
  const existCustomers = await customerRepo.getCustomersByRefNumbers({
    condition: { businessUnitId },
    refNumbers: customerRefNumbers,
    fields: ['referenceNumber'],
  });
  mappedCustomers = mappedCustomers.map(customer => {
    customer.isPresent = existCustomers
      ?.map(({ referenceNumber }) => referenceNumber)
      .includes(customer.referenceNumber.toString());
    return customer;
  });

  await Promise.all(
    mappedCustomers.map(async dataToInsert => {
      if (dataToInsert.isPresent) {
        results.duplications.push({ referenceNumber: dataToInsert.referenceNumber });
        results.duplicationsCount += 1;
      } else {
        const preparedCustomerData = mapCustomerFieldsToSave(dataToInsert);
        try {
          const createdCustomer = await customerRepo.createOne({
            data: preparedCustomerData,
            commercial: dataToInsert.commercial,
            tenantId: ctx.state.tenantId,
          });

          results.approved.push({ referenceNumber: createdCustomer.referenceNumber });
          results.approvedCount += 1;
          const { id, mainPhoneNumber } = createdCustomer;

          syncCustomerData(ctx, { id, mainPhoneNumber, schemaName: ctx.state.user.schemaName });
        } catch (error) {
          results.rejected.push({
            referenceNumber: dataToInsert.referenceNumber,
            message: 'DB error, please check data in row',
          });
          results.rejectedCount += 1;
          ctx.logger.error(error, 'Error while creating customer from imported file');
        }
      }
    }),
  );

  ctx.sendObj(results);
};
