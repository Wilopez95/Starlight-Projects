import { v4 as uuidv4 } from 'uuid';

// entities
import { OrderMaterialDistribution } from '../../entities/OrderMaterialDistribution';
import { OrderMiscellaneousMaterialDistribution } from '../../entities/OrderMiscellaneousMaterialDistribution';
import Order, { OrderStatus } from '../../entities/Order';

// types and constants
import { AMQP_QUEUE_TRUCK_ON_WAY } from '../../../../config';

// utils
import {
  getOrderMaterialDistribution,
  getOrderMiscellaneousMaterialDistribution,
} from '../../graphql/resolvers/utils/getOrderMaterialDistribution';
import { createFacilitySrn } from '../../../../utils/srn';
import { getFacilityEntitiesAndConnection } from '../../utils/facilityConnection';

// services
import {
  truckOnWayOrderObservable,
  TruckOnWayOrderEvent,
  TruckOnWayEventType,
} from '../../../../services/core/truckOnWay';
import {
  getHaulingOrder,
  getOrCreateOrderFromHaulingOrder,
} from '../../../../services/core/haulingOrder';
import { createLogger } from '../../../../services/logger';
import { DisposalSite } from '../../../../services/core/types/DisposalSite';
import { HaulingMaterialHttpService } from '../../../../services/core/haulingMaterials';
import { getOrCreateCustomer } from '../../../../services/core/haulingCustomer';
import { getOrCreateCustomerGroup } from '../../../../services/core/haulingCustomerGroup';
import {
  getOrCreateCustomerJobSite,
  getOrCreateJobSite,
} from '../../../../services/core/haulingJobSite';
import { getTruckOnWayMappedMaterialId } from '../../../../services/core/haulingDisposalSite';
import { getOrCreateProject } from '../../../../services/core/haulingProject';
import { getUser } from '../../../../services/ums/users';

const truckOnWayLogger = createLogger({
  prettyPrint: {
    messageFormat:
      'TruckOnWay: reqId={reqId}, tenant={tenantName}, event={eventName}, WO={woNumber}. {msg}',
  },
});

truckOnWayOrderObservable.subscribe(async (truckOnWayEvent: TruckOnWayOrderEvent) => {
  const { haulingOrderId, tenantName, eventName, userId } = truckOnWayEvent;
  const reqId = uuidv4();
  const logger = truckOnWayLogger.child({
    ...truckOnWayEvent,
    reqId,
    queue: AMQP_QUEUE_TRUCK_ON_WAY,
  });

  const user = await getUser({ id: userId });

  logger.info('Received Truck on Way Event', truckOnWayEvent);

  const haulingOrder = await getHaulingOrder(parseInt(haulingOrderId), tenantName, reqId);
  const { disposalSite, businessUnit } = haulingOrder;

  if (!(disposalSite && disposalSite.recycling)) {
    logger.warn('Disposal site is not a Starlight Facility.');

    return;
  }

  const { recyclingTenantName, businessUnitId: recyclingBUId } = disposalSite as DisposalSite;
  const recyclingSrn = createFacilitySrn({
    tenantName: recyclingTenantName,
    businessUnitId: recyclingBUId,
  });
  const [, connectionEntities] = await getFacilityEntitiesAndConnection(recyclingSrn);
  const CtxOrder = connectionEntities.Order as typeof Order;
  const ctx = {
    userInfo: {
      email: user?.email || null,
      firstName: user?.firstName || null,
      lastName: user?.lastName || null,
      id: AMQP_QUEUE_TRUCK_ON_WAY,
      permissions: [],
      resource: recyclingSrn,
      tenantId: 0, // todo: fix tenant id
    },
    reqId,
    resource: recyclingSrn,
  };

  if ([TruckOnWayEventType.canceled, TruckOnWayEventType.completed].includes(eventName)) {
    const order = await CtxOrder.findOne({ where: { truckOnWayId: haulingOrderId } });

    if (order && order.status === OrderStatus.ON_THE_WAY) {
      order.useContext(ctx);
      await order.softRemove();

      logger.info(`Successfully deleted ${eventName} TruckOnWay order entry.`);

      return;
    }

    logger.warn(`Related order entry to ${eventName} hauling order not found, skipping.`);

    return;
  }

  try {
    const order = await getOrCreateOrderFromHaulingOrder({
      CtxOrder,
      haulingOrder,
    });

    const haulerSrn = createFacilitySrn({
      tenantName: tenantName,
      businessUnitId: businessUnit.id,
    });
    const customerGroup = await getOrCreateCustomerGroup(ctx);
    const customer = await getOrCreateCustomer({ ctx, haulerSrn, customerGroup, businessUnit });
    const jobSite = await getOrCreateJobSite(ctx, tenantName, haulingOrder.jobSite);
    const customerJobSite = await getOrCreateCustomerJobSite(ctx, customer.id, jobSite.id);
    const materialId = await getTruckOnWayMappedMaterialId(ctx, tenantName, haulingOrder);
    const project = await getOrCreateProject(ctx, haulingOrder.project, customerJobSite.id);

    order.useContext(ctx);
    order.customerId = customer.id;
    order.jobSiteId = jobSite.id;
    order.customerJobSiteId = customerJobSite.id;
    order.materialId = materialId || undefined;
    order.projectId = project?.id;
    const isUpdate = order.id;

    const upsertedOrder = await CtxOrder.getRepository().manager.transaction(
      async (entityManager) => {
        await entityManager.save(order);

        if (!isUpdate) {
          const materials = await new HaulingMaterialHttpService().get(ctx, {
            activeOnly: true,
          });
          order.materialsDistribution = getOrderMaterialDistribution(
            order,
            materials.data,
            connectionEntities.OrderMaterialDistribution as typeof OrderMaterialDistribution,
          );
          order.miscellaneousMaterialsDistribution = getOrderMiscellaneousMaterialDistribution(
            order,
            materials.data,
            connectionEntities.OrderMiscellaneousMaterialDistribution as typeof OrderMiscellaneousMaterialDistribution,
          );

          await entityManager.save(order.materialsDistribution);
          await entityManager.save(order.miscellaneousMaterialsDistribution);
        }
        await entityManager.save(order);

        return order;
      },
    );

    if (upsertedOrder) {
      logger.info(`Successfully ${isUpdate ? 'updated' : 'created'} Truck on Way Order.`);
    } else {
      logger.error('Failed to add Truck on Way order.');
    }
  } catch (error) {
    logger.error(error, 'Error while processing Truck on Way event.');
  }
});
