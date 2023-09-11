/* eslint-disable eqeqeq */
import pick from 'lodash/pick.js';

import { EVENT_TYPE } from '../consts/historicalEventType.js';
import { PHONE_TYPE } from '../consts/phoneTypes.js';
import VersionedRepository from './_versioned.js';
import OrderRepo from './order.js';
import IndependentWorkOrderMediaRepo from './independentWorkOrderMedia.js';
import BillableServiceRepo from './billableService.js';
import CustomerJobSitePairRepo from './customerJobSitePair.js';
import JobSitesRepo from './jobSite.js';
import CustomersRepo from './customer.js';
import MaterialsRepo from './material.js';
import ServiceAreasRepo from './serviceArea.js';
import ThirdPartyHaulersRepo from './3rdPartyHaulers.js';
import EquipmentItemRepo from './equipmentItem.js';
import ContactRepo from './contact.js';

const TABLE_NAME = 'independent_work_orders';

class IndependentWorkOrderRepository extends VersionedRepository {
  constructor(ctxState, { schemaName }) {
    super(ctxState, { schemaName, tableName: TABLE_NAME });
    this.upsertConstraints = ['id'];
  }

  async createOne({ data, fields = '*' } = {}, trx = this.knex) {
    const initialWoData = pick(data, this.initialWoFields);

    const workOrder = await super.createOne({ data: initialWoData, fields }, trx, {
      noRecord: true,
    });
    const { id } = workOrder;

    const woNumber = Number(data.orderId.toString() + id.toString());

    await super.updateBy(
      {
        condition: { id },
        data: { woNumber },
        fields: [],
        eventType: EVENT_TYPE.created,
      },
      trx,
    );

    const orderRepo = OrderRepo.getInstance(this.ctxState);
    await orderRepo.updateBy(
      {
        condition: { id: data.orderId },
        data: { independentWorkOrderId: id },
      },
      trx,
    );

    if (fields.includes('woNumber')) {
      workOrder.woNumber = woNumber;
    }

    return workOrder;
  }

  get initialWoFields() {
    return [
      'bestTimeToComeFrom',
      'bestTimeToComeTo',
      'driverInstructions',
      'toRoll',
      'callOnWayPhoneNumber',
      'textOnWayPhoneNumber',
      'someoneOnSite',
      'highPriority',
      'alleyPlacement',
      'signatureRequired',
      'permitRequired',
      'route',
    ];
  }

  async createDeferredOne({ data, fields = '*' } = {}, trx = this.knex) {
    const woData = pick(data, this.initialWoFields);

    // null means no WO in Dispatch yet since it's deferred Order related
    data.woNumber = null;

    const workOrder = await super.createOne(
      {
        data: woData,
        fields,
      },
      trx,
      // we loose some init WO data but it's not important for Order history
      { noRecord: true },
    );

    return workOrder;
  }

  async updateOne(
    { condition, fields = ['*'], data: { mediaFiles, ...data } } = {},
    trx = this.knex,
  ) {
    const independentWO = await super.updateBy(
      {
        condition,
        data,
        fields,
      },
      trx,
    );

    await IndependentWorkOrderMediaRepo.getInstance(this.ctxState).upsertMany({
      data: mediaFiles,
      independentWorkOrderId: independentWO.id,
    });
  }

  async deleteById({ id }, trx = this.knex) {
    await super.deleteBy({ condition: { id } }, trx);

    await IndependentWorkOrderMediaRepo.getInstance(this.ctxState).deleteBy(
      { condition: { independentWorkOrderId: id } },
      trx,
    );
  }

  async getDetailsForRoutePlanner({ workOrderId }, trx = this.knex) {
    const orderTable = OrderRepo.TABLE_NAME;
    const equipmentItemTable = EquipmentItemRepo.TABLE_NAME;
    const materialsHT = MaterialsRepo.getHistoricalTableName();
    const jobSitesHT = JobSitesRepo.getHistoricalTableName();
    const contactsHT = ContactRepo.getHistoricalTableName();
    const customersHT = CustomersRepo.getHistoricalTableName();
    const customerJobSiteHT = CustomerJobSitePairRepo.getHistoricalTableName();
    const billableServicesHT = BillableServiceRepo.getHistoricalTableName();
    const serviceAreasHT = ServiceAreasRepo.getHistoricalTableName();
    const thirdPartyHaulersHT = ThirdPartyHaulersRepo.getHistoricalTableName();

    const query = trx(orderTable)
      .withSchema(this.schemaName)
      .select([
        `${orderTable}.businessUnitId`,
        `${orderTable}.businessLineId`,
        `${orderTable}.billableServiceId`,
        `${orderTable}.jobSiteNote`,
        `${orderTable}.cancellationReasonType as cancellationReason`,
        `${orderTable}.cancellationComment`,
        `${orderTable}.driverInstructions as instructionsForDriver`,

        `${contactsHT}.originalId as jobSiteContactId`,
        `${customersHT}.originalId as customerId`,
        `${jobSitesHT}.originalId as jobSiteId`,
        `${materialsHT}.originalId as materialId`,
        `${serviceAreasHT}.originalId as serviceAreaId`,
        `${thirdPartyHaulersHT}.originalId as thirdPartyHaulerId`,
        `${thirdPartyHaulersHT}.description as thirdPartyHaulerDescription`,

        `${customerJobSiteHT}.poRequired`,
        `${customerJobSiteHT}.permitRequired`,

        `${billableServicesHT}.equipmentItemId`,
        `${equipmentItemTable}.size as equipmentItemSize`,
        `${billableServicesHT}.description as billableServiceDescription`,

        `${this.tableName}.pickedUpEquipmentItem as pickedUpEquipment`,
        `${this.tableName}.droppedEquipmentItem as droppedEquipment`,
      ])
      .innerJoin(this.tableName, `${orderTable}.independentWorkOrderId`, `${this.tableName}.id`)
      .innerJoin(customerJobSiteHT, `${orderTable}.customerJobSiteId`, `${customerJobSiteHT}.id`)
      .innerJoin(billableServicesHT, `${billableServicesHT}.id`, `${orderTable}.billableServiceId`)
      .leftJoin(serviceAreasHT, `${serviceAreasHT}.id`, `${orderTable}.serviceAreaId`)
      .innerJoin(jobSitesHT, `${jobSitesHT}.id`, `${orderTable}.jobSiteId`)
      .innerJoin(customersHT, `${customersHT}.id`, `${orderTable}.customerId`)
      .innerJoin(contactsHT, `${contactsHT}.id`, `${orderTable}.jobSiteContactId`)
      .leftJoin(materialsHT, `${materialsHT}.id`, `${orderTable}.materialId`)
      .leftJoin(
        thirdPartyHaulersHT,
        `${thirdPartyHaulersHT}.id`,
        `${orderTable}.thirdPartyHaulerId`,
      )
      .leftJoin(
        equipmentItemTable,
        `${equipmentItemTable}.id`,
        `${billableServicesHT}.equipmentItemId`,
      )
      .where(`${orderTable}.independentWorkOrderId`, workOrderId)
      .first();

    const item = await query;

    const contact = await ContactRepo.getInstance(this.ctxState).getBy({
      condition: { id: item.jobSiteContactId },
    });

    item.mainPhoneNumber = contact.phoneNumbers?.find(
      phoneNumber => phoneNumber.type === PHONE_TYPE.main,
    )?.number;

    return item;
  }
}

IndependentWorkOrderRepository.TABLE_NAME = TABLE_NAME;

export default IndependentWorkOrderRepository;
