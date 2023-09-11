/* eslint-disable max-lines */ // disabled because it will need a huge refactor
/* eslint-disable complexity */ // disabled because it will need a huge refactor
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable no-unsafe-optional-chaining */
import React, { useCallback, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import * as Sentry from '@sentry/react';
import {
  Autocomplete,
  Banner,
  Calendar,
  Checkbox,
  ISelectOption,
  ISelectOptionGroup,
  Layouts,
  Select,
  TextInputElement,
} from '@starlightpro/shared-components';
import { isBefore, startOfTomorrow } from 'date-fns';
import { FieldArray, getIn, useFormikContext } from 'formik';
import { noop, startCase } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import {
  GlobalService,
  IOrderRatesCalculateRequest,
  JobSiteService,
  OrderService,
} from '@root/api';
import { AssignIcon, DeleteIcon, DuplicateIcon, ReminderIcon } from '@root/assets';
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
import ReminderForm from '@root/components/forms/ReminderConfigurationForm/components/ReminderForm/ReminderForm';
import { JobSiteModal, NewContactModal } from '@root/components/modals';
import PurchaseOrderSection from '@root/components/PurchaseOrderSection/PurchaseOrderSection';
import { BillableItemActionEnum, BusinessLineType, ClientRequestType } from '@root/consts';
import {
  addressFormat,
  getGlobalPriceType,
  getPriceType,
  getUnitLabel,
  handleEnterOrSpaceKeyDown,
  NotificationHelper,
} from '@root/helpers';
import { useDateIntl } from '@root/helpers/format/date';
import { ActionCode } from '@root/helpers/notifications/types';
import {
  useBusinessContext,
  useCrudPermissions,
  usePermission,
  usePrevious,
  useStores,
  useToggle,
  useUserContext,
} from '@root/hooks';
import { useIntl } from '@root/i18n/useIntl';
import { AddServiceButton } from '@root/pages/NewRequest/NewRequestForm/components/buttons';
import { isCustomPriceGroup } from '@root/pages/NewRequest/NewRequestForm/guards';
import RouteSelect from '@root/quickViews/components/RouteSelect/RouteSelect';
import { sanitizeJobSite } from '@root/stores/jobSite/sanitize';
import { IEntity, IOrderLineItem } from '@root/types';
import { AddressSuggestion } from '@root/types/responseEntities';

import { ApiError } from '@root/api/base/ApiError';
import { INewOrders } from '../../types';

import styles from '../../../../../css/styles.scss';
import { getDriverInstructionsTemplate } from '../../helpers/getDriverInstructions';
import { ContactField, MediaFiles, ReplaceEquipments } from './subsections';
import {
  IGenerateLineItemPropPathInput,
  IGenerateOrderPropPathInput,
  IOrderSection,
} from './types';

const jobSiteService = new JobSiteService();
const assignEquipmentItemServiceList = ['switch', 'final', 'dump&Return', 'relocate', 'reposition'];
const notificationServiceList = ['switch', 'final', 'dump&Return', 'liveLoad'];
const disposalSiteList = ['final', 'switch', 'liveLoad', 'dump&Return'];

const disposalSiteServicesList = [
  BillableItemActionEnum.switch,
  BillableItemActionEnum.final,
  BillableItemActionEnum.dumpReturn,
  BillableItemActionEnum.liveLoad,
];

const hasPermits = [BusinessLineType.rollOff, BusinessLineType.portableToilets];
const hasOkToRoll = [BusinessLineType.rollOff, BusinessLineType.portableToilets];
const hasEquipmentReplacementPermits = [
  ...disposalSiteServicesList,
  BillableItemActionEnum.reposition,
  BillableItemActionEnum.relocate,
];

const generateOrderPropsPath = ({ orderIndex, property }: IGenerateOrderPropPathInput) =>
  `orders[${orderIndex}].${property}`;

const generateLineItemsPropsPath = ({
  orderIndex,
  lineItemIndex,
  property,
}: IGenerateLineItemPropPathInput) =>
  generateOrderPropsPath({
    orderIndex,
    property: `lineItems[${lineItemIndex}].${property}`,
  });

const I18N_PATH = 'pages.NewRequest.NewRequestForm.forms.Order.sections.Order.Text.';

const OrderSection: React.FC<IOrderSection> = ({ serviceAreaId }) => {
  const {
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
    orderStore,
    orderRequestStore,
    i18nStore,
  } = useStores();

  const [isNewContactModalOpen, toggleIsNewContactModalOpen] = useToggle();
  const [isJobSiteModalOpen, toggleJobSiteModalOpen] = useToggle();

  const { businessUnitId } = useBusinessContext();

  const intl = useIntl();
  const { t } = useTranslation();

  const { currentUser } = useUserContext();

  const { formatCurrency, formatPhoneNumber, currencySymbol, firstDayOfWeek } = intl;

  const selectedCustomer = customerStore.selectedEntity;
  const selectedJobSite = jobSiteStore.selectedEntity;

  const {
    values,
    errors,
    initialValues,
    handleChange,
    setFieldValue,
    setFieldError,
    validateField,
  } = useFormikContext<INewOrders>();

  const isRegular =
    values.type === ClientRequestType.RegularOrder ||
    values.type === ClientRequestType.OrderRequest ||
    values.type === ClientRequestType.SubscriptionOrder;

  const isRegularNonSubscription =
    values.type === ClientRequestType.RegularOrder ||
    values.type === ClientRequestType.OrderRequest;

  const [canViewMaterials] = useCrudPermissions('configuration', 'materials');
  const [canViewEquipment] = useCrudPermissions('configuration', 'equipment');
  const [canViewDisposalSites] = useCrudPermissions('configuration', 'disposal-sites');
  const [canViewMaterialProfiles] = useCrudPermissions('configuration', 'material-profiles');
  const [canViewPermits] = useCrudPermissions('configuration', 'permits');
  const [canViewBrokers] = useCrudPermissions('configuration', 'brokers');
  const [canViewHaulers] = useCrudPermissions('configuration', 'third-party-haulers');

  const driverInstructionsPreFill = getDriverInstructionsTemplate(selectedCustomer, {
    workOrderNotes: values?.workOrderNote,
  });

  useEffect(() => {
    billableServiceStore.cleanup();
    lineItemStore.cleanup();
    permitStore.cleanup();
    orderStore.setAssignEquipmentOptions([]);
    orderStore.resetAssignedEquipmentItems();
    materialStore.cleanup();
    contactStore.cleanup();

    orderStore.setAssignEquipmentOptions([]);
    orderStore.resetAssignedEquipmentItems();

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

    businessLineStore.request();

    if (canViewMaterials) {
      materialStore.request({
        businessLineId: values.businessLineId,
        activeOnly: true,
      });
    } else {
      NotificationHelper.error('orderData', ActionCode.ACCESS_DENIED, 'materials');
    }

    if (selectedCustomer) {
      contactStore.requestByCustomer({ customerId: selectedCustomer.id, activeOnly: true });
    }
  }, [
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
    orderStore,
    values.serviceAreaId,
  ]);

  const businessLineType = businessLineStore.getById(values.businessLineId)?.type;

  const handleMaterialSelectFocus = useCallback(
    async (orderIndex: number, equipmentItemId?: number) => {
      if (equipmentItemId) {
        const materials = await materialStore.requestByEquipmentItem(equipmentItemId, {
          activeOnly: true,
        });
        const materialOptions: ISelectOption[] =
          materials?.map(material => ({
            label: material.description,
            value: material.id,
            hint: material.manifested ? 'Manifested' : '',
          })) ?? [];

        setFieldValue(
          generateOrderPropsPath({
            orderIndex,
            property: 'equipmentItemsMaterialsOptions',
          }),
          materialOptions,
        );
      } else {
        setFieldValue(
          generateOrderPropsPath({
            orderIndex,
            property: 'equipmentItemsMaterialsOptions',
          }),
          [],
        );
        materialStore.cleanup();
      }
    },
    [materialStore, setFieldValue],
  );

  useEffect(() => {
    // Request Materials for init service in Request Order
    if (values.type === ClientRequestType.OrderRequest) {
      const { equipmentItemId } = values;

      if (equipmentItemId) {
        handleMaterialSelectFocus(0, equipmentItemId);
      }
    }
    // values.serviceAreaId is needed for re-fetching materials
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.equipmentItemId, values.type, values.serviceAreaId, handleMaterialSelectFocus]);

  const generateDriverInstructionsTemplate = useCallback(
    (droppedEquipmentItem?: string) =>
      droppedEquipmentItem ? `${t(`${I18N_PATH}PickUpEquipment`)} #${droppedEquipmentItem}. ` : '',
    [t],
  );

  const requestDroppedEquipmentItems = useCallback(
    (equipmentItemId: number, orderIndex: number) => {
      const equipmentItemSize = equipmentItemStore.getById(equipmentItemId)?.shortDescription;

      if (selectedJobSite && selectedCustomer && equipmentItemSize) {
        orderStore.loadAssignEquipmentOptions(orderIndex, {
          jobSiteId: selectedJobSite.id,
          customerId: selectedCustomer.id,
          equipmentItemSize,
          businessUnitId,
          businessLineId: values.businessLineId,
        });
      }
    },
    [
      equipmentItemStore,
      selectedJobSite,
      selectedCustomer,
      businessUnitId,
      values.businessLineId,
      orderStore,
    ],
  );

  const handleDroppedEquipmentItemChange = useCallback(
    (field: string, value: string, orderIndex: number) => {
      setFieldValue(
        generateOrderPropsPath({ property: 'droppedEquipmentItemComment', orderIndex }),
        generateDriverInstructionsTemplate(value),
      );
      setFieldValue(field, value);

      const oldDroppedEquipment = values.orders[orderIndex].droppedEquipmentItem;

      if (oldDroppedEquipment) {
        orderStore.removeAssignedEquipmentItem(oldDroppedEquipment);
      }

      orderStore.addAssignedEquipmentItem(value);
    },
    [generateDriverInstructionsTemplate, setFieldValue, orderStore, values.orders],
  );

  const handleDriverInstructionsChange = useCallback(
    (e, orderIndex: number) => {
      handleChange(e);
      setFieldValue(
        generateOrderPropsPath({ property: 'droppedEquipmentItemComment', orderIndex }),
        '',
      );
    },
    [handleChange, setFieldValue],
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

  const handleAssignEquipmentItemClear = (orderIndex: number) => {
    const droppedEquipmentId = values.orders[orderIndex].droppedEquipmentItem;

    if (droppedEquipmentId) {
      orderStore.removeAssignedEquipmentItem(droppedEquipmentId);
    }

    setFieldValue(
      generateOrderPropsPath({ property: 'droppedEquipmentItem', orderIndex }),
      undefined,
    );
    setFieldValue(
      generateOrderPropsPath({ property: 'droppedEquipmentItemComment', orderIndex }),
      '',
    );
    setFieldValue(
      generateOrderPropsPath({ property: 'droppedEquipmentItemApplied', orderIndex }),
      false,
    );
  };

  const handleBillableQuantityChange = (
    e: React.ChangeEvent<TextInputElement>,
    orderIndex: number,
  ) => {
    handleChange(e);
    if (Number(e.target.value) > 1) {
      handleAssignEquipmentItemClear(orderIndex);
    }
  };

  const getLineItemsCalcRatesPayload = useCallback(
    orderIndex => {
      const order = values.orders[orderIndex];

      return (
        order.lineItems?.map(lineItem => {
          const billableLineItem = lineItemStore.getById(lineItem.billableLineItemId);

          return {
            lineItemId: lineItem.billableLineItemId,
            materialId: billableLineItem?.materialBasedPricing
              ? lineItem.materialId ?? order.materialId
              : null,
          };
        }) ?? []
      );
    },
    [lineItemStore, values.orders],
  );

  const handleReminderClear = useCallback(
    (orderIndex: number) => {
      setFieldValue(generateOrderPropsPath({ property: 'notifyDayBefore', orderIndex }), null);
      setFieldValue(generateOrderPropsPath({ property: 'notificationApplied', orderIndex }), false);
    },
    [setFieldValue],
  );

  const handleRatesCalculation = useCallback(
    async ({
      billableServiceId: propsBillableServiceId,
      materialId: propsMaterialId,
      customRatesGroupId: propsCustomRatesGroupId,
      orderIndex,
    }: {
      customRatesGroupId?: number;
      orderIndex: number;
      billableServiceId?: number;
      materialId?: number;
    }) => {
      const currentOrder = values.orders[orderIndex];
      const customRatesGroupId = propsCustomRatesGroupId ?? currentOrder.customRatesGroupId;

      const type = customRatesGroupId === 0 ? 'global' : 'custom';

      const billableServiceId = propsBillableServiceId ?? currentOrder.billableServiceId;
      const billableService = billableServiceStore.getById(billableServiceId);

      const equipmentItemId = billableService?.equipmentItemId;
      const materialId = billableService?.materialBasedPricing
        ? propsMaterialId ?? currentOrder.materialId
        : null;

      const { lineItems } = currentOrder;

      if (type && billableServiceId && equipmentItemId && (materialId || materialId === null)) {
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
          billableLineItems: lineItems?.length
            ? getLineItemsCalcRatesPayload(orderIndex)
            : undefined,
        };

        try {
          const rates = await OrderService.calculateRates(payload);

          if (rates) {
            const global = rates.globalRates;
            const custom = rates.customRates;

            global?.globalRatesLineItems?.forEach(rate => {
              const lineItemIndex = currentOrder.lineItems.findIndex(
                lineItem => lineItem.billableLineItemId === rate.lineItemId,
              );

              if (lineItemIndex > -1) {
                setFieldValue(
                  generateLineItemsPropsPath({
                    orderIndex,
                    lineItemIndex,
                    property: 'price',
                  }),
                  rate.price,
                );
              }
            });

            custom?.customRatesLineItems?.forEach(rate => {
              const lineItemIndex = currentOrder.lineItems.findIndex(
                lineItem => lineItem.billableLineItemId === rate.lineItemId,
              );

              if (lineItemIndex > -1) {
                setFieldValue(
                  generateLineItemsPropsPath({
                    orderIndex,
                    lineItemIndex,
                    property: 'price',
                  }),
                  rate.price,
                );
              }
            });

            setFieldValue(
              generateOrderPropsPath({
                orderIndex,
                property: 'globalRatesSurcharges',
              }),
              global?.globalRatesSurcharges,
            );

            setFieldValue(
              generateOrderPropsPath({
                orderIndex,
                property: 'customRatesSurcharges',
              }),
              custom?.customRatesSurcharges,
            );

            setFieldValue(
              generateOrderPropsPath({
                orderIndex,
                property: 'billableServicePrice',
              }),
              custom?.customRatesService?.price ?? global?.globalRatesService?.price,
            );
            setFieldError(
              generateOrderPropsPath({
                orderIndex,
                property: 'billableServicePrice',
              }),
              undefined,
            );
            setFieldValue(
              generateOrderPropsPath({
                orderIndex,
                property: 'globalRatesServicesId',
              }),
              global?.globalRatesService?.id,
            );
            setFieldValue(
              generateOrderPropsPath({
                orderIndex,
                property: 'customRatesGroupServicesId',
              }),
              custom?.customRatesService?.id,
            );
          }
        } catch (error: unknown) {
          const typedError = error as ApiError;
          NotificationHelper.error(
            'calculateServiceRates',
            typedError?.response?.code as ActionCode,
          );
          Sentry.addBreadcrumb({
            category: 'Order',
            message: `Order Rates Calculation Error ${JSON.stringify(typedError?.message)}`,
            data: {
              ...payload,
            },
          });
          Sentry.captureException(typedError);
        }
      }
    },
    [
      values.orders,
      values.businessLineId,
      billableServiceStore,
      businessUnitId,
      getLineItemsCalcRatesPayload,
      setFieldValue,
      setFieldError,
    ],
  );

  const handleSelectRatesGroupChange = useCallback(
    (orderIndex: number, selectedDate?: Date) => {
      const startDate = selectedDate ?? values.orders[orderIndex].serviceDate;
      let selectedGroup;

      if (selectedCustomer && selectedJobSite && startDate) {
        (async () => {
          try {
            selectedGroup = await OrderService.selectRatesGroup({
              businessUnitId,
              businessLineId: values.businessLineId,
              customerId: selectedCustomer.id,
              customerJobSiteId: values.customerJobSiteId ?? null,
              date: startDate,
              serviceAreaId,
            });

            setFieldValue(
              generateOrderPropsPath({ property: 'selectedGroup', orderIndex }),
              selectedGroup,
            );
          } catch (error) {
            setFieldValue(generateOrderPropsPath({ property: 'selectedGroup', orderIndex }), null);
            NotificationHelper.error('default');
          }

          let customRatesGroupId;

          if (selectedGroup && isCustomPriceGroup(selectedGroup)) {
            setFieldValue(
              generateOrderPropsPath({ property: 'customRatesGroupId', orderIndex }),
              selectedGroup.selectedId,
            );

            customRatesGroupId = selectedGroup.selectedId;
          }

          handleRatesCalculation({ customRatesGroupId: customRatesGroupId ?? 0, orderIndex });
        })();
      }
    },
    [
      businessUnitId,
      handleRatesCalculation,
      selectedCustomer,
      selectedJobSite,
      setFieldValue,
      values.businessLineId,
      values.customerJobSiteId,
      values.orders,
      serviceAreaId,
    ],
  );

  const handleStartDateChange = useCallback(
    (name: string, date: Date | null, index: number) => {
      setFieldValue(name, date ?? undefined);
      handleSelectRatesGroupChange(index, date ?? undefined);
    },
    [handleSelectRatesGroupChange, setFieldValue],
  );

  const handleAssignEquipment = useCallback(
    (orderIndex: number) => {
      setFieldValue(
        generateOrderPropsPath({
          property: 'droppedEquipmentItemApplied',
          orderIndex,
        }),
        true,
      );
    },
    [setFieldValue],
  );

  const prevOrders = usePrevious(values.orders) ?? [];
  const prevCustomerJobSiteId = usePrevious(values.customerJobSiteId);
  const prevServiceAreaId = usePrevious(serviceAreaId);

  useEffect(() => {
    if (prevServiceAreaId !== serviceAreaId) {
      handleSelectRatesGroupChange(0);
    }
  }, [handleSelectRatesGroupChange, prevServiceAreaId, serviceAreaId]);

  useEffect(() => {
    if (
      (values.customerJobSiteId !== undefined &&
        prevCustomerJobSiteId !== values.customerJobSiteId) ||
      (values.orders.length > prevOrders.length &&
        values.orders[values.orders.length - 1].customRatesGroupId === 0)
    ) {
      handleSelectRatesGroupChange(values.orders.length - 1);
    }
  }, [
    handleSelectRatesGroupChange,
    prevCustomerJobSiteId,
    prevOrders.length,
    values.customerJobSiteId,
    values.orders,
  ]);

  const handleBillableServiceChange = (_: string, prevValue: number, orderIndex: number) => {
    const value = +prevValue || undefined;

    const billableService = billableServiceStore.getById(value);
    const equipmentItemId = billableService?.equipmentItem?.id;

    handleMaterialSelectFocus(orderIndex, equipmentItemId);

    setFieldValue(generateOrderPropsPath({ orderIndex, property: 'billableServiceId' }), value);
    setFieldValue(generateOrderPropsPath({ orderIndex, property: 'materialId' }), undefined);
    setFieldValue(
      generateOrderPropsPath({ orderIndex, property: 'billableServicePrice' }),
      undefined,
    );
    setFieldValue(
      generateOrderPropsPath({ orderIndex, property: 'billableServiceApplySurcharges' }),
      billableService?.applySurcharges,
    );
    setFieldValue(generateOrderPropsPath({ property: 'jobSite2Id', orderIndex }), undefined);
    setFieldValue(generateOrderPropsPath({ property: 'disposalSiteId', orderIndex }), undefined);
    setFieldValue(generateOrderPropsPath({ property: 'notifyDayBefore', orderIndex }), undefined);
    setFieldValue(
      generateOrderPropsPath({ property: 'equipmentItemId', orderIndex }),
      equipmentItemId,
    );

    if (
      canViewEquipment &&
      assignEquipmentItemServiceList.includes(billableServiceStore.getById(value)?.action ?? '') &&
      equipmentItemId
    ) {
      requestDroppedEquipmentItems(equipmentItemId, orderIndex);
    } else {
      orderStore.maybeHideAssignEquipmentOptions(orderIndex);

      const droppedEquipmentPath = generateOrderPropsPath({
        property: 'droppedEquipmentItem',
        orderIndex,
      });

      const droppedEquipment: string = getIn(values, droppedEquipmentPath);

      if (droppedEquipment) {
        orderStore.removeAssignedEquipmentItem(droppedEquipment);
      }

      setFieldValue(droppedEquipmentPath, undefined);
      setFieldValue(
        generateOrderPropsPath({ property: 'droppedEquipmentItemApplied', orderIndex }),
        false,
      );
      setFieldValue(generateOrderPropsPath({ property: 'notificationApplied', orderIndex }), false);
    }

    if (billableService) {
      handleRatesCalculation({
        orderIndex,
        billableServiceId: billableService.id,
      });
    }
  };

  const handlePriceGroupChange = useCallback(
    (name: string, value: number, orderIndex: number) => {
      setFieldValue(name, value);
      handleRatesCalculation({ customRatesGroupId: value, orderIndex });
    },
    [handleRatesCalculation, setFieldValue],
  );

  const handleThirdPartyHaulerChange = useCallback(
    (name: string, value?: number | string) => {
      setFieldValue(name, value);
      const payments = values.payments.map(payment => ({
        ...payment,
        deferredPayment: undefined,
        deferredUntil: undefined,
      }));

      setFieldValue('payments', payments);
      values.payments.forEach((_, index) => {
        setFieldError(`payments[${index}].deferredUntil`, undefined);
      });
    },
    [setFieldValue, setFieldError, values.payments],
  );

  const calculateLineItemRates = useCallback(
    (
      lineItems: { lineItemId: number; materialId?: number | null }[],
      orderIndex: number,
      lineItemIndex: number,
    ) => {
      const currentOrder = values.orders[orderIndex];

      const { lineItemId } = lineItems[lineItemIndex];
      const materialId = lineItems[lineItemIndex].materialId ?? null;

      if (currentOrder.selectedGroup) {
        (async () => {
          const group = currentOrder.selectedGroup;

          if (group) {
            const payload: IOrderRatesCalculateRequest = {
              businessUnitId: +businessUnitId,
              businessLineId: +values.businessLineId,
              type: currentOrder.customRatesGroupId === 0 ? 'global' : group.level,
              billableLineItems: lineItems.length ? lineItems : undefined,
            };

            if (group.level === 'custom' && currentOrder.customRatesGroupId !== 0) {
              payload.customRatesGroupId = currentOrder.customRatesGroupId;
            }

            try {
              const rates = await OrderService.calculateRates(payload);

              if (rates) {
                const global = rates.globalRates;
                const custom = rates.customRates;

                setFieldValue(
                  generateOrderPropsPath({
                    orderIndex,
                    property: 'globalRatesSurcharges',
                  }),
                  global?.globalRatesSurcharges,
                );

                setFieldValue(
                  generateOrderPropsPath({
                    orderIndex,
                    property: 'customRatesSurcharges',
                  }),
                  custom?.customRatesSurcharges,
                );

                const globalRate = global?.globalRatesLineItems?.find(
                  globalRate =>
                    globalRate.lineItemId === lineItemId && globalRate.materialId === materialId,
                );
                const customRate = custom?.customRatesLineItems?.find(
                  customRate =>
                    customRate.lineItemId === lineItemId && customRate.materialId === materialId,
                );

                setFieldValue(
                  generateLineItemsPropsPath({
                    orderIndex,

                    lineItemIndex,
                    property: 'globalRatesLineItemsId',
                  }),
                  globalRate?.id,
                );
                setFieldValue(
                  generateLineItemsPropsPath({
                    orderIndex,

                    lineItemIndex,
                    property: 'customRatesGroupLineItemsId',
                  }),
                  customRate?.id,
                );
                setFieldValue(
                  generateLineItemsPropsPath({
                    orderIndex,

                    lineItemIndex,
                    property: 'price',
                  }),
                  customRate?.price ?? globalRate?.price,
                );
              }
            } catch (error: unknown) {
              const typedError = error as ApiError;
              NotificationHelper.error(
                'calculateLineItemRates',
                typedError.response.code as ActionCode,
              );

              setFieldValue(
                generateLineItemsPropsPath({
                  orderIndex,
                  lineItemIndex,
                  property: 'price',
                }),
                undefined,
              );
            }
          }
        })();
      }
    },
    [setFieldValue, values.orders, businessUnitId, values.businessLineId],
  );

  const handleMaterialChange = useCallback(
    (_: string, value: number, orderIndex: number) => {
      setFieldValue(
        generateOrderPropsPath({ orderIndex, property: 'materialId' }),
        value || undefined,
      );
      setFieldValue(
        generateOrderPropsPath({ orderIndex, property: 'billableServicePrice' }),
        undefined,
      );
      setFieldValue(
        generateOrderPropsPath({ property: 'materialProfileId', orderIndex }),
        undefined,
      );
      setFieldValue(generateOrderPropsPath({ property: 'disposalSiteId', orderIndex }), undefined);

      const order = values.orders[orderIndex];

      handleRatesCalculation({
        orderIndex,
        materialId: value,
      });

      if (value) {
        const lineItemIndicesForRates = order.lineItems.reduce<number[]>((acc, cur, i) => {
          const billableLineItem = lineItemStore.getById(cur.billableLineItemId);

          if (billableLineItem?.materialBasedPricing && !cur?.materialId) {
            acc.push(i);
          }

          return acc;
        }, []);

        if (lineItemIndicesForRates?.length) {
          const lineItems = getLineItemsCalcRatesPayload(orderIndex).map((lineItem, i) =>
            lineItemIndicesForRates.includes(i) ? { ...lineItem, materialId: value } : lineItem,
          );

          Promise.all(
            lineItemIndicesForRates.map(lineItemIndex =>
              calculateLineItemRates(lineItems, orderIndex, lineItemIndex),
            ),
          );
        }
      }
    },
    [
      calculateLineItemRates,
      getLineItemsCalcRatesPayload,
      handleRatesCalculation,
      lineItemStore,
      setFieldValue,
      values.orders,
    ],
  );

  const handleLineItemChange = useCallback(
    (lineItemId: number, orderIndex: number, lineItemIndex: number) => {
      setFieldValue(
        generateLineItemsPropsPath({
          orderIndex,
          lineItemIndex,
          property: 'billableLineItemId',
        }),
        lineItemId,
      );
      setFieldValue(
        generateLineItemsPropsPath({
          orderIndex,
          lineItemIndex,
          property: 'materialId',
        }),
        undefined,
      );

      const order = values.orders[orderIndex];
      const billableLineItem = lineItemStore.getById(lineItemId);
      const lineItems = getLineItemsCalcRatesPayload(orderIndex);

      setFieldValue(
        generateLineItemsPropsPath({
          orderIndex,
          lineItemIndex,
          property: 'units',
        }),
        billableLineItem?.unit,
      );
      setFieldValue(
        generateLineItemsPropsPath({
          orderIndex,
          lineItemIndex,
          property: 'applySurcharges',
        }),
        billableLineItem?.applySurcharges,
      );
      lineItems.splice(lineItemIndex, 1, {
        lineItemId,
        materialId: billableLineItem?.materialBasedPricing ? order.materialId : undefined,
      });

      if (
        billableLineItem &&
        (!billableLineItem?.materialBasedPricing ||
          (billableLineItem?.materialBasedPricing && order.materialId))
      ) {
        calculateLineItemRates(lineItems, orderIndex, lineItemIndex);
      } else {
        setFieldValue(
          generateLineItemsPropsPath({
            orderIndex,
            lineItemIndex,
            property: 'price',
          }),
          undefined,
        );
      }
    },
    [
      calculateLineItemRates,
      getLineItemsCalcRatesPayload,
      lineItemStore,
      setFieldValue,
      values.orders,
    ],
  );

  const handleLineItemMaterialChange = useCallback(
    (materialId: number, orderIndex: number, lineItemIndex: number) => {
      const lineItems = getLineItemsCalcRatesPayload(orderIndex);

      const order = values.orders[orderIndex];

      const lineItem = order.lineItems[lineItemIndex];
      const billableLineItem = lineItemStore.getById(lineItem.billableLineItemId);

      if (
        !billableLineItem?.materialBasedPricing ||
        (billableLineItem.materialBasedPricing && (materialId || order.materialId))
      ) {
        lineItems.splice(lineItemIndex, 1, {
          lineItemId: lineItem.billableLineItemId,
          materialId: billableLineItem?.materialBasedPricing
            ? materialId || order.materialId
            : undefined,
        });
        calculateLineItemRates(lineItems, orderIndex, lineItemIndex);
      } else {
        setFieldValue(
          generateLineItemsPropsPath({
            orderIndex,
            lineItemIndex,
            property: 'price',
          }),
          undefined,
        );
      }
    },
    [
      getLineItemsCalcRatesPayload,
      values.orders,
      lineItemStore,
      calculateLineItemRates,
      setFieldValue,
    ],
  );

  const handleMaterialProfileChange = useCallback(
    (_: string, value: number, orderIndex: number) => {
      const disposalSiteId = materialProfileStore.getById(value)?.disposalSiteId;

      setFieldValue(generateOrderPropsPath({ property: 'materialProfileId', orderIndex }), value);

      const disposalSiteFieldName = generateOrderPropsPath({
        property: 'disposalSiteId',
        orderIndex,
      });

      setFieldValue(disposalSiteFieldName, disposalSiteId);
      validateField(disposalSiteFieldName);
    },
    [materialProfileStore, validateField, setFieldValue],
  );

  const handleJobSite2AutocompleteSelect = useCallback(
    (item: AddressSuggestion, orderIndex: number) => {
      setFieldValue(
        generateOrderPropsPath({ property: 'jobSite2Label', orderIndex }),
        addressFormat({
          ...item,
          addressLine1: item.address,
          addressLine2: '',
          region: i18nStore.region,
        }),
      );
      setFieldValue(generateOrderPropsPath({ property: 'jobSite2IdSearchString', orderIndex }), '');
      setFieldValue(generateOrderPropsPath({ property: 'jobSite2Id', orderIndex }), item.id);
      setFieldError(generateOrderPropsPath({ property: 'jobSite2Id', orderIndex }), undefined);
    },
    [i18nStore.region, setFieldError, setFieldValue],
  );

  const handleJobSite2Clear = useCallback(
    (orderIndex: number) => {
      setFieldValue(generateOrderPropsPath({ property: 'jobSite2Label', orderIndex }), undefined);
      setFieldValue(generateOrderPropsPath({ property: 'jobSite2IdSearchString', orderIndex }), '');
      setFieldValue(generateOrderPropsPath({ property: 'jobSite2Id', orderIndex }), undefined);
    },
    [setFieldValue],
  );

  const handleJobSite2FormSubmit = useCallback(
    async (newJobSite: IJobSiteData, orderIndex: number) => {
      try {
        sanitizeJobSite(newJobSite);
        const jobSite = await jobSiteService.create(newJobSite);

        if (jobSite) {
          setFieldValue(
            generateOrderPropsPath({ property: 'jobSite2IdSearchString', orderIndex }),
            addressFormat(jobSite.address),
          );
          setFieldValue(generateOrderPropsPath({ property: 'jobSite2Id', orderIndex }), jobSite.id);
        }

        NotificationHelper.success('create', 'Job Site');
      } catch (error: unknown) {
        const typedError = error as ApiError;
        NotificationHelper.error('create', typedError.response.code as ActionCode, 'Job Site');
      } finally {
        toggleJobSiteModalOpen();
      }
    },
    [setFieldValue, toggleJobSiteModalOpen],
  );

  const getMaterialProfileOptions = useCallback(
    (materialId?: number) => [
      {
        label: 'Ignore Material Profile',
        value: 0,
      },
      ...materialProfileStore.sortedValues
        .filter(x => x.materialId === materialId)
        .map(materialProfile => ({
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

  const billableServiceOptions: ISelectOption[] = useMemo(
    () =>
      billableServiceStore.sortedValues
        .filter(option => option.active)
        .filter(service => {
          if (values.type !== ClientRequestType.SubscriptionOrder) {
            return true;
          }

          if (
            [BillableItemActionEnum.delivery, BillableItemActionEnum.final].includes(service.action)
          ) {
            return false;
          }

          return true;
        })
        .map(billableService => ({
          label: billableService.description,
          value: billableService.id,
          hint: billableService.equipmentItem?.shortDescription,
          COEHint: billableService.equipmentItem?.customerOwned,
        })),
    [billableServiceStore.sortedValues, values.type],
  );

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
        footer: canCreateContacts ? <ContactField /> : undefined,
        onFooterClick: canCreateContacts ? toggleIsNewContactModalOpen : undefined,
      },
    ],
    [canCreateContacts, contactStore.values, toggleIsNewContactModalOpen],
  );

  const getPriceGroupOptions = useCallback(
    (orderIndex: number): ISelectOption[] => {
      const options = [];
      const group = values.orders[orderIndex].selectedGroup;

      if (group && isCustomPriceGroup(group)) {
        const selectedGroupsOptions = group.customRatesGroups.map(customRatesGroup => ({
          label: customRatesGroup.description,
          value: customRatesGroup.id,
          hint: getPriceType(customRatesGroup, t),
        }));

        options.push(...selectedGroupsOptions);
      }

      options.push({
        label: globalRateStore.values[0].description,
        value: globalRateStore.values[0].id,
        hint: getGlobalPriceType(t),
      });

      return options;
    },
    [globalRateStore.values, t, values.orders],
  );

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
        footer: canCreateContacts ? <ContactField /> : undefined,
        onFooterClick: canCreateContacts ? toggleIsNewContactModalOpen : undefined,
      },
    ],
    [contactStore.values, canCreateContacts, toggleIsNewContactModalOpen, formatPhoneNumber],
  );

  const getPhoneNumber = useCallback(
    (value: string | number): string | undefined =>
      phoneNumbers[0].options.find(contact => contact.value === value)?.label,
    [phoneNumbers],
  );

  const setCallOnWayPhoneNumberAndId = useCallback(
    (name: string, value: string | number, orderIndex: number): void => {
      const callOnWayPhoneNumber = getPhoneNumber(value);

      setFieldValue(name, value);
      setFieldValue(
        generateOrderPropsPath({
          property: 'callOnWayPhoneNumber',
          orderIndex,
        }),
        callOnWayPhoneNumber,
      );
    },
    [setFieldValue, getPhoneNumber],
  );

  const setTextOnWayPhoneNumberAndId = useCallback(
    (name: string, value: string | number, orderIndex: number): void => {
      const textOnWayPhoneNumber = getPhoneNumber(value);

      setFieldValue(name, value);
      setFieldValue(
        generateOrderPropsPath({
          property: 'textOnWayPhoneNumber',
          orderIndex,
        }),
        textOnWayPhoneNumber,
      );
    },
    [setFieldValue, getPhoneNumber],
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
          label: t(`${I18N_PATH}NotifyByText`),
          disabled: isPhoneDisabled,
        },
        {
          value: 'byEmail',
          label: t(`${I18N_PATH}NotifyByEmail`),
          disabled: isEmailDisabled,
        },
      ];
    },
    [contactStore, t, values.jobSiteContactId],
  );

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLOrSVGElement>,
    callback: (i: number) => void,
    index: number,
  ) => {
    if (handleEnterOrSpaceKeyDown(e)) {
      callback(index);
    }
  };

  const jobSite2Id = values.orders[0]?.jobSite2Id;

  useEffect(() => {
    if (values.type === ClientRequestType.OrderRequest && jobSite2Id) {
      const query = async () => {
        const jobSite = await jobSiteStore.requestById(jobSite2Id);

        if (jobSite) {
          setFieldValue(
            generateOrderPropsPath({ property: 'jobSite2Label', orderIndex: 0 }),
            addressFormat({ ...jobSite.address, addressLine2: '' }),
          );
        }
      };

      query();
    }
  }, [
    billableServiceStore,
    businessLineType,
    jobSiteStore,
    setFieldValue,
    values.type,
    jobSite2Id,
  ]);

  const { dateFormat } = useDateIntl();

  const getMedialAuthor = () => {
    if (values?.contractorContact) {
      // If order request created from contractor
      return [values.contractorContact.firstName, values.contractorContact.lastName].join(' ');
    }
    // If order request created from SP
    return selectedCustomer?.name;
  };

  const getMedialTimestamp = () => {
    if (values?.contractorContact) {
      return orderRequestStore.selectedEntity?.updatedAt;
    }
    return orderRequestStore.selectedEntity?.createdAt;
  };

  // there is no sense for this form part without LoB
  if (!businessLineType) {
    return null;
  }

  return (
    <>
      <Helmet title={t('Titles.OrderRequestDetails')} />
      <NewContactModal
        isOpen={isNewContactModalOpen}
        onFormSubmit={handleNewContactFormSubmit}
        onClose={toggleIsNewContactModalOpen}
      />
      <FieldArray name="orders">
        {({ push, remove }) =>
          values.orders.map((order, orderIndex) => {
            const billableServiceAction = billableServiceStore.getById(
              order.billableServiceId,
            )?.action;

            const material = materialStore.getById(order.materialId);

            const priceGroupOptions = getPriceGroupOptions(orderIndex);

            const isNotificationDisabled = isBefore(order.serviceDate, startOfTomorrow());

            const isAssignEquipmentItemAllowed = assignEquipmentItemServiceList.includes(
              billableServiceStore.getById(order.billableServiceId)?.action ?? '',
            );

            const isNotificationAllowed = notificationServiceList.includes(
              billableServiceStore.getById(order.billableServiceId)?.action ?? '',
            );

            const equipmentAssignedOrderId =
              order.droppedEquipmentItem &&
              orderStore.assignEquipmentOptions.find(
                option => option.id === order.droppedEquipmentItem,
              )?.orderId;
            const equipmentAssignedToMultiple =
              order.droppedEquipmentItem &&
              orderStore.assignedEquipmentItems.filter(id => id === order.droppedEquipmentItem)
                .length > 1;

            return (
              <React.Fragment key={`orders[${orderIndex}]`}>
                <Section>
                  <JobSiteModal
                    isOpen={isJobSiteModalOpen}
                    onFormSubmit={jobSite => handleJobSite2FormSubmit(jobSite, orderIndex)}
                    onClose={toggleJobSiteModalOpen}
                    withMap={false}
                  />
                  <Subsection>
                    <>
                      <Layouts.Margin bottom="1">
                        <Layouts.Flex justifyContent="space-between">
                          <Typography variant="headerThree">
                            {isRegular ? t(`${I18N_PATH}OrderDetails`) : null}
                            {values.type === ClientRequestType.NonServiceOrder ||
                            values.type === ClientRequestType.SubscriptionNonService
                              ? t(`${I18N_PATH}NonServiceOrderDetails`)
                              : null}
                          </Typography>
                          {isRegularNonSubscription ? (
                            <Layouts.Flex justifyContent="space-between">
                              {values.orders.length < 10 ? (
                                <Layouts.IconLayout onClick={() => push(order)}>
                                  <Layouts.Flex
                                    alignItems="center"
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={e => {
                                      if (handleEnterOrSpaceKeyDown(e)) {
                                        push(order);
                                      }
                                    }}
                                  >
                                    <DuplicateIcon />
                                    <Typography
                                      variant="bodyMedium"
                                      color="information"
                                      cursor="pointer"
                                    >
                                      {t(`${I18N_PATH}Duplicate`)}
                                    </Typography>
                                  </Layouts.Flex>
                                </Layouts.IconLayout>
                              ) : null}
                              {values.orders.length > 1 ? (
                                <Layouts.Margin left="3">
                                  <Layouts.IconLayout remove onClick={() => remove(orderIndex)}>
                                    <Layouts.Flex alignItems="center">
                                      <DeleteIcon
                                        role="button"
                                        aria-label={t(`${I18N_PATH}Remove`)}
                                        tabIndex={0}
                                        onKeyDown={e => handleKeyDown(e, remove, orderIndex)}
                                      />
                                      <Typography
                                        variant="bodyMedium"
                                        color="information"
                                        cursor="pointer"
                                      >
                                        {t(`${I18N_PATH}Remove`)}
                                      </Typography>
                                    </Layouts.Flex>
                                  </Layouts.IconLayout>
                                </Layouts.Margin>
                              ) : null}
                            </Layouts.Flex>
                          ) : null}
                        </Layouts.Flex>
                      </Layouts.Margin>
                      <Layouts.Flex>
                        <Layouts.Column>
                          {isRegular ? (
                            <Select
                              label={`${t(`${I18N_PATH}OrderContact`)}*`}
                              placeholder={t(`${I18N_PATH}SelectContact`)}
                              name={generateOrderPropsPath({
                                property: 'orderContactId',
                                orderIndex,
                              })}
                              options={contactOptions}
                              value={order.orderContactId}
                              error={getIn(
                                errors,
                                generateOrderPropsPath({
                                  property: 'orderContactId',
                                  orderIndex,
                                }),
                              )}
                              onSelectChange={setFieldValue}
                            />
                          ) : null}

                          <PurchaseOrderSection
                            customerId={selectedCustomer?.id}
                            basePath={`orders[${orderIndex}]`}
                          />

                          {isRegular && hasPermits.includes(businessLineType) ? (
                            <Select
                              placeholder={t(`${I18N_PATH}SelectPermit`)}
                              label={`${t(`${I18N_PATH}Permit`)}${
                                values.permitRequired ? '*' : ''
                              }`}
                              name={generateOrderPropsPath({
                                property: 'permitId',
                                orderIndex,
                              })}
                              options={permitOptions}
                              value={order.permitId}
                              error={getIn(
                                errors,
                                generateOrderPropsPath({ property: 'permitId', orderIndex }),
                              )}
                              onSelectChange={setFieldValue}
                            />
                          ) : null}

                          <Select
                            label={t(`${I18N_PATH}ThirdPartyHauler`)}
                            placeholder={t(`${I18N_PATH}SelectHauler`)}
                            name={generateOrderPropsPath({
                              property: 'thirdPartyHaulerId',
                              orderIndex,
                            })}
                            value={order.thirdPartyHaulerId}
                            options={thirdPartyHaulerOptions}
                            error={getIn(
                              errors,
                              generateOrderPropsPath({
                                property: 'thirdPartyHaulerId',
                                orderIndex,
                              }),
                            )}
                            onSelectChange={handleThirdPartyHaulerChange}
                          />

                          <Calendar
                            label={`${t(`${I18N_PATH}ServiceDate`)}*`}
                            name={generateOrderPropsPath({
                              property: 'serviceDate',
                              orderIndex,
                            })}
                            withInput
                            value={order.serviceDate}
                            placeholder={t('Text.SetDate')}
                            firstDayOfWeek={firstDayOfWeek}
                            dateFormat={dateFormat}
                            error={getIn(
                              errors,
                              generateOrderPropsPath({ property: 'serviceDate', orderIndex }),
                            )}
                            onDateChange={(name, date) =>
                              handleStartDateChange(name, date, orderIndex)
                            }
                          />
                          <Select
                            label={`${t(`${I18N_PATH}PriceGroup`)}*`}
                            placeholder={t(`${I18N_PATH}SelectPriceGroup`)}
                            name={generateOrderPropsPath({
                              property: 'customRatesGroupId',
                              orderIndex,
                            })}
                            options={priceGroupOptions}
                            value={order.customRatesGroupId}
                            error={getIn(
                              errors,
                              generateOrderPropsPath({
                                property: 'customRatesGroupId',
                                orderIndex,
                              }),
                            )}
                            onSelectChange={(name, value) =>
                              handlePriceGroupChange(name, +value, orderIndex)
                            }
                          />
                          {businessLineType === BusinessLineType.portableToilets &&
                          values.serviceAreaId ? (
                            <RouteSelect
                              label={t(`${I18N_PATH}PreferredRoute`)}
                              placeholder={t(`${I18N_PATH}SelectPreferredRoute`)}
                              name={generateOrderPropsPath({
                                property: 'route',
                                orderIndex,
                              })}
                              value={order.route ?? undefined}
                              onSelectChange={setFieldValue}
                              serviceDate={order.serviceDate}
                              serviceAreaId={values.serviceAreaId}
                              businessLineType={businessLineType}
                            />
                          ) : null}

                          {billableServiceAction === 'relocate' ? (
                            <Autocomplete
                              name={generateOrderPropsPath({
                                property: 'jobSite2IdSearchString',
                                orderIndex,
                              })}
                              label={t(`${I18N_PATH}RelocationAddress`)}
                              placeholder={t(`${I18N_PATH}SearchJobSites`)}
                              search={order.jobSite2IdSearchString}
                              onSearchChange={setFieldValue}
                              onClear={() => handleJobSite2Clear(orderIndex)}
                              onRequest={search =>
                                GlobalService.multiSearch(search, businessUnitId)
                              }
                              error={getIn(
                                errors,
                                generateOrderPropsPath({
                                  property: 'jobSite2Id',
                                  orderIndex,
                                }),
                              )}
                              selectedValue={order.jobSite2Label}
                              configs={[
                                {
                                  name: 'jobSites',
                                  onSelect: (jobSite: AddressSuggestion) =>
                                    handleJobSite2AutocompleteSelect(jobSite, orderIndex),
                                  template: <AutocompleteTemplates.JobSite />,
                                  footer: (
                                    <AutocompleteTemplates.Footer
                                      text={t(`${I18N_PATH}CreateNewJobSite`)}
                                    />
                                  ),
                                  onFooterClick: toggleJobSiteModalOpen,
                                  showFooterIfNoOption: true,
                                },
                              ]}
                            />
                          ) : null}

                          {businessLineType === BusinessLineType.rollOff &&
                          material?.manifested &&
                          billableServiceAction &&
                          disposalSiteServicesList.includes(billableServiceAction) ? (
                            <Select
                              label={`${t(`${I18N_PATH}MaterialProfile`)}*`}
                              placeholder={t(`${I18N_PATH}SelectMaterialProfile`)}
                              name={generateOrderPropsPath({
                                property: 'materialProfileId',
                                orderIndex,
                              })}
                              options={getMaterialProfileOptions(
                                values.orders[orderIndex].materialId,
                              )}
                              value={order.materialProfileId ?? undefined}
                              error={getIn(
                                errors,
                                generateOrderPropsPath({
                                  property: 'materialProfileId',
                                  orderIndex,
                                }),
                              )}
                              onSelectChange={(name, value) =>
                                handleMaterialProfileChange(name, +value, orderIndex)
                              }
                            />
                          ) : null}

                          {businessLineType === BusinessLineType.rollOff &&
                          billableServiceAction &&
                          disposalSiteList.includes(billableServiceAction) ? (
                            <Select
                              label={t(`${I18N_PATH}DisposalSite`)}
                              placeholder={t(`${I18N_PATH}SelectDisposalSite`)}
                              name={generateOrderPropsPath({
                                property: 'disposalSiteId',
                                orderIndex,
                              })}
                              options={disposalSiteOptions}
                              value={order.disposalSiteId}
                              error={getIn(
                                errors,
                                generateOrderPropsPath({
                                  property: 'disposalSiteId',
                                  orderIndex,
                                }),
                              )}
                              onSelectChange={setFieldValue}
                              disabled={!!order.materialProfileId}
                            />
                          ) : null}
                        </Layouts.Column>
                        <Layouts.Column>
                          {isRegular ? (
                            <>
                              <Select
                                label={t(`${I18N_PATH}CallOnWay`)}
                                placeholder={t(`${I18N_PATH}SelectPhoneNumber`)}
                                name={generateOrderPropsPath({
                                  property: 'callOnWayPhoneNumberId',
                                  orderIndex,
                                })}
                                options={phoneNumbers}
                                value={order.callOnWayPhoneNumberId}
                                error={getIn(
                                  errors,
                                  generateOrderPropsPath({
                                    property: 'callOnWayPhoneNumberId',
                                    orderIndex,
                                  }),
                                )}
                                onSelectChange={(name, value) =>
                                  setCallOnWayPhoneNumberAndId(name, value, orderIndex)
                                }
                              />
                              <Select
                                label={t(`${I18N_PATH}TextOnWay`)}
                                placeholder={t(`${I18N_PATH}SelectPhoneForText`)}
                                name={generateOrderPropsPath({
                                  property: 'textOnWayPhoneNumberId',
                                  orderIndex,
                                })}
                                options={phoneNumbers}
                                value={order.textOnWayPhoneNumberId}
                                error={getIn(
                                  errors,
                                  generateOrderPropsPath({
                                    property: 'textOnWayPhoneNumberId',
                                    orderIndex,
                                  }),
                                )}
                                onSelectChange={(name, value) =>
                                  setTextOnWayPhoneNumberAndId(name, value, orderIndex)
                                }
                              />
                            </>
                          ) : null}

                          {businessLineType === BusinessLineType.portableToilets ? (
                            <ReminderForm isAnnualReminder />
                          ) : null}

                          <FormInput
                            label={t(`${I18N_PATH}InstructionsForDriver`)}
                            placeholder={t(`${I18N_PATH}AddNotesForDriver`)}
                            name={generateOrderPropsPath({
                              property: 'driverInstructions',
                              orderIndex,
                            })}
                            value={`${order.droppedEquipmentItemComment}${
                              order.driverInstructions ?? driverInstructionsPreFill ?? ''
                            }`}
                            error={getIn(
                              errors,
                              generateOrderPropsPath({
                                property: 'driverInstructions',
                                orderIndex,
                              }),
                            )}
                            onChange={e => handleDriverInstructionsChange(e, orderIndex)}
                            area
                          />

                          {values.type !== ClientRequestType.NonServiceOrder &&
                          values.type !== ClientRequestType.SubscriptionNonService ? (
                            <OrderTimePicker basePath={`orders[${orderIndex}]`} />
                          ) : null}

                          {isRegular ? (
                            <Layouts.Flex>
                              <Layouts.Column>
                                {businessLineType !== 'residentialWaste' ? (
                                  <Layouts.Margin top="1" bottom="1">
                                    <Checkbox
                                      name={generateOrderPropsPath({
                                        property: 'someoneOnSite',
                                        orderIndex,
                                      })}
                                      value={order.someoneOnSite}
                                      error={getIn(
                                        errors,
                                        generateOrderPropsPath({
                                          property: 'someoneOnSite',
                                          orderIndex,
                                        }),
                                      )}
                                      onChange={handleChange}
                                    >
                                      {t(`${I18N_PATH}SomeoneOnSite`)}
                                    </Checkbox>
                                  </Layouts.Margin>
                                ) : null}
                                {businessLineType === BusinessLineType.rollOff ? (
                                  <Layouts.Margin top="1" bottom="1">
                                    <Checkbox
                                      name={generateOrderPropsPath({
                                        property: 'earlyPick',
                                        orderIndex,
                                      })}
                                      value={order.earlyPick}
                                      error={getIn(
                                        errors,
                                        generateOrderPropsPath({
                                          property: 'earlyPick',
                                          orderIndex,
                                        }),
                                      )}
                                      onChange={handleChange}
                                    >
                                      {t(`${I18N_PATH}EarlyPickupOk`)}
                                    </Checkbox>
                                  </Layouts.Margin>
                                ) : null}
                                <Layouts.Margin top="1" bottom="1">
                                  <Checkbox
                                    name="alleyPlacement"
                                    value={values.alleyPlacement}
                                    error={errors.alleyPlacement}
                                    onChange={handleChange}
                                  >
                                    {t(`${I18N_PATH}AlleyPlacement`)}
                                  </Checkbox>
                                </Layouts.Margin>
                              </Layouts.Column>
                              <Layouts.Column>
                                {hasOkToRoll.includes(businessLineType) ? (
                                  <Layouts.Margin top="1" bottom="1">
                                    <Checkbox
                                      name={generateOrderPropsPath({
                                        property: 'toRoll',
                                        orderIndex,
                                      })}
                                      value={order.toRoll}
                                      error={getIn(
                                        errors,
                                        generateOrderPropsPath({
                                          property: 'toRoll',
                                          orderIndex,
                                        }),
                                      )}
                                      onChange={handleChange}
                                    >
                                      {t(`${I18N_PATH}OkToRoll`)}
                                    </Checkbox>
                                  </Layouts.Margin>
                                ) : null}

                                <Layouts.Margin top="1" bottom="1">
                                  <Checkbox
                                    name={generateOrderPropsPath({
                                      property: 'highPriority',
                                      orderIndex,
                                    })}
                                    value={order.highPriority}
                                    error={getIn(
                                      errors,
                                      generateOrderPropsPath({
                                        property: 'highPriority',
                                        orderIndex,
                                      }),
                                    )}
                                    onChange={handleChange}
                                  >
                                    {t(`${I18N_PATH}HighPriority`)}
                                  </Checkbox>
                                </Layouts.Margin>

                                {businessLineType === BusinessLineType.rollOff ? (
                                  <Layouts.Margin top="1" bottom="1">
                                    <Checkbox
                                      name="cabOver"
                                      value={values.cabOver}
                                      error={errors.cabOver}
                                      onChange={handleChange}
                                    >
                                      {t(`${I18N_PATH}CabOver`)}
                                    </Checkbox>
                                  </Layouts.Margin>
                                ) : null}
                              </Layouts.Column>
                            </Layouts.Flex>
                          ) : null}
                          {values.type === ClientRequestType.OrderRequest ? (
                            <MediaFiles
                              author={getMedialAuthor()}
                              timestamp={getMedialTimestamp() as Date}
                            />
                          ) : undefined}
                          {values.type === ClientRequestType.SubscriptionOrder &&
                          billableServiceAction &&
                          hasEquipmentReplacementPermits.includes(billableServiceAction) ? (
                            <ReplaceEquipments orderIndex={orderIndex} />
                          ) : null}
                        </Layouts.Column>
                      </Layouts.Flex>
                    </>
                  </Subsection>
                  <Subsection gray>
                    {isRegular ? (
                      <>
                        <Layouts.Margin bottom="2">
                          <Typography variant="headerFour">{t(`${I18N_PATH}Service`)}</Typography>
                        </Layouts.Margin>

                        <Layouts.Flex justifyContent="space-between">
                          <Layouts.Column>
                            <Select
                              label={`${t(`${I18N_PATH}Service`)}*`}
                              placeholder={t(`${I18N_PATH}SelectService`)}
                              name={generateOrderPropsPath({
                                orderIndex,
                                property: 'billableServiceId',
                              })}
                              value={order.billableServiceId}
                              error={getIn(
                                errors,
                                generateOrderPropsPath({
                                  orderIndex,
                                  property: 'billableServiceId',
                                }),
                              )}
                              onSelectChange={(name, value) => {
                                handleBillableServiceChange(name, +value, orderIndex);
                              }}
                              options={billableServiceOptions}
                            />
                          </Layouts.Column>
                          <Layouts.Column>
                            <Layouts.Flex justifyContent="space-between">
                              <Layouts.Margin right="3">
                                <Layouts.Box width="90px">
                                  <FormInput
                                    label={`${t(`${I18N_PATH}Price`)}*`}
                                    type="number"
                                    name={generateOrderPropsPath({
                                      orderIndex,
                                      property: 'billableServicePrice',
                                    })}
                                    key="billableServicePrice"
                                    value={order.billableServicePrice}
                                    onChange={handleChange}
                                    error={getIn(
                                      errors,
                                      generateOrderPropsPath({
                                        orderIndex,
                                        property: 'billableServicePrice',
                                      }),
                                    )}
                                    disabled={!values.unlockOverrides}
                                  />
                                </Layouts.Box>
                              </Layouts.Margin>
                              <Layouts.Margin right="3">
                                <Layouts.Box width="75px">
                                  <FormInput
                                    label={`${t(`${I18N_PATH}QTY`)}*`}
                                    type="number"
                                    name={generateOrderPropsPath({
                                      orderIndex,
                                      property: 'billableServiceQuantity',
                                    })}
                                    countable
                                    limits={{
                                      min: 1,
                                      max:
                                        values.type !== ClientRequestType.SubscriptionOrder
                                          ? 10
                                          : undefined,
                                    }}
                                    value={order.billableServiceQuantity}
                                    onChange={e => handleBillableQuantityChange(e, orderIndex)}
                                    error={getIn(
                                      errors,
                                      generateOrderPropsPath({
                                        orderIndex,
                                        property: 'billableServiceQuantity',
                                      }),
                                    )}
                                  />
                                </Layouts.Box>
                              </Layouts.Margin>
                              <Layouts.Box minWidth="90px">
                                <ReadOnlyFormField
                                  label={t(`${I18N_PATH}Total`, { currencySymbol })}
                                  value={formatCurrency(
                                    (Number(order.billableServicePrice) || 0) *
                                      order.billableServiceQuantity,
                                  )}
                                />
                              </Layouts.Box>
                            </Layouts.Flex>
                          </Layouts.Column>
                        </Layouts.Flex>

                        <Layouts.Flex>
                          <Layouts.Box width="calc(50% - 2rem)">
                            <Select
                              label={`${t(`${I18N_PATH}Material`)}*`}
                              placeholder={t(`${I18N_PATH}SelectMaterial`)}
                              name={generateOrderPropsPath({
                                orderIndex,
                                property: 'materialId',
                              })}
                              value={order.materialId}
                              error={getIn(
                                errors,
                                generateOrderPropsPath({
                                  orderIndex,
                                  property: 'materialId',
                                }),
                              )}
                              onSelectChange={(name, value) =>
                                handleMaterialChange(name, +value, orderIndex)
                              }
                              options={
                                getIn(
                                  values,
                                  generateOrderPropsPath({
                                    orderIndex,
                                    property: 'equipmentItemsMaterialsOptions',
                                  }),
                                ) ?? []
                              }
                            />
                          </Layouts.Box>
                        </Layouts.Flex>
                        <Layouts.Flex alignItems="center">
                          {order.droppedEquipmentItemApplied &&
                          isAssignEquipmentItemAllowed &&
                          values.type !== ClientRequestType.SubscriptionOrder ? (
                            <Layouts.Margin right="3">
                              <Layouts.Box minWidth="276px">
                                <Layouts.Flex alignItems="center">
                                  <Layouts.IconLayout
                                    remove
                                    onClick={() => handleAssignEquipmentItemClear(orderIndex)}
                                  >
                                    <DeleteIcon
                                      role="button"
                                      aria-label={t(`${I18N_PATH}Remove`)}
                                      tabIndex={0}
                                      onKeyDown={e =>
                                        handleKeyDown(e, handleAssignEquipmentItemClear, orderIndex)
                                      }
                                    />
                                  </Layouts.IconLayout>
                                  <Select
                                    label={`${t(`${I18N_PATH}AssignEquipment`)}*`}
                                    placeholder={t(`${I18N_PATH}SelectAssignEquipment`)}
                                    name={generateOrderPropsPath({
                                      property: 'droppedEquipmentItem',
                                      orderIndex,
                                    })}
                                    value={order.droppedEquipmentItem}
                                    error={getIn(
                                      errors,
                                      generateOrderPropsPath({
                                        property: 'droppedEquipmentItem',
                                        orderIndex,
                                      }),
                                    )}
                                    onSelectChange={(name, value) =>
                                      handleDroppedEquipmentItemChange(
                                        name,
                                        value?.toString() ?? '',
                                        orderIndex,
                                      )
                                    }
                                    options={assignEquipmentOptions}
                                  />
                                </Layouts.Flex>
                              </Layouts.Box>
                            </Layouts.Margin>
                          ) : null}
                          {!order.droppedEquipmentItemApplied &&
                          isAssignEquipmentItemAllowed &&
                          values.type !== ClientRequestType.SubscriptionOrder ? (
                            <Layouts.Margin right="3">
                              <Layouts.Box minWidth="276px">
                                <Typography
                                  onClick={
                                    order.billableServiceQuantity > 1
                                      ? noop
                                      : () => handleAssignEquipment(orderIndex)
                                  }
                                  onKeyDown={e =>
                                    handleKeyDown(e, handleAssignEquipment, orderIndex)
                                  }
                                  tabIndex={0}
                                  role="button"
                                  color="information"
                                  variant="bodyMedium"
                                  disabled={order.billableServiceQuantity > 1}
                                  cursor={
                                    order.billableServiceQuantity > 1 ? 'not-allowed' : 'pointer'
                                  }
                                >
                                  <Layouts.Flex alignItems="center">
                                    <Layouts.Margin right="1">
                                      <Layouts.Flex>
                                        <AssignIcon />
                                      </Layouts.Flex>
                                    </Layouts.Margin>
                                    {t(`${I18N_PATH}AssignEquipmentForService`)}
                                  </Layouts.Flex>
                                </Typography>
                              </Layouts.Box>
                            </Layouts.Margin>
                          ) : null}
                          {!order.notificationApplied &&
                          isNotificationAllowed &&
                          values.type !== ClientRequestType.SubscriptionOrder ? (
                            <Layouts.Margin right="3">
                              <Layouts.Box minWidth="276px">
                                <Layouts.Flex>
                                  <Typography
                                    onClick={() =>
                                      setFieldValue(
                                        generateOrderPropsPath({
                                          property: 'notificationApplied',
                                          orderIndex,
                                        }),
                                        true,
                                      )
                                    }
                                    color="information"
                                    variant="bodyMedium"
                                    cursor="pointer"
                                  >
                                    <Layouts.Flex
                                      as={Layouts.Box}
                                      height="100%"
                                      alignItems="center"
                                    >
                                      <Layouts.IconLayout>
                                        <ReminderIcon />
                                      </Layouts.IconLayout>
                                      <Layouts.Box height="100%">
                                        {t(`${I18N_PATH}SetReminder`)}
                                      </Layouts.Box>
                                    </Layouts.Flex>
                                  </Typography>
                                </Layouts.Flex>
                              </Layouts.Box>
                            </Layouts.Margin>
                          ) : null}
                          {isNotificationAllowed &&
                          order.notificationApplied &&
                          values.type !== ClientRequestType.SubscriptionOrder ? (
                            <Layouts.Margin right="3">
                              <Layouts.Box minWidth="276px">
                                <Layouts.Flex alignItems="center">
                                  <Layouts.IconLayout
                                    remove
                                    onClick={() => handleReminderClear(orderIndex)}
                                  >
                                    <DeleteIcon
                                      role="button"
                                      aria-label={t(`${I18N_PATH}Remove`)}
                                      tabIndex={0}
                                      onKeyDown={e =>
                                        handleKeyDown(e, handleReminderClear, orderIndex)
                                      }
                                    />
                                  </Layouts.IconLayout>
                                  <Layouts.Box width="100%">
                                    <Layouts.Padding top="0.5" bottom="0.5">
                                      <Typography
                                        color="secondary"
                                        as="label"
                                        shade="desaturated"
                                        variant="bodyMedium"
                                        htmlFor={generateOrderPropsPath({
                                          property: 'notifyDayBefore',
                                          orderIndex,
                                        })}
                                      >
                                        <Layouts.Flex>
                                          {t(`${I18N_PATH}ServiceReminder`)}*
                                          <Layouts.Margin left="1">
                                            <Tooltip
                                              border
                                              position="top"
                                              text={t(`${I18N_PATH}ReminderText`)}
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
                                          </Layouts.Margin>
                                        </Layouts.Flex>
                                      </Typography>
                                    </Layouts.Padding>

                                    <Select
                                      placeholder={t(`${I18N_PATH}SelectServiceReminder`)}
                                      name={generateOrderPropsPath({
                                        property: 'notifyDayBefore',
                                        orderIndex,
                                      })}
                                      value={order.notifyDayBefore ?? undefined}
                                      error={getIn(
                                        errors,
                                        generateOrderPropsPath({
                                          property: 'notifyDayBefore',
                                          orderIndex,
                                        }),
                                      )}
                                      onSelectChange={setFieldValue}
                                      disabled={isNotificationDisabled}
                                      options={getNotifyOptions(order.orderContactId)}
                                    />
                                  </Layouts.Box>
                                </Layouts.Flex>
                              </Layouts.Box>
                            </Layouts.Margin>
                          ) : null}
                        </Layouts.Flex>
                      </>
                    ) : null}
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
                    <FieldArray
                      name={generateOrderPropsPath({
                        orderIndex,
                        property: 'lineItems',
                      })}
                    >
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
                          const billableLineItem = lineItemStore.getById(
                            +lineItemOptions[0]?.value,
                          );

                          push({
                            billableLineItemId: +lineItemOptions[0]?.value,
                            quantity: 1,
                            units: billableLineItem?.unit,
                            customRatesGroupLineItemsId: undefined,
                            globalRatesLineItemsId: undefined,
                            price: undefined,
                            applySurcharges: billableLineItem?.applySurcharges ?? true,
                          });

                          const order = values.orders[orderIndex];

                          if (
                            billableLineItem &&
                            (!billableLineItem?.materialBasedPricing ||
                              (billableLineItem?.materialBasedPricing && order.materialId))
                          ) {
                            calculateLineItemRates(
                              [
                                ...getLineItemsCalcRatesPayload(orderIndex),
                                {
                                  lineItemId: +lineItemOptions[0]?.value,
                                  materialId: billableLineItem?.materialBasedPricing
                                    ? order.materialId
                                    : undefined,
                                },
                              ],
                              orderIndex,
                              order.lineItems?.length ?? 0,
                            );
                          } else {
                            setFieldValue(
                              generateLineItemsPropsPath({
                                orderIndex,
                                lineItemIndex: order.lineItems?.length ?? 0,
                                property: 'price',
                              }),
                              undefined,
                            );
                          }
                        };

                        return (
                          <Layouts.Grid columns="20px repeat(6, 1fr)" columnGap="2">
                            <Layouts.Cell width={7}>
                              <Layouts.Margin top="2" bottom="2">
                                <Typography variant="headerFour">
                                  {isRegular
                                    ? t(`${I18N_PATH}LineItemsPerService`)
                                    : t(`${I18N_PATH}LineItems`)}
                                </Typography>
                              </Layouts.Margin>
                            </Layouts.Cell>
                            {order.lineItems?.map((lineItem, lineItemIndex) => (
                              <React.Fragment
                                key={`orders[${orderIndex}].lineItems[${lineItemIndex}]`}
                              >
                                <Layouts.Cell width={1} left={1} alignSelf="center">
                                  <Layouts.IconLayout remove onClick={() => remove(lineItemIndex)}>
                                    <DeleteIcon
                                      role="button"
                                      aria-label={t(`${I18N_PATH}Remove`)}
                                      tabIndex={0}
                                      onKeyDown={e => handleKeyDown(e, remove, lineItemIndex)}
                                    />
                                  </Layouts.IconLayout>
                                </Layouts.Cell>
                                <Layouts.Cell width={3}>
                                  <Select
                                    placeholder={t(`${I18N_PATH}SelectLineItem`)}
                                    label={`${t(`${I18N_PATH}LineItem`)}*`}
                                    ariaLabel="Line item"
                                    name={generateLineItemsPropsPath({
                                      orderIndex,
                                      lineItemIndex,
                                      property: 'billableLineItemId',
                                    })}
                                    value={lineItem.billableLineItemId}
                                    options={lineItemOptions}
                                    error={getIn(
                                      errors,
                                      generateLineItemsPropsPath({
                                        orderIndex,
                                        lineItemIndex,
                                        property: 'billableLineItemId',
                                      }),
                                    )}
                                    onSelectChange={(_name: string, value: number) =>
                                      handleLineItemChange(value, orderIndex, lineItemIndex)
                                    }
                                    nonClearable
                                  />
                                </Layouts.Cell>
                                <Layouts.Cell width={1}>
                                  <FormInput
                                    label={`${t(`${I18N_PATH}QTY`)}*`}
                                    name={generateLineItemsPropsPath({
                                      orderIndex,
                                      lineItemIndex,
                                      property: 'quantity',
                                    })}
                                    ariaLabel="Quantity"
                                    value={lineItem.quantity}
                                    type="number"
                                    limits={{
                                      min: 1,
                                    }}
                                    countable
                                    error={getIn(
                                      errors,
                                      generateLineItemsPropsPath({
                                        orderIndex,
                                        lineItemIndex,
                                        property: 'quantity',
                                      }),
                                    )}
                                    onChange={handleChange}
                                  />
                                </Layouts.Cell>
                                <Layouts.Cell width={1}>
                                  <FormInput
                                    label={`${t(`${I18N_PATH}PriceWithCurrency`)}*`}
                                    type="number"
                                    name={generateLineItemsPropsPath({
                                      orderIndex,
                                      lineItemIndex,
                                      property: 'price',
                                    })}
                                    ariaLabel="Price"
                                    value={lineItem.price}
                                    onChange={handleChange}
                                    error={getIn(
                                      errors,
                                      generateLineItemsPropsPath({
                                        orderIndex,
                                        lineItemIndex,
                                        property: 'price',
                                      }),
                                    )}
                                    disabled={!values.unlockOverrides}
                                  />
                                </Layouts.Cell>
                                <Layouts.Cell width={1}>
                                  <FormInput
                                    label={t(`${I18N_PATH}Total`, { currencySymbol })}
                                    name={generateLineItemsPropsPath({
                                      orderIndex,
                                      lineItemIndex,
                                      property: 'totalPrice',
                                    })}
                                    ariaLabel="Total"
                                    value={formatCurrency(
                                      lineItem.quantity * (lineItem.price ?? 0),
                                    )}
                                    onChange={handleChange}
                                    disabled
                                  />
                                </Layouts.Cell>
                                <Layouts.Cell width={3} left={2}>
                                  <Select
                                    label={`${t(`${I18N_PATH}Material`)}`}
                                    placeholder={t(`${I18N_PATH}SelectMaterial`)}
                                    name={generateLineItemsPropsPath({
                                      orderIndex,
                                      lineItemIndex,
                                      property: 'materialId',
                                    })}
                                    ariaLabel="Material"
                                    value={lineItem?.materialId ?? undefined}
                                    options={materialStore.values.map(material => ({
                                      label: material.description,
                                      value: material.id,
                                      hint: material.manifested ? 'Manifested' : '',
                                    }))}
                                    error={getIn(
                                      errors,
                                      generateLineItemsPropsPath({
                                        orderIndex,
                                        lineItemIndex,
                                        property: 'materialId',
                                      }),
                                    )}
                                    onSelectChange={(name: string, value: number) => {
                                      handleLineItemMaterialChange(
                                        value,
                                        orderIndex,
                                        lineItemIndex,
                                      );
                                      setFieldValue(name, value);
                                    }}
                                  />
                                </Layouts.Cell>
                                <Layouts.Cell width={1}>
                                  <FormInput
                                    label={`${t(`${I18N_PATH}Units`)}`}
                                    name={generateLineItemsPropsPath({
                                      orderIndex,
                                      lineItemIndex,
                                      property: 'units',
                                    })}
                                    ariaLabel="Units"
                                    value={startCase(
                                      getUnitLabel(lineItem.units, currentUser?.company?.unit),
                                    )}
                                    error={getIn(
                                      errors,
                                      generateLineItemsPropsPath({
                                        orderIndex,
                                        lineItemIndex,
                                        property: 'units',
                                      }),
                                    )}
                                    onChange={handleChange}
                                    disabled
                                  />
                                </Layouts.Cell>
                              </React.Fragment>
                            ))}
                            <Layouts.Cell width={7}>
                              <Typography
                                variant="bodyMedium"
                                cursor="pointer"
                                color="information"
                                tabIndex={0}
                                onClick={addLineItem}
                                onKeyDown={e => {
                                  if (handleEnterOrSpaceKeyDown(e)) {
                                    addLineItem();
                                  }
                                }}
                              >
                                + {t(`${I18N_PATH}AddLineItem`)}
                              </Typography>
                            </Layouts.Cell>
                            <Layouts.Cell width={7}>
                              {(values.type === ClientRequestType.NonServiceOrder ||
                                values.type === ClientRequestType.SubscriptionNonService) &&
                              !order.lineItems?.length ? (
                                <Typography
                                  color="alert"
                                  variant="bodySmall"
                                  className={styles.validationText}
                                >
                                  {getIn(
                                    errors,
                                    generateOrderPropsPath({
                                      orderIndex,
                                      property: 'lineItems',
                                    }),
                                  )}
                                </Typography>
                              ) : null}
                            </Layouts.Cell>
                          </Layouts.Grid>
                        );
                      }}
                    </FieldArray>
                  </Subsection>
                </Section>
                {isRegularNonSubscription &&
                values.orders.length - 1 === orderIndex &&
                values.orders.length < 10 ? (
                  <AddServiceButton
                    onClick={() =>
                      push({
                        ...initialValues.orders[0],
                        applySurcharges: values.applySurcharges,
                      })
                    }
                  />
                ) : null}
              </React.Fragment>
            );
          })
        }
      </FieldArray>
    </>
  );
};

export default observer(OrderSection);
