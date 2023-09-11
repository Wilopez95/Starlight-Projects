import React, { createContext, useContext, useRef } from 'react';
import { action, computed, observable, runInAction } from 'mobx';

import { IRouteOptions } from '@root/common';
import { IMapMergeData } from '@root/types';

class DailyRoutesMapStore {
  // Map contain settings for pins in second level on map (visible)
  @observable dailyRoutesMap: Map<number, IRouteOptions>;
  // Map contain settings for pins in third level on map (sequence .etc)
  @observable customizedRoutesMap: Map<number, IRouteOptions>;
  // Array contain all info about pins for third level on map
  @observable customizedSet: IMapMergeData[];
  // Show toast block on top of map (when checkbox is on in filter quick view)
  @observable showUnassignedJobSite: boolean;
  // Store popup info and (clicked by pin or outside map)
  @observable popupInfo?: IMapMergeData;

  constructor() {
    this.dailyRoutesMap = new Map();
    this.customizedRoutesMap = new Map();
    this.customizedSet = [];
    this.showUnassignedJobSite = false;
    this.popupInfo = undefined;
  }
  // Handle showing pin popup on map
  @action.bound
  setPopupInfo(data?: IMapMergeData) {
    this.popupInfo = data;
  }
  // Handle DR list item click (merge same id info, like visible need for map)
  @action.bound
  handleDailyRoutesOptions(id: number, options: IRouteOptions) {
    const existed = this.dailyRoutesMap.get(id) ?? {};

    this.dailyRoutesMap.set(id, {
      ...existed,
      ...options,
    });
  }
  // Handle third level pin settings (merge same id info, like optionColor, visible, sequence need for map)
  @action.bound
  handleCustomizedRoutesOptions(id: number, options: IRouteOptions) {
    const existed = this.customizedRoutesMap.get(id) ?? {};

    this.customizedRoutesMap.set(id, {
      ...existed,
      ...options,
    });
  }
  // Push pins info for third level on map (like coordinates and more, used for merging info with settings like handleCustomizedRoutesOptions)
  @action.bound
  handleCustomizedMarkers(options: IMapMergeData) {
    this.customizedSet.push(options);
  }

  @action.bound
  clearDailyRoutesMap() {
    this.dailyRoutesMap.clear();
  }

  @action.bound
  clearCustomized() {
    this.customizedRoutesMap.clear();
  }

  @action.bound
  setShowUnassignedJobSite(value: boolean) {
    this.showUnassignedJobSite = value;
  }

  @computed
  get getCustomizedRoutes() {
    return Array.from(this.customizedRoutesMap.entries());
  }

  @computed
  get getDailyRoutesMap() {
    return Array.from(this.dailyRoutesMap.entries());
  }
}

const MapRoutesMapContext = createContext<DailyRoutesMapStore | undefined>(undefined);

const createGlobalStore = () => runInAction(() => new DailyRoutesMapStore());

export const useDailyRoutesMap = () => {
  const context = useContext(MapRoutesMapContext);

  return context as DailyRoutesMapStore;
};

export const DailyRoutesMapProvider: React.FC = ({ children }) => {
  const store = useRef<DailyRoutesMapStore>(createGlobalStore());

  return (
    <MapRoutesMapContext.Provider value={store.current}>{children}</MapRoutesMapContext.Provider>
  );
};
