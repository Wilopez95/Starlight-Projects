import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts } from '@starlightpro/shared-components';
import { startCase } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { Typography } from '@root/common';
import { Divider } from '@root/common/TableTools';
import { DetailColumnItem, TotalBlock } from '@root/pages/CustomerSubscriptionDetails/components';
import { SubscriptionOrder } from '@root/stores/subscriptionOrder/SubscriptionOrder';

const I18N_PATH =
  'quickViews.SubscriptionOrderQuickView.components.sections.NonService.NonServiceLineItems.';

const NonServiceLineItems: React.FC<{ subscriptionOrder: SubscriptionOrder }> = ({
  subscriptionOrder,
}) => {
  const { t } = useTranslation();

  return (
    <>
      <Divider both />
      <Typography variant="headerThree">{t(`${I18N_PATH}LineItems`)}</Typography>
      <Layouts.Flex as={Layouts.Margin} bottom="3" justifyContent="space-between">
        <Layouts.Flex as={Layouts.Margin} right="3">
          <Layouts.Box width="500px">
            <Layouts.Margin right="3">
              {subscriptionOrder?.lineItems?.map((item, idx) => (
                <DetailColumnItem
                  key={idx}
                  label={!idx ? t(`${I18N_PATH}LineItem`) : ''}
                  textTransform="uppercase"
                >
                  {item.historicalLineItem?.description}
                </DetailColumnItem>
              ))}
            </Layouts.Margin>
          </Layouts.Box>
          <Layouts.Box>
            <Layouts.Margin right="5">
              {subscriptionOrder?.lineItems?.map((item, idx) => (
                <DetailColumnItem
                  key={idx}
                  label={!idx ? t(`${I18N_PATH}Units`) : ''}
                  textTransform="uppercase"
                >
                  {startCase(item.historicalLineItem?.unit)}
                </DetailColumnItem>
              ))}
            </Layouts.Margin>
          </Layouts.Box>
        </Layouts.Flex>
        <Layouts.Flex direction="column">
          {subscriptionOrder?.lineItems?.map((item, idx) => (
            <TotalBlock
              key={idx}
              price={+(item.price ?? 0)}
              quantity={+item.quantity}
              hideLabels={idx !== 0}
            />
          ))}
        </Layouts.Flex>
      </Layouts.Flex>
    </>
  );
};

export default observer(NonServiceLineItems);
