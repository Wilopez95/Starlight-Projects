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
import { RatesEntityType, ThresholdSettingsType } from '@root/types';

import {
  FormSkeleton,
  InputOperations,
  MaterialNavItem,
  MaterialNotLinked,
} from '../../components';
import { calculateFinalPrice, calculatePercentage, toFixed } from '../../helpers';

import styles from '../../css/styles.scss';
import {
  equipmentItemsLoadingNavigationConfig,
  materialsLoadingNavigationConfig,
} from './navigationConfigs';
import { type IPriceGroupRateThresholdFormikData, type IThresholdForm } from './types';

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
    globalRateStore,
    equipmentItemStore,
    materialStore,
    thresholdStore,
    priceGroupStore,
  } = useStores();

  const { businessLineId, businessUnitId } = useBusinessContext();

  const isRecyclingLoB = businessLineStore.isRecyclingType(businessLineId);

  const { currencySymbol, formatCurrency } = useIntl();

  const formik = useFormikContext<IPriceGroupRateThresholdFormikData>();

  const { currentUser } = useUserContext();

  const tonLabel = currentUser?.company?.unit === Units.metric ? 'tonne' : 'ton';

  const selectedPriceGroup = priceGroupStore.selectedEntity;

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

  const thresholdUnitLabel = useMemo(() => {
    if (currentThreshold) {
      if (currentThreshold?.type === 'demurrage') {
        return 'min';
      } else if (currentThreshold?.type === 'usageDays') {
        return 'day';
      }

      return tonLabel;
    }
  }, [currentThreshold, tonLabel]);

  const materialsNavigation: NavigationConfigItem<string>[] = materialStore.sortedValues
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
      onThresholdSettingChange(selectedPriceGroup?.thresholdSetting(thresholds[0].type));
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
      let materialId = currentMaterialNavigation ? +currentMaterialNavigation.key : undefined;
      let equipmentItemId = currentEquipmentItemNavigation
        ? +currentEquipmentItemNavigation.key
        : undefined;

      if (Number.isNaN(materialId)) {
        materialId = undefined;
      }

      if (Number.isNaN(equipmentItemId)) {
        equipmentItemId = undefined;
      }

      globalRateStore.requestThresholds({
        businessUnitId,
        businessLineId,
        thresholdId: currentThresholdOption,
        materialId,
        equipmentItemId,
      });
      priceGroupStore.requestThresholds({
        businessUnitId,
        businessLineId,
        priceGroupId: selectedPriceGroup.id,
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
    globalRateStore,
    priceGroupStore,
    selectedPriceGroup,
    priceGroupStore.isPreconditionFailed,
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
      const price = values.thresholds[index].price ?? 0;
      let operation = values.thresholds[index].operation;

      const threshold = { ...values.thresholds[index] };

      if (price > 0) {
        operation = operation ?? true;

        threshold.value = value;
        threshold.operation = operation;

        const finalPrice = calculateFinalPrice(operation, +value, +price);

        threshold.displayValue = value;
        threshold.finalPrice = finalPrice;
      }

      setFieldValue(`thresholds[${index}]`, threshold);
    },
    [setFieldValue, values],
  );

  const handleFinalPriceChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, index: number) => {
      const { value } = e.target;
      const price = values.thresholds[index].price ?? 0;

      const threshold = { ...values.thresholds[index] };

      if (price > 0) {
        threshold.finalPrice = value;

        if (values.thresholds[index].operation === undefined) {
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

      setFieldValue(`thresholds[${index}]`, threshold);
      setFieldTouched(`thresholds[${index}].value`, true);
    },
    [setFieldValue, values, setFieldTouched],
  );

  const handleOperationChange = useCallback(
    (operation: boolean, index: number) => {
      if (!viewMode) {
        const baseFieldName = `thresholds[${index}]`;
        const price = values.thresholds[index].price ?? 0;

        if (price > 0) {
          setFieldValue(`${baseFieldName}.operation`, operation);
          const value = values.thresholds[index].value ?? 0;

          const finalPrice = calculateFinalPrice(operation, +value, +price);

          if (validator.isNumeric(finalPrice)) {
            setFieldValue(`${baseFieldName}.finalPrice`, finalPrice);
          }
          setFieldTouched(`${baseFieldName}.value`, true);
        }
      }
    },
    [viewMode, values.thresholds, setFieldValue, setFieldTouched],
  );

  const handleShowHistory = useCallback(
    (entityType: RatesEntityType) => {
      if (selectedPriceGroup) {
        const ratesHistoryParams = {
          businessUnitId,
          businessLineId,
          entityType,
          thresholdId:
            entityType === RatesEntityType.customRatesThresholds
              ? currentThresholdOption
              : undefined,
          customRatesGroupId: selectedPriceGroup.id,
          materialId:
            currentMaterialNavigation && entityType === RatesEntityType.customRatesThresholds
              ? Number.parseInt(currentMaterialNavigation.key, 10)
              : undefined,
          equipmentItemId:
            currentEquipmentItemNavigation && entityType === RatesEntityType.customRatesThresholds
              ? Number.parseInt(currentEquipmentItemNavigation.key, 10)
              : undefined,
        };

        const currentMaterial = currentMaterialNavigation?.label as React.ReactElement;
        const equipmentLabel =
          entityType === RatesEntityType.customRatesThresholds
            ? currentEquipmentItemNavigation?.label
            : undefined;
        const materialLabel =
          entityType === RatesEntityType.customRatesThresholds
            ? currentMaterial?.props?.text
            : undefined;
        const settingLabel =
          entityType === RatesEntityType.customThresholdsSetting
            ? startCase(currentThresholdSetting)
            : undefined;
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
    if (currentMaterialNavigation && currentEquipmentItemNavigation) {
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

  const inputDisabled = (index: number) => viewMode || !values.thresholds[index].price;
  const thresholdSettingLabel = (
    <Layouts.Flex className={styles.historyLabel}>
      Threshold Settings
      <Protected permissions="configuration/price-groups:view-history:perform">
        <HistoryIcon
          className={styles.rateHistoryIcon}
          onClick={() => handleShowHistory(RatesEntityType.customThresholdsSetting)}
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
            {priceGroupStore.thresholdsLoading ? (
              <FormSkeleton />
            ) : (
              <>
                {currentThresholdSetting === 'canSizeAndMaterial' && !isMaterialLinked ? (
                  <MaterialNotLinked businessLineId={businessLineId} />
                ) : (
                  <Table>
                    <thead className={styles.historyLabel}>
                      <TableRow className={styles.thresholdGrid}>
                        <TableTools.HeaderCell
                          titleClassName={(styles.tableCell, styles.thresholdTitleCell)}
                        >
                          {startCase(currentThreshold?.description)}
                          <Protected permissions="configuration/price-groups:view-history:perform">
                            <HistoryIcon
                              className={styles.rateHistoryIcon}
                              onClick={() =>
                                handleShowHistory(RatesEntityType.customRatesThresholds)
                              }
                            />
                          </Protected>
                        </TableTools.HeaderCell>
                        <TableTools.HeaderCell right>
                          General Rack Rates, {currencySymbol}
                        </TableTools.HeaderCell>
                        <TableTools.HeaderCell titleClassName={styles.tableCell} right>
                          Value, %
                        </TableTools.HeaderCell>
                        <TableTools.HeaderCell titleClassName={styles.tableCell} right>
                          Group Value, {currencySymbol}
                        </TableTools.HeaderCell>
                      </TableRow>
                    </thead>
                    <tbody>
                      {values.thresholds
                        ?.filter(threshold => threshold.thresholdId === currentThresholdOption)
                        ?.map((threshold, index) => {
                          return (
                            <Fragment key={threshold.thresholdId}>
                              <TableRow className={styles.thresholdGrid}>
                                <TableCell>{isRecyclingLoB ? 'Minimal Weight' : 'Limit'}</TableCell>
                                <TableCell center>
                                  {currentThresholdOption ? (
                                    <Layouts.Margin right="1">
                                      {startCase(thresholdUnitLabel)}
                                    </Layouts.Margin>
                                  ) : null}
                                  {threshold.globalLimit}
                                </TableCell>
                                <TableCell fallback="" />
                                <TableCell titleClassName={styles.tableCell} right>
                                  <Layouts.Flex alignItems="center">
                                    {currentThresholdOption ? (
                                      <Layouts.Margin right="1">
                                        {startCase(thresholdUnitLabel)}
                                      </Layouts.Margin>
                                    ) : null}
                                    <FormInput
                                      type="number"
                                      name={`thresholds[${index}].limit`}
                                      ariaLabel="Limit"
                                      key="limit"
                                      className={styles.input}
                                      value={values.thresholds[index].limit}
                                      disabled={inputDisabled(index)}
                                      onChange={handleChange}
                                      onBlur={handleBlur}
                                      error={getIn(errors.thresholds, `[${index}].limit`)}
                                      noError={!getIn(errors.thresholds, `[${index}].limit`)}
                                    />
                                  </Layouts.Flex>
                                </TableCell>
                              </TableRow>

                              <TableRow className={styles.thresholdGrid}>
                                <TableCell>Price Rate</TableCell>
                                <TableCell center>{formatCurrency(threshold.price)}</TableCell>
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
                                      name={`thresholds[${index}].value`}
                                      key="value"
                                      ariaLabel="Value in percents"
                                      value={values.thresholds[index].displayValue}
                                      disabled={inputDisabled(index)}
                                      className={styles.input}
                                      onChange={e => handleValueChange(e, index)}
                                      onBlur={handleBlur}
                                      error={getIn(errors.thresholds, `[${index}].value`)}
                                      noError={!getIn(errors.thresholds, `[${index}].value`)}
                                    />
                                  </Layouts.Flex>
                                </TableCell>
                                <TableCell titleClassName={styles.tableCell} right>
                                  <Layouts.Flex alignItems="center">
                                    <FormInput
                                      name={`thresholds[${index}].finalPrice`}
                                      type="number"
                                      ariaLabel="Final price"
                                      key="finalPrice"
                                      value={values.thresholds[index].finalPrice}
                                      disabled={inputDisabled(index)}
                                      className={styles.input}
                                      onChange={e => handleFinalPriceChange(e, index)}
                                      error={getIn(errors.thresholds, `[${index}].finalPrice`)}
                                      noError={!getIn(errors.thresholds, `[${index}].finalPrice`)}
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
