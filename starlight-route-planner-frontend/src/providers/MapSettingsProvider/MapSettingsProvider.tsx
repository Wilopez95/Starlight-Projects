import React, { createContext, useContext, useRef } from 'react';
import { action, observable, runInAction } from 'mobx';

import { WayPointType } from '@root/consts';

import { ItemsToShow } from './types';

class MapSettingsStore {
  @observable popupInfo: ItemsToShow;
  @observable isToggled: boolean;

  constructor() {
    this.popupInfo = {
      [WayPointType.HOME_YARD]: false,
      [WayPointType.LANDFILL]: false,
    };
    this.isToggled = false;
  }

  @action.bound
  setPopupInfoValues(data: ItemsToShow) {
    this.popupInfo = data;
  }

  @action.bound
  setFieldValue(field: WayPointType, value: boolean) {
    this.popupInfo[field] = value;
  }

  @action.bound
  toggleModal() {
    this.isToggled = !this.isToggled;
  }
}

export const MapSettingsContext = createContext<MapSettingsStore | undefined>(undefined);

export const useMapSettings = () => {
  const context = useContext(MapSettingsContext);

  return context as MapSettingsStore;
};

const createGlobalStore = () => runInAction(() => new MapSettingsStore());

export const MapSettingsProvider: React.FC = ({ children }) => {
  const store = useRef<MapSettingsStore>(createGlobalStore());

  return (
    <MapSettingsContext.Provider value={store.current}>{children}</MapSettingsContext.Provider>
  );
};
