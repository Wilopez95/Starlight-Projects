import { unambiguousSelect } from '../utils/dbHelpers.js';

import { BUSINESS_LINE_TYPE } from '../consts/businessLineTypes.js';
import { LINE_ITEM_TYPE } from '../consts/lineItemTypes.js';
import { LINE_ITEM_UNIT, THRESHOLD_UNIT, UNIT } from '../consts/units.js';
import {
  DEFAULT_DUMP_SERVICE_DESCRIPTION,
  DEFAULT_EQUIPMENT_DESCRIPTION,
  DEFAULT_LOAD_SERVICE_DESCRIPTION,
  DUMP_THRESHOLD_DESCRIPTION,
  LOAD_THRESHOLD_DESCRIPTION,
} from '../consts/recycling.js';
import { EQUIPMENT_TYPE } from '../consts/equipmentTypes.js';
import { THRESHOLD_TYPE } from '../consts/thresholdTypes.js';
import { RECYCLING_ACTION } from '../consts/actions.js';
import BillableServiceRepo from './billableService.js';
import ThresholdRepo from './threshold.js';
import BillableLineItemRepo from './billableLineItem.js';
import EquipmentItemRepo from './equipmentItem.js';
import TaxDistrictRepo from './taxDistrict.js';
import BusinessUnitLineRepository from './businessUnitLine.js';
import BaseRepository from './_base.js';

const TABLE_NAME = 'business_lines';

class BusinessLineRepository extends BaseRepository {
  constructor(ctxState, { schemaName }) {
    super(ctxState, { schemaName, tableName: TABLE_NAME });
  }

  async createOne({ data, fields = ['*'], log } = {}, trx) {
    const _trx = trx || (await this.knex.transaction());

    let businessLine;
    try {
      businessLine = await super.createOne({ data, fields, log: false }, _trx);

      const { id } = businessLine;
      await TaxDistrictRepo.getInstance(this.ctxState).initTaxesForNewBusinessLine(
        { condition: { businessLineId: id } },
        _trx,
      );

      if (data.type === BUSINESS_LINE_TYPE.recycling) {
        await this.seedRecyclingLoBDefaultSetup({ businessLineId: businessLine.id }, _trx);
      } else {
        // TODO: integrate new pricing here!
        await BillableLineItemRepo.getInstance(this.ctxState).createOneTime(
          {
            data: {
              businessLineId: id,
              active: true,
              description: 'Trip Charge',
              type: LINE_ITEM_TYPE.tripCharge,
              unit: LINE_ITEM_UNIT.each,
            },
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
    if (businessLine) {
      log && this.log({ id: businessLine.id, action: this.logAction.create });
    }
    return businessLine;
  }

  async seedRecyclingLoBDefaultSetup({ businessLineId }, trx) {
    const [equipmentItem] = await Promise.all([
      EquipmentItemRepo.getInstance(this.ctxState).createOne(
        {
          data: {
            businessLineId,
            customerOwned: false,
            description: DEFAULT_EQUIPMENT_DESCRIPTION,
            shortDescription: DEFAULT_EQUIPMENT_DESCRIPTION,
            type: EQUIPMENT_TYPE.unspecified,
            size: 10,
            length: 1,
            width: 1,
            height: 1,
            emptyWeight: 1,
            recyclingDefault: true,
          },
          log: true,
        },
        trx,
      ),
      ThresholdRepo.getInstance(this.ctxState).insertMany(
        {
          data: [
            {
              type: THRESHOLD_TYPE.dump,
              description: DUMP_THRESHOLD_DESCRIPTION,
              unit: THRESHOLD_UNIT.ton,
              businessLineId,
            },
            {
              type: THRESHOLD_TYPE.load,
              description: LOAD_THRESHOLD_DESCRIPTION,
              unit: THRESHOLD_UNIT.ton,
              businessLineId,
            },
          ],
        },
        trx,
      ),
    ]);

    await BillableServiceRepo.getInstance(this.ctxState).insertMany(
      {
        data: [
          {
            businessLineId,
            equipmentItemId: equipmentItem.id,
            action: RECYCLING_ACTION.dump,
            unit: UNIT.each,
            description: DEFAULT_DUMP_SERVICE_DESCRIPTION,
          },
          {
            businessLineId,
            equipmentItemId: equipmentItem.id,
            action: RECYCLING_ACTION.load,
            unit: UNIT.each,
            description: DEFAULT_LOAD_SERVICE_DESCRIPTION,
          },
        ],
        log: true,
      },
      trx,
    );
  }

  static async getSchemaByBlId(id, trx = this.knex) {
    const getById = schema =>
      trx(TABLE_NAME).withSchema(schema).where({ id }).select(['id']).first();

    // TODO: must be improved via extending Trash API with multi-tenancy param
    const schemata = await trx('schemata')
      .withSchema('information_schema')
      .select('schema_name')
      .whereNotIn('schema_name', ['information_schema', 'admin', 'public'])
      .andWhere('schema_name', 'not ilike', 'pg_%');

    if (!schemata?.length) {
      return null;
    }

    const results = await Promise.allSettled(
      schemata.map(({ schemaName: schema }) => getById(schema)),
    );

    const i = results?.findIndex(({ status, value }) => status === 'fulfilled' && value) ?? -1;
    return i !== -1 ? schemata[i].schemaName : null;
  }

  async isRollOff(id, trx = this.knex) {
    const businessLine = await super.getById({ id, fields: ['type'] }, trx);
    return businessLine.type === BUSINESS_LINE_TYPE.rollOff;
  }

  async getAll({ condition = {}, fields = ['*'], orderBy = [] } = {}, trx = this.knex) {
    const { active, businessUnitId } = condition;

    let query = trx(this.tableName).withSchema(this.schemaName);

    query = this.applyFilters(query, { active, businessUnitId });

    const result = await query.select(unambiguousSelect(this.tableName, fields)).orderBy(orderBy);

    return result;
  }

  applyFilters(query, { active, businessUnitId }) {
    const bUnitLineTable = BusinessUnitLineRepository.TABLE_NAME;

    let queryWithFilters = query;

    if (businessUnitId) {
      queryWithFilters = queryWithFilters
        .select([`${bUnitLineTable}.billingCycle`, `${bUnitLineTable}.billingType`])
        .innerJoin(bUnitLineTable, `${bUnitLineTable}.businessLineId`, `${this.tableName}.id`)
        .where(`${bUnitLineTable}.businessUnitId`, businessUnitId);
    }

    if (active !== undefined) {
      queryWithFilters = queryWithFilters.where(`${this.tableName}.active`, active);
    }

    return queryWithFilters;
  }
}

BusinessLineRepository.TABLE_NAME = TABLE_NAME;

export default BusinessLineRepository;
