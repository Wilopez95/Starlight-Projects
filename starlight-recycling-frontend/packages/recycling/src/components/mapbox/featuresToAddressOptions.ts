import { FeatureCollection } from 'geojson';
import { Maybe } from '../../graphql/api';

export interface AddressOption {
  id?: string | number;
  text: string;
  address: string;
  address2: Maybe<string>;
  city: string;
  country?: string;
  county?: string;
  postcode: string;
  state: string;
  placeType: string;
  center: [number, number];
  geojson?: FeatureCollection;
}

export const featuresToAddressOptions = (features: any) => {
  return features.map((feature: any) => {
    const context = feature.context;
    const featureType = feature.place_type[0];
    const properties = feature.properties;

    const option: any = {
      id: feature.id,
      center: feature.center,
      text: feature.place_name,
      address: properties.address || '',
      address2: '',
      placeType: featureType,
      geojson: feature,
    };

    switch (featureType) {
      case 'region':
        option.state = feature.text;
        break;

      case 'address':
        option.address = `${feature.address || ''} ${feature.text}`.trim();
        break;

      case 'place':
        option.city = feature.text;
        break;

      case 'postcode':
        option.postcode = feature.text;
        break;
    }

    if (!context) {
      return option;
    }

    return context.reduce((addressOption: any, contextItem: any) => {
      const [type] = contextItem.id.split('.');

      switch (type) {
        case 'postcode':
          addressOption.postcode = contextItem.text;
          break;

        case 'place':
        case 'locality':
          addressOption.city = contextItem.text;
          break;

        case 'region':
          addressOption.state = contextItem.text;
          break;

        case 'country':
          addressOption.country = contextItem.text;
          break;

        case 'address':
          option.address = contextItem.text;
          break;
      }

      return addressOption;
    }, option);
  });
};
