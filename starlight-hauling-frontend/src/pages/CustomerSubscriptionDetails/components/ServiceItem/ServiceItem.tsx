import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts } from '@starlightpro/shared-components';
import { isEmpty } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { Typography } from '@root/common';
import { Divider } from '@root/common/TableTools';
import { BillableItemActionEnum } from '@root/consts';
import { getFrequencyText } from '@root/pages/SystemConfiguration/components/Frequency/helpers';
import ServiceDaysList from '@root/quickViews/SubscriptionQuickView/ServiceItem/DaysOfWeek';

import DetailColumnItem from '../DetailColumnItem/DetailColumnItem';
import LineItems from '../LineItems/LineItems';
import TotalBlock from '../TotalBlock/TotalBlock';

import { IServiceItemComponent } from './types';

const marginRight = '5';

const ServiceItem: React.FC<IServiceItemComponent> = ({
  index,
  service: {
    billableService,
    quantity,
    price,
    material,
    lineItems,
    serviceFrequency,
    serviceDaysOfWeek,
  },
}) => {
  const { t } = useTranslation();

  return (
    <Layouts.Margin top="2" bottom="2">
      <Typography variant="headerThree">Service #{index + 1}</Typography>
      <Layouts.Flex as={Layouts.Margin} bottom="2" justifyContent="space-between">
        <Layouts.Flex as={Layouts.Margin} right={marginRight}>
          <Layouts.Margin right={marginRight}>
            <DetailColumnItem label="recurring service" width="38rem" textTransform="uppercase">
              {billableService.description}
            </DetailColumnItem>
          </Layouts.Margin>
          <Layouts.Margin right={marginRight}>
            <DetailColumnItem label="frequency" width="30rem" textTransform="uppercase">
              <Layouts.Flex>
                {billableService.action === BillableItemActionEnum.service && serviceFrequency?.[0]
                  ? getFrequencyText(t, serviceFrequency[0].type, serviceFrequency[0].times)
                  : '-'}
                {!isEmpty(serviceDaysOfWeek) ? (
                  <Layouts.Margin left="1">
                    <ServiceDaysList serviceDaysOfWeek={serviceDaysOfWeek} />
                  </Layouts.Margin>
                ) : null}
              </Layouts.Flex>
            </DetailColumnItem>
          </Layouts.Margin>
          <Layouts.Margin right={marginRight}>
            <DetailColumnItem label="material" textTransform="uppercase">
              {material?.description}
            </DetailColumnItem>
          </Layouts.Margin>
        </Layouts.Flex>
        <TotalBlock price={+price} quantity={+quantity} />
      </Layouts.Flex>
      <Layouts.Margin bottom="3" top="3">
        <Typography variant="headerFour">Recurring Line Items</Typography>
        <Layouts.Margin top="2">
          {isEmpty(lineItems) ? (
            <Typography color="secondary">No Recurring Line Items</Typography>
          ) : (
            <LineItems lineItems={lineItems} />
          )}
        </Layouts.Margin>
      </Layouts.Margin>
      <Divider />
    </Layouts.Margin>
  );
};

export default observer(ServiceItem);
