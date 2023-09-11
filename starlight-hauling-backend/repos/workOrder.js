import pick from 'lodash/pick.js';
import isEmpty from 'lodash/isEmpty.js';
import difference from 'lodash/difference.js';
import omit from 'lodash/omit.js';
import keyBy from 'lodash/keyBy.js';
import { differenceInMinutes, isFuture, isToday, isValid } from 'date-fns';
// eslint-disable-next-line import/default
import dateFnsTz from 'date-fns-tz';

import {
  createWorkOrder,
  createWorkOrderNote,
  deleteWorkOrder,
  deleteWorkOrderNote,
  getAllWorkOrderNotes,
  getWorkOrder,
  getWorkOrderNotes,
  updateWorkOrder,
} from '../services/dispatch.js';
import { deleteFileByUrl } from '../services/mediaStorage.js';
import { syncWorkOrderToRecycling } from '../services/recycling.js';
import ApiError from '../errors/ApiError.js';
import { mathRound2 } from '../utils/math.js';
import { ACTION } from '../consts/actions.js';
import {
  DISPATCH_ACTION,
  NOTE_STATE,
  LOCATION_TYPE,
  WO_STATUS,
  NOTE_TYPE,
  WEIGHT_UNIT,
} from '../consts/workOrder.js';
import { EVENT_TYPE } from '../consts/historicalEventType.js';
import { ORDER_STATUS } from '../consts/orderStatuses.js';
import { WAYPOINT_TYPE_IN_DISPATCH } from '../consts/waypointType.js';
import { volumeToUnits, weightFromUnits, weightToUnits } from '../utils/unitsConvertor.js';
import VersionedRepository from './_versioned.js';
import BillableServiceRepo from './billableService.js';
import MaterialRepo from './material.js';
import CustomerRepo from './customer.js';
import JobSiteRepo from './jobSite.js';
import PermitRepo from './permit.js';
import DisposalSiteRepo from './disposalSite.js';
import ContactRepo from './contact.js';
import OrderRepo from './order.js';
import MediaFileRepo from './mediaFile.js';
import DriverRepo from './driver.js';
import WorkOrdersSuspendedRepo from './workOrdersSuspended.js';
import CompanyRepo from './company.js';

const TABLE_NAME = 'work_orders';
const { zonedTimeToUtc } = dateFnsTz;

const dispatchInternalError = ApiError.badRequest('Dispatch API returned 5XX error');
const invalidDataForDispatch = ApiError.invalidRequest(
  'Dispatch API complained about invalid input data for work order',
);

const datesComparatorDesc = (i1, i2) => new Date(i2.modifiedDate) - new Date(i1.modifiedDate);
const datesComparatorAsc = (i1, i2) => new Date(i1.modifiedDate) - new Date(i2.modifiedDate);

const mergeAddressComponents = ({ addressLine1, addressLine2, city, state, zip }) => {
  const withoutZip = [addressLine1, addressLine2, city, state].filter(s => s).join(', ');
  return `${withoutZip} ${zip}`;
};
const intitialFormDataForDispatch = input => {
  return {
    scheduledDate: input.serviceDate || undefined,
    scheduledStart: input.bestTimeToComeFrom || undefined,
    scheduledEnd: input.bestTimeToComeTo || undefined,
    poNumber: input.purchaseOrderId || undefined,
    instructions: input.driverInstructions || undefined,
    alleyPlacement: input.alleyPlacement ? 1 : 0,
    earlyPickUp: input.earlyPick ? 1 : 0,
    okToRoll: input.toRoll ? 1 : 0,
    cow: input.callOnWayPhoneNumber ? 1 : 0,
    sos: input.someoneOnSite ? 1 : 0,
    cabOver: input.cabOver ? 1 : 0,
    priority: input.highPriority ? 1 : 0,
    signatureRequired: input.signatureRequired ? 1 : 0,
    permittedCan: input.permitRequired ? 1 : 0,
  };
};

