import BusinessLineRepo from '../../businessLine.js';
import BusinessUnitRepo from '../../businessUnit.js';
import ServiceAreaRepo from '../../serviceArea.js';
import ContactRepo from '../../contact.js';
import CustomerRepo from '../../customer.js';
import JobSiteRepo from '../../jobSite.js';
import ThirdPartyHaulerRepo from '../../3rdPartyHaulers.js';

import fieldToLinkedTableMap from '../../../consts/fieldToLinkedTableMap.js';

export const getByIdDraftSubsrciptionPopulateDataQuery = (
  fields,
  tableName,
  schemaName,
  trx,
  pullSelects = false,
) => {
  let query = trx(tableName).withSchema(schemaName).groupBy(`${tableName}.id`);

  const linkedFields = [];
  const nonLinkedFields = [];
  const fieldsToExclude = ['businessUnitId', 'businessLineId', 'serviceAreaId', 'jobSiteId'];

  let bothContactsJoinCase = false;
  if (fields.includes('jobSiteContactId') && fields.includes('subscriptionContactId')) {
    bothContactsJoinCase = true;
    fieldsToExclude.push('jobSiteContactId', 'subscriptionContactId');
  }
  let thirdPartyHaulerAndCompetitorCase = false;
  if (fields.includes('competitorId') && fields.includes('thirdPartyHaulerId')) {
    thirdPartyHaulerAndCompetitorCase = true;
    fieldsToExclude.push('competitorId', 'thirdPartyHaulerId');
  }

  fields
    .filter(field => !fieldsToExclude.includes(field))
    .forEach(field =>
      field.endsWith('Id') ? linkedFields.push(field) : nonLinkedFields.push(field),
    );

  const selects = nonLinkedFields.map(field => `${tableName}.${field}`);

  linkedFields.forEach(field => {
    const targetTable = fieldToLinkedTableMap[field];

    selects.push(trx.raw('to_json(??.*) as ??', [targetTable, field.slice(0, -2)]));

    query = query
      .leftJoin(targetTable, `${targetTable}.id`, `${tableName}.${field}`)
      .groupBy(`${targetTable}.id`);
  });

  if (fields.includes('businessLineId')) {
    selects.push(trx.raw('to_json(??.*) as ??', [BusinessLineRepo.TABLE_NAME, 'businessLine']));

    query = query
      .innerJoin(
        BusinessLineRepo.TABLE_NAME,
        `${tableName}.businessLineId`,
        `${BusinessLineRepo.TABLE_NAME}.id`,
      )
      .groupBy(`${BusinessLineRepo.TABLE_NAME}.id`);
  }

  if (fields.includes('businessUnitId')) {
    selects.push(trx.raw('to_json(??.*) as ??', [BusinessUnitRepo.TABLE_NAME, 'businessUnit']));

    query = query
      .innerJoin(
        BusinessUnitRepo.TABLE_NAME,
        `${tableName}.businessUnitId`,
        `${BusinessUnitRepo.TABLE_NAME}.id`,
      )
      .groupBy(`${BusinessUnitRepo.TABLE_NAME}.id`);
  }

  if (fields.includes('serviceAreaId')) {
    selects.push(trx.raw('to_json(??.*) as ??', [ServiceAreaRepo.TABLE_NAME, 'serviceArea']));

    query = query
      .leftJoin(
        ServiceAreaRepo.TABLE_NAME,
        `${tableName}.serviceAreaId`,
        `${ServiceAreaRepo.TABLE_NAME}.id`,
      )
      .groupBy(`${ServiceAreaRepo.TABLE_NAME}.id`);
  }

  if (fields.includes('customerId')) {
    const customerHt = CustomerRepo.getHistoricalTableName();
    selects.push(trx.raw('to_json(??.*) as ??', [customerHt, 'customer']));

    query = query
      .leftJoin(customerHt, `${tableName}.customerId`, `${customerHt}.id`)
      .groupBy(`${customerHt}.id`);
  }

  if (fields.includes('jobSiteId')) {
    const jobSiteHt = JobSiteRepo.getHistoricalTableName();
    selects.push(trx.raw('to_json(??.*) as ??', [jobSiteHt, 'jobSite']));

    query = query
      .leftJoin(jobSiteHt, `${tableName}.jobSiteId`, `${jobSiteHt}.originalId`)
      .groupBy(`${jobSiteHt}.id`);
  }

  if (bothContactsJoinCase) {
    selects.push(`${tableName}.jobSiteContactId`, `${tableName}.subscriptionContactId`);

    const contactsTn = ContactRepo.TABLE_NAME;
    selects.push(trx.raw('to_json(??.*) as ??', ['jsc', 'jobSiteContact']));

    query = query
      .leftJoin(`${contactsTn} as jsc`, `${tableName}.jobSiteContactId`, `jsc.id`)
      .groupBy('jsc.id');

    selects.push(trx.raw('to_json(??.*) as ??', ['sc', 'subscriptionContact']));

    query = query
      .leftJoin(`${contactsTn} as sc`, `${tableName}.subscriptionContactId`, `sc.id`)
      .groupBy('sc.id');
  }

  if (thirdPartyHaulerAndCompetitorCase) {
    selects.push(`${tableName}.competitorId`, `${tableName}.thirdPartyHaulerId`);

    const thpHaulersTn = ThirdPartyHaulerRepo.TABLE_NAME;
    selects.push(trx.raw('to_json(??.*) as ??', ['cmp', 'competitor']));

    query = query
      .leftJoin(`${thpHaulersTn} as cmp`, `${tableName}.competitorId`, `cmp.id`)
      .groupBy('cmp');

    selects.push(trx.raw('to_json(??.*) as ??', ['tph', 'thirdPartyHauler']));

    query = query
      .leftJoin(`${thpHaulersTn} as tph`, `${tableName}.thirdPartyHaulerId`, `tph.id`)
      .groupBy('tph');
  }

  return pullSelects ? { query, selects } : query.select(...selects);
};
