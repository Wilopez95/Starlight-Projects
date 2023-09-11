import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts } from '@starlightpro/shared-components';
import { startCase } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { Typography } from '@root/common';
import { Divider } from '@root/common/TableTools';
import { useStores } from '@root/hooks';
import { useIntl } from '@root/i18n/useIntl';
import { DetailColumnItem, TotalBlock } from '@root/pages/CustomerSubscriptionDetails/components';

const I18N_PATH = `quickViews.SubscriptionWorkOrderQuickView.Text.`;

const WorkOrderLineItems: React.FC = () => {
  const { subscriptionWorkOrderStore } = useStores();

  const subscriptionWorkOrder = subscriptionWorkOrderStore.selectedEntity;
  const { formatCurrency } = useIntl();
  const { t } = useTranslation();
  const lineItems = subscriptionWorkOrder?.lineItems;

  return (
    <>
      {lineItems?.length ? (
        <Layouts.Margin top="2" bottom="2">
          <Divider both />
          <Typography variant="headerThree">{t(`${I18N_PATH}LineItems`)}</Typography>
          {lineItems.length
            ? lineItems.map((lineItem, idx) => {
                return (
                  <Layouts.Flex
                    as={Layouts.Margin}
                    key={idx}
                    bottom="0.5"
                    justifyContent="space-between"
                  >
                    <Layouts.Flex as={Layouts.Margin} right="3">
                      <Layouts.Box width="450px">
                        <Layouts.Margin right="3">
                          <DetailColumnItem
                            label={!idx ? t(`${I18N_PATH}LineItem`) : ''}
                            variant="bodySmall"
                            textTransform="uppercase"
                          >
                            {lineItem.historicalLineItem?.description}
                          </DetailColumnItem>
                        </Layouts.Margin>
                      </Layouts.Box>
                      <Layouts.Box>
                        <Layouts.Margin right="5">
                          <DetailColumnItem
                            label={!idx ? t(`${I18N_PATH}Units`) : ''}
                            variant="bodySmall"
                            textTransform="uppercase"
                          >
                            {startCase(lineItem.historicalLineItem?.unit)}
                          </DetailColumnItem>
                        </Layouts.Margin>
                      </Layouts.Box>
                    </Layouts.Flex>
                    <TotalBlock
                      price={lineItem.price}
                      quantity={+lineItem.quantity}
                      hideLabels={idx !== 0}
                      variant="bodySmall"
                    />
                  </Layouts.Flex>
                );
              })
            : null}
          <Layouts.Flex justifyContent="flex-end">
            <Layouts.Margin top="2">
              <Layouts.Box width="200px">
                <Layouts.Flex justifyContent="space-between">
                  <Typography variant="bodyMedium" fontWeight="bold">
                    {`${t(`${I18N_PATH}LineItemsTotal`)}: `}
                  </Typography>
                  <Typography fontWeight="bold">
                    {formatCurrency(subscriptionWorkOrder?.billableLineItemsTotal)}
                  </Typography>
                </Layouts.Flex>
              </Layouts.Box>
            </Layouts.Margin>
          </Layouts.Flex>
        </Layouts.Margin>
      ) : null}
    </>
  );
};

export default observer(WorkOrderLineItems);
