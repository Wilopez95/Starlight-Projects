import React, { useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts, Navigation, NavigationConfigItem } from '@starlightpro/shared-components';
import cx from 'classnames';
import { getIn, useFormikContext } from 'formik';
import { observer } from 'mobx-react-lite';

import { HistoryIcon } from '@root/assets';
import { Badge, FormInput, Protected } from '@root/common';
import { Table } from '@root/common/TableTools';
import { useBusinessContext, useStores } from '@root/hooks';
import { RatesEntityType } from '@root/modules/pricing/const';

import { FormSkeleton, MaterialNavItem, MaterialNotLinked } from '../../../../components';

import styles from '../../../../css/styles.scss';
import {
  equipmentItemsLoadingNavigationConfig,
  materialsLoadingNavigationConfig,
} from './navigationConfigs';
import { type IServiceForm, type IServiceGeneralRateFormikData } from './types';

const I18N_PATH = 'modules.pricing.GeneralRate.components.forms.Text.';

const ServiceForm: React.FC<IServiceForm> = ({
  onMaterialChange,
  onEquipmentItemChange,
  onShowRatesHistory,
  currentEquipmentItemNavigation,
  currentMaterialNavigation,
}) => {
  const { values, errors, handleChange, handleBlur } =
    useFormikContext<IServiceGeneralRateFormikData>();
  const {
    businessLineStore,
    generalRateStoreNew,
    billableServiceStore,
    equipmentItemStore,
    materialStore,
  } = useStores();
  const { businessLineId, businessUnitId } = useBusinessContext();
  const { t } = useTranslation();

  const isRecyclingLoB = businessLineStore.isRecyclingType(businessLineId);

  const materialsNavigation: NavigationConfigItem<string | null>[] = useMemo(
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
    .filter(equipmentItem => +equipmentItem.businessLineId === +businessLineId)
    .filter(equipmentItem => (isRecyclingLoB ? !!equipmentItem.recyclingDefault : true))
    .map((equipmentItem, index) => ({
      label: equipmentItem.shortDescription,
      key: equipmentItem.id.toString(),
      index,
    }));

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
    (async () => {
      await generalRateStoreNew.request({
        businessUnitId,
        businessLineId,
        entityType: RatesEntityType.oneTimeService,
      });

      if (currentEquipmentItemNavigation && currentMaterialNavigation) {
        generalRateStoreNew.filterOneTimeServiceRatesByParameters({
          materialId: currentMaterialNavigation.key
            ? Number.parseInt(currentMaterialNavigation.key, 10)
            : null,
          equipmentItemId: Number.parseInt(currentEquipmentItemNavigation.key, 10),
        });
      }
    })();
  }, [
    currentEquipmentItemNavigation,
    currentMaterialNavigation,
    generalRateStoreNew,
    businessLineId,
    businessUnitId,
  ]);

  const isMaterialLinked = useMemo(() => {
    if (
      currentMaterialNavigation &&
      currentEquipmentItemNavigation &&
      currentMaterialNavigation.key !== null
    ) {
      const material = materialStore.getById(+currentMaterialNavigation.key);

      return material?.equipmentItemIds?.some(
        equipmentItemId => equipmentItemId === +currentEquipmentItemNavigation.key,
      );
    }

    return false;
  }, [currentEquipmentItemNavigation, currentMaterialNavigation, materialStore]);

  const handleShowHistory = useCallback(
    (billableServiceId: number, serviceDescription = '') => {
      if (currentEquipmentItemNavigation && currentMaterialNavigation) {
        const ratesHistoryParams = {
          businessUnitId,
          businessLineId,
          billableServiceId,
          materialId: currentMaterialNavigation.key
            ? Number.parseInt(currentMaterialNavigation.key, 10)
            : null,
          equipmentItemId: Number.parseInt(currentEquipmentItemNavigation.key, 10),
          entityType: RatesEntityType.oneTimeService,
        };
        const materialLabel = currentMaterialNavigation.key
          ? materialStore.getById(+currentMaterialNavigation.key)?.description
          : t('Form.NoneMaterial');

        onShowRatesHistory(ratesHistoryParams, [serviceDescription, materialLabel].join(' • '));
      }
    },
    [
      currentEquipmentItemNavigation,
      currentMaterialNavigation,
      businessUnitId,
      businessLineId,
      materialStore,
      t,
      onShowRatesHistory,
    ],
  );

  return (
    <Layouts.Grid
      as={Layouts.Box}
      columns="320px auto"
      height="100%"
      minHeight="100%"
      backgroundColor="white"
    >
      <Layouts.Scroll>
        <Navigation
          activeTab={currentMaterialNavigation}
          configs={
            materialStore.loading || equipmentItemStore.loading
              ? materialsLoadingNavigationConfig
              : materialsNavigation
          }
          onChange={onMaterialChange}
          className={styles.materialsNavigation}
          direction="column"
        />
      </Layouts.Scroll>
      <Layouts.Scroll>
        <div className={styles.form}>
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
            <div className={styles.wrapper}>
              {generalRateStoreNew.loading ? (
                <FormSkeleton />
              ) : (
                <>
                  {currentMaterialNavigation?.key !== null && !isMaterialLinked ? (
                    <MaterialNotLinked businessLineId={businessLineId} />
                  ) : (
                    <Table>
                      <thead>
                        <tr>
                          <th className={cx(styles.title, styles.left)}>
                            {t(`${I18N_PATH}Services`)}
                          </th>
                          <th className={cx(styles.title, styles.right)}>
                            {t(`${I18N_PATH}GeneralRackRates`)}, $
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {values.oneTimeService?.map((service, index) => {
                          const billableService = billableServiceStore.getById(
                            service.billableServiceId,
                          );

                          const inputPath = `oneTimeService[${index}].price`;

                          return (
                            <tr key={service.billableServiceId} className={styles.historyLabel}>
                              <td className={cx(styles.cell, styles.large, styles.label)}>
                                <Layouts.Flex alignItems="center">
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
                              </td>
                              <td className={styles.cell}>
                                <div className={styles.inputWrapper}>
                                  <FormInput
                                    name={inputPath}
                                    type="number"
                                    ariaLabel="Price"
                                    key="price"
                                    value={values.oneTimeService[index].price}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={getIn(errors, inputPath)}
                                    wrapClassName={styles.input}
                                  />
                                </div>
                              </td>
                            </tr>
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

export default observer(ServiceForm);
