import React, { useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CollapsibleBar,
  Layouts,
  Navigation,
  NavigationConfigItem,
} from '@starlightpro/shared-components';
import cx from 'classnames';
import { getIn, useFormikContext } from 'formik';
import { capitalize, isObject, upperCase } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { HistoryIcon } from '@root/assets';
import { Badge, FormInput, Typography } from '@root/common';
import { Table } from '@root/common/TableTools';
import { NONE_MATERIAL_KEY } from '@root/consts';
import { useBusinessContext, useStores } from '@root/hooks';
import { getFrequencyText } from '@root/pages/SystemConfiguration/components/Frequency/helpers';
import { IBillableService, IGlobalRateRecurringService, RatesEntityType } from '@root/types';

import { FormSkeleton, MaterialNavItem, MaterialNotLinked } from '../../components';

import styles from '../../css/styles.scss';
import {
  equipmentItemsLoadingNavigationConfig,
  materialsLoadingNavigationConfig,
} from './navigationConfigs';
import { type IGlobalRateRecurringServiceFormikData, type IRecurringServiceForm } from './types';

const I18N_PATH = 'components.forms.Rates.Global.Form.';

type IExtendedBillableService = (IBillableService & { services: IBillableService[] }) | null;

const RecurringServiceForm: React.FC<IRecurringServiceForm> = ({
  onMaterialChange,
  onEquipmentItemChange,
  setInitialValues,
  currentEquipmentItemNavigation,
  currentMaterialNavigation,
  onShowRatesHistory,
}) => {
  const { values, errors, handleChange, handleBlur } =
    useFormikContext<IGlobalRateRecurringServiceFormikData>();
  const { globalRateStore, billableServiceStore, equipmentItemStore, materialStore } = useStores();
  const { businessLineId, businessUnitId } = useBusinessContext();
  const { t } = useTranslation();

  const materialsNavigation: NavigationConfigItem<string>[] = useMemo(
    () => [
      { label: t(`Form.NoneMaterial`), key: NONE_MATERIAL_KEY, index: 0 },
      ...materialStore.sortedValues.map((material, index) => ({
        label: <MaterialNavItem text={material.description} active={material.active} />,
        key: material.id.toString(),
        index: index + 1,
      })),
    ],
    [materialStore.sortedValues, t],
  );

  const equipmentItemsNavigation: NavigationConfigItem<string>[] = useMemo(
    () =>
      equipmentItemStore.sortedValues.map((equipmentItem, index) => ({
        label: equipmentItem.shortDescription,
        key: equipmentItem.id.toString(),
        index,
      })),
    [equipmentItemStore.sortedValues],
  );

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
    if (currentEquipmentItemNavigation && currentMaterialNavigation) {
      globalRateStore.requestRecurringServices({
        materialId:
          currentMaterialNavigation.key === NONE_MATERIAL_KEY
            ? null
            : Number.parseInt(currentMaterialNavigation.key, 10),
        equipmentItemId: Number.parseInt(currentEquipmentItemNavigation.key, 10),
        businessLineId,
        businessUnitId,
      });
    }
  }, [
    currentEquipmentItemNavigation,
    currentMaterialNavigation,
    globalRateStore,
    globalRateStore.isPreconditionFailed,
    businessLineId,
    businessUnitId,
  ]);

  const isMaterialLinked = useMemo(() => {
    if (
      currentMaterialNavigation &&
      currentEquipmentItemNavigation &&
      currentMaterialNavigation.key !== NONE_MATERIAL_KEY
    ) {
      const material = materialStore.getById(+currentMaterialNavigation.key);

      return material?.equipmentItemIds?.some(
        equipmentItemId => equipmentItemId === +currentEquipmentItemNavigation.key,
      );
    }

    return false;
  }, [currentMaterialNavigation, currentEquipmentItemNavigation, materialStore]);

  useEffect(() => {
    (async () => {
      if (
        (isMaterialLinked || currentMaterialNavigation?.key === NONE_MATERIAL_KEY) &&
        !globalRateStore.recurringServicesLoading &&
        values.recurringServices?.length
      ) {
        const fetchedFrequencies = await Promise.all(
          values.recurringServices?.map(service => {
            if (!service.frequencies) {
              const frequencies = billableServiceStore.requestFrequencies(
                service.billableServiceId,
                {
                  globalRateRecurringServiceId: service.id,
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

        const updatedServices = fetchedFrequencies.map((frequencies, index) => ({
          ...values.recurringServices[index],
          frequencies,
        }));

        setInitialValues?.({ recurringServices: updatedServices });
      }
    })();
  }, [
    values.recurringServices,
    billableServiceStore,
    isMaterialLinked,
    globalRateStore,
    globalRateStore.recurringServicesLoading,
    currentMaterialNavigation?.key,
    setInitialValues,
  ]);

  const getBillableServiceWithIncludedServicesLabel = useCallback(
    (service: IGlobalRateRecurringService): [IExtendedBillableService, string | undefined] => {
      const billableService = billableServiceStore.getById(
        service.billableServiceId,
      ) as IExtendedBillableService;

      const includedServiceActionsLabel = billableService?.services
        ?.map(includedService => {
          return capitalize(isObject(includedService) ? includedService.description : '');
        })
        .join(', ');

      return [billableService, includedServiceActionsLabel];
    },
    [billableServiceStore],
  );

  const handleShowHistory = useCallback(
    (
      billableServiceId: number,
      serviceDescription = '',
      billingCycle?: string,
      frequencyId?: number,
    ) => {
      if (currentEquipmentItemNavigation && currentMaterialNavigation) {
        const ratesHistoryParams = {
          businessUnitId,
          businessLineId,
          billableServiceId,
          billingCycle,
          frequencyId,
          materialId:
            currentMaterialNavigation.key === NONE_MATERIAL_KEY
              ? null
              : Number.parseInt(currentMaterialNavigation.key, 10),
          equipmentItemId: Number.parseInt(currentEquipmentItemNavigation.key, 10),
          entityType: RatesEntityType.globalRatesRecurringServices,
        };
        const materialLabel = materialStore.getById(+currentMaterialNavigation.key)?.description;

        onShowRatesHistory(ratesHistoryParams, [serviceDescription, materialLabel].join(' • '));
      }
    },
    [
      currentEquipmentItemNavigation,
      currentMaterialNavigation,
      businessLineId,
      businessUnitId,
      materialStore,
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
              {globalRateStore.recurringServicesLoading ? (
                <FormSkeleton />
              ) : (
                <>
                  {currentMaterialNavigation?.key !== NONE_MATERIAL_KEY && !isMaterialLinked ? (
                    <MaterialNotLinked businessLineId={businessLineId} />
                  ) : (
                    <>
                      <Table className={styles.tHead}>
                        <thead>
                          <tr>
                            <th className={cx(styles.title, styles.left)}>
                              {t(`${I18N_PATH}ServiceAndFrequency`)}
                            </th>
                            <th className={cx(styles.title, styles.right)}>
                              {t(`${I18N_PATH}GeneralRackRates`)}, $
                            </th>
                          </tr>
                        </thead>
                      </Table>

                      {values.recurringServices?.map((service, index) => {
                        const isServicing = service?.action === 'service';

                        const [billableService, includedServiceActions] =
                          getBillableServiceWithIncludedServicesLabel(service);

                        return (
                          <CollapsibleBar
                            key={`service${index}${service.billingCycle}`}
                            label={
                              <Layouts.Box width="100%">
                                <Layouts.Padding padding="2">
                                  <Layouts.Flex
                                    justifyContent="space-between"
                                    alignItems="center"
                                    flexGrow={1}
                                  >
                                    <Typography variant="bodyMedium" fontWeight="medium">
                                      {billableService?.description}
                                      {!billableService?.active ? (
                                        <Badge color="alert" className={styles.inactive}>
                                          {t(`Form.Inactive`)}
                                        </Badge>
                                      ) : null}
                                    </Typography>

                                    <Typography
                                      variant="caption"
                                      color="secondary"
                                      shade="desaturated"
                                      textTransform="uppercase"
                                    >
                                      {upperCase(t(`Form.BillingCycle`))}: {service.billingCycle}
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
                            <Table className={styles.table}>
                              <tbody>
                                {service.frequencies?.map((frequency, frIndex) => {
                                  const inputPath = `recurringServices[${index}].frequencies[${frIndex}].price`;
                                  const error = getIn(errors, inputPath);
                                  const price =
                                    values.recurringServices[index].frequencies?.[frIndex].price;

                                  return (
                                    <tr key={inputPath} className={styles.historyLabel}>
                                      <td className={cx(styles.cell, styles.large)}>
                                        <Layouts.Flex>
                                          <Layouts.Padding padding="0.5" left="2">
                                            <Typography>
                                              {isServicing
                                                ? getFrequencyText(
                                                    t,
                                                    frequency.type,
                                                    frequency.times,
                                                  )
                                                : t(`Text.NoFrequency`)}
                                            </Typography>
                                          </Layouts.Padding>
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
                                      </td>
                                      <td className={styles.cell}>
                                        <Layouts.Padding padding="0.5">
                                          <Layouts.Flex justifyContent="flex-end">
                                            <FormInput
                                              name={inputPath}
                                              type="number"
                                              key={inputPath}
                                              ariaLabel={`${
                                                billableService?.description ?? ''
                                              } general rack rates`}
                                              value={price}
                                              onChange={handleChange}
                                              onBlur={handleBlur}
                                              error={error}
                                              noError={!error}
                                              wrapClassName={styles.input}
                                            />
                                          </Layouts.Flex>
                                        </Layouts.Padding>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </Table>
                          </CollapsibleBar>
                        );
                      })}
                    </>
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

export default observer(RecurringServiceForm);
