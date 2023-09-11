import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { Button, Layouts, Navigation, NavigationConfigItem } from '@starlightpro/shared-components';
import { FormikTouched, useFormik } from 'formik';
import { isEmpty, noop } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { IRatesHistoryRequest } from '@root/api/priceGroup/types';
import { Typography } from '@root/common';
import { Divider, TablePageContainer } from '@root/common/TableTools';
import { UnsavedChangesModal } from '@root/common/TableTools/TableQuickView/UnsavedChanges/UnsavedChangesModal';
import { FormContainer } from '@root/components';
import {
  LineItemForm,
  RecurringLineItemForm,
  RecurringServiceForm,
  ServiceForm,
  SurchargeForm,
  ThresholdForm,
} from '@root/components/forms/Rates/Global';
import {
  getGlobalRateValidationSchema,
  getGlobalRateValues,
} from '@root/components/forms/Rates/Global/formikData';
import { GlobalRateType, GlobalRateTypeForm } from '@root/components/forms/Rates/Global/types';
import { useNavigation } from '@root/components/forms/Rates/hooks';
import { RatesConfigType } from '@root/components/forms/Rates/types';
import { RatesHistoryModal } from '@root/components/modals';
import { BillableItemActionEnum, NONE_MATERIAL_KEY } from '@root/consts';
import { NotificationHelper } from '@root/helpers';
import { ActionCode } from '@root/helpers/notifications/types';
import {
  useBoolean,
  useBusinessContext,
  useCleanup,
  useCrudPermissions,
  useScrollOnError,
  useStores,
} from '@root/hooks';
import {
  IFrequency,
  IGlobalRateLineItem,
  IGlobalRateLineItemForm,
  IGlobalRateRecurringLineItem,
  IGlobalRateRecurringLineItemForm,
  IGlobalRateRecurringService,
  IGlobalRateRecurringServiceForm,
  IGlobalRateService,
  IGlobalRateServiceForm,
  IGlobalRateSurcharge,
  IGlobalRateSurchargeForm,
  IGlobalRateThreshold,
  IGlobalRateThresholdForm,
  ThresholdSettingsType,
} from '@root/types';

import { useRatesConfirmModal } from './hooks';

const forms = {
  services: ServiceForm,
  recurringServices: RecurringServiceForm,
  lineItems: LineItemForm,
  recurringLineItems: RecurringLineItemForm,
  thresholds: ThresholdForm,
  surcharges: SurchargeForm,
};

