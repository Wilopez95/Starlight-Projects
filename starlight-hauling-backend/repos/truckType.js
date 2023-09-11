import compose from 'lodash/fp/compose.js';

import ApiError from '../errors/ApiError.js';
import VersionedRepository from './_versioned.js';
import TruckTypeBusinessLinePairRepo from './truckTypeBusinessLinePair.js';
import TruckTypeMaterialPairRepo from './truckTypeMaterialPair.js';
import TruckTypeEquipmentItemPairRepo from './truckTypeEquipmentItemPair.js';
import BusinessLineRepository from './businessLine.js';
import MaterialRepository from './material.js';
import EquipmentItemRepository from './equipmentItem.js';
import TruckRepository from './truck.js';

const TABLE_NAME = 'truck_types';
const truckTypeBusinessLinePairTableName = TruckTypeBusinessLinePairRepo.TABLE_NAME;
const truckTypeMaterialPairTableName = TruckTypeMaterialPairRepo.TABLE_NAME;
const truckTypeEquipmentItemPairTableName = TruckTypeEquipmentItemPairRepo.TABLE_NAME;
const businessLineTableName = BusinessLineRepository.TABLE_NAME;
const materialTableName = MaterialRepository.TABLE_NAME;
const equipmentItemTableName = EquipmentItemRepository.TABLE_NAME;

const businessLineNamesKey = 'businessLineNames';
const deactivateError =
  'pages.SystemConfiguration.tables.TruckType.QuickView.ServerErrors.DeactivateError';

class TruckTypeRepository extends VersionedRepository {
  constructor(ctxState, { schemaName }) {
    super(ctxState, { schemaName, tableName: TABLE_NAME });
  }

  async getAllPaginated({ activeOnly, skip, limit, sortOrder, sortBy } = {}) {
    const condition = {};
    if (activeOnly) {
      condition[`${this.tableName}.active`] = true;
    }

    const orderBy =
      sortBy === businessLineNamesKey
        ? `"${businessLineNamesKey}"`
        : `${this.tableName}.${sortBy ?? 'id'}`;

    let query = this.knex(this.tableName)
      .withSchema(this.schemaName)
      .select([
        `${this.tableName}.*`,
        this.knex.raw(`array_agg(json_build_object(
                    'name', ${businessLineTableName}.name,
                    'id', ${businessLineTableName}.id
                )) as "businessLines"`),
        this.knex.raw(`string_agg(
                    ${businessLineTableName}.name, ', ' order by ${businessLineTableName}.name
                ) as "${businessLineNamesKey}"`),
      ])
      .leftJoin(
        truckTypeBusinessLinePairTableName,
        `${this.tableName}.id`,
        `${truckTypeBusinessLinePairTableName}.truck_type_id`,
      )
      .leftJoin(
        businessLineTableName,
        `${truckTypeBusinessLinePairTableName}.business_line_id`,
        `${businessLineTableName}.id`,
      )
      .groupBy(`${this.tableName}.id`)
      .orderByRaw(`${orderBy} ${sortOrder}`)
      .where(condition);

    if (limit) {
      query = query.limit(limit).offset(skip);
    }

    const items = await query;

    return items?.map(item => this.mapFields(item, false)) ?? [];
  }

  async getById({ id }, trx = this.knex) {
    const subQuery = trx(this.tableName)
      .withSchema(this.schemaName)
      .select([
        `${this.tableName}.*`,
        trx.raw(`json_build_object(
                    'name', ${businessLineTableName}.name,
                    'id', ${businessLineTableName}.id,
                    'materials', COALESCE(
                        json_agg(distinct jsonb_build_object(
                            'id', ${truckTypeMaterialPairTableName}.material_id,
                            'description', ${materialTableName}.description
                        ))
                        FILTER (
                            WHERE ${truckTypeMaterialPairTableName}.material_id IS NOT NULL
                            AND ${businessLineTableName}.id =
                            ${materialTableName}.business_line_id
                        ),
                        '[]'
                    ),
                    'equipments', COALESCE(
                        json_agg(distinct jsonb_build_object(
                            'id', ${truckTypeEquipmentItemPairTableName}.equipment_item_id,
                            'description', ${equipmentItemTableName}.description,
                            'short_description', ${equipmentItemTableName}.short_description
                        ))
                        FILTER (
                            WHERE ${truckTypeEquipmentItemPairTableName}.equipment_item_id
                            IS NOT NULL
                            AND ${businessLineTableName}.id =
                            ${equipmentItemTableName}.business_line_id
                        ),
                        '[]'
                    )
                ) as business_line`),
      ])
      .leftJoin(
        truckTypeBusinessLinePairTableName,
        `${this.tableName}.id`,
        `${truckTypeBusinessLinePairTableName}.truck_type_id`,
      )
      .leftJoin(
        businessLineTableName,
        `${truckTypeBusinessLinePairTableName}.business_line_id`,
        `${businessLineTableName}.id`,
      )
      .leftJoin(
        truckTypeMaterialPairTableName,
        `${this.tableName}.id`,
        `${truckTypeMaterialPairTableName}.truck_type_id`,
      )
      .leftJoin(
        materialTableName,
        `${truckTypeMaterialPairTableName}.material_id`,
        `${materialTableName}.id`,
      )
      .leftJoin(
        truckTypeEquipmentItemPairTableName,
        `${this.tableName}.id`,
        `${truckTypeEquipmentItemPairTableName}.truck_type_id`,
      )
      .leftJoin(
        equipmentItemTableName,
        `${truckTypeEquipmentItemPairTableName}.equipment_item_id`,
        `${equipmentItemTableName}.id`,
      )
      .where(`${this.tableName}.id`, id)
      .groupBy(
        `${this.tableName}.id`,
        `${businessLineTableName}.id`,
        `${businessLineTableName}.name`,
      )
      .orderBy(`${this.tableName}.id`)
      .as('total');

    const resItem = await trx('total')
      .select([
        'total.id',
        'total.active',
        'total.description',
        'total.created_at',
        'total.updated_at',
        this.knex.raw(`json_agg(total.business_line) as business_lines`),
      ])
      .from(subQuery)
      .orderBy(`total.id`)
      .groupBy([
        'total.id',
        'total.active',
        'total.description',
        'total.created_at',
        'total.updated_at',
      ])
      .first();

    return resItem ?? ApiError.notFound();
  }

