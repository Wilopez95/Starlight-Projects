import React, { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts } from '@starlightpro/shared-components';
import { startCase } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { Typography } from '@root/common';
import { Divider } from '@root/common/TableTools';
import { useStores } from '@root/hooks';
import { DetailColumnItem } from '@root/pages/CustomerSubscriptionDetails/components';

const I18N_PATH = 'quickViews.SubscriptionOrderQuickView.components.sections.RecurringLineItems.';

const RecurringLineItems: React.FC<{
  subscriptionId: number;
  subscriptionServiceItemId: number;
  isWorkOrderView?: boolean;
  oneTime?: boolean;
}> = ({ subscriptionId, subscriptionServiceItemId, isWorkOrderView = false, oneTime = false }) => {
  const { t } = useTranslation();
  const { subscriptionStore } = useStores();

  useEffect(() => {
    subscriptionStore.requestSubscriptionServices(subscriptionId);
  }, [subscriptionStore, subscriptionId]);

  const subscriptionOrderServices = useMemo(
    () =>
      subscriptionStore.services.filter(item => {
        return item.lineItems.find(
          el => el.subscriptionServiceItemId === subscriptionServiceItemId,
        );
      }),
    [subscriptionStore.services, subscriptionServiceItemId],
  );

  return (
    <>
      {subscriptionOrderServices?.map((service, index) => {
        return (
          <>
            {service.lineItems.length ? (
              <>
                <Divider both />
                <Typography variant="headerThree">{t(`${I18N_PATH}RecurringLineItems`)}</Typography>
              </>
            ) : null}
            <Layouts.Margin bottom="2" key={index}>
              <Layouts.Box width="90%">
                <Layouts.Flex as={Layouts.Margin} justifyContent="space-between">
                  <Layouts.Flex as={Layouts.Margin} right="3">
                    <Layouts.Box width="500px">
                      {service.lineItems.map((lineItem, value) => {
                        return (
                          <>
                            {value === 0 ? (
                              <Layouts.Flex justifyContent="space-between">
                                <DetailColumnItem
                                  label={t(`${I18N_PATH}RecurringLineItem`)}
                                  textTransform="uppercase"
                                  variant="bodySmall"
                                />
                                <DetailColumnItem
                                  label={t(`${I18N_PATH}Units`)}
                                  textTransform="uppercase"
                                  variant="bodySmall"
                                />
                              </Layouts.Flex>
                            ) : null}
                            <Layouts.Flex justifyContent="space-between" key={value}>
                              <DetailColumnItem>
                                {lineItem.billableLineItem?.description}
                              </DetailColumnItem>
                              <DetailColumnItem>
                                {startCase(lineItem.billableLineItem?.unit)}
                              </DetailColumnItem>
                            </Layouts.Flex>
                          </>
                        );
                      })}
                    </Layouts.Box>
                  </Layouts.Flex>
                  {!isWorkOrderView && !oneTime ? (
                    <Layouts.Flex justifyContent="flex-end">
                      <Layouts.Box>
                        {service.lineItems.map((lineItem, value) => {
                          return (
                            <>
                              {value === 0 ? (
                                <Layouts.Flex justifyContent="flex-end">
                                  <Layouts.Box>
                                    <DetailColumnItem
                                      label={t(`${I18N_PATH}qty`)}
                                      textTransform="uppercase"
                                      variant="bodySmall"
                                    />
                                  </Layouts.Box>
                                </Layouts.Flex>
                              ) : null}
                              <DetailColumnItem key={value} textAlign="center">
                                {lineItem.quantity}
                              </DetailColumnItem>
                            </>
                          );
                        })}
                      </Layouts.Box>
                    </Layouts.Flex>
                  ) : null}
                </Layouts.Flex>
              </Layouts.Box>
            </Layouts.Margin>
          </>
        );
      })}
    </>
  );
};

export default observer(RecurringLineItems);
