/* eslint-disable eqeqeq */
import compose from 'lodash/fp/compose.js';
import isEmpty from 'lodash/isEmpty.js';
import map from 'lodash/map.js';
import uniq from 'lodash/uniq.js';
import pick from 'lodash/fp/pick.js';

import { deleteDocument, applyTenantToIndex } from '../services/elasticsearch/ElasticSearch.js';
import { getContainingFeatures } from '../services/mapbox.js';
import { publish } from '../services/elasticsearch/indices/jobSites/publisher.js';

import {
  camelCaseKeys,
  tabAddressFields,
  putLocationField,
  unambiguousCondition,
} from '../utils/dbHelpers.js';
import { fromGeoToJsonAs, toGeoJson } from '../utils/postgis.js';

import { TENANT_INDEX } from '../consts/searchIndices.js';
import { REGION } from '../consts/regions.js';
import { DISTRICT_TYPE } from '../consts/districtTypes.js';
import { SORT_ORDER } from '../consts/sortOrders.js';
import { JOB_SITES_SORTING_ATTRIBUTE } from '../consts/jobSitesSotringAttributes.js';
import TenantRepository from './tenant.js';
import ServiceAreaRepo from './serviceArea.js';
import ContractorRepository from './contractor.js';
import PhoneNumberRepository from './phoneNumber.js';
import ContactRepository from './contact.js';
import TaxDistrictRepository from './taxDistrict.js';
import CustomerRepo from './customer.js';
import CustomerJobSitePairRepo from './customerJobSitePair.js';
import VersionedRepository from './_versioned.js';

const TABLE_NAME = 'job_sites';
const indexableFields = [
  'name',
  'addressLine1',
  'addressLine2',
  'coordinates',
  'city',
  'zip',
  'state',
  'id',
];

const defaultTaxDistrictsTableName = 'job_site_default_tax_districts';
const virtualTaxDistrictsTableName = 'job_site_virtual_tax_districts';

const fieldWithPolygon = ['*', fromGeoToJsonAs(VersionedRepository.knex, 'polygon')];

class JobSiteRepository extends VersionedRepository {
  constructor(ctxState, { schemaName }) {
    super(ctxState, { schemaName, tableName: TABLE_NAME });
  }

  mapFields(obj, skipAddress = false) {
    return compose(
      skipAddress ? o => o : tabAddressFields,
      putLocationField,
      camelCaseKeys,
      super.mapFields,
    )(obj);
  }

  mapContractorContact(item) {
    if (item?.contact) {
      item.contact = camelCaseKeys(item.contact);

      if (item?.phoneNumbers?.[0]) {
        item.contact.phoneNumbers = item.phoneNumbers.map(camelCaseKeys);
      } else {
        delete item.phoneNumbers;
      }
    } else {
      delete item.contact;
    }
    if (item?.contractor && item.contact) {
      item.contact.contractor = camelCaseKeys(item.contractor);
    }
    delete item.contractor;

    return this.mapFields(item, false);
  }

  async createOne({ data, fields = ['*'], linkTo: customerId, log } = {}) {
    const trx = await this.knex.transaction();

    let jobSite;
    let jobSiteToES;
    const polygonRaw = data.polygon;
    try {
      data.location = toGeoJson(trx, data.location);
      data.polygon = data.polygon && toGeoJson(trx, data.polygon);

      // If we do not include indexable fields, Elasticsearch will fail.
      fields.push(...indexableFields);

      const newJobSite = await super.createOne({ data, fields: log ? '*' : fields }, trx);

      if (customerId) {
        const { poRequired, signatureRequired } = await CustomerRepo.getInstance(
          this.ctxState,
        ).getById({ id: customerId, fields: ['poRequired', 'signatureRequired'] }, trx);

        // there is no need validation for CJS creation bcz it goes right after JS creation
        await CustomerJobSitePairRepo.getInstance(this.ctxState).createOne(
          {
            data: {
              active: true,
              customerId,
              poRequired,
              signatureRequired,
              jobSiteId: newJobSite.id,
              cabOver: data.cabOver,
              alleyPlacement: data.alleyPlacement,
            },
            log,
          },
          trx,
        );
      }

      jobSite = this.mapFields(newJobSite);
      jobSiteToES = { ...jobSite };
      const { location: newLocation } = jobSiteToES;

      jobSite.taxDistricts = await this.refreshDefaultTaxDistrictsOnLocationChange(
        {
          jobSiteId: jobSite.id,
          newLocation,
          isCreating: true,
        },
        trx,
      );

      await trx.commit();
    } catch (error) {
      await trx.rollback();
      throw error;
    }

    log && this.log({ id: jobSite.id, action: this.logAction.create });

    this.index(jobSiteToES);

    jobSite.polygon = polygonRaw;
    return jobSite;
  }

