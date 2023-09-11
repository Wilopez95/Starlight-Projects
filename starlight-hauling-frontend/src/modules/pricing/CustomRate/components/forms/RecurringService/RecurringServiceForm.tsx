import React, { useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Badge,
  CollapsibleBar,
  FormInput,
  IGridLayout,
  InfoIcon,
  Layouts,
  Navigation,
  NavigationConfigItem,
  Tooltip,
  Typography,
} from '@starlightpro/shared-components';
import cx from 'classnames';
import { isBefore, startOfToday } from 'date-fns';
import { getIn, useFormikContext } from 'formik';
import { capitalize, isDate, noop, upperCase } from 'lodash-es';
import { observer } from 'mobx-react-lite';
import validator from 'validator';

import { HistoryIcon } from '@root/assets';
import { BillingCycleEnum } from '@root/consts';
import { useBusinessContext, useStores } from '@root/hooks';
import { useIntl } from '@root/i18n/useIntl';
import { RatesEntityType } from '@root/modules/pricing/const';
import { getFrequencyText } from '@root/pages/SystemConfiguration/components/Frequency/helpers';
import { IBillableService, IFrequency } from '@root/types';

import {
  FormSkeleton,
  InputOperations,
  MaterialNavItem,
  MaterialNotLinked,
} from '../../../../components';
import { calculateFinalPrice, calculatePercentage, toFixed } from '../../../../GeneralRate/helpers';
import BulkRatesEditor from '../BulkRatesEditor/BulkRatesEditor';

import styles from '../../../../css/styles.scss';
import { IRecurringServiceCustomRate } from '../../../types';
import {
  equipmentItemsLoadingNavigationConfig,
  materialsLoadingNavigationConfig,
} from './navigationConfigs';
import { type IRecurringServiceCustomRateFormikData, type IRecurringServiceForm } from './types';

const today = startOfToday();

const I18N_PATH = 'modules.pricing.CustomRate.components.forms.Text.';

const gridFormat: IGridLayout = {
  columnGap: '2',
  columns: 'auto 120px 120px 15px 120px',
  rows: '36px',
  alignItems: 'center',
};

