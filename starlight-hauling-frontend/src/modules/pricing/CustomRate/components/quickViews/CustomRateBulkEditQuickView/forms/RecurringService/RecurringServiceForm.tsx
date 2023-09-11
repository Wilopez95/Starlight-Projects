import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Badge,
  CollapsibleBar,
  FormInput,
  IGridLayout,
  Layouts,
  Navigation,
  NavigationConfigItem,
  Typography,
} from '@starlightpro/shared-components';
import { useFormikContext } from 'formik';
import { capitalize, intersectionWith, noop, toUpper } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { useFormatFrequency } from '@root/common/TableTools/TableData/helpers/useFormatFrequency';
import { useBusinessContext, useStores } from '@root/hooks';
import { FormSkeleton, MaterialNavItem, MaterialNotLinked } from '@root/modules/pricing/components';
import { calculateFinalPrice, toFixed } from '@root/modules/pricing/GeneralRate/helpers';
import { IBillableService, IFrequency } from '@root/types/entities';

import { IBulkPreviewPriceGroupRateRecurringService, IBulkRatesData } from '../../types';

import styles from '../../css/styles.scss';
import {
  equipmentItemsLoadingNavigationConfig,
  materialsLoadingNavigationConfig,
} from './navigationConfigs';
import { type IRecurringServiceForm } from './types';

const I18N_PATH = 'modules.pricing.CustomRate.components.CustomRateBulkEditQuickView.forms.Text.';

const gridFormat4Cells: IGridLayout = {
  columns: 'auto 120px 120px 130px',
  rows: '36px',
  alignItems: 'center',
};

