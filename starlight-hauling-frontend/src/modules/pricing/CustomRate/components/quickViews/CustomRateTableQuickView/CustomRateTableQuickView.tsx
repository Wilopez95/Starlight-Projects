import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts, Navigation, NavigationConfigItem } from '@starlightpro/shared-components';
import { useFormik } from 'formik';
import { isEmpty, noop } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { CrossIcon } from '@root/assets';
import { Divider, IBaseQuickView, TableQuickView, withQuickView } from '@root/common/TableTools';
import { UnsavedChangesModal } from '@root/common/TableTools/TableQuickView/UnsavedChanges/UnsavedChangesModal';
import { FormContainer } from '@root/components';
import { RatesHistoryModal } from '@root/components/modals';
import { BillableItemActionEnum } from '@root/consts';
import { handleEnterOrSpaceKeyDown } from '@root/helpers';
import {
  useBoolean,
  useBusinessContext,
  useCrudPermissions,
  useScrollOnError,
  useStores,
} from '@root/hooks';
import { RatesEntityType } from '@root/modules/pricing/const';
import ratesStyles from '@root/modules/pricing/css/styles.scss';
import {
  LineItemForm,
  RecurringLineItemForm,
  RecurringServiceForm,
  ServiceForm,
  SurchargeForm,
  ThresholdForm,
} from '@root/modules/pricing/CustomRate/components/forms';
import {
  getPriceGroupRateDefaultValues,
  getPriceGroupRatesValidationSchema,
  mapPriceGroupRateBillingCycleToFormik,
  mapPriceGroupRateServiceToFormik,
} from '@root/modules/pricing/CustomRate/components/forms/formikData';
import {
  FormikPriceGroupRate,
  PriceGroupRateType,
} from '@root/modules/pricing/CustomRate/components/forms/types';
import {
  ILineItemCustomRate,
  IRecurringLineItemCustomRate,
  IRecurringServiceCustomRate,
  IServiceCustomRate,
  ISurchargeCustomRate,
  IThresholdCustomRate,
} from '@root/modules/pricing/CustomRate/types';
import { useNavigation } from '@root/modules/pricing/navigation';
import { IRatesHistoryRequest } from '@root/modules/pricing/types';
import { ThresholdSettingsType, ThresholdType } from '@root/types';

import { ButtonContainer } from '../../../../../../pages/SystemConfiguration/components';
import { useRatesConfirmModal } from '../../../../hooks';

import { LineItem } from '../../../../../../stores/entities';
import {
  IRecurringLineItemBillingCycleRate,
  IRecurringLineItemGeneralRate,
} from '../../../../GeneralRate/types';
import { IServiceForm } from '../../forms/Service/types';
import { IRecurringServiceForm } from '../../forms/RecurringService/types';
import { ILineItemForm } from '../../forms/LineItem/types';
import { IThresholdForm } from '../../forms/Threshold/types';
import { ISurchargeForm } from '../../forms/Surcharge/types';
import { ConvertDateFields, DeepMap } from '../../../../../../types/helpers/JsonConversions';
import styles from './css/styles.scss';

interface IFormsComponent {
  oneTimeService: React.FC<IServiceForm>;
  recurringService: React.FC<IRecurringServiceForm>;
  oneTimeLineItem: React.FC<ILineItemForm>;
  recurringLineItem: React.FC<ILineItemForm>;
  threshold: React.FC<IThresholdForm>;
  surcharge: React.FC<ISurchargeForm>;
}

const forms: IFormsComponent = {
  oneTimeService: ServiceForm,
  recurringService: RecurringServiceForm,
  oneTimeLineItem: LineItemForm,
  recurringLineItem: RecurringLineItemForm,
  threshold: ThresholdForm,
  surcharge: SurchargeForm,
};

