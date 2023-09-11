import omit from 'lodash/omit.js';
import isEmpty from 'lodash/isEmpty.js';
import compose from 'lodash/fp/compose.js';

import { toGeoJson, covers, intersects, fromGeoToJsonAs } from '../utils/postgis.js';
import { unambiguousCondition } from '../utils/dbHelpers.js';
import { SORT_ORDER } from '../consts/sortOrders.js';
import ApiError from '../errors/ApiError.js';
import VersionedRepository from './_versioned.js';
import JobSiteRepo from './jobSite.js';
import ServiceAreaCustomRateGroup from './serviceAreaCustomRatesGroup.js';
import SubscriptionsRepo from './subscription/subscription.js';
import OrderRepo from './order.js';
import CustomRatesGroupRepo from './customRatesGroup.js';

const TABLE_NAME = 'service_areas';

const fieldWithGeometry = ['*', fromGeoToJsonAs(VersionedRepository.knex, 'geometry')];

class ServiceAreaRepository extends VersionedRepository {
  constructor(ctxState, { schemaName }) {
    super(ctxState, { schemaName, tableName: TABLE_NAME });
    this.upsertOnConflict = `
            business_unit_id,
            business_line_id,
            coalesce(name, null::text)
        `;
  }

  async createOne({ data, fields = ['*'], log } = {}, trx) {
    const geometryRaw = data.geometry;
    const { businessLineId, businessUnitId } = data;
    const condition = {
      businessUnitId,
      businessLineId,
      active: true,
    };
    let serviceArea;

    const _trx = trx || (await this.knex.transaction());

    try {
      data.geometry = toGeoJson(_trx, data.geometry);

      const checkIntersect = intersects(_trx, data.geometry, 'geometry');
      const isIntersect = await super
        .getBy({ condition, fields: 'id' }, _trx)
        .andWhere(checkIntersect);

      if (!isEmpty(isIntersect)) {
        throw ApiError.invalidRequest(
          'polygon is intersected by another',
          `polygon is intersected by service area with id ${isIntersect.id}`,
        );
      }

      serviceArea = await super.createOne({ data, fields, log }, _trx);

      if (!trx) {
        await _trx.commit();
      }
    } catch (error) {
      if (!trx) {
        await _trx.rollback();
      }
      throw error;
    }

    serviceArea.geometry = geometryRaw;
    return serviceArea;
  }

  async updateBy({ condition = {}, data, fields = ['*'], log } = {}, trx) {
    let serviceArea;
    const _trx = trx || (await this.knex.transaction());

    try {
      data.geometry = data.geometry && toGeoJson(_trx, data.geometry);

      const { id } = condition;
      if (!data.active && id) {
        await CustomRatesGroupRepo.getInstance(this.ctxState).deactivateByServiceArea(
          { id, log },
          _trx,
        );
      }

      serviceArea = await super.updateBy({ condition, data, fields, log }, _trx);

      if (!trx) {
        await _trx.commit();
      }
    } catch (error) {
      if (!trx) {
        await _trx.rollback();
      }
      throw error;
    }

    delete serviceArea.geometry;
    return serviceArea;
  }

  async getAll({ condition, fields = fieldWithGeometry } = {}, trx = this.knex) {
    const items = await super.getAll({ condition, fields }, trx);
    return items;
  }

  async getAllPaginated(
    { condition, skip, limit, fields = fieldWithGeometry } = {},
    trx = this.knex,
  ) {
    const items = await super.getAllPaginated({ condition, skip, limit, fields }, trx);
    return items;
  }

  async getBy({ condition, fields = fieldWithGeometry } = {}, trx = this.knex) {
    const result = await super.getBy({ condition, fields }, trx);
    return result;
  }

