/* eslint-disable complexity */ // disabled because it will need a huge refactor
/* eslint-disable @typescript-eslint/no-shadow */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Autocomplete,
  Banner,
  Calendar,
  Checkbox,
  IAutocompleteConfig,
  ISelectOption,
  ISelectOptionGroup,
  Layouts,
  Select,
  TextInputElement,
} from '@starlightpro/shared-components';
import { isBefore, startOfTomorrow } from 'date-fns';
import { FieldArray, getIn, useFormikContext } from 'formik';
import { find, isEmpty, noop, startCase } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import {
  BillableItemService,
  GlobalService,
  IOrderCustomRatesGroup,
  IOrderRatesCalculateRequest,
  JobSiteService,
  MaterialService,
  OrderService,
} from '@root/api';
import { AssignIcon, DeleteIcon, PlusIcon, ReminderIcon } from '@root/assets';
import {
  AutocompleteTemplates,
  FormInput,
  ReadOnlyFormField,
  Section,
  Subsection,
  Tooltip,
  Typography,
} from '@root/common';
import { OrderTimePicker } from '@root/components';
import { IJobSiteData } from '@root/components/forms/JobSite/types';
import { IContactFormData } from '@root/components/forms/NewContact/types';
import { JobSiteModal, NewContactModal } from '@root/components/modals';
import PurchaseOrderSection from '@root/components/PurchaseOrderSection/PurchaseOrderSection';
import { BillableItemActionEnum, BusinessLineType } from '@root/consts';
import {
  addressFormat,
  getBillableServiceForOptions,
  getGlobalPriceType,
  getMaterialsForOptions,
  getUnitLabel,
  handleEnterOrSpaceKeyDown,
  normalizeOptions,
  NotificationHelper,
} from '@root/helpers';
import { useDateIntl } from '@root/helpers/format/date';
import { ActionCode } from '@root/helpers/notifications/types';
import {
  useBusinessContext,
  useCleanup,
  useCrudPermissions,
  usePermission,
  usePrevious,
  useRecurrentTemplateFrequency,
  useStores,
  useToggle,
  useUserContext,
} from '@root/hooks';
import { useIntl } from '@root/i18n/useIntl';
import {
  isCustomPriceGroup,
  isRecurrentOrder,
  isRegularOrder,
} from '@root/pages/NewRequest/NewRequestForm/guards';
import { sanitizeJobSite } from '@root/stores/jobSite/sanitize';
import { IEntity, IOrderLineItem } from '@root/types';
import { AddressSuggestion } from '@root/types/responseEntities';

import { ApiError } from '@root/api/base/ApiError';
import {
  customFrequencyTypeOptions,
  defaultFinalOrDeliveryOrderValue,
  frequencyTypeOptions,
} from '../../formikData';
import {
  INewRecurrentOrder,
  RecurrentFormBasePath,
  RecurrentFormCustomFrequencyType,
  RecurrentFormFrequencyType,
} from '../../types';

import { getDriverInstructionsTemplate } from '../../../Order/helpers/getDriverInstructions';
import { ContactFieldFooter, WeekPicker } from './components';
import { IOrderSection } from './types';

const jobSiteService = new JobSiteService();
const assignEquipmentItemServiceList = [
  BillableItemActionEnum.switch,
  BillableItemActionEnum.final,
  BillableItemActionEnum.dumpReturn,
  BillableItemActionEnum.relocate,
  BillableItemActionEnum.reposition,
];
const notificationServiceList = [
  BillableItemActionEnum.switch,
  BillableItemActionEnum.final,
  BillableItemActionEnum.dumpReturn,
  BillableItemActionEnum.liveLoad,
];
const disposalSiteList = [
  BillableItemActionEnum.final,
  BillableItemActionEnum.switch,
  BillableItemActionEnum.liveLoad,
  BillableItemActionEnum.dumpReturn,
];
const hasPermits = [BusinessLineType.rollOff, BusinessLineType.portableToilets];
const nonRecurrentOrderTypes = ['delivery', 'final'];

const I18N_PATH = 'pages.NewRequest.NewRequestForm.forms.Order.sections.Order.Text.';

const materialService = new MaterialService();
const billableItemService = new BillableItemService();

