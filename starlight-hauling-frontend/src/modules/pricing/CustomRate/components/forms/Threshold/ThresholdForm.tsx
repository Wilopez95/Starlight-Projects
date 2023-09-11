import React, { Fragment, useCallback, useEffect, useMemo } from 'react';
import {
  ISelectOption,
  Layouts,
  Navigation,
  NavigationConfigItem,
  Select,
  SelectValue,
} from '@starlightpro/shared-components';
import { getIn, useFormikContext } from 'formik';
import { startCase } from 'lodash-es';
import { observer } from 'mobx-react-lite';
import validator from 'validator';

import { HistoryIcon } from '@root/assets';
import { FormInput, Protected } from '@root/common';
import { Table, TableCell, TableRow, TableTools } from '@root/common/TableTools';
import { thresholdSettingTypeOptions } from '@root/consts';
import { normalizeOptions } from '@root/helpers';
import { useBusinessContext, useStores, useUserContext } from '@root/hooks';
import { Units } from '@root/i18n/config/units';
import { useIntl } from '@root/i18n/useIntl';
import { RatesEntityType } from '@root/modules/pricing/const';
import { ThresholdSettingsType, ThresholdUnitLabelType } from '@root/types';

import {
  FormSkeleton,
  InputOperations,
  MaterialNavItem,
  MaterialNotLinked,
} from '../../../../components';
import { calculateFinalPrice, calculatePercentage, toFixed } from '../../../../GeneralRate/helpers';

import styles from '../../../../css/styles.scss';
import {
  equipmentItemsLoadingNavigationConfig,
  materialsLoadingNavigationConfig,
} from './navigationConfigs';
import { type IThresholdCustomRateFormikData, type IThresholdForm } from './types';

