import React, { memo, useCallback, useMemo, useState, useRef } from 'react';
import { defaults, debounce } from 'lodash-es';
import { FeatureCollection, Feature } from 'geojson';
import { useField } from 'react-final-form';
import Typography from '@material-ui/core/Typography';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import InteractiveMap from '../../mapbox/InteractiveMap';
import Boundaries from '../../mapbox/Boundaries';
import Boundary from '../../mapbox/Boundary';
import {
  featuresToDistrictOptions,
  DistrictOption,
  TileFeature,
} from '../../mapbox/featuresToDistrictOptions';
import { TaxDistrictType } from '../../mapbox/types';

interface AdminDistrictMapFieldProps {
  className: string;
  wrapClassName?: string;
  name: string;
  onChange?(option: DistrictOption | null): void;
  children?: any;
  selectedBoundary?: TaxDistrictType;
}

export const AdminDistrictMapFieldFC = memo<AdminDistrictMapFieldProps>(
  ({ className, onChange, wrapClassName, name, children, selectedBoundary }) => {
    const { input } = useField(name, { subscription: { value: true } });
    const mapWrapperRef = useRef<HTMLDivElement | null>(null);
    const [districsToChoose, setDistrictsToChoose] = useState<DistrictOption[] | null>(null);
    const value = input.value;

    const onValueChange = useCallback(
      (option: DistrictOption | null) => {
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

    const onChooseDistrict = useCallback(
      (districtOption) => {
        setDistrictsToChoose(null);
        onValueChange(districtOption);
      },
      [onValueChange, setDistrictsToChoose],
    );
    const onChooseDistrictClose = useCallback(() => {
      setDistrictsToChoose(null);
    }, [setDistrictsToChoose]);
    const onZoneClick = useMemo(() => {
      let clickedFeatures: any[] = [];

      const onDoneClick = debounce(() => {
        const districtOptions = featuresToDistrictOptions(clickedFeatures);

        if (districtOptions.length === 1) {
          onValueChange(districtOptions[0]);

          return;
        }

        setDistrictsToChoose(districtOptions);
      }, 300);

      return (data: Feature | FeatureCollection) => {
        if (data.type === 'FeatureCollection') {
          const allProperties = data.features.map((f) => f.properties);
          const result: TileFeature = {
            id: data.features[0].id as number,
            geometry: data.features[0].geometry,
            properties: defaults(
              {
                tilequery: {
                  layer: (data.features[0] as any).layer?.id,
                },
                level: (data.features[0] as any).layer?.id,
              },
              ...allProperties,
            ),
            type: 'Feature',
          };

          clickedFeatures.push(result);

          onDoneClick();

          return;
        }

        clickedFeatures.push(data);
        onDoneClick();
      };
    }, [onValueChange]);

    return (
      <InteractiveMap
        wrapClassName={wrapClassName}
        className={className}
        wrapperRef={mapWrapperRef}
      >
        {(!selectedBoundary && (
          <>
            <Boundaries type={TaxDistrictType.Municipal} onZoneClick={onZoneClick} />
            <Boundaries type={TaxDistrictType.Secondary} onZoneClick={onZoneClick} />
            <Boundaries type={TaxDistrictType.Primary} onZoneClick={onZoneClick} />
          </>
        )) || <Boundaries type={selectedBoundary!} onZoneClick={onZoneClick} />}
        {value && (
          <Boundary
            type={value.layer}
            zoneId={value.id}
            featureCoordinates={value.geojson?.coordinates ?? []}
            flyToOnMount
          />
        )}
        {districsToChoose && (
          <Menu
            open
            anchorEl={mapWrapperRef.current}
            transformOrigin={{
              vertical: 'center',
              horizontal: 'center',
            }}
            onClose={onChooseDistrictClose}
          >
            {districsToChoose.map((districtOption) => {
              return (
                <MenuItem key={districtOption.id} onClick={() => onChooseDistrict(districtOption)}>
                  <Typography variant="body2">{districtOption.name}</Typography>
                </MenuItem>
              );
            })}
          </Menu>
        )}
        {children}
      </InteractiveMap>
    );
  },
);

export default AdminDistrictMapFieldFC;
