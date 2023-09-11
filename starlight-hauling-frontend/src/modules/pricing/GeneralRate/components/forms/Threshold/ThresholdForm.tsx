import React, { Fragment, useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ISelectOption,
  Layouts,
  Navigation,
  NavigationConfigItem,
  Select,
} from '@starlightpro/shared-components';
import cx from 'classnames';
import { getIn, useFormikContext } from 'formik';
import { startCase } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { HistoryIcon } from '@root/assets';
import { FormInput, Protected } from '@root/common';
import { Table } from '@root/common/TableTools';
import { thresholdSettingTypeOptions } from '@root/consts';
import { normalizeOptions } from '@root/helpers';
import { useBusinessContext, useStores, useUserContext } from '@root/hooks';
import { Units } from '@root/i18n/config/units';
import { RatesEntityType } from '@root/modules/pricing/const';
import { ThresholdSettingsType, ThresholdUnitLabelType } from '@root/types';

import { FormSkeleton, MaterialNavItem, MaterialNotLinked } from '../../../../components';

import styles from '../../../../css/styles.scss';
import {
  equipmentItemsLoadingNavigationConfig,
  materialsLoadingNavigationConfig,
} from './navigationConfigs';
import { type IThresholdForm, type IThresholdGeneralRateFormikData } from './types';

