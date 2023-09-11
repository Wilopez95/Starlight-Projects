import { createSelector } from 'reselect';

export const selectdrivers = (state) => state.driverHauls;

export const createSelectHaulsLoading = () =>
  createSelector(selectdrivers, (haulsState) => haulsState.isLoading);

export const driversByIdSelector = (state) => state.driverhauls.byId;

export const driversSelector = (state, id) => state.driverhauls.byId[id];
