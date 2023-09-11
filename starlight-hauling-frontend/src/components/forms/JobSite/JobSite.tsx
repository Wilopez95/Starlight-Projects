import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { Autocomplete, Button, Checkbox, Layouts, PlusIcon } from '@starlightpro/shared-components';
import cx from 'classnames';
import { getIn, useFormik } from 'formik';
import { isEqual, noop } from 'lodash-es';

import { GlobalService } from '@root/api/global/global';
import {
  AutocompleteTemplates,
  FormInput,
  InteractiveMap,
  Marker,
  Polygon,
  RadioButton,
  Radius,
  Switch,
  Typography,
  UnsavedChangesModal,
} from '@root/common';
import { IMarkerHandle } from '@root/common/InteractiveMap/types';
import { Divider } from '@root/common/TableTools';
import AddPolygonModal from '@root/components/modals/AddPolygon/AddPolygon';
import ConfirmModal from '@root/components/modals/Confirm/Confirm';
import { GeometryType } from '@root/consts';
import { useIsRecyclingFacilityBU, useStores, useToggle, useUserContext } from '@root/hooks';
import { Units } from '@root/i18n/config/units';
import { useIntl } from '@root/i18n/useIntl';
import { AddressSuggestion } from '@root/types/responseEntities';

import { FormContainerLayout } from '../layout/FormContainer';

import { generateValidationSchema, getDefaultValues, getBusinessUnitValues } from './formikData';
import { IJobSiteData, IJobSiteForm } from './types';

import formStyles from './css/styles.scss';

