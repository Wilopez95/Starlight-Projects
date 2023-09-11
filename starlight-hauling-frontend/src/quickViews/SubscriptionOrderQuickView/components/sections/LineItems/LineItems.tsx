import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts } from '@starlightpro/shared-components';
import { startCase } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { Typography } from '@root/common';
import { Divider } from '@root/common/TableTools';
import { useIntl } from '@root/i18n/useIntl';
import { DetailColumnItem, TotalBlock } from '@root/pages/CustomerSubscriptionDetails/components';
import { SubscriptionOrder } from '@root/stores/subscriptionOrder/SubscriptionOrder';

const I18N_PATH = `quickViews.SubscriptionOrderQuickView.components.sections.LineItems.`;

const LineItems: React.FC<{ subscriptionOrder: SubscriptionOrder }> = ({ subscriptionOrder }) => {
  const { lineItems } = subscriptionOrder;
  const { formatCurrency } = useIntl();
  const { t } = useTranslation();

  if (!lineItems?.length) {
    return null;
  }

  return (
    <Layouts.Margin top="2" bottom="2">
      <Divider both />
      <Typography variant="headerThree">{t(`${I18N_PATH}LineItems`)}</Typography>
      {lineItems.map((lineItem, index) => {
        return (
          <Layouts.Flex
            as={Layouts.Margin}
            key={lineItem.billableLineItemId + index}
            bottom="0.5"
            justifyContent="space-between"
          >
            <Layouts.Flex as={Layouts.Margin} right="3">
              <Layouts.Box width="470px">
                <Layouts.Margin right="3">
                  <DetailColumnItem
                    label={!index ? t(`${I18N_PATH}LineItem`) : ''}
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
                    label={!index ? t(`${I18N_PATH}Units`) : ''}
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
              hideLabels={index !== 0}
              variant="bodySmall"
            />
          </Layouts.Flex>
        );
      })}
      <Layouts.Flex justifyContent="flex-end">
        <Layouts.Margin top="2">
          <Layouts.Box width="200px">
            <Layouts.Flex justifyContent="space-between">
              <Layouts.Margin right="1">
                <Typography variant="bodyMedium" fontWeight="bold">
                  {`${t(`${I18N_PATH}LineItemsTotal`)}:`}
                </Typography>
              </Layouts.Margin>
              <Typography fontWeight="bold">
                {formatCurrency(subscriptionOrder.billableLineItemsTotal)}
              </Typography>
            </Layouts.Flex>
          </Layouts.Box>
        </Layouts.Margin>
      </Layouts.Flex>
    </Layouts.Margin>
  );
};

export default observer(LineItems);
