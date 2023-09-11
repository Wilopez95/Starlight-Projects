import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Autocomplete,
  Checkbox,
  IAutocompleteConfig,
  ISelectOption,
  Layouts,
  Select,
} from '@starlightpro/shared-components';
import { useFormikContext } from 'formik';
import { startCase } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { GlobalService } from '@root/api';
import { AutocompleteTemplates, FormInput, InteractiveMap, Marker, Typography } from '@root/common';
import { IMarkerHandle } from '@root/common/InteractiveMap/types';
import { Divider } from '@root/common/TableTools';
import { DEFAULT_ADDRESS, US_CENTROID } from '@root/consts/address';
import { waypointTypeOptions } from '@root/consts/disposalSite';
import { useStores } from '@root/hooks';
import { buildI18Path } from '@root/i18n/helpers';
import { AddressSuggestion, FacilitySuggestion } from '@root/types/responseEntities';

import { IDisposalSiteFormData } from './formikData';

const I18N_PATH = buildI18Path('pages.SystemConfiguration.tables.DisposalSites.QuickView.');

const DisposalSitesQuickViewRightPanel: React.FC = () => {
  const { values, errors, handleChange, setFieldValue, setFormikState } =
    useFormikContext<IDisposalSiteFormData>();
  const { t } = useTranslation();
  const { disposalSiteStore, systemConfigurationStore, i18nStore, businessUnitStore } = useStores();
  const marker = useRef<IMarkerHandle>(null);
  const timeoutHandle = useRef<number | null>(null);

  const selectedDisposalSite = disposalSiteStore.selectedEntity;
  const isCreating = systemConfigurationStore.isCreating;
  const isNew = isCreating || !selectedDisposalSite;

  const title =
    isNew || !values.description ? t(`${I18N_PATH.Text}CreateNewWaypoint`) : values.description;
  const subTitle = startCase(values.waypointType);

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

  const handleMarkerFly = useCallback(() => {
    const didTransition = marker.current?.flyToThis();

    if (!didTransition) {
      timeoutHandle.current = window.setTimeout(() => {
        marker.current?.flyToThis();
        timeoutHandle.current = null;
      }, 3000);
    }
  }, []);

  const handleAddressAutocompleteSelect = useCallback(
    (suggestion: AddressSuggestion) => {
      setFormikState(state => ({
        ...state,
        errors: {},
        values: {
          ...state.values,
          searchString: suggestion.fullAddress ?? '',
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

      handleMarkerFly();
    },
    [handleMarkerFly, i18nStore.region, setFormikState],
  );

  const handleFacilityAutocompleteSelect = useCallback(
    async (facilitySuggestion: FacilitySuggestion) => {
      const addressSuggestion = await GlobalService.addressSuggestions(
        facilitySuggestion.address,
        Number(businessUnitStore.selectedEntity?.id),
      );
      const suggestion = addressSuggestion[0];

      setFormikState(state => ({
        ...state,
        errors: {},
        values: {
          ...state.values,
          businessUnitId: facilitySuggestion.id,
          recyclingTenantName: facilitySuggestion.tenantName,
          searchString: facilitySuggestion.address ?? '',
          address: {
            id: facilitySuggestion.id,
            addressLine1: facilitySuggestion.addressLine1 ?? '',
            addressLine2: facilitySuggestion.addressLine2 ?? '',
            city: facilitySuggestion.city ?? '',
            zip: facilitySuggestion.zip ?? '',
            state: facilitySuggestion.state ?? '',
            region: i18nStore.region,
          },
          location: suggestion.location,
        },
      }));

      handleMarkerFly();
    },
    [handleMarkerFly, i18nStore.region, setFormikState, businessUnitStore.selectedEntity],
  );

  const handleStarlightFacilityCheckbox = useCallback(
    e => {
      setFormikState(state => ({
        ...state,
        errors: {},
        values: {
          ...state.values,
          businessUnitId: 0,
          searchString: '',
          location: US_CENTROID,
          address: DEFAULT_ADDRESS,
        },
      }));

      handleChange(e);
    },
    [handleChange, setFormikState],
  );

  useEffect(
    () => () => {
      if (timeoutHandle.current !== null) {
        window.clearTimeout(timeoutHandle.current);
      }
    },
    [],
  );

  const addressAutocompleteConfigs = useMemo<IAutocompleteConfig[]>(() => {
    return [
      {
        name: 'addresses',
        onSelect: handleAddressAutocompleteSelect,
        template: <AutocompleteTemplates.Address />,
      },
    ];
  }, [handleAddressAutocompleteSelect]);

  const facilityAutocompleteConfigs = useMemo<IAutocompleteConfig[]>(() => {
    return [
      {
        name: 'addresses',
        onSelect: handleFacilityAutocompleteSelect,
        template: <AutocompleteTemplates.Facility />,
      },
    ];
  }, [handleFacilityAutocompleteSelect]);

  const waypointOptions: ISelectOption[] = waypointTypeOptions.map(waypoint => {
    return {
      label: t(`${I18N_PATH.Text}${waypoint}`),
      value: waypoint,
    };
  });

  return (
    <>
      <Layouts.Padding padding="3" bottom="0">
        <Typography variant="headerThree">{title}</Typography>

        <Typography variant="caption" textTransform="uppercase">
          {subTitle}
        </Typography>
        <Divider top />
      </Layouts.Padding>
      <Layouts.Scroll>
        <Layouts.Padding padding="3">
          <Layouts.Grid columns={6} gap="2" alignItems="center">
            <Layouts.Padding bottom="2">
              <Typography variant="bodyMedium" shade="light">
                {t('Text.Status')}
              </Typography>
            </Layouts.Padding>

            <Layouts.Cell width={2} as={Layouts.Flex}>
              <Layouts.Margin right="3" bottom="2">
                <Checkbox
                  id="activeCheckbox"
                  name="active"
                  value={values.active}
                  onChange={handleChange}
                >
                  {t('Text.Active')}
                </Checkbox>
              </Layouts.Margin>

              <Layouts.Margin bottom="2">
                <Checkbox
                  id="recycling"
                  name="recycling"
                  value={values.recycling}
                  onChange={handleStarlightFacilityCheckbox}
                >
                  {t(`${I18N_PATH.Form}StarlightFacility`)}
                </Checkbox>
              </Layouts.Margin>
            </Layouts.Cell>

            <Layouts.Cell width={3} />

            <Layouts.Padding bottom="3">
              <Typography as="label" htmlFor="description" variant="bodyMedium" shade="light">
                {t('Text.Description')}*
              </Typography>
            </Layouts.Padding>

            <Layouts.Cell width={2}>
              <FormInput
                name="description"
                onChange={handleChange}
                value={values.description}
                error={errors.description}
              />
            </Layouts.Cell>

            <Layouts.Padding bottom="3">
              <Typography as="label" htmlFor="waypointType" variant="bodyMedium" shade="light">
                {t(`${I18N_PATH.Text}WaypointType`)}*
              </Typography>
            </Layouts.Padding>

            <Layouts.Cell width={2}>
              <Select
                placeholder={t(`${I18N_PATH.Form}SelectWaypointType`)}
                key="waypointType"
                name="waypointType"
                value={values.waypointType}
                options={waypointOptions}
                onSelectChange={setFieldValue}
                error={errors.waypointType}
              />
            </Layouts.Cell>

            <Typography variant="bodyMedium" shade="light">
              {t(`${I18N_PATH.Text}Parameters`)}
            </Typography>

            <Layouts.Cell width={2} as={Layouts.Flex}>
              <Layouts.Margin right="3">
                <Checkbox
                  id="hasStorage"
                  name="hasStorage"
                  value={values.hasStorage}
                  onChange={handleChange}
                >
                  {t(`${I18N_PATH.Text}Storage`)}
                </Checkbox>
              </Layouts.Margin>

              <Checkbox
                id="hasWeighScale"
                name="hasWeighScale"
                value={values.hasWeighScale}
                onChange={handleChange}
              >
                {t(`${I18N_PATH.Text}WeighScale`)}
              </Checkbox>
            </Layouts.Cell>
          </Layouts.Grid>

          <Divider both />

          <Layouts.Grid columns={2} gap="2">
            <Layouts.Cell>
              {values.recycling ? (
                <Autocomplete
                  name="searchString"
                  placeholder={t(`${I18N_PATH.Form}EnterAddress`)}
                  label={t(`${I18N_PATH.Form}StarlightFacility`)}
                  onRequest={GlobalService.facilitySuggestions}
                  search={values.searchString}
                  onSearchChange={setFieldValue}
                  configs={facilityAutocompleteConfigs}
                />
              ) : (
                <Autocomplete
                  name="searchString"
                  placeholder={t(`${I18N_PATH.Form}EnterAddress`)}
                  label={t(`${I18N_PATH.Form}SearchAddress`)}
                  onRequest={query =>
                    GlobalService.addressSuggestions(
                      query,
                      Number(businessUnitStore.selectedEntity?.id),
                    )
                  }
                  search={values.searchString}
                  onSearchChange={setFieldValue}
                  configs={addressAutocompleteConfigs}
                />
              )}

              <FormInput
                name="address.addressLine1"
                label={`${t(`${I18N_PATH.Form}AddressLine`, { number: 1 })}*`}
                value={values.address.addressLine1}
                error={errors.address?.addressLine1}
                disabled={values.recycling}
                onChange={handleChange}
              />
              <FormInput
                name="address.addressLine2"
                label={t(`${I18N_PATH.Form}AddressLine`, { number: 2 })}
                value={values.address.addressLine2 ?? ''}
                error={errors.address?.addressLine2}
                disabled={values.recycling}
                onChange={handleChange}
              />
              <FormInput
                name="address.city"
                label={`${t(`${I18N_PATH.Form}City`)}*`}
                value={values.address.city}
                error={errors.address?.city}
                disabled={values.recycling}
                onChange={handleChange}
              />
              <FormInput
                name="address.state"
                label={`${t(`${I18N_PATH.Form}State`)}*`}
                value={values.address.state}
                error={errors.address?.state}
                disabled={values.recycling}
                onChange={handleChange}
              />
              <FormInput
                name="address.zip"
                label={`${t(`${I18N_PATH.Form}Zip`)}*`}
                value={values.address.zip}
                error={errors.address?.zip}
                disabled={values.recycling}
                onChange={handleChange}
              />
            </Layouts.Cell>
            <InteractiveMap height="535px" width="100%" position="relative">
              <Marker ref={marker} initialPosition={values.location} />
            </InteractiveMap>
          </Layouts.Grid>
        </Layouts.Padding>
      </Layouts.Scroll>
    </>
  );
};

export default observer(DisposalSitesQuickViewRightPanel);
