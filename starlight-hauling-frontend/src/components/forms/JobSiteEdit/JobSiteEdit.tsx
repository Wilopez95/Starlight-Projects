import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Checkbox, Layouts, PlusIcon } from '@starlightpro/shared-components';
import { getIn, useFormikContext } from 'formik';
import { noop } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import {
  FormInput,
  InteractiveMap,
  Marker,
  Polygon,
  RadioButton,
  Radius,
  Switch,
  Typography,
} from '@root/common';
import { IMarkerHandle } from '@root/common/InteractiveMap/types';
import AddPolygonModal from '@root/components/modals/AddPolygon/AddPolygon';
import { GeometryType } from '@root/consts';
import { buildPath } from '@root/helpers';
import { Units } from '@root/i18n/config/units';
import { useIsRecyclingFacilityBU, useToggle, useUserContext } from '@hooks';

import { IJobSiteEditForm } from './types';

const JobSiteEditForm: React.FC<IJobSiteEditForm> = ({ basePath: basePathProp = '' }) => {
  const marker = useRef<IMarkerHandle>(null);
  const timeoutHandle = useRef<number | null>(null);

  const { values, errors, handleChange, setFieldValue } = useFormikContext();
  const [isPolygonModalOpen, togglePolygonModalOpen] = useToggle();
  const { currentUser } = useUserContext();
  const { t } = useTranslation();

  const basePath = useMemo(() => (basePathProp ? [basePathProp] : []), [basePathProp]);

  const coordinates = getIn(values, buildPath('geofence.coordinates', basePath));
  const radius = getIn(values, buildPath('geofence.radius', basePath));
  const geofenceType = getIn(values, buildPath('geofence.type', basePath));
  const location = getIn(values, buildPath('location', basePath));
  const showGeofencing = getIn(values, buildPath('showGeofencing', basePath));

  const isRecyclingFacilityBU = useIsRecyclingFacilityBU();

  useEffect(
    () => () => {
      if (timeoutHandle.current !== null) {
        window.clearTimeout(timeoutHandle.current);
      }
    },
    [],
  );

  useEffect(() => {
    if (!location) {
      return;
    }

    const didTransition = marker.current?.flyToThis();

    if (!didTransition) {
      timeoutHandle.current = window.setTimeout(() => {
        marker.current?.flyToThis();
      }, 3000);
    }
  }, [location]);

  const handleGeofencingTypeChange = useCallback(
    (value: string) => {
      setFieldValue(buildPath('geofence.type', basePath), value);
      setFieldValue(buildPath('geofence.coordinates', basePath), undefined);
      setFieldValue(buildPath('geofence.radius', basePath), undefined);
    },
    [basePath, setFieldValue],
  );

  const handleShowGeofencingChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.checked) {
        setFieldValue(buildPath('geofence.type', basePath), GeometryType.polygon);
      } else {
        setFieldValue(buildPath('geofence', basePath), null);
      }

      handleChange(e);
    },
    [basePath, handleChange, setFieldValue],
  );

  return (
    <Layouts.Flex as={Layouts.Box} minHeight="100%">
      <AddPolygonModal
        isOpen={isPolygonModalOpen}
        onClose={togglePolygonModalOpen}
        basePath={basePathProp}
      />
      <Layouts.Column>
        <FormInput
          label="Job Site Name"
          name={buildPath('name', basePath)}
          value={getIn(values, buildPath('name', basePath))}
          error={getIn(errors, buildPath('name', basePath))}
          onChange={handleChange}
        />
        <FormInput
          label="Address Line 1*"
          name={buildPath('address.addressLine1', basePath)}
          value={getIn(values, buildPath('address.addressLine1', basePath))}
          error={getIn(errors, buildPath('address.addressLine1', basePath))}
          onChange={handleChange}
        />
        <FormInput
          label="Address Line 2"
          name={buildPath('address.addressLine2', basePath)}
          value={getIn(values, buildPath('address.addressLine2', basePath)) ?? ''}
          error={getIn(errors, buildPath('address.addressLine2', basePath))}
          onChange={handleChange}
        />
        <FormInput
          label="City*"
          name={buildPath('address.city', basePath)}
          value={getIn(values, buildPath('address.city', basePath))}
          error={getIn(errors, buildPath('address.city', basePath))}
          onChange={handleChange}
        />
        <Layouts.Flex>
          <Layouts.Column>
            <FormInput
              label="State*"
              name={buildPath('address.state', basePath)}
              value={getIn(values, buildPath('address.state', basePath))}
              error={getIn(errors, buildPath('address.state', basePath))}
              onChange={handleChange}
            />
          </Layouts.Column>
          <Layouts.Column>
            <FormInput
              label="ZIP*"
              name={buildPath('address.zip', basePath)}
              value={getIn(values, buildPath('address.zip', basePath))}
              error={getIn(errors, buildPath('address.zip', basePath))}
              onChange={handleChange}
            />
          </Layouts.Column>
        </Layouts.Flex>
        {!isRecyclingFacilityBU ? (
          <>
            <Layouts.Margin bottom="1">
              <Checkbox
                id={`${basePathProp}.alleyPlacement`}
                name={buildPath('alleyPlacement', basePath)}
                value={getIn(values, buildPath('alleyPlacement', basePath)) ?? false}
                error={getIn(errors, buildPath('alleyPlacement', basePath))}
                onChange={handleChange}
              >
                Alley placement
              </Checkbox>
            </Layouts.Margin>
            <Layouts.Margin bottom="1">
              <Checkbox
                id={`${basePathProp}.cabOver`}
                name={buildPath('cabOver', basePath)}
                value={getIn(values, buildPath('cabOver', basePath)) ?? false}
                error={getIn(errors, buildPath('cabOver', basePath))}
                onChange={handleChange}
              >
                Cab-over
              </Checkbox>
            </Layouts.Margin>
          </>
        ) : null}
        <Layouts.Margin top="3" bottom="3">
          <Switch
            onChange={handleShowGeofencingChange}
            value={showGeofencing}
            id="showGeofencing"
            name={buildPath('showGeofencing', basePath)}
          >
            {t('Text.Geofencing')}
          </Switch>
        </Layouts.Margin>
        {showGeofencing ? (
          <>
            <Layouts.Flex direction="row">
              <RadioButton
                name={buildPath('geofence.type', basePath)}
                value={geofenceType === GeometryType.radius}
                onChange={() => handleGeofencingTypeChange(GeometryType.radius)}
              >
                {t('Text.Radius')}
              </RadioButton>
              <Layouts.Padding left="2">
                <RadioButton
                  name={buildPath('geofence.type', basePath)}
                  value={geofenceType === GeometryType.polygon}
                  onChange={() => handleGeofencingTypeChange(GeometryType.polygon)}
                >
                  {t('Text.Polygon')}
                </RadioButton>
              </Layouts.Padding>
            </Layouts.Flex>
            {geofenceType === GeometryType.radius ? (
              <Layouts.Margin top="1">
                <Layouts.Flex direction="row">
                  <FormInput
                    label="Radius"
                    name={buildPath('geofence.radius', basePath)}
                    value={radius}
                    error={getIn(errors, buildPath('geofence.radius', basePath))}
                    onChange={handleChange}
                  />

                  <Layouts.Padding left="2">
                    <FormInput
                      label="Units"
                      name="units"
                      value={currentUser?.company?.unit === Units.metric ? 'Meter' : 'Yard'}
                      disabled
                      onChange={noop}
                    />
                  </Layouts.Padding>
                </Layouts.Flex>
              </Layouts.Margin>
            ) : null}
            {geofenceType === GeometryType.polygon ? (
              <Layouts.Margin top="3" bottom="3">
                <Layouts.Flex alignItems="center" onClick={togglePolygonModalOpen}>
                  <Layouts.IconLayout height="12px" width="12px">
                    <PlusIcon />
                  </Layouts.IconLayout>
                  <Typography cursor="pointer" color="information" variant="bodyMedium">
                    Draw Polygon
                  </Typography>
                </Layouts.Flex>
              </Layouts.Margin>
            ) : null}
          </>
        ) : null}

        {getIn(values, buildPath('recyclingDefault', basePath)) ? (
          <Layouts.Margin bottom="1">
            <Checkbox
              id={`${basePathProp}.recyclingDefault`}
              name={buildPath('recyclingDefault', basePath)}
              value={getIn(values, buildPath('recyclingDefault', basePath)) ?? false}
              error={getIn(errors, buildPath('recyclingDefault', basePath))}
              onChange={handleChange}
              disabled
            >
              Recycling facility job site
            </Checkbox>
          </Layouts.Margin>
        ) : null}
      </Layouts.Column>
      <Layouts.Column>
        <InteractiveMap height="100%" width="100%" position="relative">
          <Marker ref={marker} initialPosition={location} />
          {coordinates ? <Polygon coordinates={coordinates} /> : null}
          {radius ? (
            <Radius
              coordinates={location.coordinates}
              radius={radius}
              units={currentUser?.company?.unit ?? Units.metric}
            />
          ) : null}
        </InteractiveMap>
      </Layouts.Column>
    </Layouts.Flex>
  );
};

export default observer(JobSiteEditForm);