  mapToIndex(data) {
    return {
      id: data.id,
      location: data.location,
      ...pick(['city', 'state', 'zip', 'location'])(data.address),
      // This is necessary because `addressLine2` might be `null`.
      address: data.address
        ? [data.address.addressLine1, data.address.addressLine2].filter(i => !!i).join(' ')
        : '',
    };
  }

  index(jobSite) {
    const indexName = applyTenantToIndex(TENANT_INDEX.jobSites, this.schemaName);
    const data = this.mapToIndex(jobSite);

    publish(this.getCtx(), this.schemaName, indexName, data);
  }

  async updateBy({ condition, data, fields = ['*'], concurrentData, log } = {}, trx) {
    const _trx = trx || (await this.knex.transaction());

    let shouldUpdateTaxDistricts = false;
    if (data.location) {
      data.location = toGeoJson(_trx, data.location);
      shouldUpdateTaxDistricts = true;
    }

    const polygonRaw = data.polygon;
    data.polygon = data.polygon && toGeoJson(_trx, data.polygon);

    // If we do not include indexable fields, Elasticsearch will fail.
    fields.push(...indexableFields);

    let jobSite;
    let jobSiteToES;
    try {
      const item = await super.updateBy(
        {
          condition,
          concurrentData,
          data,
          fields: log ? '*' : fields,
        },
        _trx,
      );

      if (!item) {
        return null;
      }

      const { id } = condition;
      const { alleyPlacement, cabOver } = data;
      if (id && (alleyPlacement || cabOver)) {
        const repo = CustomerJobSitePairRepo.getInstance(this.ctxState);
        const count = await repo.count({ condition: { jobSiteId: id } }, _trx);

        if (count) {
          const cjsData = {};
          if (alleyPlacement) {
            cjsData.alleyPlacement = true;
          }
          if (cabOver) {
            cjsData.cabOver = true;
          }

          await repo.updateBy(
            {
              condition: { jobSiteId: id },
              data: cjsData,
              fields: [],
              log,
            },
            _trx,
          );
        }
      }

      jobSite = this.mapFields(item);
      jobSiteToES = { ...jobSite };
      const { location: newLocation } = jobSiteToES;

      if (jobSite && shouldUpdateTaxDistricts) {
        jobSite.taxDistricts = await this.refreshDefaultTaxDistrictsOnLocationChange(
          {
            jobSiteId: jobSite.id,
            newLocation,
            isCreating: false,
          },
          _trx,
        );
      }

      if (!trx) {
        await _trx.commit();
      }
    } catch (error) {
      if (!trx) {
        await _trx.rollback();
      }
      throw error;
    }

    log && this.log({ id: jobSite.id, action: this.logAction.modify });

    this.index(jobSiteToES);

    jobSite.polygon = polygonRaw;
    return jobSite;
  }

  async deleteBy({ condition, log } = {}) {
    const trx = await this.knex.transaction();

    const { id } = condition;
    try {
      await trx(defaultTaxDistrictsTableName)
        .withSchema(this.schemaName)
        .delete()
        .where({ jobSiteId: id });
      await trx(virtualTaxDistrictsTableName)
        .withSchema(this.schemaName)
        .delete()
        .where({ jobSiteId: id });

      await super.deleteBy({ condition }, trx);

      await trx.commit();
    } catch (error) {
      await trx.rollback();
      throw error;
    }

    log && this.log({ id, action: this.logAction.delete });

    deleteDocument(this.ctxState, applyTenantToIndex(TENANT_INDEX.jobSites, this.schemaName), {
      id,
    });
  }

