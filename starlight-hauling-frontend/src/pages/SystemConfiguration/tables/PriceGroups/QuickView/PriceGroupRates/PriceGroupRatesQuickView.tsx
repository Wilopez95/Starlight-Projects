import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts, Navigation, NavigationConfigItem } from '@starlightpro/shared-components';
import { useFormik } from 'formik';
import { isEmpty, noop } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { IRatesHistoryRequest } from '@root/api/priceGroup/types';
import { CrossIcon } from '@root/assets';
import { Divider, IBaseQuickView, TableQuickView, withQuickView } from '@root/common/TableTools';
import { UnsavedChangesModal } from '@root/common/TableTools/TableQuickView/UnsavedChanges/UnsavedChangesModal';
import { FormContainer } from '@root/components';
import ratesStyles from '@root/components/forms/Rates/css/styles.scss';
import {
  LineItemForm,
  RecurringLineItemForm,
  RecurringServiceForm,
  ServiceForm,
  SurchargeForm,
  ThresholdForm,
} from '@root/components/forms/Rates/Custom';
import {
  getPriceGroupRateDefaultValues,
  getPriceGroupRatesValidationSchema,
  mapFormikToPriceGroupRate,
  mapPriceGroupRateBillingCycleToFormik,
  mapPriceGroupRateServiceToFormik,
} from '@root/components/forms/Rates/Custom/formikData';
import {
  FormikPriceGroupRate,
  PriceGroupRateType,
} from '@root/components/forms/Rates/Custom/types';
import { useNavigation } from '@root/components/forms/Rates/hooks';
import { RatesConfigType } from '@root/components/forms/Rates/types';
import { RatesHistoryModal } from '@root/components/modals';
import { BillableItemActionEnum, NONE_MATERIAL_KEY } from '@root/consts';
import { handleEnterOrSpaceKeyDown } from '@root/helpers';
import {
  useBoolean,
  useBusinessContext,
  useCleanup,
  useCrudPermissions,
  useScrollOnError,
  useStores,
} from '@root/hooks';
import {
  IPriceGroupRateLineItem,
  IPriceGroupRateRecurringLineItem,
  IPriceGroupRateRecurringService,
  IPriceGroupRateService,
  IPriceGroupRateSurcharge,
  IPriceGroupRateThreshold,
  ThresholdSettingsType,
  ThresholdType,
} from '@root/types';

import { ButtonContainer } from '../../../../components';
import { useRatesConfirmModal } from '../hooks/useRatesConfirmModal';

import styles from '../css/styles.scss';

const forms = {
  services: ServiceForm,
  recurringServices: RecurringServiceForm,
  lineItems: LineItemForm,
  recurringLineItems: RecurringLineItemForm,
  thresholds: ThresholdForm,
  surcharges: SurchargeForm,
};