const ThresholdForm: React.FC<IThresholdForm> = ({
  currentMaterialNavigation,
  currentEquipmentItemNavigation,
  currentThresholdOption,
  currentThresholdSetting,
  onEquipmentItemChange,
  onMaterialChange,
  onThresholdChange,
  onThresholdSettingChange,
  onShowRatesHistory,
  viewMode = false,
}) => {
  const {
    businessLineStore,
    generalRateStoreNew,
    equipmentItemStore,
    materialStore,
    thresholdStore,
    priceGroupStoreNew,
    customRateStoreNew,
  } = useStores();

  const { businessLineId, businessUnitId } = useBusinessContext();

  const isRecyclingLoB = businessLineStore.isRecyclingType(businessLineId);

  const { currencySymbol, formatCurrency } = useIntl();

  const formik = useFormikContext<IThresholdCustomRateFormikData>();

  const { currentUser } = useUserContext();

  const tonLabel = currentUser?.company?.unit === Units.metric ? 'tonne' : 'ton';
  const thresholdUnitOptions: ThresholdUnitLabelType[] = [
    tonLabel,
    'day',
    'min',
    tonLabel,
    tonLabel,
  ];

  const selectedPriceGroup = priceGroupStoreNew.selectedEntity;

  const equipmentItemsNavigation: NavigationConfigItem<string>[] =
    equipmentItemStore.sortedValues.map((equipmentItem, index) => ({
      label: equipmentItem.shortDescription,
      key: equipmentItem.id.toString(),
      index,
    }));

  const thresholdOptions: ISelectOption[] = thresholdStore.sortedValues.map(threshold => ({
    label: startCase(threshold.description),
    value: threshold.id,
  }));

  const currentThreshold = thresholdStore.sortedValues.find(
    threshold => threshold.id === currentThresholdOption,
  );

  const materialsNavigation: NavigationConfigItem[] = materialStore.sortedValues
    .filter(material => {
      if (isRecyclingLoB && currentThreshold) {
        return (
          (material.useForDump && currentThreshold.type === 'dump') ||
          (material.useForLoad && currentThreshold.type === 'load')
        );
      }

      return true;
    })
    .map((material, index) => ({
      label: <MaterialNavItem text={material.description} active={material.active} />,
      key: material.id.toString(),
      index,
    }));

  useEffect(() => {
    if (selectedPriceGroup) {
      generalRateStoreNew.request({
        businessLineId,
        businessUnitId,
        entityType: RatesEntityType.threshold,
      });
      customRateStoreNew.request({
        businessLineId,
        businessUnitId,
        id: selectedPriceGroup.id,
        entityType: RatesEntityType.threshold,
      });
    }
  }, [businessLineId, businessUnitId, customRateStoreNew, generalRateStoreNew, selectedPriceGroup]);

  useEffect(() => {
    const thresholds = thresholdStore.sortedValues;

    if (currentThresholdSetting === 'global') {
      onEquipmentItemChange();
      onMaterialChange();
    }
    if (
      !currentEquipmentItemNavigation &&
      (currentThresholdSetting === 'canSize' || currentThresholdSetting === 'canSizeAndMaterial') &&
      !equipmentItemStore.loading &&
      equipmentItemsNavigation.length
    ) {
      onEquipmentItemChange(equipmentItemsNavigation[0]);
    }

    if (
      !currentMaterialNavigation &&
      (currentThresholdSetting === 'material' ||
        currentThresholdSetting === 'canSizeAndMaterial') &&
      !materialStore.loading &&
      materialsNavigation.length
    ) {
      onMaterialChange(materialsNavigation[0]);
    }

    if (!currentThresholdOption && !thresholdStore.loading && thresholdOptions.length) {
      onThresholdChange(thresholds[0].id);
      onThresholdSettingChange(
        selectedPriceGroup?.thresholdSetting(thresholds[0].type) as ThresholdSettingsType,
      );
    }
  }, [
    equipmentItemStore.loading,
    equipmentItemsNavigation,
    currentEquipmentItemNavigation,
    currentMaterialNavigation,
    currentThresholdOption,
    currentThresholdSetting,
    materialStore.loading,
    materialsNavigation,
    onEquipmentItemChange,
    onMaterialChange,
    onThresholdChange,
    onThresholdSettingChange,
    selectedPriceGroup,
    thresholdOptions,
    thresholdStore.loading,
    thresholdStore.sortedValues,
  ]);

  useEffect(() => {
    if (
      currentThresholdOption &&
      selectedPriceGroup &&
      (currentThresholdSetting === 'global' ||
        (currentThresholdSetting === 'canSize' && currentEquipmentItemNavigation) ||
        (currentThresholdSetting === 'material' && currentMaterialNavigation) ||
        (currentThresholdSetting === 'canSizeAndMaterial' &&
          currentMaterialNavigation &&
          currentEquipmentItemNavigation))
    ) {
      let materialId = currentMaterialNavigation?.key ? +currentMaterialNavigation.key : undefined;
      let equipmentItemId = currentEquipmentItemNavigation
        ? +currentEquipmentItemNavigation.key
        : undefined;

      if (Number.isNaN(materialId)) {
        materialId = undefined;
      }

      if (Number.isNaN(equipmentItemId)) {
        equipmentItemId = undefined;
      }

      generalRateStoreNew.filterThresholdRatesByParameters({
        thresholdId: currentThresholdOption,
        materialId,
        equipmentItemId,
      });
      customRateStoreNew.filterThresholdRatesByParameters({
        thresholdId: currentThresholdOption,
        materialId,
        equipmentItemId,
      });
    }
  }, [
    currentThresholdSetting,
    currentEquipmentItemNavigation,
    currentMaterialNavigation,
    currentThresholdOption,
    generalRateStoreNew,
    customRateStoreNew,
    selectedPriceGroup,
    customRateStoreNew.isPreconditionFailed,
    businessUnitId,
    businessLineId,
  ]);

  const handleThresholdChange = (_: string, value?: SelectValue) => {
    onThresholdChange(value ? +value : undefined);
  };

  const handleThresholdSettingChange = (_: string, value?: SelectValue) => {
    onThresholdSettingChange(value as ThresholdSettingsType);
  };

  const { values, errors, handleChange, setFieldValue, setFieldTouched, handleBlur } = formik;

  const handleValueChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, index: number) => {
      const { value } = e.target;
      const price = values.threshold[index].price ?? 0;
      let operation = values.threshold[index].operation;

      const threshold = { ...values.threshold[index] };

      if (price > 0) {
        operation = operation ?? true;

        threshold.value = value;
        threshold.operation = operation;

        const finalPrice = calculateFinalPrice(operation, +value, +price);

        threshold.displayValue = value;
        threshold.finalPrice = finalPrice;
      }

      setFieldValue(`threshold[${index}]`, threshold);
    },
    [setFieldValue, values],
  );

  const handleFinalPriceChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, index: number) => {
      const { value } = e.target;
      const price = values.threshold[index].price ?? 0;

      const threshold = { ...values.threshold[index] };

      if (price > 0) {
        threshold.finalPrice = value;

        if (values.threshold[index].operation === undefined) {
          threshold.operation = true;
        }
        const percentage = calculatePercentage(price, +value);

        threshold.value = percentage;
        if (percentage) {
          threshold.displayValue = toFixed(+percentage, 3);
          threshold.operation = +value > price;
        } else {
          threshold.displayValue = undefined;
          threshold.operation = undefined;
        }
      }

      setFieldValue(`threshold[${index}]`, threshold);
      setFieldTouched(`threshold[${index}].value`, true);
    },
    [setFieldValue, values, setFieldTouched],
  );

  const handleOperationChange = useCallback(
    (operation: boolean, index: number) => {
      if (!viewMode) {
        const baseFieldName = `threshold[${index}]`;
        const price = values.threshold[index].price ?? 0;

        if (price > 0) {
          setFieldValue(`${baseFieldName}.operation`, operation);
          const value = values.threshold[index].value ?? 0;

          const finalPrice = calculateFinalPrice(operation, +value, +price);

          if (validator.isNumeric(finalPrice)) {
            setFieldValue(`${baseFieldName}.finalPrice`, finalPrice);
          }
          setFieldTouched(`${baseFieldName}.value`, true);
        }
      }
    },
    [viewMode, values.threshold, setFieldValue, setFieldTouched],
  );

  const handleShowHistory = useCallback(
    (entityType: RatesEntityType) => {
      if (selectedPriceGroup) {
        const ratesHistoryParams = {
          businessUnitId,
          businessLineId,
          entityType,
          thresholdId:
            entityType === RatesEntityType.threshold ? currentThresholdOption : undefined,
          customRatesGroupId: selectedPriceGroup.id,
          materialId:
            currentMaterialNavigation?.key && entityType === RatesEntityType.threshold
              ? Number.parseInt(currentMaterialNavigation.key, 10)
              : undefined,
          equipmentItemId:
            currentEquipmentItemNavigation && entityType === RatesEntityType.threshold
              ? Number.parseInt(currentEquipmentItemNavigation.key, 10)
              : undefined,
        };

        const currentMaterial = currentMaterialNavigation?.label as React.ReactElement;
        const equipmentLabel =
          entityType === RatesEntityType.threshold
            ? currentEquipmentItemNavigation?.label
            : undefined;
        const materialLabel =
          entityType === RatesEntityType.threshold ? currentMaterial?.props?.text : undefined;
        const settingLabel =
          entityType === RatesEntityType.threshold ? startCase(currentThresholdSetting) : undefined;
        const thresholdLabel = thresholdStore.sortedValues.find(
          ({ id }) => id === currentThresholdOption,
        )?.description;
        const subTitle = [thresholdLabel, equipmentLabel, materialLabel, settingLabel]
          .filter(label => label !== undefined)
          .join(' • ');

        onShowRatesHistory(ratesHistoryParams, subTitle);
      }
    },
    [
      selectedPriceGroup,
      currentThresholdOption,
      currentMaterialNavigation,
      currentEquipmentItemNavigation,
      businessLineId,
      businessUnitId,
      currentThresholdSetting,
      onShowRatesHistory,
      thresholdStore.sortedValues,
    ],
  );

  const isMaterialLinked = useMemo(() => {
    if (currentMaterialNavigation?.key && currentEquipmentItemNavigation) {
      const material = materialStore.getById(+currentMaterialNavigation.key);

      return material?.equipmentItemIds?.some(
        equipmentItemId => equipmentItemId === +currentEquipmentItemNavigation.key,
      );
    }

    return false;
  }, [currentMaterialNavigation, currentEquipmentItemNavigation, materialStore]);

  const isContentVisible = useMemo(() => {
    switch (currentThresholdSetting) {
      case 'global':
        return true;
      case 'material':
        return !!currentMaterialNavigation;
      case 'canSize':
        return !!currentEquipmentItemNavigation;
      case 'canSizeAndMaterial':
        return !!(currentEquipmentItemNavigation && currentMaterialNavigation);
      default:
        return null;
    }
  }, [currentThresholdSetting, currentEquipmentItemNavigation, currentMaterialNavigation]);

  const inputDisabled = (index: number) => viewMode || !values.threshold[index].price;
  const thresholdSettingLabel = (
    <Layouts.Flex className={styles.historyLabel}>
      Threshold Settings
      <Protected permissions="configuration/price-groups:view-history:perform">
        <HistoryIcon
          className={styles.rateHistoryIcon}
          onClick={() => handleShowHistory(RatesEntityType.threshold)}
        />
      </Protected>
    </Layouts.Flex>
  );

  return (
    <>
      <div className={styles.customerColumnNavigation}>
        <Layouts.Padding left="2" right="2">
          <Select
            label="Select Threshold"
            name="threshold"
            options={thresholdOptions}
            value={currentThresholdOption}
            onSelectChange={handleThresholdChange}
            nonClearable
          />

          <Select
            label={thresholdSettingLabel}
            name="thresholdSetting"
            options={normalizeOptions(thresholdSettingTypeOptions)}
            value={currentThresholdSetting}
            onSelectChange={handleThresholdSettingChange}
            disabled={isRecyclingLoB}
            nonClearable
          />

          {currentThresholdSetting === 'material' ||
          currentThresholdSetting === 'canSizeAndMaterial' ? (
            <Navigation
              activeTab={currentMaterialNavigation}
              configs={
                materialStore.loading ? materialsLoadingNavigationConfig : materialsNavigation
              }
              onChange={onMaterialChange}
              className={styles.thresholdMaterials}
              direction="column"
            />
          ) : null}
        </Layouts.Padding>
      </div>
      <Layouts.Flex direction="column" as={Layouts.Box} width="80%">
        {currentThresholdSetting === 'canSize' ||
        currentThresholdSetting === 'canSizeAndMaterial' ? (
          <Navigation
            activeTab={currentEquipmentItemNavigation}
            configs={
              equipmentItemStore.loading
                ? equipmentItemsLoadingNavigationConfig
                : equipmentItemsNavigation
            }
            onChange={onEquipmentItemChange}
            className={styles.equipmentItemsNavigation}
            withEmpty
            carousel
          />
        ) : null}
        {isContentVisible ? (
          <Layouts.Padding top="1" right="0.5" bottom="0" left="2">
            {customRateStoreNew.loading ? (
              <FormSkeleton />
            ) : (
              <>
                {currentThresholdSetting === 'canSizeAndMaterial' && !isMaterialLinked ? (
                  <MaterialNotLinked businessLineId={businessLineId} />
                ) : (
                  <Table>
                    <thead>
                      <TableRow className={styles.thresholdGrid}>
                        <TableTools.HeaderCell>
                          {startCase(currentThreshold?.description)}
                          <Protected permissions="configuration/price-groups:view-history:perform">
                            <HistoryIcon
                              className={styles.rateHistoryIcon}
                              onClick={() => handleShowHistory(RatesEntityType.threshold)}
                            />
                          </Protected>
                        </TableTools.HeaderCell>
                        <TableTools.HeaderCell right>
                          General Rack Rates, {currencySymbol}
                        </TableTools.HeaderCell>
                        <TableTools.HeaderCell right>Value, %</TableTools.HeaderCell>
                        <TableTools.HeaderCell right>
                          Group Value, {currencySymbol}
                        </TableTools.HeaderCell>
                      </TableRow>
                    </thead>
                    <tbody>
                      {values.threshold
                        ?.filter(threshold => threshold.thresholdId === currentThresholdOption)
                        ?.map((threshold, index) => {
                          return (
                            <Fragment key={threshold.thresholdId}>
                              <TableRow className={styles.thresholdGrid}>
                                <TableCell>{isRecyclingLoB ? 'Minimal Weight' : 'Limit'}</TableCell>
                                <TableCell center>
                                  {currentThresholdOption ? (
                                    <Layouts.Margin right="1">
                                      {startCase(thresholdUnitOptions[currentThresholdOption - 1])}
                                    </Layouts.Margin>
                                  ) : null}
                                  {threshold.globalLimit}
                                </TableCell>
                                <TableCell fallback="" />
                                <TableCell titleClassName={styles.tableCell} right>
                                  <Layouts.Flex alignItems="center">
                                    {currentThresholdOption ? (
                                      <Layouts.Margin right="1">
                                        {startCase(
                                          thresholdUnitOptions[currentThresholdOption - 1],
                                        )}
                                      </Layouts.Margin>
                                    ) : null}
                                    <FormInput
                                      type="number"
                                      name={`threshold[${index}].limit`}
                                      ariaLabel="Limit"
                                      key="limit"
                                      className={styles.input}
                                      value={values.threshold[index].limit}
                                      disabled={inputDisabled(index)}
                                      onChange={handleChange}
                                      onBlur={handleBlur}
                                      error={getIn(errors.threshold, `[${index}].limit`)}
                                      noError={!getIn(errors.threshold, `[${index}].limit`)}
                                    />
                                  </Layouts.Flex>
                                </TableCell>
                              </TableRow>

                              <TableRow className={styles.thresholdGrid}>
                                <TableCell titleClassName={styles.tableCell}>Price Rate</TableCell>
                                <TableCell right>
                                  {formatCurrency(threshold.price ?? undefined)}
                                </TableCell>
                                <TableCell titleClassName={styles.tableCell} right>
                                  <Layouts.Flex alignItems="center">
                                    <InputOperations
                                      onDecrement={() => handleOperationChange(false, index)}
                                      onIncrement={() => handleOperationChange(true, index)}
                                      disabled={viewMode}
                                      active={threshold.operation}
                                    />
                                    <FormInput
                                      type="number"
                                      name={`threshold[${index}].value`}
                                      key="value"
                                      ariaLabel="Value in percents"
                                      value={values.threshold[index].displayValue}
                                      disabled={inputDisabled(index)}
                                      className={styles.input}
                                      onChange={e => handleValueChange(e, index)}
                                      onBlur={handleBlur}
                                      error={getIn(errors.threshold, `[${index}].value`)}
                                      noError={!getIn(errors.threshold, `[${index}].value`)}
                                    />
                                  </Layouts.Flex>
                                </TableCell>
                                <TableCell titleClassName={styles.tableCell} right>
                                  <Layouts.Flex alignItems="center">
                                    <FormInput
                                      name={`threshold[${index}].finalPrice`}
                                      type="number"
                                      ariaLabel="Final price"
                                      key="finalPrice"
                                      value={values.threshold[index].finalPrice}
                                      disabled={inputDisabled(index)}
                                      className={styles.input}
                                      onChange={e => handleFinalPriceChange(e, index)}
                                      error={getIn(errors.threshold, `[${index}].finalPrice`)}
                                      noError={!getIn(errors.threshold, `[${index}].finalPrice`)}
                                    />
                                  </Layouts.Flex>
                                </TableCell>
                              </TableRow>
                            </Fragment>
                          );
                        })}
                    </tbody>
                  </Table>
                )}
              </>
            )}
          </Layouts.Padding>
        ) : null}
      </Layouts.Flex>
    </>
  );
};

export default observer(ThresholdForm);
