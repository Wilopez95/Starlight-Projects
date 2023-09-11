import pick from 'lodash/pick.js';
import isEmpty from 'lodash/isEmpty.js';
import difference from 'lodash/difference.js';
import omit from 'lodash/omit.js';
import keyBy from 'lodash/keyBy.js';
import { isFuture, isToday, isValid } from 'date-fns';
// eslint-disable-next-line import/default
import dateFnsTz from 'date-fns-tz';

import VersionedRepository from '../_versioned.js';
import BillableServiceRepo from '../billableService.js';
import MaterialRepo from '../material.js';
import CustomerRepo from '../customer.js';
import JobSiteRepo from '../jobSite.js';
import PermitRepo from '../permit.js';
import DisposalSiteRepo from '../disposalSite.js';
import ContactRepo from '../contact.js';
import MediaFileRepo from '../mediaFile.js';
import DriverRepo from '../driver.js';

import {
  createWorkOrder,
  getWorkOrder,
  getWorkOrderNotes,
  updateWorkOrder,
  deleteWorkOrder,
  createWorkOrderNote,
  deleteWorkOrderNote,
  getAllWorkOrderNotes,
} from '../../services/dispatch.js';
import { deleteFileByUrl } from '../../services/mediaStorage.js';
import { syncWorkOrderToRecycling } from '../../services/recycling.js';
import reCalculateThresholds from '../../services/independentOrders/reCalculateThresholds.js';

import ApiError from '../../errors/ApiError.js';

import { mathRound2 } from '../../utils/math.js';
import mergeAddressComponents from '../../utils/mergeAddressComponents.js';

import { ACTION } from '../../consts/actions.js';
import {
  DISPATCH_ACTION,
  NOTE_STATE,
  LOCATION_TYPE,
  WO_STATUS,
  NOTE_TYPE,
} from '../../consts/workOrder.js';
import { EVENT_TYPE } from '../../consts/historicalEventType.js';
import { ORDER_STATUS } from '../../consts/orderStatuses.js';
import { WAYPOINT_TYPE_IN_DISPATCH } from '../../consts/waypointType.js';
import OrderRepo from './order.js';

const TABLE_NAME = 'work_orders';
const { zonedTimeToUtc } = dateFnsTz;

const dispatchInternalError = ApiError.badRequest('Dispatch API returned 5XX error');
const invalidDataForDispatch = ApiError.invalidRequest(
  'Dispatch API complained about invalid input data for work order',
);

