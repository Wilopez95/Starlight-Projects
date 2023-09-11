import { createSelector } from 'reselect';

export const getMaterials = (state) => state.materials;
export const getMaterialsById = (state) => state.materials.byId;
export const getMaterialsIds = (state) => state.materials.ids;
export const getMaterialsLoading = (state) => state.materials.isLoading;

export const selectMaterials = createSelector([getMaterialsIds, getMaterialsById], (ids, mat) =>
  ids.map((id) => mat[id]),
);

export const selectMaterial = (state, id) => state.materials.byId[id];
