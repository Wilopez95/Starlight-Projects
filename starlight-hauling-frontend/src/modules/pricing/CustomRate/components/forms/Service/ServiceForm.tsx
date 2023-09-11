import React, { useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  IGridLayout,
  Layouts,
  Navigation,
  NavigationConfigItem,
  Typography,
} from '@starlightpro/shared-components';
import cx from 'classnames';
import { getIn, useFormikContext } from 'formik';
import { observer } from 'mobx-react-lite';
import validator from 'validator';

import { HistoryIcon } from '@root/assets';
import { Badge, FormInput, Protected } from '@root/common';
import { useBusinessContext, useStores } from '@root/hooks';
import { useIntl } from '@root/i18n/useIntl';
import { RatesEntityType } from '@root/modules/pricing/const';

import {
  FormSkeleton,
  InputOperations,
  MaterialNavItem,
  MaterialNotLinked,
} from '../../../../components';
import { calculateFinalPrice, calculatePercentage, toFixed } from '../../../../GeneralRate/helpers';
import BulkRatesEditor from '../BulkRatesEditor/BulkRatesEditor';

import styles from '../../../../css/styles.scss';
import {
  equipmentItemsLoadingNavigationConfig,
  materialsLoadingNavigationConfig,
} from './navigationConfigs';
import { type IServiceCustomRateFormikData, type IServiceForm } from './types';

const I18N_PATH = 'modules.pricing.CustomRate.components.forms.Text.';

const gridFormat: IGridLayout = {
  columnGap: '2',
  columns: '100px 140px 120px 15px 120px',
  rows: '36px',
  alignItems: 'center',
};