const datesComparatorDesc = (i1, i2) => new Date(i2.modifiedDate) - new Date(i1.modifiedDate);
const datesComparatorAsc = (i1, i2) => new Date(i1.modifiedDate) - new Date(i2.modifiedDate);
const formDataForDispatchData = input => {
  return {
    // id
    // status
    scheduledDate: input.serviceDate || undefined,
    scheduledStart: input.bestTimeToComeFrom || undefined,
    scheduledEnd: input.bestTimeToComeTo || undefined,
    poNumber: input.purchaseOrderId || undefined,
    instructions: input.driverInstructions || undefined,
    alleyPlacement: input.alleyPlacement ? 1 : 0,
    earlyPickUp: input.earlyPick ? 1 : 0,
    okToRoll: input.toRoll ? 1 : 0,
    // negotiatedFill
    cow: input.callOnWayPhoneNumber ? 1 : 0,
    sos: input.someoneOnSite ? 1 : 0,
    cabOver: input.cabOver ? 1 : 0,
    // profileNumber
    // customerProvidedProfile
    priority: input.highPriority ? 1 : 0,
    // step
    // createdBy
    // createdDate
    // modifiedBy
    // modifiedDate
    // driverId
    // index
    // deleted
    signatureRequired: input.signatureRequired ? 1 : 0,
    // templateId
    // documentId
  };
};
const formDataForDispatch = input => {
  const data = formDataForDispatchData(input);

  data.templateId = data.signatureRequired === 1 ? 1 : null;

  const {
    billableService,
    equipmentItem,
    material,
    customer,
    orderContact,
    jobSite,
    jobSite2,
    disposalSite,
    permit,
    customerOriginalId,
    businessUnitId,
  } = input;

  if (billableService) {
    data.haulingBillableServiceId = billableService.originalId;
    data.size = equipmentItem.shortDescription;
    data.action =
      billableService.action === ACTION.dumpReturn
        ? DISPATCH_ACTION.dumpReturn
        : DISPATCH_ACTION[billableService.action];
    data.serviceDescription = billableService.description;
  }

  if (material) {
    data.haulingMaterialId = material.originalId;
    data.material = material.description;
  }

  if (customer) {
    data.customerName = customer.name;
  }

  if (orderContact) {
    data.contactName = `${orderContact.firstName} ${orderContact.lastName}`;
  }

  if (input.callOnWayPhoneNumber) {
    data.contactNumber = `+${input.callOnWayPhoneNumber}`;
  }

  if (input.textOnWayPhoneNumber) {
    data.textOnWay = `+${input.textOnWayPhoneNumber}`;
  }

  if (jobSite) {
    data.location1 = {
      type: LOCATION_TYPE.location,
      location: {
        lon: jobSite.coordinates[0],
        lat: jobSite.coordinates[1],
      },
      name: mergeAddressComponents(jobSite.address),
    };

    data.permittedCan = jobSite.permitRequired ? 1 : 0;
  }

  if (data.action === DISPATCH_ACTION.reposition) {
    data.location2 = {
      type: LOCATION_TYPE.location,
      location: {
        lon: jobSite.coordinates[0],
        lat: jobSite.coordinates[1],
      },
      name: mergeAddressComponents(jobSite.address),
    };
  } else if (jobSite2 && data.action === DISPATCH_ACTION.relocate) {
    data.location2 = {
      type: LOCATION_TYPE.location,
      location: {
        lon: jobSite2.coordinates[0],
        lat: jobSite2.coordinates[1],
      },
      name: mergeAddressComponents(jobSite2.address),
    };
  } else if (disposalSite) {
    data.haulingDisposalSiteId = disposalSite.originalId;
    const waypointName = mergeAddressComponents(disposalSite.address ?? disposalSite);
    data.location2 = {
      type: LOCATION_TYPE.waypoint,
      location: {
        lon: disposalSite.coordinates[0],
        lat: disposalSite.coordinates[1],
      },
      waypointType: WAYPOINT_TYPE_IN_DISPATCH[disposalSite.waypointType],
      waypointName,
      name: waypointName,
      description: disposalSite.description,
    };
  } else {
    data.haulingDisposalSiteId = null;
    // hacky way to nullify location2
    data.locationId2 = null;
  }

  if (permit) {
    data.permitNumber = permit.number;
  }

  // tech fields of new integrations
  if (input.tenantId) {
    data.tenantId = input.tenantId;
  }
  if (input.businessLineId) {
    data.businessLineId = input.businessLineId;
  }
  if (customerOriginalId) {
    data.customerId = customerOriginalId;
  }
  if (input.businessUnitId) {
    data.haulingBusinessUnitId = businessUnitId;
  }

  return data;
};

class WorkOrderRepository extends VersionedRepository {
  constructor(ctxState, { schemaName }) {
    super(ctxState, { schemaName, tableName: TABLE_NAME });
    this.upsertConstraints = ['woNumber'];
  }