const GeneralRackRatesTable: React.FC = () => {
  const {
    globalRateStore,
    priceGroupStore,
    materialStore,
    equipmentItemStore,
    billableServiceStore,
    businessLineStore,
    lineItemStore,
    thresholdStore,
    surchargeStore,
    businessUnitStore,
  } = useStores();
  const { t } = useTranslation();

  const { businessLineId, businessUnitId } = useBusinessContext();

  const currentBusinessUnit = businessUnitStore.getById(businessUnitId);

  const isRollOff = businessLineStore.isRollOffType(businessLineId);
  const isRecyclingLoB = businessLineStore.isRecyclingType(businessLineId);

  // initial form values require custom logic to be set
  // to properly reset values after submit and reset "dirty" when values updated
  // and force FormContainer accept new initial values this key is used
  // by toggling this key component will be re rendered
  const [key, setKey] = useState<boolean>(false);

  const navItems = useNavigation(currentBusinessUnit, isRollOff);

  const [currentMaterialNavigation, setMaterialNavigation] = useState<
    NavigationConfigItem<string> | undefined
  >();
  const [currentEquipmentItemsNavigation, setEquipmentItemNavigation] = useState<
    NavigationConfigItem<string> | undefined
  >();
  const [currentThresholdOption, setThresholdOption] = useState<number>();
  const [thresholdSetting, setThresholdSetting] = useState<ThresholdSettingsType | undefined>(
    undefined,
  );
  const [isSettingConfirmOpen, openSettingConfirm, closeSettingConfirm] = useBoolean();

  const initialThresholdSetting = useRef<ThresholdSettingsType | undefined>();
  const thresholdSettingDirty = initialThresholdSetting.current !== thresholdSetting;
  const ratesHistoryLoading = priceGroupStore.historyLoading;

  useCleanup(materialStore);
  useCleanup(equipmentItemStore);

  useCleanup(thresholdStore);
  useCleanup(billableServiceStore);
  useCleanup(lineItemStore);

  const [initialValues, setInitialValues] = useState<Record<string, GlobalRateType[]>>();

  const [isRatesHistoryModalOpen, openRatesHistoryModal, closeRatesHistoryModal] = useBoolean();
  const [modalSubtitle, setModalSubtitle] = useState<string>();

  const [canViewPrices] = useCrudPermissions('configuration/price-groups', 'price-groups');
  const [canViewBillableItems] = useCrudPermissions('configuration', 'billable-items');
  const [canViewEquipment] = useCrudPermissions('configuration', 'equipment');
  const [canViewMaterials] = useCrudPermissions('configuration', 'materials');

  const globalRateServices: IGlobalRateServiceForm[] = billableServiceStore.sortedValues
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
        billableService.equipmentItem?.id.toString() === currentEquipmentItemsNavigation?.key,
    )
    .map(billableService => {
      const service = globalRateStore.services.find(
        serviceElement => serviceElement.billableServiceId === billableService.id,
      );
      const equipmentItem = equipmentItemStore.sortedValues.find(
        equipmentItemElement =>
          equipmentItemElement.id.toString() === currentEquipmentItemsNavigation?.key,
      );
      const material = materialStore.sortedValues.find(
        materialElement => materialElement.id.toString() === currentMaterialNavigation?.key,
      );

      return {
        businessUnitId,
        businessLineId,
        billableServiceId: billableService.id,
        equipmentItemId: equipmentItem?.id,
        materialId: material?.id,
        price: service?.price?.toFixed(2),
        updatedAt: service?.updatedAt,
        id: service?.id,
      };
    });

  const globalRateLineItems: IGlobalRateLineItemForm[] = lineItemStore.sortedValues
    .filter(lineItem => lineItem.oneTime)
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

      const material = lineItem.materialBasedPricing
        ? materialStore.sortedValues.find(
            materialElement => materialElement.id.toString() === currentMaterialNavigation?.key,
          )
        : undefined;

      return {
        businessUnitId,
        businessLineId,
        lineItemId: lineItem.id,
        materialId: material?.id,
        price: globalLineItem?.price?.toFixed(2),
        updatedAt: globalLineItem?.updatedAt,
        id: globalLineItem?.id,
      };
    });

  const globalRateSurcharges: IGlobalRateSurchargeForm[] = surchargeStore.sortedValues
    .filter(surcharge =>
      currentMaterialNavigation?.key === NONE_MATERIAL_KEY
        ? !surcharge.materialBasedPricing
        : surcharge.materialBasedPricing,
    )
    .map(surcharge => {
      const globalSurcharge = globalRateStore.surcharges.find(
        globalSurchargeElement => globalSurchargeElement.surchargeId === surcharge.id,
      );

      const material = surcharge.materialBasedPricing
        ? materialStore.sortedValues.find(
            materialElement => materialElement.id.toString() === currentMaterialNavigation?.key,
          )
        : undefined;

      return {
        businessUnitId,
        businessLineId,
        surchargeId: surcharge.id,
        materialId: material?.id,
        price: globalSurcharge?.price?.toFixed(2),
        updatedAt: globalSurcharge?.updatedAt,
        id: globalSurcharge?.id,
      };
    });

  const hasStaleRecurringServiceRates = (
    initialValues?.recurringServices as IGlobalRateRecurringService[]
  )?.some(
    ({ equipmentItemId, materialId }) =>
      equipmentItemId?.toString() !== currentEquipmentItemsNavigation?.key ||
      (currentMaterialNavigation?.key === NONE_MATERIAL_KEY
        ? materialId
        : materialId != currentMaterialNavigation?.key),
  );

  const globalRateRecurringServices: IGlobalRateRecurringServiceForm[] = useMemo(
    () =>
      initialValues?.recurringServices && !hasStaleRecurringServiceRates
        ? (initialValues.recurringServices as IGlobalRateRecurringServiceForm[])
        : billableServiceStore.sortedValues
            .filter(
              billableService =>
                !billableService.oneTime &&
                (currentMaterialNavigation?.key === NONE_MATERIAL_KEY
                  ? !billableService.materialBasedPricing
                  : billableService.materialBasedPricing) &&
                billableService.equipmentItem?.id.toString() ===
                  currentEquipmentItemsNavigation?.key,
            )
            .flatMap(billableService => {
              const service = globalRateStore.recurringServices.find(
                serviceElement => serviceElement.billableServiceId === billableService.id,
              );
              const equipmentItem = equipmentItemStore.sortedValues.find(
                equipmentItemElement =>
                  equipmentItemElement.id.toString() === currentEquipmentItemsNavigation?.key,
              );
              const material = materialStore.sortedValues.find(
                materialElement => materialElement.id.toString() === currentMaterialNavigation?.key,
              );

              return (
                billableService.billingCycles?.map(billingCycle => {
                  return {
                    businessUnitId,
                    businessLineId,
                    billableServiceId: billableService.id,
                    equipmentItemId: equipmentItem?.id,
                    materialId: material?.id ?? null,
                    price: service?.price?.toFixed(2),
                    updatedAt: service?.updatedAt,
                    id: service?.id,
                    action: billableService.action,
                    frequencies: undefined,
                    billingCycle,
                  };
                }) ?? []
              );
            }),
    [
      initialValues?.recurringServices,
      hasStaleRecurringServiceRates,
      businessUnitId,
      businessLineId,
      billableServiceStore.sortedValues,
      currentMaterialNavigation?.key,
      currentEquipmentItemsNavigation?.key,
      globalRateStore.recurringServices,
      equipmentItemStore.sortedValues,
      materialStore.sortedValues,
    ],
  );

  const globalRateRecurringLineItems: IGlobalRateRecurringLineItemForm[] = useMemo(
    () =>
      lineItemStore.sortedValues
        .filter(lineItem => !lineItem.oneTime)
        .map(lineItem => {
          const globalLineItem = globalRateStore.recurringLineItems.find(
            globalLineItemElement => globalLineItemElement.lineItemId === lineItem.id,
          ) as IGlobalRateRecurringLineItem;

          const billingCyclesObjArr = lineItem.billingCycles?.map(billingCycle => ({
            billingCycle,
            value: null,
          }));

          return {
            businessUnitId,
            businessLineId,
            lineItemId: lineItem.id,
            price: globalLineItem?.price?.toFixed(2),
            updatedAt: globalLineItem?.updatedAt,
            billingCycles: globalLineItem?.billingCycles || billingCyclesObjArr,
            id: globalLineItem?.id,
          };
        }),
    [
      businessUnitId,
      businessLineId,
      lineItemStore.sortedValues,
      globalRateStore.recurringLineItems,
    ],
  );

  const globalRateThresholds: IGlobalRateThresholdForm[] = thresholdStore.sortedValues
    .filter(threshold => threshold.id === currentThresholdOption)
    .map(threshold => {
      const globalThreshold = globalRateStore.thresholds.find(
        globalThresholdElement => globalThresholdElement.thresholdId === threshold.id,
      );
      const equipmentItem = equipmentItemStore.sortedValues.find(
        equipmentItemElement =>
          equipmentItemElement.id.toString() === currentEquipmentItemsNavigation?.key,
      );
      const material = materialStore.sortedValues.find(
        materialElement => materialElement.id.toString() === currentMaterialNavigation?.key,
      );

      const defaultLimit = isRecyclingLoB ? 1 : undefined;

      return {
        businessUnitId,
        businessLineId,
        thresholdId: threshold.id,
        equipmentItemId: equipmentItem?.id,
        materialId: material?.id,
        price: globalThreshold?.price?.toFixed(2),
        limit: globalThreshold?.limit ?? defaultLimit,
        updatedAt: globalThreshold?.updatedAt as Date,
        id: globalThreshold?.id as number,
      };
    });

  const [currentTab, setCurrentTab] = useState<NavigationConfigItem<RatesConfigType>>(navItems[0]);

  useEffect(() => {
    businessLineStore.request();
  }, [businessLineStore]);

  useEffect(() => {
    if (currentThresholdOption && !thresholdSetting && canViewPrices) {
      (async () => {
        let setting: ThresholdSettingsType | undefined = (
          await globalRateStore.requestThresholdSetting({
            businessLineId,
            businessUnitId,
            thresholdId: currentThresholdOption,
          })
        )?.setting;

        if (!setting) {
          setting = isRecyclingLoB ? 'material' : 'global';
        }

        setThresholdSetting(setting);

        if (!initialThresholdSetting.current) {
          initialThresholdSetting.current = setting;
        }
      })();
    }
  }, [
    isRecyclingLoB,
    businessLineId,
    businessUnitId,
    canViewPrices,
    currentThresholdOption,
    globalRateStore,
    initialThresholdSetting,
    thresholdSetting,
  ]);

  useEffect(() => {
    businessLineStore.request();
  }, [businessLineStore]);

  useEffect(() => {
    if (!canViewMaterials || !canViewEquipment) {
      return;
    }

    materialStore.cleanup();
    equipmentItemStore.cleanup();

    materialStore.request(
      {
        equipmentItems: true,
        businessLineId,
      },
      true,
    );
    equipmentItemStore.request({ businessLineId });
  }, [equipmentItemStore, materialStore, businessLineId, canViewMaterials, canViewEquipment]);

  useEffect(() => {
    if (!canViewBillableItems) {
      return;
    }

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
    billableServiceStore,
    currentTab.key,
    lineItemStore,
    thresholdStore,
    businessLineId,
    surchargeStore,
    canViewBillableItems,
  ]);

  const getFormikInitialValues = useCallback(
    (tab: RatesConfigType) => {
      if (!canViewPrices || !canViewMaterials || !canViewEquipment || !canViewBillableItems) {
        NotificationHelper.error('default', ActionCode.ACCESS_DENIED);

        return;
      }

      switch (tab) {
        case 'lineItems':
          return globalRateLineItems;
        case 'recurringLineItems':
          return globalRateRecurringLineItems;
        case 'services':
          return globalRateServices;
        case 'recurringServices':
          return globalRateRecurringServices;
        case 'thresholds':
          return globalRateThresholds;
        case 'surcharges':
          return globalRateSurcharges;
        default:
          return null;
      }
    },
    [
      canViewPrices,
      canViewMaterials,
      canViewEquipment,
      canViewBillableItems,
      globalRateLineItems,
      globalRateRecurringLineItems,
      globalRateServices,
      globalRateRecurringServices,
      globalRateThresholds,
      globalRateSurcharges,
    ],
  );

  const formik = useFormik({
    validationSchema: getGlobalRateValidationSchema(
      currentTab.key,
      isRecyclingLoB,
      thresholdStore.getById(currentThresholdOption)?.type,
    ),
    enableReinitialize: true,
    validateOnChange: false,
    validateOnBlur: false,
    initialValues: getGlobalRateValues(
      currentTab.key,
      getFormikInitialValues(currentTab.key) as unknown as GlobalRateType[],
    ),
    onSubmit: noop,
  });

  const {
    validateForm,
    values,
    dirty,
    touched,
    setFieldError,
    setFieldValue,
    errors,
    isValidating,
    setValues,
  } = formik;

  useScrollOnError(errors, !isValidating);

  const onTabChange = useCallback((tab: NavigationConfigItem<RatesConfigType>) => {
    setCurrentTab(tab);
    if (tab.key !== 'thresholds') {
      setThresholdOption(undefined);
      initialThresholdSetting.current = undefined;
      setThresholdSetting(undefined);
    }
  }, []);

  const onThresholdOptionChange = useCallback((option?: number) => {
    setThresholdOption(option);
    setThresholdSetting(undefined);
    initialThresholdSetting.current = undefined;
    setMaterialNavigation(undefined);
    setEquipmentItemNavigation(undefined);
  }, []);

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
    initialThresholdSetting.current,
    currentMaterialNavigation,
    currentEquipmentItemsNavigation,
    currentThresholdOption,
    thresholdSetting,
  );

  const validateRateItems = useCallback(
    (
      items: GlobalRateType[],
      initialItems: Partial<GlobalRateTypeForm>[],
      prop: RatesConfigType,
    ) => {
      const invalidItemsIndexes = items
        .map((item, index) =>
          !item?.price &&
          item?.price !== 0 &&
          (initialItems?.[index]?.price || '') !== (item?.price || '')
            ? index
            : -1,
        )
        .filter(index => index !== -1);

      if (invalidItemsIndexes.length > 0) {
        invalidItemsIndexes.forEach(index => {
          setFieldError(`${prop}[${index}].price`, 'Price is required');
        });

        return false;
      }

      return true;
    },
    [setFieldError],
  );

  const validateRateRecurringLineItems = useCallback(
    (
      items: IGlobalRateRecurringLineItem[],
      initialItems: IGlobalRateRecurringLineItemForm[],
      prop: RatesConfigType,
    ) => {
      const invalidRecurringLineItems = items
        .map((item, index) => {
          if (
            !item?.price &&
            item?.price !== 0 &&
            (initialItems?.[index]?.price || '') !== (item?.price || '')
              ? index
              : 0
          ) {
            return { lineItemIndex: index };
          }

          const invalidBillingCyclesRateIndexes = item.billingCycles
            ?.map((billingCycle, billingCycleIndex) => {
              return !billingCycle?.price &&
                Number(billingCycle?.price) < 0 &&
                (initialItems?.[index]?.billingCycles?.[billingCycleIndex]?.price || '') !==
                  (item?.price || '')
                ? billingCycleIndex
                : -1;
            })
            .filter(element => element !== -1);

          const lineItemIndex =
            (!item?.price && (initialItems?.[index]?.price || '') !== (item?.price || '')) ||
            invalidBillingCyclesRateIndexes?.length
              ? index
              : -1;

          return { lineItemIndex, invalidBillingCyclesRateIndexes };
        })
        .filter(({ lineItemIndex }) => lineItemIndex !== -1);

      if (invalidRecurringLineItems.length > 0) {
        invalidRecurringLineItems.forEach(({ lineItemIndex, invalidBillingCyclesRateIndexes }) => {
          if (invalidBillingCyclesRateIndexes?.length) {
            invalidBillingCyclesRateIndexes?.forEach(billingCycleIndex => {
              setFieldError(
                `${prop}[${lineItemIndex}].billingCycles[${billingCycleIndex}].price`,
                'Price is required',
              );
            });
          } else {
            setFieldError(`${prop}[${lineItemIndex}].price`, 'Price is required');
          }
        });

        return false;
      }

      return true;
    },
    [setFieldError],
  );

  const validateRateRecurringServices = useCallback(
    (
      items: IGlobalRateRecurringService[],
      initialItems: IGlobalRateRecurringServiceForm[],
      prop: RatesConfigType,
    ) => {
      const invalidRecurringServices = items
        .map((item, index) => {
          if (
            !item?.price && (initialItems?.[index]?.price || '') !== (item?.price || '') ? index : 0
          ) {
            return { serviceIndex: index };
          }

          const invalidFrequenciesRateIndexes = item.frequencies
            ?.map((frequency, frequencyIndex) => {
              return !frequency?.price &&
                Number(frequency?.price) < 0 &&
                (initialItems?.[index]?.frequencies?.[frequencyIndex]?.price || '') !==
                  (item?.price || '')
                ? frequencyIndex
                : -1;
            })
            .filter(element => element !== -1);

          const serviceIndex =
            (!item?.price && (initialItems?.[index]?.price || '') !== (item?.price || '')) ||
            invalidFrequenciesRateIndexes?.length
              ? index
              : -1;

          return { serviceIndex, invalidFrequenciesRateIndexes };
        })
        .filter(({ serviceIndex }) => serviceIndex !== -1);

      if (invalidRecurringServices.length > 0) {
        invalidRecurringServices.forEach(({ serviceIndex, invalidFrequenciesRateIndexes }) => {
          if (invalidFrequenciesRateIndexes?.length) {
            invalidFrequenciesRateIndexes?.forEach(frequencyIndex => {
              setFieldError(
                `${prop}[${serviceIndex}].frequencies[${frequencyIndex}].price`,
                'Price is required',
              );
            });
          } else {
            setFieldError(`${prop}[${serviceIndex}].price`, 'Price is required');
          }
        });

        return false;
      }

      return true;
    },
    [setFieldError],
  );

  const handleSettingConfirmCancel = useCallback(() => {
    closeSettingConfirm();
    globalRateStore.unSelectEntity();
    globalRateStore.toggleQuickView(false);
  }, [closeSettingConfirm, globalRateStore]);

  const updateServices = useCallback(
    async (services: IGlobalRateService[]) => {
      if (validateRateItems(services, globalRateServices, 'services')) {
        const validServiceItems = services.filter(
          (service, index) =>
            (service?.price || service?.price === 0) && touched?.services?.[index]?.price,
        );

        if (validServiceItems.length > 0) {
          await globalRateStore.updateServices(validServiceItems);
        }

        return true;
      }

      return false;
    },
    [validateRateItems, globalRateServices, touched?.services, globalRateStore],
  );

  const updateRecurringServices = useCallback(
    async (services: IGlobalRateRecurringService[]) => {
      const recurringServiceTouched = touched as FormikTouched<
        Record<string, IGlobalRateRecurringService[]>
      >;

      if (
        validateRateRecurringServices(services, globalRateRecurringServices, 'recurringServices')
      ) {
        const validServiceItems = services.filter((service, index) => {
          const frequenciesTouched = recurringServiceTouched?.recurringServices?.[index]
            ?.frequencies as unknown as Record<string, IFrequency>;

          service.frequencies = service?.frequencies?.filter((frequency, frequencyIndex) => {
            return (
              frequency &&
              Number(frequency.price) >= 0 &&
              frequenciesTouched?.[frequencyIndex]?.price
            );
          });

          return service.frequencies?.length;
        });

        if (validServiceItems.length > 0) {
          await globalRateStore.updateRecurringServices(validServiceItems);
        }

        const purgedServices = services.map(serviceItem => ({
          ...serviceItem,
          frequencies: undefined,
        }));

        setFieldValue('recurringServices', purgedServices);

        return true;
      }

      return false;
    },
    [
      validateRateRecurringServices,
      setFieldValue,
      globalRateRecurringServices,
      touched,
      globalRateStore,
    ],
  );

  const updateLineItems = useCallback(
    async (lineItems: IGlobalRateLineItem[]) => {
      if (validateRateItems(lineItems, globalRateLineItems, 'lineItems')) {
        const validLineItems = lineItems.filter(
          (lineItem, index) =>
            (lineItem?.price || lineItem?.price === 0) && touched?.lineItems?.[index]?.price,
        );

        if (validLineItems.length > 0) {
          await globalRateStore.updateLineItems(validLineItems);
        }

        return true;
      }

      return false;
    },
    [validateRateItems, globalRateLineItems, touched?.lineItems, globalRateStore],
  );

  const updateSurcharges = useCallback(
    async (surcharges: IGlobalRateSurcharge[]) => {
      if (validateRateItems(surcharges, globalRateSurcharges, 'surcharges')) {
        const validSurcharges = surcharges.filter(
          (surcharge, index) =>
            (surcharge?.price || surcharge?.price === 0) && touched?.surcharges?.[index]?.price,
        );

        if (validSurcharges.length > 0) {
          await globalRateStore.updateSurcharges(validSurcharges);
        }

        return true;
      }

      return false;
    },
    [validateRateItems, globalRateSurcharges, touched?.surcharges, globalRateStore],
  );

  const updateRecurringLineItems = useCallback(
    async (lineItems: IGlobalRateRecurringLineItem[]) => {
      const recurringLineItemsTouched = (
        touched as FormikTouched<Record<string, IGlobalRateRecurringLineItem[]>>
      )?.recurringLineItems;

      if (
        validateRateRecurringLineItems(
          lineItems,
          globalRateRecurringLineItems,
          'recurringLineItems',
        )
      ) {
        const validServiceItems = lineItems.filter((lineItem, index) => {
          const billingCyclesTouched = recurringLineItemsTouched?.[index]?.billingCycles;

          lineItem.billingCycles = lineItem?.billingCycles?.filter(
            (billingCycle, billingCycleIndex) => {
              return (
                Number(billingCycle?.price) >= 0 && billingCyclesTouched?.[billingCycleIndex]?.price
              );
            },
          );

          return lineItem.billingCycles?.length;
        });

        if (validServiceItems.length > 0) {
          await globalRateStore.updateRecurringLineItems(validServiceItems);
          await globalRateStore.requestRecurringLineItems({ businessUnitId, businessLineId });
        }

        return true;
      }

      return false;
    },
    [
      validateRateRecurringLineItems,
      businessUnitId,
      businessLineId,
      globalRateRecurringLineItems,
      touched,
      globalRateStore,
    ],
  );

  const updateThresholds = useCallback(
    async (thresholds: IGlobalRateThreshold[]) => {
      const thresholdsTouched = touched as FormikTouched<Record<string, IGlobalRateThreshold[]>>;

      if (validateRateItems(thresholds, globalRateThresholds, 'thresholds')) {
        const validThresholdItems = thresholds.filter(
          (threshold, index) =>
            (threshold?.price || threshold?.price === 0) &&
            (thresholdsTouched?.thresholds?.[index]?.price ||
              thresholdsTouched?.thresholds?.[index]?.limit),
        );

        if (validThresholdItems.length > 0) {
          await globalRateStore.updateThresholds(validThresholdItems);
        }
        if (currentThresholdOption && thresholdSetting) {
          globalRateStore.updateThresholdSetting({
            thresholdId: currentThresholdOption,
            setting: thresholdSetting,
            businessLineId,
            businessUnitId,
          });
        }

        return true;
      }

      return false;
    },
    [
      touched,
      validateRateItems,
      globalRateThresholds,
      currentThresholdOption,
      thresholdSetting,
      globalRateStore,
      businessLineId,
      businessUnitId,
    ],
  );

  const handleGlobalRateChange = useCallback(
    async (closeConfirmModal?: () => void) => {
      const formErrors = await validateForm();

      if (!isEmpty(formErrors)) {
        closeConfirmModal?.();

        return;
      }

      const updateRates = {
        services: () => updateServices(values.services as IGlobalRateService[]),
        recurringServices: () =>
          updateRecurringServices(values.recurringServices as IGlobalRateRecurringService[]),
        lineItems: () => updateLineItems(values.lineItems as IGlobalRateLineItem[]),
        recurringLineItems: () =>
          updateRecurringLineItems(values.recurringLineItems as IGlobalRateRecurringLineItem[]),
        thresholds: () => updateThresholds(values.thresholds as IGlobalRateThreshold[]),
        surcharges: () => updateSurcharges(values.surcharges as IGlobalRateSurcharge[]),
      };

      return updateRates[currentTab.key]();
    },
    [
      validateForm,
      currentTab.key,
      updateServices,
      values.services,
      values.recurringServices,
      values.lineItems,
      values.recurringLineItems,
      values.thresholds,
      values.surcharges,
      updateRecurringServices,
      updateLineItems,
      updateRecurringLineItems,
      updateThresholds,
      updateSurcharges,
    ],
  );

  const handleModalSaveChanges = useCallback(async () => {
    const isSuccessful = await handleGlobalRateChange(closeModal);

    if (!globalRateStore.isPreconditionFailed) {
      closeModal();
      if (isSuccessful) {
        handleModalCancel();
      }
    } else {
      const initialGlobalRateValues = getGlobalRateValues(
        currentTab.key,
        getFormikInitialValues(currentTab.key) as unknown as GlobalRateType[],
      );

      setValues(initialGlobalRateValues);
    }
  }, [
    closeModal,
    handleGlobalRateChange,
    handleModalCancel,
    globalRateStore.isPreconditionFailed,
    currentTab.key,
    getFormikInitialValues,
    setValues,
  ]);

  const handleSilentSaveChanges = useCallback(
    async (onCancel?: (showModal?: boolean) => void, closeModalFunc?: () => void) => {
      const isSuccessful = await handleGlobalRateChange(closeModal);

      if (!globalRateStore.isPreconditionFailed) {
        closeModalFunc?.();
        if (isSuccessful) {
          onCancel?.(false);
        }
      } else {
        const initialGlobalRateValues = getGlobalRateValues(
          currentTab.key,
          getFormikInitialValues(currentTab.key) as GlobalRateType[],
        );

        setValues(initialGlobalRateValues);
      }
    },
    [
      handleGlobalRateChange,
      globalRateStore.isPreconditionFailed,
      currentTab.key,
      getFormikInitialValues,
      setValues,
    ],
  );

  const handleSaveChanges = useCallback(async () => {
    if (thresholdSettingDirty) {
      openSettingConfirm();
    } else {
      const formErrors = await validateForm();

      if (!isEmpty(formErrors)) {
        return;
      }

      await handleSilentSaveChanges();

      // if initial form values are different from current form values
      // "dirty" will be set as true
      // after success change we need "dirty" to be "false" due to value updated on server
      formik.initialValues = { ...formik.initialValues, ...values };

      setKey(v => !v);
    }
  }, [
    formik,
    handleSilentSaveChanges,
    openSettingConfirm,
    thresholdSettingDirty,
    validateForm,
    values,
  ]);

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

  const CurrentForm = forms[currentTab.key];

  return (
    <TablePageContainer>
      <Helmet title={t('Titles.GeneralRackRates')} />
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
        onSubmit={() => handleSilentSaveChanges(handleSettingConfirmCancel, closeSettingConfirm)}
      />
      <RatesHistoryModal
        title={modalSubtitle}
        isOpen={isRatesHistoryModalOpen}
        onClose={closeRatesHistoryModal}
      />

      <Layouts.Padding top="2" bottom="2">
        <Typography as="h1" variant="headerTwo" fontWeight="bold">
          General Rack Rates
        </Typography>
      </Layouts.Padding>
      <Navigation
        activeTab={currentTab}
        configs={navItems}
        onChange={handleTabChange}
        border
        withEmpty
      />
      <Layouts.Scroll overflowY="hidden">
        <FormContainer formik={formik} fullHeight key={String(key)}>
          <CurrentForm
            onEquipmentItemChange={handleEquipmentItemNavigation}
            onMaterialChange={handleMaterialNavigation}
            onThresholdChange={handleThresholdOptionChange}
            onThresholdSettingChange={handleThresholdSettingChange}
            onShowRatesHistory={handleShowHistory}
            currentThresholdSetting={thresholdSetting}
            currentEquipmentItemNavigation={currentEquipmentItemsNavigation}
            currentMaterialNavigation={currentMaterialNavigation}
            currentThresholdOption={currentThresholdOption}
            setInitialValues={setInitialValues}
          />
        </FormContainer>
      </Layouts.Scroll>
      <Layouts.Box minHeight="92px" backgroundColor="white">
        <Divider />
        <Layouts.Padding top="3" left="4" right="4">
          <Layouts.Flex justifyContent="flex-end">
            <Button variant="primary" onClick={handleSaveChanges}>
              {t('Text.SaveChanges')}
            </Button>
          </Layouts.Flex>
        </Layouts.Padding>
      </Layouts.Box>
    </TablePageContainer>
  );
};

export default observer(GeneralRackRatesTable);
