// import { batch } from 'react-redux';
// import { can as canSchema } from 'state/schema';
import request, { createCancelToken, isCancel } from '@root/helpers/request';
import { toast } from '@root/components/Toast';
import * as t from './actionTypes';

export function importCansRequest() {
  return { type: t.IMPORT_CANS_REQUEST };
}

export function importCansSuccess() {
  return { type: t.IMPORT_CANS_SUCCESS };
}

export function importCansFailure(error) {
  return { type: t.IMPORT_CANS_FAILURE, error };
}

export function importCans(type, data) {
  return async (dispatch) => {
    dispatch(importCansRequest());

    try {
      const response = await request.post('/cans/import', data, {
        params: { type },
      });
      dispatch(importCansSuccess());
      return response;
    } catch (error) {
      return dispatch(importCansFailure(error));
    }
  };
}

export function exportCansRequest() {
  return { type: t.EXPORT_CANS_REQUEST };
}

export function exportCansSuccess() {
  return { type: t.EXPORT_CANS_SUCCESS };
}

export function exportCansFailure(error) {
  return { type: t.EXPORT_CANS_FAILURE, error };
}

export function exportCans(params = {}) {
  return async (dispatch) => {
    dispatch(exportCansRequest());

    try {
      const response = await request.get('/cans/export', { params });
      dispatch(exportCansSuccess());
      return response;
    } catch (error) {
      dispatch(exportCansFailure(error));
      return Promise.reject(error);
    }
  };
}

export function exportCansAgingRequest() {
  return { type: t.EXPORT_CANS_AGING_REQUEST };
}

export function exportCansAgingSuccess() {
  return { type: t.EXPORT_CANS_AGING_SUCCESS };
}

export function exportCansAgingFailure(error) {
  return { type: t.EXPORT_CANS_AGING_FAILURE, error };
}

export function exportCansAging(params = {}) {
  return async (dispatch) => {
    dispatch(exportCansAgingRequest());

    try {
      const response = await request.get('/reports/cans-aging', { params });
      dispatch(exportCansAgingSuccess());
      return response;
    } catch (error) {
      dispatch(exportCansAgingFailure(error));
      return Promise.reject(error);
    }
  };
}

export function addCanRequest() {
  return { type: t.ADD_CAN_REQUEST };
}

export function addCanSuccess(data) {
  return { type: t.ADD_CAN_SUCCESS, data };
}

export function addCanFailure(error) {
  return { type: t.ADD_CAN_FAILURE, error };
}

export function addCan(data, businessUnitId) {
  return async (dispatch) => {
    dispatch(addCanRequest());

    try {
      if (data.location && data.location.name) {
        if (data.location.name.includes('USA') === true) {
          data.location.name.substring(0, data.location.name.length - 5);
          data.location.seedName.substring(0, data.location.seedName.length - 5);
        }
      }
      const response = await request.post('/cans', {
        businessUnitId: +businessUnitId,
        ...data,
      });
      toast.success('Can created successfully.', {
        position: toast.POSITION.BOTTOM_RIGHT,
      });
      return dispatch(addCanSuccess(response.data));
    } catch (error) {
      dispatch(addCanFailure(error));
      return Promise.reject(error);
    }
  };
}

export function filterChange(data) {
  return { type: t.CANS_FILTER_CHANGE, data };
}

export function fetchCansRequest(data) {
  return { type: t.FETCH_CANS_REQUEST, data };
}

export function fetchCansFailure(error) {
  return { type: t.FETCH_CANS_FAILURE, error };
}

export function receiveCans(cans = []) {
  return {
    type: t.RECEIVE_CANS,
    cans,
  };
}

export function receiveFilteredCans(cans = []) {
  return {
    type: t.RECEIVE_FILTERED_CANS,
    cans,
  };
}

let cancel;

export const clearCancelToken = () => {
  cancel = null;
};

export const cancelPrevRequest = () => cancel();

const saveCancelToken = (c) => {
  cancel = c;
};

export const findValueInString = (string, value) => {
  const values = string.split(',');

  return Boolean(values.find((val) => val === value));
};

const filterByStatus = (can, filter) => {
  if (filter.isRequiredMaintenance || filter.isOutOfService || filter.hazardous || filter.inUse) {
    const isCanRequiredMaintenance = filter.isRequiredMaintenance && can.requiresMaintenance;
    const isCanOutOfService = filter.isOutOfService && can.outOfService;
    const isCanHazardous = filter.hazardous && can.hazardous;
    const inCanUse = filter.inUse && can.inUse;

    return isCanRequiredMaintenance || isCanOutOfService || isCanHazardous || inCanUse;
  }
  return true;
};

