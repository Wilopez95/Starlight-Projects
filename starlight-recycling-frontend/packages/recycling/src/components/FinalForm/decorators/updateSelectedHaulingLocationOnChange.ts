import { debounce } from 'lodash-es';
import { FormApi } from 'final-form';
import { forwardGeocode, PromiseCancelable } from '../../mapbox';
import { AddressOption } from '../AddressSearchField';
import { HaulingDestination } from '../../../graphql/api';
import { Region } from '../../../i18n/region';

export const valuesToSelectedHaulingLocation = (destination: HaulingDestination): AddressOption => {
  return {
    text: [
      [destination.addressLine1, destination.addressLine2].filter((v) => !!v?.trim()).join(', '),
      destination.city,
      destination.state,
      destination.zip,
    ]
      .filter((v) => !!v?.trim())
      .join(', '),
    address: destination.addressLine1,
    address2: destination.addressLine2 || null,
    city: destination.city,
    postcode: destination.zip,
    state: destination.state,
    placeType: 'input',
    center: destination?.geojson?.center || [0, 0],
    geojson: destination.geojson,
  };
};

export const updateSelectedHaulingLocationOnChange = (countryCode: Region) => (form: FormApi) => {
  let previousValues: any = {};
  let requestInFlight: PromiseCancelable<AddressOption[] | null> | null = null;

  const updateSelectedLocation = debounce((addressOption: AddressOption) => {
    if (requestInFlight) {
      requestInFlight.cancel();
    }

    requestInFlight = forwardGeocode(addressOption.text, countryCode);

    requestInFlight.then((addressOptions) => {
      requestInFlight = null;

      const option = (addressOptions || [])[0];
      const center = option?.center;

      if (!center) {
        return;
      }

      form.change('selectedLocation', {
        ...valuesToSelectedHaulingLocation(form.getState().values as HaulingDestination),
        center,
        geojson: option.geojson,
      });
    });
  }, 300);

  const updateIfChanged = (name: string, oldValue: any, newValue: any) => {
    if (oldValue === newValue && newValue !== '') {
      return;
    }

    form.change(name, newValue || null);
  };

  return form.subscribe(
    ({ values }) => {
      form.batch(() => {
        const { selectedLocation, addressLine1, addressLine2, city, state, zip, geojson } = values;

        if (previousValues.selectedLocation !== selectedLocation && selectedLocation) {
          updateIfChanged('addressLine1', addressLine1, selectedLocation.address);
          updateIfChanged('addressLine2', addressLine2, selectedLocation.address2);
          updateIfChanged('city', city, selectedLocation.city);
          updateIfChanged('state', city, selectedLocation.state);
          updateIfChanged('zip', zip, selectedLocation.postcode);
          updateIfChanged('geojson', geojson, selectedLocation.geojson);

          previousValues = values;

          return;
        }

        // selectedLocation is cleared
        if (previousValues.selectedLocation && !selectedLocation) {
          previousValues = values;

          return;
        }

        previousValues = values;

        if (
          !selectedLocation ||
          selectedLocation.address !== addressLine1 ||
          selectedLocation.address2 !== addressLine2 ||
          selectedLocation.city !== city ||
          selectedLocation.state !== state ||
          selectedLocation.postcode !== zip
        ) {
          // eslint-disable-next-line
          // @ts-ignore
          updateSelectedLocation({
            ...valuesToSelectedHaulingLocation(values as HaulingDestination),
          });
        }
      });
    },
    { values: true },
  );
};