const PriceGroupRatesQuickView: React.FC<IBaseQuickView> = ({
  tableScrollContainerRef,
  tbodyContainerRef,
  newButtonRef,
}) => {
  const {
    businessUnitStore,
    globalRateStore,
    priceGroupStore,
    materialStore,
    equipmentItemStore,
    billableServiceStore,
    businessLineStore,
    lineItemStore,
    thresholdStore,
    surchargeStore,
  } = useStores();

  const { t } = useTranslation();

  const { businessLineId, businessUnitId } = useBusinessContext();

  const currentBusinessUnit = businessUnitStore.getById(businessUnitId);

  const isRecyclingLoB = businessLineStore.isRecyclingType(businessLineId);

  const isRollOff = businessLineStore.isRollOffType(businessLineId);

  const navItems = useNavigation(currentBusinessUnit, isRollOff);

  const [currentMaterialNavigation, setMaterialNavigation] = useState<
    NavigationConfigItem<string> | undefined
  >();

  const [currentEquipmentItemNavigation, setEquipmentItemNavigation] = useState<
    NavigationConfigItem<string> | undefined
  >();

  const [currentThresholdOption, setThresholdOption] = useState<number | undefined>();
  const [thresholdSetting, setThresholdSetting] = useState<ThresholdSettingsType>();
  const [isSettingConfirmOpen, openSettingConfirm, closeSettingConfirm] = useBoolean();
  const [isRatesHistoryModalOpen, openRatesHistoryModal, closeRatesHistoryModal] = useBoolean();

  const [modalSubtitle, setModalSubtitle] = useState<string>();

  useCleanup(materialStore);
  useCleanup(equipmentItemStore);

  const [initialValues, setInitialValues] = useState<Record<string, PriceGroupRateType[]>>();

  const selectedPriceGroup = priceGroupStore.selectedEntity;
  const currentThreshold = thresholdStore.getById(currentThresholdOption);
  const ratesHistoryLoading = priceGroupStore.historyLoading;

  const getThresholdSetting = useCallback(
    (type: ThresholdType) => {
      switch (type) {
        case 'demurrage':
          return selectedPriceGroup?.demurrageSetting;
        case 'overweight':
          return selectedPriceGroup?.overweightSetting;
        case 'usageDays':
          return selectedPriceGroup?.usageDaysSetting;
        case 'load':
          return selectedPriceGroup?.loadSetting;
        case 'dump':
          return selectedPriceGroup?.dumpSetting;
        default:
          return undefined;
      }
    },
    [
      selectedPriceGroup?.demurrageSetting,
      selectedPriceGroup?.overweightSetting,
      selectedPriceGroup?.usageDaysSetting,
      selectedPriceGroup?.loadSetting,
      selectedPriceGroup?.dumpSetting,
    ],
  );

  const initialThresholdSetting = currentThreshold
    ? getThresholdSetting(currentThreshold.type)
    : undefined;
  const thresholdSettingDirty = initialThresholdSetting !== thresholdSetting;

  const currentMaterialNavigationKey = currentMaterialNavigation?.key;
  const currentEquipmentItemNavigationKey = currentEquipmentItemNavigation?.key;

  const priceGroupRateServices: FormikPriceGroupRate<IPriceGroupRateService>[] =
    billableServiceStore.sortedValues
      .filter(billableService => {
        if (currentMaterialNavigation?.key === NONE_MATERIAL_KEY) {
          return !billableService.materialBasedPricing;
        }

        if (isRecyclingLoB && billableService.materialBasedPricing) {
          const material = materialStore.getById(currentMaterialNavigation?.key);

          if (material?.useForDump && billableService.action === BillableItemActionEnum.dump) {
            return true;
          }

          if (material?.useForLoad && billableService.action === BillableItemActionEnum.load) {
            return true;
          }

          return false;
        }

        return billableService.materialBasedPricing;
      })
      .filter(
        billableService =>
          billableService.oneTime &&
          billableService.businessLineId.toString() === businessLineId &&
          billableService.equipmentItem?.id.toString() === currentEquipmentItemNavigationKey,
      )
      .map(billableService => {
        const service = globalRateStore.services.find(
          serviceElement => serviceElement.billableServiceId === billableService.id,
        );

        const equipmentItem = equipmentItemStore.sortedValues.find(
          equipmentItemElement =>
            equipmentItemElement.id.toString() === currentEquipmentItemNavigationKey,
        );

        const material = materialStore.sortedValues.find(
          materialElement => materialElement.id.toString() === currentMaterialNavigationKey,
        );

        const customService = priceGroupStore.priceGroupService(billableService.id);

        return mapPriceGroupRateServiceToFormik(
          {
            businessUnitId,
            businessLineId,
            billableServiceId: billableService.id,
            equipmentItemId: equipmentItem?.id,
            materialId: material?.id,
            price: customService?.price,
            id: customService?.id,
            updatedAt: customService?.updatedAt,
            nextPrice: customService?.nextPrice,
            effectiveDate: customService?.effectiveDate,
          },
          service?.price,
        );
      });

  const hasStaleRecurringServiceRates = (
    initialValues?.recurringServices as FormikPriceGroupRate<IPriceGroupRateRecurringService>[]
  )?.some(
    ({ equipmentItemId, materialId }) =>
      equipmentItemId?.toString() !== currentEquipmentItemNavigationKey ||
      (currentMaterialNavigationKey === NONE_MATERIAL_KEY
        ? materialId
        : materialId?.toString() !== currentMaterialNavigationKey),
  );

  const priceGroupRateRecurringServices: FormikPriceGroupRate<IPriceGroupRateRecurringService>[] =
    useMemo(
      () =>
        initialValues?.recurringServices && !hasStaleRecurringServiceRates
          ? (initialValues.recurringServices as FormikPriceGroupRate<IPriceGroupRateRecurringService>[])
          : billableServiceStore.sortedValues
              .filter(
                billableService =>
                  !billableService.oneTime &&
                  (currentMaterialNavigation?.key === NONE_MATERIAL_KEY
                    ? !billableService.materialBasedPricing
                    : billableService.materialBasedPricing) &&
                  billableService.equipmentItem?.id.toString() ===
                    currentEquipmentItemNavigationKey,
              )
              .flatMap(billableService => {
                const service = globalRateStore.recurringServices.find(
                  serviceElement => serviceElement.billableServiceId === billableService.id,
                );
                const equipmentItem = equipmentItemStore.sortedValues.find(
                  equipmentItemElement =>
                    equipmentItemElement.id.toString() === currentEquipmentItemNavigationKey,
                );
                const material = materialStore.sortedValues.find(
                  materialElement => materialElement.id.toString() === currentMaterialNavigationKey,
                );

                const customService = priceGroupStore.services.find(
                  serviceElement => serviceElement.billableServiceId === billableService.id,
                );

                return (
                  billableService.billingCycles?.map(billingCycle => {
                    return mapPriceGroupRateServiceToFormik(
                      {
                        businessUnitId,
                        businessLineId,
                        billableServiceId: billableService.id,
                        equipmentItemId: equipmentItem?.id,
                        materialId: material?.id ?? null,
                        price: customService?.price ?? undefined,
                        id: customService?.id,
                        globalRateId: service?.id,
                        updatedAt: customService?.updatedAt,
                        action: billableService.action,
                        frequencies: undefined,
                        billingCycle,
                      },
                      service?.price,
                    );
                  }) ?? []
                );
              }),
      [
        initialValues?.recurringServices,
        hasStaleRecurringServiceRates,
        businessUnitId,
        businessLineId,
        billableServiceStore.sortedValues,
        currentEquipmentItemNavigationKey,
        currentMaterialNavigationKey,
        globalRateStore.recurringServices,
        equipmentItemStore.sortedValues,
        materialStore.sortedValues,
        priceGroupStore.services,
        currentMaterialNavigation?.key,
      ],
    );

  const priceGroupRateLineItems: FormikPriceGroupRate<IPriceGroupRateLineItem>[] =
    lineItemStore.sortedValues
      .filter(lineItem => lineItem.oneTime && lineItem.businessLineId.toString() === businessLineId)
      .filter(lineItem => {
        if (currentMaterialNavigation?.key === NONE_MATERIAL_KEY) {
          return !lineItem.materialBasedPricing;
        }

        if (
          isRecyclingLoB &&
          lineItem.materialBasedPricing &&
          lineItem.type === 'miscellaneousItem'
        ) {
          if (lineItem.materialIds?.length) {
            const material = materialStore.getById(currentMaterialNavigation?.key);

            return material?.misc && lineItem.materialIds.includes(material.id);
          }

          return false;
        }

        return lineItem.materialBasedPricing;
      })
      .map(lineItem => {
        const globalLineItem = globalRateStore.lineItems.find(
          globalLineItemElement => globalLineItemElement.lineItemId === lineItem.id,
        );

        const customLineItem = priceGroupStore.priceGroupLineItem(lineItem.id);

        const material = lineItem.materialBasedPricing
          ? materialStore.sortedValues.find(
              materialElement => materialElement.id.toString() === currentMaterialNavigation?.key,
            )
          : undefined;

        return mapPriceGroupRateServiceToFormik(
          {
            businessUnitId,
            businessLineId,
            lineItemId: lineItem.id,
            materialId: material?.id,
            price: customLineItem?.price,
            id: customLineItem?.id,
            updatedAt: customLineItem?.updatedAt,
            nextPrice: customLineItem?.nextPrice,
            effectiveDate: customLineItem?.effectiveDate,
          },
          globalLineItem?.price,
        );
      });

  const priceGroupRateSurcharges: FormikPriceGroupRate<IPriceGroupRateSurcharge>[] =
    surchargeStore.sortedValues
      .filter(surcharge => surcharge.businessLineId.toString() === businessLineId)
      .filter(surcharge =>
        currentMaterialNavigation?.key === NONE_MATERIAL_KEY
          ? !surcharge.materialBasedPricing
          : surcharge.materialBasedPricing,
      )
      .map(surcharge => {
        const globalSurcharge = globalRateStore.surcharges.find(
          surchargeItem => surchargeItem.surchargeId === surcharge.id,
        );

        const customSurcharge = priceGroupStore.priceGroupSurcharge(surcharge.id);

        const material = surcharge.materialBasedPricing
          ? materialStore.sortedValues.find(
              materialElement => materialElement.id.toString() === currentMaterialNavigation?.key,
            )
          : undefined;

        return mapPriceGroupRateServiceToFormik(
          {
            businessUnitId,
            businessLineId,
            surchargeId: surcharge.id,
            materialId: material?.id,
            price: customSurcharge?.price,
            id: customSurcharge?.id,
            updatedAt: customSurcharge?.updatedAt,
          },
          globalSurcharge?.price,
        );
      });

  const priceGroupRateRecurringLineItems: FormikPriceGroupRate<IPriceGroupRateRecurringLineItem>[] =
    lineItemStore.sortedValues
      .filter(
        lineItem => !lineItem.oneTime && lineItem.businessLineId.toString() === businessLineId,
      )
      .map(lineItem => {
        const globalLineItem = globalRateStore.recurringLineItems.find(
          globalLineItemElement => globalLineItemElement.lineItemId === lineItem.id,
        );

        const customLineItem = priceGroupStore.priceGroupLineItem(
          lineItem.id,
        ) as IPriceGroupRateRecurringLineItem;

        return mapPriceGroupRateServiceToFormik(
          {
            businessUnitId,
            businessLineId,
            lineItemId: lineItem.id,
            price: customLineItem?.price ?? undefined,
            id: customLineItem?.id,
            updatedAt: customLineItem?.updatedAt,
            billingCycles: mapPriceGroupRateBillingCycleToFormik(
              lineItem,
              globalLineItem?.billingCycles,
              customLineItem?.billingCycles,
            ),
            nextPrice: customLineItem?.nextPrice,
            effectiveDate: customLineItem?.effectiveDate,
          },
          globalLineItem?.price,
        );
      });

  const priceGroupRateThresholds = thresholdStore.sortedValues
    .filter(
      threshold =>
        threshold.businessLineId.toString() === businessLineId &&
        threshold.id === currentThresholdOption,
    )
    .map(threshold => {
      const globalThreshold = globalRateStore.thresholds.find(
        globalThresholdElement => globalThresholdElement.thresholdId === threshold.id,
      );
      const equipmentItem = equipmentItemStore.sortedValues.find(
        equipmentItemElement =>
          equipmentItemElement.id.toString() === currentEquipmentItemNavigationKey,
      );
      const material = materialStore.sortedValues.find(
        materialElement => materialElement.id.toString() === currentMaterialNavigationKey,
      );

      const customThreshold = priceGroupStore.priceGroupThreshold(threshold.id);

      return mapPriceGroupRateServiceToFormik(
        {
          businessUnitId,
          businessLineId,
          thresholdId: threshold.id,
          equipmentItemId: equipmentItem?.id,
          materialId: material?.id,
          price: customThreshold?.price,
          limit: customThreshold?.limit,
          id: customThreshold?.id,
          updatedAt: customThreshold?.updatedAt,
        },
        globalThreshold?.price,
        globalThreshold?.limit,
      );
    });

  const [currentTab, setCurrentTab] = useState<NavigationConfigItem<RatesConfigType>>(navItems[0]);

  useEffect(() => {
    materialStore.request(
      {
        equipmentItems: true,
        businessLineId,
      },
      true,
    );
    equipmentItemStore.request({ businessLineId });
  }, [materialStore, equipmentItemStore, businessLineId]);

  useEffect(() => {
    switch (currentTab.key) {
      case 'services':
        billableServiceStore.request({ businessLineId, oneTime: true });
        break;
      case 'recurringServices':
        billableServiceStore.request({ businessLineId, oneTime: false, populateIncluded: true });
        break;
      case 'lineItems':
        lineItemStore.request({ businessLineId, oneTime: true });
        break;
      case 'recurringLineItems':
        lineItemStore.request({ businessLineId, oneTime: false });
        break;
      case 'thresholds':
        thresholdStore.request({ businessLineId });
        break;
      case 'surcharges':
        surchargeStore.request({ businessLineId });
        break;
      default:
        return undefined;
    }
  }, [
    businessLineId,
    billableServiceStore,
    currentTab.key,
    lineItemStore,
    thresholdStore,
    surchargeStore,
  ]);

  const getFormikInitialValues = useCallback(
    (tab: RatesConfigType) => {
      switch (tab) {
        case 'lineItems':
          return priceGroupRateLineItems;
        case 'recurringLineItems':
          return priceGroupRateRecurringLineItems;
        case 'services':
          return priceGroupRateServices;
        case 'recurringServices':
          return priceGroupRateRecurringServices;
        case 'thresholds':
          return priceGroupRateThresholds;
        case 'surcharges':
          return priceGroupRateSurcharges;
        default:
          return null;
      }
    },
    [
      priceGroupRateLineItems,
      priceGroupRateRecurringLineItems,
      priceGroupRateServices,
      priceGroupRateRecurringServices,
      priceGroupRateThresholds,
      priceGroupRateSurcharges,
    ],
  );

  const formik = useFormik({
    validationSchema: getPriceGroupRatesValidationSchema(currentTab.key, currentThreshold?.type),
    enableReinitialize: true,
    validateOnChange: false,
    validateOnBlur: false,
    initialValues: getPriceGroupRateDefaultValues(
      currentTab.key,
      getFormikInitialValues(currentTab.key) as unknown as PriceGroupRateType[],
    ),
    onSubmit: noop,
  });

  const { validateForm, setValues, setFieldValue, values, dirty, isValidating, errors } = formik;

  useScrollOnError(errors, !isValidating);

  const onTabChange = useCallback((tab: NavigationConfigItem<RatesConfigType>) => {
    setCurrentTab(tab);
    if (tab.key !== 'thresholds') {
      setThresholdOption(undefined);
      setThresholdSetting(undefined);
    }
  }, []);

  const onThresholdOptionChange = useCallback(
    (option?: number) => {
      const thresholdType = thresholdStore.getById(option)?.type;

      setThresholdOption(option);
      setThresholdSetting(thresholdType ? getThresholdSetting(thresholdType) : undefined);
      setMaterialNavigation(undefined);
      setEquipmentItemNavigation(undefined);
    },
    [getThresholdSetting, thresholdStore],
  );

  const onThresholdSettingChange = useCallback((setting?: ThresholdSettingsType) => {
    setThresholdSetting(setting);
    setMaterialNavigation(undefined);
    setEquipmentItemNavigation(undefined);
  }, []);

  const [
    isModalOpen,
    isSettingsModalOpen,
    confirmModalText,
    handleModalCancel,
    closeModal,
    handleTabChange,
    handleThresholdOptionChange,
    handleThresholdSettingChange,
    handleMaterialNavigation,
    handleEquipmentItemNavigation,
  ] = useRatesConfirmModal(
    dirty,
    thresholdSettingDirty,
    onTabChange,
    onThresholdOptionChange,
    onThresholdSettingChange,
    setMaterialNavigation,
    setEquipmentItemNavigation,
    initialThresholdSetting,
    currentMaterialNavigation,
    currentEquipmentItemNavigation,
    currentThresholdOption,
    thresholdSetting,
  );

  const handleSettingConfirmCancel = useCallback(() => {
    closeSettingConfirm();
    priceGroupStore.unSelectEntity();
    priceGroupStore.toggleRatesQuickView(false);
  }, [closeSettingConfirm, priceGroupStore]);

  const updatePriceGroupServices = useCallback(
    async (
      servicesValues: FormikPriceGroupRate<IPriceGroupRateService>[],
      priceGroupId: number,
    ) => {
      const services = servicesValues
        .filter(
          (service, index) =>
            (service.price ?? service.price === 0) ||
            (priceGroupRateServices[index].price ?? priceGroupRateServices[index].price === 0),
        )
        .map(service => mapFormikToPriceGroupRate(service));

      if (services.length > 0) {
        await priceGroupStore.updateServices(services, priceGroupId);
      }
    },
    [priceGroupRateServices, priceGroupStore],
  );

  const updatePriceGroupRecurringServices = useCallback(
    async (
      servicesValues: FormikPriceGroupRate<IPriceGroupRateRecurringService>[],
      priceGroupId: number,
    ) => {
      const services = servicesValues
        .filter((service, index) => {
          service.frequencies = service?.frequencies
            ?.filter((frequency, frequencyIndex) => {
              return (
                frequency?.price ??
                priceGroupRateRecurringServices[index].frequencies?.[frequencyIndex].price
              );
            })
            .map(frequency => {
              let value: number | undefined;
              let price: number | undefined;

              if (frequency.value && frequency.operation !== undefined) {
                value = +frequency.value * (frequency.operation ? 1 : -1);
              }

              if (frequency.globalPrice) {
                price = +(+frequency.globalPrice * (1 + +(value ?? 0) / 100)).toFixed(2);
              }

              frequency.value = undefined;
              frequency.finalPrice = undefined;
              frequency.operation = undefined;
              frequency.displayValue = undefined;
              frequency.globalLimit = undefined;
              service.price = price;

              return {
                ...frequency,
                price: price?.toString(),
              };
            });

          return service.frequencies?.length;
        })
        .map(service => mapFormikToPriceGroupRate(service));

      if (services.length > 0) {
        await priceGroupStore.updateServices(services, priceGroupId);
      }

      const purgedServices = servicesValues.map(serviceItem => ({
        ...serviceItem,
        frequencies: undefined,
      }));

      setFieldValue('recurringServices', purgedServices);
    },
    [priceGroupRateRecurringServices, priceGroupStore, setFieldValue],
  );

  const updatePriceGroupLineItems = useCallback(
    async (
      lineItemsValues: FormikPriceGroupRate<IPriceGroupRateLineItem>[],
      priceGroupId: number,
    ) => {
      const lineItems = lineItemsValues
        .filter(
          (lineItem, index) =>
            (lineItem.price ?? lineItem.price === 0) ||
            (priceGroupRateLineItems[index].price ?? priceGroupRateLineItems[index].price === 0),
        )
        .map(lineItem => mapFormikToPriceGroupRate(lineItem));

      if (lineItems.length > 0) {
        await priceGroupStore.updateLineItems(lineItems, priceGroupId);
      }
    },
    [priceGroupRateLineItems, priceGroupStore],
  );

  const updatePriceGroupSurcharges = useCallback(
    async (
      surchargesValues: FormikPriceGroupRate<IPriceGroupRateSurcharge>[],
      priceGroupId: number,
    ) => {
      const surcharges = surchargesValues
        .filter(
          (surcharge, index) =>
            (surcharge.price ?? surcharge.price === 0) ||
            (priceGroupRateSurcharges[index].price ?? priceGroupRateSurcharges[index].price === 0),
        )
        .map(surcharge => mapFormikToPriceGroupRate(surcharge));

      if (surcharges.length > 0) {
        await priceGroupStore.updateSurcharges(surcharges, priceGroupId);
      }
    },
    [priceGroupRateSurcharges, priceGroupStore],
  );

  const updatePriceGroupRecurringLineItems = useCallback(
    async (
      lineItemsValues: FormikPriceGroupRate<IPriceGroupRateRecurringLineItem>[],
      priceGroupId: number,
    ) => {
      const lineItems = lineItemsValues
        .filter((lineItem, index) => {
          lineItem.billingCycles = lineItem.billingCycles
            .filter((billingCycle, billingCycleIndex) => {
              return (
                billingCycle.price ??
                priceGroupRateRecurringLineItems[index].billingCycles?.[billingCycleIndex].price
              );
            })
            .map(billingCycle => {
              let price: number | undefined;
              let value: number | undefined;

              if (billingCycle.value && billingCycle.operation !== undefined) {
                value = +billingCycle.value * (billingCycle.operation ? 1 : -1);
              }

              if (billingCycle.price) {
                price = +(billingCycle.price * (1 + +(value ?? 0) / 100)).toFixed(2);
              }

              billingCycle.value = undefined;
              billingCycle.finalPrice = undefined;
              billingCycle.operation = undefined;
              billingCycle.displayValue = undefined;
              billingCycle.globalLimit = undefined;

              return {
                ...billingCycle,
                price,
              };
            });

          return lineItem.billingCycles?.length;
        })
        .map(lineItem => mapFormikToPriceGroupRate(lineItem));

      if (lineItems.length > 0) {
        await priceGroupStore.updateLineItems(lineItems as IPriceGroupRateLineItem[], priceGroupId);
      }
    },
    [priceGroupRateRecurringLineItems, priceGroupStore],
  );

  const updatePriceGroupThresholds = useCallback(
    async (
      thresholdValues: FormikPriceGroupRate<IPriceGroupRateThreshold>[],
      priceGroupId: number,
    ) => {
      const thresholds = thresholdValues
        .filter(
          (threshold, index) =>
            (threshold.price ?? threshold.price === 0) ||
            (priceGroupRateThresholds[index].price ??
              priceGroupRateThresholds[index].price === 0) ||
            (threshold.limit ?? priceGroupRateThresholds[index].limit),
        )
        .filter(threshold => threshold.thresholdId === currentThresholdOption)
        .map(threshold => mapFormikToPriceGroupRate(threshold));

      if (thresholds.length > 0) {
        await priceGroupStore.updateThresholds(thresholds, priceGroupId);
      }

      if (selectedPriceGroup && thresholdSetting && currentThreshold) {
        selectedPriceGroup.setThresholdSetting(currentThreshold.type, thresholdSetting);
        priceGroupStore.updateThresholdSetting(
          {
            overweightSetting: selectedPriceGroup.overweightSetting,
            demurrageSetting: selectedPriceGroup.demurrageSetting,
            usageDaysSetting: selectedPriceGroup.usageDaysSetting,
          },
          selectedPriceGroup.id,
        );
      }
    },
    [
      selectedPriceGroup,
      thresholdSetting,
      currentThreshold,
      priceGroupRateThresholds,
      currentThresholdOption,
      priceGroupStore,
    ],
  );

  const handlePriceGroupRateChange = useCallback(
    async (closeConfirmModal?: () => void) => {
      const formErrors = await validateForm();

      if (!isEmpty(formErrors) || !selectedPriceGroup) {
        closeConfirmModal?.();

        return false;
      }

      switch (currentTab.key) {
        case 'services':
          await updatePriceGroupServices(
            values.services as FormikPriceGroupRate<IPriceGroupRateService>[],
            selectedPriceGroup.id,
          );
          break;
        case 'recurringServices':
          await updatePriceGroupRecurringServices(
            values.recurringServices as FormikPriceGroupRate<IPriceGroupRateRecurringService>[],
            selectedPriceGroup.id,
          );
          break;
        case 'lineItems':
          await updatePriceGroupLineItems(
            values.lineItems as FormikPriceGroupRate<IPriceGroupRateLineItem>[],
            selectedPriceGroup.id,
          );
          break;
        case 'recurringLineItems':
          await updatePriceGroupRecurringLineItems(
            values.recurringLineItems as FormikPriceGroupRate<IPriceGroupRateRecurringLineItem>[],
            selectedPriceGroup.id,
          );
          break;
        case 'thresholds':
          await updatePriceGroupThresholds(
            values.thresholds as FormikPriceGroupRate<IPriceGroupRateThreshold>[],
            selectedPriceGroup.id,
          );
          break;
        case 'surcharges':
          await updatePriceGroupSurcharges(
            values.surcharges as FormikPriceGroupRate<IPriceGroupRateSurcharge>[],
            selectedPriceGroup.id,
          );
          break;
        default:
          return null;
      }

      return true;
    },
    [
      validateForm,
      selectedPriceGroup,
      currentTab.key,
      updatePriceGroupServices,
      values.services,
      values.recurringServices,
      values.lineItems,
      values.recurringLineItems,
      values.thresholds,
      values.surcharges,
      updatePriceGroupRecurringServices,
      updatePriceGroupLineItems,
      updatePriceGroupRecurringLineItems,
      updatePriceGroupThresholds,
      updatePriceGroupSurcharges,
    ],
  );

  const handleModalSaveChanges = useCallback(async () => {
    const isSuccessful = await handlePriceGroupRateChange(closeModal);

    if (!priceGroupStore.isPreconditionFailed) {
      closeModal();
      if (isSuccessful) {
        handleModalCancel();
      }
    } else {
      const PriceGroupRateInitialValues = getPriceGroupRateDefaultValues(
        currentTab.key,
        getFormikInitialValues(currentTab.key) as unknown as PriceGroupRateType[],
      );

      setValues(PriceGroupRateInitialValues);
    }
  }, [
    closeModal,
    handleModalCancel,
    handlePriceGroupRateChange,
    priceGroupStore.isPreconditionFailed,
    currentTab.key,
    getFormikInitialValues,
    setValues,
  ]);

  const handleSilentSaveChanges = useCallback(
    async (onCancel: (showModal?: boolean) => void, closeModalSettings: () => void) => {
      const isSuccessful = await handlePriceGroupRateChange(closeModalSettings);

      if (!priceGroupStore.isPreconditionFailed) {
        closeModalSettings?.();
        if (isSuccessful) {
          onCancel(false);
        }
      } else {
        const initialGroupRateValues = getPriceGroupRateDefaultValues(
          currentTab.key,
          getFormikInitialValues(currentTab.key) as unknown as PriceGroupRateType[],
        );

        setValues(initialGroupRateValues);
      }
    },
    [
      handlePriceGroupRateChange,
      priceGroupStore.isPreconditionFailed,
      currentTab.key,
      getFormikInitialValues,
      setValues,
    ],
  );

  const handleQuickViewChanges = useCallback(
    async (onCancel: (showModal?: boolean) => void, closeModalSettings?: () => void) => {
      if (thresholdSettingDirty) {
        openSettingConfirm();
      } else {
        await handleSilentSaveChanges(onCancel, () => closeModalSettings);
      }
    },
    [handleSilentSaveChanges, openSettingConfirm, thresholdSettingDirty],
  );

  const handleCancelRatesQuickView = useCallback(() => {
    priceGroupStore.toggleRatesQuickView(false);
    priceGroupStore.unSelectEntity();
  }, [priceGroupStore]);

  const handleShowHistory = useCallback(
    async (ratesHistoryParams: IRatesHistoryRequest, subTitle: string) => {
      if (ratesHistoryLoading) {
        return;
      }
      await priceGroupStore.requestRatesHistory(ratesHistoryParams);
      setModalSubtitle(subTitle);
      openRatesHistoryModal();
    },
    [openRatesHistoryModal, priceGroupStore, ratesHistoryLoading],
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLOrSVGElement>, callback: () => void) => {
    if (handleEnterOrSpaceKeyDown(e)) {
      callback();
    }
  };

  const CurrentForm = forms[currentTab.key];

  const [_, canUpdatePriceGroups] = useCrudPermissions(
    'configuration/price-groups',
    'price-groups',
  );

  return (
    <TableQuickView
      parentRef={tableScrollContainerRef}
      clickOutContainers={[tbodyContainerRef, newButtonRef]}
      store={priceGroupStore}
      size="three-quarters"
      confirmModal={dirty || thresholdSettingDirty}
      confirmModalText={confirmModalText}
      saveChanges={handleSilentSaveChanges}
      onCancel={handleCancelRatesQuickView}
    >
      {({ onCancel, onAddRef, scrollContainerHeight, tableQuickViewStyles }) => {
        return (
          <>
            <UnsavedChangesModal
              text={confirmModalText}
              isOpen={isModalOpen || isSettingsModalOpen}
              onCancel={handleModalCancel}
              onSubmit={handleModalSaveChanges}
            />
            <UnsavedChangesModal
              text={confirmModalText}
              isOpen={isSettingConfirmOpen}
              onCancel={handleSettingConfirmCancel}
              onSubmit={() =>
                handleSilentSaveChanges(handleSettingConfirmCancel, closeSettingConfirm)
              }
            />
            <RatesHistoryModal
              title={modalSubtitle}
              isOpen={isRatesHistoryModalOpen}
              onClose={closeRatesHistoryModal}
            />
            <div ref={onAddRef} className={styles.navigation}>
              <div className={tableQuickViewStyles.cancelButton}>
                <CrossIcon
                  tabIndex={0}
                  role="button"
                  aria-label={t('Text.Close')}
                  onKeyDown={e => handleKeyDown(e, onCancel)}
                  onClick={() => onCancel()}
                />
              </div>
              <div className={tableQuickViewStyles.dataContainer}>
                <div className={tableQuickViewStyles.quickViewTitle}>
                  {selectedPriceGroup?.description}
                </div>
              </div>
              <Navigation activeTab={currentTab} configs={navItems} onChange={handleTabChange} />
            </div>
            <Layouts.Scroll className={styles.scrollContainer} height={scrollContainerHeight}>
              <Layouts.Box width="100%">
                <FormContainer formik={formik} className={ratesStyles.formContainer} fullHeight>
                  <CurrentForm
                    onEquipmentItemChange={handleEquipmentItemNavigation}
                    onMaterialChange={handleMaterialNavigation}
                    onThresholdChange={handleThresholdOptionChange}
                    onThresholdSettingChange={handleThresholdSettingChange}
                    onShowRatesHistory={handleShowHistory}
                    currentThresholdSetting={thresholdSetting}
                    currentEquipmentItemNavigation={currentEquipmentItemNavigation}
                    currentMaterialNavigation={currentMaterialNavigation}
                    currentThresholdOption={currentThresholdOption}
                    setInitialValues={setInitialValues}
                  />
                </FormContainer>
              </Layouts.Box>
            </Layouts.Scroll>

            <div ref={onAddRef} className={styles.buttonsComponentContainer}>
              <Divider bottom />
              <ButtonContainer
                submitButtonType="button"
                onSave={() => handleQuickViewChanges(() => onCancel())}
                onCancel={onCancel}
                disabled={!canUpdatePriceGroups}
              />
            </div>
          </>
        );
      }}
    </TableQuickView>
  );
};

export default withQuickView(observer(PriceGroupRatesQuickView));
