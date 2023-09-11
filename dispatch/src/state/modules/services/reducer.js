import * as t from './actionTypes';

export const initialState = {
  services: [],
  serviceMaterials: [],
  serviceDisposalSites: [],
};

export default function workOrderServices(state = initialState, action) {
  switch (action.type) {
    case t.FETCH_WO_SERVICES_REQUEST:
    case t.FETCH_WO_SERVICES_MATERIALS_REQUEST:
    case t.FETCH_WO_SERVICES_DISPOSAL_SITES_REQUEST:
      return {
        ...state,
        isLoading: true,
      };
    case t.FETCH_WO_SERVICES_SUCCESS:
      return {
        ...state,
        services: action.services,
        isLoading: false,
      };
    case t.FETCH_WO_SERVICES_MATERIALS_SUCCESS:
      return {
        ...state,
        serviceMaterials: action.serviceMaterials,
        isLoading: false,
      };
    case t.FETCH_WO_SERVICES_DISPOSAL_SITES_SUCCESS:
      return {
        ...state,
        serviceDisposalSites: action.serviceDisposalSites,
        isLoading: false,
      };
    case t.FETCH_WO_SERVICES_FAILURE:
    case t.FETCH_WO_SERVICES_MATERIALS_FAILURE:
    case t.FETCH_WO_SERVICES_DISPOSAL_SITES_FAILURE:
      return {
        ...state,
        isLoading: false,
      };

    default:
      return state;
  }
}
