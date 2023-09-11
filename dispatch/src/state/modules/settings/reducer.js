import * as t from './actionTypes';

const initialState = {
  fetchStatus: 'UNTOUCHED',
  updateStatus: 'UNTOUCHED',
  isLoading: false,
  driver: {},
  map: {
    lat: 39.7621969,
    lon: -104.9749398,
    zoom: 10,
  },
  data: null,
  error: null,
};

export default function setting(state = initialState, action) {
  switch (action.type) {
    case t.FETCH_SETTING_REQUEST:
      return {
        ...state,
        isLoading: true,
        fetchStatus: 'LOADING',
        updateStatus: 'NONE',
        data: null,
      };
    case t.RECEIVE_SETTING:
      return {
        ...state,
        fetchStatus: 'DONE',
        data: action.data,
        isLoading: false,
      };
    case t.RECEIVE_MAP_SETTING:
      return {
        ...state,
        map: action.data.value?.location
          ? {
              zoom: action.data.value?.zoom,
              lat: action.data.value?.location?.location?.lat,
              lon: action.data.value?.location?.location?.lon,
              description: action.data.value?.location?.description,
              name: action.data.value?.location?.name,
            }
          : // need to be refractored, in case we are changing map settings we need one output in all other cases we need with default map settings
          window.location.pathname === '/configuration/map-settings'
          ? {
              zoom: '',
              lat: undefined,
              lon: undefined,
              description: undefined,
              name: undefined,
            }
          : { ...state.map },
        isLoading: false,
      };
    case t.RECEIVE_DRIVER_SETTING:
      return {
        ...state,
        driver: action.data.value,
        isLoading: false,
      };
    case t.FETCH_SETTING_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: action.error,
        fetchStatus: 'FAILURE',
      };
    case t.UPDATE_SETTING_REQUEST:
      return {
        ...state,
        isLoading: true,
        updateStatus: 'UPDATING',
      };
    case t.UPDATE_SETTING_SUCCESS:
      return {
        ...state,
        isLoading: false,
        updateStatus: 'DONE',
        driver: action.data[0].value,
        data: action.data,
        map: action.data[0]?.value.location
          ? {
              zoom: action.data[0]?.value.zoom,
              lat: action.data[0]?.value.location.lat,
              lon: action.data[0]?.value.location.lon,
              name: action.data[0]?.value.location.name,
              description: action.data[0]?.value.location.description,
            }
          : { ...state.map },
      };
    case t.UPDATE_SETTING_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: action.error,
        fetchStatus: 'UNTOUCHED',
        updateStatus: 'FAILURE',
      };

    default:
      return state;
  }
}