const I18N_PATH = 'modules.pricing.GeneralRate.components.forms.Text.';

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
}) => {
  const { values, errors, handleChange, handleBlur } =
    useFormikContext<IThresholdGeneralRateFormikData>();
  const {
    businessLineStore,
    generalRateStoreNew,
    equipmentItemStore,
    materialStore,
    thresholdStore,
  } = useStores();

  const { businessUnitId, businessLineId } = useBusinessContext();
  const { t } = useTranslation();
  const { currentUser } = useUserContext();

  const tonLabel = currentUser?.company?.unit === Units.metric ? 'tonne' : 'ton';
  const thresholdUnitOptions: ThresholdUnitLabelType[] = [
    tonLabel,
    'day',
    'min',
    tonLabel,
    tonLabel,
  ];
  const isRecyclingLoB = businessLineStore.isRecyclingType(businessLineId);

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

  const equipmentItemsNavigation: NavigationConfigItem<string>[] =
    equipmentItemStore.sortedValues.map((equipmentItem, index) => ({
      label: equipmentItem.shortDescription,
      key: equipmentItem.id.toString(),
      index,
    }));

  const availableThresholds = thresholdStore.sortedValues.filter(
    threshold => !isRecyclingLoB || threshold.type === 'dump' || threshold.type === 'load',
  );

  const thresholdOptions: ISelectOption[] = availableThresholds.map(threshold => ({
    label: startCase(threshold.description),
    value: threshold.id,
  }));

  useEffect(() => {
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
      onThresholdChange(availableThresholds[0].id);
    }
  }, [
    isRecyclingLoB,
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
    thresholdOptions,
    thresholdStore.loading,
    availableThresholds,
  ]);

  useEffect(() => {
    (async () => {
      await generalRateStoreNew.request({
        businessUnitId,
        businessLineId,
        entityType: RatesEntityType.threshold,
      });

      if (
        currentThresholdOption &&
        (currentThresholdSetting === 'global' ||
          (currentThresholdSetting === 'canSize' && currentEquipmentItemNavigation) ||
          (currentThresholdSetting === 'material' && currentMaterialNavigation) ||
          (currentThresholdSetting === 'canSizeAndMaterial' &&
            currentMaterialNavigation &&
            currentEquipmentItemNavigation))
      ) {
        generalRateStoreNew.filterThresholdRatesByParameters({
          thresholdId: currentThresholdOption,
          materialId: currentMaterialNavigation?.key
            ? Number.parseInt(currentMaterialNavigation.key, 10)
            : null,
          equipmentItemId: currentEquipmentItemNavigation
            ? Number.parseInt(currentEquipmentItemNavigation.key, 10)
            : undefined,
        });
      }
    })();
  }, [
    currentEquipmentItemNavigation,
    currentMaterialNavigation,
    currentThresholdOption,
    currentThresholdSetting,
    generalRateStoreNew,
    businessUnitId,
    businessLineId,
  ]);

  const handleThresholdChange = (_: string, value: number) => {
    onThresholdChange(value);
  };

  const handleThresholdSettingChange = (_: string, value: ThresholdSettingsType) => {
    onThresholdSettingChange(value);
  };

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

  const handleShowHistory = useCallback(
    (entityType: RatesEntityType) => {
      const ratesHistoryParams = {
        businessUnitId,
        businessLineId,
        entityType,
        thresholdId: currentThresholdOption,
        materialId:
          currentMaterialNavigation?.key && entityType === RatesEntityType.threshold
            ? Number.parseInt(currentMaterialNavigation.key, 10)
            : null,
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
    },
    [
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
    <Layouts.Grid
      as={Layouts.Box}
      columns="320px auto"
      height="100%"
      minHeight="100%"
      backgroundColor="white"
    >
      <Layouts.Scroll className={styles.columnNavigation}>
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
            nonClearable
            disabled={isRecyclingLoB}
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
      </Layouts.Scroll>
      <Layouts.Scroll>
        <div className={styles.form}>
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
              carousel
            />
          ) : null}

          {isContentVisible ? (
            <div className={styles.wrapper}>
              {generalRateStoreNew.loading ? (
                <FormSkeleton />
              ) : (
                <>
                  {currentThresholdSetting === 'canSizeAndMaterial' && !isMaterialLinked ? (
                    <MaterialNotLinked businessLineId={businessLineId} />
                  ) : (
                    <Table>
                      <thead>
                        <tr className={styles.historyLabel}>
                          <th className={styles.title}>
                            <Layouts.Flex alignItems="center">
                              {currentThreshold?.description}
                              <Protected permissions="configuration/price-groups:view-history:perform">
                                <HistoryIcon
                                  className={styles.rateHistoryIcon}
                                  onClick={() => handleShowHistory(RatesEntityType.threshold)}
                                />
                              </Protected>
                            </Layouts.Flex>
                          </th>
                          <th className={cx(styles.title, styles.right)}>{t('Text.Units')}</th>
                          <th className={cx(styles.title, styles.right)}>{t('Text.Value')}, $</th>
                        </tr>
                      </thead>
                      <tbody>
                        {values.threshold
                          ?.filter(threshold => threshold.thresholdId === currentThresholdOption)
                          ?.map((threshold, index) => {
                            const limitInputPath = `threshold[${index}].limit`;

                            const priceInputPath = `threshold[${index}].price`;

                            return (
                              <Fragment key={threshold.thresholdId}>
                                <tr>
                                  <td className={cx(styles.cell, styles.label)}>
                                    {t(`${I18N_PATH}${isRecyclingLoB ? 'MinimalWeight' : 'Limit'}`)}
                                    *
                                  </td>
                                  <td className={cx(styles.cell, styles.label)}>
                                    {currentThresholdOption
                                      ? startCase(thresholdUnitOptions[currentThresholdOption - 1])
                                      : null}
                                  </td>
                                  <td className={cx(styles.cell, styles.midSize)}>
                                    <div className={styles.inputWrapper}>
                                      <FormInput
                                        type="number"
                                        name={limitInputPath}
                                        ariaLabel="Limit"
                                        key="limit"
                                        value={values.threshold[index].limit}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={getIn(errors, limitInputPath)}
                                        wrapClassName={styles.input}
                                      />
                                    </div>
                                  </td>
                                </tr>
                                <tr>
                                  <td className={cx(styles.cell, styles.label)}>
                                    {t(`${I18N_PATH}PriceRate`)}
                                  </td>
                                  <td className={cx(styles.cell, styles.label, styles.right)} />
                                  <td className={cx(styles.cell, styles.midSize)}>
                                    <div className={styles.inputWrapper}>
                                      <FormInput
                                        name={priceInputPath}
                                        type="number"
                                        ariaLabel="Price"
                                        key="price"
                                        value={values.threshold[index].price}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={getIn(errors, priceInputPath)}
                                        wrapClassName={styles.input}
                                      />
                                    </div>
                                  </td>
                                </tr>
                              </Fragment>
                            );
                          })}
                      </tbody>
                    </Table>
                  )}
                </>
              )}
            </div>
          ) : null}
        </div>
      </Layouts.Scroll>
    </Layouts.Grid>
  );
};

export default observer(ThresholdForm);