export const filterCans = (cans, filter) =>
  cans.filter(
    (can) =>
      (filter.size ? findValueInString(filter.size, can.size) : true) &&
      filterByStatus(can, filter),
  );

export const decorateFilter = (filter) => {
  const { date } = filter;

  return {
    ...filter,
    date: date && date.startDate && date.endDate ? `${date.startDate}..${date.endDate}` : null,
  };
};

let prevFilter = {};

export const needFetchCans = (filter) =>
  filter.date !== prevFilter.date ||
  filter.bounds !== prevFilter.bounds ||
  filter.status !== prevFilter.status ||
  filter.search !== prevFilter.search ||
  filter.allowNullLocations !== prevFilter.allowNullLocations;

export const fetchCans =
  (params = {}, refreshCans = false) =>
  // eslint-disable-next-line consistent-return
  async (dispatch, getState) => {
    const { businessUnitId } = params;
    const filter = decorateFilter(params);
    const isNeedFetch = needFetchCans(filter) || refreshCans;
    dispatch(fetchCansRequest({ loading: !refreshCans, businessUnitId }));
    prevFilter = filter;
    if (isNeedFetch) {
      if (cancel) {
        cancelPrevRequest();
      }

      try {
        const { bounds, search, date, status, allowNullLocations, businessUnitId } = filter;
        const { data } = await request.get('/cans', {
          cancelToken: createCancelToken(saveCancelToken),
          params: {
            bounds,
            search,
            date,
            status,
            allowNullLocations,
            withTransactions: 0,
            businessUnitId,
          },
        });

        clearCancelToken();
        dispatch(receiveCans(data));
        dispatch(receiveFilteredCans(filterCans(data, filter)));
        return data;
      } catch (error) {
        if (!isCancel(error)) {
          dispatch(fetchCansFailure(error));
          return Promise.reject(error);
        }
      }
    } else {
      const {
        cans: { list: cans },
      } = getState();
      return dispatch(receiveFilteredCans(filterCans(cans, filter)));
    }
  };

export function removeCanRequest() {
  return { type: t.REMOVE_CAN_REQUEST };
}

export function removeCanSuccess(id) {
  return { type: t.REMOVE_CAN_SUCCESS, id };
}

export function removeCanFailure(error) {
  return { type: t.REMOVE_CAN_FAILURE, error };
}

export const removeCan = (id) => async (dispatch) => {
  dispatch(removeCanRequest());

  try {
    await request.delete(`/cans/${id}`);
    dispatch(removeCanSuccess(id));
  } catch (error) {
    dispatch(removeCanFailure(error));
    Promise.reject(error);
  }
};

export const updateCanRequest = () => ({
  type: t.UPDATE_CAN_REQUEST,
});

export const updateCanSuccess = (data) => ({
  type: t.UPDATE_CAN_SUCCESS,
  data,
});

export const updateCanFailure = (error) => ({
  type: t.UPDATE_CAN_FAILURE,
  error,
});

export const updateCan = (data) => async (dispatch) => {
  dispatch(updateCanRequest());

  try {
    const response = await request.put(`/cans/${data.id}`, data);
    dispatch(updateCanSuccess(response.data));
    return response;
  } catch (error) {
    dispatch(updateCanFailure(error));
    return Promise.reject(error);
  }
};

export function unsetActiveCan() {
  return { type: t.UNSET_ACTIVE_CAN };
}

export const fetchTransactionsFailure = () => ({
  type: t.FETCH_TRANSACTIONS_FAILURE,
});

export const fetchTransactionsSuccess = (data) => ({
  type: t.FETCH_TRANSACTIONS_SUCCESS,
  can: data,
});

export const fetchTransactionsRequest = (can) => ({
  type: t.FETCH_TRANSACTIONS_REQUEST,
  can,
});

// eslint-disable-next-line consistent-return
export const setActiveCan = (can, loading) => async (dispatch) => {
  if (loading) {
    dispatch(fetchTransactionsRequest(can));
  }

  if (cancel) {
    cancelPrevRequest();
  }
  try {
    const { data } = await request.get(`/cans/${can.id}`, {
      cancelToken: createCancelToken(saveCancelToken),
    });

    clearCancelToken();
    dispatch(fetchTransactionsSuccess(data));
    return data;
  } catch (error) {
    if (!isCancel(error)) {
      dispatch(fetchTransactionsFailure());
      return Promise.reject(error);
    }
  }
};