  async getLinkedWithCustomerPaginated({
    condition: { customerId, active, ids },
    skip,
    limit,
    mostRecent,
    fields = ['*'],
  } = {}) {
    const linkedTable = CustomerJobSitePairRepo.TABLE_NAME;
    const selects = [
      ...fields.map(field => `${this.tableName}.${field}`),
      `${linkedTable}.poRequired as poRequired`,
      `${linkedTable}.popupNote as popupNote`,
    ];

    const condition = { customerId };
    if (fields[0] === '*' || fields.includes('active')) {
      selects.push(`${linkedTable}.active`);
    }

    if (active) {
      condition[`${linkedTable}.active`] = true;
    }

    let query = this.knex(this.tableName)
      .withSchema(this.schemaName)
      .select(selects)
      .innerJoin(linkedTable, `${linkedTable}.jobSiteId`, `${this.tableName}.id`);

    if (!isEmpty(ids)) {
      query = query.whereIn(`${this.tableName}.id`, ids);
    }
    delete condition.ids;

    if (limit) {
      query = query.limit(limit).offset(skip);
    }

    const items = await query
      .andWhere(condition)
      .orderBy(`${linkedTable}.id`, mostRecent ? SORT_ORDER.desc : SORT_ORDER.asc);

    return items?.map(item => this.mapFields(item, false)) ?? [];
  }

  async getBy(
    {
      condition,
      fields = fieldWithPolygon,
      activeTaxDistrictsOnly = true,
      skipAddressParsing = false,
    } = {},
    trx = this.knex,
  ) {
    const [jobSite, taxDistricts] = await Promise.all([
      super.getBy({ condition, fields }, trx),
      condition.id
        ? this.getDefaultTaxDistricts(
            { jobSiteId: condition.id, activeOnly: activeTaxDistrictsOnly },
            trx,
          )
        : Promise.resolve(),
    ]);

    if (jobSite) {
      Object.assign(jobSite, { taxDistricts: taxDistricts || [] });
    }

    return jobSite ? this.mapFields(jobSite, skipAddressParsing) : null;
  }

  async getAllPaginated(
    {
      condition: { filters, searchId, searchQuery, ...condition } = {},
      skip = 0,
      sortBy = JOB_SITES_SORTING_ATTRIBUTE.id,
      sortOrder = SORT_ORDER.desc,
      limit = 25,
      fields = ['*'],
    } = {},
    trx = this.knex,
  ) {
    fields[0] === 'id' && fields.shift();
    const selects = fields.map(field => `${this.tableName}.${field}`);
    selects.unshift(trx.raw('distinct(??.id) as id', [this.tableName]));

    const sortField = this.jobSitesSortBy(sortBy);
    let query = trx(this.tableName)
      .withSchema(this.schemaName)
      .limit(limit)
      .offset(skip)
      .where(unambiguousCondition(this.tableName, condition))
      .groupBy(`${this.tableName}.id`)
      .orderBy(sortField, sortOrder);

    query = this.applySearchToQuery(query, { searchQuery, searchId });
    query = this.applyFiltersToQuery(query, { ...filters });

    if (fields[0] === '*' || fields.includes('taxDistrictsCount') || filters?.filterByTaxDistrict) {
      query = query.leftJoin(
        defaultTaxDistrictsTableName,
        `${this.tableName}.id`,
        `${defaultTaxDistrictsTableName}.jobSiteId`,
      );

      selects.push(
        trx.raw('count(??.*) as ??', [defaultTaxDistrictsTableName, 'taxDistrictsCount']),
      );
    }

    if (fields[0] === '*' || fields.includes('polygon')) {
      fields.includes('polygon') && selects.splice(selects.indexOf('polygon'), 1);
      selects.push(
        trx.raw('st_asgeojson(??.??)::jsonb as ??', [this.tableName, 'polygon', 'polygon']),
      );
    }

    const items = await query.select(selects);

    return items?.map(item => this.mapFields(item, false)) ?? [];
  }

  async jobSitesCount({ condition = {}, skipFilteredTotal = false } = {}, trx = this.knex) {
    const [total, filteredTotal] = await Promise.all([
      this.count({}, trx),
      skipFilteredTotal ? Promise.resolve(undefined) : this.count({ condition }, trx),
    ]);

    return { total, filteredTotal };
  }

  async count(
    { condition: { filters, searchId, searchQuery, ...condition } = {} } = {},
    trx = this.knex,
  ) {
    let query = trx(this.tableName)
      .withSchema(this.schemaName)
      .where(unambiguousCondition(this.tableName, condition));

    query =
      searchId || searchQuery?.length >= 3
        ? query.countDistinct(`${this.tableName}.id`)
        : query.count(`${this.tableName}.id`);

    if (filters?.filterByTaxDistrict) {
      query = query.leftJoin(
        defaultTaxDistrictsTableName,
        `${this.tableName}.id`,
        `${defaultTaxDistrictsTableName}.jobSiteId`,
      );
    }

    query = this.applySearchToQuery(query, { searchId, searchQuery });
    query = this.applyFiltersToQuery(query, filters);

    const result = await query;

    return Number(result?.[0]?.count) || 0;
  }

