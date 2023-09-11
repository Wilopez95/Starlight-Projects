import knex from '../../db/connection.js';

import ContactRepo from '../../repos/contact.js';

import { ACTION } from '../../consts/actions.js';
import { DISPATCH_ACTION } from '../../consts/workOrder.js';
import getWorkOrderDataToCompleteOrder from './utils/getWorkOrderDataToCompleteOrder.js';

const getWorkOrderDataToEditOrder = async (ctx, order, trx = knex) => {
  ctx.logger.debug(`getWorkOrderDataToEditOrder->order: ${JSON.stringify(order, null, 2)}`);

  const contactRepo = ContactRepo.getHistoricalInstance(ctx.state);

  try {
    const data = {
      scheduledDate: order.serviceDate || undefined,
      scheduledStart: order.bestTimeToComeFrom || undefined,
      scheduledEnd: order.bestTimeToComeTo || undefined,
      poNumber: order.purchaseOrderId || undefined,
      instructions: order.driverInstructions || undefined,
      earlyPickUp: order.earlyPick ? 1 : 0,
      okToRoll: order.toRoll ? 1 : 0,
      sos: order.someoneOnSite ? 1 : 0,
      priority: order.highPriority ? 1 : 0,
      signatureRequired: order?.customerJobSite?.signatureRequired ? 1 : 0,
      cow: order.callOnWayPhoneNumber ? 1 : 0,
    };

    data.templateId = data.signatureRequired === 1 ? 1 : null;

    const { billableService, equipmentItem, material, disposalSite, permit, jobSite2 } = order;

    const orderContact = await contactRepo.getBy(
      {
        condition: { id: order.orderContact.id },
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

    data.contactNumber = order.callOnWayPhoneNumber ? `+${order.callOnWayPhoneNumber}` : null;
    data.textOnWay = order.textOnWayPhoneNumber ? `+${order.textOnWayPhoneNumber}` : null;

    if (permit) {
      data.permitNumber = permit.number;
    }

    Object.assign(
      data,
      getWorkOrderDataToCompleteOrder({
        billableService,
        disposalSite,
        jobSite2,
        material,
      }),
    );

    delete data.status;
    return data;
  } catch (error) {
    ctx.logger.error(error, `Error while getting WO data to edit an order with id ${order.id}`);
    throw error;
  }
};

export default getWorkOrderDataToEditOrder;