  async createOne({ data, log }, trx) {
    const { businessLines, ...body } = data;
    const _trx = trx || (await this.knex.transaction());

    try {
      const { id: truckTypeId } = await super.createOne(
        {
          data: {
            ...body,
          },
          log,
        },
        _trx,
      );

      await this.createTruckTypeRelations(businessLines, truckTypeId, _trx);

      const result = await this.getById({ id: truckTypeId }, _trx);

      if (!trx) {
        await _trx.commit();
      }

      return result;
    } catch (error) {
      if (!trx) {
        await _trx.rollback();
      }

      throw error;
    }
  }

  async updateOne({ data, id, log }, trx) {
    const { active, businessLines, ...body } = data;
    const _trx = trx || (await this.knex.transaction());

    try {
      if (!active) {
        const activeTrucksCount = await TruckRepository.getInstance(
          this.ctxState,
        ).trucksRelatedToTruckTypesCount(id);

        if (activeTrucksCount > 0) {
          throw ApiError.invalidRequest(deactivateError);
        }
      }
      await TruckTypeBusinessLinePairRepo.getInstance(this.ctxState).deleteBy(
        {
          condition: {
            truckTypeId: id,
          },
        },
        _trx,
      );
      await TruckTypeMaterialPairRepo.getInstance(this.ctxState).deleteBy(
        {
          condition: {
            truckTypeId: id,
          },
        },
        _trx,
      );
      await TruckTypeEquipmentItemPairRepo.getInstance(this.ctxState).deleteBy(
        {
          condition: {
            truckTypeId: id,
          },
        },
        _trx,
      );

      await this.createTruckTypeRelations(businessLines, id, _trx);

      await this.updateBy(
        {
          condition: { id },
          data: {
            ...body,
            active,
          },
          log: false,
        },
        _trx,
      );

      const result = await this.getById({ id }, _trx);
      log && this.log({ id, action: this.logAction.modify });

      if (!trx) {
        await _trx.commit();
      }

      return result;
    } catch (error) {
      if (!trx) {
        await _trx.rollback();
      }

      throw error;
    }
  }

  async containActiveTrucks(truckTypeId) {
    const activeTrucks = await TruckRepository.getInstance(this.ctxState).getAllPaginated({
      limit: 1,
      activeOnly: true,
      condition: {
        filters: {
          filterByTruckType: [truckTypeId],
        },
      },
    });

    return activeTrucks.length > 0;
  }

  async createRelationsWithMaterials(materialsIds, truckTypeId, trx) {
    if (materialsIds.length) {
      await TruckTypeMaterialPairRepo.getInstance(this.ctxState).insertMany(
        {
          data: materialsIds.map(materialId => ({
            materialId,
            truckTypeId,
          })),
        },
        trx,
      );
    }
  }

  async createRelationsWithEquipmentItems(equipmentItemsIds, truckTypeId, trx) {
    if (equipmentItemsIds.length) {
      await TruckTypeEquipmentItemPairRepo.getInstance(this.ctxState).insertMany(
        {
          data: equipmentItemsIds.map(equipmentItemId => ({
            equipmentItemId,
            truckTypeId,
          })),
        },
        trx,
      );
    }
  }

  async createTruckTypeRelations(businessLines, truckTypeId, trx) {
    const { businessLineIds, materialsIds, equipmentItemsIds } = businessLines.reduce(
      (res, curr) => {
        res.businessLineIds.push(curr.id);
        res.materialsIds.push(...(curr.materialsIds ?? []));
        res.equipmentItemsIds.push(...(curr.equipmentItemsIds ?? []));
        return res;
      },
      {
        businessLineIds: [],
        materialsIds: [],
        equipmentItemsIds: [],
      },
    );

    await TruckTypeBusinessLinePairRepo.getInstance(this.ctxState).insertMany(
      {
        data: businessLineIds.map(businessLineId => ({
          businessLineId,
          truckTypeId,
        })),
      },
      trx,
    );

    await this.createRelationsWithMaterials(materialsIds, truckTypeId, trx);
    await this.createRelationsWithEquipmentItems(equipmentItemsIds, truckTypeId, trx);
  }

  async getByIdToLog(id, trx = this.knex) {
    const truckType = await this.getById({ id }, trx);

    return truckType ? compose(super.mapFields, super.camelCaseKeys)(truckType) : null;
  }
}

TruckTypeRepository.TABLE_NAME = TABLE_NAME;

export default TruckTypeRepository;