const formDataForDispatch = input => {
  const data = intitialFormDataForDispatch(input);
  data.templateId = data.signatureRequired === 1 ? 1 : null;

  const {
    businessUnit,
    billableService,
    equipmentItem,
    material,
    // customer,
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
    data.haulingMaterialId = material.id;
    data.material = material.description;
  }

  if (businessUnit) {
    data.customerName = `${businessUnit.nameLine1} ${
      businessUnit.nameLine2 ? businessUnit.nameLine2 : ''
    }`;
  }

  if (orderContact) {
    data.contactName = `${orderContact.firstName} ${orderContact.lastName}`;
    data.contactNumber = `${
      orderContact.phoneNumbers && orderContact.phoneNumbers.length > 0
        ? orderContact.phoneNumbers[0].number
        : ''
    }`;
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
      name: mergeAddressComponents({
        addressLine1: jobSite.addressLine1,
        addressLine2: jobSite.addressLine2,
        city: jobSite.city,
        state: jobSite.state,
        zip: jobSite.zip,
      }),
    };
  }
  if (data.action === DISPATCH_ACTION.reposition) {
    data.location2 = {
      type: LOCATION_TYPE.location,
      location: {
        lon: jobSite.coordinates[0],
        lat: jobSite.coordinates[1],
      },
      name: mergeAddressComponents(jobSite.address ?? jobSite),
    };
  } else if (jobSite2 && data.action === DISPATCH_ACTION.relocate) {
    data.location2 = {
      type: LOCATION_TYPE.location,
      location: {
        lon: jobSite2.coordinates[0],
        lat: jobSite2.coordinates[1],
      },
      name: mergeAddressComponents(jobSite2.address ?? jobSite2),
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
    const [billableService, material, businessUnit, customer, orderContact, disposalSite, permit] =
      await Promise.all([
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
            fields: ['description', 'id'],
          },
          trx,
        ),
        input.orderContactId
          ? ContactRepo.getInstance(this.ctxState, {
              schemaName: this.schemaName,
            }).getBy(
              {
                condition: { id: input.orderContactId },
                fields: ['*'],
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

    const jobSite = await JobSiteRepo.getInstance(this.ctxState).getById({ id: input.jobSiteId });

    let jobSite2;
    if (input.jobSite2Id) {
      jobSite2 = await JobSiteRepo.getInstance(this.ctxState).getById({ id: input.jobSite2Id });
    }

    return Object.assign(input, {
      businessUnit,
      billableService,
      customer,
      equipmentItem,
      material,
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
      'permitRequired',
      'mediaUrls',
    ];
  }

  async updateWithWo({ id, woNumber, newMediaFiles }, trx = this.knex, { logger }) {
    let result;
    try {
      result = await Promise.all([
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
      ]);
    } catch (error) {
      logger.error(error, `Work Order with ${id} cannot obtain its woNumber`);

      throw error;
    }

    return result;
  }

  async createOne({ data, newMediaFiles = [], fields = '*' } = {}, trx = this.knex) {
    const ctx = this.getCtx();
    const initialWoData = pick(data, this.initialWoFields);

    const woData = await this.fetchWorkOrderDataToCreateOrder(data, trx);

    // -1 means not created WO in Dispatch yet
    initialWoData.woNumber = -1;
    const workOrder = await super.createOne({ data: initialWoData, fields }, trx, {
      noRecord: true,
    });

    const { id } = workOrder;

    let createdWO;
    try {
      const dataTest = formDataForDispatch(woData);
      createdWO = await createWorkOrder(ctx, dataTest);
    } catch (error) {
      ctx.logger.info(error, 'Dispatch API returned 5XX error');
      throw dispatchInternalError;
    }

    if (!createdWO) {
      ctx.logger.error('Dispatch API complained about invalid input data for work order');
      throw invalidDataForDispatch;
    }

    const woNumber = createdWO.id;

    await this.updateWithWo(
      {
        id,
        woNumber,
        newMediaFiles,
      },
      trx,
      { logger: ctx.logger },
    );

    return workOrder;
  }

  async createDeferredOne({ data, fields = '*' } = {}, trx = this.knex) {
    const woData = pick(data, this.initialWoFields);

    // null means no WO in Dispatch yet since it's deferred Order related
    data.woNumber = null;

    return await super.createOne(
      {
        data: woData,
        fields,
      },
      trx,
      // we loose some init WO data but it's not important for Order history
      { noRecord: true },
    );
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
    { id, woNumber, currentMediaFiles, newMediaFiles, newData = {}, currentData = {}, unit = '' },
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
        const convertFn = newData.weightUnit === WEIGHT_UNIT.yards ? volumeToUnits : weightToUnits;
        await createWorkOrderNote(ctx, woNumber, {
          type: NOTE_TYPE.ticket,
          note: {
            picture: newData.ticketUrl,
            ticketNumber: newData.ticketNumber,
            quantity: convertFn(newData.weight, unit),
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
    const [currentMediaFiles, workOrder, company] = await Promise.all([
      mediaFileRepo.getUrlsByWorkOrderId(id, trx),
      this.updateBy({ condition: { id }, fields: ['*'], data: newData }, trx),
      CompanyRepo.getInstance(this.ctxState).getWithTenant({
        condition: { tenantName: this.ctxState.user.schemaName },
        fields: ['unit'],
      }),
    ]);

    await this.upsertMedia(
      {
        id,
        woNumber,
        currentMediaFiles,
        newMediaFiles: mediaFiles,
        newData,
        unit: company?.unit,
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
    const getSuspendedData = (data, { note, modifiedDate }) => {
      const updatedAtDate = zonedTimeToUtc(modifiedDate, 'UTC');

      switch (note.newState) {
        case NOTE_STATE.startWorkOrder: {
          data.startWorkOrderDate = updatedAtDate;
          break;
        }

        case NOTE_STATE.suspendedWorkOrder: {
          data.isSuspended = true;
          data.suspendedItems.push({
            driverId: data.driverId,
            haulHours: mathRound2(differenceInMinutes(updatedAtDate, data.startWorkOrderDate) / 60),
          });
          break;
        }

        case NOTE_STATE.completeWorkOrder: {
          if (data?.isSuspended) {
            data.suspendedItems.push({
              driverId: data.driverId,
              haulHours: mathRound2(
                differenceInMinutes(updatedAtDate, data.startWorkOrderDate) / 60,
              ),
            });
          }
          break;
        }

        case NOTE_STATE.reassignment: {
          if (data?.isSuspended) {
            data.isFinished = true;
          }
          data.driverId = note.driverId || data.driverId;
          break;
        }

        default: {
          if (data?.isSuspended && data?.isFinished) {
            data.isFinished = false;
            data.startWorkOrderDate = updatedAtDate;
          }
          break;
        }
      }

      return data;
    };

    const data = notes.reduceRight(cb, {});
    const suspendedData = notes.reduceRight(getSuspendedData, { suspendedItems: [] });
    if (!isEmpty(suspendedData?.suspendedItems)) {
      data.suspendedData = suspendedData.suspendedItems;
    }

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
      .map(({ note, id, workOrderId, createdBy }) => {
        const unitType = note?.unittype?.toLowerCase();
        return {
          workOrderId,
          dispatchId: id,
          csrName: createdBy,
          unitType,
          quantity: weightFromUnits(note.quantity, unitType),
          manifestNumber: note?.manifestNumber,
          url: note?.picture,
        };
      });

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

  static parseWorkOrderImages(notes, workOrderId) {
    return notes
      .filter(({ type, note }) => type === NOTE_TYPE.note && note.picture)
      .map(({ note, id, createdBy }) => ({
        workOrderId,
        author: createdBy,
        url: note.picture,
        fileName: `Work order media.${note.picture.split('.').pop()}`,
        dispatchId: id,
        timestamp: new Date(),
      }));
  }

  // Return null if all the required fields are provided,
  // otherwise the list of null fields
  static checkRequiredFields(workOrder, action, disposalSite) {
    const fields = [
      'driverId',
      'truckId',
      'startWorkOrderDate',
      'arriveOnSiteDate',
      'startServiceDate',
      'finishWorkOrderDate',
    ];

    fields.disposalSite = false;
    switch (ACTION[action]) {
      case ACTION.delivery: {
        fields.push('droppedEquipmentItem');
        break;
      }
      case ACTION.switch: {
        fields.push('droppedEquipmentItem', 'pickedUpEquipmentItem', 'ticket', 'weight');
        fields.disposalSite = true;
        break;
      }
      case ACTION.final: {
        fields.push('pickedUpEquipmentItem', 'ticket', 'weight');
        fields.disposalSite = true;
        break;
      }
      case ACTION.dumpReturn: {
        fields.push('droppedEquipmentItem', 'pickedUpEquipmentItem', 'ticket', 'weight');
        fields.disposalSite = true;
        break;
      }
      case ACTION.liveLoad: {
        fields.push('droppedEquipmentItem', 'pickedUpEquipmentItem', 'ticket', 'weight');
        fields.disposalSite = true;
        break;
      }
      case ACTION.reposition:
      case ACTION.relocate: {
        fields.push('droppedEquipmentItem', 'pickedUpEquipmentItem');
        break;
      }
      default: {
        break;
      }
    }

    const allValid = Object.values(pick(workOrder, fields)).every(v => v);

    fields.disposalSite && fields.push('disposalSite');

    if (allValid && (fields.disposalSite ? !!disposalSite : true)) {
      return null;
    }
    return fields;
  }

  getWorkOrderDataToCompleteOrder({ billableService, disposalSite, jobSite2, material }) {
    const data = {};
    if (jobSite2 && billableService?.action?.toUpperCase() === DISPATCH_ACTION.relocate) {
      data.location2 = {
        type: LOCATION_TYPE.waypoint,
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
        waypointName,
        waypointType: WAYPOINT_TYPE_IN_DISPATCH[disposalSite.waypointType],
        name: waypointName,
        description: disposalSite.description,
      };
    } else {
      data.haulingDisposalSiteId = null;
      // hacky way to nullify location2
      data.locationId2 = null;
    }

    if (material) {
      data.haulingMaterialId = material.originalId;
      data.material = material.description;
    }

    // billable service isn't editable on Complete form

    return Object.assign(data, { status: WO_STATUS.completed });
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

  async dispatchUpdates({ condition: { woNumber }, data } = {}, trx = this.knex) {
    const woStatus = data?.status;

    // not best place of this code but less code brings
    if (woStatus) {
      await super.updateBy(
        {
          condition: { woNumber },
          data: { status: woStatus },
          fields: [],
        },
        trx,
      );
    }

    let updatedWO;
    try {
      updatedWO = await updateWorkOrder(this.getCtx(), woNumber, data);
    } catch (error) {
      this.ctxState.logger.error(error);
      if (error?.details?.originalError?.code === 404 && woStatus !== WO_STATUS.inProgress) {
        // Need this for migrated orders, bcz in dispatch we dont have wo
        return this.ctxState.logger.error(
          `Probably work order ${woNumber} does not exist in dispatch.`,
        );
      }
      throw dispatchInternalError;
    }

    if (!updatedWO) {
      throw invalidDataForDispatch;
    }
    return this.ctxState.logger.info('Success Dispatch Updates');
  }

  async getWorkOrderDataToEditOrder(input, trx = this.knex) {
    const data = {
      scheduledDate: input.serviceDate || undefined,
      scheduledStart: input.bestTimeToComeFrom || undefined,
      scheduledEnd: input.bestTimeToComeTo || undefined,
      poNumber: input.purchaseOrderId || undefined,
      instructions: input.driverInstructions || undefined,
      earlyPickUp: input.earlyPick ? 1 : 0,
      okToRoll: input.toRoll ? 1 : 0,
      sos: input.someoneOnSite ? 1 : 0,
      priority: input.highPriority ? 1 : 0,
      signatureRequired: input?.workOrder?.signatureRequired ? 1 : 0,
      permittedCan: input?.workOrder?.permitRequired ? 1 : 0,
      cow: input.callOnWayPhoneNumber ? 1 : 0,
    };

    data.templateId = data.signatureRequired === 1 ? 1 : null;

    const { billableService, equipmentItem, material, disposalSite, permit, jobSite2 } = input;

    const orderContact = await ContactRepo.getHistoricalInstance(this.ctxState, {
      schemaName: this.schemaName,
    }).getBy(
      {
        condition: { id: input.orderContact.id },
        fields: ['firstName', 'lastName'],
      },
      trx,
    );

    if (billableService) {
      data.haulingBillableServiceId = billableService.originalId;
      data.size = equipmentItem.shortDescription;
      data.action =
        billableService.action === ACTION.dumpReturn
          ? DISPATCH_ACTION.dumpReturn
          : DISPATCH_ACTION[billableService.action];
      data.serviceDescription = billableService.description;
    }

    if (orderContact) {
      data.contactName = `${orderContact.firstName} ${orderContact.lastName}`;
    }

    data.contactNumber = input.callOnWayPhoneNumber ? `+${input.callOnWayPhoneNumber}` : null;
    data.textOnWay = input.textOnWayPhoneNumber ? `+${input.textOnWayPhoneNumber}` : null;

    if (permit) {
      data.permitNumber = permit.number;
    }
    // this will set the workOrder status to completed. No idea why Eleks did this for every order edit.
    Object.assign(
      data,
      this.getWorkOrderDataToCompleteOrder({
        billableService,
        disposalSite,
        jobSite2,
        material,
      }),
    );
    // In order to work around the above issue, we need to delete the status field from the data.
    // initially I was going to use the driverId to determine if the order was status ASSIGNED or if the driverId was missing, set the order
    // to status UNASSIGNED. Then finally, set the workOrder status to INPROGRESS if there was a step.
    // Unfortunately the hauling does not have access to this data all the time.
    // data.status = input?.workOrder?.driverId === null ? WO_STATUS.unassigned : input?.workOrder?.status;
    // Steven T 8/1/2022
    delete data.status;
    return data;
  }

  static async getAllDroppedCans(ctx, workOrders) {
    const workOrdersById = keyBy(workOrders, 'woNumber');

    const notes = await getAllWorkOrderNotes(ctx, Object.keys(workOrdersById));

    const isNoteRelevant = note =>
      isValid(new Date(note?.modifiedDate)) &&
      (note?.note?.newState === NOTE_STATE.dropCan
        ? !workOrdersById[note?.workOrderId]?.isRelocateFromJobSite
        : note?.note?.newState === NOTE_STATE.pickupCan);

    // Even if Dispatch API does not provide data for some work order, we just ignore it.
    return this.parseCanNotes(notes.filter(note => note && isNoteRelevant(note)));
  }

  async syncDataAndCalculateThresholdsAndManifests(order, isSyncWithDispatch = false) {
    const { woNumber, goingToFillDate, id: workOrderId } = order.workOrder;
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

    data.arriveOnSiteDate = data.arriveOnSiteDate
      ? data.arriveOnSiteDate
      : currentWO.arriveOnSiteDate;
    data.startServiceDate = data.startServiceDate
      ? data.startServiceDate
      : currentWO.startServiceDate;
    data.weight = data.weight ? data.weight : currentWO.weight;
    data.weightUnit = data.weightUnit ? data.weightUnit : currentWO.weightUnit;
    data.pickedUpEquipmentItem = data.pickedUpEquipmentItem
      ? data.pickedUpEquipmentItem
      : currentWO.pickedUpEquipmentItem;

    try {
      ({ thresholdsTotal, thresholdsItems } = await orderRepo.reCalculateThresholds(
        order,
        data,
        trx,
        isSyncWithDispatch,
      ));

      newLineItemsTotal = await orderRepo.reCalculateManifestsAndLineItems(
        order,
        { id: workOrderId, ...data },
        trx,
      );

      //update synced WO data
      woOrder = await this.updateBy(
        {
          condition: { woNumber },
          data: omit(data, ['manifests', 'mediaFiles', 'suspendedData']),
          fields: ['*'],
        },
        trx,
      );

      if (data.suspendedData) {
        const drivers = await DriverRepo.getInstance(this.ctxState).getAllByIds(
          { ids: data.suspendedData.map(({ driverId }) => driverId), fields: ['id', 'truckId'] },
          trx,
        );

        data.suspendedData.forEach(item => {
          item.truckId = drivers.find(({ id }) => id === item.driverId)?.truckId;
          item.workOrderId = workOrderId;
        });
        await WorkOrdersSuspendedRepo.getInstance(this.ctxState).insertMany(
          workOrderId,
          { data: data.suspendedData },
          trx,
        );
      }
      const mediaFiles = WorkOrderRepository.parseWorkOrderImages(woNotes, currentWO.id);
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
      userId: this.userId,
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
