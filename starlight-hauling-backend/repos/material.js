import compose from 'lodash/fp/compose.js';
import omit from 'lodash/omit.js';
import isEmpty from 'lodash/isEmpty.js';

import { camelCaseKeys, unambiguousCondition } from '../utils/dbHelpers.js';
import VersionedRepository from './_versioned.js';
import EquipmentItemRepository from './equipmentItem.js';
import MaterialEquipmentItemRepo from './materialEquipmentItem.js';
import BillableServiceRepository from './billableService.js';
import BusinessLineRepo from './businessLine.js';
import BusinessUnitLineRepository from './businessUnitLine.js';

// import { BUSINESS_LINE_TYPE } from '../consts/businessLineTypes.js';

const TABLE_NAME = 'materials';

class MaterialRepository extends VersionedRepository {
  constructor(ctxState, { schemaName }) {
    super(ctxState, { schemaName, tableName: TABLE_NAME });
    this.upsertConstraints = ['businessLineId', 'description'];
  }

  mapFields(originalObj) {
    return compose(
      obj => {
        if (!obj.equipmentItems?.[0]) {
          obj.equipmentItems = [];
        } else {
          obj.equipmentItems = obj.equipmentItems.map(camelCaseKeys);
        }
        if (!obj.equipmentItemIds?.[0]) {
          obj.equipmentItemIds = [];
        }
        if (!obj.equipmentShortDescriptions?.[0]) {
          obj.equipmentShortDescriptions = [];
        }
        return obj;
      },
      super.camelCaseKeys,
      super.mapFields,
    )(originalObj);
  }

  async createOne({ data, fields = ['*'], log }) {
    let material;
    const trx = await this.knex.transaction();

    try {
      material = await super.createOne({ data: omit(data, ['equipmentItemIds']), fields }, trx);

      const mappedIds = data.equipmentItemIds?.map(equipmentItemId => ({
        materialId: material.id,
        equipmentItemId,
      }));

      if (mappedIds?.length) {
        await MaterialEquipmentItemRepo.getInstance(this.ctxState).insertMany(
          { data: mappedIds, fields: [] },
          trx,
        );
      }

      await trx.commit();
    } catch (error) {
      await trx.rollback();
      throw error;
    }

    log && this.log({ id: material.id, action: this.logAction.create });

    return material;
  }

  async updateBy({ condition: { id }, data, add, remove, concurrentData, log }) {
    let material;
    const trx = await this.knex.transaction();

    try {
      material = await super.updateBy(
        {
          condition: { id },
          concurrentData,
          data: omit(data, ['equipmentItemIds']),
        },
        trx,
      );

      const repo = MaterialEquipmentItemRepo.getInstance(this.ctxState);
      const materialId = id;
      if (!isEmpty(add)) {
        await repo.insertMany(
          {
            data: add.map(equipmentItemId => ({
              materialId,
              equipmentItemId,
            })),
            fields: [],
          },
          trx,
        );
      }
      if (!isEmpty(remove)) {
        await repo.deleteByMaterialIdAndEquipmentItemIds(
          { data: { materialId, equipmentItemIds: remove } },
          trx,
        );
      }

      await trx.commit();
    } catch (error) {
      await trx.rollback();
      throw error;
    }

    log && this.log({ id, action: this.logAction.modify });

    return material;
  }

  async getAllPopulatedWithEquipmentItems({ condition = {}, limit = 0 }) {
    const query = this.knex(this.tableName)
      .withSchema(this.schemaName)
      .select(
        `${this.tableName}.*`,
        this.knex.raw('array_agg(??.id) as ??', [
          EquipmentItemRepository.TABLE_NAME,
          'equipmentItemIds',
        ]),
        this.knex.raw('array_agg(??.short_description) as ??', [
          EquipmentItemRepository.TABLE_NAME,
          'equipmentShortDescriptions',
        ]),
      )
      .leftJoin(
        MaterialEquipmentItemRepo.TABLE_NAME,
        `${MaterialEquipmentItemRepo.TABLE_NAME}.materialId`,
        `${this.tableName}.id`,
      )
      .leftJoin(
        EquipmentItemRepository.TABLE_NAME,
        `${MaterialEquipmentItemRepo.TABLE_NAME}.equipmentItemId`,
        `${EquipmentItemRepository.TABLE_NAME}.id`,
      )
      .where(unambiguousCondition(this.tableName, condition))
      .groupBy(`${this.tableName}.id`);

    const items = await (limit ? query.limit(limit) : query);

    return items?.map(this.mapFields.bind(this)) ?? [];
  }

  getAllByEquipmentItemId({ condition: { equipmentItemId, ...condition } = {} } = {}) {
    const query = this.knex(this.tableName)
      .withSchema(this.schemaName)
      .select(`${this.tableName}.*`)
      .innerJoin(
        MaterialEquipmentItemRepo.TABLE_NAME,
        `${MaterialEquipmentItemRepo.TABLE_NAME}.materialId`,
        `${this.tableName}.id`,
      )
      .innerJoin(
        EquipmentItemRepository.TABLE_NAME,
        `${MaterialEquipmentItemRepo.TABLE_NAME}.equipmentItemId`,
        `${EquipmentItemRepository.TABLE_NAME}.id`,
      )
      .where(`${MaterialEquipmentItemRepo.TABLE_NAME}.equipmentItemId`, equipmentItemId)
      .groupBy(`${this.tableName}.id`)
      .orderBy(`${this.tableName}.id`);

    return isEmpty(condition)
      ? query
      : query.andWhere(unambiguousCondition(this.tableName, condition));
  }