const OrderSection: React.FC<IOrderSection> = ({ basePath, serviceAreaId }) => {
  const {
    orderStore,
    materialStore,
    billableServiceStore,
    lineItemStore,
    equipmentItemStore,
    brokerStore,
    disposalSiteStore,
    contactStore,
    customerStore,
    jobSiteStore,
    globalRateStore,
    thirdPartyHaulerStore,
    materialProfileStore,
    permitStore,
    businessLineStore,
    businessUnitStore,
    i18nStore,
  } = useStores();

  const [isNewContactModalOpen, toggleIsNewContactModalOpen] = useToggle();
  const [isJobSiteModalOpen, toggleJobSiteModalOpen] = useToggle();

  const [billableServiceOptions, setBillableServiceOptions] = useState<ISelectOption[]>([]);

  const { businessUnitId } = useBusinessContext();

  const { t } = useTranslation();

  const { currentUser } = useUserContext();

  const recurrentFrequencyText = useRecurrentTemplateFrequency();

  const { formatPhoneNumber, formatCurrency, currencySymbol, firstDayOfWeek } = useIntl();

  const selectedCustomer = customerStore.selectedEntity;
  const selectedJobSite = jobSiteStore.selectedEntity;

  const currentBusinessUnit = useMemo(
    () => businessUnitStore.sortedValues.find(({ id }) => id === Number(businessUnitId)),
    [businessUnitId, businessUnitStore.sortedValues],
  );

  const { values, errors, handleChange, setFieldValue, setFieldError } =
    useFormikContext<INewRecurrentOrder>();

  const { dateFormat } = useDateIntl();

  const [canViewMaterials] = useCrudPermissions('configuration', 'materials');
  const [canViewEquipment] = useCrudPermissions('configuration', 'equipment');
  const [canViewDisposalSites] = useCrudPermissions('configuration', 'disposal-sites');
  const [canViewMaterialProfiles] = useCrudPermissions('configuration', 'material-profiles');
  const [canViewPermits] = useCrudPermissions('configuration', 'permits');
  const [canViewBrokers] = useCrudPermissions('configuration', 'brokers');
  const [canViewHaulers] = useCrudPermissions('configuration', 'third-party-haulers');

  useCleanup(contactStore);

  useEffect(() => {
    (async () => {
      billableServiceStore.cleanup();
      lineItemStore.cleanup();
      permitStore.cleanup();
      materialStore.cleanup();

      orderStore.resetAssignedEquipmentItems();
      orderStore.setAssignEquipmentOptions([]);

      billableServiceStore.request({
        businessLineId: values.businessLineId,
        oneTime: true,
        activeOnly: true,
      });
      lineItemStore.request({
        businessLineId: values.businessLineId,
        oneTime: true,
        activeOnly: true,
      });

      if (canViewEquipment) {
        equipmentItemStore.request({ businessLineId: values.businessLineId, activeOnly: true });
      } else {
        NotificationHelper.error('orderData', ActionCode.ACCESS_DENIED, 'equipment');
      }

      if (canViewBrokers) {
        brokerStore.request({ activeOnly: true });
      } else {
        NotificationHelper.error('orderData', ActionCode.ACCESS_DENIED, 'brokers');
      }

      if (canViewDisposalSites) {
        disposalSiteStore.request({ activeOnly: true });
      } else {
        NotificationHelper.error('orderData', ActionCode.ACCESS_DENIED, 'disposal sites');
      }

      if (canViewHaulers) {
        thirdPartyHaulerStore.request({ activeOnly: true });
      } else {
        NotificationHelper.error('orderData', ActionCode.ACCESS_DENIED, 'haulers');
      }

      if (canViewPermits) {
        permitStore.request({
          businessUnitId,
          businessLineId: values.businessLineId?.toString() ?? undefined,
          activeOnly: true,
          excludeExpired: true,
        });
      } else {
        NotificationHelper.error('orderData', ActionCode.ACCESS_DENIED, 'permits');
      }

      if (canViewMaterialProfiles) {
        materialProfileStore.request({
          activeOnly: true,
          disposals: true,
          businessLineId: values.businessLineId,
        });
      } else {
        NotificationHelper.error('orderData', ActionCode.ACCESS_DENIED, 'material profiles');
      }

      await businessLineStore.request({ activeOnly: true });

      if (canViewMaterials) {
        materialStore.request({
          businessLineId: values.businessLineId,
        });
      } else {
        NotificationHelper.error('orderData', ActionCode.ACCESS_DENIED, 'materials');
      }

      if (selectedCustomer) {
        contactStore.requestByCustomer({ customerId: selectedCustomer.id, activeOnly: true });
      }
    })();
  }, [
    orderStore,
    billableServiceStore,
    brokerStore,
    equipmentItemStore,
    lineItemStore,
    disposalSiteStore,
    contactStore,
    customerStore.selectedEntity,
    selectedCustomer,
    thirdPartyHaulerStore,
    materialProfileStore,
    permitStore,
    businessUnitId,
    values.businessLineId,
    businessLineStore,
    materialStore,
    canViewEquipment,
    canViewBrokers,
    canViewDisposalSites,
    canViewHaulers,
    canViewPermits,
    canViewMaterialProfiles,
    canViewMaterials,
  ]);

  const prevOrders = usePrevious(values[basePath]);
  const currentOrder = values[basePath];

  const businessLineType = businessLineStore.getById(values.businessLineId)?.type;

  const handleMaterialSelectFocus = useCallback(
    async (equipmentItemId?: number) => {
      if (equipmentItemId) {
        const { materialOptions } = await getMaterialsForOptions({
          materialService,
          businessLineId: values.businessLineId,
          equipmentItemId,
          materialId: values.recurrentTemplateData.materialId ?? undefined,
        });

        setFieldValue(`${basePath}.equipmentItemsMaterialsOptions`, materialOptions);
      } else {
        setFieldValue(`${basePath}.equipmentItemsMaterialsOptions`, []);
        materialStore.cleanup();
      }
    },
    [
      values.businessLineId,
      values.recurrentTemplateData.materialId,
      setFieldValue,
      basePath,
      materialStore,
    ],
  );

  useEffect(() => {
    const equipmentItemId = currentOrder?.equipmentItemId;
    const materialOptions = currentOrder?.equipmentItemsMaterialsOptions;

    if (equipmentItemId && isEmpty(materialOptions)) {
      handleMaterialSelectFocus(equipmentItemId);
    }
  }, [
    handleMaterialSelectFocus,
    currentOrder?.equipmentItemId,
    currentOrder?.equipmentItemsMaterialsOptions,
  ]);

  const generateDriverInstructionsTemplate = (droppedEquipmentItem?: string) =>
    droppedEquipmentItem ? `Pick up Equipment #${droppedEquipmentItem}. ` : '';

  const requestDroppedEquipmentItems = (equipmentItemId: number) => {
    const equipmentItemSize = equipmentItemStore.getById(equipmentItemId)?.shortDescription;

    if (selectedJobSite && selectedCustomer && equipmentItemSize) {
      orderStore.loadAssignEquipmentOptions(basePath, {
        jobSiteId: selectedJobSite.id,
        customerId: selectedCustomer.id,
        equipmentItemSize,
        businessUnitId,
        businessLineId: values.businessLineId,
      });
    }
  };

  const handleDroppedEquipmentItemChange = (field: string, value: string) => {
    setFieldValue(
      `${basePath}.droppedEquipmentItemComment`,
      generateDriverInstructionsTemplate(value),
    );

    orderStore.addAssignedEquipmentItem(value);
    orderStore.removeAssignedEquipmentItem(
      getIn(values, `${basePath}.droppedEquipmentItem`) as string,
    );
    setFieldValue(field, value);
  };

  const handleDriverInstructionsChange = useCallback(
    e => {
      handleChange(e);
      setFieldValue(`${basePath}.droppedEquipmentItemComment`, '');
    },
    [basePath, handleChange, setFieldValue],
  );

  const handleNewContactFormSubmit = useCallback(
    (values: IContactFormData) => {
      values.phoneNumbers?.forEach(phoneNumber => {
        if (phoneNumber.id === 0) {
          delete phoneNumber.id;
        }
      });

      if (selectedCustomer) {
        contactStore.create(
          {
            ...values,
            active: true,
            customerId: values.temporaryContact ? undefined : selectedCustomer.id,
            main: false,
          },
          businessUnitId,
        );
      }
      toggleIsNewContactModalOpen();
    },
    [contactStore, selectedCustomer, toggleIsNewContactModalOpen, businessUnitId],
  );

  const getInactiveLineItem = useCallback(
    (id: number) => {
      const selectedLineItem = find(lineItemStore.sortedValues, {
        id,
      });

      let inactiveLineItem;

      if (!selectedLineItem) {
        const billableLineItem = find(lineItemStore.values, {
          id,
        });

        if (billableLineItem) {
          inactiveLineItem = {
            label: billableLineItem?.description,
            value: billableLineItem?.id,
          };
        }
      }

      return inactiveLineItem;
    },
    [lineItemStore.sortedValues, lineItemStore.values],
  );

  const handleAssignEquipmentItemClear = () => {
    if (basePath !== 'recurrentTemplateData') {
      const droppedEquipmentId = values[basePath]?.droppedEquipmentItem;

      if (droppedEquipmentId) {
        orderStore.removeAssignedEquipmentItem(droppedEquipmentId);
      }
    }

    setFieldValue(`${basePath}.droppedEquipmentItem`, undefined);
    setFieldValue(`${basePath}.droppedEquipmentItemComment`, '');
    setFieldValue(`${basePath}.droppedEquipmentItemApplied`, false);
  };

  const handleBillableQuantityChange = (e: React.ChangeEvent<TextInputElement>) => {
    handleChange(e);
    const { value } = e.target;

    if (basePath === 'recurrentTemplateData') {
      if (values.delivery) {
        setFieldValue('delivery.billableServiceQuantity', value);
      }
      if (values.final) {
        setFieldValue('final.billableServiceQuantity', value);
      }
    }

    if (Number(value) > 1) {
      handleAssignEquipmentItemClear();
    }
  };

  const handleReminderClear = useCallback(() => {
    setFieldValue(`${basePath}.notifyDayBefore`, null);
    setFieldValue(`${basePath}.notificationApplied`, false);
  }, [basePath, setFieldValue]);

  const getLineItemsCalcRatesPayload = useCallback(() => {
    const order = values[basePath];

    return (
      order?.lineItems?.map(lineItem => {
        const billableLineItem = lineItemStore.getById(lineItem.billableLineItemId);

        return {
          lineItemId: lineItem.billableLineItemId,
          materialId: billableLineItem?.materialBasedPricing
            ? lineItem.materialId ?? order.materialId
            : null,
        };
      }) ?? []
    );
  }, [basePath, lineItemStore, values]);

  const handleRatesCalculation = useCallback(
    async ({
      billableServiceId: propsBillableServiceId,
      materialId: propsMaterialId,
      customRatesGroupId,
      isUpdatePrices = true,
    }: {
      customRatesGroupId: number | undefined;
      billableServiceId?: number;
      materialId?: number;
      isUpdatePrices?: boolean;
    }) => {
      const currentOrder = values[basePath];

      if (!currentOrder) {
        return;
      }

      const billableServiceId = propsBillableServiceId ?? currentOrder.billableServiceId;

      if (billableServiceId) {
        await billableServiceStore.requestById(billableServiceId);
      }
      const billableService = billableServiceStore.getById(billableServiceId);
      const equipmentItemId = billableService?.equipmentItemId;

      const materialId = billableService?.materialBasedPricing
        ? propsMaterialId ?? currentOrder.materialId
        : null;

      const type =
        customRatesGroupId === 0 || customRatesGroupId === undefined ? 'global' : 'custom';

      if (type && billableServiceId && equipmentItemId && (materialId || materialId === null)) {
        const billableLineItems = getLineItemsCalcRatesPayload();

        const payload: IOrderRatesCalculateRequest = {
          businessUnitId: +businessUnitId,
          businessLineId: +values.businessLineId,
          type,
          customRatesGroupId: customRatesGroupId === 0 ? undefined : customRatesGroupId,
          billableService: {
            billableServiceId,
            equipmentItemId,
            materialId,
          },
          billableLineItems: billableLineItems?.length > 0 ? billableLineItems : undefined,
        };

        try {
          const rates = await OrderService.calculateRates(payload);

          if (rates) {
            const global = rates.globalRates;
            const custom = rates.customRates;

            setFieldValue(`${basePath}.globalRatesSurcharges`, global?.globalRatesSurcharges);

            setFieldValue(`${basePath}.customRatesSurcharges`, custom?.customRatesSurcharges);

            if (isUpdatePrices) {
              global?.globalRatesLineItems?.forEach(rate => {
                const lineItemIndex = currentOrder.lineItems.findIndex(
                  lineItem => lineItem.billableLineItemId === rate.lineItemId,
                );

                if (lineItemIndex > -1) {
                  setFieldValue(`${basePath}.lineItems[${lineItemIndex}].price`, rate.price);
                }
              });

              custom?.customRatesLineItems?.forEach(rate => {
                const lineItemIndex = currentOrder.lineItems.findIndex(
                  lineItem => lineItem.billableLineItemId === rate.lineItemId,
                );

                if (lineItemIndex > -1) {
                  setFieldValue(`${basePath}.lineItems[${lineItemIndex}].price`, rate.price);
                }
              });

              setFieldValue(
                `${basePath}.billableServicePrice`,
                custom?.customRatesService?.price.toFixed(2) ??
                  global?.globalRatesService?.price?.toFixed(2),
              );
              setFieldError(`${basePath}.billableServicePrice`, undefined);
              setFieldValue(`${basePath}.globalRatesServicesId`, global?.globalRatesService?.id);
              setFieldValue(
                `${basePath}.customRatesGroupServicesId`,
                custom?.customRatesService?.id,
              );
            }
          }
        } catch (error: unknown) {
          const typedError = error as ApiError;
          NotificationHelper.error('calculateServiceRates', typedError.response.code as ActionCode);
          setFieldValue(`${basePath}.billableServicePrice`, undefined);
        }
      }
    },
    [
      values,
      basePath,
      billableServiceStore,
      businessUnitId,
      getLineItemsCalcRatesPayload,
      setFieldValue,
      setFieldError,
    ],
  );

  const handleSelectRatesGroupChange = useCallback(
    ({
      selectedDate,
      isUpdatePrices = true,
    }: {
      selectedDate?: Date;
      isUpdatePrices?: boolean;
    }) => {
      const order = values[basePath];
      const date =
        order && (isRecurrentOrder(order, basePath) ? order.startDate : order.serviceDate);
      const startDate = selectedDate ?? date;
      let selectedGroup;

      if (selectedCustomer && selectedJobSite && startDate) {
        (async () => {
          try {
            selectedGroup = await OrderService.selectRatesGroupRecurrentOrder({
              businessUnitId,
              businessLineId: values.businessLineId,
              customerId: selectedCustomer.id,
              customerJobSiteId: values.customerJobSiteId ?? null,
              date: startDate,
              serviceAreaId,
              customRateGroupId: order?.customRatesGroupId,
            });

            setFieldValue(`${basePath}.selectedGroup`, selectedGroup);
          } catch (error) {
            setFieldValue(`${basePath}.selectedGroup`, null);
            NotificationHelper.error('default');
          }

          let customRatesGroupId;

          if (selectedGroup && isCustomPriceGroup(selectedGroup)) {
            setFieldValue(`${basePath}.customRatesGroupId`, selectedGroup.selectedId);
            customRatesGroupId = selectedGroup.selectedId;
          }

          handleRatesCalculation({ customRatesGroupId, isUpdatePrices });
        })();
      }
    },
    [
      basePath,
      businessUnitId,
      handleRatesCalculation,
      selectedCustomer,
      selectedJobSite,
      setFieldValue,
      values,
      serviceAreaId,
    ],
  );

  const handleFrequencyTypeChange = useCallback(
    (name: string, type: RecurrentFormFrequencyType) => {
      setFieldValue(name, type);
      setFieldValue(`${basePath}.frequencyPeriod`, undefined);
      setFieldValue(`${basePath}.customFrequencyType`, undefined);
      setFieldValue(`${basePath}.frequencyDays`, []);
    },
    [basePath, setFieldValue],
  );

  const handleCustomFrequencyTypeChange = useCallback(
    (name: string, type: RecurrentFormFrequencyType) => {
      setFieldValue(name, type);
      setFieldValue(`${basePath}.frequencyDays`, []);
    },
    [basePath, setFieldValue],
  );

  const handleMonthlyFrequencyDaysChange = useCallback(
    (e: React.ChangeEvent<TextInputElement>) => {
      const value = e.target?.value ?? '';
      const name = e.target?.name ?? '';

      setFieldValue(name, value ? [value] : []);
    },
    [setFieldValue],
  );

  const handleStartDateChange = useCallback(
    (name: string, date: Date | null) => {
      setFieldValue(name, date ?? undefined);
      handleSelectRatesGroupChange({ selectedDate: date ?? undefined });
    },
    [handleSelectRatesGroupChange, setFieldValue],
  );

  const handleBillableServiceChange = (_: string, value: number) => {
    if (!value) {
      setFieldValue(`${basePath}.billableServiceId`, undefined);
      setFieldValue(`${basePath}.materialId`, undefined);
      setFieldValue(`${basePath}.billableServicePrice`, undefined);
      setFieldValue(`${basePath}.billableServiceQuantity`, 1);

      return;
    }
    const billableService = billableServiceStore.getById(value);
    const equipmentItemId = billableService?.equipmentItem?.id;

    handleMaterialSelectFocus(equipmentItemId);

    setFieldValue(`${basePath}.billableServiceApplySurcharges`, billableService?.applySurcharges);

    setFieldValue(`${basePath}.billableServiceId`, value);
    setFieldValue(`${basePath}.materialId`, undefined);
    setFieldValue(`${basePath}.billableServicePrice`, undefined);
    setFieldValue(`${basePath}.jobSite2Id`, undefined);
    setFieldValue(`${basePath}.disposalSiteId`, undefined);
    setFieldValue(`${basePath}.notifyDayBefore`, undefined);
    setFieldValue(`${basePath}.equipmentItemId`, equipmentItemId);

    if (
      canViewEquipment &&
      billableService &&
      assignEquipmentItemServiceList.includes(billableService.action) &&
      equipmentItemId
    ) {
      requestDroppedEquipmentItems(equipmentItemId);
    } else {
      orderStore.maybeHideAssignEquipmentOptions(basePath);

      const droppedEquipment: string = getIn(values, `${basePath}.droppedEquipmentItem`);

      if (droppedEquipment) {
        orderStore.removeAssignedEquipmentItem(droppedEquipment);
      }

      setFieldValue(`${basePath}.droppedEquipmentItem`, undefined);
      setFieldValue(`${basePath}.droppedEquipmentItemApplied`, false);
      setFieldValue(`${basePath}.notificationApplied`, false);
    }
    if (billableService) {
      handleRatesCalculation({
        billableServiceId: value,
        customRatesGroupId: values[basePath]?.customRatesGroupId ?? 0,
      });
    }
  };

  const handlePriceGroupChange = useCallback(
    (name: string, value: number) => {
      setFieldValue(name, value);
      handleRatesCalculation({ customRatesGroupId: value });
    },
    [handleRatesCalculation, setFieldValue],
  );

  const calculateLineItemRates = useCallback(
    (lineItems: { lineItemId: number; materialId?: number | null }[], lineItemIndex: number) => {
      const currentOrder = values[basePath];

      if (!currentOrder) {
        return;
      }

      const { lineItemId } = lineItems[lineItemIndex];

      if (currentOrder.selectedGroup) {
        (async () => {
          const group = currentOrder.selectedGroup;

          if (group) {
            const payload: IOrderRatesCalculateRequest = {
              businessUnitId: +businessUnitId,
              businessLineId: +values.businessLineId,
              type: currentOrder.customRatesGroupId === 0 ? 'global' : group.level,
              billableLineItems: lineItems.length > 0 ? lineItems : undefined,
            };

            if (group.level === 'custom' && currentOrder.customRatesGroupId !== 0) {
              payload.customRatesGroupId = currentOrder.customRatesGroupId;
            }

            try {
              const rates = await OrderService.calculateRates(payload);

              if (rates) {
                const global = rates.globalRates;
                const custom = rates.customRates;

                setFieldValue(`${basePath}.globalRatesSurcharges`, global?.globalRatesSurcharges);

                setFieldValue(`${basePath}.customRatesSurcharges`, custom?.customRatesSurcharges);

                const globalRate = global?.globalRatesLineItems?.find(
                  globalRate => globalRate.lineItemId === lineItemId,
                );
                const customRate = custom?.customRatesLineItems?.find(
                  customRate => customRate.lineItemId === lineItemId,
                );

                setFieldValue(
                  `${basePath}.lineItems[${lineItemIndex}].globalRatesLineItemsId`,
                  globalRate?.id,
                );
                setFieldValue(
                  `${basePath}.lineItems[${lineItemIndex}].customRatesGroupLineItemsId`,
                  customRate?.id,
                );
                setFieldValue(
                  `${basePath}.lineItems[${lineItemIndex}].price`,
                  customRate?.price ?? globalRate?.price,
                );
              }
            } catch (error: unknown) {
              const typedError = error as ApiError;
              NotificationHelper.error(
                'calculateLineItemRates',
                typedError.response.code as ActionCode,
              );
              setFieldValue(`${basePath}.lineItems[${lineItemIndex}].price`, undefined);
            }
          }
        })();
      }
    },
    [basePath, setFieldValue, values, businessUnitId],
  );

  const handleMaterialChange = useCallback(
    (_: string, value: number) => {
      setFieldValue(`${basePath}.materialId`, value);
      setFieldValue(`${basePath}.materialProfileId`, undefined);
      setFieldValue(`${basePath}.disposalSiteId`, undefined);
      setFieldValue(`${basePath}.billableServicePrice`, undefined);
      handleRatesCalculation({
        materialId: value,
        customRatesGroupId: values[basePath]?.customRatesGroupId ?? 0,
      });

      if (value) {
        const lineItemIndicesForRates = values[basePath]?.lineItems.reduce<number[]>(
          (acc, cur, i) => {
            const billableLineItem = lineItemStore.getById(cur.billableLineItemId);

            if (billableLineItem?.materialBasedPricing && !cur?.materialId) {
              acc.push(i);
            }

            return acc;
          },
          [],
        );

        if (lineItemIndicesForRates?.length) {
          const lineItems = getLineItemsCalcRatesPayload().map((lineItem, i) =>
            lineItemIndicesForRates.includes(i) ? { ...lineItem, materialId: value } : lineItem,
          );

          Promise.all(
            lineItemIndicesForRates.map(lineItemIndex =>
              calculateLineItemRates(lineItems, lineItemIndex),
            ),
          );
        }
      }
    },
    [
      basePath,
      calculateLineItemRates,
      getLineItemsCalcRatesPayload,
      handleRatesCalculation,
      lineItemStore,
      setFieldValue,
      values,
    ],
  );

  const handleLineItemChange = useCallback(
    (lineItemId: number, lineItemIndex: number) => {
      setFieldValue(`${basePath}.lineItems[${lineItemIndex}].billableLineItemId`, lineItemId);
      setFieldValue(`${basePath}.lineItems[${lineItemIndex}].materialId`, undefined);

      const billableLineItem = lineItemStore.getById(lineItemId);
      const lineItems = getLineItemsCalcRatesPayload();
      const order = values[basePath];

      setFieldValue(`${basePath}.lineItems[${lineItemIndex}].units`, billableLineItem?.unit);

      lineItems.splice(lineItemIndex, 1, {
        lineItemId,
        materialId: billableLineItem?.materialBasedPricing ? order?.materialId : undefined,
      });

      if (
        billableLineItem &&
        (!billableLineItem.materialBasedPricing ||
          (billableLineItem.materialBasedPricing && order?.materialId))
      ) {
        calculateLineItemRates(lineItems, lineItemIndex);
      } else {
        setFieldValue(`${basePath}.lineItems[${lineItemIndex}].price`, undefined);
      }
    },
    [
      setFieldValue,
      basePath,
      lineItemStore,
      getLineItemsCalcRatesPayload,
      values,
      calculateLineItemRates,
    ],
  );

  const handleLineItemMaterialChange = (materialId: number, lineItemIndex: number) => {
    const lineItems = getLineItemsCalcRatesPayload();

    const order = values[basePath];
    const lineItem = order?.lineItems[lineItemIndex];
    const billableLineItem = lineItemStore.getById(lineItem?.billableLineItemId);

    if (
      lineItem &&
      (!billableLineItem?.materialBasedPricing ||
        (billableLineItem.materialBasedPricing && (materialId || order?.materialId)))
    ) {
      lineItems.splice(lineItemIndex, 1, {
        lineItemId: lineItem.billableLineItemId,
        materialId: billableLineItem?.materialBasedPricing
          ? materialId || order?.materialId
          : undefined,
      });
      calculateLineItemRates(lineItems, lineItemIndex);
    } else {
      setFieldValue(`${basePath}.lineItems[${lineItemIndex}].price`, undefined);
    }
  };

  const handleMaterialProfileChange = useCallback(
    (_: string, value: number) => {
      const disposalSiteId = materialProfileStore.getById(value)?.disposalSiteId;

      setFieldValue(`${basePath}.materialProfileId`, value);
      setFieldValue(`${basePath}.disposalSiteId`, disposalSiteId);
    },
    [basePath, materialProfileStore, setFieldValue],
  );

  const handleJobSite2AutocompleteSelect = useCallback(
    (item: AddressSuggestion) => {
      setFieldValue(
        `${basePath}.jobSite2Label`,
        addressFormat({
          ...item,
          addressLine1: item.address,
          addressLine2: '',
          region: i18nStore.region,
        }),
      );
      setFieldValue(`${basePath}.jobSite2IdSearchString`, '');
      setFieldValue(`${basePath}.jobSite2Id`, item.id);
      setFieldError(`${basePath}.jobSite2Id`, undefined);
    },
    [basePath, i18nStore.region, setFieldError, setFieldValue],
  );

  const handleJobSite2Clear = useCallback(() => {
    setFieldValue(`${basePath}.jobSite2Label`, '');
    setFieldValue(`${basePath}.jobSite2IdSearchString`, '');
    setFieldValue(`${basePath}.jobSite2Id`, undefined);
  }, [basePath, setFieldValue]);

  const handleJobSite2FormSubmit = useCallback(
    async (newJobSite: IJobSiteData) => {
      try {
        sanitizeJobSite(newJobSite);
        const jobSite = await jobSiteService.create(newJobSite);

        if (jobSite) {
          setFieldValue(`${basePath}.jobSite2IdSearchString`, addressFormat(jobSite.address));
          setFieldValue(`${basePath}.jobSite2Id`, jobSite.id);
        }

        NotificationHelper.success('create', 'Job Site');
      } catch (error: unknown) {
        const typedError = error as ApiError;
        NotificationHelper.error('create', typedError.response.code as ActionCode, 'Job Site');
      } finally {
        toggleJobSiteModalOpen();
      }
    },
    [basePath, setFieldValue, toggleJobSiteModalOpen],
  );

  const handleReminderKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLOrSVGElement>) => {
      if (handleEnterOrSpaceKeyDown(e)) {
        setFieldValue(`${basePath}.notificationApplied`, true);
      }
    },
    [basePath, setFieldValue],
  );

  const getPriceType = (price: IOrderCustomRatesGroup) => {
    if (price.customerId) {
      return 'from Customer';
    }
    if (price.customerJobSiteId) {
      return 'from Job Site';
    }
    if (price.serviceAreaId) {
      return 'from Service Area';
    }

    return 'from Custom Group';
  };

  const materialProfileOptions: ISelectOption[] = useMemo(
    () => [
      {
        label: 'Ignore Material Profile',
        value: 0,
      },
      ...materialProfileStore.sortedValues.map(materialProfile => ({
        label: materialProfile.description,
        value: materialProfile.id,
      })),
    ],
    [materialProfileStore.sortedValues],
  );

  const assignEquipmentOptions: ISelectOption[] = useMemo(() => {
    const options = orderStore.assignEquipmentOptions.map(elem => ({
      value: elem.id,
      label: elem.id,
    }));

    return options;
  }, [orderStore.assignEquipmentOptions]);

  useEffect(() => {
    (async () => {
      const options =
        (await getBillableServiceForOptions({
          billableItemService,
          businessLineId: values.businessLineId,
          billableItemId: currentOrder?.billableServiceId,
        })) ?? [];

      setBillableServiceOptions(options);
    })();
  }, [currentOrder?.billableServiceId, values.businessLineId]);

  const canCreateContacts = usePermission('customers:contacts:perform');

  const contactOptions: ISelectOptionGroup[] = useMemo(
    () => [
      {
        options: [
          {
            label: 'Use job site contact',
            value: 0,
          },
          ...contactStore.values.map(contact => ({
            label: contact.name,
            value: contact.id,
            hint: contact.jobTitle ?? '',
          })),
        ],
        footer: canCreateContacts ? <ContactFieldFooter /> : undefined,
        onFooterClick: canCreateContacts ? toggleIsNewContactModalOpen : undefined,
      },
    ],
    [canCreateContacts, contactStore.values, toggleIsNewContactModalOpen],
  );

  const getPriceGroupOptions = useCallback((): ISelectOption[] => {
    const options = [];
    const group = values[basePath]?.selectedGroup;

    options.push({
      label: globalRateStore.values[0].description,
      value: globalRateStore.values[0].id,
      hint: getGlobalPriceType(t),
    });

    if (group && isCustomPriceGroup(group)) {
      const selectedGroupsOptions = group.customRatesGroups.map(customRatesGroup => ({
        label: customRatesGroup.description,
        value: customRatesGroup.id,
        hint: getPriceType(customRatesGroup),
      }));

      options.push(...selectedGroupsOptions);
    }

    return options;
  }, [basePath, globalRateStore.values, t, values]);

  const disposalSiteOptions: ISelectOption[] = useMemo(
    () =>
      disposalSiteStore.sortedValues.map(disposalSite => ({
        label: disposalSite.description,
        value: disposalSite.id,
      })),
    [disposalSiteStore.sortedValues],
  );

  const lineItemOptions: ISelectOption[] = useMemo(
    () =>
      lineItemStore.sortedValues.map(lineItem => ({
        label: lineItem.description,
        value: lineItem.id,
      })),
    [lineItemStore.sortedValues],
  );

  const thirdPartyHaulerOptions: ISelectOption[] = useMemo(
    () =>
      thirdPartyHaulerStore.sortedValues
        .filter(option => option.active)
        .map(hauler => ({
          label: hauler.description,
          value: hauler.id,
        })),
    [thirdPartyHaulerStore.sortedValues],
  );

  const permitOptions: ISelectOption[] = useMemo(
    () =>
      permitStore.sortedValues.map(permit => ({
        value: permit.id,
        label: permit.number,
      })),
    [permitStore.sortedValues],
  );

  const phoneNumbers: ISelectOptionGroup[] = useMemo(
    () => [
      {
        options: contactStore.values.flatMap(
          contact =>
            contact.phoneNumbers?.map(phoneNumber => ({
              label: formatPhoneNumber(phoneNumber.number) ?? phoneNumber.number,
              value: phoneNumber.id ?? 0,
              hint: contact.name,
            })) ?? [],
        ),
        footer: canCreateContacts ? <ContactFieldFooter /> : undefined,
        onFooterClick: canCreateContacts ? toggleIsNewContactModalOpen : undefined,
      },
    ],
    [canCreateContacts, contactStore.values, formatPhoneNumber, toggleIsNewContactModalOpen],
  );

  const getPhoneNumber = useCallback(
    (value: string | number): string | undefined =>
      phoneNumbers[0].options.find(contact => contact.value === value)?.label,
    [phoneNumbers],
  );

  const setCallOnWayPhoneNumberAndId = useCallback(
    (name: string, value: string | number): void => {
      const callOnWayPhoneNumber = getPhoneNumber(value);

      setFieldValue(name, value);
      setFieldValue(`${basePath}.callOnWayPhoneNumber`, callOnWayPhoneNumber);
    },
    [basePath, setFieldValue, getPhoneNumber],
  );

  const setTextOnWayPhoneNumberAndId = useCallback(
    (name: string, value: string | number): void => {
      const textOnWayPhoneNumber = getPhoneNumber(value);

      setFieldValue(name, value);
      setFieldValue(`${basePath}.textOnWayPhoneNumber`, textOnWayPhoneNumber);
    },
    [basePath, setFieldValue, getPhoneNumber],
  );

  const getNotifyOptions = useCallback(
    (orderContactId): ISelectOption[] => {
      const orderContact = contactStore.getById(orderContactId as number);
      const jobSiteContact = contactStore.getById(values.jobSiteContactId);
      const isContactTheSame = orderContactId === 0;

      const isEmailDisabled = isContactTheSame ? !jobSiteContact?.email : !orderContact?.email;
      const isPhoneDisabled = isContactTheSame
        ? !jobSiteContact?.phoneNumbers?.length
        : !orderContact?.phoneNumbers?.length;

      return [
        {
          value: 'byText',
          label: 'Notify day before by text',
          disabled: isPhoneDisabled,
        },
        {
          value: 'byEmail',
          label: 'Notify day before by email',
          disabled: isEmailDisabled,
        },
      ];
    },
    [contactStore, values.jobSiteContactId],
  );

  const handleAddAdditionalOrder = useCallback(
    (orderType: RecurrentFormBasePath) => {
      setFieldValue(orderType, {
        ...defaultFinalOrDeliveryOrderValue,
        applySurcharges: currentBusinessUnit?.applySurcharges ?? true,
        billableServiceQuantity: values.recurrentTemplateData.billableServiceQuantity,
      });
      if (orderType === 'delivery') {
        setFieldValue('isDeliveryApplied', true);
      } else if (orderType === 'final') {
        setFieldValue('isFinalApplied', true);
      }
    },
    [
      currentBusinessUnit?.applySurcharges,
      setFieldValue,
      values.recurrentTemplateData.billableServiceQuantity,
    ],
  );

  const handleRemoveAdditionalOrder = useCallback(
    (orderType: RecurrentFormBasePath) => {
      setFieldValue(orderType, undefined);
      if (orderType === 'delivery') {
        setFieldValue('isDeliveryApplied', false);
      } else if (orderType === 'final') {
        setFieldValue('isFinalApplied', false);
      }
    },
    [setFieldValue],
  );

  const prevCustomerJobSiteId = usePrevious(values.customerJobSiteId);
  const prevServiceAreaId = usePrevious(serviceAreaId);

  useEffect(() => {
    if (
      (values.customerJobSiteId !== undefined &&
        prevCustomerJobSiteId !== values.customerJobSiteId) ||
      !prevOrders ||
      prevServiceAreaId !== serviceAreaId
    ) {
      handleSelectRatesGroupChange({ isUpdatePrices: false });
    }
  }, [
    handleSelectRatesGroupChange,
    prevCustomerJobSiteId,
    prevOrders,
    values.customerJobSiteId,
    prevServiceAreaId,
    serviceAreaId,
  ]);

  const jobSite2AutocompleteConfig: IAutocompleteConfig[] = useMemo(
    () => [
      {
        name: 'jobSites',
        onSelect: handleJobSite2AutocompleteSelect,
        template: <AutocompleteTemplates.JobSite />,
        footer: <AutocompleteTemplates.Footer text="Create new job site" />,
        onFooterClick: toggleJobSiteModalOpen,
        showFooterIfNoOption: true,
      },
    ],
    [handleJobSite2AutocompleteSelect, toggleJobSiteModalOpen],
  );

  // there is no sense for this form part without LoB
  const order = values[basePath];

  const { isAssignEquipmentItemAllowed, isNotificationAllowed } = useMemo(() => {
    const billableService = order && billableServiceStore.getById(order.billableServiceId);

    const isAssignEquipmentItemAllowed =
      billableService && assignEquipmentItemServiceList.includes(billableService.action);

    const isNotificationAllowed =
      billableService && notificationServiceList.includes(billableService.action);

    return { isAssignEquipmentItemAllowed, isNotificationAllowed };
  }, [billableServiceStore, order]);

  if (!order || !businessLineType) {
    return null;
  }

  const equipmentAssignedOrderId =
    isRegularOrder(order, basePath) &&
    order.droppedEquipmentItemApplied &&
    orderStore.assignEquipmentOptions.find(option => option.id === order.droppedEquipmentItem)
      ?.orderId;

  const equipmentAssignedToMultiple =
    isRegularOrder(order, basePath) &&
    order.droppedEquipmentItem &&
    orderStore.assignedEquipmentItems.filter(id => id === order.droppedEquipmentItem).length > 1;

  const billableServiceAction = billableServiceStore.getById(order.billableServiceId)?.action;

  const material = materialStore.getById(order.materialId);

  const priceGroupOptions = getPriceGroupOptions();

  const isNotificationDisabled = isRecurrentOrder(order, basePath)
    ? isBefore(order.startDate, startOfTomorrow())
    : isBefore(order.serviceDate, startOfTomorrow());

  const handleKeyDown = (e: React.KeyboardEvent<HTMLOrSVGElement>, callback: () => void) => {
    if (handleEnterOrSpaceKeyDown(e)) {
      callback();
    }
  };

  const handleKeyDownBasePathArgument = (
    e: React.KeyboardEvent<HTMLOrSVGElement>,
    callback: (basePath: RecurrentFormBasePath) => void,
    basePath: RecurrentFormBasePath,
  ) => {
    if (handleEnterOrSpaceKeyDown(e)) {
      callback(basePath);
    }
  };

  const driverInstructionsPreFill = getDriverInstructionsTemplate(selectedCustomer, {
    workOrderNotes: values.pair.workOrderNote,
  });

  return (
    <>
      <NewContactModal
        isOpen={isNewContactModalOpen}
        onFormSubmit={handleNewContactFormSubmit}
        onClose={toggleIsNewContactModalOpen}
        half
      />

      {!values.delivery && basePath !== 'final' && !values.id ? (
        <Section dashed>
          <Layouts.Padding padding="2">
            <Typography
              color="information"
              cursor="pointer"
              variant="bodyMedium"
              role="button"
              tabIndex={0}
              onClick={() => handleAddAdditionalOrder('delivery')}
              onKeyDown={e =>
                handleKeyDownBasePathArgument(e, handleAddAdditionalOrder, 'delivery')
              }
            >
              <Layouts.Flex alignItems="center" justifyContent="center">
                <Layouts.IconLayout height="12px" width="12px">
                  <PlusIcon />
                </Layouts.IconLayout>
                Add Delivery Order
              </Layouts.Flex>
            </Typography>
          </Layouts.Padding>
        </Section>
      ) : null}
      <Section>
        <JobSiteModal
          isOpen={isJobSiteModalOpen}
          onFormSubmit={handleJobSite2FormSubmit}
          onClose={toggleJobSiteModalOpen}
          withMap={false}
        />
        <Subsection>
          <>
            <Layouts.Margin bottom="1">
              <Layouts.Flex justifyContent="space-between">
                <Typography variant="headerThree">
                  {basePath === 'recurrentTemplateData' ? 'Recurrent Order Details' : null}
                  {basePath === 'delivery' ? 'Delivery Order Details' : null}
                  {basePath === 'final' ? 'Final Order Details' : null}
                </Typography>
                {nonRecurrentOrderTypes.includes(basePath) ? (
                  <Layouts.IconLayout remove onClick={() => handleRemoveAdditionalOrder(basePath)}>
                    <Layouts.Flex alignItems="center">
                      <DeleteIcon
                        role="button"
                        aria-label={t('Text.Remove')}
                        tabIndex={0}
                        onKeyDown={e =>
                          handleKeyDownBasePathArgument(e, handleRemoveAdditionalOrder, basePath)
                        }
                      />
                      <Typography variant="bodyMedium" color="information" cursor="pointer">
                        Remove
                      </Typography>
                    </Layouts.Flex>
                  </Layouts.IconLayout>
                ) : null}
              </Layouts.Flex>
            </Layouts.Margin>
            <Layouts.Flex>
              <Layouts.Column>
                <Select
                  label="Order contact*"
                  placeholder="Select contact"
                  name={`${basePath}.orderContactId`}
                  options={contactOptions}
                  value={order.orderContactId}
                  error={getIn(errors, `${basePath}.orderContactId`)}
                  onSelectChange={setFieldValue}
                />

                <PurchaseOrderSection customerId={values.customerId} basePath={basePath} />

                {hasPermits.includes(businessLineType) ? (
                  <Select
                    placeholder={t(`${I18N_PATH}SelectPermit`)}
                    label={`${t(`${I18N_PATH}Permit`)}${values.pair.permitRequired ? '*' : ''}`}
                    name={`${basePath}.permitId`}
                    options={permitOptions}
                    value={order.permitId}
                    error={getIn(errors, `${basePath}.permitId`)}
                    onSelectChange={setFieldValue}
                  />
                ) : null}

                <Select
                  label="3rd Party Hauler"
                  placeholder="Select hauler"
                  name={`${basePath}.thirdPartyHaulerId`}
                  value={order.thirdPartyHaulerId}
                  options={thirdPartyHaulerOptions}
                  error={getIn(errors, `${basePath}.thirdPartyHaulerId`)}
                  onSelectChange={setFieldValue}
                />

                {isRegularOrder(order, basePath) ? (
                  <Calendar
                    label="Service date*"
                    name={`${basePath}.serviceDate`}
                    withInput
                    value={order.serviceDate}
                    placeholder={t('Text.SetDate')}
                    firstDayOfWeek={firstDayOfWeek}
                    dateFormat={dateFormat}
                    error={getIn(errors, `${basePath}.serviceDate`)}
                    onDateChange={handleStartDateChange}
                  />
                ) : null}

                <Select
                  label="Price group*"
                  placeholder="Select price group"
                  name={`${basePath}.customRatesGroupId`}
                  options={priceGroupOptions}
                  value={order.customRatesGroupId}
                  error={getIn(errors, `${basePath}.customRatesGroupId`)}
                  onSelectChange={handlePriceGroupChange}
                />
                {isRegularOrder(order, basePath) &&
                businessLineType === BusinessLineType.rollOff &&
                billableServiceAction === 'relocate' ? (
                  <Autocomplete
                    name={`${basePath}.jobSite2IdSearchString`}
                    label="Relocation Address"
                    placeholder="Search job sites"
                    search={order.jobSite2IdSearchString}
                    onSearchChange={setFieldValue}
                    onClear={handleJobSite2Clear}
                    onRequest={search => GlobalService.multiSearch(search, businessUnitId)}
                    configs={jobSite2AutocompleteConfig}
                    error={getIn(errors, `${basePath}.jobSite2Id`)}
                    selectedValue={order.jobSite2Label}
                  />
                ) : null}

                {businessLineType === BusinessLineType.rollOff &&
                material?.manifested &&
                billableServiceAction !== 'relocate' &&
                billableServiceAction !== 'reposition' ? (
                  <Select
                    label="Material Profile*"
                    placeholder="Select material profile"
                    name={`${basePath}.materialProfileId`}
                    options={materialProfileOptions}
                    value={order.materialProfileId ?? undefined}
                    error={getIn(errors, `${basePath}.materialProfileId`)}
                    onSelectChange={handleMaterialProfileChange}
                  />
                ) : null}

                {businessLineType === BusinessLineType.rollOff &&
                billableServiceAction &&
                disposalSiteList.includes(billableServiceAction) ? (
                  <Select
                    label="Disposal Site*"
                    placeholder="Select disposal site"
                    name={`${basePath}.disposalSiteId`}
                    options={disposalSiteOptions}
                    value={order.disposalSiteId}
                    error={getIn(errors, `${basePath}.disposalSiteId`)}
                    onSelectChange={setFieldValue}
                    disabled={!!order.materialProfileId}
                  />
                ) : null}
              </Layouts.Column>
              <Layouts.Column>
                <Select
                  label="Call On Way"
                  placeholder="Select phone number for call"
                  name={`${basePath}.callOnWayPhoneNumberId`}
                  options={phoneNumbers}
                  value={order.callOnWayPhoneNumberId}
                  error={getIn(errors, `${basePath}.callOnWayPhoneNumberId`)}
                  onSelectChange={setCallOnWayPhoneNumberAndId}
                />
                <Select
                  label="Text On Way"
                  placeholder="Select phone number for text"
                  name={`${basePath}.textOnWayPhoneNumberId`}
                  options={phoneNumbers}
                  value={order.textOnWayPhoneNumberId}
                  error={getIn(errors, `${basePath}.textOnWayPhoneNumberId`)}
                  onSelectChange={setTextOnWayPhoneNumberAndId}
                />

                {isRecurrentOrder(order, basePath) ? (
                  <>
                    <Calendar
                      label="Start Date*"
                      name={`${basePath}.startDate`}
                      withInput
                      value={order.startDate}
                      placeholder={t('Text.SetDate')}
                      firstDayOfWeek={firstDayOfWeek}
                      dateFormat={dateFormat}
                      error={getIn(errors, `${basePath}.startDate`)}
                      onDateChange={handleStartDateChange}
                      readOnly={!!values.id}
                    />
                    <Calendar
                      label="End Date (Optional)"
                      name={`${basePath}.endDate`}
                      withInput
                      value={order.endDate ?? undefined}
                      placeholder={t('Text.SetDate')}
                      firstDayOfWeek={firstDayOfWeek}
                      dateFormat={dateFormat}
                      error={getIn(errors, `${basePath}.endDate`)}
                      onDateChange={handleStartDateChange}
                    />
                  </>
                ) : null}

                <FormInput
                  label="Instructions for driver"
                  placeholder="Add some notes for driver"
                  name={`${basePath}.driverInstructions`}
                  value={`${
                    isRegularOrder(order, basePath) ? order.droppedEquipmentItemComment : ''
                  }${order.driverInstructions ?? ''} ${driverInstructionsPreFill}`}
                  error={getIn(errors, `${basePath}.driverInstructions`)}
                  onChange={handleDriverInstructionsChange}
                  area
                />

                <OrderTimePicker basePath={basePath} />

                <Layouts.Flex>
                  <Layouts.Column>
                    {businessLineType !== 'residentialWaste' ? (
                      <Layouts.Margin top="1" bottom="1">
                        <Checkbox
                          name={`${basePath}.someoneOnSite`}
                          value={order.someoneOnSite}
                          error={getIn(errors, `${basePath}.someoneOnSite`)}
                          onChange={handleChange}
                        >
                          Someone on site
                        </Checkbox>
                      </Layouts.Margin>
                    ) : null}
                    {businessLineType === BusinessLineType.rollOff ? (
                      <Layouts.Margin top="1" bottom="1">
                        <Checkbox
                          name={`${basePath}.earlyPick`}
                          value={order.earlyPick}
                          error={getIn(errors, `${basePath}.earlyPick`)}
                          onChange={handleChange}
                        >
                          Early pickup is ok
                        </Checkbox>
                      </Layouts.Margin>
                    ) : null}
                    <Layouts.Margin top="1" bottom="1">
                      <Checkbox
                        name="pair.alleyPlacement"
                        value={values.pair.alleyPlacement}
                        error={errors.pair?.alleyPlacement}
                        onChange={handleChange}
                        disabled={!!values.customerJobSiteId}
                      >
                        Alley placement
                      </Checkbox>
                    </Layouts.Margin>
                  </Layouts.Column>
                  <Layouts.Column>
                    {businessLineType === BusinessLineType.rollOff ? (
                      <Layouts.Margin top="1" bottom="1">
                        <Checkbox
                          name={`${basePath}.toRoll`}
                          value={order.toRoll}
                          error={getIn(errors, `${basePath}.toRoll`)}
                          onChange={handleChange}
                        >
                          Ok to roll
                        </Checkbox>
                      </Layouts.Margin>
                    ) : null}

                    <Layouts.Margin top="1" bottom="1">
                      <Checkbox
                        name={`${basePath}.highPriority`}
                        value={order.highPriority}
                        error={getIn(errors, `${basePath}.highPriority`)}
                        onChange={handleChange}
                      >
                        High Priority
                      </Checkbox>
                    </Layouts.Margin>

                    {businessLineType === BusinessLineType.rollOff ? (
                      <Layouts.Margin top="1" bottom="1">
                        <Checkbox
                          name="cabOver"
                          value={values.pair.cabOver}
                          error={errors.pair?.cabOver}
                          onChange={handleChange}
                          disabled={!!values.customerJobSiteId}
                        >
                          Cab-over
                        </Checkbox>
                      </Layouts.Margin>
                    ) : null}
                  </Layouts.Column>
                </Layouts.Flex>
              </Layouts.Column>
            </Layouts.Flex>
          </>
        </Subsection>
        <Subsection gray>
          <Layouts.Margin bottom="2">
            <Typography variant="headerFour">Service</Typography>
          </Layouts.Margin>
          <Layouts.Flex $wrap>
            <Layouts.Margin right="2">
              <Layouts.Box width="275px">
                <Select
                  label="Service*"
                  placeholder="Select service"
                  name={`${basePath}.billableServiceId`}
                  value={order.billableServiceId}
                  error={getIn(errors, `${basePath}.billableServiceId`)}
                  onSelectChange={handleBillableServiceChange}
                  options={billableServiceOptions}
                />
              </Layouts.Box>
            </Layouts.Margin>
            <Layouts.Margin right="2">
              <Layouts.Box width="250px">
                <Select
                  label="Material*"
                  placeholder="Select material"
                  name={`${basePath}.materialId`}
                  value={order.materialId}
                  error={getIn(errors, `${basePath}.materialId`)}
                  onSelectChange={handleMaterialChange}
                  options={getIn(values, `${basePath}.equipmentItemsMaterialsOptions`)}
                />
              </Layouts.Box>
            </Layouts.Margin>
            <Layouts.Margin right="2">
              <Layouts.Box width="90px">
                <FormInput
                  label="Price*"
                  type="number"
                  name={`${basePath}.billableServicePrice`}
                  key="billableServicePrice"
                  value={order.billableServicePrice}
                  onChange={handleChange}
                  error={getIn(errors, `${basePath}.billableServicePrice`)}
                  disabled={!values.recurrentTemplateData.unlockOverrides}
                />
              </Layouts.Box>
            </Layouts.Margin>
            <Layouts.Margin right="2">
              <Layouts.Box width="75px">
                <FormInput
                  label="QTY*"
                  type="number"
                  name={`${basePath}.billableServiceQuantity`}
                  countable
                  limits={{
                    min: 1,
                    max: 10,
                  }}
                  value={order.billableServiceQuantity}
                  onChange={handleBillableQuantityChange}
                  error={getIn(errors, `${basePath}.billableServiceQuantity`)}
                  disabled={nonRecurrentOrderTypes.includes(basePath)}
                />
              </Layouts.Box>
            </Layouts.Margin>
            <Layouts.Box minWidth="90px">
              <ReadOnlyFormField
                label="Total, $"
                value={formatCurrency(
                  (Number(order.billableServicePrice) || 0) * order.billableServiceQuantity,
                )}
              />
            </Layouts.Box>
          </Layouts.Flex>

          {isRecurrentOrder(order, basePath) ? (
            <Layouts.Flex $wrap>
              <Layouts.Margin right="2">
                <Layouts.Box width="275px">
                  <Select
                    label="Frequency"
                    placeholder="Select frequency"
                    name={`${basePath}.frequencyType`}
                    value={order.frequencyType}
                    error={getIn(errors, `${basePath}.frequencyType`)}
                    onSelectChange={handleFrequencyTypeChange}
                    options={normalizeOptions(frequencyTypeOptions)}
                  />
                </Layouts.Box>
              </Layouts.Margin>
              {order.frequencyType === RecurrentFormFrequencyType.custom ? (
                <>
                  <Layouts.Margin right="2">
                    <Layouts.Box as={Layouts.Margin} bottom="0.5" top="0.5" height="20px">
                      <Typography variant="bodyMedium" color="secondary" shade="desaturated">
                        Repeat every
                      </Typography>
                    </Layouts.Box>
                    <Layouts.Flex as={Layouts.Box} width="250px">
                      <Layouts.Box as={Layouts.Margin} width="79px" right="2">
                        <FormInput
                          name={`${basePath}.frequencyPeriod`}
                          value={order.frequencyPeriod}
                          onChange={handleChange}
                          error={getIn(errors, `${basePath}.frequencyPeriod`)}
                          noError
                        />
                      </Layouts.Box>
                      <Layouts.Box width="calc(250px - 2rem - 50px)">
                        <Select
                          placeholder="Select custom frequency type"
                          name={`${basePath}.customFrequencyType`}
                          value={order.customFrequencyType}
                          onSelectChange={handleCustomFrequencyTypeChange}
                          options={customFrequencyTypeOptions}
                          error={getIn(errors, `${basePath}.customFrequencyType`)}
                          nonClearable
                          noErrorMessage
                        />
                      </Layouts.Box>
                    </Layouts.Flex>
                    <Layouts.Box as={Layouts.Margin} bottom="0.5" top="0.5" height="20px">
                      <Typography variant="bodySmall" color="alert">
                        {getIn(errors, `${basePath}.frequencyPeriod`) ??
                          getIn(errors, `${basePath}.customFrequencyType`)}
                      </Typography>
                    </Layouts.Box>
                  </Layouts.Margin>
                  {order.customFrequencyType === RecurrentFormCustomFrequencyType.weekly ? (
                    <WeekPicker />
                  ) : null}
                  {order.customFrequencyType === RecurrentFormCustomFrequencyType.monthly ? (
                    <Layouts.Box width="70px">
                      <Layouts.Padding top="0.5" bottom="0.5">
                        <Typography
                          color="secondary"
                          as="label"
                          shade="desaturated"
                          variant="bodyMedium"
                          htmlFor={`${basePath}.frequencyDays`}
                        >
                          <Layouts.Margin right="1" as="span">
                            On day
                          </Layouts.Margin>
                          <Tooltip
                            border
                            position="top"
                            text="Is there is no such day in certain month, it will be the last day of the month"
                            inline
                          >
                            <Typography
                              color="secondary"
                              shade="desaturated"
                              cursor="pointer"
                              variant="caption"
                            >
                              <Layouts.Flex
                                as={Layouts.Box}
                                alignItems="center"
                                justifyContent="center"
                                borderRadius="50%"
                                width="14px"
                                height="14px"
                              >
                                ?
                              </Layouts.Flex>
                            </Typography>
                          </Tooltip>
                        </Typography>
                      </Layouts.Padding>
                      <FormInput
                        name={`${basePath}.frequencyDays`}
                        value={order.frequencyDays?.[0]}
                        onChange={handleMonthlyFrequencyDaysChange}
                        error={getIn(errors, `${basePath}.frequencyDays`)}
                      />
                    </Layouts.Box>
                  ) : null}
                </>
              ) : null}
              <Layouts.Box width="100%">
                <Layouts.Margin bottom="2">
                  <Typography color="secondary" shade="desaturated" variant="bodyMedium">
                    {recurrentFrequencyText}
                  </Typography>
                </Layouts.Margin>
              </Layouts.Box>
            </Layouts.Flex>
          ) : null}

          <Layouts.Flex>
            {!order.notificationApplied && isNotificationAllowed ? (
              <Layouts.Margin right="2">
                <Layouts.Box minWidth="275px">
                  <Layouts.Flex>
                    <Typography
                      onClick={() => setFieldValue(`${basePath}.notificationApplied`, true)}
                      onKeyDown={handleReminderKeyDown}
                      tabIndex={0}
                      role="button"
                      color="information"
                      variant="bodyMedium"
                      cursor="pointer"
                    >
                      <Layouts.Flex alignItems="center">
                        <Layouts.IconLayout>
                          <ReminderIcon />
                        </Layouts.IconLayout>
                        Set a reminder
                      </Layouts.Flex>
                    </Typography>
                  </Layouts.Flex>
                </Layouts.Box>
              </Layouts.Margin>
            ) : null}
            {isNotificationAllowed && order.notificationApplied ? (
              <Layouts.Margin right="2">
                <Layouts.Box minWidth="275px">
                  <Layouts.Flex alignItems="center">
                    <Layouts.IconLayout remove onClick={handleReminderClear}>
                      <DeleteIcon
                        role="button"
                        aria-label={t('Text.Remove')}
                        tabIndex={0}
                        onKeyDown={e => handleKeyDown(e, handleReminderClear)}
                      />
                    </Layouts.IconLayout>
                    <Layouts.Box width="100%">
                      <Layouts.Padding top="0.5" bottom="0.5">
                        <Typography
                          color="secondary"
                          as="label"
                          shade="desaturated"
                          variant="bodyMedium"
                          htmlFor="popupNote"
                        >
                          <Layouts.Margin right="1" as="span">
                            Service reminder*
                          </Layouts.Margin>
                          <Tooltip
                            border
                            position="top"
                            text="A reminder will be sent to order contact. Options with missing credentials are unavailable"
                            inline
                          >
                            <Typography
                              color="secondary"
                              shade="desaturated"
                              cursor="pointer"
                              variant="caption"
                            >
                              <Layouts.Flex
                                as={Layouts.Box}
                                alignItems="center"
                                justifyContent="center"
                                borderRadius="50%"
                                width="14px"
                                height="14px"
                              >
                                ?
                              </Layouts.Flex>
                            </Typography>
                          </Tooltip>
                        </Typography>
                      </Layouts.Padding>

                      <Select
                        placeholder="Select service reminder"
                        name={`${basePath}.notifyDayBefore`}
                        value={order.notifyDayBefore ?? undefined}
                        error={getIn(errors, `${basePath}.notifyDayBefore`)}
                        onSelectChange={setFieldValue}
                        disabled={isNotificationDisabled}
                        options={getNotifyOptions(order.orderContactId)}
                      />
                    </Layouts.Box>
                  </Layouts.Flex>
                </Layouts.Box>
              </Layouts.Margin>
            ) : null}
            {isRegularOrder(order, basePath) &&
            order.droppedEquipmentItemApplied &&
            isAssignEquipmentItemAllowed ? (
              <Layouts.Margin right="2">
                <Layouts.Box minWidth="275px">
                  <Layouts.Flex alignItems="center">
                    <Layouts.IconLayout remove onClick={handleAssignEquipmentItemClear}>
                      <DeleteIcon
                        role="button"
                        aria-label={t('Text.Remove')}
                        tabIndex={0}
                        onKeyDown={e => handleKeyDown(e, handleAssignEquipmentItemClear)}
                      />
                    </Layouts.IconLayout>
                    <Select
                      label="Assign Equipment"
                      placeholder="Select assign equipment"
                      name={`${basePath}.droppedEquipmentItem`}
                      value={order.droppedEquipmentItem}
                      error={getIn(errors, `${basePath}.droppedEquipmentItem`)}
                      onSelectChange={handleDroppedEquipmentItemChange}
                      options={assignEquipmentOptions}
                    />
                  </Layouts.Flex>
                </Layouts.Box>
              </Layouts.Margin>
            ) : null}
            {isRegularOrder(order, basePath) &&
            !order.droppedEquipmentItemApplied &&
            isAssignEquipmentItemAllowed ? (
              <Layouts.Margin right="2">
                <Layouts.Box minWidth="275px">
                  <Typography
                    onClick={
                      order.billableServiceQuantity > 1
                        ? noop
                        : () => setFieldValue(`${basePath}.droppedEquipmentItemApplied`, true)
                    }
                    color="information"
                    variant="bodyMedium"
                    cursor={order.billableServiceQuantity > 1 ? 'not-allowed' : 'pointer'}
                  >
                    <Layouts.Flex alignItems="center">
                      <Layouts.Margin right="1">
                        <Layouts.Flex>
                          <AssignIcon />
                        </Layouts.Flex>
                      </Layouts.Margin>
                      Assign equipment for service
                    </Layouts.Flex>
                  </Typography>
                </Layouts.Box>
              </Layouts.Margin>
            ) : null}
          </Layouts.Flex>
          {equipmentAssignedOrderId ? (
            <Banner showIcon color="alert">
              {t(`${I18N_PATH}SelectedEquipmentAssignedExistingOrder`, {
                orderId: equipmentAssignedOrderId,
              })}
            </Banner>
          ) : null}
          {equipmentAssignedToMultiple ? (
            <Banner showIcon color="alert">
              {t(`${I18N_PATH}SelectedEquipmentAssigned`)}
            </Banner>
          ) : null}
          <FieldArray name={`${basePath}.lineItems`}>
            {({
              push,
              remove,
            }: {
              // eslint-disable-next-line react/no-unused-prop-types
              push(obj: Omit<IOrderLineItem, keyof IEntity>): void;
              // eslint-disable-next-line react/no-unused-prop-types
              remove(index: number): void;
            }) => {
              const addLineItem = () => {
                const billableItemOptionValue = lineItemOptions[0]?.value;
                const billableLineItemId = +billableItemOptionValue;
                const billableLineItem = lineItemStore.getById(billableLineItemId);

                push({
                  billableLineItemId,
                  quantity: 1,
                  units: billableLineItem?.unit,
                  customRatesGroupLineItemsId: undefined,
                  globalRatesLineItemsId: undefined,
                  price: undefined,
                  applySurcharges: billableLineItem?.applySurcharges ?? true,
                });

                const newLineItemIndex = order.lineItems?.length ?? 0;

                if (
                  billableLineItem &&
                  (!billableLineItem?.materialBasedPricing ||
                    (billableLineItem?.materialBasedPricing && order.materialId))
                ) {
                  calculateLineItemRates(
                    [
                      ...getLineItemsCalcRatesPayload(),
                      {
                        lineItemId: billableLineItemId,
                        materialId: billableLineItem?.materialBasedPricing
                          ? order.materialId
                          : undefined,
                      },
                    ],
                    newLineItemIndex,
                  );
                } else {
                  setFieldValue(`${basePath}.lineItems[${newLineItemIndex}].price`, undefined);
                }
              };

              return (
                <Layouts.Grid columns="20px repeat(6, 1fr)" columnGap="2">
                  <Layouts.Cell width={7}>
                    <Layouts.Margin top="2" bottom="2">
                      <Typography variant="headerFour">
                        {t(`${I18N_PATH}LineItemsPerService`)}
                      </Typography>
                    </Layouts.Margin>
                  </Layouts.Cell>
                  {order.lineItems?.map((lineItem, lineItemIndex) => {
                    const inactiveLineItem = getInactiveLineItem(lineItem.billableLineItemId);

                    return (
                      <React.Fragment key={`${basePath}.lineItems[${lineItemIndex}]`}>
                        <Layouts.Cell width={1} left={1} alignSelf="center">
                          <Layouts.IconLayout remove onClick={() => remove(lineItemIndex)}>
                            <DeleteIcon
                              role="button"
                              aria-label={t('Text.Remove')}
                              tabIndex={0}
                              onKeyDown={e => {
                                if (handleEnterOrSpaceKeyDown(e)) {
                                  remove(lineItemIndex);
                                }
                              }}
                            />
                          </Layouts.IconLayout>
                        </Layouts.Cell>
                        <Layouts.Cell width={3}>
                          <Select
                            label={`${t(`${I18N_PATH}LineItem`)}*`}
                            placeholder={t(`${I18N_PATH}SelectLineItem`)}
                            name={`${basePath}.lineItems[${lineItemIndex}].billableLineItemId`}
                            ariaLabel="Line item"
                            value={lineItem.billableLineItemId}
                            options={[
                              ...lineItemOptions,
                              ...(inactiveLineItem ? [inactiveLineItem] : []),
                            ]}
                            error={getIn(
                              errors,
                              `${basePath}.lineItems[${lineItemIndex}].billableLineItemId`,
                            )}
                            onSelectChange={(_name: string, value: number) => {
                              handleLineItemChange(value, lineItemIndex);
                            }}
                            nonClearable
                          />
                        </Layouts.Cell>
                        <Layouts.Cell width={1}>
                          <FormInput
                            label={`${t(`${I18N_PATH}QTY`)}*`}
                            name={`${basePath}.lineItems[${lineItemIndex}].quantity`}
                            ariaLabel="Quantity"
                            value={lineItem.quantity}
                            type="number"
                            limits={{
                              min: 1,
                            }}
                            countable
                            error={getIn(
                              errors,
                              `${basePath}.lineItems[${lineItemIndex}].quantity`,
                            )}
                            onChange={handleChange}
                          />
                        </Layouts.Cell>
                        <Layouts.Cell width={1}>
                          <Layouts.Margin bottom="0.5" top="0.5">
                            <Typography color="secondary" shade="desaturated" variant="bodyMedium">
                              {values.recurrentTemplateData.unlockOverrides
                                ? `${t(`${I18N_PATH}PriceWithCurrency`, {
                                    currencySymbol,
                                  })}*`
                                : t(`${I18N_PATH}Price`)}
                            </Typography>
                          </Layouts.Margin>
                          {values.recurrentTemplateData.unlockOverrides ? (
                            <FormInput
                              name={`${basePath}.lineItems[${lineItemIndex}].price`}
                              type="number"
                              ariaLabel="Price"
                              value={lineItem.price}
                              error={getIn(errors, `${basePath}.lineItems[${lineItemIndex}].price`)}
                              onChange={handleChange}
                            />
                          ) : (
                            <Layouts.Margin top="1">
                              <Layouts.Flex direction="column">
                                <Typography variant="bodyMedium">
                                  {formatCurrency(lineItem.price)}
                                </Typography>
                                <Typography color="alert" variant="bodySmall" textAlign="right">
                                  {getIn(errors, `${basePath}.lineItems[${lineItemIndex}].price`)}
                                </Typography>
                              </Layouts.Flex>
                            </Layouts.Margin>
                          )}
                        </Layouts.Cell>
                        <Layouts.Cell width={1}>
                          <FormInput
                            label={t(`${I18N_PATH}Total`, { currencySymbol })}
                            name={`${basePath}.lineItems[${lineItemIndex}].totalPrice`}
                            ariaLabel="Total"
                            value={formatCurrency(lineItem.quantity * (lineItem.price ?? 0))}
                            onChange={handleChange}
                            disabled
                          />
                        </Layouts.Cell>
                        <Layouts.Cell width={3} left={2}>
                          <Select
                            label={`${t(`${I18N_PATH}Material`)}`}
                            placeholder={t(`${I18N_PATH}SelectMaterial`)}
                            name={`${basePath}.lineItems[${lineItemIndex}].materialId`}
                            ariaLabel="Material"
                            value={lineItem?.materialId ?? undefined}
                            options={materialStore.values.map(material => ({
                              label: material.description,
                              value: material.id,
                              hint: material.manifested ? 'Manifested' : '',
                            }))}
                            error={getIn(
                              errors,
                              `${basePath}.lineItems[${lineItemIndex}].materialId`,
                            )}
                            onSelectChange={(name: string, value: number) => {
                              handleLineItemMaterialChange(value, lineItemIndex);
                              setFieldValue(name, value);
                            }}
                          />
                        </Layouts.Cell>
                        <Layouts.Cell width={1}>
                          <FormInput
                            label={`${t(`${I18N_PATH}Units`)}`}
                            name={`${basePath}.lineItems[${lineItemIndex}].units`}
                            ariaLabel="Units"
                            value={startCase(
                              getUnitLabel(lineItem.units, currentUser?.company?.unit),
                            )}
                            error={getIn(errors, `${basePath}.lineItems[${lineItemIndex}].units`)}
                            onChange={handleChange}
                            disabled
                          />
                        </Layouts.Cell>
                      </React.Fragment>
                    );
                  })}
                  <Layouts.Cell width={7}>
                    <Typography
                      variant="bodyMedium"
                      cursor="pointer"
                      color="information"
                      role="button"
                      tabIndex={0}
                      onClick={addLineItem}
                      onKeyDown={e => handleKeyDown(e, addLineItem)}
                    >
                      + {t(`${I18N_PATH}AddLineItem`)}
                    </Typography>
                  </Layouts.Cell>
                </Layouts.Grid>
              );
            }}
          </FieldArray>
        </Subsection>
      </Section>
      {!values.final && basePath !== 'delivery' && !values.id ? (
        <Section dashed>
          <Layouts.Padding padding="2">
            <Typography
              color="information"
              cursor="pointer"
              variant="bodyMedium"
              role="button"
              tabIndex={0}
              onClick={() => handleAddAdditionalOrder('final')}
              onKeyDown={e => handleKeyDownBasePathArgument(e, handleAddAdditionalOrder, 'final')}
            >
              <Layouts.Flex alignItems="center" justifyContent="center">
                <Layouts.IconLayout height="12px" width="12px">
                  <PlusIcon />
                </Layouts.IconLayout>
                {t(`${I18N_PATH}AddFinalOrder`)}
              </Layouts.Flex>
            </Typography>
          </Layouts.Padding>
        </Section>
      ) : null}
    </>
  );
};

export default observer(OrderSection);
