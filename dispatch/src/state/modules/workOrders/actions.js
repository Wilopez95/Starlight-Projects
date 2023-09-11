/* eslint-disable no-param-reassign */
/* eslint-disable complexity, camelcase, func-names */
import moment from 'moment';
import { toast } from '@root/components/Toast';
import request, { createCancelToken, isCancel } from '../../../helpers/request';
import { fetchWOserviceMaterials } from '../services/actions';
import * as t from './actionTypes';

export function importWOsReq() {
  return { type: t.IMPORT_WOS_REQUEST };
}

export function importWOsSuccess() {
  return { type: t.IMPORT_WOS_SUCCESS };
}

export function importWOsFail(error) {
  return { type: t.IMPORT_WOS_FAILURE, error };
}

export function importWorkOrders(type, data) {
  return async (dispatch) => {
    dispatch(importWOsReq());

    try {
      const response = await request.post('/workorders/import', data, {
        params: { type },
      });
      dispatch(importWOsSuccess());
      return response;
    } catch (error) {
      dispatch(importWOsFail(error));
      return Promise.reject(error);
    }
  };
}

export function exportWOsReq() {
  return { type: t.EXPORT_WOS_REQUEST };
}

export function exportWOsSuccess() {
  return { type: t.EXPORT_WOS_SUCCESS };
}

export function exportWOsFail(error) {
  return { type: t.EXPORT_WOS_FAILURE, error };
}

export function exportWorkOrders(params = {}) {
  return async (dispatch) => {
    dispatch(exportWOsReq());

    try {
      const response = await request.get('/workorders/export', { params });
      dispatch(exportWOsSuccess());
      return response;
    } catch (error) {
      dispatch(exportWOsFail(error));
      return Promise.reject(error);
    }
  };
}
export function resetWoFilter() {
  return { type: t.WOS_FILTER_RESET };
}

export function setActiveWorkOrder(wo) {
  return { type: t.SET_ACTIVE_WO, workOrder: wo };
}

export function unsetActiveWorkOrder() {
  return { type: t.UNSET_ACTIVE_WO };
}

export function filterChange(data) {
  return { type: t.WOS_FILTER_CHANGE, data };
}

export function removeWoReq() {
  return { type: t.REMOVE_WO_REQUEST };
}

export function removeWoSuccess(id) {
  return { type: t.REMOVE_WO_SUCCESS, id };
}

export function removeWoFail(error) {
  return { type: t.REMOVE_WO_FAILURE, error };
}

export function removeWorkOrder(id) {
  return (dispatch) => {
    dispatch(removeWoReq());

    return request
      .delete(`/workorders/${id}`)
      .then(() => dispatch(removeWoSuccess(id)))
      .catch((error) => dispatch(removeWoFail(error)));
  };
}

export function fetchWOsReq() {
  return { type: t.FETCH_WOS_REQUEST };
}

export function fetchWOsSuccess(wodata = []) {
  return {
    type: t.FETCH_WOS_SUCCESS,
    workorders: wodata,
  };
}

function convertData(data) {
  data.forEach((order) => {
    delete order.driver?.updatedAt;
    delete order.driver?.truck?.location;
    delete order?.modifiedDate;
    delete order?.modifiedBy;
  });
  return data;
}

export function fetchWOsFail(error) {
  return { type: t.FETCH_WOS_FAILURE, error };
}

export function receiveFilteredWOs(workorders = []) {
  return { type: t.RECEIVE_FILTERED_WOS, workorders: convertData(workorders) };
}

export function receiveNonDispFilteredWOs(workorders = []) {
  return { type: t.RECEIVE_FILTERED_WOS, workorders };
}

const findValueInString = (string = '', value) => {
  const values = string.split(',');

  return Boolean(values.find((val) => val === value));
};

