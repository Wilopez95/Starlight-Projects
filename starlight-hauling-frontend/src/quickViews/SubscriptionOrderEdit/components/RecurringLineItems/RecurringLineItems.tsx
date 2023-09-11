import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ISelectOption, Layouts, Select } from '@starlightpro/shared-components';
import { noop, startCase } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { FormInput, Subsection, Typography } from '@root/common';
import { BillableItemActionEnum } from '@root/consts';
import { useStores } from '@root/hooks';

const I18N_PATH = 'quickViews.SubscriptionOrderEditQuickView.components.RecurringLineItems.';

const RecurringLineItems: React.FC = () => {
  const { lineItemStore, subscriptionStore, subscriptionOrderStore } = useStores();
  const subscriptionOrder = subscriptionOrderStore.selectedEntity;
  const oneTime = subscriptionOrder?.billableService.action !== BillableItemActionEnum.service;
  const { t } = useTranslation();

  const subscriptionOrderServices = useMemo(
    () =>
      subscriptionStore.services.filter(item => {
        return item.lineItems.find(
          el => el.subscriptionServiceItemId === subscriptionOrder?.subscriptionServiceItemId,
        );
      }),
    [subscriptionStore.services, subscriptionOrder?.subscriptionServiceItemId],
  );

  const lineItemOptions: ISelectOption[] = useMemo(() => {
    return lineItemStore.sortedValues
      .filter(item => !item.oneTime)
      .map(lineItem => ({
        label: lineItem.description,
        value: lineItem.id,
      }));
  }, [lineItemStore.sortedValues]);

  if (oneTime) {
    return null;
  }

  return (
    <Subsection gray>
      <Typography variant="headerThree">{t(`${I18N_PATH}RecurringLineItems`)}</Typography>
      <>
        {subscriptionOrderServices?.map((service, index) => {
          return (
            <Layouts.Flex justifyContent="space-between" key={index}>
              <Layouts.Box width="424px" as={Layouts.Flex} justifyContent="space-between">
                <Layouts.Flex direction="column">
                  {service.lineItems.map((lineItem, value) => {
                    return (
                      <>
                        {value === 0 ? (
                          <Layouts.Padding top="1">
                            <Typography
                              as="label"
                              shade="desaturated"
                              color="secondary"
                              variant="bodyMedium"
                            >
                              {t(`${I18N_PATH}RecurringLineItem`)}
                            </Typography>
                          </Layouts.Padding>
                        ) : null}
                        <Layouts.Flex alignItems="center">
                          <Layouts.Margin right="3">
                            <Layouts.Box width="320px">
                              <Select
                                name={`lineItems[${value}].billableLineItemId`}
                                value={lineItem.billableLineItem?.originalId}
                                options={lineItemOptions}
                                onSelectChange={noop}
                                disabled
                              />
                            </Layouts.Box>
                          </Layouts.Margin>
                        </Layouts.Flex>
                      </>
                    );
                  })}
                </Layouts.Flex>
                <Layouts.Margin>
                  {service.lineItems.map((lineItem, value) => {
                    return (
                      <>
                        {value === 0 ? (
                          <Typography
                            htmlFor={`lineItems[${value}].units`}
                            color="secondary"
                            as="label"
                            shade="desaturated"
                            variant="bodyMedium"
                          >
                            {t(`${I18N_PATH}Unit`)}
                          </Typography>
                        ) : null}
                        <Layouts.Margin top="1">
                          <Typography variant="bodyMedium" textAlign="right">
                            {startCase(lineItem.billableLineItem?.unit)}
                          </Typography>
                        </Layouts.Margin>
                      </>
                    );
                  })}
                </Layouts.Margin>
              </Layouts.Box>
              <Layouts.Flex justifyContent="flex-end" alignItems="baseline">
                <Layouts.Box width="160px">
                  <Layouts.Box width="75px">
                    {service.lineItems.map((lineItem, value) => {
                      return (
                        <>
                          {value === 0 ? (
                            <Typography
                              color="secondary"
                              as="label"
                              shade="desaturated"
                              variant="bodyMedium"
                              htmlFor={`lineItems[${value}].quantity`}
                            >
                              {t(`${I18N_PATH}QTY`)}
                            </Typography>
                          ) : null}
                          <FormInput
                            name={`lineItems[${value}].quantity`}
                            key={`lineItems[${value}].quantity`}
                            value={lineItem.quantity}
                            type="number"
                            limits={{
                              min: 1,
                            }}
                            countable
                            disabled
                            onChange={noop}
                          />
                        </>
                      );
                    })}
                  </Layouts.Box>
                </Layouts.Box>
              </Layouts.Flex>
            </Layouts.Flex>
          );
        })}
        <Typography variant="bodyMedium" color="secondary" shade="desaturated">
          + {t(`${I18N_PATH}AddRecurringLineItem`)}
        </Typography>
      </>
    </Subsection>
  );
};

export default observer(RecurringLineItems);
