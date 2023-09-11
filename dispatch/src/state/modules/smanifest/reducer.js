import { combineReducers } from 'redux';
import { addIdToArray } from '../../../helpers/addIdToArray';
import * as t from './actionTypes';

const customersById = (state = {}, action) => {
  switch (action.type) {
    case t.FETCH_CUSTOMERS_SUCCESS: {
      const entry = {};
      for (let i = 0; i < action.payload.length; i += 1) {
        const item = action.payload[i];
        entry[item.id] = item;
      }
      return {
        ...state,
        ...entry,
      };
    }
    case t.CREATE_CUSTOMER_SUCCESS: {
      const entry = {};
      entry[action.payload.id] = action.payload;
      return {
        ...state,
        ...entry,
      };
    }
    default:
      return state;
  }
};

const customerIds = (state = [], action) => {
  switch (action.type) {
    case t.FETCH_CUSTOMERS_SUCCESS:
      return [...state, ...action.payload.map((o) => o.id)];
    case t.CREATE_CUSTOMER_SUCCESS:
      return addIdToArray(state, action.payload.id);
    default:
      return state;
  }
};
const facilitiesById = (state = {}, action) => {
  switch (action.type) {
    case t.FETCH_FACILITIES_SUCCESS: {
      const entry = {};
      for (let i = 0; i < action.payload.length; i += 1) {
        const item = action.payload[i];
        entry[item.id] = item;
      }
      return {
        ...state,
        ...entry,
      };
    }
    case t.CREATE_FACILITY_SUCCESS: {
      const entry = {};
      entry[action.payload.id] = action.payload;
      return {
        ...state,
        ...entry,
      };
    }
    default:
      return state;
  }
};

const facilityIds = (state = [], action) => {
  switch (action.type) {
    case t.FETCH_FACILITIES_SUCCESS:
      return [...state, ...action.payload.map((o) => o.id)];
    case t.CREATE_FACILITY_SUCCESS:
      return addIdToArray(state, action.payload.id);
    default:
      return state;
  }
};

const enabled = (state = false, action) => {
  switch (action.type) {
    case t.FETCH_ORG_CONFIG_SUCCESS:
      return action.payload.enableStructuredManifest;
    case t.FETCH_ORG_CONFIG_REQUEST:
    case t.FETCH_ORG_CONFIG_FAILURE:
      return false;
    default:
      return state;
  }
};

const isLoading = (state = false, action) => {
  switch (action.type) {
    case t.FETCH_CUSTOMERS_REQUEST:
    case t.CREATE_CUSTOMER_REQUEST:
    case t.FETCH_S_MANIFESTS_REQUEST:
    case t.FETCH_FACILITIES_REQUEST:
    case t.CREATE_FACILITY_REQUEST:
    case t.FETCH_ORG_CONFIG_REQUEST:
      return true;
    case t.FETCH_CUSTOMERS_SUCCESS:
    case t.FETCH_CUSTOMERS_FAILURE:
    case t.CREATE_CUSTOMER_FAILURE:
    case t.FETCH_S_MANIFESTS_SUCCESS:
    case t.FETCH_S_MANIFESTS_FAILURE:
    case t.FETCH_FACILITIES_SUCCESS:
    case t.FETCH_FACILITIES_FAILURE:
    case t.CREATE_FACILITY_SUCCESS:
    case t.CREATE_FACILITY_FAILURE:
    case t.FETCH_ORG_CONFIG_SUCCESS:
    case t.FETCH_ORG_CONFIG_FAILURE:
      return false;
    default:
      return state;
  }
};

const errorMessage = (state = null, action) => {
  switch (action.type) {
    case t.FETCH_CUSTOMERS_FAILURE:
    case t.CREATE_CUSTOMER_FAILURE:
    case t.FETCH_FACILITIES_FAILURE:
    case t.CREATE_FACILITY_FAILURE:
    case t.FETCH_S_MANIFESTS_FAILURE:
      return action.error;
    case t.FETCH_CUSTOMERS_REQUEST:
    case t.FETCH_CUSTOMERS_SUCCESS:
    case t.CREATE_CUSTOMER_REQUEST:
    case t.CREATE_CUSTOMER_SUCCESS:
    case t.FETCH_S_MANIFESTS_REQUEST:
    case t.FETCH_S_MANIFESTS_SUCCESS:
    case t.FETCH_FACILITIES_REQUEST:
    case t.FETCH_FACILITIES_SUCCESS:
    case t.CREATE_FACILITY_REQUEST:
    case t.CREATE_FACILITY_SUCCESS:
      return null;
    default:
      return state;
  }
};

const byId = (state = {}, action) => {
  switch (action.type) {
    case t.FETCH_S_MANIFESTS_SUCCESS: {
      const entry = {};
      for (let i = 0; i < action.payload.length; i += 1) {
        const item = action.payload[i];
        entry[item.id] = item;
      }
      return {
        ...state,
        ...entry,
      };
    }
    default:
      return state;
  }
};

const ids = (state = [], action) => {
  switch (action.type) {
    case t.FETCH_S_MANIFESTS_SUCCESS:
      return [...state, ...action.payload.map((o) => o.id)];
    default:
      return state;
  }
};

const smanifest = combineReducers({
  enabled,
  customersById,
  customerIds,
  facilitiesById,
  facilityIds,
  byId,
  ids,
  isLoading,
  errorMessage,
});

export default smanifest;
