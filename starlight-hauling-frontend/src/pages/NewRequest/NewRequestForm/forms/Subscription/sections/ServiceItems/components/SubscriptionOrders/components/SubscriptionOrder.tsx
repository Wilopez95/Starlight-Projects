import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, Layouts, Select, TextInputElement } from '@starlightpro/shared-components';
import { endOfToday, isFuture } from 'date-fns';
import { getIn, useFormikContext } from 'formik';
import { filter } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { DeleteIcon } from '@root/assets';
import { FormInput, ReadOnlyFormField, Typography, ValidationMessageBlock } from '@root/common';
import { BillableItemActionEnum } from '@root/consts';
import { handleEnterOrSpaceKeyDown, isPastDate } from '@root/helpers';
import { useDateIntl } from '@root/helpers/format/date';
import { useStores } from '@root/hooks';
import { useIntl } from '@root/i18n/useIntl';

import { generateSubscriptionOrderPropPath } from '../../../../../helpers';
import { INewSubscription } from '../../../../../types';
import { ISubscriptionOrder } from '../types';

const today = endOfToday();

const I18N_PATH =
  'pages.NewRequest.NewRequestForm.forms.Subscription.sections.ServiceItems.components.SubscriptionOrders.components.SubscriptionOrder.Text.';

export const SubscriptionOrder: React.FC<ISubscriptionOrder> = observer(
  ({
    isSubscriptionDraftEdit,
    subscriptionOrder,
    subscriptionOrderIndex,
    serviceIndex,
    isSubscriptionClosed,
    onRemove,
  }) => {
    const { billableServiceStore } = useStores();
    const { formatCurrency, firstDayOfWeek } = useIntl();
    const { values, errors, handleChange, setFieldValue } = useFormikContext<INewSubscription>();
    const { t } = useTranslation();
    const { dateFormat, formatDate } = useDateIntl();

    const readOnly = isSubscriptionDraftEdit ? false : !!subscriptionOrder.id;
    const isRemovable = subscriptionOrder.serviceDate
      ? isFuture(subscriptionOrder.serviceDate)
      : true;

    const handleSubscriptionOrderPriceChange = useCallback(
      (e: React.ChangeEvent<TextInputElement>) => {
        handleChange(e);

        setFieldValue(
          generateSubscriptionOrderPropPath({
            serviceIndex,
            subscriptionOrderIndex,
            property: 'unlockOverrides',
          }),
          true,
        );
      },
      [serviceIndex, subscriptionOrderIndex, handleChange, setFieldValue],
    );

    const handleSubscriptionOrderRemove = useCallback(() => {
      if (!isRemovable) {
        return;
      }

      if (subscriptionOrder.id !== 0) {
        setFieldValue(
          generateSubscriptionOrderPropPath({
            serviceIndex,
            subscriptionOrderIndex,
            property: 'quantity',
          }),
          0,
        );
      } else {
        onRemove();
      }
    }, [
      isRemovable,
      onRemove,
      serviceIndex,
      setFieldValue,
      subscriptionOrder.id,
      subscriptionOrderIndex,
    ]);

    const isServiceDatePassed =
      (subscriptionOrder.serviceDate && isPastDate(subscriptionOrder.serviceDate)) ?? false;

    const hasMultipleIncludedDeliveriesOrFinals = useMemo(() => {
      const includedInServiceOptions = filter(subscriptionOrder?.subscriptionOrderOptions, {
        isIncludedInService: true,
      });

      return includedInServiceOptions?.length > 1;
    }, [subscriptionOrder.subscriptionOrderOptions]);

    if (subscriptionOrder.quantity === 0) {
      return null;
    }

    return (
      <>
        <Layouts.Flex
          justifyContent="space-between"
          key={`serviceItems[${serviceIndex}].subscriptionOrders[${subscriptionOrderIndex}]`}
        >
          <Layouts.Flex>
            <Layouts.Box width="424px">
              <Layouts.Flex justifyContent="space-between">
                <Layouts.Box width="240px">
                  <Layouts.Flex direction="column">
                    {subscriptionOrderIndex === 0 ? (
                      <Layouts.Margin top="0.5" left="3">
                        <Layouts.Padding left="0.5">
                          <Typography
                            as="label"
                            shade="desaturated"
                            color="secondary"
                            variant="bodyMedium"
                            htmlFor={generateSubscriptionOrderPropPath({
                              serviceIndex,
                              subscriptionOrderIndex,
                              property: 'id',
                            })}
                          >
                            Subscription Order
                          </Typography>
                        </Layouts.Padding>
                      </Layouts.Margin>
                    ) : null}
                    <Layouts.Flex alignItems="center">
                      <Layouts.Margin bottom="2">
                        <Layouts.IconLayout
                          cursor={isRemovable ? 'pointer' : 'not-allowed'}
                          remove={isRemovable}
                          onClick={handleSubscriptionOrderRemove}
                        >
                          <DeleteIcon
                            role="button"
                            tabIndex={isRemovable ? 0 : -1}
                            aria-label={t('Text.Remove')}
                            onKeyDown={e => {
                              if (handleEnterOrSpaceKeyDown(e)) {
                                handleSubscriptionOrderRemove();
                              }
                            }}
                          />
                        </Layouts.IconLayout>
                      </Layouts.Margin>
                      <Layouts.Margin right="3" top="0.5">
                        <Layouts.Box width="196px">
                          <Select
                            placeholder="Select Subscription Order"
                            name={generateSubscriptionOrderPropPath({
                              serviceIndex,
                              subscriptionOrderIndex,
                              property: 'billableServiceId',
                            })}
                            value={subscriptionOrder.billableServiceId}
                            options={subscriptionOrder.subscriptionOrderOptions || []}
                            error={getIn(
                              errors,
                              generateSubscriptionOrderPropPath({
                                serviceIndex,
                                subscriptionOrderIndex,
                                property: 'billableServiceId',
                              }),
                            )}
                            disabled={readOnly}
                            onSelectChange={(name: string, value: number) => {
                              const item = billableServiceStore.sortedValues.find(
                                ({ id }) => id === value,
                              );

                              setFieldValue(name, value);
                              setFieldValue(
                                generateSubscriptionOrderPropPath({
                                  serviceIndex,
                                  subscriptionOrderIndex,
                                  property: 'action',
                                }),
                                item?.action,
                              );
                            }}
                            nonClearable
                          />
                        </Layouts.Box>
                      </Layouts.Margin>
                    </Layouts.Flex>
                  </Layouts.Flex>
                </Layouts.Box>

                <Layouts.Box width="160px">
                  <Calendar
                    label={subscriptionOrderIndex === 0 ? 'Service date' : null}
                    name={generateSubscriptionOrderPropPath({
                      serviceIndex,
                      subscriptionOrderIndex,
                      property: 'serviceDate',
                    })}
                    readOnly={readOnly ? isServiceDatePassed || isSubscriptionClosed : undefined}
                    withInput
                    value={subscriptionOrder.serviceDate}
                    minDate={today}
                    error={getIn(
                      errors,
                      generateSubscriptionOrderPropPath({
                        serviceIndex,
                        subscriptionOrderIndex,
                        property: 'serviceDate',
                      }),
                    )}
                    onDateChange={setFieldValue}
                    firstDayOfWeek={firstDayOfWeek}
                    dateFormat={dateFormat}
                    formatDate={formatDate}
                  />
                </Layouts.Box>
              </Layouts.Flex>
            </Layouts.Box>
          </Layouts.Flex>
          <Layouts.Box minWidth="249px">
            <Layouts.Flex justifyContent="space-between">
              <Layouts.Box
                as={Layouts.Margin}
                top="0.5"
                bottom="0.5"
                height="62px"
                minWidth="75px"
                width="75px"
              >
                {subscriptionOrderIndex === 0 ? (
                  <Layouts.Margin bottom="0.5" right="3">
                    <Typography
                      color="secondary"
                      textAlign={values.unlockOverrides && !isSubscriptionClosed ? 'left' : 'right'}
                      shade="desaturated"
                      variant="bodyMedium"
                      htmlFor={generateSubscriptionOrderPropPath({
                        serviceIndex,
                        subscriptionOrderIndex,
                        property: 'price',
                      })}
                    >
                      {values.unlockOverrides && !isSubscriptionClosed ? 'Price, $' : 'Price'}
                    </Typography>
                  </Layouts.Margin>
                ) : null}
                {values.unlockOverrides && !isSubscriptionClosed ? (
                  <Layouts.Margin right="1">
                    <FormInput
                      type="number"
                      name={generateSubscriptionOrderPropPath({
                        serviceIndex,
                        subscriptionOrderIndex,
                        property: 'price',
                      })}
                      value={subscriptionOrder.price}
                      error={getIn(
                        errors,
                        generateSubscriptionOrderPropPath({
                          serviceIndex,
                          subscriptionOrderIndex,
                          property: 'price',
                        }),
                      )}
                      onChange={handleSubscriptionOrderPriceChange}
                    />
                  </Layouts.Margin>
                ) : (
                  <Layouts.Margin top="1" right="3">
                    <Typography variant="bodyMedium" textAlign="right">
                      {formatCurrency(subscriptionOrder.price)}
                    </Typography>
                  </Layouts.Margin>
                )}
              </Layouts.Box>
              <Layouts.Box as={Layouts.Margin} right="3" minWidth="75px" top="0.5" bottom="0.5">
                {subscriptionOrderIndex === 0 ? (
                  <Layouts.Margin bottom="0.5">
                    <Typography
                      color="secondary"
                      as="label"
                      shade="desaturated"
                      variant="bodyMedium"
                      htmlFor={generateSubscriptionOrderPropPath({
                        serviceIndex,
                        subscriptionOrderIndex,
                        property: 'quantity',
                      })}
                    >
                      QTY
                    </Typography>
                  </Layouts.Margin>
                ) : null}
                <Layouts.Margin top="1" right="3">
                  <Typography variant="bodyMedium" textAlign="left">
                    {subscriptionOrder.quantity}
                  </Typography>
                </Layouts.Margin>
              </Layouts.Box>
              <Layouts.Box minWidth="60px" width="60px" as={Layouts.Margin} top="0.5" bottom="0.5">
                <ReadOnlyFormField
                  label={subscriptionOrderIndex === 0 ? 'Total, $' : undefined}
                  value={formatCurrency(subscriptionOrder.quantity * subscriptionOrder.price)}
                />
              </Layouts.Box>
            </Layouts.Flex>
          </Layouts.Box>
        </Layouts.Flex>
        {hasMultipleIncludedDeliveriesOrFinals && !subscriptionOrder.billableServiceId ? (
          <ValidationMessageBlock
            color="primary"
            shade="desaturated"
            textColor="secondary"
            borderRadius="4px"
          >
            {t(
              `${I18N_PATH}${
                subscriptionOrder.action === BillableItemActionEnum.delivery
                  ? 'IncludesMultipleDeliveries'
                  : 'IncludesMultipleFinals'
              }`,
            )}
          </ValidationMessageBlock>
        ) : null}
      </>
    );
  },
);