  async matchServiceAreas(
    {
      condition: { active, jobSiteId, ...condition },
      fields = ['serviceAreaId', 'createdAt'],
    } = {},
    trx = this.knex,
  ) {
    const { jobSiteId: historicalJobSiteId } = await super.getLinkedHistoricalIds(
      { jobSiteId },
      { update: false },
      trx,
    );

    const ordersTable = `${this.schemaName}.${OrderRepo.TABLE_NAME}`;
    const subscriptionTable = `${this.schemaName}.${SubscriptionsRepo.TABLE_NAME}`;

    const latestServiceArea = await trx(ordersTable)
      .select(fields)
      .where({ ...condition, jobSiteId: historicalJobSiteId })
      .whereNotNull('serviceAreaId')
      .union(builder =>
        builder
          .select(fields)
          .where({ ...condition, jobSiteId: historicalJobSiteId })
          .whereNotNull('serviceAreaId')
          .from(subscriptionTable),
      )
      .as('serviceAreas')
      .orderBy('createdAt', SORT_ORDER.desc)
      .first();

    // eslint-disable-next-line eqeqeq
    const saCondition = active == undefined ? { ...condition } : { active, ...condition };
    if (!latestServiceArea) {
      return this.matchByJobSite({ condition: saCondition, jobSiteId });
    }
    const items = await this.getAll(
      {
        condition: saCondition,
        fields: ['id', 'active', 'name', 'description'],
      },
      trx,
    );

    const { serviceAreaId } = latestServiceArea;

    const serviceAreasHT = `${this.schemaName}.${ServiceAreaRepository.getHistoricalTableName()}`;

    const { originalId } =
      (await trx(serviceAreasHT).select('originalId').where({ id: serviceAreaId }).first()) ?? {};

    const matchedLatest = items.find(el => el.id === originalId);

    if (!matchedLatest) {
      return this.matchByJobSite({ condition: saCondition, jobSiteId });
    }

    const serviceAreas = {
      matched: [matchedLatest],
      unmatched: items.filter(el => el.id !== originalId),
    };

    return serviceAreas;
  }

  async matchByJobSite(
    { condition, jobSiteId, fields = ['id', 'active', 'name', 'description'] } = {},
    trx = this.knex,
  ) {
    const mappedFields = fields.map(field => `${TABLE_NAME}.${field}`);

    mappedFields.push(
      `${JobSiteRepo.TABLE_NAME}.location`,
      covers(this.knex, `${TABLE_NAME}.geometry`, `${JobSiteRepo.TABLE_NAME}.location`),
    );

    const result = await super
      .getAll(
        {
          condition: unambiguousCondition(this.tableName, condition),
          fields: mappedFields,
        },
        trx,
      )
      .leftJoin(JobSiteRepo.TABLE_NAME, `${JobSiteRepo.TABLE_NAME}.id`, jobSiteId);

    const serviceAreaMatch = {
      matched: [],
      unmatched: [],
    };

    if (isEmpty(result)) {
      return serviceAreaMatch;
    }

    if (!isEmpty(result) && !result[0].location) {
      throw ApiError.notFound('JobSite does not exist', `No JobSite exists with id ${jobSiteId}`);
    }

    const serviceAreas = result.reduce((acc, el) => {
      const filtered = ['matched', 'location'];

      if (el.matched) {
        acc.matched.push(omit(el, filtered));
        return acc;
      }
      acc.unmatched.push(omit(el, filtered));
      return acc;
    }, serviceAreaMatch);

    return serviceAreas;
  }

  async deleteBy({ condition: { id }, log }, trx) {
    const _trx = trx || (await this.knex.transaction());

    try {
      await CustomRatesGroupRepo.getInstance(this.ctxState).deactivateByServiceArea(
        { id, log },
        _trx,
      );

      await ServiceAreaCustomRateGroup.getInstance(this.ctxState).deleteBy(
        { condition: { serviceAreaId: id } },
        _trx,
      );

      await super.deleteBy({ condition: { id }, log }, _trx);

      if (!trx) {
        await _trx.commit();
      }
    } catch (error) {
      if (!trx) {
        await _trx.rollback();
      }
      throw error;
    }
  }

  async getByIdToLog(id, trx = this.knex) {
    const query = super.getByIdQuery(id, trx);

    const selects = [`${this.tableName}.*`, fromGeoToJsonAs(trx, 'geometry')];
    await super.populateBuBl({ query, selects });

    const item = await query.select(selects);

    return item ? compose(super.mapJoinedFields, super.camelCaseKeys)(item) : null;
  }
}

ServiceAreaRepository.TABLE_NAME = TABLE_NAME;

export default ServiceAreaRepository;
