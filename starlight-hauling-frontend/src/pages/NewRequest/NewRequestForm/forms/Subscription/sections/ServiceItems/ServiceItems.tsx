import React, { ChangeEvent, useCallback, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, ISelectOption, Layouts, Select } from '@starlightpro/shared-components';
import { differenceInCalendarDays, endOfToday, format, isAfter } from 'date-fns';
import { FieldArray, getIn, useFormikContext } from 'formik';
import { find, isEmpty, pull } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { MaterialService } from '@root/api';
import { CancelAltIcon, DeleteIcon } from '@root/assets';
import {
  Banner,
  FormInput,
  ReadOnlyFormField,
  Typography,
  ValidationMessageBlock,
} from '@root/common';
import { Divider } from '@root/common/TableTools';
import { BillableItemActionEnum, ClientRequestType } from '@root/consts';
import { getMaterialsForOptions, handleEnterOrSpaceKeyDown } from '@root/helpers';
import { useDateIntl } from '@root/helpers/format/date';
import { usePrevious, useStores } from '@root/hooks';
import { useIntl } from '@root/i18n/useIntl';
import { AddServiceButton } from '@root/pages/NewRequest/NewRequestForm/components/buttons';
import { getFrequencyText } from '@root/pages/SystemConfiguration/components/Frequency/helpers';

import { newSubscriptionFormValue } from '../../formikData';
import {
  generateServicePropPath,
  getFinalSubscriptionOrdersQuantity,
  getShowUpdateMessages,
  matchBillableServiceInclusion,
} from '../../helpers';
import { useMasterRoutes } from '../../hooks';
import {
  INewSubscription,
  INewSubscriptionOrder,
  INewSubscriptionService,
  IShowUpdateMessages,
} from '../../types';
import ServiceDays from '../Order/components/ServiceDays/ServiceDays';

import ProratedHint from './components/ProratedHint/ProratedHint';
import ProratedMessage from './components/ProratedMessage/ProratedMessage';
import { ServiceItem } from './components/ServiceItem/ServiceItem';
import { LineItems, SubscriptionOrders } from './components';
import { IServiceItems } from './types';

const today = endOfToday();
const I18N_PATH = 'pages.NewRequest.NewRequestForm.forms.Subscription.sections.Order.Order.Text.'; // TODO: create translations for this component

const handleKeyDown = (
  e: React.KeyboardEvent<HTMLOrSVGElement>,
  callback: (i?: number) => void,
  index?: number,
) => {
  if (handleEnterOrSpaceKeyDown(e)) {
    if (index) {
      callback(index);
    }
    callback();
  }
};

