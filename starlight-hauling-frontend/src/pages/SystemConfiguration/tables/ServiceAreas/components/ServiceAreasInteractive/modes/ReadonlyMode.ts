import { IMinimalMapboxDrawMode } from './types';

const ReadonlyMode: IMinimalMapboxDrawMode<Record<string, string>> = {
  map: null,
  onSetup: function () {
    return {};
  },
  toDisplayFeatures: function (_, geojson, display: (args: Record<string, string>) => void) {
    display(geojson);
  },
};

export { ReadonlyMode };