  applySearchToQuery(originalQuery, { searchQuery }) {
    let query = originalQuery;

    query = query.andWhere(qb => {
      if (searchQuery) {
        qb.orWhere(`${this.tableName}.zip`, searchQuery);
        qb.orWhereRaw('LOWER(name) LIKE LOWER(?)', [`%${searchQuery}%`]);
      }

      if (searchQuery?.length >= 3) {
        qb.orWhereRaw('? <% ??.full_address', [searchQuery, this.tableName]).orderByRaw(
          '? <<-> ??.full_address',
          [searchQuery, this.tableName],
        );
      }
    });

    return query;
  }

  applyFiltersToQuery(
    originalQuery,
    {
      filterByAlleyPlacement,
      filterByCabOver,
      filterByTaxDistrict,
      filterByServiceArea,
      filterByZipCodes,
      filterByCity,
      filterByState,
      filterByCoordinates,
      filterByName,
    } = {},
  ) {
    let query = originalQuery;

    if (filterByAlleyPlacement != undefined) {
      query = query.andWhere(`${this.tableName}.alleyPlacement`, filterByAlleyPlacement);
    }

    if (filterByCabOver != undefined) {
      query = query.andWhere(`${this.tableName}.cabOver`, filterByCabOver);
    }

    if (filterByServiceArea?.length) {
      query = query.joinRaw(
        `inner join (select * from ??.?? where id in (??)) as sa
            on st_covers(sa.geometry, ??.location)`,
        [this.schemaName, ServiceAreaRepo.TABLE_NAME, filterByServiceArea, this.tableName],
      );
    }

    if (filterByTaxDistrict?.length) {
      query = query.whereIn(`${defaultTaxDistrictsTableName}.taxDistrictId`, filterByTaxDistrict);
    }

    if (filterByZipCodes?.length) {
      query = query.whereIn(`${this.tableName}.zip`, filterByZipCodes);
    }

    if (filterByCity) {
      query = query.andWhere(`${this.tableName}.city`, 'ilike', `%${filterByCity}%`);
    }

    if (filterByState) {
      query = query.andWhere(`${this.tableName}.state`, 'ilike', `%${filterByState}%`);
    }

    if (filterByCoordinates) {
      query = query.andWhere(`${this.tableName}.coordinates`, filterByCoordinates);
    }

    if (filterByName) {
      query = query.andWhere(`${this.tableName}.name`, 'ilike', `%${filterByName}%`);
    }

    return query;
  }

  async refreshDefaultTaxDistrictsOnLocationChange(
    { jobSiteId, newLocation, isCreating },
    trx = this.knex,
  ) {
    const { region } = await TenantRepository.getInstance(this.ctxState).getBy({
      condition: { name: this.ctxState.user.tenantName },
      fields: ['region'],
    });

    const features = await getContainingFeatures(newLocation, region ?? REGION.usa);
    const districtCodes = uniq(map(features, 'id'));

    const applicableTaxDistricts = await TaxDistrictRepository.getInstance(this.ctxState).getBy(
      {
        condition: builder =>
          builder
            .whereIn('districtCode', districtCodes)
            .orWhere('districtType', DISTRICT_TYPE.country),
        orderBy: ['districtType'],
      },
      trx,
    );

    if (!isCreating) {
      await trx(virtualTaxDistrictsTableName)
        .withSchema(this.schemaName)
        .delete()
        .where('jobSiteId', jobSiteId);
    }

    let virtualDistricts;

    if (isEmpty(applicableTaxDistricts)) {
      virtualDistricts = districtCodes;
    } else {
      const existingCodes = applicableTaxDistricts.map(({ districtCode }) => Number(districtCode));
      virtualDistricts = districtCodes.filter(code => !existingCodes.includes(code));
    }

    const defaultDistrictIds = map(applicableTaxDistricts, 'id');

    await Promise.all([
      isEmpty(virtualDistricts)
        ? Promise.resolve()
        : trx(virtualTaxDistrictsTableName)
            .withSchema(this.schemaName)
            .insert(
              virtualDistricts.map(taxDistrictCode => ({
                jobSiteId,
                taxDistrictCode,
              })),
            ),
      isEmpty(defaultDistrictIds)
        ? Promise.resolve()
        : this.updateDefaultTaxDistricts({ jobSiteId, taxDistrictIds: defaultDistrictIds }, trx),
    ]);

    return applicableTaxDistricts.filter(district => district.active);
  }

