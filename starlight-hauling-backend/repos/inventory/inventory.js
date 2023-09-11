import VersionedRepository from '../_versioned.js';
import EquipmentItemRepository from '../equipmentItem.js';
import BusinessUnitRepo from '../businessUnit.js';

import ApiError from '../../errors/ApiError.js';
import { ACTION } from '../../consts/actions.js';

import { mapEquipmentsToInventoryItems } from './mappers.js';

const TABLE_NAME = 'inventory';

class InventoryRepository extends VersionedRepository {
  constructor(ctxState, { schemaName }) {
    super(ctxState, { schemaName, tableName: TABLE_NAME });
  }

  async getAllByBusinessUnitId(businessUnitId, { active, businessLineId } = {}) {
    const equipmentItemsTable = EquipmentItemRepository.TABLE_NAME;

    let query = this.knex(this.tableName)
      .withSchema(this.schemaName)
      .select([`${this.tableName}.*`, `${equipmentItemsTable}.description`])
      .innerJoin(
        equipmentItemsTable,
        `${equipmentItemsTable}.id`,
        `${this.tableName}.equipmentItemId`,
      )
      .where(`${this.tableName}.businessUnitId`, businessUnitId);

    if (active !== undefined) {
      query = query.where(`${equipmentItemsTable}.active`, active);
    }

    if (businessLineId) {
      query = query.where(`${equipmentItemsTable}.businessLineId`, businessLineId);
    }

    const result = await query;

    return result;
  }

  async registerEquipment(businessUnitId, equipmentItems) {
    const dataToInsert = mapEquipmentsToInventoryItems(businessUnitId, equipmentItems);
    const result = await this.insertMany({ data: dataToInsert, fields: ['*'] });

    return result;
  }

  async updateEquipmentInventoryBy({ condition, data = [] }, trx) {
    const updateInventoryPromises = data.map(({ id, ...restItem }) =>
      this.updateBy(
        {
          condition: { ...condition, equipmentItemId: id },
          data: restItem,
          fields: ['*'],
        },
        trx,
      ),
    );

    const result = await Promise.all(updateInventoryPromises);

    return result;
  }

  async registerAllEquipmentsForBusinessUnit(businessUnit) {
    const equipments = await EquipmentItemRepository.getInstance(this.ctxState).getAll({
      fields: ['id'],
    });

    if (!equipments) {
      return null;
    }

    const insertData = equipments.map(({ id: equipmentItemId }) => ({
      equipmentItemId,
      businessUnitId: businessUnit.id,
    }));

    const result = await this.insertMany({ data: insertData, fields: ['*'] });

    return result;
  }

  async registerEquipmentForAllBusinessUnits(equipmentItem) {
    const businessUnits = await BusinessUnitRepo.getInstance(this.ctxState).getAll({
      fields: ['id'],
    });

    if (!businessUnits) {
      return null;
    }

    const insertData = businessUnits.map(({ id: businessUnitId }) => ({
      businessUnitId,
      equipmentItemId: equipmentItem.id,
    }));

    const result = await this.insertMany({ data: insertData, fields: ['*'] });

    return result;
  }

  async updateInventoryByOrderInfo(order, { uncomplete = false } = {}) {
    const trx = await this.knex.transaction();
    const equipmentItemRepo = EquipmentItemRepository.getInstance(this.ctxState);

    try {
      const equipmentItem = await equipmentItemRepo.getHistoricalRecordById(
        {
          id: order.billableService.equipmentItemId,
          fields: ['originalId'],
        },
        trx,
      );

      const INDEPENDENT_ORDER_QUANTITY = 1;
      const options = {
        uncomplete,
        businessUnitId: order.businessUnitId || order.businessUnit?.id,
        equipmentItemId: equipmentItem.originalId,
        action: order.billableService.action,
        quantity: order.quantity || INDEPENDENT_ORDER_QUANTITY,
      };

      const data = await this._calculateUpdateData(options, trx);

      if (!data) {
        await trx.commit();
        return null;
      }

      const result = await this.updateBy(
        {
          condition: {
            businessUnitId: options.businessUnitId,
            equipmentItemId: options.equipmentItemId,
          },
          data,
        },
        trx,
      );

      await trx.commit();

      return result;
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  async _calculateUpdateData(options, trx) {
    const { businessUnitId, equipmentItemId, action, quantity, uncomplete } = options;
    const shouldUpdateInventory = [ACTION.delivery, ACTION.final].includes(action);

    if (!shouldUpdateInventory) {
      return null;
    }

    const inventoryItem = await this.getBy({ condition: { businessUnitId, equipmentItemId } }, trx);

    if (!inventoryItem) {
      throw ApiError.notFound(`Inventory item doesn't exist, details: ${JSON.stringify(options)}`);
    }

    let onJobSiteQuantity = Number(inventoryItem.onJobSiteQuantity);

    if (uncomplete) {
      if (action === ACTION.delivery) {
        onJobSiteQuantity -= quantity;
      }

      if (action === ACTION.final) {
        onJobSiteQuantity += quantity;
      }
    } else {
      if (action === ACTION.delivery) {
        onJobSiteQuantity += quantity;
      }

      if (action === ACTION.final) {
        onJobSiteQuantity -= quantity;
      }
    }

    return { onJobSiteQuantity };
  }
}

InventoryRepository.TABLE_NAME = TABLE_NAME;

export default InventoryRepository;
