import React, {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { Button, Layouts, Navigation, NavigationConfigItem } from '@starlightpro/shared-components';
import { getIn, useFormik } from 'formik';
import { isEmpty, noop } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { Typography } from '@root/common';
import { Divider, TablePageContainer } from '@root/common/TableTools';
import { UnsavedChangesModal } from '@root/common/TableTools/TableQuickView/UnsavedChanges/UnsavedChangesModal';
import { FormContainer } from '@root/components';
import { RatesHistoryModal } from '@root/components/modals';
import { BillableItemActionEnum, BillingCycleEnum } from '@root/consts';
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
import { RatesEntityType } from '@root/modules/pricing/const';
import {
  LineItemForm,
  RecurringLineItemForm,
  RecurringServiceForm,
  ServiceForm,
  SurchargeForm,
  ThresholdForm,
} from '@root/modules/pricing/GeneralRate/components/forms';
import {
  getGeneralRateValidationSchema,
  getGeneralRateValues,
} from '@root/modules/pricing/GeneralRate/components/forms/formikData';
import { GeneralRateType } from '@root/modules/pricing/GeneralRate/components/forms/types';
import {
  ILineItemGeneralRate,
  IRecurringLineItemGeneralRate,
  IRecurringServiceGeneralRate,
  IServiceGeneralRate,
  ISurchargeGeneralRate,
  IThresholdGeneralRate,
} from '@root/modules/pricing/GeneralRate/types';
import { useNavigation } from '@root/modules/pricing/navigation';
import { IRatesHistoryRequest } from '@root/modules/pricing/types';
import { ThresholdSettingsType } from '@root/types';

import { IGeneralRatePayload } from '../../api/types';

import { IRecurringServiceForm } from '../forms/RecurringService/types';
import { IServiceForm } from '../forms/Service/types';
import { ILineItemForm, IRecurringLineItemForm } from '../forms/LineItem/types';
import { IThresholdForm } from '../forms/Threshold/types';
import { ISurchargeForm } from '../forms/Surcharge/types';
import { BillableService } from '../../../../../stores/entities';
import { useRatesConfirmModal } from './hooks';

const I18N_PATH = 'modules.pricing.GeneralRate.components.GeneralRackRateTable.Text.';
interface IRatesEntityTypeForm {
  oneTimeService: React.FC<IServiceForm>;
  recurringService: React.FC<IRecurringServiceForm>;
  oneTimeLineItem: React.FC<ILineItemForm>;
  recurringLineItem: React.FC<IRecurringLineItemForm>;
  threshold: React.FC<IThresholdForm>;
  surcharge: React.FC<ISurchargeForm>;
}

const forms: IRatesEntityTypeForm = {
  oneTimeService: ServiceForm,
  recurringService: RecurringServiceForm,
  oneTimeLineItem: LineItemForm,
  recurringLineItem: RecurringLineItemForm,
  threshold: ThresholdForm,
  surcharge: SurchargeForm,
};

const GeneralRackRatesTable: React.FC = () => {
  const {
    generalRateStoreNew,
    materialStore,
    equipmentItemStore,
    billableServiceStore,
    businessLineStore,
    lineItemStore,
    thresholdStore,
    surchargeStore,
    businessUnitStore,
    // customRateStoreNew,
    priceGroupStoreNew,
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
    NavigationConfigItem | undefined
  >();
  const [currentEquipmentItemsNavigation, setEquipmentItemNavigation] = useState<
    NavigationConfigItem | undefined
  >();
  const [currentThresholdOption, setThresholdOption] = useState<number>();
  const [thresholdSetting, setThresholdSetting] = useState<ThresholdSettingsType | undefined>(
    undefined,
  );
  const [isSettingConfirmOpen, openSettingConfirm, closeSettingConfirm] = useBoolean();

  const initialThresholdSetting = useRef<ThresholdSettingsType | undefined>();
  const thresholdSettingDirty = initialThresholdSetting.current !== thresholdSetting;
  const ratesHistoryLoading = priceGroupStoreNew.loading;

  useCleanup(materialStore);
  useCleanup(equipmentItemStore);
  useCleanup(thresholdStore);
  useCleanup(billableServiceStore);
  useCleanup(lineItemStore);

  const [initialValues, setInitialValues] = useState<IGeneralRatePayload | undefined>();

  const [isRatesHistoryModalOpen, openRatesHistoryModal, closeRatesHistoryModal] = useBoolean();
  const [modalSubtitle, setModalSubtitle] = useState<string>();

  const [canViewPrices] = useCrudPermissions('configuration/price-groups', 'price-groups');
  const [canViewBillableItems] = useCrudPermissions('configuration', 'billable-items');
  const [canViewEquipment] = useCrudPermissions('configuration', 'equipment');
  const [canViewMaterials] = useCrudPermissions('configuration', 'materials');

  const generalRateServices: IServiceGeneralRate[] = billableServiceStore.sortedValues
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
    .filter(
      billableService =>
        billableService.oneTime &&
        billableService.equipmentItem &&
        billableService.equipmentItem.id.toString() === currentEquipmentItemsNavigation?.key,
    )

    .map(billableService => {
      const service = generalRateStoreNew.getOneTimeServiceByBillableServiceId(billableService.id);

      return {
        businessUnitId,
        businessLineId,
        billableServiceId: billableService.id,
        equipmentItemId: billableService.equipmentItem!.id,
        materialId: currentMaterialNavigation?.key ? +currentMaterialNavigation.key : null,
        price: service?.price ?? null,
        id: service?.id,
      };
    });

  const generalRateLineItems: ILineItemGeneralRate[] = lineItemStore.sortedValues
    .filter(lineItem => lineItem.oneTime)
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
      const generalLineItem = generalRateStoreNew.rates.oneTimeLineItem?.find(
        generalLineItemData => generalLineItemData.billableLineItemId === lineItem.id,
      );

      const material = materialStore.sortedValues.find(
        materialData => materialData.id.toString() === currentMaterialNavigation?.key,
      );

      return {
        businessUnitId,
        businessLineId,
        billableLineItemId: lineItem.id,
        materialId: lineItem.materialBasedPricing ? material?.id ?? null : null,
        price: generalLineItem?.price ?? null,
        id: generalLineItem?.id,
      };
    });

  const generalRateSurcharges: ISurchargeGeneralRate[] = surchargeStore.sortedValues
    .filter(surcharge =>
      currentMaterialNavigation?.key === null
        ? !surcharge.materialBasedPricing
        : surcharge.materialBasedPricing,
    )
    .map(surcharge => {
      const generalSurcharge = generalRateStoreNew.rates.surcharge?.find(
        generalSurchargeData => generalSurchargeData.surchargeId === surcharge.id,
      );

      const material = materialStore.sortedValues.find(
        materialData => materialData.id.toString() === currentMaterialNavigation?.key,
      );

      return {
        businessUnitId,
        businessLineId,
        surchargeId: surcharge.id,
        materialId: surcharge.materialBasedPricing ? material?.id ?? null : null,
        price: generalSurcharge?.price ?? null,
        id: generalSurcharge?.id,
      };
    });

  const generalRateRecurringServices: IRecurringServiceGeneralRate[] = useMemo(
    () =>
      initialValues?.recurringService
        ? initialValues.recurringService
        : billableServiceStore.sortedValues
            .filter(
              (billableService: BillableService) =>
                !billableService.oneTime &&
                (currentMaterialNavigation?.key === null
                  ? !billableService.materialBasedPricing
                  : billableService.materialBasedPricing) &&
                billableService.equipmentItem &&
                billableService.equipmentItem.id.toString() ===
                  currentEquipmentItemsNavigation?.key,
            )
            .flatMap(billableService => {
              const service = generalRateStoreNew.getRecurrentServiceByBillableServiceId(
                billableService.id,
              );
              const material = materialStore.sortedValues.find(
                materialData => materialData.id.toString() === currentMaterialNavigation?.key,
              );

              return (
                billableService.billingCycles?.map(billingCycle => {
                  return {
                    businessUnitId,
                    businessLineId,
                    billableServiceId: billableService.id,
                    equipmentItemId: billableService.equipmentItem!.id,
                    materialId: material?.id ?? null,
                    price: service?.price ?? null,
                    id: service?.id,
                    action: billableService.action,
                    frequencyId: undefined,
                    billingCycle,
                  };
                }) ?? []
              );
            }),
    [
      initialValues?.recurringService,
      billableServiceStore.sortedValues,
      currentMaterialNavigation?.key,
      currentEquipmentItemsNavigation?.key,
      generalRateStoreNew,
      materialStore.sortedValues,
      businessUnitId,
      businessLineId,
    ],
  );

  const generalRateRecurringLineItems: IRecurringLineItemGeneralRate[] = useMemo(
    () =>
      lineItemStore.sortedValues
        .filter(lineItem => !lineItem.oneTime)
        .map(lineItem => {
          const generalLineItem = generalRateStoreNew.rates.recurringLineItem?.find(
            generalLineItemData => generalLineItemData.billableLineItemId === lineItem.id,
          );

          return {
            businessUnitId,
            businessLineId,
            billableLineItemId: lineItem.id,
            price: generalLineItem?.price ?? null,
            billingCycle: generalLineItem?.billingCycle ?? BillingCycleEnum.daily,
            id: generalLineItem?.id,
          };
        }),
    [
      businessLineId,
      businessUnitId,
      generalRateStoreNew.rates.recurringLineItem,
      lineItemStore.sortedValues,
    ],
  );

  const generalRateThresholds: IThresholdGeneralRate[] = thresholdStore.sortedValues
    .filter(threshold => threshold.id === currentThresholdOption)
    .map(threshold => {
      const generalThreshold = generalRateStoreNew.rates.threshold?.find(
        generalThresholdData => generalThresholdData.thresholdId === threshold.id,
      );
      const equipmentItem = equipmentItemStore.sortedValues.find(
        equipmentItemData =>
          equipmentItemData.id.toString() === currentEquipmentItemsNavigation?.key,
      );
      const material = materialStore.sortedValues.find(
        materialData => materialData.id.toString() === currentMaterialNavigation?.key,
      );

      return {
        businessUnitId,
        businessLineId,
        thresholdId: threshold.id,
        equipmentItemId: equipmentItem?.id,
        materialId: material?.id ?? null,
        price: generalThreshold?.price ?? null,
        limit: generalThreshold?.limit,
        id: generalThreshold?.id,
      };
    });

  const [currentTab, setCurrentTab] = useState<NavigationConfigItem<RatesEntityType>>(navItems[0]);

  useEffect(() => {
    if (currentThresholdOption && !thresholdSetting && canViewPrices) {
      (async () => {
        let setting: ThresholdSettingsType | undefined = (
          await generalRateStoreNew.requestThresholdSetting({
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
    generalRateStoreNew,
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
      case RatesEntityType.oneTimeService:
        billableServiceStore.request({ businessLineId, oneTime: true });
        break;
      case RatesEntityType.recurringService:
        billableServiceStore.request({ businessLineId, oneTime: false, populateIncluded: true });
        break;
      case RatesEntityType.oneTimeLineItem:
        lineItemStore.request({ businessLineId, oneTime: true });
        break;
      case RatesEntityType.recurringLineItem:
        lineItemStore.request({ businessLineId, oneTime: false });
        break;
      case RatesEntityType.threshold:
        thresholdStore.request({ businessLineId });
        break;
      case RatesEntityType.surcharge:
        surchargeStore.request({ businessLineId });
        break;
      default:
        break;
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
    (tab: RatesEntityType) => {
      if (!canViewPrices || !canViewMaterials || !canViewEquipment || !canViewBillableItems) {
        NotificationHelper.error('default', ActionCode.ACCESS_DENIED);

        return;
      }

      switch (tab) {
        case RatesEntityType.oneTimeLineItem:
          return generalRateLineItems;
        case RatesEntityType.recurringLineItem:
          return generalRateRecurringLineItems;
        case RatesEntityType.oneTimeService:
          return generalRateServices;
        case RatesEntityType.recurringService:
          return generalRateRecurringServices;
        case RatesEntityType.threshold:
          return generalRateThresholds;
        case RatesEntityType.surcharge:
          return generalRateSurcharges;
        default:
          return null;
      }
    },
    [
      canViewPrices,
      canViewMaterials,
      canViewEquipment,
      canViewBillableItems,
      generalRateLineItems,
      generalRateRecurringLineItems,
      generalRateServices,
      generalRateRecurringServices,
      generalRateThresholds,
      generalRateSurcharges,
    ],
  );

  const formik = useFormik({
    validationSchema: getGeneralRateValidationSchema(
      currentTab.key,
      isRecyclingLoB,
      thresholdStore.getById(currentThresholdOption)?.type,
    ),
    enableReinitialize: true,
    validateOnChange: false,
    validateOnBlur: false,
    initialValues: getGeneralRateValues(
      currentTab.key,
      getFormikInitialValues(currentTab.key) as GeneralRateType[] | undefined,
    ),
    onSubmit: noop,
  });

  const { validateForm, values, dirty, touched, setFieldError, errors, isValidating } = formik;

  useScrollOnError(errors, !isValidating);

  const onTabChange = useCallback((tab: NavigationConfigItem<RatesEntityType>) => {
    setCurrentTab(tab);
    if (tab.key !== RatesEntityType.threshold) {
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
    (items: GeneralRateType[], initialItems: Partial<GeneralRateType>[], prop: RatesEntityType) => {
      const invalidItemsIndexes = items
        .map((item, index) =>
          !item?.price &&
          Number(item?.price) !== 0 &&
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

  // const validateRateRecurringLineItems = useCallback(
  //   (
  //     items: IRecurringLineItemGeneralRate[],
  //     initialItems: Partial<IRecurringLineItemGeneralRate>[],
  //     prop: RatesEntityType,
  //   ) => {
  //     const invalidRecurringLineItems = items
  //       .map((item, index) => {
  //         if (
  //           !item?.price &&
  //           item?.price !== 0 &&
  //           (initialItems?.[index]?.price || '') !== (item?.price || '')
  //             ? index
  //             : 0
  //         ) {
  //           return { lineItemIndex: index };
  //         }

  //         const invalidBillingCyclesRateIndexes = item.billingCycles
  //           ?.map((billingCycle, billingCycleIndex) => {
  //             return !billingCycle?.price &&
  //               (initialItems?.[index]?.billingCycles?.[billingCycleIndex]?.price || '') !==
  //                 (item?.price || '')
  //               ? billingCycleIndex
  //               : -1;
  //           })
  //           .filter((index) => index !== -1);

  //         const lineItemIndex =
  //           (!item?.price && (initialItems?.[index]?.price || '') !== (item?.price || '')) ||
  //           invalidBillingCyclesRateIndexes?.length
  //             ? index
  //             : -1;

  //         return { lineItemIndex, invalidBillingCyclesRateIndexes };
  //       })
  //       .filter(({ lineItemIndex }) => lineItemIndex !== -1);

  //     if (invalidRecurringLineItems.length > 0) {
  //       invalidRecurringLineItems.forEach(({ lineItemIndex, invalidBillingCyclesRateIndexes }) => {
  //         if (invalidBillingCyclesRateIndexes?.length) {
  //           invalidBillingCyclesRateIndexes?.forEach((billingCycleIndex) => {
  //             setFieldError(
  //               `${prop}[${lineItemIndex}].billingCycles[${billingCycleIndex}].price`,
  //               'Price is required',
  //             );
  //           });
  //         } else {
  //           setFieldError(`${prop}[${lineItemIndex}].price`, 'Price is required');
  //         }
  //       });

  //       return false;
  //     }

  //     return true;
  //   },
  //   [setFieldError],
  // );

  // const validateRateRecurringServices = useCallback(
  //   (
  //     items: IRecurringServiceGeneralRate[],
  //     initialItems: Partial<IRecurringServiceGeneralRate>[],
  //     prop: RatesEntityType,
  //   ) => {
  //     const invalidRecurringServices = items
  //       .map((item, index) => {
  //         if (
  //           !item?.price && (initialItems?.[index]?.price || '') !== (item?.price || '') ? index : 0
  //         ) {
  //           return { serviceIndex: index };
  //         }

  //         const invalidFrequenciesRateIndexes = item.frequencies
  //           ?.map((frequency, frequencyIndex) => {
  //             return !frequency?.price &&
  //               (initialItems?.[index]?.frequencies?.[frequencyIndex]?.price || '') !==
  //                 (item?.price || '')
  //               ? frequencyIndex
  //               : -1;
  //           })
  //           .filter((index) => index !== -1);

  //         const serviceIndex =
  //           (!item?.price && (initialItems?.[index]?.price || '') !== (item?.price || '')) ||
  //           invalidFrequenciesRateIndexes?.length
  //             ? index
  //             : -1;

  //         return { serviceIndex, invalidFrequenciesRateIndexes };
  //       })
  //       .filter(({ serviceIndex }) => serviceIndex !== -1);

  //     if (invalidRecurringServices.length > 0) {
  //       invalidRecurringServices.forEach(({ serviceIndex, invalidFrequenciesRateIndexes }) => {
  //         if (invalidFrequenciesRateIndexes?.length) {
  //           invalidFrequenciesRateIndexes?.forEach((frequencyIndex) => {
  //             setFieldError(
  //               `${prop}[${serviceIndex}].frequencies[${frequencyIndex}].price`,
  //               'Price is required',
  //             );
  //           });
  //         } else {
  //           setFieldError(`${prop}[${serviceIndex}].price`, 'Price is required');
  //         }
  //       });

  //       return false;
  //     }

  //     return true;
  //   },
  //   [setFieldError],
  // );

  const handleSettingConfirmCancel = useCallback(() => {
    closeSettingConfirm();
    generalRateStoreNew.unSelectEntity();
    generalRateStoreNew.toggleQuickView(false);
  }, [closeSettingConfirm, generalRateStoreNew]);

  const updateServices = useCallback(
    async (services: IServiceGeneralRate[]) => {
      if (validateRateItems(services, generalRateServices, RatesEntityType.oneTimeService)) {
        const validServiceItems = services.filter(
          (service, index) =>
            (service?.price || Number(service?.price) === 0) &&
            !!getIn(touched, `oneTimeService[${index}].price`),
        );

        if (validServiceItems.length > 0) {
          await generalRateStoreNew.update({
            oneTimeService: validServiceItems,
            businessLineId,
            businessUnitId,
          });
        }

        return true;
      }

      return false;
    },
    [
      validateRateItems,
      generalRateServices,
      touched,
      generalRateStoreNew,
      businessLineId,
      businessUnitId,
    ],
  );

  // const updateRecurringServices = useCallback(
  //   async (services: IRecurringServiceGeneralRate[]) => {
  //     // if (
  //     //   validateRateRecurringServices(
  //     //     services,
  //     //     generalRateRecurringServices,
  //     //     RatesEntityType.recurringServices,
  //     //   )
  //     // ) {
  //     const validServiceItems = services.filter((service, index) => {
  //       const frequenciesTouched = getIn(touched, `recurringService[${index}].frequencies`);

  //       service.frequencyId = service?.frequencies?.filter((frequency, frequencyIndex) => {
  //         return frequency?.price && frequenciesTouched?.[frequencyIndex]?.price;
  //       });

  //       return service.frequencies?.length;
  //     });

  //     if (validServiceItems.length > 0) {
  //       await generalRateStoreNew.update({
  //         recurringServices: validServiceItems,
  //         businessUnitId,
  //         businessLineId,
  //       });
  //     }

  //     const purgedServices = services.map((serviceItem) => ({
  //       ...serviceItem,
  //       frequencies: undefined,
  //     }));

  //     setFieldValue('recurringServices', purgedServices);

  //     return true;
  //     // }

  //     // return false;
  //   },
  //   [
  //     touched,
  //     validateRateRecurringServices,
  //     generalRateRecurringServices,
  //     setFieldValue,
  //     generalRateStoreNew,
  //     businessUnitId,
  //     businessLineId,
  //   ],
  // );

  const updateLineItems = useCallback(
    async (lineItems: ILineItemGeneralRate[]) => {
      if (validateRateItems(lineItems, generalRateLineItems, RatesEntityType.oneTimeLineItem)) {
        const validLineItems = lineItems.filter(
          (lineItem, index) =>
            (lineItem?.price || Number(lineItem?.price) === 0) &&
            getIn(touched, `oneTimeLineItem[${index}].price`),
        );

        if (validLineItems.length > 0) {
          await generalRateStoreNew.update({
            oneTimeLineItem: validLineItems,
            businessLineId,
            businessUnitId,
          });
        }

        return true;
      }

      return false;
    },
    [
      validateRateItems,
      generalRateLineItems,
      touched,
      generalRateStoreNew,
      businessLineId,
      businessUnitId,
    ],
  );

  const updateSurcharges = useCallback(
    async (surcharges: ISurchargeGeneralRate[]) => {
      if (validateRateItems(surcharges, generalRateSurcharges, RatesEntityType.surcharge)) {
        const validSurcharges = surcharges.filter(
          (surcharge, index) =>
            (surcharge?.price || Number(surcharge?.price) === 0) &&
            getIn(touched, `surcharge[${index}].price`),
        );

        if (validSurcharges.length > 0) {
          await generalRateStoreNew.update({
            surcharge: validSurcharges,
            businessLineId,
            businessUnitId,
          });
        }

        return true;
      }

      return false;
    },
    [
      validateRateItems,
      generalRateSurcharges,
      touched,
      generalRateStoreNew,
      businessLineId,
      businessUnitId,
    ],
  );

  // const updateRecurringLineItems = useCallback(
  //   async (lineItems: IRecurringLineItemGeneralRate[]) => {
  //     const recurringLineItemsTouched = (touched as FormikTouched<
  //       Record<string, IRecurringLineItemGeneralRate[]>
  //     >)?.recurringLineItems;

  //     if (
  //       validateRateRecurringLineItems(
  //         lineItems,
  //         generalRateRecurringLineItems,
  //         RatesEntityType.recurringLineItem,
  //       )
  //     ) {
  //       const validLineItems = lineItems.filter((lineItem, index) => {
  //         const billingCyclesTouched = recurringLineItemsTouched?.[index]?.billingCycles;

  //         lineItem.billingCycles = lineItem?.billingCycles?.filter(
  //           (billingCycle, billingCycleIndex) => {
  //             return billingCycle?.price && billingCyclesTouched?.[billingCycleIndex]?.price;
  //           },
  //         );

  //         return lineItem.billingCycles?.length;
  //       });

  //       if (validLineItems.length > 0) {
  //         await generalRateStoreNew.update({
  //           recurringLineItems: validLineItems,
  //           businessUnitId,
  //           businessLineId,
  //         });
  //         await generalRateStoreNew.request({
  //           entityType: RatesEntityType.recurringLineItem,
  //           businessLineId,
  //           businessUnitId,
  //         });
  //       }

  //       return true;
  //     }

  //     return false;
  //   },
  //   [
  //     validateRateRecurringLineItems,
  //     businessUnitId,
  //     businessLineId,
  //     generalRateRecurringLineItems,
  //     touched,
  //     generalRateStoreNew,
  //   ],
  // );

  const updateThresholds = useCallback(
    async (thresholds: IThresholdGeneralRate[]) => {
      if (validateRateItems(thresholds, generalRateThresholds, RatesEntityType.threshold)) {
        const validThresholdItems = thresholds.filter(
          (threshold, index) =>
            (threshold?.price || Number(threshold?.price) === 0) &&
            (getIn(touched, `threshold[${index}].price`) ||
              getIn(touched, `threshold[${index}].limit`)),
        );

        if (validThresholdItems.length > 0) {
          await generalRateStoreNew.update({
            threshold: validThresholdItems,
            businessUnitId,
            businessLineId,
          });
        }
        if (currentThresholdOption && thresholdSetting) {
          generalRateStoreNew.updateThresholdSetting({
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
      generalRateThresholds,
      currentThresholdOption,
      thresholdSetting,
      generalRateStoreNew,
      businessLineId,
      businessUnitId,
    ],
  );

  const handleGeneralRateChange = useCallback(
    async (closeConfirmModal?: () => void) => {
      const formErrors = await validateForm();

      if (!isEmpty(formErrors)) {
        closeConfirmModal?.();

        return;
      }

      const updateRates: Record<RatesEntityType, () => Promise<boolean>> = {
        oneTimeService: () =>
          updateServices(getIn(values, 'oneTimeService') as IServiceGeneralRate[]),
        recurringService: () =>
          updateServices(getIn(values, 'oneTimeService') as IServiceGeneralRate[]),
        oneTimeLineItem: () =>
          updateLineItems(getIn(values, 'oneTimeLineItem') as ILineItemGeneralRate[]),
        recurringLineItem: () =>
          updateLineItems(getIn(values, 'oneTimeLineItem') as ILineItemGeneralRate[]),
        threshold: () => updateThresholds(getIn(values, 'threshold') as IThresholdGeneralRate[]),
        surcharge: () => updateSurcharges(getIn(values, 'surcharge') as ISurchargeGeneralRate[]),
      };

      return updateRates[currentTab.key]();
    },
    [
      validateForm,
      currentTab.key,
      updateServices,
      values,
      updateLineItems,
      updateThresholds,
      updateSurcharges,
    ],
  );

  const handleModalSaveChanges = useCallback(async () => {
    const isSuccessful = await handleGeneralRateChange(closeModal);

    closeModal();
    if (isSuccessful) {
      handleModalCancel();
    }
  }, [closeModal, handleGeneralRateChange, handleModalCancel]);

  const handleSilentSaveChanges = useCallback(
    async (onCancel?: (showModal?: boolean) => void, closeModalFunc?: () => void) => {
      const isSuccessful = await handleGeneralRateChange(closeModalFunc);

      closeModalFunc?.();
      if (isSuccessful) {
        onCancel?.(false);
      }
    },
    [handleGeneralRateChange],
  );

  const handleSaveChanges = useCallback(async () => {
    if (thresholdSettingDirty) {
      openSettingConfirm();
    } else {
      await handleSilentSaveChanges();

      // if initial form values are different from current form values
      // "dirty" will be set as true
      // after success change we need "dirty" to be "false" due to value updated on server
      formik.initialValues = { ...formik.initialValues, ...values };
      setKey(v => !v);
    }
  }, [formik, handleSilentSaveChanges, openSettingConfirm, thresholdSettingDirty, values]);

  const handleShowHistory = useCallback(
    (ratesHistoryParams: IRatesHistoryRequest, subTitle: string) => {
      if (ratesHistoryLoading) {
        return;
      }
      // await priceGroupStoreNew.requestRatesHistory(ratesHistoryParams);
      setModalSubtitle(subTitle);
      openRatesHistoryModal();
    },
    [openRatesHistoryModal, ratesHistoryLoading],
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
        <Typography variant="headerTwo" fontWeight="bold">
          {t(`${I18N_PATH}GeneralRackRates`)}
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
            currentEquipmentItemNavigation={
              currentEquipmentItemsNavigation as NavigationConfigItem<string>
            }
            currentMaterialNavigation={currentMaterialNavigation}
            currentThresholdOption={currentThresholdOption}
            setInitialValues={
              setInitialValues as Dispatch<
                SetStateAction<Record<string, GeneralRateType[]> | undefined>
              >
            }
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