export const filterWorkOrders = (workorders, filter) => {
  function parseTimeAM(time) {
    if (time !== null) {
      const timeInt = parseInt(time, 10);

      if (time < '12:00') {
        return `${timeInt} AM`;
      }
    }
    return undefined;
  }

  function parseTimePM(time) {
    if (time !== null) {
      const timeInt = parseInt(time, 10);

      if (time > '12:00') {
        return `${timeInt - 12} PM`;
      }
    }
    return undefined;
  }
  return workorders.filter(
    (order) =>
      (filter.scheduledStart ? order.scheduledStart : true) &&
      (filter.scheduledStartAM ? parseTimeAM(order.scheduledStart) : true) &&
      (filter.scheduledStartPM ? parseTimePM(order.scheduledStart) : true) &&
      (filter.cow ? order.cow : true) &&
      (filter.sos ? order.sos : true) &&
      (filter.alleyPlacement ? order.alleyPlacement : true) &&
      (filter.permittedCan ? order.permittedCan : true) &&
      (filter.earlyPickUp ? order.earlyPickUp : true) &&
      (filter.cabOver ? order.cabOver : true) &&
      (filter.okToRoll ? order.okToRoll : true) &&
      (filter.priority ? order.priority : true) &&
      (filter.suspensionLocationId ? order.suspensionLocation.id : true) &&
      (filter.status ? order.status === filter.status : true) &&
      (filter.customerProvidedProfile
        ? order.customerProvidedProfile === filter.customerProvidedProfile
        : true) &&
      (filter.action ? findValueInString(filter.action, order.action) : true) &&
      (filter.size ? findValueInString(filter.size, order.size) : true) &&
      (filter.material ? findValueInString(filter.material, order.material) : true) &&
      (filter.negotiatedFill ? order.negotiatedFill : true),
  );
};

export const decorateFilter = (filter) => {
  const { date } = filter;
  return {
    ...filter,
    date:
      date && date.startDate && date.endDate
        ? `${moment(date.startDate).format('YYYY-MM-DD')}..${moment(date.endDate).format(
            'YYYY-MM-DD',
          )}`
        : null,
  };
};

let cancel;

export const clearCancelToken = () => {
  cancel = null;
};

export const cancelPrevRequest = () => cancel();

const saveCancelToken = (c) => {
  cancel = c;
};

// //put the data in the correct order by id
// function compare(a, b) {
//   if (a.id < b.id) {
//     return -1;
//   }
//   if (a.id > b.id) {
//     return 1;
//   }
//   return 0;
// }

export const fetchWorkOrders =
  (filter = {}, type = 'dispatch') =>
  async (dispatch, getState) => {
    filter = decorateFilter(filter);
    dispatch(fetchWOsReq());

    if (cancel) {
      cancelPrevRequest();
    }

    try {
      const { bounds, search, date, businessUnitId } = filter;

      const { data: orders } = await request.get('/workorders', {
        cancelToken: createCancelToken(saveCancelToken),
        params: { bounds, search, date, businessUnitId },
      });

      clearCancelToken();
      if (getState().dispatcher && getState().dispatcher.unpublished > 0) {
        return;
      }

      dispatch(fetchWOsSuccess(orders));
      if (type === 'workorders') {
        dispatch(
          receiveNonDispFilteredWOs(
            filterWorkOrders(orders, filter || getState().workOrders.filter),
          ),
        );
      } else {
        dispatch(receiveFilteredWOs(filterWorkOrders(orders, filter)));
      }
    } catch (error) {
      if (!isCancel(error)) {
        dispatch(fetchWOsFail(error));
      }
    }
  };

export const updateWosReq = () => ({
  type: t.UPDATE_WOS_REQUEST,
});

export const updateWosSuccess = (data) => ({
  type: t.UPDATE_WOS_SUCCESS,
  data,
});

export const updateWosFail = (error) => ({
  type: t.UPDATE_WOS_FAILURE,
  error,
});

export const setWorkOrders = (data) => ({
  type: t.SET_WOS,
  data,
});

export const updateWorkOrder = (data) => async (dispatch) => {
  dispatch(updateWosReq());
  try {
    const response = await request.put('/workorders', data);
    dispatch(updateWosSuccess(response.data));
    return response;
  } catch (error) {
    dispatch(updateWosFail(error));
    return Promise.reject(error);
  }
};

export const updateWoReq = () => ({
  type: t.UPDATE_WO_REQUEST,
});

export const updateWoWithDriverSuccess = (data, driver) => ({
  type: t.UPDATE_WO_SUCCESS_WITH_DRIVER,
  data,
  driver,
});

export const updateWoSuccess = (data) => ({
  type: t.UPDATE_WO_SUCCESS,
  data,
});

export const updateWoFail = (error) => ({
  type: t.UPDATE_WO_FAILURE,
  error,
});