export const dropOffCanRequest = () => ({
  type: t.DROPOFF_CAN_REQUEST,
});

export const dropOffCanSuccess = (data) => ({
  type: t.DROPOFF_CAN_SUCCESS,
  data,
});

export const dropOffCanFailure = (error) => ({
  type: t.DROPOFF_CAN_FAILURE,
  error,
});

export const dropOffCan = (id, location) => async (dispatch) => {
  dispatch(dropOffCanRequest());

  try {
    const response = await request.put(`/cans/${id}/dropoff`, location);
    dispatch(dropOffCanSuccess(response.data));
    return response;
  } catch (error) {
    dispatch(dropOffCanFailure(error));
    return Promise.reject(error);
  }
};

export const moveCanRequest = () => ({
  type: t.MOVE_CAN_REQUEST,
});

export const moveCanSuccess = () => ({
  type: t.MOVE_CAN_SUCCESS,
});

export const moveCanFailure = (error) => ({
  type: t.MOVE_CAN_FAILURE,
  error,
});

export const moveCan = (id, location) => async (dispatch) => {
  dispatch(moveCanRequest());

  try {
    await request.put(`/cans/${id}/move`, location);
    dispatch(moveCanSuccess());
  } catch (error) {
    dispatch(moveCanFailure(error));
    Promise.reject(error);
  }
};

export function createCanNoteRequest() {
  return { type: t.CREATE_CAN_NOTE_REQUEST };
}

export function createCanNoteSuccess() {
  return { type: t.CREATE_CAN_NOTE_SUCCESS };
}

export function createCanNoteFailure(error) {
  return { type: t.CREATE_CAN_NOTE_FAILURE, error };
}

export function createCanNote(canId, note) {
  return async (dispatch) => {
    dispatch(createCanNoteRequest());

    try {
      await request.post(`/cans/${canId}/note`, note);
      dispatch(createCanNoteSuccess());
    } catch (error) {
      dispatch(createCanNoteFailure(error));
      Promise.reject(error);
    }
  };
}

export const pickUpCanRequest = () => ({
  type: t.PICKUP_CAN_REQUEST,
});

export const pickUpCanSuccess = (data) => ({
  type: t.PICKUP_CAN_SUCCESS,
  data,
});

export const pickUpCanFailure = (error) => ({
  type: t.PICKUP_CAN_FAILURE,
  error,
});

export const pickUpCan = (id, truck) => async (dispatch) => {
  dispatch(pickUpCanRequest());

  try {
    const response = await request.put(`/cans/${id}/pickup`, truck);
    dispatch(pickUpCanSuccess(response.data));
    return response;
  } catch (error) {
    dispatch(pickUpCanFailure(error));
    return Promise.reject(error);
  }
};

export const transferCanRequest = () => ({
  type: t.TRANSFER_CAN_REQUEST,
});

export const transferCanSuccess = (data) => ({
  type: t.TRANSFER_CAN_SUCCESS,
  data,
});

export const transferCanFailure = (error) => ({
  type: t.TRANSFER_CAN_FAILURE,
  error,
});

export const transferCan = (id, truck) => async (dispatch) => {
  dispatch(transferCanRequest());

  try {
    const response = await request.put(`/cans/${id}/transfer`, truck);
    dispatch(transferCanSuccess(response.data));
    return response;
  } catch (error) {
    dispatch(transferCanFailure(error));
    return Promise.reject(error);
  }
};

export const fetchCanRequest = () => ({ type: t.FETCH_CAN_REQUEST });

export const fetchCanSuccess = (data) => ({
  type: t.FETCH_CAN_SUCCESS,
  data,
});

export const fetchCanFailure = (error) => ({
  type: t.FETCH_CAN_FAILURE,
  error,
});

export const fetchCan = (canId) => async (dispatch) => {
  dispatch(fetchCanRequest());

  try {
    const { data } = await request.get(`/cans/${canId}`);
    dispatch(fetchCanSuccess(data));
  } catch (error) {
    dispatch(fetchCanFailure(error));
    Promise.reject(error);
  }
};

export const resetRefreshCans = () => ({
  type: t.RESET_REFRESH_CANS,
});
