import React, { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Layouts } from '@starlightpro/shared-components';
import { FieldArray, getIn, useFormikContext } from 'formik';
import { observer } from 'mobx-react-lite';

import { Typography } from '@root/common';
import { BillableItemActionEnum } from '@root/consts';
import { useStores } from '@root/hooks';
import { IConfigurableSubscriptionOrder, SubscriptionOrderStatusEnum } from '@root/types';

import LineItem from '../LineItem/LineItem';

const I18N_PATH = 'quickViews.SubscriptionOrderEditQuickView.components.LineItems.';

const LineItems: React.FC = () => {
  const { values, errors } = useFormikContext<IConfigurableSubscriptionOrder>();
  const { lineItemStore, subscriptionOrderStore } = useStores();

  const { t } = useTranslation();

  const subscriptionOrder = subscriptionOrderStore.selectedEntity;
  const isNonService =
    subscriptionOrder?.billableService.action === BillableItemActionEnum.nonService;

  const disabled = useMemo(
    () =>
      !subscriptionOrder ||
      ([SubscriptionOrderStatusEnum.finalized, SubscriptionOrderStatusEnum.completed].includes(
        subscriptionOrder.status,
      ) &&
        !isNonService),
    [subscriptionOrder, isNonService],
  );

  useEffect(() => {
    if (values.businessLineId) {
      lineItemStore.request({ businessLineId: values.businessLineId });
    }
  }, [lineItemStore, values.businessLineId]);

  if (disabled && !values.lineItems?.length) {
    return null;
  }

  return (
    <>
      <Typography variant="headerThree">{t(`${I18N_PATH}LineItems`)}</Typography>
      <Layouts.Margin top="2">
        <FieldArray name="lineItems">
          {({ push, remove }) => (
            <>
              {values.lineItems
                ? values.lineItems.map((lineItem, index) => (
                    <LineItem
                      lineItem={lineItem}
                      handleRemove={() => remove(index)}
                      index={index}
                      disabled={disabled}
                      key={index}
                    />
                  ))
                : null}
              {!disabled ? (
                <Button
                  variant="none"
                  onClick={() => {
                    push({
                      billableLineItemId: undefined,
                      quantity: 1,
                      customRatesGroupLineItemsId: undefined,
                      globalRatesLineItemsId: undefined,
                      price: undefined,
                      historicalLineItem: {
                        unit: undefined,
                        originalId: undefined,
                      },
                    });
                  }}
                >
                  <Typography variant="bodyMedium" cursor="pointer" color="information">
                    + {t(`${I18N_PATH}AddLineItem`)}
                  </Typography>
                </Button>
              ) : null}
              {isNonService && !values.lineItems?.length ? (
                <Typography color="alert" variant="bodySmall">
                  {getIn(errors, 'lineItems')}
                </Typography>
              ) : null}
            </>
          )}
        </FieldArray>
      </Layouts.Margin>
    </>
  );
};

export default observer(LineItems);