const JobSiteForm: React.FC<IJobSiteForm<IJobSiteData>> = ({
  withMap,
  isEditing,
  nonSearchable,
  jobSite,
  onSubmit,
  onClose,
}) => {
  const { jobSiteStore, i18nStore, businessUnitStore } = useStores();
  const marker = useRef<IMarkerHandle>(null);
  const timeoutHandle = useRef<number | null>(null);
  const intl = useIntl();
  const { currentUser } = useUserContext();

  const formik = useFormik({
    initialValues: getDefaultValues(jobSite),
    validateOnChange: false,
    validationSchema: generateValidationSchema(intl),
    enableReinitialize: true,
    onReset: onClose,
    onSubmit,
  });

  const {
    values,
    errors,
    isSubmitting,
    handleChange,
    setFormikState,
    setFieldValue,
    handleSubmit,
  } = formik;
  const [isPolygonModalOpen, togglePolygonModalOpen] = useToggle();
  const [isConfirmModalOpen, toggleConfirmModalOpen] = useToggle();

  useEffect(
    () => () => {
      if (timeoutHandle.current !== null) {
        window.clearTimeout(timeoutHandle.current);
      }
    },
    [],
  );

  useEffect(() => {
    if (!values.location) {
      return;
    }

    const didTransition = marker.current?.flyToThis();

    if (!didTransition) {
      timeoutHandle.current = window.setTimeout(() => {
        marker.current?.flyToThis();
      }, 3000);
    }
  }, [values.location]);

  const handleAutocompleteSelect = useCallback(
    (suggestion: AddressSuggestion) => {
      setFormikState(state => ({
        ...state,
        errors: {},
        values: {
          ...state.values,
          address: {
            id: suggestion.id,
            addressLine1: suggestion.address ?? '',
            addressLine2: '',
            city: suggestion.city ?? '',
            zip: suggestion.zip ?? '',
            state: suggestion.state ?? '',
            region: i18nStore.region,
          },
          location: suggestion.location,
        },
      }));
      if (!jobSiteStore.selectedEntity) {
        jobSiteStore.changeLocation(suggestion.location);
      }
    },
    [i18nStore.region, jobSiteStore, setFormikState],
  );

  useEffect(() => {
    if (jobSiteStore.location && !isEqual(jobSiteStore.location, values.location)) {
      setFieldValue('location', jobSiteStore.location);
    }
  });

  useEffect(() => {
    const checkCheckAndPopulateBusinessUnit = async () => {
      const jobsite = await getBusinessUnitValues(
        businessUnitStore.selectedEntity!.physicalAddress,
        jobSite,
      );
      setFormikState(state => ({
        ...state,
        errors: {},
        values: jobsite,
      }));
    };
    checkCheckAndPopulateBusinessUnit();
  }, []);

  const jobSiteNameInput = (
    <FormInput
      label="Job Site Name"
      name="name"
      value={values.name}
      error={errors.name}
      onChange={handleChange}
    />
  );

  const addressLine1Input = (
    <FormInput
      label="Address Line 1*"
      name="address.addressLine1"
      value={values.address.addressLine1}
      error={errors.address?.addressLine1}
      onChange={handleChange}
    />
  );

  const addressLine2Input = (
    <FormInput
      label="Address Line 2"
      name="address.addressLine2"
      value={values.address.addressLine2 ?? ''}
      error={errors.address?.addressLine2}
      onChange={handleChange}
    />
  );

  const cityInput = (
    <FormInput
      label="City*"
      name="address.city"
      value={values.address.city}
      error={errors.address?.city}
      onChange={handleChange}
    />
  );

  const stateInput = (
    <FormInput
      label="State*"
      name="address.state"
      value={values.address.state}
      error={errors.address?.state}
      onChange={handleChange}
    />
  );

  const zipInput = (
    <FormInput
      label="ZIP*"
      name="address.zip"
      value={values.address?.zip}
      error={errors.address?.zip}
      onChange={handleChange}
    />
  );

  const FlexContainer = withMap ? 'div' : Layouts.Flex;
  const ColumnContainer = withMap ? Layouts.Column : 'div';

  const jobsiteAutocompleteConfigs = useMemo(() => {
    return [
      {
        name: 'addresses',
        onSelect: handleAutocompleteSelect,
        template: <AutocompleteTemplates.Address />,
      },
    ];
  }, [handleAutocompleteSelect]);

  const isRecyclingFacilityBU = useIsRecyclingFacilityBU();

  const handleGeofencingTypeChange = useCallback(
    (value: string) => {
      setFieldValue('geofence.type', value);
      setFieldValue('geofence.coordinates', undefined);
      setFieldValue('geofence.radius', undefined);
    },
    [setFieldValue],
  );

  const handleDisableGeofencing = useCallback(() => {
    setFieldValue('showGeofencing', false);
    setFieldValue('geofence', null);
    handleSubmit();
  }, [handleSubmit, setFieldValue]);

  const handleSubmitClick = useCallback(() => {
    if (values.showGeofencing && !values.geofence?.radius && !values.geofence?.coordinates) {
      toggleConfirmModalOpen();
    } else {
      if (!values.showGeofencing) {
        setFieldValue('geofence', null);
      }
      handleSubmit();
    }
  }, [
    handleSubmit,
    setFieldValue,
    toggleConfirmModalOpen,
    values.geofence?.coordinates,
    values.geofence?.radius,
    values.showGeofencing,
  ]);

  return (
    <FormContainerLayout formik={formik}>
      <AddPolygonModal isOpen={isPolygonModalOpen} onClose={togglePolygonModalOpen} />

      <UnsavedChangesModal dirty={formik.dirty} onSubmit={handleSubmitClick} />
      <ConfirmModal
        isOpen={isConfirmModalOpen}
        title="Disable Geofencing"
        cancelButton="Keep Editing"
        submitButton="Disable Geofencing"
        subTitle="You enabled geofencing, but haven’t added one. Do you prefer to disable it or keep editing?"
        onCancel={toggleConfirmModalOpen}
        onSubmit={handleDisableGeofencing}
      />

      <Layouts.Flex direction="column" justifyContent="space-between">
        <Layouts.Padding top="3" right="5" left="5">
          <Typography variant="headerThree">
            {isEditing ? 'Job Site Settings' : 'Create New Job Site'}
          </Typography>
        </Layouts.Padding>
        <Layouts.Scroll>
          <Layouts.Padding padding="3" left="5" right="5">
            <Layouts.Flex>
              <ColumnContainer className={cx({ [formStyles.leftSide]: !withMap })} padding="2">
                {!nonSearchable ? (
                  <div className={formStyles.autocompleteWrapper}>
                    <Autocomplete
                      label="Job site address"
                      name="searchString"
                      placeholder="Enter Address"
                      search={values.searchString}
                      onSearchChange={setFieldValue}
                      onRequest={query =>
                        GlobalService.addressSuggestions(
                          query,
                          Number(businessUnitStore.selectedEntity?.id),
                        )
                      }
                      configs={jobsiteAutocompleteConfigs}
                      noErrorMessage
                    />
                  </div>
                ) : null}
                <FlexContainer>
                  {withMap ? jobSiteNameInput : <Layouts.Column>{jobSiteNameInput}</Layouts.Column>}
                  {withMap ? (
                    addressLine1Input
                  ) : (
                    <Layouts.Column>{addressLine1Input}</Layouts.Column>
                  )}
                  {withMap ? (
                    addressLine2Input
                  ) : (
                    <Layouts.Column>{addressLine2Input}</Layouts.Column>
                  )}
                </FlexContainer>
                <FlexContainer>
                  {withMap ? cityInput : <Layouts.Column>{cityInput}</Layouts.Column>}
                  {withMap ? (
                    <Layouts.Flex>
                      <Layouts.Column>{stateInput}</Layouts.Column>
                      <Layouts.Column>{zipInput}</Layouts.Column>
                    </Layouts.Flex>
                  ) : (
                    <Layouts.Column>
                      <Layouts.Flex className={formStyles.itemWrapper}>
                        {stateInput}
                        {zipInput}
                      </Layouts.Flex>
                    </Layouts.Column>
                  )}
                </FlexContainer>
                {!isRecyclingFacilityBU ? (
                  <>
                    <Layouts.Margin top="2">
                      <Checkbox
                        id="alleyPlacement"
                        name="alleyPlacement"
                        value={values.alleyPlacement}
                        error={errors.alleyPlacement}
                        onChange={handleChange}
                      >
                        Alley placement
                      </Checkbox>
                    </Layouts.Margin>
                    <Layouts.Margin top="1">
                      <Checkbox
                        id="cabOver"
                        name="cabOver"
                        value={values.cabOver}
                        error={errors.cabOver}
                        onChange={handleChange}
                      >
                        Cab-over
                      </Checkbox>
                    </Layouts.Margin>
                  </>
                ) : null}
                <Layouts.Margin top="3" bottom="3">
                  <Switch
                    onChange={handleChange}
                    value={values.showGeofencing}
                    id="showGeofencing"
                    name="showGeofencing"
                  >
                    Geofencing
                  </Switch>
                </Layouts.Margin>
                {values.showGeofencing ? (
                  <>
                    <Layouts.Flex direction="row">
                      <RadioButton
                        name="geofence.type"
                        value={values.geofence?.type === GeometryType.radius}
                        onChange={() => handleGeofencingTypeChange(GeometryType.radius)}
                      >
                        Radius
                      </RadioButton>
                      <Layouts.Padding left="2">
                        <RadioButton
                          name="geofence.type"
                          value={values.geofence?.type === GeometryType.polygon}
                          onChange={() => handleGeofencingTypeChange(GeometryType.polygon)}
                        >
                          Polygon
                        </RadioButton>
                      </Layouts.Padding>
                    </Layouts.Flex>
                    {values.geofence?.type === GeometryType.radius ? (
                      <Layouts.Margin top="2">
                        <Layouts.Flex direction="row">
                          <FormInput
                            label="Radius"
                            name="geofence.radius"
                            value={values.geofence?.radius}
                            error={getIn(errors, 'geofence.radius')}
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
                    {values.geofence?.type === GeometryType.polygon ? (
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
              </ColumnContainer>
              {withMap ? (
                <Layouts.Column>
                  <InteractiveMap height="100%" width="100%" position="relative">
                    <Marker
                      ref={marker}
                      draggable
                      initialPosition={values.location}
                      onDragEnd={jobSiteStore.changeLocation}
                    />
                    {values.geofence?.coordinates ? (
                      <Polygon coordinates={values.geofence.coordinates} />
                    ) : null}
                    {values.geofence?.radius && values.location.coordinates ? (
                      <Radius
                        coordinates={values.location.coordinates}
                        radius={values.geofence.radius}
                        units={currentUser?.company?.unit ?? Units.metric}
                      />
                    ) : null}
                  </InteractiveMap>
                </Layouts.Column>
              ) : null}
            </Layouts.Flex>
          </Layouts.Padding>
        </Layouts.Scroll>
        <Divider />
        <Layouts.Padding padding="4" left="5" right="5">
          <Layouts.Flex justifyContent="space-between">
            <Button type="reset" disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmitClick}
              disabled={isSubmitting}
              variant={isEditing ? 'primary' : 'success'}
            >
              {isEditing ? 'Save Changes' : 'Create New Job Site'}
            </Button>
          </Layouts.Flex>
        </Layouts.Padding>
      </Layouts.Flex>
    </FormContainerLayout>
  );
};

export default JobSiteForm;
