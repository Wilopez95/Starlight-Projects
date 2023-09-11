import request from '@root/helpers/request';
import { authApiService } from '@root/helpers/apiService';
import { toast } from '@root/components/Toast';
import * as t from './actionTypes';

export function createCustomerRequest() {
  return {
    type: t.CREATE_CUSTOMER_REQUEST,
  };
}

export function createCustomerSuccess(data) {
  return {
    type: t.CREATE_CUSTOMER_SUCCESS,
    payload: data,
  };
}

export function createCustomerFailure(error) {
  return {
    type: t.CREATE_CUSTOMER_FAILURE,
    error,
  };
}

export function createCustomer(formData) {
  return async (dispatch) => {
    dispatch(createCustomerRequest());

    try {
      const payload = {
        name: formData.name,
        address: formData.address,
        city: formData.city,
        state: formData.state.value,
        zip: formData.zip,
        phone: formData.phone,
        authorizedRep: formData.authorizedRep,
      };

      const { data } = await request.post('manifest-customers', payload);
      toast.success('Customer created', {
        position: toast.POSITION.BOTTOM_RIGHT,
      });
      return dispatch(createCustomerSuccess(data));
    } catch (error) {
      dispatch(createCustomerFailure(error));
      return Promise.reject(error);
    }
  };
}

export function fetchManifestCustReq() {
  return {
    type: t.FETCH_CUSTOMERS_REQUEST,
  };
}

export function fetchManifestCustSuccess(custs) {
  return {
    type: t.FETCH_CUSTOMERS_SUCCESS,
    payload: custs,
  };
}

export function fetchManifestCustFail(error) {
  return {
    type: t.FETCH_CUSTOMERS_FAILURE,
    error,
  };
}

export function fetchManifestCustomers() {
  return async (dispatch) => {
    dispatch(fetchManifestCustReq());

    try {
      const { data } = await request.get('manifest-customers');
      return dispatch(fetchManifestCustSuccess(data));
    } catch (error) {
      dispatch(fetchManifestCustFail(error));
      return Promise.reject(error);
    }
  };
}

export function shouldFetchCustomers(state) {
  const customers = state.smanifest.customerIds;
  if (!customers.length) {
    return true;
  }
  if (state.smanifest.isLoading) {
    return false;
  }
  return false;
}

export function fetchCustomersIfNeeded() {
  return (dispatch, getState) => {
    if (shouldFetchCustomers(getState())) {
      return dispatch(fetchManifestCustomers());
    }
    // Let the calling code know there's nothing to wait for.
    return Promise.resolve();
  };
}

export function fetchOrgConfigReq() {
  return {
    type: t.FETCH_ORG_CONFIG_REQUEST,
  };
}

export function fetchOrgConfigSuccess(data) {
  return {
    type: t.FETCH_ORG_CONFIG_SUCCESS,
    payload: data,
  };
}

export function fetchOrgConfigFail(error) {
  return {
    type: t.FETCH_ORG_CONFIG_FAILURE,
    error,
  };
}

/**
 * @description fetches organization config from the
 * auth api. Provides the enableStructuredManifest value
 * @param {Number} orgId the organization id
 * @returns Promise
 */
export function getOrgConfig(orgId) {
  return async (dispatch) => {
    dispatch(fetchOrgConfigReq());

    try {
      const { data } = await authApiService.get(`organizations/${orgId}/config`);

      return dispatch(fetchOrgConfigSuccess(data));
    } catch (error) {
      return dispatch(fetchOrgConfigFail(error.response.data.message));
    }
  };
}

export function createFacilityRequest() {
  return {
    type: t.CREATE_FACILITY_REQUEST,
  };
}

export function createFacilitySuccess(data) {
  return {
    type: t.CREATE_FACILITY_SUCCESS,
    payload: data,
  };
}

export function createFacilityFailure(error) {
  return {
    type: t.CREATE_FACILITY_FAILURE,
    error,
  };
}

export function createFacility(formData) {
  return async (dispatch) => {
    dispatch(createFacilityRequest());

    try {
      const payload = {
        name: formData.name,
        address: formData.address,
        city: formData.city,
        state: formData.state.value,
        zip: formData.zip,
        phone: formData.phone,
      };

      const { data } = await request.post('facilities', payload);
      toast.success('Facility created', {
        position: toast.POSITION.BOTTOM_RIGHT,
      });
      return dispatch(createFacilitySuccess(data));
    } catch (error) {
      dispatch(createFacilityFailure(error));
      return Promise.reject(error);
    }
  };
}

export function fetchFacilitiesReq() {
  return {
    type: t.FETCH_FACILITIES_REQUEST,
  };
}

export function fetchFacilitiesSuccess(custs) {
  return {
    type: t.FETCH_FACILITIES_SUCCESS,
    payload: custs,
  };
}

export function fetchFacilitiesFail(error) {
  return {
    type: t.FETCH_FACILITIES_FAILURE,
    error,
  };
}

export function fetchFacilities() {
  return async (dispatch) => {
    dispatch(fetchFacilitiesReq());

    try {
      const { data } = await request.get('facilities');
      return dispatch(fetchFacilitiesSuccess(data));
    } catch (error) {
      dispatch(fetchFacilitiesFail(error));
      return Promise.reject(error);
    }
  };
}

export function shouldFetchFacilities(state) {
  const facilities = state.smanifest.facilityIds;
  if (!facilities.length) {
    return true;
  }
  if (state.smanifest.isLoading) {
    return false;
  }
  return false;
}

export function fetchFacilitiesIfNeeded() {
  return (dispatch, getState) => {
    if (shouldFetchFacilities(getState())) {
      return dispatch(fetchFacilities());
    }
    return Promise.resolve();
  };
}

export function fetchManifestsReq() {
  return {
    type: t.FETCH_S_MANIFESTS_REQUEST,
  };
}

export function fetchManifestsSuccess(manifests) {
  return {
    type: t.FETCH_S_MANIFESTS_SUCCESS,
    payload: manifests,
  };
}

export function fetchManifestsFail(error) {
  return {
    type: t.FETCH_S_MANIFESTS_FAILURE,
    error,
  };
}

export function fetchStructuredManifests() {
  return async (dispatch) => {
    dispatch(fetchManifestsReq());

    try {
      const { data } = await request.get('structured-manifests');
      return dispatch(fetchManifestsSuccess(data));
    } catch (error) {
      dispatch(fetchManifestsFail(error));
      return Promise.reject(error);
    }
  };
}

export function shouldFetchStructuredManifests(state) {
  const manifests = state.smanifest.ids;
  if (!manifests.length) {
    return true;
  }
  if (state.smanifest.isLoading) {
    return false;
  }
  return false;
}

export function fetchStructuredManifestsIfNeeded() {
  return (dispatch, getState) => {
    if (shouldFetchStructuredManifests(getState())) {
      return dispatch(fetchStructuredManifests());
    }
    return Promise.resolve();
  };
}
