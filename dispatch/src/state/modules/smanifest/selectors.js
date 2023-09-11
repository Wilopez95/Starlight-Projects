import { createSelector } from 'reselect';

const initial = {
  customersById: {},
  customerIds: [],
  facilitiesById: {},
  facilityIds: [],
  byId: {},
  ids: [],
};
export const getSmanifest = (state) => state.smanifest || initial;
export const getManifestCustomerIds = (state) => getSmanifest(state).customerIds;
export const getFacilityIds = (state) => getSmanifest(state).facilityIds;
export const getManifestIds = (state) => getSmanifest(state).ids;

export const createSManifestEnabled = () =>
  createSelector(getSmanifest, (smanifest) => smanifest.enabled);

export const createSelectSManifestLoading = () =>
  createSelector(getSmanifest, (smanifest) => smanifest.isLoading);

export const manifestCustomersById = (state) => getSmanifest(state).customersById;

export const facilitiesById = (state) => getSmanifest(state).facilitiesById;

export const manifestsById = (state) => getSmanifest(state).byId;

export const selectManifests = createSelector([getManifestIds, manifestsById], (ids, man) =>
  ids.map((id) => man[id]),
);

export const selectManifestFacilities = createSelector(
  [getFacilityIds, facilitiesById],
  (ids, fac) => ids.map((id) => fac[id]),
);

export const selectManifestCustomers = createSelector(
  [getManifestCustomerIds, manifestCustomersById],
  (ids, custs) => ids.map((id) => custs[id]),
);
