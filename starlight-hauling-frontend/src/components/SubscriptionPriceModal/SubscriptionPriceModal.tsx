import React from 'react';
import { Layouts } from '@starlightpro/shared-components';
import { find, first, isEmpty, last } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { Modal, Typography } from '@root/common';
import { Divider } from '@root/common/TableTools';

import Period from './BillingPeriod/BillingPeriod';
import LineItemProration from './LineItemProration/LineItemProration';
import ServiceProrationItem from './ServiceProrationItem/ServiceProrationItem';
import SubscriptionOrder from './SubscriptionOrder/SubscriptionOrder';
import TotalBlock from './TotalBlock/TotalBlock';
import { ISubscriptionPriceModal } from './types';

const SubscriptionPriceModal: React.FC<ISubscriptionPriceModal> = ({
  isOpen,
  onClose,
  title,
  total,
  prorations,
  billableServices,
  billableLineItems,
}) => (
  <Modal isOpen={isOpen} onClose={onClose}>
    <Layouts.Box width="640px">
      <Layouts.Flex direction="column">
        <Layouts.Padding top="3" right="3" left="3" bottom="2">
          <Typography variant="headerThree" shade="dark">
            {title}
          </Typography>
        </Layouts.Padding>
        <Divider />
        <Layouts.Scroll maxHeight={460}>
          <Layouts.Padding left="3" right="3" top="2" bottom="2">
            {prorations.map((serviceItemProrations, idx) => {
              const serviceItemProration = first(serviceItemProrations);

              return (
                <div
                  key={`${serviceItemProration?.serviceItemId ?? idx}-${
                    serviceItemProration?.periodFrom?.valueOf() ?? idx
                  }-${serviceItemProration?.periodTo?.valueOf() ?? idx}`}
                >
                  {serviceItemProration ? (
                    <Period
                      periodFrom={serviceItemProration.periodFrom}
                      periodTo={serviceItemProration.periodTo}
                    />
                  ) : null}

                  {serviceItemProrations.map(
                    ({
                      serviceItemId,
                      periodFrom,
                      periodTo,
                      serviceItemProrationInfo,
                      lineItemsProrationInfo = [],
                      subscriptionOrders = [],
                    }) => (
                      <Layouts.Padding
                        bottom="1"
                        key={`${serviceItemId}-${periodFrom.valueOf()}-${periodTo.valueOf()}`}
                      >
                        {serviceItemProrationInfo ? (
                          <ServiceProrationItem
                            showLabels
                            {...serviceItemProrationInfo}
                            billableService={find(billableServices, {
                              id: serviceItemProrationInfo.billableServiceId,
                            })}
                          />
                        ) : null}

                        {lineItemsProrationInfo.map(lineItemProration => (
                          <LineItemProration
                            key={`${lineItemProration.billableLineItemId}-${lineItemProration.lineItemId}`}
                            {...lineItemProration}
                            billableLineItems={find(billableLineItems, {
                              id: lineItemProration.billableLineItemId,
                            })}
                          />
                        ))}

                        {!isEmpty(subscriptionOrders) ? (
                          <>
                            <Layouts.Margin top="1" bottom="1">
                              <Divider />
                            </Layouts.Margin>
                            {subscriptionOrders.map((subscriptionOrder, index) => (
                              <SubscriptionOrder
                                key={`${subscriptionOrder.id}-${index}`}
                                {...subscriptionOrder}
                                showLabels={index === 0}
                                billableService={find(billableServices, {
                                  id: subscriptionOrder.billableServiceId,
                                })}
                              />
                            ))}
                          </>
                        ) : null}
                      </Layouts.Padding>
                    ),
                  )}
                </div>
              );
            })}
          </Layouts.Padding>
        </Layouts.Scroll>
        <Layouts.Padding left="3" right="3" top="1" bottom="2">
          {prorations[0] ? (
            <TotalBlock
              total={total}
              billingPeriodFrom={first(first(prorations))?.periodFrom}
              billingPeriodTo={last(last(prorations))?.periodTo}
            />
          ) : null}
        </Layouts.Padding>
      </Layouts.Flex>
    </Layouts.Box>
  </Modal>
);

export default observer(SubscriptionPriceModal);