export const ServiceItems: React.FC<IServiceItems> = observer(
  ({ isSubscriptionEdit, isSubscriptionDraftEdit, isSubscriptionClosed, isClone }) => {
    const { billableServiceStore, materialStore, subscriptionDraftStore } = useStores();
    const { t } = useTranslation();
    const { dateFormat, formatDate } = useDateIntl();

    const materialServiceRef = useRef(new MaterialService());

    useMasterRoutes();

    const { formatCurrency, firstDayOfWeek } = useIntl();
    const { values, initialValues, errors, handleChange, setFieldValue } =
      useFormikContext<INewSubscription>();

    const billableServices = billableServiceStore.filteredServices.length
      ? billableServiceStore.filteredServices
      : billableServiceStore.sortedValues;

    useEffect(() => {
      if (isSubscriptionDraftEdit && isEmpty(values?.serviceItems?.[0].subscriptionOrders)) {
        values?.serviceItems?.forEach(serviceValues =>
          subscriptionDraftStore?.values?.[0].serviceItems.forEach(serviceDraf => {
            if (serviceValues && serviceDraf && serviceValues.id === serviceDraf.id) {
              serviceValues.subscriptionOrders = serviceDraf.subscriptionOrders;
              serviceValues.subscriptionOrders.forEach((subscriptionOrder, index) => {
                const option = {
                  label: subscriptionOrder?.billableService?.description ?? '',
                  value: subscriptionOrder.billableService?.id ?? 0,
                  action: subscriptionOrder.billableService?.action ?? BillableItemActionEnum.none,
                  isIncludedInService: serviceDraf.subscriptionOrders[index].included ?? false,
                };
                subscriptionOrder.unlockOverrides = false;
                subscriptionOrder.subscriptionOrderOptions = [option];
              });
            }
          }),
        );
      }
    }, [values, isSubscriptionDraftEdit, setFieldValue, subscriptionDraftStore?.values]);

    const billableServiceOptions = useMemo(
      () =>
        billableServices
          .filter(service => !service.oneTime)
          .map(billableService => ({
            label: billableService.description,
            value: billableService.id,
            hint: billableService.equipmentItem?.shortDescription,
            COEHint: billableService.equipmentItem?.customerOwned,
            billingCycles: billableService.billingCycles,
          })),
      [billableServices],
    );

    const updateSubOrder = useCallback(
      (subOrder: INewSubscriptionOrder, serviceIndex: number) => {
        values.serviceItems[serviceIndex].subscriptionOrders.push(subOrder);
        setFieldValue('serviceItems', values.serviceItems);
      },
      [values, setFieldValue],
    );

    const deleteSubOrder = useCallback(
      (serviceIndex: number, orderIndex: number) => {
        values.serviceItems[serviceIndex].subscriptionOrders.splice(orderIndex, 1);
        setFieldValue('serviceItems', values.serviceItems);
      },
      [values, setFieldValue],
    );

    const getPreSelectedHistoricalService = useCallback(
      (serviceItem: INewSubscriptionService) => {
        let preSelectedService = null;

        if (!isSubscriptionEdit) {
          return preSelectedService;
        }

        billableServices.forEach(billableService => {
          if (
            billableService.id === serviceItem.preSelectedService?.value &&
            isAfter(billableService.updatedAt as Date, billableService.createdAt as Date)
          ) {
            preSelectedService = serviceItem.preSelectedService;
          }
        });

        return preSelectedService;
      },
      [billableServices, isSubscriptionEdit],
    );

    const getIsUpdatedService = useCallback(
      (serviceItem: INewSubscriptionService) =>
        isSubscriptionEdit &&
        billableServices.some(
          billableService =>
            billableService.id === serviceItem.billableServiceId &&
            serviceItem.createdAt &&
            isAfter(billableService.updatedAt as Date, serviceItem.createdAt as Date),
        ),
      [billableServices, isSubscriptionEdit],
    );

    const handleMaterialSelectFocus = useCallback(
      async (serviceIndex: number, equipmentItemId?: number) => {
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
            generateServicePropPath({
              serviceIndex,
              property: 'equipmentItemsMaterialsOptions',
            }),
            materialOptions,
          );
        } else {
          setFieldValue(
            generateServicePropPath({
              serviceIndex,
              property: 'equipmentItemsMaterialsOptions',
            }),
            [],
          );
          materialStore.cleanup();
        }
      },
      [materialStore, setFieldValue],
    );

    const getServiceFrequencyOptions = useCallback(
      async (billableServiceId: number) => {
        await billableServiceStore.requestFrequencies(billableServiceId);

        const serviceFrequencyOptions = billableServiceStore.frequencies
          .filter(frequency => frequency.id)
          .map(frequency => ({
            value: frequency.id,
            label: getFrequencyText(t, frequency.type, frequency.times),
          }));

        return serviceFrequencyOptions;
      },
      [billableServiceStore, t],
    );

    const handleBillableServiceChange = useCallback(
      async (value: number | undefined, serviceIndex: number) => {
        const servicePath = `serviceItems[${serviceIndex}]`;
        const serviceItem = values.serviceItems[serviceIndex];

        const serviceItemValuesBase = { ...newSubscriptionFormValue.serviceItems[0] };

        if (isSubscriptionDraftEdit && serviceItem.id) {
          serviceItemValuesBase.id = serviceItem.id;
          serviceItemValuesBase.lineItems = serviceItem.lineItems.map(lineItem => ({
            ...lineItem,
            quantity: 0,
          }));
          serviceItemValuesBase.subscriptionOrders = serviceItem.subscriptionOrders.map(
            subscriptionOrder => ({ ...subscriptionOrder, quantity: 0 }),
          );
        }

        if (value) {
          const billableService = billableServiceStore.getById(value);
          const equipmentItem = billableService?.equipmentItem;

          setFieldValue('equipmentType', equipmentItem?.type);

          const billableServiceIds = (billableService?.services ?? []) as number[];
          const billablesServices = billableServiceIds.map(item =>
            billableServiceStore.getById(item),
          );
          const serviceFrequencyOptions = await getServiceFrequencyOptions(value);
          let equipmentItemsMaterialsOptions;

          if (equipmentItem) {
            const { materialOptions } = await getMaterialsForOptions({
              materialService: materialServiceRef.current,
              equipmentItemId: equipmentItem?.id,
              businessLineId: values.businessLineId,
            });

            equipmentItemsMaterialsOptions = materialOptions;
          }

          const serviceItemValues: INewSubscriptionService = {
            ...serviceItemValuesBase,
            billableServiceId: value,
            billableService: billableService ?? undefined,
            shortDescription: equipmentItem?.shortDescription,
            serviceFrequencyOptions,
            equipmentItemsMaterialsOptions: equipmentItemsMaterialsOptions ?? [],
            billableServiceInclusion: serviceFrequencyOptions.length
              ? undefined
              : matchBillableServiceInclusion(
                  billablesServices?.map(service => service?.action) ?? [],
                  t,
                ),
            billableServiceInclusionIds: billableServiceIds,
          };

          setFieldValue(servicePath, serviceItemValues);
          handleMaterialSelectFocus(serviceIndex, equipmentItem?.id);
        } else {
          setFieldValue(servicePath, {
            ...serviceItemValuesBase,
          });
        }
      },
      [
        values.serviceItems,
        values.businessLineId,
        isSubscriptionDraftEdit,
        billableServiceStore,
        setFieldValue,
        getServiceFrequencyOptions,
        t,
        handleMaterialSelectFocus,
      ],
    );

    const isFrequencyDisabled = useCallback(
      (serviceIndex: number) => {
        const serviceAction = billableServiceStore.getById(
          values.serviceItems[serviceIndex].billableServiceId,
        )?.action;

        const isFrequencyDisable =
          !values.serviceItems[serviceIndex].serviceFrequencyOptions.length;

        return isFrequencyDisable || serviceAction === 'rental';
      },
      [billableServiceStore, values.serviceItems],
    );

    const handleServiceFrequencyChange = useCallback(
      (name: string, value: number | null, serviceIndex: number) => {
        setFieldValue(name, value);
        setFieldValue(
          generateServicePropPath({
            serviceIndex,
            property: 'serviceDaysOfWeek',
          }),
          [],
        );
      },
      [setFieldValue],
    );

    const handleMaterialChange = useCallback(
      (_: string, value: number | undefined, serviceIndex: number) => {
        const materialIdPath = generateServicePropPath({ serviceIndex, property: 'materialId' });

        setFieldValue(generateServicePropPath({ serviceIndex, property: 'price' }), 0);
        setFieldValue(materialIdPath, value);
      },
      [setFieldValue],
    );

    const resetUnlockOverrides = useCallback(() => {
      const newServiceItems = values.serviceItems.map(serviceItem => ({
        ...serviceItem,
        unlockOverrides: false,
        lineItems: serviceItem.lineItems.map(lineItem => ({
          ...lineItem,
          unlockOverrides: false,
        })),
        subscriptionOrders: serviceItem.subscriptionOrders.map(subscriptionOrder => ({
          ...subscriptionOrder,
          unlockOverrides: false,
        })),
      }));

      setFieldValue('serviceItems', newServiceItems);
    }, [values, setFieldValue]);

    const prevCustomRatesGroupId = usePrevious(values.customRatesGroupId);

    useEffect(() => {
      if (prevCustomRatesGroupId && values.customRatesGroupId !== prevCustomRatesGroupId) {
        resetUnlockOverrides();
      }
    }, [prevCustomRatesGroupId, resetUnlockOverrides, values.customRatesGroupId]);

    const daysLeftToExpiration =
      (values.endDate && differenceInCalendarDays(values.endDate, today)) ?? null;

    return (
      <FieldArray name="serviceItems">
        {({
          push,
          remove,
        }: {
          push(obj: INewSubscriptionService): void;
          remove(index: number): void;
        }) => {
          const handleAddNewService = () => {
            push({
              ...newSubscriptionFormValue.serviceItems[0],
              ...((isSubscriptionEdit || isSubscriptionDraftEdit) && {
                showEffectiveDate: true,
              }),
            });
          };

          return (
            <>
              {values.serviceItems.map((service, serviceIndex) => {
                // todo refactor in future. Create separate component for serviceItem

                const initialService = find(initialValues.serviceItems, { id: service.id });

                const isServiceRemoved = !service.quantity || !!service.isDeleted;
                const isServiceSupported =
                  service.billableServiceId === undefined ||
                  billableServiceOptions.some(({ value }) => value === service.billableServiceId);
                const activeServicesCount = values.serviceItems.filter(
                  item => item.quantity && !item.isDeleted,
                ).length;
                const isShowDeleteIcon =
                  (!isSubscriptionEdit && serviceIndex > 0) ||
                  (isSubscriptionEdit && !service.id && activeServicesCount > 1);
                const isShowEndIcon =
                  isSubscriptionEdit &&
                  !!service.id &&
                  !isServiceRemoved &&
                  activeServicesCount > 1;

                const isReadOnly = isSubscriptionEdit && !!service.id;

                const isCustomerOwnedService = billableServiceOptions.find(
                  option => option.value === service.billableServiceId,
                )?.COEHint;

                const finalSubscriptionOrdersQuantity = getFinalSubscriptionOrdersQuantity(
                  service.subscriptionOrders,
                  billableServiceStore.sortedValues,
                );

                const shouldAddFinalOption =
                  daysLeftToExpiration !== null &&
                  daysLeftToExpiration <= 3 &&
                  !isCustomerOwnedService &&
                  !finalSubscriptionOrdersQuantity &&
                  service.billableServiceId;

                const showUpdateMessages: IShowUpdateMessages = getShowUpdateMessages({
                  service,
                  initialService,
                  isSubscriptionEdit,
                });

                const {
                  isShowAddDeliveryOrderMessage,
                  isShowAddFinalOrderMessage,
                  showEffectiveDate,
                } = showUpdateMessages;

                const subscriptionOrderFinal = service.optionalSubscriptionOrders.find(
                  options => options.action === 'final',
                );

                if (subscriptionOrderFinal && !isClone) {
                  const item = billableServiceStore.sortedValues.find(
                    ({ id }) =>
                      id ===
                      subscriptionOrderFinal.subscriptionOrderOptions?.find(
                        ({ action }) => action === 'final',
                      )?.value,
                  );

                  if (item) {
                    subscriptionOrderFinal.billableServiceId = item.id;
                  }
                  pull(service.optionalSubscriptionOrders, subscriptionOrderFinal);
                }

                if (isSubscriptionEdit && showEffectiveDate !== service.showEffectiveDate) {
                  setFieldValue(
                    generateServicePropPath({
                      serviceIndex,
                      property: 'showEffectiveDate',
                    }),
                    showEffectiveDate,
                  );
                }

                if (
                  !showEffectiveDate &&
                  service.effectiveDate?.valueOf() !== initialService?.effectiveDate?.valueOf()
                ) {
                  // revert effectiveDate in the case of props changed back to the initial state
                  setFieldValue(
                    generateServicePropPath({
                      serviceIndex,
                      property: 'effectiveDate',
                    }),
                    initialService?.effectiveDate,
                  );
                }

                const removeService = () => {
                  if (isSubscriptionDraftEdit && service.id) {
                    setFieldValue(
                      generateServicePropPath({
                        serviceIndex,
                        property: 'quantity',
                      }),
                      0,
                    );
                  } else {
                    remove(serviceIndex);
                  }
                };

                if (isSubscriptionDraftEdit && isServiceRemoved) {
                  return null;
                }

                const extraPlaceholder = find(billableServiceOptions, {
                  value: service.billableServiceId,
                })
                  ? undefined
                  : service.billableService?.description;

                const preSelectedHistoricalService = getPreSelectedHistoricalService(service);
                const isUpdatedService = getIsUpdatedService(service);
                const availableServiceOptions = preSelectedHistoricalService
                  ? [preSelectedHistoricalService]
                  : billableServiceOptions;

                const isInvalidSubscription =
                  (isSubscriptionClosed ?? isServiceRemoved) || isUpdatedService;

                const quantityChange = (e: ChangeEvent<HTMLInputElement>) => {
                  const { name, value } = e.target;
                  let newValue = +value;

                  if (newValue < 1) {
                    newValue = 1;
                  }
                  if (newValue > 100) {
                    newValue = 100;
                  }

                  setFieldValue(name, newValue);
                };

                const totalValue = () => {
                  return formatCurrency(
                    service.price *
                      (isServiceRemoved ? initialService?.quantity ?? 0 : service.quantity),
                  );
                };

                const getErrorsValue = (
                  serviceIndexNumber: number,
                  property: keyof INewSubscriptionService,
                ) => {
                  return getIn(
                    errors,
                    generateServicePropPath({
                      serviceIndex: serviceIndexNumber,
                      property,
                    }),
                  );
                };

                const priceChange = (e: ChangeEvent<HTMLInputElement>) => {
                  handleChange(e);
                  return setFieldValue(
                    generateServicePropPath({
                      serviceIndex,
                      property: 'unlockOverrides',
                    }),
                    true,
                  );
                };

                const porationMessage = () => {
                  return values.showProrationButton === false && service.effectiveDate ? (
                    <ProratedMessage effectiveDate={service.effectiveDate} />
                  ) : null;
                };

                return (
                  <ServiceItem key={serviceIndex} serviceIndex={serviceIndex}>
                    {({ handleEndService }) => (
                      <Layouts.Box backgroundColor="grey" backgroundShade="desaturated">
                        <Layouts.Padding padding="3" bottom="2">
                          <Layouts.Flex justifyContent="space-between">
                            <Typography variant="headerThree">
                              {t(`${I18N_PATH}Service`)} #{`${serviceIndex + 1}`}
                            </Typography>
                            {isShowDeleteIcon ? (
                              <Layouts.Margin left="3">
                                <Layouts.IconLayout remove onClick={removeService}>
                                  <Layouts.Flex alignItems="center">
                                    <DeleteIcon
                                      role="button"
                                      tabIndex={0}
                                      aria-label={t(`${I18N_PATH}Remove`)}
                                      onKeyDown={e => handleKeyDown(e, removeService)}
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
                            {isShowEndIcon ? (
                              <Layouts.Margin left="3">
                                <Layouts.IconLayout remove onClick={handleEndService}>
                                  <Layouts.Flex alignItems="center">
                                    <CancelAltIcon
                                      role="button"
                                      tabIndex={0}
                                      aria-label={t(`${I18N_PATH}EndService`)}
                                      onKeyDown={e => handleKeyDown(e, handleEndService)}
                                    />
                                    <Typography
                                      variant="bodyMedium"
                                      color="information"
                                      cursor="pointer"
                                    >
                                      {t(`${I18N_PATH}EndService`)}
                                    </Typography>
                                  </Layouts.Flex>
                                </Layouts.IconLayout>
                              </Layouts.Margin>
                            ) : null}
                          </Layouts.Flex>
                        </Layouts.Padding>
                        <Layouts.Padding left="3" right="3">
                          <Layouts.Flex justifyContent="space-between">
                            <Layouts.Column>
                              <Layouts.Box width="424px">
                                <Select
                                  label={
                                    values.type === ClientRequestType.Subscription
                                      ? t(`${I18N_PATH}RecurrentService`)
                                      : t(`${I18N_PATH}Service`)
                                  }
                                  placeholder={
                                    isServiceSupported
                                      ? t(`${I18N_PATH}SelectService`)
                                      : extraPlaceholder
                                  }
                                  name={generateServicePropPath({
                                    serviceIndex,
                                    property: 'billableServiceId',
                                  })}
                                  disabled={isReadOnly || isSubscriptionClosed}
                                  value={service.billableServiceId}
                                  error={getErrorsValue(serviceIndex, 'billableServiceId')}
                                  onSelectChange={(_, value) =>
                                    handleBillableServiceChange(
                                      value ? +value : undefined,
                                      serviceIndex,
                                    )
                                  }
                                  options={availableServiceOptions}
                                />
                              </Layouts.Box>
                            </Layouts.Column>
                            <Layouts.Column padding="auto">
                              <Layouts.Flex justifyContent="space-between">
                                <Layouts.Margin right="2">
                                  <Layouts.Box width="75px">
                                    {values.unlockOverrides &&
                                    !isSubscriptionClosed &&
                                    !isServiceRemoved ? (
                                      <FormInput
                                        type="number"
                                        label={`${t(`${I18N_PATH}Price`)}, $`}
                                        name={generateServicePropPath({
                                          serviceIndex,
                                          property: 'price',
                                        })}
                                        key="price"
                                        value={service.price}
                                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                          priceChange(e)
                                        }
                                        error={getErrorsValue(serviceIndex, 'price')}
                                      />
                                    ) : (
                                      <Layouts.Flex
                                        justifyContent="space-between"
                                        direction="column"
                                        as={Layouts.Margin}
                                        right="3"
                                      >
                                        <Layouts.Margin bottom="2">
                                          <Typography
                                            color="secondary"
                                            shade="desaturated"
                                            variant="bodyMedium"
                                            textAlign="right"
                                          >
                                            {t(`${I18N_PATH}Price`)}
                                          </Typography>
                                        </Layouts.Margin>
                                        <Typography variant="bodyMedium" textAlign="right">
                                          {formatCurrency(service.price)}
                                        </Typography>
                                      </Layouts.Flex>
                                    )}
                                  </Layouts.Box>
                                </Layouts.Margin>
                                <Layouts.Margin right="1">
                                  <Layouts.Box width="100px">
                                    <Layouts.Flex
                                      alignItems="center"
                                      justifyContent="space-between"
                                    >
                                      <Layouts.Box width="75px" as="span">
                                        <FormInput
                                          label={t(`${I18N_PATH}QTY`)}
                                          type="number"
                                          name={generateServicePropPath({
                                            serviceIndex,
                                            property: 'quantity',
                                          })}
                                          countable
                                          limits={{
                                            min: 1,
                                            max: 100,
                                          }}
                                          disabled={isInvalidSubscription}
                                          value={
                                            isServiceRemoved
                                              ? initialService?.quantity
                                              : service.quantity
                                          }
                                          onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                            quantityChange(e)
                                          }
                                          error={getErrorsValue(serviceIndex, 'quantity')}
                                        />
                                      </Layouts.Box>
                                      {values.showProrationButton === false &&
                                      service?.effectiveDate ? (
                                        <ProratedHint effectiveDate={service.effectiveDate} />
                                      ) : null}
                                    </Layouts.Flex>
                                  </Layouts.Box>
                                </Layouts.Margin>
                                <Layouts.Box minWidth="75px">
                                  <ReadOnlyFormField
                                    label={`${t(`${I18N_PATH}Total`)}, $`}
                                    value={totalValue()}
                                  />
                                </Layouts.Box>
                              </Layouts.Flex>
                            </Layouts.Column>
                          </Layouts.Flex>
                          <Layouts.Flex>
                            <Layouts.Margin right="2">
                              <Layouts.Box width="204px">
                                <Select
                                  name={generateServicePropPath({
                                    serviceIndex,
                                    property: 'serviceFrequencyId',
                                  })}
                                  label={t(`${I18N_PATH}Frequency`)}
                                  value={service.serviceFrequencyId ?? undefined}
                                  placeholder={
                                    service.serviceFrequencyOptions.length
                                      ? t(`${I18N_PATH}SelectFrequency`)
                                      : t(`${I18N_PATH}NoFrequency`)
                                  }
                                  disabled={
                                    isInvalidSubscription || isFrequencyDisabled(serviceIndex)
                                  }
                                  error={getErrorsValue(serviceIndex, 'serviceFrequencyId')}
                                  onSelectChange={(name, value) => {
                                    handleServiceFrequencyChange(
                                      name,
                                      value ? +value : null,
                                      serviceIndex,
                                    );
                                  }}
                                  options={service.serviceFrequencyOptions}
                                />
                              </Layouts.Box>
                            </Layouts.Margin>
                            <Layouts.Box width="204px">
                              <Select
                                name={generateServicePropPath({
                                  serviceIndex,
                                  property: 'materialId',
                                })}
                                value={service.materialId ?? undefined}
                                label={t(`${I18N_PATH}Material`)}
                                placeholder={t(`${I18N_PATH}SelectMaterial`)}
                                disabled={isInvalidSubscription}
                                error={getErrorsValue(serviceIndex, 'materialId')}
                                onSelectChange={(name, value) =>
                                  handleMaterialChange(
                                    name,
                                    value ? +value : undefined,
                                    serviceIndex,
                                  )
                                }
                                options={service.equipmentItemsMaterialsOptions}
                              />
                            </Layouts.Box>
                          </Layouts.Flex>
                          {shouldAddFinalOption ? (
                            <Layouts.Padding bottom="2">
                              <ValidationMessageBlock
                                color="primary"
                                shade="desaturated"
                                textColor="secondary"
                                borderRadius="4px"
                              >
                                {t(`${I18N_PATH}AddFinalSubscriptionOrder`)}
                              </ValidationMessageBlock>
                            </Layouts.Padding>
                          ) : null}
                          {!!service.serviceFrequencyId &&
                          service.serviceFrequencyOptions.length > 0 ? (
                            <ServiceDays
                              serviceIndex={serviceIndex}
                              isReadOnly={isInvalidSubscription}
                            />
                          ) : null}
                        </Layouts.Padding>
                        {isUpdatedService ? (
                          <Layouts.Padding left="3" right="3" bottom="2">
                            <ValidationMessageBlock
                              color="primary"
                              shade="desaturated"
                              textColor="secondary"
                              borderRadius="4px"
                            >
                              {t(`${I18N_PATH}NotAvailableService`)}
                            </ValidationMessageBlock>
                          </Layouts.Padding>
                        ) : null}
                        {isShowAddDeliveryOrderMessage ? (
                          <Layouts.Padding left="3" right="3" bottom="2">
                            <ValidationMessageBlock
                              color="primary"
                              shade="desaturated"
                              textColor="secondary"
                              borderRadius="4px"
                            >
                              {t(`${I18N_PATH}AddDeliverySubscriptionOrder`)}
                            </ValidationMessageBlock>
                          </Layouts.Padding>
                        ) : null}
                        {!isServiceSupported ? (
                          <Layouts.Padding left="3" right="3" bottom="2">
                            <ValidationMessageBlock
                              color="alert"
                              shade="desaturated"
                              textColor="alert"
                            >
                              {t(`${I18N_PATH}ServiceIsNotSupported`)}
                            </ValidationMessageBlock>
                          </Layouts.Padding>
                        ) : null}
                        {isShowAddFinalOrderMessage ? (
                          <Layouts.Padding left="3" right="3" bottom="2">
                            <ValidationMessageBlock
                              color="primary"
                              shade="desaturated"
                              textColor="secondary"
                              borderRadius="4px"
                            >
                              {t(`${I18N_PATH}AddFinalSubscriptionOrder`)}
                            </ValidationMessageBlock>
                          </Layouts.Padding>
                        ) : null}
                        {service.isDeleted && service.effectiveDate ? (
                          <Layouts.Padding left="3" right="3" bottom="2">
                            <ValidationMessageBlock
                              color="primary"
                              shade="desaturated"
                              textColor="secondary"
                            >
                              {`${t(`${I18N_PATH}ServiceWillBeStopped`)} ${format(
                                service.effectiveDate,
                                dateFormat,
                              )}`}
                            </ValidationMessageBlock>
                          </Layouts.Padding>
                        ) : null}
                        {'billableServiceInclusion' in service &&
                        service.billableServiceInclusion ? (
                          <Layouts.Padding right="3" left="3" bottom="1">
                            <Banner color="primary">{service.billableServiceInclusion}</Banner>
                          </Layouts.Padding>
                        ) : null}
                        <Divider />
                        <LineItems
                          serviceIndex={serviceIndex}
                          serviceItem={service}
                          initialServiceItem={initialService}
                          isSubscriptionDraftEdit={isSubscriptionDraftEdit}
                          isSubscriptionClosed={isSubscriptionClosed}
                          isServiceRemoved={isServiceRemoved}
                          isSubscriptionEdit={isSubscriptionEdit}
                        />
                        <Divider />
                        <SubscriptionOrders
                          serviceItem={service}
                          serviceIndex={serviceIndex}
                          isServiceRemoved={isServiceRemoved}
                          isSubscriptionDraftEdit={isSubscriptionDraftEdit}
                          isSubscriptionClosed={isSubscriptionClosed}
                          finalSubscriptionOrdersQuantity={finalSubscriptionOrdersQuantity}
                          endDate={values.endDate}
                          updateSubOrder={updateSubOrder}
                          deleteSubOrder={deleteSubOrder}
                        />
                        <Divider />
                        {showEffectiveDate ? (
                          <Layouts.Box width="50%">
                            <Layouts.Margin left="3" top="3">
                              <Calendar
                                label="Effective Date"
                                name={generateServicePropPath({
                                  serviceIndex,
                                  property: 'effectiveDate',
                                })}
                                withInput
                                readOnly={service.isDeleted ?? isSubscriptionClosed}
                                value={service.effectiveDate}
                                minDate={today}
                                error={getErrorsValue(serviceIndex, 'effectiveDate')}
                                onDateChange={setFieldValue}
                                firstDayOfWeek={firstDayOfWeek}
                                dateFormat={dateFormat}
                                formatDate={formatDate}
                              />
                            </Layouts.Margin>
                          </Layouts.Box>
                        ) : null}
                        {porationMessage()}
                      </Layouts.Box>
                    )}
                  </ServiceItem>
                );
              })}

              {values.serviceItems.length < 10 ? (
                <AddServiceButton disabled={isSubscriptionClosed} onClick={handleAddNewService} />
              ) : null}
            </>
          );
        }}
      </FieldArray>
    );
  },
);