const CustomRateTableQuickView: React.FC<IBaseQuickView> = ({
  tableScrollContainerRef,
  tbodyContainerRef,
  newButtonRef,
}) => {
  const {
    businessUnitStore,
    generalRateStoreNew,
    priceGroupStoreNew,
    materialStore,
    equipmentItemStore,
    billableServiceStore,
    businessLineStore,
    lineItemStore,
    thresholdStore,
    surchargeStore,
    customRateStoreNew,
  } = useStores();

  const { t } = useTranslation();

  const { businessLineId, businessUnitId } = useBusinessContext();

  const currentBusinessUnit = businessUnitStore.getById(businessUnitId);

  const isRecyclingLoB = businessLineStore.isRecyclingType(businessLineId);

  const isRollOff = businessLineStore.isRollOffType(businessLineId);

  const navItems = useNavigation(currentBusinessUnit, isRollOff);

  const [currentMaterialNavigation, setMaterialNavigation] = useState<
    NavigationConfigItem | undefined
  >();

  const [currentEquipmentItemNavigation, setEquipmentItemNavigation] = useState<
    NavigationConfigItem | undefined
  >();

  const [currentThresholdOption, setThresholdOption] = useState<number | undefined>();
  const [thresholdSetting, setThresholdSetting] = useState<ThresholdSettingsType>();
  const [isSettingConfirmOpen, openSettingConfirm, closeSettingConfirm] = useBoolean();
  const [isRatesHistoryModalOpen, openRatesHistoryModal, closeRatesHistoryModal] = useBoolean();

  const [modalSubtitle, setModalSubtitle] = useState<string>();

  const [initialValues, setInitialValues] = useState<Record<string, PriceGroupRateType[]>>();

  const selectedPriceGroup = priceGroupStoreNew.selectedEntity;
  const currentThreshold = thresholdStore.getById(currentThresholdOption);
  const ratesHistoryLoading = customRateStoreNew.loading;

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

  const priceGroupRateServices: IServiceCustomRate[] = billableServiceStore.sortedValues
    .filter(billableService => {
      if (currentMaterialNavigation?.key === null) {
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
    .filter(billableService => billableService.oneTime)
    .map(billableService => {
      const service = generalRateStoreNew.getOneTimeServiceByBillableServiceId(billableService.id);

      const equipmentItem = equipmentItemStore.sortedValues.find(
        equipmentItemData =>
          equipmentItemData &&
          equipmentItemData.id.toString() === currentEquipmentItemNavigationKey,
      );

      const material = materialStore.sortedValues.find(
        materialData => materialData.id.toString() === currentMaterialNavigationKey,
      );

      const customService = customRateStoreNew.getOneTimeServiceByBillableServiceId(
        billableService.id,
      );

      return mapPriceGroupRateServiceToFormik(
        {
          businessUnitId,
          businessLineId,
          billableServiceId: billableService.id,
          equipmentItemId: equipmentItem!.id,
          materialId: material?.id ?? null,
          price: customService?.price ?? null,
          id: customService?.id,
        },
        service?.price ?? null,
      );
    });

  const hasStaleRecurringServiceRates = (
    initialValues?.recurringService as FormikPriceGroupRate<IRecurringServiceCustomRate>[]
  )?.some(
    ({ equipmentItemId, materialId }) =>
      equipmentItemId?.toString() !== currentEquipmentItemNavigationKey ||
      (currentMaterialNavigationKey === null
        ? materialId
        : materialId?.toString() !== currentMaterialNavigationKey),
  );

  const priceGroupRateRecurringServices = useMemo(
    () =>
      initialValues?.recurringService && !hasStaleRecurringServiceRates
        ? initialValues.recurringService
        : billableServiceStore.sortedValues
            .filter(
              billableService =>
                !billableService.oneTime &&
                (currentMaterialNavigation?.key === null
                  ? !billableService.materialBasedPricing
                  : billableService.materialBasedPricing) &&
                billableService.equipmentItem?.id.toString() === currentEquipmentItemNavigationKey,
            )
            .flatMap(billableService => {
              const service = generalRateStoreNew.getRecurrentServiceByBillableServiceId(
                billableService.id,
              );
              const equipmentItem = equipmentItemStore.sortedValues.find(
                equipmentItemData =>
                  equipmentItemData &&
                  equipmentItemData.id.toString() === currentEquipmentItemNavigationKey,
              );
              const material = materialStore.sortedValues.find(
                materialData => materialData.id.toString() === currentMaterialNavigationKey,
              );

              const customService = customRateStoreNew.rates.oneTimeService?.find(
                serviceData => serviceData.billableServiceId === billableService.id,
              );

              return (
                billableService.billingCycles?.map(billingCycle => {
                  return mapPriceGroupRateServiceToFormik(
                    {
                      businessUnitId,
                      businessLineId,
                      billableServiceId: billableService.id,
                      equipmentItemId: equipmentItem!.id,
                      materialId: material?.id ?? null,
                      price: customService?.price ?? null,
                      id: customService?.id,
                      globalRateId: service?.id,
                      action: billableService.action,
                      frequencies: undefined,
                      billingCycle,
                      billingCycles: billableService.billingCycles,
                    },
                    service?.price ?? null,
                  );
                }) ?? []
              );
            }),
    [
      initialValues?.recurringService,
      hasStaleRecurringServiceRates,
      billableServiceStore.sortedValues,
      currentMaterialNavigation?.key,
      currentEquipmentItemNavigationKey,
      generalRateStoreNew,
      equipmentItemStore.sortedValues,
      materialStore.sortedValues,
      customRateStoreNew.rates.oneTimeService,
      currentMaterialNavigationKey,
      businessUnitId,
      businessLineId,
    ],
  );

  const priceGroupRateLineItems: ILineItemCustomRate[] = lineItemStore.sortedValues
    .filter(lineItem => lineItem.oneTime && lineItem.businessLineId.toString() === businessLineId)
    .filter(lineItem => {
      if (currentMaterialNavigation?.key === null) {
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
      const globalLineItem = generalRateStoreNew.rates.oneTimeLineItem?.find(
        globalLineItemData => globalLineItemData.billableLineItemId === lineItem.id,
      );

      const customLineItem = customRateStoreNew.rates.oneTimeLineItem?.find(
        rateData => rateData.id === lineItem.id,
      );

      const material = lineItem.materialBasedPricing
        ? materialStore.sortedValues.find(
            materialData => materialData.id.toString() === currentMaterialNavigation?.key,
          )
        : undefined;

      return mapPriceGroupRateServiceToFormik(
        {
          businessUnitId,
          businessLineId,
          billableLineItemId: lineItem.id,
          materialId: material?.id ?? null,
          price: customLineItem?.price ?? null,
          id: customLineItem?.id,
        },
        globalLineItem?.price ?? null,
      );
    });

  const priceGroupRateSurcharges: ISurchargeCustomRate[] = surchargeStore.sortedValues
    .filter(surcharge => surcharge.businessLineId.toString() === businessLineId)
    .filter(surcharge =>
      currentMaterialNavigation?.key === null
        ? !surcharge.materialBasedPricing
        : surcharge.materialBasedPricing,
    )
    .map(surcharge => {
      const globalSurcharge = generalRateStoreNew.rates.surcharge?.find(
        surchargeItem => surchargeItem.surchargeId === surcharge.id,
      );

      const customSurcharge = customRateStoreNew.rates.surcharge?.find(
        rate => rate.id === surcharge.id,
      );

      const material = surcharge.materialBasedPricing
        ? materialStore.sortedValues.find(
            materialData => materialData.id.toString() === currentMaterialNavigation?.key,
          )
        : undefined;

      return mapPriceGroupRateServiceToFormik(
        {
          businessUnitId,
          businessLineId,
          surchargeId: surcharge.id,
          materialId: material?.id ?? null,
          price: customSurcharge?.price ?? null,
          id: customSurcharge?.id,
        },
        globalSurcharge?.price ?? null,
      );
    });

  const priceGroupRateRecurringLineItems: IRecurringLineItemCustomRate[] =
    lineItemStore.sortedValues
      .filter(
        (lineItem: LineItem) =>
          !lineItem.oneTime && lineItem.businessLineId.toString() === businessLineId,
      )
      .map((lineItem: LineItem) => {
        const globalLineItem = generalRateStoreNew.rates.recurringLineItem?.find(
          (globalLineItemData: IRecurringLineItemGeneralRate) =>
            globalLineItemData.billableLineItemId === lineItem.id,
        );

        const customLineItem = customRateStoreNew.rates.recurringLineItem?.find(
          (rate: DeepMap<ConvertDateFields<IRecurringLineItemCustomRate>>) =>
            rate.id === lineItem.id,
        );

        return mapPriceGroupRateServiceToFormik(
          {
            businessUnitId,
            businessLineId,
            billableLineItemId: lineItem.id,
            price: customLineItem?.price ?? null,
            id: customLineItem?.id,
            billingCycles: mapPriceGroupRateBillingCycleToFormik(
              lineItem,
              globalLineItem?.billingCycle as IRecurringLineItemBillingCycleRate[],
              customLineItem?.billingCycles as IRecurringLineItemBillingCycleRate[],
            ),
            nextPrice: customLineItem?.nextPrice,
            effectiveDate: customLineItem?.effectiveDate,
          },
          globalLineItem?.price ?? null,
        ) as IRecurringLineItemCustomRate;
      });

  const priceGroupRateThresholds: IThresholdCustomRate[] = thresholdStore.sortedValues
    .filter(
      threshold =>
        threshold.businessLineId.toString() === businessLineId &&
        threshold.id === currentThresholdOption,
    )
    .map(threshold => {
      const globalThreshold = generalRateStoreNew.rates.threshold?.find(
        globalThresh => globalThresh.thresholdId === threshold.id,
      );
      const equipmentItem = equipmentItemStore.sortedValues.find(
        equipItem => equipItem.id.toString() === currentEquipmentItemNavigationKey,
      );
      const material = materialStore.sortedValues.find(
        mat => mat.id.toString() === currentMaterialNavigationKey,
      );

      const customThreshold = customRateStoreNew.rates.threshold?.find(
        rate => rate.id === threshold.id,
      );

      return mapPriceGroupRateServiceToFormik(
        {
          businessUnitId,
          businessLineId,
          thresholdId: threshold.id,
          equipmentItemId: equipmentItem?.id,
          materialId: material?.id ?? null,
          price: customThreshold?.price ?? null,
          limit: customThreshold?.limit,
          id: customThreshold?.id,
        },
        globalThreshold?.price ?? null,
        globalThreshold?.limit,
      );
    });

  const [currentTab, setCurrentTab] = useState<NavigationConfigItem<RatesEntityType>>(navItems[0]);

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
      case RatesEntityType.oneTimeService:
        void billableServiceStore.request({ businessLineId, oneTime: true });
        break;
      case RatesEntityType.recurringService:
        void billableServiceStore.request({
          businessLineId,
          oneTime: false,
          populateIncluded: true,
        });
        break;
      case RatesEntityType.oneTimeLineItem:
        void lineItemStore.request({ businessLineId, oneTime: true });
        break;
      case RatesEntityType.recurringLineItem:
        void lineItemStore.request({ businessLineId, oneTime: false });
        break;
      case RatesEntityType.threshold:
        void thresholdStore.request({ businessLineId });
        break;
      case RatesEntityType.surcharge:
        void surchargeStore.request({ businessLineId });
        break;
      default:
        break;
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
    (tab: RatesEntityType) => {
      switch (tab) {
        case RatesEntityType.oneTimeLineItem:
          return priceGroupRateLineItems;
        case RatesEntityType.recurringLineItem:
          return priceGroupRateRecurringLineItems;
        case RatesEntityType.oneTimeService:
          return priceGroupRateServices;
        case RatesEntityType.recurringService:
          return priceGroupRateRecurringServices;
        case RatesEntityType.threshold:
          return priceGroupRateThresholds;
        case RatesEntityType.surcharge:
          return priceGroupRateSurcharges;
        default:
          break;
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
      getFormikInitialValues(currentTab.key),
    ),
    onSubmit: noop,
  });

  const { validateForm, setValues, setFieldValue, values, dirty, isValidating, errors } = formik;

  useScrollOnError(errors, !isValidating);

  const onTabChange = useCallback((tab: NavigationConfigItem<RatesEntityType>) => {
    setCurrentTab(tab);
    if (tab.key !== RatesEntityType.threshold) {
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
    initialThresholdSetting as ThresholdSettingsType,
    currentMaterialNavigation,
    currentEquipmentItemNavigation,
    currentThresholdOption,
    thresholdSetting,
  );

  const handleSettingConfirmCancel = useCallback(() => {
    closeSettingConfirm();
    priceGroupStoreNew.unSelectEntity();
    customRateStoreNew.toggleRatesQuickView(false);
  }, [closeSettingConfirm, priceGroupStoreNew, customRateStoreNew]);

  const updatePriceGroupServices = useCallback(
    async (servicesValues: IServiceCustomRate[] | null, priceGroupId: number) => {
      const services =
        servicesValues?.filter(
          (service, index) =>
            service.price ??
            service.price === 0 ??
            priceGroupRateServices[index].price ??
            priceGroupRateServices[index].price === 0,
        ) ?? [];

      if (services.length > 0) {
        await customRateStoreNew.update({
          oneTimeService: services,
          id: priceGroupId,
          businessLineId,
          businessUnitId,
        });
      }
    },
    [priceGroupRateServices, customRateStoreNew, businessLineId, businessUnitId],
  );

  const updatePriceGroupRecurringServices = useCallback(
    async (servicesValues: IRecurringServiceCustomRate[] | null, priceGroupId: number) => {
      const services =
        servicesValues?.filter((service, index) => {
          service.frequencies = service?.frequencies
            ?.filter((frequency, frequencyIndex) => {
              return (
                frequency?.price ??
                (priceGroupRateRecurringServices[index] as IRecurringServiceCustomRate)
                  .frequencies?.[frequencyIndex].price
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

              return {
                ...frequency,
                price: price?.toString(),
              };
            });

          return service.frequencies?.length;
        }) ?? [];

      if (services.length > 0) {
        await customRateStoreNew.update({
          recurringService: services,
          id: priceGroupId,
          businessUnitId,
          businessLineId,
        });
      }

      const purgedServices = servicesValues?.map(serviceItem => ({
        ...serviceItem,
        frequencies: undefined,
      }));

      setFieldValue(RatesEntityType.recurringService, purgedServices);
    },
    [
      setFieldValue,
      priceGroupRateRecurringServices,
      customRateStoreNew,
      businessUnitId,
      businessLineId,
    ],
  );

  const updatePriceGroupLineItems = useCallback(
    async (lineItemsValues: ILineItemCustomRate[] | null, priceGroupId: number) => {
      const lineItems =
        lineItemsValues?.filter(
          (lineItem, index) =>
            lineItem.price ??
            lineItem.price === 0 ??
            priceGroupRateLineItems[index].price ??
            priceGroupRateLineItems[index].price === 0,
        ) ?? [];

      if (lineItems.length > 0) {
        await customRateStoreNew.update({
          oneTimeLineItem: lineItems,
          id: priceGroupId,
          businessLineId,
          businessUnitId,
        });
      }
    },
    [priceGroupRateLineItems, customRateStoreNew, businessLineId, businessUnitId],
  );

  const updatePriceGroupSurcharges = useCallback(
    async (surchargesValues: ISurchargeCustomRate[] | null, priceGroupId: number) => {
      const surcharges =
        surchargesValues?.filter(
          (surcharge, index) =>
            surcharge.price ??
            surcharge.price === 0 ??
            priceGroupRateSurcharges[index].price ??
            priceGroupRateSurcharges[index].price === 0,
        ) ?? [];

      if (surcharges.length > 0) {
        await customRateStoreNew.update({
          surcharge: surcharges,
          id: priceGroupId,
          businessUnitId,
          businessLineId,
        });
      }
    },
    [priceGroupRateSurcharges, customRateStoreNew, businessUnitId, businessLineId],
  );

  const updatePriceGroupThresholds = useCallback(
    async (thresholdValues: IThresholdCustomRate[] | null, priceGroupId: number) => {
      const thresholds =
        thresholdValues
          ?.filter(
            (threshold, index) =>
              threshold.price ??
              threshold.price === 0 ??
              priceGroupRateThresholds[index].price ??
              priceGroupRateThresholds[index].price === 0 ??
              threshold.limit ??
              priceGroupRateThresholds[index].limit,
          )
          .filter(threshold => threshold.thresholdId === currentThresholdOption) ?? [];

      if (thresholds.length > 0) {
        await customRateStoreNew.update({
          threshold: thresholds,
          id: priceGroupId,
          businessUnitId,
          businessLineId,
        });
      }

      if (selectedPriceGroup && thresholdSetting && currentThreshold) {
        selectedPriceGroup.setThresholdSetting(currentThreshold.type, thresholdSetting);
        priceGroupStoreNew.updateThresholdSetting(
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
      customRateStoreNew,
      businessUnitId,
      businessLineId,
      priceGroupStoreNew,
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
        case RatesEntityType.oneTimeService:
          await updatePriceGroupServices(
            values.oneTimeService as IServiceCustomRate[],
            selectedPriceGroup.id,
          );
          break;
        case RatesEntityType.recurringService:
          await updatePriceGroupRecurringServices(
            values.recurringService as IRecurringServiceCustomRate[],
            selectedPriceGroup.id,
          );
          break;
        case RatesEntityType.oneTimeLineItem:
          await updatePriceGroupLineItems(
            values.oneTimeLineItem as ILineItemCustomRate[],
            selectedPriceGroup.id,
          );
          break;
        case RatesEntityType.recurringLineItem:
          break;
        case RatesEntityType.threshold:
          await updatePriceGroupThresholds(
            values.threshold as IThresholdCustomRate[],
            selectedPriceGroup.id,
          );
          break;
        case RatesEntityType.surcharge:
          await updatePriceGroupSurcharges(
            values.surcharge as ISurchargeCustomRate[],
            selectedPriceGroup.id,
          );
          break;
        default:
          break;
      }

      return true;
    },
    [
      validateForm,
      selectedPriceGroup,
      currentTab.key,
      updatePriceGroupServices,
      values.oneTimeService,
      values.recurringService,
      values.oneTimeLineItem,
      values.recurringLineItem,
      values.threshold,
      values.surcharge,
      updatePriceGroupRecurringServices,
      updatePriceGroupLineItems,
      updatePriceGroupThresholds,
      updatePriceGroupSurcharges,
    ],
  );

  const handleModalSaveChanges = useCallback(async () => {
    const isSuccessful = await handlePriceGroupRateChange(closeModal);

    if (!customRateStoreNew.isPreconditionFailed) {
      closeModal();
      if (isSuccessful) {
        handleModalCancel();
      }
    } else {
      const initialValuesData = getPriceGroupRateDefaultValues(
        currentTab.key,
        getFormikInitialValues(currentTab.key) as unknown as PriceGroupRateType[],
      );

      setValues(initialValuesData);
    }
  }, [
    closeModal,
    handleModalCancel,
    handlePriceGroupRateChange,
    customRateStoreNew.isPreconditionFailed,
    currentTab.key,
    getFormikInitialValues,
    setValues,
  ]);

  const handleSilentSaveChanges = useCallback(
    async (onCancel: (showModal?: boolean) => void, closeModalFunc?: () => void) => {
      const isSuccessful = await handlePriceGroupRateChange(closeModal);

      if (!customRateStoreNew.isPreconditionFailed) {
        closeModalFunc?.();
        if (isSuccessful) {
          onCancel(false);
        }
      } else {
        const initialValuesData = getPriceGroupRateDefaultValues(
          currentTab.key,
          getFormikInitialValues(currentTab.key) as unknown as PriceGroupRateType[],
        );

        setValues(initialValuesData);
      }
    },
    [
      handlePriceGroupRateChange,
      customRateStoreNew.isPreconditionFailed,
      currentTab.key,
      getFormikInitialValues,
      setValues,
    ],
  );

  const handleQuickViewChanges = useCallback(
    async (onCancel: (showModal?: boolean) => void, closeModalFunc?: () => void) => {
      if (thresholdSettingDirty) {
        openSettingConfirm();
      } else {
        await handleSilentSaveChanges(onCancel, closeModalFunc);
      }
    },
    [handleSilentSaveChanges, openSettingConfirm, thresholdSettingDirty],
  );

  const handleCancelRatesQuickView = useCallback(() => {
    customRateStoreNew.toggleRatesQuickView(false);
    priceGroupStoreNew.unSelectEntity();
  }, [priceGroupStoreNew, customRateStoreNew]);

  const handleShowHistory = useCallback(
    (ratesHistoryParams: IRatesHistoryRequest, subTitle: string) => {
      if (ratesHistoryLoading) {
        return;
      }
      // await priceGroupStoreNew.requestRatesHistory(ratesHistoryParams);
      setModalSubtitle(subTitle);
      openRatesHistoryModal();
    },
    [ratesHistoryLoading, openRatesHistoryModal],
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
      store={priceGroupStoreNew}
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
                  onClick={() => onCancel}
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
                    currentEquipmentItemNavigation={
                      currentEquipmentItemNavigation as NavigationConfigItem<string>
                    }
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
                onSave={
                  canUpdatePriceGroups
                    ? () => handleQuickViewChanges(onCancel as (showModal?: boolean) => void)
                    : undefined
                }
                onCancel={onCancel}
              />
            </div>
          </>
        );
      }}
    </TableQuickView>
  );
};

export default withQuickView(observer(CustomRateTableQuickView));
