import BaseRepository from '../../_base.js';
import BusinessLineRepo from '../../businessLine.js';
import BusinessUnitRepo from '../../businessUnit.js';
import ServiceAreaRepo from '../../serviceArea.js';
import ContactRepo from '../../contact.js';
import PurchaseOrderRepo from '../../purchaseOrder.js';

import fieldToLinkedTableMap from '../../../consts/fieldToLinkedTableMap.js';

export const populateDataQuery = (trx, tableName, schemaName, { fields, pullSelects = false }) => {
  let query = trx(tableName).withSchema(schemaName).groupBy(`${tableName}.id`);

  const linkedData = [];
  const nonLinkedFields = [];
  const fieldsToExclude = ['businessUnitId', 'businessLineId', 'serviceAreaId'];

  let bothContactsJoinCase = false;
  if (fields.includes('jobSiteContactId') && fields.includes('subscriptionContactId')) {
    bothContactsJoinCase = true;
    fieldsToExclude.push('jobSiteContactId', 'subscriptionContactId');
  }

  fields
    .filter(field => !fieldsToExclude.includes(field))
    .forEach(field =>
      field.endsWith('Id') ? linkedData.push(field) : nonLinkedFields.push(field),
    );

  const selects = nonLinkedFields.map(field => `${tableName}.${field}`);

  linkedData.forEach(field => {
    const targetTable = BaseRepository.getHistoricalTableName(fieldToLinkedTableMap[field]);

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

  if (fields.includes('purchaseOrderId')) {
    selects.push(trx.raw('to_json(??.*) as ??', [PurchaseOrderRepo.TABLE_NAME, 'purchaseOrder']));

    query = query
      .leftJoin(
        PurchaseOrderRepo.TABLE_NAME,
        `${tableName}.purchaseOrderId`,
        `${PurchaseOrderRepo.TABLE_NAME}.id`,
      )
      .groupBy(`${PurchaseOrderRepo.TABLE_NAME}.id`);
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
    const serviceAreaHT = ServiceAreaRepo.getHistoricalTableName();

    selects.push(trx.raw('to_json(??.*) as ??', [serviceAreaHT, 'serviceArea']));

    query = query
      .leftJoin(serviceAreaHT, `${tableName}.serviceAreaId`, `${serviceAreaHT}.id`)
      .groupBy(`${serviceAreaHT}.id`);
  }

  if (bothContactsJoinCase) {
    selects.push(`${tableName}.jobSiteContactId`, `${tableName}.subscriptionContactId`);

    const contactsHt = ContactRepo.getHistoricalTableName();
    selects.push(trx.raw('to_json(??.*) as ??', ['jsc', 'jobSiteContact']));

    query = query
      .joinRaw(
        `
                    left join "${schemaName}"."${contactsHt}" jsc
                        on jsc.id = "${tableName}".job_site_contact_id
                `,
      )
      .groupBy('jsc.id');

    selects.push(trx.raw('to_json(??.*) as ??', ['sc', 'subscriptionContact']));

    query = query
      .joinRaw(
        `
                    left join "${schemaName}"."${contactsHt}" sc
                        on sc.id = "${tableName}".subscription_contact_id
                `,
      )
      .groupBy('sc.id');
  }

  return pullSelects ? { query, selects } : query.select(...selects);
};
