import React, { memo, useRef, useEffect, useCallback, useMemo } from 'react';
import { Point } from 'geojson';
import { useField } from 'react-final-form';
import { AddressOption } from '../../mapbox/featuresToAddressOptions';
import InteractiveMap from '../../mapbox/InteractiveMap';
import Marker, { MarkerHandle } from '../../mapbox/Marker';
import { reverseGeocode, forwardGeocode } from '../../mapbox/services';
import { useRegion } from '../../../hooks/useRegion';

interface AddressMapFieldProps {
  className: string;
  wrapClassName?: string;
  name: string;
  onChange?(option: AddressOption | null): void;
  readOnly?: boolean;
}

export const AddressMapFieldFC = memo<AddressMapFieldProps>(
  ({ className, onChange, wrapClassName, name, readOnly }) => {
    const { input } = useField(name, { subscription: { value: true } });
    const markerRef = useRef<MarkerHandle>(null);
    const marker = markerRef.current;
    const value = input.value;
    const valueRef = useRef<AddressOption | null>(value);
    const { name: countryCode } = useRegion();
    const position: Point | null = useMemo(() => {
      return {
        type: 'Point',
        coordinates: value ? value.center : [0, 0],
      };
    }, [value]);

    const onValueChange = useCallback(
      (option: AddressOption | null) => {
        input.onChange({
          target: {
            name,
            value: option,
          },
        });

        if (onChange) {
          onChange(option);
        }
      },
      [input, name, onChange],
    );

    const onMarkerDragEnd = useCallback(
      (position: Point) => {
        reverseGeocode({ lng: position.coordinates[0], lat: position.coordinates[1] }).then(
          (addressOptions) => {
            const addressOption = (addressOptions || [])[0];
            let center = addressOption?.center;

            if (position.coordinates) {
              center = position.coordinates;

              if (addressOption.geojson) {
                addressOption.geojson.center = center;
                addressOption.geojson.geometry.coordinates = center;
              }
            }

            onValueChange({
              ...addressOption,
              center,
            });
          },
        );
      },
      [onValueChange],
    );
    const onMarkerPositionChange = useCallback(() => {
      marker?.flyToThis();
    }, [marker]);

    const onMapLongPress = useCallback(
      (point: Point) => {
        reverseGeocode({
          lng: point.coordinates[0],
          lat: point.coordinates[1],
        }).then((addressOptions) => onValueChange((addressOptions || [])[0]));
      },
      [onValueChange],
    );

    useEffect(() => {
      valueRef.current = value;
    }, [value]);

    useEffect(() => {
      if (!value) {
        return;
      }

      const [lng, lat] = value.center;

      if (lng === 0 && lat === 0) {
        forwardGeocode(value.text, countryCode).then((addressOptions) => {
          const addressOption = (addressOptions || [])[0];
          const center = addressOption?.center;

          if (!center || !valueRef.current) {
            onValueChange(null);

            return;
          }

          onValueChange({
            ...valueRef.current,
            center,
            geojson: addressOption.geojson,
          });
        });

        return;
      }
    }, [countryCode, value, onValueChange]);

    return (
      <InteractiveMap
        wrapClassName={wrapClassName}
        className={className}
        onLongPress={onMapLongPress}
        onSinglePress={onMapLongPress}
      >
        <Marker
          ref={markerRef}
          position={position}
          onDragEnd={onMarkerDragEnd}
          onPositionChange={onMarkerPositionChange}
          flyToOnMount
          draggable={!readOnly}
        />
      </InteractiveMap>
    );
  },
);

export default AddressMapFieldFC;
