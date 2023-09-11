import ApiError from '../../../../errors/ApiError.js';

import { excel2Json } from '../../../../services/excel.js';

import * as billingService from '../../../../services/billing.js';

import JobSiteRepository from '../../../../repos/jobSite.js';
import CustomerRepository from '../../../../repos/customer.js';

import { IMPORT_JOB_SITES_MAX_ROWS_COUNT } from '../../../../config.js';
import { JOB_SITES_FIELDS } from '../../../../consts/importJobSites.js';
import { jobSiteImportData } from './schema.js';

const mapJobSitesFieldsFromExcel = data =>
  data.map(jobSite => {
    const mappedJobSite = {};
    Object.keys(jobSite).forEach(key => (mappedJobSite[JOB_SITES_FIELDS[key]] = jobSite[key]));

    return {
      ...mappedJobSite,
      alleyPlacement: !!mappedJobSite.alleyPlacement,
      cabOver: !!mappedJobSite.cabOver,
    };
  });

const prepareFileData = async stream => {
  const [parsed] = await excel2Json({ stream, maxRowsCount: IMPORT_JOB_SITES_MAX_ROWS_COUNT });

  return mapJobSitesFieldsFromExcel(parsed.data);
};

const getValidationResult = async data => {
  const notUniqReferenceNumbers = data
    .map(element => element.referenceNumber)
    .filter((element, index, array) => array.indexOf(element) !== index);

  const results = await Promise.allSettled(
    data.map(customer => jobSiteImportData.validateAsync(customer)),
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

export const validateExcelData = async ctx => {
  const [file] = ctx.request.files;

  const mappedJobSites = await prepareFileData(file.stream);

  const validationResult = await getValidationResult(mappedJobSites);

  ctx.sendObj(validationResult);
};

const mapJobSiteFieldsToSave = data => ({
  referenceNumber: data.referenceNumber,
  addressLine1: data.addressLine1,
  addressLine2: data.addressLine2,
  city: data.city,
  state: data.state,
  zip: data.zip,
  alleyPlacement: data.alleyPlacement,
  cabOver: data.cabOver,

  location: {
    type: 'Point',
    coordinates: [data.longitude, data.latitude],
  },
  coordinates: [data.longitude, data.latitude],
});

export const importJobSites = async ctx => {
  const [file] = ctx.request.files;
  const { businessUnitId } = ctx.request.query;

  let mappedJobSites = await prepareFileData(file.stream);

  const validationResult = await getValidationResult(mappedJobSites);
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

  const jobSiteRepo = JobSiteRepository.getInstance(ctx.state);
  const customerRepo = CustomerRepository.getInstance(ctx.state);

  const customerRefNumbers = mappedJobSites.map(jobSite => jobSite.customerRefNumber);
  const existCustomers = await customerRepo.getCustomersByRefNumbers({
    condition: { businessUnitId },
    refNumbers: customerRefNumbers,
    fields: ['referenceNumber', 'id'],
  });
  mappedJobSites = mappedJobSites.map(jobSite => {
    jobSite.isCustomerPresent = existCustomers
      ?.map(({ referenceNumber }) => referenceNumber)
      .includes(jobSite.customerRefNumber.toString());
    jobSite.customerId = existCustomers?.find(
      ({ referenceNumber }) => referenceNumber === jobSite.customerRefNumber,
    )?.id;
    return jobSite;
  });

  const jobSiteRefNumbers = mappedJobSites.map(jobSite => jobSite.referenceNumber);
  const existJobSites = await jobSiteRepo.getJobSiteByRefNumbers({
    refNumbers: jobSiteRefNumbers,
    fields: ['referenceNumber'],
  });
  mappedJobSites = mappedJobSites.map(jobSite => {
    jobSite.isPresent = existJobSites
      ?.map(({ referenceNumber }) => referenceNumber)
      .includes(jobSite.referenceNumber.toString());
    return jobSite;
  });

  await Promise.all(
    mappedJobSites.map(async jobSite => {
      if (jobSite.isPresent) {
        results.duplications.push({ referenceNumber: jobSite.referenceNumber });
        results.duplicationsCount += 1;
      } else if (!jobSite.isPresent && jobSite.isCustomerPresent) {
        const preparedJobSiteData = mapJobSiteFieldsToSave(jobSite);
        try {
          const createdJobSite = await jobSiteRepo.createOne({
            data: preparedJobSiteData,
            linkTo: jobSite.customerId,
            log: true,
          });
          results.approved.push({ referenceNumber: createdJobSite.referenceNumber });
          results.approvedCount += 1;

          billingService.upsertJobSite(ctx, {
            schemaName: ctx.state.user.schemaName,
            id: createdJobSite.id,
            ...createdJobSite.address,
          });
        } catch (error) {
          results.rejected.push({
            referenceNumber: preparedJobSiteData.referenceNumber,
            message: 'DB error, please check data in row',
          });
          results.rejectedCount += 1;
          ctx.logger.error(error, 'Error while creating job sites from imported file');
        }
      } else {
        results.rejected.push({
          referenceNumber: jobSite.referenceNumber,
          message: `Customer with ${jobSite.customerRefNumber} not exist`,
        });
        results.rejectedCount += 1;
      }
    }),
  );

  ctx.sendObj(results);
};
