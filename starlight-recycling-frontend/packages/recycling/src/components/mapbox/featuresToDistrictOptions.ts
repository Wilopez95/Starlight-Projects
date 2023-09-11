import { Feature, Geometry } from 'geojson';
import { uniqBy } from 'lodash-es';
import { AdministrativeDistrict } from '../../graphql/api';
import { layersMapUsToGeneral, TaxDistrictType } from './types';

export interface DistrictOption extends AdministrativeDistrict {
  geojson: Feature;
  layer: TaxDistrictType;
  fullName: string;
}

export interface TileFeature {
  type: string;
  id: number;
  geometry: Geometry;
  properties: {
    state?: string;
    primaryUnit?: string;
    county?: string;
    city?: string;
    level: string;
    name: string;
    tilequery?: {
      distance?: number;
      geometry?: string;
      layer: string;
    };
  };
}

export const featuresToDistrictOptions = (features: TileFeature[]): DistrictOption[] => {
  const districtOptions: DistrictOption[] = uniqBy(features, 'id').map((feature: TileFeature) => {
    const properties = feature.properties;

    const option: any = {
      id: feature.id,
      geojson: feature.geometry,
      name: properties.name,
      fullName: properties.name,
      level: properties.level ?? properties.tilequery?.layer,
      layer: properties.tilequery?.layer,
    };

    const state = properties.state ?? properties.primaryUnit;

    switch (properties.tilequery?.layer) {
      case layersMapUsToGeneral.state:
        option.state = properties.name;
        break;
      case layersMapUsToGeneral.city:
        option.city = properties.name;
        option.state = state;
        option.fullName += `, ${state}`;
        break;
      case layersMapUsToGeneral.county:
        option.county = properties.name;
        option.state = state;
        option.fullName += `, ${state}`;
        break;
      default:
        break;
    }

    return option;
  });

  return districtOptions;
};
