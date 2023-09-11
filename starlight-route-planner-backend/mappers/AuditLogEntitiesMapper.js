// @ts-check
import pick from 'lodash/pick.js';

import { MASTER_ROUTE_AL_ENTITIES } from '../consts/masterRoute.js';
import { SERVICE_ITEM_AL_ENTITIES } from '../consts/serviceItem.js';
import { JOB_SITE_AL_ENTITIES } from '../consts/jobSite.js';

export default class AuditLogEntitiesMapper {
  static mapMasterRoute(masterRoute) {
    const masterRouteFieldsToLog = pick(masterRoute, MASTER_ROUTE_AL_ENTITIES);

    return {
      ...masterRouteFieldsToLog,
      serviceItems: this._mapServiceItems(masterRouteFieldsToLog.serviceItems),
    };
  }

  static _mapServiceItems(serviceItems) {
    const mappedData = serviceItems.map(serviceItem => {
      const { haulingId, jobSite, ...restServiceItem } = pick(
        serviceItem,
        SERVICE_ITEM_AL_ENTITIES,
      );

      return {
        ...restServiceItem,
        jobSite: this._mapJobSite(jobSite),
        id: haulingId,
      };
    });

    return mappedData;
  }

  static _mapJobSite(jobSite) {
    const jobSiteFieldsToLog = pick(jobSite, JOB_SITE_AL_ENTITIES);

    return jobSiteFieldsToLog;
  }
}