  async updateDefaultTaxDistricts({ jobSiteId, taxDistrictIds, log }, outerTrx) {
    const trx = outerTrx ?? (await this.knex.transaction());
    try {
      await trx(defaultTaxDistrictsTableName)
        .withSchema(this.schemaName)
        .where({ jobSiteId })
        .delete();

      if (!isEmpty(taxDistrictIds)) {
        await trx(defaultTaxDistrictsTableName)
          .withSchema(this.schemaName)
          .insert(taxDistrictIds.map(taxDistrictId => ({ jobSiteId, taxDistrictId })));
      }

      const linkedTable = CustomerJobSitePairRepo.TABLE_NAME;

      const pairs = await trx(this.tableName)
        .withSchema(this.schemaName)
        .select(`${linkedTable}.id as id`)
        .innerJoin(linkedTable, `${linkedTable}.jobSiteId`, `${this.tableName}.id`)
        .where(`${this.tableName}.id`, jobSiteId);

      if (pairs) {
        const pairRepo = CustomerJobSitePairRepo.getInstance(this.ctxState);
        for (const pair of pairs) {
          await pairRepo.updateDefaultTaxDistricts(
            {
              pairId: pair.id,
              taxDistrictIds,
              log,
            },
            trx,
          );
        }
      }

      if (!outerTrx) {
        await trx.commit();
      }
    } catch (error) {
      if (!outerTrx) {
        await trx.rollback();
      }

      throw error;
    }

    // log && this.log({ id: jobSiteId, action: this.logAction.modify });
  }

  async materializeVirtualTaxDistrict({ taxDistrictId, districtCode }, trx = this.knex) {
    const removedVirtual = await trx(virtualTaxDistrictsTableName)
      .withSchema(this.schemaName)
      .delete()
      .where('taxDistrictCode', districtCode)
      .returning('*');

    if (isEmpty(removedVirtual)) {
      return null;
    }

    const affectedJobSites = map(removedVirtual, 'jobSiteId');

    await trx(defaultTaxDistrictsTableName)
      .withSchema(this.schemaName)
      .insert(affectedJobSites.map(jobSiteId => ({ jobSiteId, taxDistrictId })));

    return affectedJobSites;
  }

  async getDefaultTaxDistricts({ jobSiteId, activeOnly }, trx = this.knex) {
    const condition = {
      ids: trx(defaultTaxDistrictsTableName)
        .withSchema(this.schemaName)
        .select('taxDistrictId')
        .where('jobSiteId', jobSiteId),
    };

    if (activeOnly) {
      condition.active = true;
    }

    const applicableTaxDistricts = await TaxDistrictRepository.getInstance(this.ctxState).getBy(
      {
        condition,
        orderBy: ['districtType', 'id'],
      },
      trx,
    );

    return applicableTaxDistricts || null;
  }

  async getByPopulated({ condition: { id }, fields = ['*'] }, trx = this.knex) {
    const item = await trx(this.tableName)
      .withSchema(this.schemaName)
      .select(
        fields
          .map(field => `${this.tableName}.${field}`)
          .concat(
            trx.raw('to_json(??.*) as ??', [ContactRepository.TABLE_NAME, 'contact']),
            trx.raw('json_agg(??.*) as ??', [PhoneNumberRepository.TABLE_NAME, 'phoneNumbers']),
            trx.raw('to_json(??.*) as ??', [ContractorRepository.TABLE_NAME, 'contractor']),
          ),
        PhoneNumberRepository,
      )
      .leftJoin(
        `${ContactRepository.TABLE_NAME}`,
        `${this.tableName}.contactId`,
        `${ContactRepository.TABLE_NAME}.id`,
      )
      .leftJoin(
        PhoneNumberRepository.TABLE_NAME,
        `${PhoneNumberRepository.TABLE_NAME}.contactId`,
        `${this.tableName}.contactId`,
      )
      .leftJoin(
        ContractorRepository.TABLE_NAME,
        `${ContractorRepository.TABLE_NAME}.contactId`,
        `${this.tableName}.contactId`,
      )
      .where(`${this.tableName}.id`, id)
      .groupBy(
        `${this.tableName}.id`,
        `${ContactRepository.TABLE_NAME}.id`,
        `${PhoneNumberRepository.TABLE_NAME}.id`,
        `${ContractorRepository.TABLE_NAME}.id`,
      )
      .orderBy(`${this.tableName}.id`)
      .first();

    return item ? this.mapContractorContact(item) : null;
  }

