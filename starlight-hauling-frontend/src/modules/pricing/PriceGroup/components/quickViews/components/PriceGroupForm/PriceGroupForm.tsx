import React, { useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Autocomplete,
  Calendar,
  Checkbox,
  IAutocompleteConfig,
  ISelectOption,
  Layouts,
  Select,
} from '@starlightpro/shared-components';
import { useFormikContext } from 'formik';
import { capitalize, noop } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { GlobalService } from '@root/api';
import { DeleteIcon } from '@root/assets';
import { AutocompleteTemplates, FormInput, RadioButton, Typography } from '@root/common';
import { Divider, Table } from '@root/common/TableTools';
import { addressFormat, convertDates, handleEnterOrSpaceKeyDown } from '@root/helpers';
import { useDateIntl } from '@root/helpers/format/date';
import { useBusinessContext, useStores } from '@root/hooks';
import { useIntl } from '@root/i18n/useIntl';
import { PriceGroupsTab } from '@root/modules/pricing/PriceGroup/components/PriceGroupTable/types';
import { CustomerGroupType, IBusinessLine, IBusinessUnit } from '@root/types';
import { CustomerSuggestion } from '@root/types/responseEntities';

import { FormikPriceGroups } from './formikData';
import * as Styles from './styles';

import styles from './css/styles.scss';

const I18N_PATH =
  'modules.pricing.PriceGroup.components.quickViews.components.PriceGroupForm.Text.';

