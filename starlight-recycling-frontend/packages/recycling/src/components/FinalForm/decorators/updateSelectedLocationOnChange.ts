import { debounce } from 'lodash-es';
import { FormApi } from 'final-form';
import { forwardGeocode, PromiseCancelable } from '../../mapbox';
import { AddressOption } from '../AddressSearchField';
import { Region } from '../../../i18n/region';

export const valuesToSelectedLocation = (destination: any): AddressOption => {
  return {
    text: [
      [destination.lineAddress1, destination.lineAddress2].filter((v) => !!v?.trim()).join(', '),
      destination.city,
      destination.state,
      destination.country,
      destination.zip,
    ]
      .filter((v) => !!v?.trim())
      .join(', '),
    address: destination.lineAddress1,
    address2: destination.lineAddress2,
    city: destination.city,
    country: destination.country,
    postcode: destination.zip,
    state: destination.state,
    placeType: 'input',
    center: destination?.geojson?.center || [0, 0],
    geojson: destination.geojson || null,
  };
};

export const updateSelectedLocationOnChange = (countryCode: Region) => (form: FormApi) => {
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
        ...valuesToSelectedLocation(form.getState().values),
        center,
        geojson: option.geojson,
      });
    });
  }, 300);

  const updateIfChanged = (name: string, oldValue: any, newValue: any) => {
    if (oldValue === newValue) {
      return;
    }

    form.change(name, newValue);
  };

  const unsubscribe = form.subscribe(
    ({ values }) => {
      form.batch(() => {
        const { selectedLocation, lineAddress1, lineAddress2, city, state, zip, geojson } = values;

        if (previousValues.selectedLocation !== selectedLocation && selectedLocation) {
          updateIfChanged('lineAddress1', lineAddress1, selectedLocation.address);
          updateIfChanged('lineAddress2', lineAddress2, selectedLocation.address2);
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
          selectedLocation.address !== lineAddress1 ||
          selectedLocation.address2 !== lineAddress2 ||
          selectedLocation.city !== city ||
          selectedLocation.state !== state ||
          selectedLocation.postcode !== zip
        ) {
          updateSelectedLocation({
            ...valuesToSelectedLocation(values),
          });
        }
      });
    },
    { values: true },
  );

  return unsubscribe;
};
