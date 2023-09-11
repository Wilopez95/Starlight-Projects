/* eslint-disable complexity, camelcase, func-names */

import request from '../../../helpers/request';
import * as t from './actionTypes';

//= =====================fetchWOServices===========================

export function fetchWOServicesReq() {
  return { type: t.FETCH_WO_SERVICES_REQUEST };
}

export function fetchWOServicesSuccess(services) {
  return {
    type: t.FETCH_WO_SERVICES_SUCCESS,
    services,
  };
}

export function fetchWOServicesFail(error) {
  return { type: t.FETCH_WO_SERVICES_FAILURE, error };
}

export function fetchWOServices(workOrderId, materialId) {
  return async (dispatch) => {
    dispatch(fetchWOServicesReq());

    try {
      const { data } = await request.get(`workorders/${workOrderId}/billable-services`, {
        params: { materialId },
      });
      dispatch(fetchWOServicesSuccess(data));
      return data;
    } catch (error) {
      dispatch(fetchWOServicesFail(error));
      return Promise.reject(error);
    }
  };
}

//= =====================fetchWOserviceMaterials===========================

export function etchWOserviceMaterialsReq() {
  return { type: t.FETCH_WO_SERVICES_MATERIALS_REQUEST };
}

export function fetchWOserviceMaterialsSuccess(serviceMaterials) {
  return {
    type: t.FETCH_WO_SERVICES_MATERIALS_SUCCESS,
    serviceMaterials,
  };
}

export function fetchWOserviceMaterialsFail(error) {
  return { type: t.FETCH_WO_SERVICES_MATERIALS_FAILURE, error };
}

export function fetchWOserviceMaterials(workOrderId) {
  return async (dispatch) => {
    dispatch(etchWOserviceMaterialsReq());

    try {
      const { data } = await request.get(
        `workorders/${workOrderId}/materials`,
        // {
        //   params: {
        //     id,
        //   },
        // },
      );
      dispatch(fetchWOserviceMaterialsSuccess(data));
      return data;
    } catch (error) {
      dispatch(fetchWOserviceMaterialsFail(error));
      return Promise.reject(error);
    }
  };
}

//= =====================fetchWOserviceDisposalSites===========================

export function fetchWOserviceDisposalSitesReq() {
  return { type: t.FETCH_WO_SERVICES_DISPOSAL_SITES_REQUEST };
}

export function fetchWOserviceDisposalSitesSuccess(serviceDisposalSites) {
  return {
    type: t.FETCH_WO_SERVICES_DISPOSAL_SITES_SUCCESS,
    serviceDisposalSites,
  };
}

export function fetchWOserviceDisposalSitesFail(error) {
  return { type: t.FETCH_WO_SERVICES_DISPOSAL_SITES_FAILURE, error };
}

export function fetchWOserviceDisposalSites(workOrderId) {
  return async (dispatch) => {
    dispatch(fetchWOserviceDisposalSitesReq());
    try {
      const { data } = await request.get(`workorders/${workOrderId}/disposal-sites`);

      dispatch(fetchWOserviceDisposalSitesSuccess(data));
      return data;
    } catch (error) {
      dispatch(fetchWOserviceDisposalSitesFail(error));
      return Promise.reject(error);
    }
  };
}