  async fetchWorkOrderDataToCreateOrder(input, trx = this.knex) {
    const [
      billableService,
      material,
      customer,
      orderContact,
      jobSite,
      jobSite2,
      disposalSite,
      permit,
    ] = await Promise.all([
      BillableServiceRepo.getHistoricalInstance(this.ctxState, {
        schemaName: this.schemaName,
      }).populateWithEquipmentItem(
        {
          condition: { id: input.billableServiceId },
          fields: ['action', 'originalId', 'description'],
          nestedFields: ['shortDescription'],
        },
        trx,
      ),

      MaterialRepo.getHistoricalInstance(this.ctxState, {
        schemaName: this.schemaName,
      }).getBy(
        {
          condition: { id: input.materialId },
          fields: ['description', 'originalId'],
        },
        trx,
      ),

      CustomerRepo.getHistoricalInstance(this.ctxState, {
        schemaName: this.schemaName,
      }).getBy(
        {
          condition: { id: input.customerId },
          fields: ['name'],
        },
        trx,
      ),
      input.orderContactId
        ? ContactRepo.getHistoricalInstance(this.ctxState, {
            schemaName: this.schemaName,
          }).getBy(
            {
              condition: { id: input.orderContactId },
              fields: ['*'],
            },
            trx,
          )
        : Promise.resolve(null),

      JobSiteRepo.getHistoricalInstance(this.ctxState, {
        schemaName: this.schemaName,
      }).getBy(
        {
          condition: { id: input.jobSiteId },
        },
        trx,
      ),
      input.jobSite2Id
        ? JobSiteRepo.getHistoricalInstance(this.ctxState, {
            schemaName: this.schemaName,
          }).getBy(
            {
              condition: { id: input.jobSite2Id },
            },
            trx,
          )
        : Promise.resolve(null),

      input.disposalSiteId
        ? DisposalSiteRepo.getHistoricalInstance(this.ctxState, {
            schemaName: this.schemaName,
          }).getBy(
            {
              condition: { id: input.disposalSiteId },
            },
            trx,
          )
        : Promise.resolve(null),

      input.permitId
        ? PermitRepo.getHistoricalInstance(this.ctxState, {
            schemaName: this.schemaName,
          }).getBy(
            {
              condition: { id: input.permitId },
            },
            trx,
          )
        : Promise.resolve(null),
    ]);

    let equipmentItem;
    if (billableService) {
      equipmentItem = { shortDescription: billableService.shortDescription };
    }

    return Object.assign(input, {
      billableService,
      equipmentItem,
      material,
      customer,
      orderContact,
      jobSite,
      jobSite2,
      disposalSite,
      permit,
    });
  }

  get initialWoFields() {
    return [
      'bestTimeToComeFrom',
      'bestTimeToComeTo',
      'driverInstructions',
      'earlyPick',
      'toRoll',
      'callOnWayPhoneNumber',
      'textOnWayPhoneNumber',
      'someoneOnSite',
      'highPriority',
      'alleyPlacement',
      'cabOver',
      'signatureRequired',
      'mediaUrls',
    ];
  }

  updateWithWo({ id, woNumber, newMediaFiles }, trx = this.knex, { logger, newTrxStarted }) {
    return Promise.all([
      super.updateBy(
        {
          condition: { id },
          data: { woNumber },
          fields: [],
          eventType: EVENT_TYPE.created,
        },
        trx,
      ),
      newMediaFiles?.length
        ? this.upsertMedia(
            {
              id,
              woNumber,
              currentMediaFiles: [],
              newMediaFiles,
            },
            trx,
          )
        : Promise.resolve(),
    ])
      .then(() => {
        newTrxStarted && trx.commit();
      })
      .catch(error => {
        logger.error(error, `Work Order with ${id} cannot obtain its woNumber`);
        newTrxStarted && trx.rollback();
      });
  }

  async delayedWoNumberUpdate(ctx, { woData, id, newMediaFiles }, trx, woEe) {
    let createdWO;
    try {
      createdWO = await createWorkOrder(ctx, formDataForDispatch(woData));
    } catch (error) {
      return ctx.logger.info(error, 'Dispatch API returned 5XX error');
    }

    if (!createdWO) {
      return ctx.logger.error('Dispatch API complained about invalid input data for work order');
    }

    // const woExists = await super.getById({ id, fields: ['id'] });
    // if trx.isCompleted() is not sufficient check
    const woNumber = createdWO.id;
    if (trx.isCompleted()) {
      const sharedTrx = await this.knex.transaction();

      await this.updateWithWo(
        {
          id,
          woNumber,
          newMediaFiles,
        },
        sharedTrx,
        { logger: ctx.logger, newTrxStarted: true },
      );
    } else if (woEe) {
      woEe.once(`work-order-create-${id}`, () =>
        this.updateWithWo(
          {
            id,
            woNumber,
            newMediaFiles,
          },
          undefined,
          { logger: ctx.logger, newTrxStarted: false },
        ),
      );
    } else {
      return ctx.logger.error(
        `WO hasn't update: id ${id}, woNumber ${woNumber}. Pls review the case`,
      );
    }
    return ctx.logger.debug('Delayed work number update completed');
  }