const RecurringServiceForm: React.FC<IRecurringServiceForm> = ({
  onMaterialChange,
  onEquipmentItemChange,
  currentEquipmentItemNavigation,
  currentMaterialNavigation,
  equipments: propsEquipments = [],
  materials: propsMaterials = [],
  services: propsRecurringServices = [],
}) => {
  const {
    generalRateStoreNew,
    billableServiceStore,
    equipmentItemStore,
    materialStore,
    priceGroupStoreNew,
    systemConfigurationStore,
    customRateStoreNew,
  } = useStores();
  const prevMaterialType = useRef<string | null>(null);
  const prevEquipmentType = useRef<string | null>(null);
  const { values } = useFormikContext<IBulkRatesData>();
  const { businessLineId, businessUnitId } = useBusinessContext();

  const selectedPriceGroup = priceGroupStoreNew.selectedEntity;

  const { t } = useTranslation();
  const formatFrequency = useFormatFrequency();

  const recurringServicesValues =
    propsRecurringServices.length > 0
      ? intersectionWith(
          values.preview.recurringService,
          propsRecurringServices,
          (_services, _propsRecurringServices) =>
            _services.billableServiceId === _propsRecurringServices.id,
        )
      : values.preview.recurringService;

  const [recurringServices, setRecurringServices] = useState<
    IBulkPreviewPriceGroupRateRecurringService[] | null
  >(null);

  const sortedMaterials =
    propsMaterials.length > 0
      ? intersectionWith(
          materialStore.sortedValues,
          propsMaterials,
          (_materials, _propsMaterials) => _materials.id === _propsMaterials.id,
        )
      : materialStore.sortedValues;

  const materialsNavigation: NavigationConfigItem[] = sortedMaterials.map((material, index) => ({
    label: <MaterialNavItem text={material.description} active={material.active} />,
    key: material.id.toString(),
    index,
  }));

  const sortedEquipmentItems =
    propsEquipments.length > 0
      ? intersectionWith(
          equipmentItemStore.sortedValues,
          propsEquipments,
          (_equipments, _propsEquipments) => _equipments.id === _propsEquipments.id,
        )
      : equipmentItemStore.sortedValues;

  const equipmentItemsNavigation: NavigationConfigItem[] = sortedEquipmentItems.map(
    (equipmentItem, index) => ({
      label: equipmentItem.shortDescription,
      key: equipmentItem.id.toString(),
      index,
    }),
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
    (async () => {
      if (
        currentEquipmentItemNavigation &&
        currentMaterialNavigation &&
        values.preview.priceGroupId
      ) {
        await Promise.all([
          generalRateStoreNew.filterRecurrentServiceRatesByParameters({
            materialId: currentMaterialNavigation?.key
              ? Number.parseInt(currentMaterialNavigation.key, 10)
              : null,
            equipmentItemId: Number.parseInt(currentEquipmentItemNavigation.key, 10),
          }),
          customRateStoreNew.filterRecurrentServiceRatesByParameters({
            materialId: currentMaterialNavigation?.key
              ? Number.parseInt(currentMaterialNavigation.key, 10)
              : null,
            equipmentItemId: Number.parseInt(currentEquipmentItemNavigation.key, 10),
          }),
        ]);
      }
    })();
  }, [
    currentEquipmentItemNavigation,
    currentMaterialNavigation,
    generalRateStoreNew,
    customRateStoreNew,
    selectedPriceGroup,
    customRateStoreNew.isPreconditionFailed,
    businessUnitId,
    businessLineId,
    values.preview.priceGroupId,
  ]);

  useEffect(() => {
    (async () => {
      if (
        (currentMaterialNavigation?.key !== prevMaterialType.current ||
          currentEquipmentItemNavigation?.key !== prevEquipmentType.current) &&
        !generalRateStoreNew.loading &&
        !customRateStoreNew.loading &&
        recurringServicesValues?.length
      ) {
        const fetchedFrequencies = await Promise.all(
          recurringServicesValues?.map(service => {
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

        const recurringServicesData: IBulkPreviewPriceGroupRateRecurringService[] =
          fetchedFrequencies
            .map((frequencies?: IFrequency[], index?) => {
              if (!frequencies) {
                return undefined;
              }

              return frequencies?.map((frequency: IFrequency) => {
                let displayValue;
                let finalPrice;
                let operation;
                const value = recurringServicesValues[index]?.value;
                const valueNum = +(value ?? 0);
                const direction = values.edit.direction === 'increase';

                if (frequency?.price) {
                  const globalPrice = !frequency.globalPrice
                    ? frequency.price
                    : frequency.globalPrice;

                  finalPrice =
                    values.edit.calculation === 'percentage'
                      ? calculateFinalPrice(direction, valueNum, parseFloat(globalPrice))
                      : toFixed(parseFloat(globalPrice) + valueNum * (direction ? 1 : -1));
                }

                if (value) {
                  operation = valueNum > 0;
                  displayValue = +valueNum.toFixed(3);
                }

                return {
                  ...frequency,
                  price: frequency.price,
                  value: Math.abs(valueNum).toString(),
                  displayValue: displayValue?.toString(),
                  finalPrice: finalPrice?.toString(),
                  operation,
                };
              });
            })
            .map((frequencies, index) => ({
              ...recurringServicesData[index],
              frequencies,
            }));

        recurringServicesData && setRecurringServices(recurringServicesData);
        prevMaterialType.current = currentMaterialNavigation?.key ?? null;
        prevEquipmentType.current = currentEquipmentItemNavigation?.key ?? null;
      }
    })();
  }, [
    billableServiceStore,
    generalRateStoreNew.loading,
    recurringServicesValues,
    systemConfigurationStore,
    values.edit.calculation,
    values.edit.direction,
    currentMaterialNavigation?.key,
    currentEquipmentItemNavigation?.key,
    customRateStoreNew.loading,
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
          <Layouts.Padding top="1" right="0.5" bottom="0" left="2">
            <Layouts.Box width="100%">
              {customRateStoreNew.loading ? (
                <FormSkeleton />
              ) : !isMaterialLinked ? (
                <MaterialNotLinked businessLineId={businessLineId} />
              ) : (
                <>
                  <Typography
                    textTransform="uppercase"
                    variant="headerFive"
                    color="secondary"
                    shade="desaturated"
                  >
                    <Layouts.Grid {...gridFormat4Cells}>
                      <Layouts.Flex justifyContent="flex-start">
                        <Typography
                          color="secondary"
                          shade="desaturated"
                          variant="caption"
                          textTransform="uppercase"
                        >
                          {t(`${I18N_PATH}ServiceFrequency`)}, $
                        </Typography>
                      </Layouts.Flex>
                      <Layouts.Flex justifyContent="flex-end">
                        <Typography
                          color="secondary"
                          shade="desaturated"
                          variant="caption"
                          textTransform="uppercase"
                          textAlign="center"
                        >
                          {t(`${I18N_PATH}GeneralPrice`)}, $
                        </Typography>
                      </Layouts.Flex>
                      <Layouts.Flex justifyContent="flex-end">
                        <Typography
                          color="secondary"
                          shade="desaturated"
                          variant="caption"
                          textTransform="uppercase"
                          textAlign="center"
                        >
                          {t('Text.Value')}, {values.edit.calculation === 'flat' ? '$' : '%'}
                        </Typography>
                      </Layouts.Flex>
                      <Layouts.Flex justifyContent="flex-end">
                        <Typography
                          color="secondary"
                          shade="desaturated"
                          variant="caption"
                          textTransform="uppercase"
                          textAlign="center"
                        >
                          {t(`${I18N_PATH}FinalPrice`)}, $
                        </Typography>
                      </Layouts.Flex>
                    </Layouts.Grid>
                  </Typography>
                  {recurringServices?.map((service, idx) => {
                    const billableService = billableServiceStore.getById(service.billableServiceId);

                    const isServicing = service?.action === 'service';

                    const includedServiceActions = (billableService?.services as IBillableService[])
                      ?.map(includedService => {
                        return capitalize(includedService.description);
                      })
                      .join(', ');

                    return (
                      <CollapsibleBar
                        key={`${service.billableServiceId}_${idx}`}
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
                                      {t(`Text.Inactive`)}
                                    </Badge>
                                  ) : null}
                                </Typography>

                                <Typography variant="caption" color="secondary" shade="desaturated">
                                  {toUpper(
                                    t(`${I18N_PATH}BillingCycle`).concat(
                                      ': ',
                                      service.billingCycle,
                                    ),
                                  )}
                                </Typography>
                              </Layouts.Flex>

                              {includedServiceActions ? (
                                <Typography
                                  variant="bodySmall"
                                  color="secondary"
                                  shade="desaturated"
                                >
                                  {t(`Text.Includes`)}: {includedServiceActions}
                                </Typography>
                              ) : null}
                            </Layouts.Padding>
                          </Layouts.Box>
                        }
                        containerClassName={styles.expandChild}
                        marginizeArrow
                      >
                        {service?.frequencies?.map((frequency, index) => {
                          const generalPrice = !frequency.globalPrice
                            ? frequency.price
                            : frequency.globalPrice;

                          return (
                            <Layouts.Padding
                              key={`${frequency.id}${index}`}
                              top="2"
                              bottom="2"
                              left="2"
                            >
                              <Layouts.Grid {...gridFormat4Cells}>
                                <Layouts.Flex justifyContent="flex-start">
                                  <Typography>
                                    {isServicing
                                      ? formatFrequency(frequency)
                                      : t('Text.NoFrequency')}
                                  </Typography>
                                </Layouts.Flex>
                                <Layouts.Padding padding="2" top="0" bottom="0">
                                  <Typography textAlign="right">
                                    {generalPrice ? toFixed(+generalPrice) : 0}
                                  </Typography>
                                </Layouts.Padding>
                                <Layouts.Flex direction="row" justifyContent="flex-end">
                                  <Layouts.Margin left="2" />
                                  <FormInput
                                    className={styles.formInput}
                                    type="number"
                                    name="Value in percents"
                                    ariaLabel={t(`${I18N_PATH}ValueInPercents`)}
                                    key="percents"
                                    value={frequency?.displayValue}
                                    onChange={noop}
                                    noError
                                    disabled
                                  />
                                </Layouts.Flex>
                                <Layouts.Flex justifyContent="flex-end">
                                  <Layouts.Flex justifyContent="center" alignItems="center">
                                    <Layouts.Margin left="1" right="1">
                                      <Layouts.Box width="16px" />
                                    </Layouts.Margin>
                                  </Layouts.Flex>
                                  <FormInput
                                    className={styles.formInput}
                                    type="number"
                                    name="Final price"
                                    ariaLabel={t('Text.FinalPrice')}
                                    key="finalPrice"
                                    value={
                                      frequency?.finalPrice ? toFixed(+frequency.finalPrice) : 0
                                    }
                                    onChange={noop}
                                    noError
                                    disabled
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
            </Layouts.Box>
          </Layouts.Padding>
        ) : null}
      </Layouts.Box>
    </>
  );
};

export default observer(RecurringServiceForm);