export const updateSingleWorkOrder =
  (data, filter, type = 'dispatch') =>
  async (dispatch, getState) => {
    dispatch(updateWoReq());
    try {
      const response = await request.put(`/workorders/${data.id}`, data);
      dispatch(updateWoSuccess(response.data));
      // if it is workorders type (for workorders table)then return modified date otherwise if dispatch don't return
      if (!type || type === undefined || type === null) {
        type = 'dispatch';
      }
      dispatch(fetchWorkOrders(filter || getState().workOrders.filter, type));
      return response;
    } catch (error) {
      dispatch(updateWoFail(error));
      return Promise.reject(error);
    }
  };

export const updateSingleWorkOrderWithDriver = (data, driver) => async (dispatch) => {
  dispatch(updateWoReq());

  try {
    const response = await request.put(`/workorders/${data.id}`, data);
    dispatch(updateWoWithDriverSuccess(response.data, driver));
    return response;
  } catch (error) {
    dispatch(updateWoFail(error));
    return Promise.reject(error);
  }
};

export function createWoReq() {
  return { type: t.CREATE_WO_REQUEST };
}

export function createWoSuccess(data) {
  return { type: t.CREATE_WO_SUCCESS, data };
}

export function createWoFail(error) {
  return { type: t.CREATE_WO_FAILURE, error };
}

export function createWorkOrder(data, filter, type) {
  return async (dispatch, getState) => {
    dispatch(createWoReq());

    try {
      const response = await request.post('/workorders', data);
      dispatch(createWoSuccess(response.data));

      // for workorders tab we want to passs the modifiedDate, however, we do not for the dispatcher tab
      // passing in a new param to create function. checks the route params then passes type based on params
      // params = workorders = workorders tab; dispatch = dispatcher tab
      dispatch(fetchWorkOrders(filter || getState().workOrders.filter, type));
     return/*  */ toast.success('Work order created successfully.', {
        position: toast.POSITION.BOTTOM_RIGHT,
      });
    } catch (error) {
      dispatch(createWoFail(error));
      return Promise.reject(error);
    }
  };
}

export const forgetWorkOrder = () => ({ type: t.FORGET_WO });

export const fetchWoReq = () => ({ type: t.FETCH_WO_REQUEST });

export const fetchWoSuccess = (workOrder) => ({
  type: t.FETCH_WO_SUCCESS,
  workOrder,
});

export const fetchWoFail = (error) => ({
  type: t.FETCH_WO_FAILURE,
  error,
});

export const fetchWorkOrder = (workOrderId, isWOfromCore) => async (dispatch) => {
  dispatch(fetchWoReq());

  try {
    const { data: WoData } = await request.get(`/workorders/${workOrderId}`);

    if (isWOfromCore) {
      dispatch(fetchWOserviceMaterials(workOrderId));
    }

    dispatch(fetchWoSuccess(WoData));
    return WoData;
  } catch (error) {
    dispatch(fetchWoFail(error));
    return Promise.reject(error);
  }
};

export const createPath = (workOrderId, newState) =>
  `/workorders/${workOrderId}/transition/${newState}`;

export const setWorkOrderState = (workOrderId, newState) => async (dispatch) => {
  dispatch({ type: t.SET_WO_STATE_REQUEST });

  try {
    const response = await request.post(createPath(workOrderId, newState));
    dispatch({ type: t.SET_WO_STATE_SUCCESS });
    return response;
  } catch (error) {
    dispatch({ type: t.SET_WO_STATE_FAILURE, error });
    return Promise.reject(error);
  }
};

export const fetchSuspendedOrdersRequest = () => ({
  type: t.FETCH_SUSPENDED_ORDERS_REQUEST,
});

export const fetchSuspendedOrdersSuccess = (data) => ({
  type: t.FETCH_SUSPENDED_ORDERS_SUCCESS,
  data,
});

export const fetchSuspendedOrdersFailure = (error) => ({
  type: t.FETCH_SUSPENDED_ORDERS_REQUEST,
  error,
});

export const fetchSuspendedWorkOrders = (businessUnitId) => async (dispatch) => {
  dispatch(fetchSuspendedOrdersRequest());

  try {
    const { data } = await request.get(
      `/workorders?suspended=1&status=UNASSIGNED,ASSIGNED,INPROGRESS&businessUnitId=${businessUnitId}`,
    );
    dispatch(fetchSuspendedOrdersSuccess(data));
    return data;
  } catch (error) {
    dispatch(fetchSuspendedOrdersFailure(error));
    return Promise.reject(error);
  }
};
