import React, { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts, Navigation, NavigationConfigItem } from '@starlightpro/shared-components';
import { useFormikContext } from 'formik';
import { intersectionWith, noop } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { Badge, FormInput, Typography } from '@root/common';
import { Table } from '@root/common/TableTools';
import { FormSkeleton, MaterialNavItem } from '@root/components/forms/Rates/components';
import { NONE_MATERIAL_KEY } from '@root/consts';
import { useBusinessContext, useStores } from '@root/hooks';

import { IBulkRatesData } from '../../types';
import { OperationButton } from '../styles';

import styles from '../../css/styles.scss';
import {
  equipmentItemsLoadingNavigationConfig,
  materialsLoadingNavigationConfig,
} from './navigationConfigs';
import { type IServiceForm } from './types';

const I18N_PATH = 'pages.SystemConfiguration.tables.PriceGroups.QuickView.BulkRatesEdit.forms.';

const ServiceForm: React.FC<IServiceForm> = ({
  onMaterialChange,
  onEquipmentItemChange,
  currentEquipmentItemNavigation,
  currentMaterialNavigation,
  equipments: propsEquipments = [],
  materials: propsMaterials = [],
  services: propsServices = [],
}) => {
  const {
    globalRateStore,
    billableServiceStore,
    equipmentItemStore,
    materialStore,
    priceGroupStore,
  } = useStores();

  const { t } = useTranslation();
  const { values } = useFormikContext<IBulkRatesData>();
  const { businessLineId, businessUnitId } = useBusinessContext();

  const selectedPriceGroup = priceGroupStore.selectedEntity;

  const servicesValues = useMemo(
    () =>
      propsServices.length > 0
        ? intersectionWith(
            values.preview.services,
            propsServices,
            (_services, _propsServices) => _services.billableServiceId === _propsServices.id,
          )
        : values.preview.services,
    [propsServices, values.preview.services],
  );

  const sortedMaterials = useMemo(
    () =>
      intersectionWith(
        materialStore.sortedValues,
        propsMaterials,
        (_materials, _propsMaterials) => _materials.id === _propsMaterials?.id,
      ),
    [materialStore.sortedValues, propsMaterials],
  );

  const materialsNavigation: NavigationConfigItem<string>[] = useMemo(() => {
    const noneMaterial = { label: 'None Material', key: NONE_MATERIAL_KEY, index: 0 };
    const containsNonMaterial = values.edit.materials?.includes('INCLUDE_NONE_MATERIAL');
    const materials = [
      ...sortedMaterials.map((material, index) => ({
        label: <MaterialNavItem text={material.description} active={material.active} />,
        key: material.id?.toString() ?? '',
        index: index + 1,
      })),
    ];

    return containsNonMaterial ? [noneMaterial, ...materials] : materials;
  }, [sortedMaterials, values.edit.materials]);

  const sortedEquipmentItems = useMemo(
    () =>
      propsEquipments.length > 0
        ? intersectionWith(
            equipmentItemStore.sortedValues,
            propsEquipments,
            (_equipments, _propsEquipments) => _equipments.id === _propsEquipments.id,
          )
        : equipmentItemStore.sortedValues,
    [equipmentItemStore.sortedValues, propsEquipments],
  );

  const equipmentItemsNavigation: NavigationConfigItem<string>[] = useMemo(
    () =>
      sortedEquipmentItems.map((equipmentItem, index) => ({
        label: equipmentItem.shortDescription,
        key: equipmentItem.id?.toString() ?? '',
        index,
      })),
    [sortedEquipmentItems],
  );

  useEffect(() => {
    if (
      !currentEquipmentItemNavigation &&
      !equipmentItemStore.loading &&
      equipmentItemsNavigation.length
    ) {
      onEquipmentItemChange?.(equipmentItemsNavigation[0]);
    }

    if (!currentMaterialNavigation && !materialStore.loading && materialsNavigation.length) {
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
      globalRateStore.requestServices({
        businessUnitId,
        businessLineId,
        materialId:
          currentMaterialNavigation.key === NONE_MATERIAL_KEY
            ? null
            : Number.parseInt(currentMaterialNavigation.key, 10),
        equipmentItemId: Number.parseInt(currentEquipmentItemNavigation.key, 10),
      });
      priceGroupStore.requestServices({
        businessUnitId,
        businessLineId,
        priceGroupId: selectedPriceGroup.id,
        materialId:
          currentMaterialNavigation.key === NONE_MATERIAL_KEY
            ? null
            : Number.parseInt(currentMaterialNavigation.key, 10),
        equipmentItemId: Number.parseInt(currentEquipmentItemNavigation.key, 10),
      });
    }
  }, [
    currentEquipmentItemNavigation,
    currentMaterialNavigation,
    globalRateStore,
    priceGroupStore,
    selectedPriceGroup,
    priceGroupStore.isPreconditionFailed,
    businessUnitId,
    businessLineId,
  ]);

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
        className={styles.materialsNavigation}
        direction="column"
      />
      <Layouts.Box width="100%">
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
          <Layouts.Box width="100%">
            <Layouts.Padding padding="3" right="0.5" bottom="0">
              {priceGroupStore.servicesLoading ? (
                <FormSkeleton />
              ) : (
                <Table>
                  <thead>
                    <tr className={styles.tableGrid}>
                      <th>
                        <Layouts.Padding bottom="3">
                          <Typography
                            color="secondary"
                            shade="desaturated"
                            variant="caption"
                            textTransform="uppercase"
                          >
                            {t('Text.Services')}
                          </Typography>
                        </Layouts.Padding>
                      </th>
                      <th>
                        <Layouts.Padding bottom="3">
                          <Typography
                            color="secondary"
                            shade="desaturated"
                            variant="caption"
                            textTransform="uppercase"
                            textAlign="right"
                          >
                            {values.edit.source === 'current'
                              ? t(`${I18N_PATH}CurrentPriceGroupRates`)
                              : t(`${I18N_PATH}GeneralRates`)}
                            , $
                          </Typography>
                        </Layouts.Padding>
                      </th>
                      <th>
                        <Layouts.Padding bottom="3">
                          <Typography
                            color="secondary"
                            shade="desaturated"
                            variant="caption"
                            textTransform="uppercase"
                            textAlign="right"
                          >
                            {t('Text.Value')}, {values.edit.calculation === 'flat' ? '$' : '%'}
                          </Typography>
                        </Layouts.Padding>
                      </th>
                      <th>
                        <Layouts.Padding bottom="3">
                          <Typography
                            color="secondary"
                            shade="desaturated"
                            variant="caption"
                            textTransform="uppercase"
                            textAlign="right"
                          >
                            {t('Text.FinalPrice')}, $
                          </Typography>
                        </Layouts.Padding>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {servicesValues.map(service => {
                      const billableService = billableServiceStore.getById(
                        service.billableServiceId,
                      );

                      return (
                        <tr key={service.billableServiceId} className={styles.tableGrid}>
                          <td className={styles.cell}>
                            <Layouts.Box maxWidth="220px">
                              <Layouts.Padding bottom="3">
                                <Typography variant="bodyMedium">
                                  <Layouts.Flex>
                                    {billableService?.description}
                                    {!billableService?.active ? (
                                      <Layouts.Margin left="1">
                                        <Badge color="alert">{t('Text.Inactive')}</Badge>
                                      </Layouts.Margin>
                                    ) : null}
                                  </Layouts.Flex>
                                </Typography>
                              </Layouts.Padding>
                            </Layouts.Box>
                          </td>
                          <td className={styles.cell}>
                            <Layouts.Padding padding="2" bottom="3" top="0">
                              <Typography variant="bodyMedium" textAlign="right">
                                {service.price}
                              </Typography>
                            </Layouts.Padding>
                          </td>
                          <td className={styles.cell}>
                            <Layouts.Flex justifyContent="flex-end">
                              <Layouts.Margin right="1">
                                <Layouts.Flex direction="column">
                                  <Layouts.Margin bottom="0.5">
                                    <OperationButton
                                      position="relative"
                                      as="button"
                                      width="16px"
                                      height="16px"
                                      borderRadius="3px"
                                      backgroundColor="white"
                                      plus
                                      active={values.edit.direction === 'increase'}
                                    />
                                  </Layouts.Margin>
                                  <OperationButton
                                    position="relative"
                                    as="button"
                                    width="16px"
                                    height="16px"
                                    borderRadius="3px"
                                    backgroundColor="white"
                                    active={values.edit.direction === 'decrease'}
                                  />
                                </Layouts.Flex>
                              </Layouts.Margin>
                              <Layouts.Box width="120px">
                                <FormInput
                                  className={styles.formInput}
                                  type="number"
                                  name="value"
                                  ariaLabel={
                                    values.edit.calculation === 'flat'
                                      ? t(`${I18N_PATH}ValueInCurrency`)
                                      : t(`${I18N_PATH}ValueInPercents`)
                                  }
                                  key="value"
                                  value={service.value}
                                  disabled
                                  onChange={noop}
                                />
                              </Layouts.Box>
                            </Layouts.Flex>
                          </td>
                          <td className={styles.cell}>
                            <Layouts.Flex justifyContent="flex-end">
                              <Layouts.Box width="120px">
                                <FormInput
                                  className={styles.formInput}
                                  type="number"
                                  name="finalPrice"
                                  ariaLabel={t('Text.FinalPrice')}
                                  key="finalPrice"
                                  value={service.finalPrice}
                                  disabled
                                  onChange={noop}
                                />
                              </Layouts.Box>
                            </Layouts.Flex>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              )}
            </Layouts.Padding>
          </Layouts.Box>
        ) : null}
      </Layouts.Box>
    </>
  );
};

export default observer(ServiceForm);