  async createOne({ data, newMediaFiles = [], fields = '*' } = {}, trx = this.knex, woEe) {
    const ctx = this.getCtx();
    const { logger } = ctx;

    const initialWoData = pick(data, this.initialWoFields);

    const woData = await this.fetchWorkOrderDataToCreateOrder(data, trx);

    // -1 means not created WO in Dispatch yet
    initialWoData.woNumber = -1;
    const workOrder = await super.createOne({ data: initialWoData, fields }, trx, {
      noRecord: true,
    });

    logger.debug(`woRepo->createOne->createdWO: ${JSON.stringify(workOrder, null, 2)}`);

    const { id } = workOrder;
    this.delayedWoNumberUpdate(
      ctx,
      {
        woData,
        id,
        newMediaFiles,
      },
      trx,
      woEe,
    ).catch(ctx.logger.error.bind(ctx.logger));

    return workOrder;
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

  async dispatchOne({ condition: { id }, data } = {}) {
    const existingWo = await this.getById({ id, fields: this.initialWoFields });

    const woData = formDataForDispatch(Object.assign(existingWo, data));

    const ctx = this.getCtx();
    ctx.state.schemaName = this.schemaName;
    ctx.state.tenantName = this.schemaName;
    ctx.state.user.tenantName = this.schemaName;

    let createdWO;
    try {
      createdWO = await createWorkOrder(ctx, woData);
    } catch (error) {
      this.ctxState.logger.error(error);
      throw dispatchInternalError;
    }

    if (!createdWO) {
      throw invalidDataForDispatch;
    }

    const workOrder = await super.updateBy({
      condition: { id },
      data: { woNumber: createdWO.id },
      fields: ['*'],
      eventType: EVENT_TYPE.created,
    });

    if (workOrder.mediaUrls?.length) {
      await this.upsertMedia({
        id: workOrder.id,
        woNumber: workOrder.woNumber,
        currentMediaFiles: [],
        newMediaFiles: workOrder.mediaUrls.map(url => ({ url })),
      });
    }
  }

  getByOrderId(orderId, fields = ['*'], trx = this.knex) {
    return trx(this.tableName)
      .withSchema(this.schemaName)
      .select(fields.map(field => `${this.tableName}.${field}`))
      .innerJoin(
        OrderRepo.TABLE_NAME,
        `${OrderRepo.TABLE_NAME}.workOrderId`,
        `${this.tableName}.id`,
      )
      .where(`${OrderRepo.TABLE_NAME}.id`, orderId)
      .first();
  }

  async upsertMedia(
    { id, woNumber, currentMediaFiles, newMediaFiles, newData = {}, currentData = {} },
    trx = this.knex,
  ) {
    const mediaUrls = newMediaFiles?.map(({ url }) => url) ?? [];
    const currentUrls = currentMediaFiles?.map(({ url }) => url) ?? [];
    const toAdd = difference(mediaUrls, currentUrls);

    const toInsert = newMediaFiles
      .filter(({ url }) => toAdd.includes(url))
      .map(file => ({ ...file, workOrderId: id }));

    const ctx = this.getCtx();
    if (woNumber >= 1) {
      const notes = await Promise.allSettled(
        toInsert.map(({ url }) =>
          createWorkOrderNote(ctx, woNumber, {
            type: NOTE_TYPE.note,
            note: { picture: url },
          }),
        ),
      );

      // upload weight ticket
      if (newData.ticketUrl && currentData.ticketUrl !== newData.ticketUrl) {
        await createWorkOrderNote(ctx, woNumber, {
          type: NOTE_TYPE.ticket,
          note: {
            picture: newData.ticketUrl,
            ticketNumber: newData.ticketNumber,
            quantity: newData.weight,
            unittype: newData.weightUnit?.toUpperCase(),
          },
        }).catch(err => this.ctxState.logger.error(err, 'Failed to perform ticket note creation'));
      }

      const uploadError = notes.find(note => note.status === 'rejected')?.reason;

      if (uploadError) {
        await Promise.all(
          notes
            .filter(({ status }) => status === 'fulfilled')
            .map(note => deleteWorkOrderNote(ctx, woNumber, note.id)),
        ).catch(err => this.ctxState.logger.error(err, 'Failed to rollback notes creation'));
        // throw uploadError;
      }

      notes.forEach(({ value }, index) => {
        toInsert[index].dispatchId = value?.id || null;
      });
    }

    if (!isEmpty(toInsert)) {
      await MediaFileRepo.getInstance(this.ctxState).insertMany({ data: toInsert }, trx);
    }

    const { ticketUrl } = currentData;
    if (
      woNumber >= 1 &&
      ticketUrl &&
      currentData.ticketFromCsr &&
      ticketUrl !== newData.ticketUrl
    ) {
      deleteFileByUrl(ticketUrl).catch(error =>
        this.ctxState.logger.error(error, `Could not remove file ${ticketUrl}`),
      );
    }
  }

  async updateWithImages(woData, trx = this.knex) {
    const { mediaFiles = [], ...newData } = woData;

    const { id, woNumber, ...currentData } = await this.getById(
      { id: woData.id, fields: ['id', 'woNumber', 'ticketUrl', 'ticketFromCsr'] },
      trx,
    );

    const mediaFileRepo = MediaFileRepo.getInstance(this.ctxState);
    const [currentMediaFiles, workOrder] = await Promise.all([
      mediaFileRepo.getUrlsByWorkOrderId(id, trx),
      this.updateBy({ condition: { id }, fields: ['*'], data: newData }, trx),
    ]);

    await this.upsertMedia(
      {
        id,
        woNumber,
        currentMediaFiles,
        newMediaFiles: mediaFiles,
        newData,
        currentData,
      },
      trx,
    );

    return workOrder;
  }

  static parseWorkOrder({
    status,
    driver,
    haulingBillableServiceId,
    haulingMaterialId,
    haulingDisposalSiteId,
  }) {
    return {
      status,
      driverId: driver?.id,

      haulingBillableServiceId,
      haulingMaterialId,
      haulingDisposalSiteId,
    };
  }

  static parseWorkOrderNotes(notes) {
    const cb = (data, { note, modifiedDate, can }) => {
      const updatedAtDate = zonedTimeToUtc(modifiedDate, 'UTC');

      switch (note.newState) {
        case NOTE_STATE.startWorkOrder: {
          data.startWorkOrderDate = updatedAtDate;
          break;
        }

        case NOTE_STATE.arriveOnSite: {
          data.arriveOnSiteDate = updatedAtDate;
          break;
        }
        case NOTE_STATE.startService: {
          data.startServiceDate = updatedAtDate;
          break;
        }

        case NOTE_STATE.pickupCan: {
          const canName = can?.name || null;
          const canId = note.canId || can?.id;
          data.pickedUpEquipmentItem = canName;
          data.pickedUpEquipmentItemId = canId ? Number.parseInt(canId, 10) : null;
          data.pickedUpEquipmentItemDate = updatedAtDate;
          break;
        }
        case NOTE_STATE.dropCan: {
          const canName = can?.name || null;
          const canId = note.canId || can?.id;
          data.droppedEquipmentItem = canName;
          data.droppedEquipmentItemId = canId ? Number.parseInt(canId, 10) : null;
          data.droppedEquipmentItemDate = updatedAtDate;
          break;
        }

        case NOTE_STATE.completeWorkOrder: {
          data.completionDate = updatedAtDate;
          data.finishWorkOrderDate = updatedAtDate;
          break;
        }

        case NOTE_STATE.goingToFill: {
          data.goingToFillDate = updatedAtDate;
          break;
        }

        default: {
          break;
        }
      }

      return data;
    };

    const data = notes.reduceRight(cb, {});

    // weight ticket
    const [scaleTicket] = notes
      .filter(({ type }) => type === NOTE_TYPE.ticket)
      .sort(datesComparatorDesc);

    if (scaleTicket) {
      data.ticket = scaleTicket.note.ticketNumber;
      data.ticketUrl = scaleTicket.note.picture;

      data.weight = scaleTicket.note.quantity
        ? mathRound2(Number.parseFloat(scaleTicket.note.quantity))
        : null;
      data.weightUnit = scaleTicket.note.unittype?.toLowerCase();

      data.ticketDate = zonedTimeToUtc(scaleTicket.createdDate, 'UTC');
    }

    const driverNotes = notes
      .filter(({ type, note }) => type === NOTE_TYPE.note && note.text)
      .map(({ note }) => note.text);

    data.manifests = notes
      .filter(({ type, note }) => type === NOTE_TYPE.manifest && note)
      .map(({ note, id }) => ({ dispatchId: id, ...note }));

    if (driverNotes.length) {
      data.driverNotes = driverNotes.join('\n');
    } else {
      data.driverNotes = null;
    }

    return data;
  }

  static parseCanNotes(notes) {
    const droppedCans = new Map();

    if (notes.length === 0) {
      return droppedCans;
    }

    const sortedNotes = notes.sort(datesComparatorAsc);
    sortedNotes.forEach(({ note, can, location }) => {
      note.newState = undefined;
      const canId = note.canId || can.id;
      const canName = can.name;
      if (!canId || !canName) {
        return;
      }

      if (note.newState === NOTE_STATE.dropCan) {
        const {
          location: { lon, lat },
        } = location;

        droppedCans.set(String(canName), {
          point: { type: 'Point', coordinates: [lon, lat] },
          canId: Number.parseInt(canId, 10),
        });
      } else if (note.newState === NOTE_STATE.pickupCan) {
        droppedCans.delete(String(canName));
      }
    });

    return droppedCans;
  }

  static parseWorkOrderImages(notes, workOrderId, author) {
    return notes
      .filter(({ type, note }) => type === NOTE_TYPE.note && note.picture)
      .map(({ note, id }) => ({
        workOrderId,
        author,
        url: note.picture,
        fileName: `Work order media.${note.picture.split('.').pop()}`,
        dispatchId: id,
        timestamp: new Date(),
      }));
  }

  async getTicketMediaFiles(workOrderIds) {
    const tickets = await this.knex(this.tableName)
      .withSchema(this.schemaName)
      .select('id as workOrderId', 'woNumber', 'ticketUrl as url')
      .whereNotNull('ticketUrl')
      .whereIn('id', workOrderIds);

    if (!tickets) {
      return [];
    }

    return tickets.map(ticket => ({
      ...ticket,
      fileName: `Weight ticket for WO# ${ticket.woNumber}`,
    }));
  }

  getWorkOrderDataToRescheduleOrder(input) {
    return {
      scheduledDate: input.serviceDate || undefined,
      scheduledStart: input.bestTimeToComeFrom || undefined,
      scheduledEnd: input.bestTimeToComeTo || undefined,
    };
  }

  async dispatchUpdates({ condition: { woNumber }, data } = {}) {
    let updatedWO;
    try {
      updatedWO = await updateWorkOrder(this.getCtx(), woNumber, data);
    } catch (error) {
      this.ctxState.logger.error(error);
      throw dispatchInternalError;
    }

    if (!updatedWO) {
      throw invalidDataForDispatch;
    }
  }

  static async getAllDroppedCans(ctx, workOrders) {
    const workOrdersById = keyBy(workOrders, 'woNumber');
    const notes = await getAllWorkOrderNotes(ctx, Object.keys(workOrdersById));

    const isNoteRelevant = note =>
      isValid(new Date(note?.modifiedDate)) &&
      (note.note.newState === NOTE_STATE.dropCan
        ? !workOrdersById[note.workOrderId]?.isRelocateFromJobSite
        : note.note.newState === NOTE_STATE.pickupCan);

    // Even if Dispatch API does not provide data for some work order, we just ignore it.
    return this.parseCanNotes(notes.filter(note => isNoteRelevant(note)));
  }

  // TODO: integrate new pricing engine
  async syncDataAndCalculateThresholdsAndManifests(order) {
    const { woNumber, goingToFillDate } = order.workOrder;
    const { billableService, status: orderStatus } = order;
    const { originalId: billableServiceId } = billableService;

    // fetch latest WO-related data from Dispatch
    const [woData, woNotes, currentWO] = await Promise.all([
      getWorkOrder(this.getCtx(), woNumber),
      getWorkOrderNotes(this.getCtx(), woNumber),
      super.getBy({ condition: { woNumber } }),
    ]);

    const syncDate = new Date();
    if (!woData && !woNotes?.length) {
      // not crucial to update it
      await this.updateBy({ condition: { woNumber }, data: { syncDate }, fields: ['id'] });

      throw ApiError.notFound(
        'Dispatch API provides no data yet',
        `Cannot fetch non-empty data for work order ${woNumber} from Dispatch API`,
      );
    }

    const {
      haulingBillableServiceId,
      haulingMaterialId,
      haulingDisposalSiteId,
      status,
      ...woDataOnly
    } = woData;

    // UNASSIGNED, ASSIGNED cannot be set. Back WO to InProgress isn't supported
    if (
      [WO_STATUS.completed, WO_STATUS.canceled].includes(status) &&
      orderStatus === ORDER_STATUS.inProgress
    ) {
      woDataOnly.status = status;
    }

    if (haulingBillableServiceId && Number(haulingBillableServiceId) !== billableServiceId) {
      if (orderStatus === ORDER_STATUS.inProgress) {
        const serviceDate = zonedTimeToUtc(order.serviceDate, 'UTC');

        if (!isFuture(serviceDate) && !isToday(serviceDate)) {
          throw ApiError.invalidRequest(
            'Past date is disallowed for Service date of orders in inProgress status',
          );
        }
      } else {
        throw ApiError.invalidRequest(
          'Order Service cannot be edited if it is not InProgress anymore',
        );
      }
    }

    const data = Object.assign(
      WorkOrderRepository.parseWorkOrderNotes(woNotes),
      WorkOrderRepository.parseWorkOrder(woDataOnly),
      {
        syncDate,
      },
    );

    if (data.driverId) {
      const driver = await DriverRepo.getInstance(this.ctxState).getById({ id: data.driverId });
      if (driver) {
        data.ticketAuthor = driver.description;
        data.truckId = driver.truckId;
      }
    }

    const shouldRemoveTicketFile = data.ticketUrl && currentWO.ticketFromCsr;
    if (shouldRemoveTicketFile) {
      data.ticketFromCsr = false;
    }

    const orderRepo = OrderRepo.getInstance(this.ctxState);
    let woOrder;
    let thresholdsTotal;
    let thresholdsItems;
    let newLineItemsTotal;

    const trx = await this.knex.transaction();

    try {
      ({ thresholdsTotal, thresholdsItems } = await reCalculateThresholds(
        this.getCtx(),
        { order, workOrder: data },
        trx,
      ));

      newLineItemsTotal = await orderRepo.reCalculateMamanifestFilesnifestsAndLineItems(
        order,
        { id: order.workOrder.id, ...data },
        trx,
      );

      // update synced WO data
      woOrder = await this.updateBy(
        {
          condition: { woNumber },
          data: omit(data, ['manifests', 'mediaFiles']),
          fields: ['*'],
        },
        trx,
      );

      const mediaFiles = WorkOrderRepository.parseWorkOrderImages(
        woNotes,
        currentWO.id,
        data.ticketAuthor,
      );

      woOrder.mediaFiles = mediaFiles?.length
        ? await MediaFileRepo.getInstance(this.ctxState).upsertByDispatchId(
            {
              mediaFiles,
              workOrderId: woOrder.id,
            },
            trx,
          )
        : [];

      await trx.commit();
    } catch (error) {
      await trx.rollback();
      throw error;
    }

    // Remove file only *after* the updates just in case the update fails.
    if (shouldRemoveTicketFile) {
      const { ticketUrl } = currentWO;
      deleteFileByUrl(ticketUrl).catch(error =>
        this.ctxState.logger.error(error, `Could not remove file ${ticketUrl}`),
      );
    }

    if (woOrder) {
      await this.checkUpdateForRecycling({
        orderStatus,
        orderId: order.id,
        goingToFillDate,
        woOrder,
      });
    }

    return {
      woOrder,
      thresholdsItems,
      thresholdsTotal: mathRound2(thresholdsTotal) || 0,
      newLineItemsTotal: mathRound2(newLineItemsTotal) || 0,
      orderData: { haulingBillableServiceId, haulingMaterialId, haulingDisposalSiteId },
    };
  }

  async checkUpdateForRecycling({ orderStatus, orderId, goingToFillDate, woOrder }) {
    const autoCompleteOrder =
      orderStatus === ORDER_STATUS.inProgress && woOrder.status === WO_STATUS.completed;
    const autoCancelOrder =
      orderStatus === ORDER_STATUS.inProgress && woOrder.status === WO_STATUS.canceled;

    let eventName = null;
    if (autoCompleteOrder) {
      eventName = 'completed';
    } else if (autoCancelOrder) {
      eventName = 'canceled';
    } else if (
      goingToFillDate ? woOrder.goingToFillDate !== goingToFillDate : woOrder.goingToFillDate
    ) {
      eventName = 'goingToFill';
    }

    if (eventName) {
      await this.syncWoUpdatesWithRecycling({
        woNumber: woOrder.woNumber,
        haulingOrderId: orderId,
        eventName,
      });
    }
  }

  async syncWoUpdatesWithRecycling({ woNumber, haulingOrderId, eventName }) {
    await syncWorkOrderToRecycling(this.ctxState, {
      tenantName: this.schemaName,
      woNumber,
      haulingOrderId,
      eventName,
    });
  }

  async getByAndPopulateCustomer({ condition: { woNumber, businessUnitId, businessLineId } } = {}) {
    const customersHT = CustomerRepo.getHistoricalTableName(CustomerRepo.TABLE_NAME);
    const fields = [
      `${this.tableName}.id`,
      `${OrderRepo.TABLE_NAME}.id AS orderId`,
      `${customersHT}.name AS customerName`,
      'woNumber',
    ];
    const condition = { [`${this.tableName}.woNumber`]: woNumber };
    if (businessLineId) {
      condition[`${OrderRepo.TABLE_NAME}.businessLineId`] = businessLineId;
    }
    if (businessUnitId) {
      condition[`${OrderRepo.TABLE_NAME}.businessUnitId`] = businessUnitId;
    }

    const wo = await this.knex(this.tableName)
      .withSchema(this.schemaName)
      .select(fields)
      .where(condition)
      .innerJoin(
        OrderRepo.TABLE_NAME,
        `${OrderRepo.TABLE_NAME}.workOrderId`,
        `${this.tableName}.id`,
      )
      .innerJoin(customersHT, `${OrderRepo.TABLE_NAME}.customerId`, `${customersHT}.id`)
      .first();

    return wo || null;
  }

  populateMediaFiles(trx = this.knex) {
    return trx(this.tableName)
      .withSchema(this.schemaName)
      .select([
        `${this.tableName}.*`,
        trx.raw('json_agg(??.*) as ??', [MediaFileRepo.TABLE_NAME, 'mediaFiles']),
      ])
      .leftJoin(
        trx(MediaFileRepo.TABLE_NAME).as(MediaFileRepo.TABLE_NAME).withSchema(this.schemaName),
        `${this.tableName}.id`,
        `${MediaFileRepo.TABLE_NAME}.work_order_id`,
      )
      .groupBy(`${this.tableName}.id`);
  }

  async deleteById(id, trx = this.knex, { noRecord = false } = {}) {
    const item = await super.getById({ id }, trx);

    await super.deleteById({ item, log: false, _trx: trx, noRecord });

    const { woNumber } = item;
    if (woNumber) {
      await deleteWorkOrder(this.getCtx(), woNumber);
    }
  }

  static async getWoByNumber({ woNumber, schemaName, fields = ['*'] }, trx = this.knex) {
    const getWoByNumber = schema =>
      trx(TABLE_NAME).withSchema(schema).where({ woNumber }).select(fields).first();

    if (schemaName) {
      // optimal case - recent and new WO
      return {
        workOrder: await getWoByNumber(schemaName),
        schemaName,
      };
    }

    // TODO: must be improved via extending Trash API with multi-tenancy param
    const schemata = await trx('schemata')
      .withSchema('information_schema')
      .select('schema_name')
      .whereNotIn('schema_name', ['information_schema', 'admin', 'public'])
      .andWhere('schema_name', 'not ilike', 'pg_%');

    if (!schemata?.length) {
      return {};
    }

    const results = await Promise.allSettled(
      schemata.map(({ schemaName: schema }) => getWoByNumber(schema)),
    );

    const i = results?.findIndex(({ status, value }) => status === 'fulfilled' && value) ?? -1;
    return {
      workOrder: i !== -1 ? results?.[i]?.value : null,
      schemaName: i !== -1 ? schemata[i].schemaName : null,
    };
  }
}

WorkOrderRepository.TABLE_NAME = TABLE_NAME;

export default WorkOrderRepository;