const ServiceForm: React.FC<IServiceForm> = ({
  onMaterialChange,
  onEquipmentItemChange,
  onShowRatesHistory,
  currentEquipmentItemNavigation,
  currentMaterialNavigation,
  viewMode = false,
}) => {
  const {
    businessLineStore,
    generalRateStoreNew,
    billableServiceStore,
    equipmentItemStore,
    materialStore,
    priceGroupStoreNew,
    customRateStoreNew,
  } = useStores();
  const { currencySymbol } = useIntl();
  const { t } = useTranslation();

  const formik = useFormikContext<IServiceCustomRateFormikData>();
  const { businessLineId, businessUnitId } = useBusinessContext();

  const selectedPriceGroup = priceGroupStoreNew.selectedEntity;

  const isRecyclingLoB = businessLineStore.isRecyclingType(businessLineId);

  const materialsNavigation: NavigationConfigItem[] = useMemo(
    () => [
      { label: t('Form.NoneMaterial'), key: null, index: 0 },
      ...materialStore.sortedValues
        .filter(material => !isRecyclingLoB || material.useForDump || material.useForLoad)
        .map((material, index) => ({
          label: <MaterialNavItem text={material.description} active={material.active} />,
          key: material.id.toString(),
          index: index + 1,
        })),
    ],
    [isRecyclingLoB, materialStore.sortedValues, t],
  );

  const equipmentItemsNavigation: NavigationConfigItem<string>[] = equipmentItemStore.sortedValues
    .filter(equipmentItem => (isRecyclingLoB ? !!equipmentItem.recyclingDefault : true))
    .map((equipmentItem, index) => ({
      label: equipmentItem.shortDescription,
      key: equipmentItem.id.toString(),
      index,
    }));

  useEffect(() => {
    if (selectedPriceGroup) {
      generalRateStoreNew.request({
        businessLineId,
        businessUnitId,
        entityType: RatesEntityType.oneTimeService,
      });
      customRateStoreNew.request({
        businessLineId,
        businessUnitId,
        id: selectedPriceGroup.id,
        entityType: RatesEntityType.oneTimeService,
      });
    }
  }, [businessLineId, businessUnitId, customRateStoreNew, generalRateStoreNew, selectedPriceGroup]);

  useEffect(() => {
    if (
      !currentEquipmentItemNavigation &&
      !equipmentItemStore.loading &&
      equipmentItemsNavigation.length
    ) {
      onEquipmentItemChange?.(equipmentItemsNavigation[0]);
    }

    if (!materialStore.loading && materialsNavigation.length && !currentMaterialNavigation) {
      onMaterialChange?.(materialsNavigation[0]);
    }
  }, [
    equipmentItemStore.loading,
    equipmentItemsNavigation,
    currentEquipmentItemNavigation,
    currentMaterialNavigation,
    materialStore.loading,
    materialsNavigation,
    onEquipmentItemChange,
    onMaterialChange,
  ]);

  useEffect(() => {
    if (currentEquipmentItemNavigation && currentMaterialNavigation && selectedPriceGroup) {
      generalRateStoreNew.filterOneTimeServiceRatesByParameters({
        materialId: currentMaterialNavigation.key
          ? Number.parseInt(currentMaterialNavigation.key, 10)
          : null,
        equipmentItemId: Number.parseInt(currentEquipmentItemNavigation.key, 10),
      });
      customRateStoreNew.filterOneTimeServiceRatesByParameters({
        materialId: currentMaterialNavigation.key
          ? Number.parseInt(currentMaterialNavigation.key, 10)
          : null,
        equipmentItemId: Number.parseInt(currentEquipmentItemNavigation.key, 10),
      });
    }
  }, [
    currentEquipmentItemNavigation,
    currentMaterialNavigation,
    generalRateStoreNew,
    customRateStoreNew,
    selectedPriceGroup,
    customRateStoreNew.isPreconditionFailed,
    businessUnitId,
    businessLineId,
  ]);

  const { values, errors, setFieldValue, handleBlur, setFieldTouched } = formik;

  const handleValueChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, index: number) => {
      const { value } = e.target;
      const price = values.oneTimeService[index].price ?? 0;
      let operation = values.oneTimeService[index].operation;

      const service = { ...values.oneTimeService[index] };

      if (price > 0) {
        operation = operation ?? true;

        service.value = value;
        service.operation = operation;

        const finalPrice = calculateFinalPrice(operation, +value, +price);

        service.displayValue = value;
        service.finalPrice = finalPrice;
      }

      setFieldValue(`oneTimeService[${index}]`, service);
    },
    [setFieldValue, values],
  );

  const handleFinalPriceChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, index: number) => {
      const { value } = e.target;
      const price = values.oneTimeService[index].price ?? 0;

      const service = { ...values.oneTimeService[index] };

      if (price > 0) {
        service.finalPrice = value;

        if (values.oneTimeService[index].operation === undefined) {
          service.operation = true;
        }
        const percentage = calculatePercentage(price, +value);

        service.value = percentage;
        if (percentage) {
          service.displayValue = toFixed(+percentage, 3);
          service.operation = +value > price;
        } else {
          service.displayValue = undefined;
          service.operation = undefined;
        }
      }
      setFieldTouched(`oneTimeService[${index}].value`, true);
      setFieldValue(`oneTimeService[${index}]`, service);
    },
    [setFieldValue, setFieldTouched, values],
  );

  const handleOperationChange = useCallback(
    (operation: boolean, index: number) => {
      if (!viewMode) {
        const baseFieldName = `oneTimeService[${index}]`;
        const price = values.oneTimeService[index].price ?? 0;

        if (price > 0) {
          setFieldValue(`${baseFieldName}.operation`, operation);
          const value = values.oneTimeService[index].value ?? 0;

          const finalPrice = calculateFinalPrice(operation, +value, +price);

          if (validator.isNumeric(finalPrice)) {
            setFieldValue(`${baseFieldName}.finalPrice`, finalPrice);
          }

          setFieldTouched(`oneTimeService[${index}].value`, true);
        }
      }
    },
    [viewMode, values.oneTimeService, setFieldValue, setFieldTouched],
  );

  const isMaterialLinked = useMemo(() => {
    if (currentMaterialNavigation && currentEquipmentItemNavigation) {
      const material = currentMaterialNavigation.key
        ? materialStore.getById(+currentMaterialNavigation.key)
        : undefined;

      return material?.equipmentItemIds?.some(
        equipmentItemId => equipmentItemId === +currentEquipmentItemNavigation.key,
      );
    }

    return false;
  }, [currentEquipmentItemNavigation, currentMaterialNavigation, materialStore]);

  const inputDisabled = (index: number) =>
    (viewMode || values.bulkEnabled) ?? !values.oneTimeService[index].price;

  const handleShowHistory = useCallback(
    (billableServiceId: number, serviceDescription = '') => {
      if (currentEquipmentItemNavigation && currentMaterialNavigation && selectedPriceGroup) {
        const ratesHistoryParams = {
          businessUnitId,
          businessLineId,
          billableServiceId,
          materialId: currentMaterialNavigation.key
            ? Number.parseInt(currentMaterialNavigation.key, 10)
            : null,
          equipmentItemId: Number.parseInt(currentEquipmentItemNavigation.key, 10),
          customRatesGroupId: selectedPriceGroup.id,
          entityType: RatesEntityType.oneTimeService,
        };
        const materialLabel = currentMaterialNavigation.key
          ? materialStore.getById(+currentMaterialNavigation.key)?.description
          : '';

        onShowRatesHistory(ratesHistoryParams, [serviceDescription, materialLabel].join(' • '));
      }
    },
    [
      currentEquipmentItemNavigation,
      currentMaterialNavigation,
      selectedPriceGroup,
      businessLineId,
      businessUnitId,
      materialStore,
      onShowRatesHistory,
    ],
  );

  return (
    <>
      <Navigation
        activeTab={currentMaterialNavigation}
        configs={materialStore.loading ? materialsLoadingNavigationConfig : materialsNavigation}
        onChange={onMaterialChange}
        className={cx(styles.customerMaterialsNavigation, styles.quickView)}
        direction="column"
      />
      <Layouts.Flex direction="column" as={Layouts.Box} width="80%">
        <Navigation
          activeTab={currentEquipmentItemNavigation}
          configs={
            equipmentItemStore.loading
              ? equipmentItemsLoadingNavigationConfig
              : equipmentItemsNavigation
          }
          onChange={onEquipmentItemChange}
          className={styles.equipmentItemsNavigation}
          carousel
        />
        {currentEquipmentItemNavigation && currentMaterialNavigation ? (
          <Layouts.Padding top="1" right="0.5" bottom="0" left="2">
            <Layouts.Box width="100%">
              {customRateStoreNew.loading ? (
                <FormSkeleton />
              ) : (
                <>
                  {currentMaterialNavigation?.key !== null && !isMaterialLinked ? (
                    <MaterialNotLinked businessLineId={businessLineId} />
                  ) : (
                    <Layouts.Box>
                      <BulkRatesEditor
                        prop={RatesEntityType.oneTimeService}
                        currentRates={values.oneTimeService}
                        viewMode={viewMode}
                        gridFormat={gridFormat}
                      />
                      <Typography
                        textTransform="uppercase"
                        variant="headerFive"
                        color="secondary"
                        shade="desaturated"
                      >
                        <Layouts.Grid {...gridFormat}>
                          <Layouts.Flex justifyContent="flex-start">
                            {t(`${I18N_PATH}Service`)}
                          </Layouts.Flex>
                          <Layouts.Flex as={Layouts.Margin} right="2" justifyContent="flex-end">
                            {t(`${I18N_PATH}GeneralPrice`)}, {currencySymbol}
                          </Layouts.Flex>
                          <Layouts.Flex justifyContent="flex-end">
                            {t(`${I18N_PATH}Value`)}
                          </Layouts.Flex>
                          <Layouts.Box />
                          <Layouts.Flex justifyContent="flex-end">
                            {t(`${I18N_PATH}FinalPrice`)}
                            {currencySymbol}
                          </Layouts.Flex>
                        </Layouts.Grid>
                      </Typography>
                      {values.oneTimeService?.map((service, index) => {
                        const billableService = billableServiceStore.getById(
                          service.billableServiceId,
                        );
                        const isDisabled = inputDisabled(index);

                        return (
                          <Layouts.Padding
                            key={service.billableServiceId}
                            top="1"
                            bottom="1"
                            className={styles.historyLabel}
                          >
                            <Layouts.Grid {...gridFormat}>
                              <Layouts.Flex justifyContent="flex-start">
                                {billableService?.description}
                                {!billableService?.active ? (
                                  <Badge color="alert" className={styles.inactive}>
                                    {t('Text.Inactive')}
                                  </Badge>
                                ) : null}
                                <Protected permissions="configuration/price-groups:view-history:perform">
                                  <HistoryIcon
                                    className={styles.rateHistoryIcon}
                                    onClick={() =>
                                      handleShowHistory(
                                        service.billableServiceId,
                                        billableService?.description,
                                      )
                                    }
                                  />
                                </Protected>
                              </Layouts.Flex>
                              <Layouts.Margin right="2">
                                <Typography textAlign="right">
                                  {service.price ? `$${service.price}` : null}
                                </Typography>
                              </Layouts.Margin>
                              <Layouts.Flex direction="row" justifyContent="flex-end">
                                <InputOperations
                                  active={service.operation}
                                  disabled={isDisabled}
                                  aria-label={t('Text.Decrease')}
                                  onIncrement={() => handleOperationChange(true, index)}
                                  onDecrement={() => handleOperationChange(false, index)}
                                />
                                <FormInput
                                  type="number"
                                  name={`oneTimeService[${index}].value`}
                                  ariaLabel="Value in percents"
                                  key="value"
                                  value={values.oneTimeService[index].displayValue}
                                  disabled={isDisabled}
                                  onChange={e => handleValueChange(e, index)}
                                  onBlur={handleBlur}
                                  error={getIn(errors.oneTimeService, `[${index}].value`)}
                                  noError={!getIn(errors.oneTimeService, `[${index}].value`)}
                                  wrapClassName={styles.input}
                                />
                              </Layouts.Flex>
                              <Layouts.Flex alignItems="center">
                                {/* {willChange && (
                                  <Layouts.Box>
                                    <Tooltip
                                      text={t(`${I18N_PATH}EffectiveDateTooltip`, {
                                        price: formatCurrency(nextPrice),
                                        date:
                                          (isDate(effectiveDate) &&
                                            formatDateTime(effectiveDate).date) ??
                                          '',
                                      })}
                                    >
                                      <InfoIcon className={styles.infoIcon} onClick={noop} />
                                    </Tooltip>
                                  </Layouts.Box>
                                )} */}
                              </Layouts.Flex>
                              <Layouts.Flex justifyContent="flex-end">
                                <FormInput
                                  name={`oneTimeService[${index}].finalPrice`}
                                  type="number"
                                  ariaLabel="final price"
                                  key="finalPrice"
                                  value={values.oneTimeService[index].finalPrice}
                                  disabled={isDisabled}
                                  onChange={e => handleFinalPriceChange(e, index)}
                                  error={getIn(errors.oneTimeService, `[${index}].finalPrice`)}
                                  noError={!getIn(errors.oneTimeService, `[${index}].finalPrice`)}
                                  wrapClassName={styles.input}
                                />
                              </Layouts.Flex>
                            </Layouts.Grid>
                          </Layouts.Padding>
                        );
                      })}
                    </Layouts.Box>
                  )}
                </>
              )}
            </Layouts.Box>
          </Layouts.Padding>
        ) : null}
      </Layouts.Flex>
    </>
  );
};

export default observer(ServiceForm);