const RecurringServiceForm: React.FC<IRecurringServiceForm> = ({
  onMaterialChange,
  onEquipmentItemChange,
  setInitialValues,
  currentEquipmentItemNavigation,
  currentMaterialNavigation,
  viewMode = false,
  onShowRatesHistory,
}) => {
  const {
    generalRateStoreNew,
    billableServiceStore,
    equipmentItemStore,
    materialStore,
    priceGroupStoreNew,
    customRateStoreNew,
  } = useStores();
  const { t } = useTranslation();

  const formik = useFormikContext<IRecurringServiceCustomRateFormikData>();
  const { businessLineId, businessUnitId } = useBusinessContext();
  const { formatCurrency, currencySymbol, formatDateTime } = useIntl();

  const selectedPriceGroup = priceGroupStoreNew.selectedEntity;

  const materialsNavigation: NavigationConfigItem[] = useMemo(
    () => [
      { label: t('Form.NoneMaterial'), key: null, index: 0 },
      ...materialStore.sortedValues.map((material, index) => ({
        label: <MaterialNavItem text={material.description} active={material.active} />,
        key: material.id.toString(),
        index: index + 1,
      })),
    ],
    [materialStore.sortedValues, t],
  );

  const equipmentItemsNavigation: NavigationConfigItem<string>[] =
    equipmentItemStore.sortedValues.map((equipmentItem, index) => ({
      label: equipmentItem.shortDescription,
      key: equipmentItem.id.toString(),
      index,
    }));

  useEffect(() => {
    if (selectedPriceGroup) {
      generalRateStoreNew.request({
        businessLineId,
        businessUnitId,
        entityType: RatesEntityType.recurringService,
      });
      customRateStoreNew.request({
        businessLineId,
        businessUnitId,
        id: selectedPriceGroup.id,
        entityType: RatesEntityType.recurringService,
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

    if (
      !materialStore.loading &&
      materialsNavigation.length &&
      (!currentMaterialNavigation || currentMaterialNavigation.key === null)
    ) {
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
    if (
      currentEquipmentItemNavigation &&
      currentMaterialNavigation &&
      selectedPriceGroup &&
      currentMaterialNavigation.key !== null
    ) {
      generalRateStoreNew.filterRecurrentServiceRatesByParameters({
        materialId: currentMaterialNavigation.key
          ? Number.parseInt(currentMaterialNavigation.key, 10)
          : null,
        equipmentItemId: Number.parseInt(currentEquipmentItemNavigation.key, 10),
      });
      customRateStoreNew.filterRecurrentServiceRatesByParameters({
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
    (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
      index: number,
      frequencyIndex: number,
    ) => {
      const { value } = e.target;
      const price = values.recurringService[index]?.frequencies?.[frequencyIndex].globalPrice ?? 0;
      let operation = values.recurringService[index].operation;

      const frequency = values.recurringService[index].frequencies?.[frequencyIndex];

      if (frequency && price > 0) {
        operation = operation ?? true;

        frequency.value = value;
        frequency.operation = operation;

        const finalPrice = calculateFinalPrice(operation, +value, +price);

        frequency.price = finalPrice;
        frequency.displayValue = value;
        frequency.finalPrice = finalPrice;
      }

      setFieldValue(`recurringService[${index}].frequencies[${frequencyIndex}]`, frequency);
    },
    [setFieldValue, values],
  );

  const handleFinalPriceChange = useCallback(
    (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
      index: number,
      frequencyIndex: number,
    ) => {
      const { value } = e.target;
      const price = values.recurringService[index].frequencies?.[frequencyIndex].globalPrice ?? 0;

      const frequency = {
        ...values.recurringService[index].frequencies?.[frequencyIndex],
      };

      if (frequency && price > 0) {
        frequency.finalPrice = value;

        if (values.recurringService[index].frequencies?.[frequencyIndex].operation === undefined) {
          frequency.operation = true;
        }
        const percentage = calculatePercentage(+price, +value);

        frequency.value = percentage;
        if (percentage) {
          frequency.displayValue = toFixed(+percentage, 3);
          frequency.operation = +value > price;
        } else {
          frequency.displayValue = undefined;
          frequency.operation = undefined;
        }
      }

      setFieldTouched(`recurringService[${index}].frequencies[${frequencyIndex}].value`, true);
      setFieldValue(`recurringService[${index}].frequencies[${frequencyIndex}]`, frequency);
    },
    [setFieldValue, setFieldTouched, values],
  );

  const handleOperationChange = useCallback(
    (operation: boolean, index: number, frequencyIndex: number) => {
      if (!viewMode) {
        const baseFieldName = `recurringService[${index}].frequencies[${frequencyIndex}]`;
        const price = values.recurringService[index].frequencies?.[frequencyIndex].globalPrice ?? 0;

        if (price > 0) {
          setFieldValue(`${baseFieldName}.operation`, operation);
          const value = values.recurringService[index].frequencies?.[frequencyIndex].value ?? 0;

          const finalPrice = calculateFinalPrice(operation, +value, +price);

          if (validator.isNumeric(finalPrice)) {
            setFieldValue(`${baseFieldName}.finalPrice`, finalPrice);
          }

          setFieldTouched(`recurringService[${index}].frequencies[${frequencyIndex}].value`, true);
        }
      }
    },
    [viewMode, values.recurringService, setFieldValue, setFieldTouched],
  );

  const isMaterialLinked = useMemo(() => {
    if (currentMaterialNavigation && currentEquipmentItemNavigation) {
      const material = currentMaterialNavigation?.key
        ? materialStore.getById(+currentMaterialNavigation.key)
        : undefined;

      return material?.equipmentItemIds?.some(
        equipmentItemId => equipmentItemId === +currentEquipmentItemNavigation.key,
      );
    }

    return false;
  }, [currentMaterialNavigation, currentEquipmentItemNavigation, materialStore]);

  useEffect(() => {
    (async () => {
      if (
        (isMaterialLinked || currentMaterialNavigation?.key === null) &&
        !generalRateStoreNew.loading &&
        !customRateStoreNew.loading &&
        values.recurringService?.length
      ) {
        const fetchedFrequencies = await Promise.all(
          values.recurringService?.map((service: IRecurringServiceCustomRate) => {
            if (!service.frequencies) {
              const frequencies = billableServiceStore.requestFrequencies(
                service.billableServiceId,
                {
                  globalRateRecurringServiceId: service.globalRateId,
                  customRateRecurringServiceId: service.id,
                  billingCycle: service.billingCycle,
                },
              );

              return frequencies;
            }

            return undefined;
          }),
        );

        if (!fetchedFrequencies.some(frequency => !!frequency)) {
          return;
        }

        const updatedServices = fetchedFrequencies
          .map((frequencies?: IFrequency[]) => {
            if (!frequencies) {
              return undefined;
            }

            return frequencies?.map((frequency: IFrequency) => {
              let displayValue: number | undefined;
              let value: number | undefined;
              let operation;

              if (frequency?.price) {
                if (!frequency.globalPrice) {
                  frequency.globalPrice = frequency.price;
                }
                value =
                  (100 * (+frequency.price - +frequency.globalPrice)) / +frequency.globalPrice ||
                  undefined;
              }

              if (value) {
                operation = +value > 0;
                value = Math.abs(+value);

                displayValue = +(+value).toFixed(3);
              }

              return {
                ...frequency,
                price: frequency.price,
                value: value?.toString(),
                finalPrice: frequency.price?.toString() ?? undefined,
                displayValue: displayValue?.toString(),
                operation,
              };
            });
          })
          .map((frequencies, index) => ({
            ...values.recurringService[index],
            frequencies,
          }));

        setInitialValues?.({ recurringService: [...updatedServices] });
      }
    })();
  }, [
    values.recurringService,
    billableServiceStore,
    isMaterialLinked,
    generalRateStoreNew,
    generalRateStoreNew.loading,
    currentMaterialNavigation?.key,
    setInitialValues,
    customRateStoreNew.loading,
  ]);

  const handleShowHistory = useCallback(
    (
      billableServiceId: number,
      serviceDescription = '',
      billingCycle?: BillingCycleEnum | null,
      frequencyId?: number,
    ) => {
      if (currentEquipmentItemNavigation && currentMaterialNavigation) {
        const ratesHistoryParams = {
          businessUnitId,
          businessLineId,
          billableServiceId,
          billingCycle,
          frequencyId,
          materialId: currentMaterialNavigation.key
            ? Number.parseInt(currentMaterialNavigation.key, 10)
            : null,
          equipmentItemId: Number.parseInt(currentEquipmentItemNavigation.key, 10),
          entityType: RatesEntityType.recurringService,
          customRatesGroupId: selectedPriceGroup?.id,
        };
        const materialLabel = currentMaterialNavigation.key
          ? materialStore.getById(+currentMaterialNavigation.key)?.description
          : '';

        if (onShowRatesHistory) {
          onShowRatesHistory(ratesHistoryParams, [serviceDescription, materialLabel].join(' • '));
        }
      }
    },
    [
      currentEquipmentItemNavigation,
      currentMaterialNavigation,
      businessLineId,
      businessUnitId,
      materialStore,
      onShowRatesHistory,
      selectedPriceGroup?.id,
    ],
  );
  const inputDisabled = (index: number, frequencyIndex: number) =>
    (viewMode || values.bulkEnabled) ??
    !values.recurringService[index].frequencies?.[frequencyIndex]?.globalPrice;

  return (
    <>
      <Navigation
        activeTab={currentMaterialNavigation}
        configs={
          materialStore.loading || equipmentItemStore.loading
            ? materialsLoadingNavigationConfig
            : materialsNavigation
        }
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
                  {!isMaterialLinked && currentMaterialNavigation.key !== null ? (
                    <MaterialNotLinked businessLineId={businessLineId} />
                  ) : (
                    <>
                      <BulkRatesEditor
                        prop={RatesEntityType.recurringService}
                        currentRates={values.recurringService}
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
                            {t(`${I18N_PATH}ServiceFrequency`)}
                          </Layouts.Flex>
                          <Layouts.Flex justifyContent="flex-end">
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
                      <Layouts.Margin bottom="1" />
                      {values.recurringService?.map((service, index) => {
                        const billableService = billableServiceStore.getById(
                          service.billableServiceId,
                        );

                        const isServicing = service.frequencyId;

                        const includedServiceActions = (
                          billableService?.services as IBillableService[]
                        )
                          ?.map(includedService => {
                            return capitalize(includedService.description);
                          })
                          .join(', ');

                        return (
                          <CollapsibleBar
                            key={`service${index}${
                              service.billingCycle ? service.billingCycle : ''
                            }`}
                            label={
                              <Layouts.Box width="100%">
                                <Layouts.Padding padding="2">
                                  <Layouts.Flex
                                    justifyContent="space-between"
                                    alignItems="center"
                                    flexGrow={1}
                                  >
                                    <Typography variant="bodyMedium" fontWeight="medium">
                                      {capitalize(billableService?.description)}
                                      {!billableService?.active ? (
                                        <Badge color="alert" className={styles.inactive}>
                                          {t('Form.Inactive')}
                                        </Badge>
                                      ) : null}
                                    </Typography>

                                    <Typography
                                      variant="caption"
                                      color="secondary"
                                      shade="desaturated"
                                    >
                                      {upperCase(t(`Form.BillingCycle`))}:{' '}
                                      {service.billingCycle ? upperCase(service.billingCycle) : ''}
                                    </Typography>
                                  </Layouts.Flex>

                                  {includedServiceActions ? (
                                    <Typography
                                      variant="bodySmall"
                                      color="secondary"
                                      shade="desaturated"
                                    >
                                      {t(`Form.Includes`)}: {includedServiceActions}
                                    </Typography>
                                  ) : null}
                                </Layouts.Padding>
                              </Layouts.Box>
                            }
                            containerClassName={styles.expandChild}
                            marginizeArrow
                          >
                            {service.frequencies?.map((frequency, frequencyIndex) => {
                              const valueInputPath = `recurringService[${index}].frequencies[${frequencyIndex}].value`;
                              const finalPriceInputPath = `recurringService[${index}].frequencies[${frequencyIndex}].finalPrice`;
                              const nextPrice = frequency?.nextPrice;
                              const effectiveDate = frequency?.effectiveDate;
                              const willChange =
                                effectiveDate && isBefore(today, effectiveDate) && nextPrice;

                              return (
                                <Layouts.Padding key={valueInputPath} top="2" bottom="2" left="2">
                                  <Layouts.Grid {...gridFormat} className={styles.historyLabel}>
                                    <Layouts.Flex justifyContent="flex-start">
                                      <Typography>
                                        {isServicing
                                          ? getFrequencyText(t, frequency.type, frequency.times)
                                          : t('Text.NoFrequency')}
                                      </Typography>
                                      <Layouts.Padding top="0.5">
                                        <HistoryIcon
                                          className={styles.rateHistoryIcon}
                                          onClick={() =>
                                            handleShowHistory(
                                              service.billableServiceId,
                                              billableService?.description,
                                              service.billingCycle,
                                              frequency.id,
                                            )
                                          }
                                        />
                                      </Layouts.Padding>
                                    </Layouts.Flex>
                                    <Typography textAlign="right">
                                      {frequency.globalPrice ? `$${frequency.globalPrice}` : null}
                                    </Typography>
                                    <Layouts.Flex direction="row" justifyContent="flex-end">
                                      <Layouts.Padding right="0.5">
                                        <InputOperations
                                          active={frequency.operation}
                                          onDecrement={() =>
                                            handleOperationChange(false, index, frequencyIndex)
                                          }
                                          onIncrement={() =>
                                            handleOperationChange(true, index, frequencyIndex)
                                          }
                                          disabled={inputDisabled(index, frequencyIndex)}
                                        />
                                      </Layouts.Padding>
                                      <FormInput
                                        type="number"
                                        name={valueInputPath}
                                        ariaLabel="Value in percents"
                                        key="value"
                                        value={
                                          values.recurringService[index].frequencies?.[
                                            frequencyIndex
                                          ]?.displayValue
                                        }
                                        disabled={inputDisabled(index, frequencyIndex)}
                                        onChange={e => handleValueChange(e, index, frequencyIndex)}
                                        onBlur={handleBlur}
                                        error={getIn(errors, valueInputPath)}
                                        noError={!getIn(errors, valueInputPath)}
                                        wrapClassName={styles.input}
                                      />
                                    </Layouts.Flex>
                                    <Layouts.Flex alignItems="center">
                                      {willChange ? (
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
                                      ) : null}
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
                                        type="number"
                                        name={finalPriceInputPath}
                                        ariaLabel={t('Text.FinalPrice')}
                                        key="finalPrice"
                                        value={Number(
                                          values.recurringService[index].frequencies?.[
                                            frequencyIndex
                                          ]?.finalPrice ?? 0,
                                        )?.toFixed(2)}
                                        disabled={inputDisabled(index, frequencyIndex)}
                                        onChange={e =>
                                          handleFinalPriceChange(e, index, frequencyIndex)
                                        }
                                        error={getIn(errors, finalPriceInputPath)}
                                        noError={!getIn(errors, finalPriceInputPath)}
                                        wrapClassName={styles.input}
                                      />
                                    </Layouts.Flex>
                                  </Layouts.Grid>
                                </Layouts.Padding>
                              );
                            })}
                          </CollapsibleBar>
                        );
                      })}
                    </>
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

export default observer(RecurringServiceForm);
