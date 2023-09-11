import axios from 'axios';

import Order from '../../modules/recycling/entities/Order';
import { CORE_SERVICE_API_URL } from '../../config';
import { parseFacilitySrn } from '../../utils/srn';
import { logger as serviceLogger } from '../logger';
import { createToken } from '../../utils/serviceToken';
import { AUDIT_LOG_ACTION } from '../../constants/auditLog';

export const postOrderAuditLog = async (
  data: Partial<Order>,
  action: AUDIT_LOG_ACTION,
  {
    resource,
    userId,
    requestId,
  }: {
    resource: string;
    userId: string;
    requestId: string;
  },
): Promise<any> => {
  const { businessUnitId, tenantName } = parseFacilitySrn(resource);

  const token = await createToken(
    {
      schemaName: tenantName,
      tenantName,
      userId,
    },
    {
      audience: 'core',
      requestId,
    },
  );

  const { haulingOrderId, ...logData } = data;

  const body = {
    entityId: haulingOrderId,
    entity: 'Order',
    action,
    businessUnitId,
    data: {
      ...logData,
      weightTicketId: logData.id,
      id: haulingOrderId,
    },
  };

  try {
    return axios.post<any>(`${CORE_SERVICE_API_URL}/audit-log/recycling-order-publish`, body, {
      headers: {
        Authorization: `ServiceToken ${token}`,
      },
    });
  } catch (e) {
    serviceLogger.error(`Failed to post audit log for order with ID ${data.id}: ${e.message}`, e);

    throw e;
  }
};
