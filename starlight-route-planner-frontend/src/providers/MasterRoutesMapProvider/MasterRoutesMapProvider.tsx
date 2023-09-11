import React, { createContext, useContext, useRef } from 'react';
import { action, computed, observable, runInAction } from 'mobx';

import { IRouteOptions } from '@root/common';
import { IMapMergeData } from '@root/types';

class MasterRoutesMapStore {
  // Map contain settings for pins in second level on map (visible)
  @observable masterRoutesMap: Map<number, IRouteOptions>;
  // Map contain settings for pins in third level on map (sequence .etc)
  @observable customizedRoutesMap: Map<number, IRouteOptions>;
  // Array contain all info about pins for third level on map
  @observable customizedSet: IMapMergeData[];
  // Show toast block on top of map (when checkbox is on in filter quick view)
  @observable showUnassignedJobSite: boolean;
  // Store popup info and (clicked by pin or outside map)
  @observable popupInfo?: IMapMergeData;
  // Track if user has any selected route from side list
  @observable masterRouteSelectedCount: number;

  constructor() {
    this.masterRoutesMap = new Map();
    this.customizedRoutesMap = new Map();
    this.customizedSet = [];
    this.showUnassignedJobSite = false;
    this.popupInfo = undefined;
    this.masterRouteSelectedCount = 0;
  }
  // Handle showing pin popup on map
  @action.bound
  setPopupInfo(data?: IMapMergeData) {
    this.popupInfo = data;
  }
  // Handle MR list item click (merge same id info, like visible need for map)
  @action.bound
  handleMasterRoutesOptions(id: number, options: IRouteOptions) {
    const existed = this.masterRoutesMap.get(id) ?? {};

    //if Obtions is visible === true at it to the MapFilter,
    // if it is not remove it from filter map
    if (options.visible) {
      this.masterRouteSelectedCount++;
      this.masterRoutesMap.set(id, {
        ...existed,
        ...options,
      });
    } else {
      this.masterRouteSelectedCount > 0
        ? this.masterRouteSelectedCount-- // Decrement counter
        : (this.masterRouteSelectedCount = 0);

      this.masterRoutesMap.delete(id);
      // if no selected routes clean up the filter map
      if (this.masterRouteSelectedCount === 0) {
        this.masterRoutesMap.clear();
      }
    }
  }
  // Handle third level pin settings (merge same id info, like optionColor, visible, sequence need for map)
  // Always pass original id property
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
  clearMasterRoutesMap() {
    this.masterRouteSelectedCount = 0;
    this.masterRoutesMap.clear();
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
  get getMasterRoutesMap() {
    return Array.from(this.masterRoutesMap.entries());
  }
}

const MapRoutesMapContext = createContext<MasterRoutesMapStore | undefined>(undefined);

const createGlobalStore = () => runInAction(() => new MasterRoutesMapStore());

export const useMasterRoutesMap = () => {
  const context = useContext(MapRoutesMapContext);

  return context as MasterRoutesMapStore;
};

export const MasterRoutesMapProvider: React.FC = ({ children }) => {
  const store = useRef<MasterRoutesMapStore>(createGlobalStore());

  return (
    <MapRoutesMapContext.Provider value={store.current}>{children}</MapRoutesMapContext.Provider>
  );
};
