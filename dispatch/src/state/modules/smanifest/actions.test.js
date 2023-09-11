import {
  fetchManifestCustReq,
  fetchManifestCustSuccess,
  fetchManifestCustFail,
  // fetchManifestCustomers,
  fetchOrgConfigReq,
  fetchOrgConfigSuccess,
  fetchOrgConfigFail,
} from './actions';
import * as t from './actionTypes';

describe('Structured Manifest actions', () => {
  it('should create an action to begin fetching customers', () => {
    const expectedAction = {
      type: t.FETCH_CUSTOMERS_REQUEST,
    };
    expect(fetchManifestCustReq()).toEqual(expectedAction);
  });
  it('should create an action for successfully fetching customers', () => {
    const fetchedCustomers = [
      { id: 1, name: 'test' },
      { id: 2, name: 'mest' },
    ];

    const expectedAction = {
      type: t.FETCH_CUSTOMERS_SUCCESS,
      payload: fetchedCustomers,
    };

    expect(fetchManifestCustSuccess(fetchedCustomers)).toEqual(expectedAction);
  });
  it('should create an action when fetching customers fails', () => {
    const expectedAction = {
      type: t.FETCH_CUSTOMERS_FAILURE,
      error: 'error',
    };

    expect(fetchManifestCustFail('error')).toEqual(expectedAction);
  });
  it('should create an action to begin fetching the org config', () => {
    const expectedAction = {
      type: t.FETCH_ORG_CONFIG_REQUEST,
    };
    expect(fetchOrgConfigReq()).toEqual(expectedAction);
  });
  it('should create an action for successfully fetching the org config', () => {
    const config = { enableStructuredManifest: true };

    const expectedAction = {
      type: t.FETCH_ORG_CONFIG_SUCCESS,
      payload: config,
    };

    expect(fetchOrgConfigSuccess(config)).toEqual(expectedAction);
  });
  it('should create an action when fetching the org config fails', () => {
    const expectedAction = {
      type: t.FETCH_ORG_CONFIG_FAILURE,
      error: 'error',
    };

    expect(fetchOrgConfigFail('error')).toEqual(expectedAction);
  });
});