const PriceGroupForm: React.FC<{ viewMode?: boolean }> = ({ viewMode = false }) => {
  const { values, errors, handleChange, setFieldValue, setValues } =
    useFormikContext<FormikPriceGroups>();
  const {
    businessLineStore,
    customerGroupStore,
    serviceAreaStore,
    systemConfigurationStore,
    businessUnitStore,
    jobSiteStore,
  } = useStores();
  const { t } = useTranslation();

  const { businessLineId, businessUnitId } = useBusinessContext();

  const { weekDays, firstDayOfWeek } = useIntl();

  const isRecyclingLoB = businessLineStore.isRecyclingType(businessLineId);

  const isDuplicating = systemConfigurationStore.isDuplicating;
  const customerGroupsOptions = useMemo(
    () =>
      customerGroupStore.values
        .filter(customerGroup => isRecyclingLoB || customerGroup.type !== CustomerGroupType.walkUp)
        .map(customerGroup => ({
          label: customerGroup.description,
          value: customerGroup.id,
        })),
    [customerGroupStore.values, isRecyclingLoB],
  );

  const serviceAreaGroupsOptions = useMemo(
    () =>
      serviceAreaStore.values.map(serviceArea => ({
        label: `${serviceArea.name}${serviceArea.active ? '' : ' (i.e. inactive)'}`,
        value: serviceArea.id,
      })),
    [serviceAreaStore.values],
  );

  const businessUnits = businessUnitStore.values;

  useEffect(() => {
    if (values.groupSpecification === PriceGroupsTab.customerGroups) {
      customerGroupStore.request();
    }
    if (values.groupSpecification === PriceGroupsTab.customerJobSites && values.pairCustomerId) {
      jobSiteStore.requestByCustomer({
        customerId: values.pairCustomerId,
      });
    }
    serviceAreaStore.request({ businessLineId, businessUnitId });
  }, [
    businessLineId,
    businessUnitId,
    customerGroupStore,
    jobSiteStore,
    serviceAreaStore,
    values.groupSpecification,
    values.pairCustomerId,
  ]);

  useEffect(() => {
    if (values.pairJobSiteId && values.pairCustomerId) {
      (async () => {
        // Additional check for TS (work bad with async)
        if (values.pairJobSiteId && values.pairCustomerId) {
          const pair = convertDates(
            await GlobalService.getJobSiteCustomerPair(values.pairJobSiteId, values.pairCustomerId),
          );

          if (pair) {
            setFieldValue('customerJobSiteId', pair.id);
          }
        }
      })();
    }
  }, [setFieldValue, values.pairCustomerId, values.pairJobSiteId]);

  const businessUnitsWithSelectedLine = useMemo(
    (): IBusinessUnit[] =>
      businessUnits.reduce((array: IBusinessUnit[], { businessLines, ...businessUnitProps }) => {
        const businessLine = businessLines.find(({ id }) => id === +businessLineId);

        if (businessLine) {
          return [
            ...array,
            {
              ...businessUnitProps,
              businessLines: [businessLine],
              businessLinesIds: [businessLine.id],
            },
          ];
        }

        return array;
      }, []),
    [businessUnits, businessLineId],
  );

  const businessUnitsWithSelectedLineOptions = useMemo(
    () =>
      businessUnitsWithSelectedLine.map(({ nameLine1: label, id: value }) => ({
        label,
        value,
      })),
    [businessUnitsWithSelectedLine],
  );

  const pairJobSiteOptions: ISelectOption[] = useMemo(
    () =>
      jobSiteStore.values.map(jobSite => ({
        value: jobSite.id,
        label: addressFormat(jobSite.address),
      })),
    [jobSiteStore.values],
  );

  const handleBusinessUnitSelect = useCallback(
    (name: string, value: number) => {
      const selectedBusinessUnitsWithLine: IBusinessUnit = businessUnitsWithSelectedLine.filter(
        i => i.id === value,
      )[0];
      const selectedBusinessLine: IBusinessLine = selectedBusinessUnitsWithLine.businessLines[0];

      setFieldValue('businessLineId', selectedBusinessLine.id);
      setFieldValue(name, value);
    },
    [setFieldValue, businessUnitsWithSelectedLine],
  );

  const handleSpecificityChange = useCallback(
    (value: PriceGroupsTab) => {
      setValues({
        ...values,
        customerSpecificationString: '',
        groupSpecification: value,
        customerId: undefined,
        customerGroupId: undefined,
        serviceAreasIds: {},
        customerJobSiteId: undefined,
      });
    },
    [setValues, values],
  );

  const handleCustomerItemSelect = useCallback(
    (item: CustomerSuggestion) => {
      if (values.groupSpecification === PriceGroupsTab.customerJobSites) {
        setFieldValue('pairCustomerId', item.id);
        jobSiteStore.requestByCustomer({
          customerId: item.id,
        });
      } else {
        setFieldValue('customerId', item.id);
      }
      setFieldValue('customerSpecificationString', item.name);
    },
    [jobSiteStore, setFieldValue, values.groupSpecification],
  );

  const handleServiceAreaIdsSelect = useCallback(
    serviceAreaId => {
      setFieldValue('serviceAreasIds', {
        ...values.serviceAreasIds,
        [serviceAreaId]: !values.serviceAreasIds[serviceAreaId],
      });
    },
    [setFieldValue, values],
  );

  const handleSearch = useCallback(
    (search: string) => {
      return GlobalService.multiSearch(search, businessUnitId);
    },
    [businessUnitId],
  );

  const autocompleteConfigs = useMemo<IAutocompleteConfig[]>(() => {
    return [
      {
        name: 'customers',
        onSelect: handleCustomerItemSelect,
        template: <AutocompleteTemplates.Customer />,
      },
    ];
  }, [handleCustomerItemSelect]);

  const handleCustomerRemoveClick = useCallback(() => {
    setValues({
      ...values,
      customerId: undefined,
      customerJobSiteId: undefined,
      pairCustomerId: undefined,
      pairJobSiteId: undefined,
      customerSpecificationString: '',
    });
  }, [setValues, values]);

  const handleJobSiteRemoveClick = useCallback(() => {
    setFieldValue('pairJobSiteId', undefined);
    if (values.pairCustomerId) {
      jobSiteStore.requestByCustomer({
        customerId: values.pairCustomerId,
      });
    }
  }, [jobSiteStore, setFieldValue, values.pairCustomerId]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLOrSVGElement>, callback: () => void) => {
    if (handleEnterOrSpaceKeyDown(e)) {
      callback();
    }
  };

  const jobSite = pairJobSiteOptions.find(option => option.value === values.pairJobSiteId);
  const { dateFormat } = useDateIntl();

  return (
    <Table>
      <tbody>
        <tr>
          <td>{t(`${I18N_PATH}Status`)}</td>
          <td>
            <Checkbox
              id="activeCheckbox"
              name="active"
              value={values.active}
              onChange={handleChange}
              disabled={viewMode}
            >
              {t('Text.Active')}
            </Checkbox>
          </td>
        </tr>
        <tr>
          <Styles.SpaceCell>
            <Typography
              as="label"
              htmlFor="description"
              color="secondary"
              variant="bodyMedium"
              shade="desaturated"
            >
              {`${t(`${I18N_PATH}Description`)}*`}
            </Typography>
          </Styles.SpaceCell>
          <Styles.InputCell>
            <FormInput
              name="description"
              onChange={handleChange}
              value={values.description}
              error={errors.description}
              disabled={viewMode}
              area
            />
          </Styles.InputCell>
        </tr>
        <tr>
          <Styles.SpaceCell>
            <Typography
              as="label"
              htmlFor="startAt"
              color="secondary"
              variant="bodyMedium"
              shade="desaturated"
            >
              {t(`${I18N_PATH}StartDate`)}
            </Typography>
          </Styles.SpaceCell>
          <Styles.InputCell>
            <Calendar
              name="startAt"
              withInput
              value={values.startAt}
              placeholder={t('Text.SetDate')}
              firstDayOfWeek={firstDayOfWeek}
              dateFormat={dateFormat}
              onDateChange={setFieldValue}
              error={errors.startAt}
              readOnly={viewMode}
            />
          </Styles.InputCell>
        </tr>
        <tr>
          <Styles.SpaceCell>
            <Typography
              as="label"
              htmlFor="endAt"
              color="secondary"
              variant="bodyMedium"
              shade="desaturated"
            >
              {t(`${I18N_PATH}EndDate`)}
            </Typography>
          </Styles.SpaceCell>
          <Styles.InputCell>
            <Calendar
              name="endAt"
              withInput
              value={values.endAt}
              placeholder={t('Text.SetDate')}
              firstDayOfWeek={firstDayOfWeek}
              dateFormat={dateFormat}
              onDateChange={setFieldValue}
              error={errors.endAt}
              readOnly={viewMode}
            />
          </Styles.InputCell>
        </tr>
        <tr>
          <Styles.SpaceCell id="valid-days-label">{t(`${I18N_PATH}ValidDays`)}</Styles.SpaceCell>
          <Styles.InputCell>
            <Layouts.Grid columns="2fr 1fr" as="ul" role="group" aria-labelledby="valid-days-label">
              {Object.keys(weekDays).map(day => {
                return (
                  <Layouts.Cell key={day} role="listitem">
                    <Layouts.Margin bottom="1">
                      <Checkbox
                        id={day}
                        key={day}
                        name={`validDays.${day}`}
                        tabIndex={1}
                        value={values.validDays[day]}
                        onChange={handleChange}
                        disabled={viewMode}
                      >
                        <Typography aria-label={day} color="secondary" shade="desaturated">
                          {capitalize(day.slice(0, 2))}
                        </Typography>
                      </Checkbox>
                    </Layouts.Margin>
                  </Layouts.Cell>
                );
              })}
            </Layouts.Grid>

            <Layouts.Margin top="0.5" bottom="0.5">
              <Typography
                as={Layouts.Box}
                height="20px"
                variant="bodySmall"
                color="alert"
                data-error={errors.validDays}
              >
                {errors.validDays}
              </Typography>
            </Layouts.Margin>
          </Styles.InputCell>
        </tr>
        {isRecyclingLoB ? (
          <tr>
            <Styles.SpaceCell />
            <Styles.SpaceCell>
              <Layouts.Margin top="1">
                <Checkbox
                  id="nonServiceHours"
                  name="nonServiceHours"
                  value={!!values.nonServiceHours}
                  onChange={handleChange}
                  disabled={viewMode}
                >
                  {t(`${I18N_PATH}NonServiceTime`)}
                </Checkbox>
              </Layouts.Margin>
            </Styles.SpaceCell>
          </tr>
        ) : null}
        <tr>
          <td colSpan={2}>
            <Layouts.Box backgroundColor="primary" backgroundShade="desaturated">
              <Layouts.Padding left="1" top="0.5" bottom="0.5">
                <Typography variant="bodyMedium">{t(`${I18N_PATH}BannerText`)}</Typography>
              </Layouts.Padding>
            </Layouts.Box>
          </td>
        </tr>
        {isDuplicating && businessUnitsWithSelectedLine.length > 1 ? (
          <>
            <Divider colSpan={3} />
            <tr>
              <Styles.SpaceCell>
                <Typography
                  as="label"
                  htmlFor="businessUnitId"
                  color="secondary"
                  variant="bodyMedium"
                  shade="desaturated"
                >
                  {t(`${I18N_PATH}BusinessUnit`)}
                </Typography>
              </Styles.SpaceCell>
              <Styles.InputCell>
                <Select
                  name="businessUnitId"
                  key="businessUnitId"
                  disabled={viewMode}
                  options={businessUnitsWithSelectedLineOptions}
                  value={values.businessUnitId}
                  onSelectChange={handleBusinessUnitSelect}
                  error={errors.businessUnitId}
                />
              </Styles.InputCell>
            </tr>
          </>
        ) : null}
        {/* {Object.values(values.serviceAreasIds)?.length > 0 && (
          <tr>
            <td>{t(`${I18N_PATH}IntegratedWithSP1`)}</td>
            <td>
              <Checkbox
                id='spUsedCheckbox'
                name='spUsed'
                value={values.spUsed}
                onChange={handleChange}
              >
                {t(`${I18N_PATH}IntegratedWithSP2`)}
              </Checkbox>
            </td>
          </tr>
        )} */}
        <Divider colSpan={3} />
        <tr>
          <td id="assignPriceGroupTo" colSpan={3}>
            {t(`${I18N_PATH}AssignPriceGroupTo`)}
          </td>
        </tr>
        <tr role="radiogroup" aria-labelledby="assignPriceGroupTo">
          <td colSpan={3}>
            <Layouts.Flex direction="column">
              <RadioButton
                name="groupSpecification"
                onChange={() => handleSpecificityChange(PriceGroupsTab.customerGroups)}
                value={values.groupSpecification === PriceGroupsTab.customerGroups}
                disabled={viewMode}
              >
                {t(`${I18N_PATH}CustomerGroup`)}
              </RadioButton>
              {!isRecyclingLoB ? (
                <Layouts.Margin top="1">
                  <RadioButton
                    name="groupSpecification"
                    onChange={() => handleSpecificityChange(PriceGroupsTab.serviceAreas)}
                    value={values.groupSpecification === PriceGroupsTab.serviceAreas}
                    disabled={viewMode || !serviceAreaStore.values.length}
                  >
                    {t(`${I18N_PATH}ServiceArea`)}
                  </RadioButton>
                </Layouts.Margin>
              ) : null}
              <Layouts.Margin top="1">
                <RadioButton
                  name="groupSpecification"
                  onChange={() => handleSpecificityChange(PriceGroupsTab.customers)}
                  value={values.groupSpecification === PriceGroupsTab.customers}
                  disabled={viewMode}
                >
                  {t(`${I18N_PATH}Customer`)}
                </RadioButton>
              </Layouts.Margin>
              <Layouts.Margin top="1">
                <RadioButton
                  name="groupSpecification"
                  onChange={() => handleSpecificityChange(PriceGroupsTab.customerJobSites)}
                  value={values.groupSpecification === PriceGroupsTab.customerJobSites}
                  disabled={viewMode}
                >
                  {t(`${I18N_PATH}CustomerJobSitePair`)}
                </RadioButton>
              </Layouts.Margin>
              {values.groupSpecification === PriceGroupsTab.serviceAreas &&
              (viewMode || !serviceAreaStore.values.length) ? (
                <Layouts.Margin top="1">
                  <Typography color="alert" variant="bodySmall">
                    {t(`${I18N_PATH}ServiceAreaIsNotConfigured`)}
                  </Typography>
                </Layouts.Margin>
              ) : null}
            </Layouts.Flex>
          </td>
        </tr>
        <tr>
          <td colSpan={3}>
            {values.groupSpecification === PriceGroupsTab.customerGroups ? (
              <Select
                label={`${t(`${I18N_PATH}CustomerGroup`)}*`}
                name="customerGroupId"
                options={customerGroupsOptions}
                value={values.customerGroupId ?? undefined}
                error={errors.customerGroupId}
                onSelectChange={setFieldValue}
              />
            ) : null}

            {values.groupSpecification === PriceGroupsTab.serviceAreas &&
            serviceAreaStore.values.length > 0 ? (
              <>
                <Layouts.Margin top="0.5" bottom="0.5">
                  <Typography variant="bodyMedium" color="secondary" shade="desaturated">
                    {t(`${I18N_PATH}SelectServiceArea`)}
                  </Typography>
                </Layouts.Margin>
                <Layouts.Box borderRadius="4px" className={styles.serviceAreasWrapper}>
                  {serviceAreaGroupsOptions.map(serviceArea => (
                    <React.Fragment key={serviceArea.value}>
                      <Layouts.Padding padding="1">
                        <Checkbox
                          id={`${serviceArea.value}`}
                          name={`serviceAreasIds.${serviceArea.value}`}
                          key={serviceArea.value}
                          value={values.serviceAreasIds[serviceArea.value]}
                          onChange={() => handleServiceAreaIdsSelect(serviceArea.value)}
                          disabled={viewMode}
                        >
                          {serviceArea.label}
                        </Checkbox>
                      </Layouts.Padding>
                      <Divider />
                    </React.Fragment>
                  ))}
                </Layouts.Box>
                <Layouts.Margin top="0.5" bottom="0.5">
                  <Typography
                    as={Layouts.Box}
                    height="20px"
                    variant="bodySmall"
                    color="alert"
                    data-error={errors.serviceAreasIds}
                  >
                    {errors.serviceAreasIds}
                  </Typography>
                </Layouts.Margin>
              </>
            ) : null}

            {values.groupSpecification === PriceGroupsTab.customers ? (
              values.customerId ? (
                <Layouts.Flex as={Layouts.Padding} top="2" bottom="2">
                  <Layouts.IconLayout remove height="20px" width="20px">
                    <DeleteIcon
                      role="button"
                      aria-label={t('Text.Delete')}
                      tabIndex={viewMode ? -1 : 0}
                      onKeyDown={e => handleKeyDown(e, handleCustomerRemoveClick)}
                      onClick={viewMode ? noop : handleCustomerRemoveClick}
                    />
                  </Layouts.IconLayout>
                  <Typography variant="bodyMedium">{values.customerSpecificationString}</Typography>
                </Layouts.Flex>
              ) : (
                <Autocomplete
                  name="customerSpecificationString"
                  label={`${t(`${I18N_PATH}Customer`)}*`}
                  search={values.customerSpecificationString}
                  onSearchChange={setFieldValue}
                  onRequest={handleSearch}
                  configs={autocompleteConfigs}
                  disabled={viewMode}
                  error={errors.customerId}
                />
              )
            ) : null}

            {values.groupSpecification === PriceGroupsTab.customerJobSites ? (
              <>
                {values.pairCustomerId ? (
                  <Layouts.Flex as={Layouts.Padding} top="2" bottom="2">
                    <Layouts.IconLayout remove height="20px" width="20px">
                      <DeleteIcon
                        role="button"
                        aria-label={t('Text.Delete')}
                        tabIndex={viewMode ? -1 : 0}
                        onKeyDown={e => handleKeyDown(e, handleCustomerRemoveClick)}
                        onClick={viewMode ? noop : handleCustomerRemoveClick}
                      />
                    </Layouts.IconLayout>
                    <Typography variant="bodyMedium">
                      {values.customerSpecificationString}
                    </Typography>
                  </Layouts.Flex>
                ) : (
                  <Autocomplete
                    name="customerSpecificationString"
                    label={`${t(`${I18N_PATH}Customer`)}*`}
                    search={values.customerSpecificationString}
                    onSearchChange={setFieldValue}
                    onRequest={handleSearch}
                    disabled={viewMode}
                    configs={autocompleteConfigs}
                    error={errors.customerId ?? errors.pairCustomerId}
                  />
                )}
                {values.pairCustomerId ? (
                  values.pairJobSiteId && jobSite ? (
                    <Layouts.Flex as={Layouts.Padding} top="2" bottom="2">
                      <Layouts.IconLayout remove height="20px" width="20px">
                        <DeleteIcon
                          role="button"
                          aria-label={t('Text.Delete')}
                          tabIndex={viewMode ? -1 : 0}
                          onKeyDown={e => handleKeyDown(e, handleJobSiteRemoveClick)}
                          onClick={viewMode ? noop : handleJobSiteRemoveClick}
                        />
                      </Layouts.IconLayout>
                      <Typography variant="bodyMedium">{jobSite.label}</Typography>
                    </Layouts.Flex>
                  ) : (
                    <Select
                      label={`${t(`${I18N_PATH}CustomerJobSite`)}*`}
                      name="pairJobSiteId"
                      options={pairJobSiteOptions}
                      value={values.pairJobSiteId}
                      error={errors.pairJobSiteId}
                      onSelectChange={setFieldValue}
                    />
                  )
                ) : null}
              </>
            ) : null}
          </td>
        </tr>
      </tbody>
    </Table>
  );
};

export default observer(PriceGroupForm);
