import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Calendar,
  ISelectOption,
  Layouts,
  MultiSelect,
  Select,
} from '@starlightpro/shared-components';
import { endOfToday, startOfToday } from 'date-fns';
import { getIn, useFormikContext } from 'formik';
import { observer } from 'mobx-react-lite';

import { PriceGroupService } from '@root/api';
import { FormInput, RadioButton, Typography } from '@root/common';
import { addressFormat, convertDates, normalizeOptions } from '@root/helpers';
import { useDateIntl } from '@root/helpers/format/date';
import { useBusinessContext, useStores } from '@root/hooks';
import { useIntl } from '@root/i18n/useIntl';

import {
  BulkRatesAffectedEntity,
  BulkRatesEditType,
  IBulkRatesData,
  IBulkRatesLinkedData,
} from '../../types';

import localStyles from '../../css/styles.scss';
import { INCLUDE_ALL, INCLUDE_NONE_MATERIAL } from './const';
import { getEditDataPayload } from './helper';

const I18N_PATH = 'pages.SystemConfiguration.tables.PriceGroups.QuickView.BulkRatesEdit.forms.';

const mode = 'edit';

const today = endOfToday();

const BulkPricingEditTab: React.FC = () => {
  const {
    priceGroupStore,
    billableServiceStore,
    lineItemStore,
    materialStore,
    equipmentItemStore,
    globalRateStore,
    serviceAreaStore,
  } = useStores();

  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const { businessLineId, businessUnitId } = useBusinessContext();
  const { t } = useTranslation();
  const { dateFormat } = useDateIntl();
  const { firstDayOfWeek } = useIntl();

  const { values, setFieldValue, handleChange, errors, setFormikState } =
    useFormikContext<IBulkRatesData>();

  const prevType = useRef<BulkRatesEditType | null>(null);
  const linkedData = useRef<IBulkRatesLinkedData>();

  useEffect(() => {
    if (prevType.current === values.edit.type) {
      return;
    }

    if (
      values.edit.type === BulkRatesEditType.allServices ||
      values.edit.type === BulkRatesEditType.allBillableItems
    ) {
      materialStore.request({ businessLineId, activeOnly: true });
    }
  }, [businessLineId, materialStore, values.edit.type]);

  useEffect(() => {
    if (values.edit.type === BulkRatesEditType.allServices) {
      equipmentItemStore.request({
        businessLineId,
        activeOnly: true,
      });
    }

    if (values.edit.type === BulkRatesEditType.specificServices) {
      billableServiceStore.request({ businessLineId, activeOnly: true });
    }

    if (values.edit.type === BulkRatesEditType.specificLineItems) {
      lineItemStore.request({ businessLineId, activeOnly: true });
    }

    if (
      values.edit.type === BulkRatesEditType.allRecurringLineItems ||
      values.edit.type === BulkRatesEditType.specificRecurringLineItems
    ) {
      lineItemStore.request({ businessLineId });
      globalRateStore.requestRecurringLineItems({ businessUnitId, businessLineId });
    }

    prevType.current = values.edit.type;
  }, [
    billableServiceStore,
    businessLineId,
    businessUnitId,
    equipmentItemStore,
    globalRateStore,
    lineItemStore,
    materialStore,
    priceGroupStore,
    values.edit.application,
    values.edit.type,
  ]);

  useEffect(() => {
    (async () => {
      if (!isDataLoaded) {
        linkedData.current = convertDates(
          await PriceGroupService.requestLinked({ businessUnitId, businessLineId }),
        );
      }
      setIsDataLoaded(!!linkedData.current);
    })();
  }, [businessLineId, businessUnitId, isDataLoaded]);

  useEffect(() => {
    serviceAreaStore.request({ businessLineId, businessUnitId });
  }, [businessLineId, businessUnitId, serviceAreaStore]);

  const equipmentItemOptions: ISelectOption[] = useMemo(
    () => [
      {
        label: 'All Equipments',
        value: INCLUDE_ALL,
      },
      ...equipmentItemStore.sortedValues.map(equipmentItem => ({
        label: equipmentItem.shortDescription,
        value: equipmentItem.id,
      })),
    ],
    [equipmentItemStore.sortedValues],
  );

  const materialOptions: ISelectOption[] = useMemo(
    () => [
      {
        label: 'All Materials',
        value: INCLUDE_ALL,
      },
      {
        label: 'All non-material',
        value: INCLUDE_NONE_MATERIAL,
      },
      ...materialStore.sortedValues.map(material => ({
        label: material.description,
        value: material.id,
      })),
    ],
    [materialStore.sortedValues],
  );

  const serviceOptions: ISelectOption[] = useMemo(
    () => [
      {
        label: 'All Services',
        value: INCLUDE_ALL,
      },
      ...billableServiceStore.sortedValues.map(service => ({
        label: service.description,
        value: service.id,
      })),
    ],
    [billableServiceStore.sortedValues],
  );

  const lineItemOptions: ISelectOption[] = useMemo(
    () => [
      {
        label: 'All Line Items',
        value: INCLUDE_ALL,
      },
      ...lineItemStore.sortedValues.map(lineItem => ({
        label: lineItem.description,
        value: lineItem.id,
      })),
    ],
    [lineItemStore.sortedValues],
  );

  const specificRecurringLineItemOptions: ISelectOption[] | undefined[] = useMemo(
    () => [
      {
        label: t(`${I18N_PATH}AllRecurringLineItems`),
        value: 0,
      },
      ...lineItemStore.sortedValues
        .filter(
          lineItem => !lineItem.oneTime && lineItem.businessLineId.toString() === businessLineId,
        )
        .map(lineItem => ({
          label: `${lineItem.description}`,
          value: `${lineItem.id}`,
        })),
    ],
    [businessLineId, lineItemStore.sortedValues, t],
  );

  const serviceAreaOptions: ISelectOption[] = serviceAreaStore.values.map(serviceArea => ({
    label: `${serviceArea.name}${serviceArea.active ? '' : ' (i.e. inactive)'}`,
    value: serviceArea.id,
  }));

  const customerGroupOptions: ISelectOption[] =
    linkedData.current?.customerGroups.map(customerGroup => ({
      label: customerGroup.description,
      value: customerGroup.id,
    })) ?? [];

  const customerOptions: ISelectOption[] =
    linkedData.current?.customers.map(customer => ({
      label: customer.name ?? '',
      value: customer.id,
    })) ?? [];

  const priceGroupOptions: ISelectOption[] = priceGroupStore.values.map(customerGroup => ({
    label: customerGroup.description,
    value: customerGroup.id,
  }));

  const pairCustomerOptions: ISelectOption[] =
    linkedData.current?.customerJobSites.map(customerJobSite => ({
      label: customerJobSite.customer?.name ?? '',
      value: customerJobSite.id,
    })) ?? [];

  const pairJobSiteOptions: ISelectOption[] =
    linkedData.current?.customerJobSites.map(customerJobSite => ({
      label: addressFormat(customerJobSite.jobSite.address),
      value: customerJobSite.id,
    })) ?? [];

  const pairCustomerJobSiteIntersectionOptions: ISelectOption[] = pairJobSiteOptions.filter(
    jobSiteOption =>
      values.edit.pairCustomerIds?.find(customerId => customerId === jobSiteOption.value),
  );

  const handlePriceChangeCalculationChange = useCallback(
    (value: 'percentage' | 'flat') => {
      setFieldValue('edit.calculation', value);
    },
    [setFieldValue],
  );

  const handleEditTypeChange = useCallback(
    (_: string, value: BulkRatesEditType) => {
      const editData = getEditDataPayload(value);

      setFormikState(prevState => ({
        ...prevState,
        values: {
          ...prevState.values,
          edit: {
            ...prevState.values.edit,
            type: value,
            ...editData,
            effectiveDate: startOfToday(),
          },
        },
        errors: {},
      }));
    },
    [setFormikState],
  );

  const handleAffectedEntityChange = useCallback(
    (_: string, value: BulkRatesAffectedEntity) => {
      setFormikState(prevState => ({
        ...prevState,
        values: {
          ...prevState.values,
          edit: {
            ...prevState.values.edit,
            application: value,
            applyTo: [],
            pairCustomerIds: [],
          },
        },
        errors: {
          ...prevState.errors,
          edit: {
            ...prevState.errors.edit,
            applyTo: undefined,
            pairCustomerIds: undefined,
          },
        },
      }));
    },
    [setFormikState],
  );

  return (
    <>
      <Layouts.Flex>
        <Layouts.Margin right="1">
          <Layouts.Box
            backgroundColor="secondary"
            backgroundShade="desaturated"
            className={localStyles.badge}
          >
            <Typography color="white" variant="caption" textAlign="center">
              1
            </Typography>
          </Layouts.Box>
        </Layouts.Margin>
        <Typography color="secondary" shade="light" variant="caption" textTransform="uppercase">
          {t(`${I18N_PATH}PriceChange`)}
        </Typography>
      </Layouts.Flex>
      <Layouts.Padding top="3" bottom="3">
        <Layouts.Flex>
          <Layouts.Margin right="3">
            <RadioButton
              name="priceChange"
              onChange={() => handlePriceChangeCalculationChange('percentage')}
              value={getIn(values, [mode, 'calculation']) === 'percentage'}
            >
              {t('Text.Percentage')}
            </RadioButton>
          </Layouts.Margin>
          <RadioButton
            name="priceChange"
            onChange={() => handlePriceChangeCalculationChange('flat')}
            value={getIn(values, [mode, 'calculation']) === 'flat'}
          >
            {t(`${I18N_PATH}Flat`)}
          </RadioButton>
        </Layouts.Flex>
      </Layouts.Padding>
      <Layouts.Padding bottom="3">
        <Layouts.Flex alignItems="center" className={localStyles.priceChangeBlock}>
          <Select
            name="edit.direction"
            ariaLabel={t('Text.PriceDirection')}
            options={normalizeOptions(['increase', 'decrease'])}
            value={getIn(values, [mode, 'direction'])}
            error={getIn(errors, [mode, 'direction'])}
            onSelectChange={setFieldValue}
            nonClearable
            noErrorMessage
          />
          <Layouts.Margin left="1" right="1">
            <Typography as="span">{t(`${I18N_PATH}for`)}</Typography>
          </Layouts.Margin>
          <FormInput
            name="edit.value"
            ariaLabel={
              getIn(values, [mode, 'calculation']) === 'flat'
                ? 'Value in currency'
                : 'Value in percents'
            }
            onChange={handleChange}
            value={getIn(values, [mode, 'value'])}
            error={getIn(errors, [mode, 'value'])}
            noError
          />
          <Layouts.Margin left="1" right="1">
            <Typography className={localStyles.label} as="span">
              {`${getIn(values, [mode, 'calculation']) === 'flat' ? '$' : '%'} ${t(
                `${I18N_PATH}from`,
              )}`}
            </Typography>
          </Layouts.Margin>
          <Select
            name="edit.source"
            ariaLabel={t('Text.Source')}
            options={normalizeOptions(['global', 'current'])}
            value={getIn(values, [mode, 'source'])}
            error={getIn(errors, [mode, 'source'])}
            onSelectChange={setFieldValue}
            nonClearable
            noErrorMessage
          />
          <Layouts.Margin left="1">
            <Typography as="span">{t(`${I18N_PATH}price`)}</Typography>
          </Layouts.Margin>
        </Layouts.Flex>
        <Layouts.Margin top="1">
          <Typography variant="bodySmall" color="alert">
            {errors.edit?.value}
          </Typography>
        </Layouts.Margin>
      </Layouts.Padding>
      <Layouts.Flex>
        <Layouts.Margin right="1">
          <Layouts.Box
            backgroundColor="secondary"
            backgroundShade="desaturated"
            className={localStyles.badge}
          >
            <Typography color="white" variant="caption" textAlign="center">
              2
            </Typography>
          </Layouts.Box>
        </Layouts.Margin>
        <Typography
          as="label"
          htmlFor="edit.type"
          color="secondary"
          shade="light"
          variant="caption"
          textTransform="uppercase"
        >
          {t(`${I18N_PATH}EditPriceFor`)}
        </Typography>
      </Layouts.Flex>
      <Layouts.Padding top="3" bottom="3">
        <Select
          name="edit.type"
          options={normalizeOptions([
            BulkRatesEditType.allBillableItems,
            BulkRatesEditType.allServices,
            BulkRatesEditType.specificServices,
            BulkRatesEditType.allLineItems,
            BulkRatesEditType.specificLineItems,
            BulkRatesEditType.allRecurringLineItems,
            BulkRatesEditType.specificRecurringLineItems,
          ])}
          value={getIn(values, [mode, 'type'])}
          error={getIn(errors, [mode, 'type'])}
          onSelectChange={handleEditTypeChange}
          nonClearable
        />
        {getIn(values, [mode, 'type']) === BulkRatesEditType.allServices ? (
          <MultiSelect
            name="edit.equipmentItems"
            ariaLabel={t('Text.EquipmentItems')}
            options={equipmentItemOptions}
            value={getIn(values, [mode, 'equipmentItems'])}
            error={getIn(errors, [mode, 'equipmentItems'])}
            onSelectChange={setFieldValue}
          />
        ) : null}
        {getIn(values, [mode, 'type']) === BulkRatesEditType.specificServices ? (
          <MultiSelect
            name="edit.services"
            ariaLabel={t('Text.Services')}
            options={serviceOptions}
            value={getIn(values, [mode, 'services'])}
            error={getIn(errors, [mode, 'services'])}
            onSelectChange={setFieldValue}
          />
        ) : null}
        {getIn(values, [mode, 'type']) === BulkRatesEditType.specificLineItems ? (
          <MultiSelect
            name="edit.lineItems"
            ariaLabel={t('Text.LineItems')}
            options={lineItemOptions}
            value={getIn(values, [mode, 'lineItems'])}
            error={getIn(errors, [mode, 'lineItems'])}
            onSelectChange={setFieldValue}
          />
        ) : null}
        {getIn(values, [mode, 'type']) === BulkRatesEditType.specificRecurringLineItems ? (
          <MultiSelect
            name="edit.recurringLineItems"
            ariaLabel={t('Text.RecurringLineItems')}
            options={specificRecurringLineItemOptions}
            value={getIn(values, [mode, 'recurringLineItems'])}
            error={getIn(errors, [mode, 'recurringLineItems'])}
            onSelectChange={setFieldValue}
          />
        ) : null}
        <MultiSelect
          name="edit.materials"
          ariaLabel={t('Text.Materials')}
          options={materialOptions}
          value={getIn(values, [mode, 'materials'])}
          error={getIn(errors, [mode, 'materials'])}
          onSelectChange={setFieldValue}
        />
      </Layouts.Padding>
      <Layouts.Flex>
        <Layouts.Margin right="1">
          <Layouts.Box
            backgroundColor="secondary"
            backgroundShade="desaturated"
            className={localStyles.badge}
          >
            <Typography color="white" variant="caption" textAlign="center">
              3
            </Typography>
          </Layouts.Box>
        </Layouts.Margin>
        <Typography
          as="label"
          htmlFor="edit.application"
          color="secondary"
          shade="light"
          variant="caption"
          textTransform="uppercase"
        >
          {t(`${I18N_PATH}ApplyChangesTo`)}
        </Typography>
      </Layouts.Flex>
      <Layouts.Padding top="3" bottom="3">
        <Select
          name="edit.application"
          options={normalizeOptions([
            BulkRatesAffectedEntity.customers,
            BulkRatesAffectedEntity.customerGroups,
            BulkRatesAffectedEntity.customerJobSites,
            BulkRatesAffectedEntity.specificPriceGroups,
            // BulkRatesAffectedEntity.serviceAreas, // not implemented on backend yet
          ])}
          value={getIn(values, [mode, 'application'])}
          error={getIn(errors, [mode, 'application'])}
          onSelectChange={handleAffectedEntityChange}
          nonClearable
          noErrorMessage
        />
      </Layouts.Padding>
      {getIn(values, [mode, 'application']) === BulkRatesAffectedEntity.customerGroups ? (
        <MultiSelect
          name="edit.applyTo"
          ariaLabel={t(`${I18N_PATH}ApplyToCustomerGroups`)}
          options={customerGroupOptions}
          value={getIn(values, [mode, 'applyTo'])}
          error={getIn(errors, [mode, 'applyTo'])}
          onSelectChange={setFieldValue}
        />
      ) : null}
      {getIn(values, [mode, 'application']) === BulkRatesAffectedEntity.specificPriceGroups ? (
        <MultiSelect
          name="edit.applyTo"
          ariaLabel={t(`${I18N_PATH}ApplyToPriceGroups`)}
          options={priceGroupOptions}
          value={getIn(values, [mode, 'applyTo'])}
          error={getIn(errors, [mode, 'applyTo'])}
          onSelectChange={setFieldValue}
        />
      ) : null}
      {getIn(values, [mode, 'application']) === BulkRatesAffectedEntity.customerJobSites ? (
        <>
          <MultiSelect
            name="edit.pairCustomerIds"
            ariaLabel={t(`${I18N_PATH}PairCustomerIdentifications`)}
            options={pairCustomerOptions}
            value={getIn(values, [mode, 'pairCustomerIds'])}
            error={getIn(errors, [mode, 'pairCustomerIds'])}
            onSelectChange={setFieldValue}
          />
          {getIn(values, [mode, 'pairCustomerIds']).length > 0 ? (
            <MultiSelect
              name="edit.applyTo"
              ariaLabel={t(`${I18N_PATH}ApplyToPairCustomerIdentifications`)}
              options={pairCustomerJobSiteIntersectionOptions}
              value={getIn(values, [mode, 'applyTo'])}
              error={getIn(errors, [mode, 'applyTo'])}
              onSelectChange={setFieldValue}
            />
          ) : null}
        </>
      ) : null}
      {getIn(values, [mode, 'application']) === BulkRatesAffectedEntity.customers ? (
        <MultiSelect
          name="edit.applyTo"
          ariaLabel={t(`${I18N_PATH}ApplyToCustomers`)}
          options={customerOptions}
          value={getIn(values, [mode, 'applyTo'])}
          error={getIn(errors, [mode, 'applyTo'])}
          onSelectChange={setFieldValue}
        />
      ) : null}
      {getIn(values, [mode, 'application']) === BulkRatesAffectedEntity.serviceAreas ? (
        <MultiSelect
          name="edit.applyTo"
          ariaLabel={t(`${I18N_PATH}ApplyToServiceAreas`)}
          options={serviceAreaOptions}
          value={getIn(values, [mode, 'applyTo'])}
          error={getIn(errors, [mode, 'applyTo'])}
          onSelectChange={setFieldValue}
        />
      ) : null}
      <Layouts.Margin top="1">
        <Layouts.Flex alignItems="center">
          <Layouts.Margin right="1">
            <Layouts.Box
              backgroundColor="secondary"
              backgroundShade="desaturated"
              className={localStyles.badge}
            >
              <Typography color="white" variant="caption" textAlign="center">
                4
              </Typography>
            </Layouts.Box>
          </Layouts.Margin>
          <Typography color="secondary" shade="light" variant="caption" textTransform="uppercase">
            {t(`${I18N_PATH}EffectiveDate`)}
          </Typography>
        </Layouts.Flex>
        <Layouts.Margin top="2">
          <Calendar
            dateFormat={dateFormat}
            firstDayOfWeek={firstDayOfWeek}
            label={t(`${I18N_PATH}EffectiveDate`)}
            name="edit.effectiveDate"
            withInput
            value={getIn(values, [mode, 'effectiveDate'])}
            error={getIn(errors, [mode, 'effectiveDate'])}
            minDate={today}
            onDateChange={setFieldValue}
          />
        </Layouts.Margin>
      </Layouts.Margin>
    </>
  );
};

export default observer(BulkPricingEditTab);
