import { startOfMonth } from 'date-fns';
import compose from 'lodash/fp/compose.js';

import { camelCaseKeys, unambiguousSelect } from '../utils/dbHelpers.js';
import { SORT_ORDER } from '../consts/sortOrders.js';
import VersionedRepository from './_versioned.js';

import TruckTypeCostRepo from './truckTypeCost.js';
import TruckCostRepo from './truckCost.js';
import DriverCostRepo from './driverCost.js';

const TABLE_NAME = 'truck_driver_general_costs';

class TruckDriverCostsRepository extends VersionedRepository {
  constructor(ctxState, { schemaName }) {
    super(ctxState, { schemaName, tableName: TABLE_NAME });
  }

  mapFields(originalObj) {
    return compose(
      obj => {
        if (!obj.truckTypeCosts?.[0]) {
          obj.truckTypeCosts = [];
        } else {
          obj.truckTypeCosts = obj.truckTypeCosts.map(camelCaseKeys);
        }

        if (!obj.truckCosts?.[0]) {
          obj.truckCosts = [];
        } else {
          obj.truckCosts = obj.truckCosts.map(camelCaseKeys);
        }

        if (!obj.driverCosts?.[0]) {
          obj.driverCosts = [];
        } else {
          obj.driverCosts = obj.driverCosts.map(camelCaseKeys);
        }

        return obj;
      },
      super.camelCaseKeys,
      super.mapFields,
    )(originalObj);
  }

  getAllPaginatedQuery(
    { condition, detailed = false, activeOnly = false, fields = ['*'], skip = 0, limit = 100 } = {},
    trx = this.knex,
  ) {
    if (condition.date) {
      condition.date = startOfMonth(condition.date);
    }
    const query = trx(this.tableName)
      .withSchema(this.schemaName)
      .limit(limit)
      .offset(skip)
      .where(condition);
    const select = unambiguousSelect(this.tableName, fields);

    if (activeOnly) {
      const date = startOfMonth(Date.now());
      query.andWhere('date', '>=', date);
    }

    if (detailed) {
      const truckTypeCosts = TruckTypeCostRepo.TABLE_NAME;
      const truckCosts = TruckCostRepo.TABLE_NAME;
      const driverCosts = DriverCostRepo.TABLE_NAME;

      query.joinRaw(
        `
                    left join (
                        select json_agg(gr.*) as ??, gr.general_cost_id from ??.?? as gr
                        group by gr.general_cost_id
                    ) as ?? on ??.general_cost_id = "${this.tableName}".id
                `,
        ['truckTypeCosts', this.schemaName, truckTypeCosts, 'trc', 'trc'],
      );
      query.joinRaw(
        `
                    left join (
                        select json_agg(gr.*) as ??, gr.general_cost_id from ??.?? as gr
                        group by gr.general_cost_id
                    ) as ?? on ??.general_cost_id = "${this.tableName}".id
                `,
        ['truckCosts', this.schemaName, truckCosts, 'tc', 'tc'],
      );
      query.joinRaw(
        `
                    left join (
                        select json_agg(gr.*) as ??, gr.general_cost_id from ??.?? as gr
                        group by gr.general_cost_id
                    ) as ?? on ??.general_cost_id = "${this.tableName}".id
                `,
        ['driverCosts', this.schemaName, driverCosts, 'dc', 'dc'],
      );

      select.push('trc.truckTypeCosts', 'tc.truckCosts', 'dc.driverCosts');
    }

    return query
      .select(select)
      .orderBy('date', SORT_ORDER.desc)
      .orderByRaw('business_unit_id asc nulls first');
  }

  async createOne({ data, fields = ['*'], log }, trx) {
    const _trx = trx || (await this.knex.transaction());
    const { truckTypeCosts, truckCosts, driverCosts, ...generalData } = data;
    let costs;

    generalData.date = startOfMonth(data.date);
    try {
      costs = await super.createOne({ data: generalData, fields, log }, _trx);

      await Promise.all([
        TruckTypeCostRepo.getInstance(this.ctxState).upsertItems(
          {
            data: truckTypeCosts?.length ? truckTypeCosts : [],
            condition: { generalCostId: costs.id },
            fields: [],
          },
          _trx,
        ),

        TruckCostRepo.getInstance(this.ctxState).upsertItems(
          {
            data: truckCosts?.length ? truckCosts : [],
            condition: { generalCostId: costs.id },
            fields: [],
          },
          _trx,
        ),
        DriverCostRepo.getInstance(this.ctxState).upsertItems(
          {
            data: driverCosts?.length ? driverCosts : [],
            condition: { generalCostId: costs.id },
            fields: [],
          },
          _trx,
        ),
      ]);

      if (!trx) {
        await _trx.commit();
      }
    } catch (error) {
      if (!trx) {
        await _trx.rollback();
      }
      throw error;
    }

    return this.getPopulatedById({ id: costs?.id });
  }

  async getAllPaginated({
    condition,
    activeOnly = false,
    detailed = false,
    skip = 0,
    limit = 25,
    fields = ['*'],
  } = {}) {
    const costs = await this.getAllPaginatedQuery({
      condition,
      activeOnly,
      detailed,
      skip,
      limit,
      fields,
    });

    return costs?.map(this.mapFields) ?? [];
  }

  async updateOne({ id, data, fields = ['*'], concurrentData, log }, trx) {
    const _trx = trx || (await this.knex.transaction());
    const { truckTypeCosts, truckCosts, driverCosts, ...generalData } = data;
    let costs;

    try {
      costs = await super.updateBy(
        { condition: { id }, data: generalData, fields, concurrentData, log },
        _trx,
      );

      await Promise.all([
        TruckTypeCostRepo.getInstance(this.ctxState).upsertItems(
          {
            data: truckTypeCosts?.length ? truckTypeCosts : [],
            condition: { generalCostId: costs.id },
            fields: [],
          },
          _trx,
        ),
        TruckCostRepo.getInstance(this.ctxState).upsertItems(
          {
            data: truckCosts?.length ? truckCosts : [],
            condition: { generalCostId: costs.id },
            fields: [],
          },
          _trx,
        ),
        DriverCostRepo.getInstance(this.ctxState).upsertItems(
          {
            data: driverCosts?.length ? driverCosts : [],
            condition: { generalCostId: costs.id },
            fields: [],
          },
          _trx,
        ),
      ]);

      if (!trx) {
        await _trx.commit();
      }
    } catch (error) {
      if (!trx) {
        await _trx.rollback();
      }
      throw error;
    }

    return this.getPopulatedById({ id });
  }

  async getPopulatedById({ id, fields = ['*'] } = {}, trx = this.knex) {
    const item = await this.getAllPaginatedQuery(
      {
        condition: { [`${this.tableName}.id`]: id },
        detailed: true,
        fields,
        skip: 0,
        limit: 1,
      },
      trx,
    );

    return item?.[0] ? this.mapFields(item[0]) : null;
  }
}

TruckDriverCostsRepository.TABLE_NAME = TABLE_NAME;

export default TruckDriverCostsRepository;