  async getLinkedWithCustomerPopulated(
    { condition: { customerId, active }, skip = 0, limit = 100, fields = ['*'] } = {},
    trx = this.knex,
  ) {
    const linkedTable = CustomerJobSitePairRepo.TABLE_NAME;
    const selects = fields.map(field => `${this.tableName}.${field}`);

    const condition = { customerId };
    selects.push(`${linkedTable}.active`);

    if (active) {
      condition[`${linkedTable}.active`] = true;
    }

    selects.push(
      trx.raw('to_json(??.*) as ??', [ContactRepository.TABLE_NAME, 'contact']),
      trx.raw('json_agg(??.*) as ??', [PhoneNumberRepository.TABLE_NAME, 'phoneNumbers']),
      trx.raw('to_json(??.*) as ??', [ContractorRepository.TABLE_NAME, 'contractor']),
    );

    const items = await trx(this.tableName)
      .withSchema(this.schemaName)
      .select(selects)
      .innerJoin(linkedTable, `${linkedTable}.jobSiteId`, `${this.tableName}.id`)
      .leftJoin(
        `${ContactRepository.TABLE_NAME}`,
        `${this.tableName}.contactId`,
        `${ContactRepository.TABLE_NAME}.id`,
      )
      .leftJoin(
        PhoneNumberRepository.TABLE_NAME,
        `${PhoneNumberRepository.TABLE_NAME}.contactId`,
        `${this.tableName}.contactId`,
      )
      .leftJoin(
        ContractorRepository.TABLE_NAME,
        `${ContractorRepository.TABLE_NAME}.contactId`,
        `${this.tableName}.contactId`,
      )
      .where(unambiguousCondition(linkedTable, condition))
      .groupBy(
        `${this.tableName}.id`,
        `${linkedTable}.id`,
        `${ContactRepository.TABLE_NAME}.id`,
        `${ContractorRepository.TABLE_NAME}.id`,
      )
      .limit(limit)
      .offset(skip)
      .orderBy(`${this.tableName}.id`);

    return items?.map(this.mapContractorContact.bind(this)) ?? [];
  }

  async countLinkedWithCustomerPopulated(
    { condition: { customerId, active } } = {},
    trx = this.knex,
  ) {
    const linkedTable = CustomerJobSitePairRepo.TABLE_NAME;
    const condition = { customerId };
    if (active) {
      condition[`${linkedTable}.active`] = true;
    }

    const [result] = await trx(this.tableName)
      .withSchema(this.schemaName)
      .innerJoin(linkedTable, `${linkedTable}.jobSiteId`, `${this.tableName}.id`)
      .where(unambiguousCondition(linkedTable, condition))
      .count(`${this.tableName}.id`);

    return Number(result?.count) || 0;
  }

  async getByIdToLog(id, trx = this.knex) {
    let query = super.getByIdQuery(id, trx);

    const selects = [`${this.tableName}.*`];
    const jtName = ContactRepository.TABLE_NAME;
    const joinedTableColumns = await ContactRepository.getColumnsToSelect({
      alias: 'contact',
      tableName: jtName,
      schemaName: this.schemaName,
    });

    selects.push(...joinedTableColumns);
    query = query.leftJoin(jtName, `${jtName}.id`, `${this.tableName}.contactId`);

    const item = await query.select(selects);

    return item ? compose(this.mapContractorContact.bind(this), super.mapJoinedFields)(item) : null;
  }

  jobSitesSortBy(sortBy) {
    const sortedFields = {
      id: `${this.tableName}.id`,
      city: `${this.tableName}.city`,
      state: `${this.tableName}.state`,
      zip: `${this.tableName}.zip`,
    };
    return sortedFields[sortBy] || sortedFields.id;
  }

  checkForDuplicateByCoords([longitude, latitude]) {
    return this.knex(this.tableName)
      .withSchema(this.schemaName)
      .whereRaw(
        `ST_Distance( 'SRID=4326;POINT(${longitude} ${latitude})'::geography, "${this.tableName}"."location"::geography ) <= 0.000001`,
      )
      .first();
  }

  getJobSiteByRefNumbers({ condition = {}, refNumbers, fields = ['*'] }, trx = this.knex) {
    return trx(this.tableName)
      .withSchema(this.schemaName)
      .select(fields)
      .whereIn(`${this.tableName}.referenceNumber`, refNumbers)
      .where(condition);
  }
}

JobSiteRepository.TABLE_NAME = TABLE_NAME;

export default JobSiteRepository;
