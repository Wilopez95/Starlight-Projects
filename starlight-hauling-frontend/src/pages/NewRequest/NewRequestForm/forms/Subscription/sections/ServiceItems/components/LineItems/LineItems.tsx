import React, { ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ISelectOption, Layouts, Select } from '@starlightpro/shared-components';
import { format } from 'date-fns';
import { FieldArray, getIn, useFormikContext } from 'formik';
import { find, isEmpty, isEqual, pick } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { DeleteIcon } from '@root/assets';
import { FormInput, ReadOnlyFormField, Typography, ValidationMessageBlock } from '@root/common';
import { handleEnterOrSpaceKeyDown } from '@root/helpers';
import { usePrevious, useStores } from '@root/hooks';
import { useIntl } from '@root/i18n/useIntl';

import { generateLineItemsPropPath, generateServicePropPath } from '../../../../helpers';
import {
  INewSubscription,
  INewSubscriptionLineItem,
  INewSubscriptionService,
} from '../../../../types';
import ProratedHint from '../ProratedHint/ProratedHint';

import { ILineItems } from './types';

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

export const LineItems: React.FC<ILineItems> = observer(
  ({
    initialServiceItem,
    serviceItem,
    serviceIndex,
    isSubscriptionEdit,
    isSubscriptionDraftEdit,
    isServiceRemoved,
    isSubscriptionClosed,
  }) => {
    const { t } = useTranslation();
    const { lineItemStore } = useStores();
    const { formatCurrency, dateFormat } = useIntl();
    const { values, errors, handleChange, setFieldValue } = useFormikContext<INewSubscription>();
    const [extraPlaceholder, setExtraPlaceholder] = useState<string>();

    const prevServiceItem: INewSubscriptionService | undefined = usePrevious(serviceItem);

    const lineItemOptions = useMemo((): ISelectOption[] => {
      const lineItems = lineItemStore.sortedValues.filter(item =>
        values.billingCycle ? item.billingCycles?.includes(values.billingCycle) : true,
      );

      return lineItems.map(lineItem => ({
        label: lineItem.description,
        value: lineItem.id,
      }));
    }, [lineItemStore.sortedValues, values.billingCycle]);

    const getRemainingLineItemOptions = useCallback(
      (serviceIndexNum: number, billableLineItemId?: number): ISelectOption[] => {
        const serviceItemData = values.serviceItems[serviceIndexNum];

        const selectedLineItemIds = serviceItemData.lineItems
          .filter(item => (isSubscriptionDraftEdit ? !!item.quantity : true))
          .map(item => item.billableLineItemId)
          .filter(id => id !== billableLineItemId);

        return lineItemOptions.filter(
          lineItemOption => !selectedLineItemIds.includes(+lineItemOption.value),
        );
      },
      [lineItemOptions, isSubscriptionDraftEdit, values.serviceItems],
    );

    const handleLineItemChange = useCallback(
      (value: number, serviceIndexNum: number, lineItemIndex: number) => {
        const lineItems =
          values.serviceItems[serviceIndexNum].lineItems?.map(
            lineItem => lineItem.billableLineItemId,
          ) ?? [];

        lineItems.splice(lineItemIndex, 1, value);
      },
      [values.serviceItems],
    );

    const resetUnlockOverrides = useCallback(() => {
      const updatedLineItems = serviceItem.lineItems.map(lineItem => ({
        ...lineItem,
        unlockOverrides: false,
      }));

      setFieldValue(
        generateServicePropPath({
          serviceIndex,
          property: 'lineItems',
        }),
        updatedLineItems,
      );
    }, [serviceIndex, serviceItem.lineItems, setFieldValue]);

    useEffect(() => {
      const relatedServiceItemFields: (keyof INewSubscriptionService)[] = [
        'materialId',
        'serviceFrequencyId',
      ];

      if (
        prevServiceItem &&
        !isEqual(
          pick(serviceItem, relatedServiceItemFields),
          pick(prevServiceItem, relatedServiceItemFields),
        )
      ) {
        resetUnlockOverrides();
      }
    }, [prevServiceItem, resetUnlockOverrides, serviceItem]);

    const validationsBeforeRender = (
      initialServiceItemData?: INewSubscriptionService,
      lineItemData?: INewSubscriptionLineItem,
      lineItemIndex: number = 0,
      remove?: (index: number) => void,
    ) => {
      const initialLineItem = find(initialServiceItemData?.lineItems, {
        id: lineItemData?.id,
      });
      const lineItemOptionsData = getRemainingLineItemOptions(
        serviceIndex,
        lineItemData?.billableLineItemId,
      );

      if (lineItemOptionsData?.find(elem => elem.value === lineItemData?.billableLineItemId)) {
        setExtraPlaceholder(lineItemStore.getById(lineItemData?.billableLineItemId)?.description);
      }
      const isRemovedLineItem =
        !lineItemData?.quantity || isServiceRemoved || lineItemData?.isDeleted;

      const isRecurrentLineSupported =
        lineItemData?.billableLineItemId === undefined ||
        lineItemOptionsData.some(({ value }) => value === lineItemData.billableLineItemId);
      const removeLineItem = () => {
        if (lineItemData?.id) {
          setFieldValue(
            generateLineItemsPropPath({
              serviceIndex,
              lineItemIndex,
              property: 'quantity',
            }),
            0,
          );
        } else {
          remove?.(lineItemIndex);
        }
      };

      if (
        serviceItem.quantity < (lineItemData?.quantity ?? 0) &&
        !lineItemData?.isDeleted &&
        !isServiceRemoved
      ) {
        setFieldValue(
          generateLineItemsPropPath({
            serviceIndex,
            lineItemIndex,
            property: 'quantity',
          }),
          serviceItem.quantity,
        );
      }
      return {
        initialLineItem,
        isRemovedLineItem,
        isRecurrentLineSupported,
        removeLineItem,
      };
    };

    return (
      <FieldArray
        name={generateServicePropPath({
          serviceIndex,
          property: 'lineItems',
        })}
      >
        {({
          push,
          remove,
        }: {
          push(obj: INewSubscriptionLineItem): void;
          remove(index: number): void;
        }) => {
          const remainingLineItemOptions = getRemainingLineItemOptions(serviceIndex);

          return (
            <Layouts.Box>
              <Layouts.Padding padding="3">
                <Layouts.Margin bottom="1">
                  <Typography variant="headerFour">
                    {t(`${I18N_PATH}RecurringLineItems`)}
                  </Typography>
                </Layouts.Margin>
                {serviceItem.lineItems?.map((lineItem, lineItemIndex) => {
                  const {
                    initialLineItem,
                    isRemovedLineItem,
                    isRecurrentLineSupported,
                    removeLineItem,
                  } = validationsBeforeRender(initialServiceItem, lineItem, lineItemIndex, remove);

                  if (isRemovedLineItem && isSubscriptionDraftEdit) {
                    return null;
                  }

                  return (
                    <Layouts.Box key={`serviceItems[${serviceIndex}].lineItems[${lineItemIndex}]`}>
                      <Layouts.Flex justifyContent="space-between">
                        <Layouts.Flex direction="column">
                          {lineItemIndex === 0 ? (
                            <Layouts.Margin left="3">
                              <Layouts.Padding left="0.5">
                                <Typography
                                  as="label"
                                  shade="desaturated"
                                  color="secondary"
                                  variant="bodyMedium"
                                  htmlFor={generateLineItemsPropPath({
                                    serviceIndex,
                                    lineItemIndex,
                                    property: 'billableLineItemId',
                                  })}
                                >
                                  {t(`${I18N_PATH}RecurringLineItem`)}
                                </Typography>
                              </Layouts.Padding>
                            </Layouts.Margin>
                          ) : null}
                          <Layouts.Flex alignItems="center">
                            <Layouts.Margin bottom="4">
                              {isRemovedLineItem ? (
                                <Layouts.Box width="28px" />
                              ) : (
                                <Layouts.IconLayout remove onClick={removeLineItem}>
                                  <DeleteIcon
                                    role="button"
                                    tabIndex={0}
                                    aria-label={t('Text.Remove')}
                                    onKeyDown={e => handleKeyDown(e, removeLineItem)}
                                  />
                                </Layouts.IconLayout>
                              )}
                            </Layouts.Margin>
                            <Layouts.Box width="396px">
                              <Select
                                placeholder={
                                  isRecurrentLineSupported
                                    ? t(`${I18N_PATH}SelectLineItem`)
                                    : extraPlaceholder
                                }
                                name={generateLineItemsPropPath({
                                  serviceIndex,
                                  lineItemIndex,
                                  property: 'billableLineItemId',
                                })}
                                disabled={
                                  isSubscriptionClosed || isRemovedLineItem || isSubscriptionEdit
                                    ? !!lineItem.id
                                    : false
                                }
                                value={lineItem.billableLineItemId}
                                options={lineItemOptions}
                                error={getIn(
                                  errors,
                                  generateLineItemsPropPath({
                                    serviceIndex,
                                    lineItemIndex,
                                    property: 'billableLineItemId',
                                  }),
                                )}
                                onSelectChange={(name: string, value: number) => {
                                  handleLineItemChange(value, serviceIndex, lineItemIndex);
                                  setFieldValue(name, value);
                                }}
                                nonClearable
                              />
                            </Layouts.Box>
                          </Layouts.Flex>
                        </Layouts.Flex>
                        <Layouts.Box minWidth="249px">
                          <Layouts.Flex justifyContent="space-between">
                            <Layouts.Box flexShrink="0" height="62px" width="75px">
                              {lineItemIndex === 0 ? (
                                <Layouts.Margin right="3">
                                  <Typography
                                    color="secondary"
                                    as="label"
                                    textAlign={values.unlockOverrides ? 'left' : 'right'}
                                    shade="desaturated"
                                    variant="bodyMedium"
                                    htmlFor={generateLineItemsPropPath({
                                      serviceIndex,
                                      lineItemIndex,
                                      property: 'price',
                                    })}
                                  >
                                    {values.unlockOverrides
                                      ? `${t(`${I18N_PATH}Price`)}, $`
                                      : t(`${I18N_PATH}Price`)}
                                  </Typography>
                                </Layouts.Margin>
                              ) : null}
                              {values.unlockOverrides &&
                              !isSubscriptionClosed &&
                              !isRemovedLineItem ? (
                                <Layouts.Margin right="1">
                                  <FormInput
                                    type="number"
                                    name={generateLineItemsPropPath({
                                      serviceIndex,
                                      lineItemIndex,
                                      property: 'price',
                                    })}
                                    value={lineItem.price}
                                    error={getIn(
                                      errors,
                                      generateLineItemsPropPath({
                                        serviceIndex,
                                        lineItemIndex,
                                        property: 'price',
                                      }),
                                    )}
                                    onChange={e => {
                                      handleChange(e);
                                      setFieldValue(
                                        generateLineItemsPropPath({
                                          serviceIndex,
                                          lineItemIndex,
                                          property: 'unlockOverrides',
                                        }),
                                        true,
                                      );
                                    }}
                                  />
                                </Layouts.Margin>
                              ) : (
                                <Layouts.Margin top="1" right="3">
                                  <Typography variant="bodyMedium" textAlign="right">
                                    {formatCurrency(lineItem.price)}
                                  </Typography>
                                </Layouts.Margin>
                              )}
                            </Layouts.Box>
                            <Layouts.Box width="100%">
                              <Layouts.Flex justifyContent="space-between" alignItems="center">
                                <Layouts.Box width="75px">
                                  {lineItemIndex === 0 ? (
                                    <Typography
                                      color="secondary"
                                      as="label"
                                      shade="desaturated"
                                      variant="bodyMedium"
                                      htmlFor={generateLineItemsPropPath({
                                        serviceIndex,
                                        lineItemIndex,
                                        property: 'quantity',
                                      })}
                                    >
                                      {t(`${I18N_PATH}QTY`)}
                                    </Typography>
                                  ) : null}

                                  <FormInput
                                    name={generateLineItemsPropPath({
                                      serviceIndex,
                                      lineItemIndex,
                                      property: 'quantity',
                                    })}
                                    value={
                                      isRemovedLineItem
                                        ? initialLineItem?.quantity
                                        : lineItem.quantity
                                    }
                                    type="number"
                                    limits={{
                                      min: 1,
                                      max: serviceItem.quantity,
                                    }}
                                    disabled={isRemovedLineItem ?? isSubscriptionClosed}
                                    countable
                                    error={getIn(
                                      errors,
                                      generateLineItemsPropPath({
                                        serviceIndex,
                                        lineItemIndex,
                                        property: 'quantity',
                                      }),
                                    )}
                                    onChange={(e: ChangeEvent<HTMLInputElement>): void => {
                                      const { name, value } = e.target;

                                      setFieldValue(name, value);
                                    }}
                                  />
                                </Layouts.Box>
                                {values.showProrationButton === false && lineItem?.effectiveDate ? (
                                  <ProratedHint effectiveDate={lineItem.effectiveDate} />
                                ) : null}
                              </Layouts.Flex>
                            </Layouts.Box>
                            <Layouts.Box minWidth="75px" width="75px">
                              <ReadOnlyFormField
                                label={
                                  lineItemIndex === 0 ? `${t(`${I18N_PATH}Total`)}, $` : undefined
                                }
                                value={formatCurrency(
                                  (isRemovedLineItem
                                    ? initialLineItem?.quantity ?? 0
                                    : lineItem.quantity) * lineItem.price,
                                )}
                              />
                            </Layouts.Box>
                          </Layouts.Flex>
                        </Layouts.Box>
                      </Layouts.Flex>
                      {!isRecurrentLineSupported ? (
                        <Layouts.Padding left="3" right="3" bottom="2">
                          <ValidationMessageBlock
                            color="alert"
                            shade="desaturated"
                            textColor="alert"
                          >
                            {t(`${I18N_PATH}LineItemIsNotSupported`)}
                          </ValidationMessageBlock>
                        </Layouts.Padding>
                      ) : null}
                      {lineItem.isDeleted && lineItem.effectiveDate ? (
                        <Layouts.Padding left="3" right="3" bottom="2">
                          <ValidationMessageBlock
                            color="primary"
                            shade="desaturated"
                            textColor="secondary"
                          >
                            {`${t(`${I18N_PATH}LineItemWillBeRemoved`)} ${format(
                              lineItem.effectiveDate,
                              dateFormat.date,
                            )}`}
                          </ValidationMessageBlock>
                        </Layouts.Padding>
                      ) : null}
                    </Layouts.Box>
                  );
                })}
                {(isEmpty(lineItemOptions) || !isEmpty(remainingLineItemOptions)) &&
                !isServiceRemoved ? (
                  <Button
                    variant="none"
                    disabled={isSubscriptionClosed}
                    onClick={() => {
                      push({
                        billableLineItemId: +remainingLineItemOptions[0]?.value,
                        quantity: 1,
                        units: undefined,
                        customRatesGroupRecurringLineItemBillingCycleId: undefined,
                        globalRatesRecurringLineItemsBillingCycleId: undefined,
                        unlockOverrides: false,
                        price: 0,
                      });
                    }}
                  >
                    <Typography variant="bodyMedium" cursor="pointer" color="information">
                      + {t(`${I18N_PATH}AddRecurringLineItem`)}
                    </Typography>
                  </Button>
                ) : null}
              </Layouts.Padding>
            </Layouts.Box>
          );
        }}
      </FieldArray>
    );
  },
);