  async getAllByService({ condition: { billableServiceId, ...condition } }, trx = this.knex) {
    let query = trx(this.tableName)
      .withSchema(this.schemaName)
      .select(`${this.tableName}.*`)
      .where(unambiguousCondition(this.tableName, condition))
      .andWhere(`${BillableServiceRepository.TABLE_NAME}.id`, billableServiceId)
      .innerJoin(
        MaterialEquipmentItemRepo.TABLE_NAME,
        `${MaterialEquipmentItemRepo.TABLE_NAME}.materialId`,
        `${this.tableName}.id`,
      )
      .innerJoin(
        BillableServiceRepository.TABLE_NAME,
        `${BillableServiceRepository.TABLE_NAME}.equipmentItemId`,
        `${MaterialEquipmentItemRepo.TABLE_NAME}.equipmentItemId`,
      )
      .groupBy(`${this.tableName}.id`)
      .orderBy(`${this.tableName}.id`);

    if (condition.active) {
      query = query.andWhere({
        [`${BillableServiceRepository.TABLE_NAME}.active`]: true,
      });
    }

    const items = await query;

    return items;
  }

  async getAllPopulated({ condition = {}, fields = ['*'] }) {
    const items = await this.knex(this.tableName)
      .withSchema(this.schemaName)
      .select(
        fields
          .map(field => `${this.tableName}.${field}`)
          .concat(
            this.knex.raw('json_agg(??.*) as ??', [
              EquipmentItemRepository.TABLE_NAME,
              'equipmentItems',
            ]),
          ),
      )
      .innerJoin(
        MaterialEquipmentItemRepo.TABLE_NAME,
        `${MaterialEquipmentItemRepo.TABLE_NAME}.materialId`,
        `${this.tableName}.id`,
      )
      .leftJoin(
        EquipmentItemRepository.TABLE_NAME,
        `${MaterialEquipmentItemRepo.TABLE_NAME}.equipmentItemId`,
        `${EquipmentItemRepository.TABLE_NAME}.id`,
      )
      .where(unambiguousCondition(this.tableName, condition))
      .groupBy(`${this.tableName}.id`)
      .orderBy(`${this.tableName}.id`);

    return items?.map(this.mapFields.bind(this)) ?? [];
  }

  async getByIdToLog(id, trx = this.knex) {
    let query = super.getByIdQuery(id, trx);

    let selects = [`${this.tableName}.*`];
    ({ query, selects } = await super.populateBl({ query, selects }));

    selects.push(
      trx.raw('json_agg(??.*) as ??', [EquipmentItemRepository.TABLE_NAME, 'equipmentItems']),
    );
    query = query
      .leftJoin(
        MaterialEquipmentItemRepo.TABLE_NAME,
        `${MaterialEquipmentItemRepo.TABLE_NAME}.materialId`,
        `${this.tableName}.id`,
      )
      .leftJoin(
        EquipmentItemRepository.TABLE_NAME,
        `${MaterialEquipmentItemRepo.TABLE_NAME}.equipmentItemId`,
        `${EquipmentItemRepository.TABLE_NAME}.id`,
      )
      .groupBy([`${this.tableName}.id`, `${BusinessLineRepo.TABLE_NAME}.id`])
      .orderBy(`${this.tableName}.id`);

    const item = await query.select(selects);

    return item
      ? compose(super.mapNestedObjects.bind(this, []), super.mapJoinedFields, this.mapFields)(item)
      : null;
  }

  async deleteBy({ condition: { id }, log }, trx) {
    const _trx = trx || (await this.knex.transaction());

    try {
      await MaterialEquipmentItemRepo.getInstance(this.ctxState).deleteBy(
        { condition: { materialId: id } },
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

  getAllWithCodes({ businessUnitId, limit = 100 } = {}, trx = this.knex) {
    const bUnitLineTable = BusinessUnitLineRepository.TABLE_NAME;
    return (
      trx(this.tableName)
        .withSchema(this.schemaName)
        .innerJoin(
          bUnitLineTable,
          `${bUnitLineTable}.businessLineId`,
          `${this.tableName}.businessLineId`,
        )
        // .innerJoin(BusinessLineRepo.TABLE_NAME, `${bUnitLineTable}.businessLineId`, `${BusinessLineRepo.TABLE_NAME}.id`)
        .whereNotNull('code')
        .andWhere(`${bUnitLineTable}.businessUnitId`, businessUnitId)
        // .andWhere(`${BusinessLineRepo.TABLE_NAME}.type`, BUSINESS_LINE_TYPE.recycling)
        .select(`${this.tableName}.*`)
        .offset(0)
        .limit(limit)
    );
  }
}

MaterialRepository.TABLE_NAME = TABLE_NAME;

export default MaterialRepository;
