import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts, Typography } from '@starlightpro/shared-components';
import { isEmpty } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { Divider } from '@root/core/common/TableTools';
import { BillableItemActionEnum } from '@root/core/consts';
import { getFrequencyText } from '@root/orders-and-subscriptions/stores/subscription/helpers/getFrequencyText';

import ServiceDaysList from './DaysOfWeek';
import { Cell } from './styles';
import { IServiceItemComponent } from './types';

const I18N_PATH = 'components.SubscriptionQuickView.';

const ServiceItem: React.FC<IServiceItemComponent> = ({
  serviceItem: { billableService, quantity, serviceDaysOfWeek, serviceFrequency, lineItems },
  index,
}) => {
  const { t } = useTranslation();

  return (
    <>
      <tr>
        <Cell>
          <Typography color='secondary' shade='desaturated' variant='bodyMedium'>
            {t(`${I18N_PATH}Service`, { number: index + 1 })}
          </Typography>
        </Cell>
        <Cell>
          <Typography>{billableService.description}</Typography>
        </Cell>
      </tr>
      <tr>
        <Cell />
        <Cell>
          <Typography color='secondary' shade='desaturated' as='span'>
            {t(`${I18N_PATH}Quantity`)}:
          </Typography>
          <Layouts.Margin as='span' left='0.5'>
            {quantity}
          </Layouts.Margin>
        </Cell>
      </tr>
      <tr>
        <Cell />
        {billableService.action == BillableItemActionEnum.service && (
          <Cell>
            <Typography color='secondary' shade='desaturated' as='span'>
              {t(`${I18N_PATH}Frequency`)}:
            </Typography>
            <Layouts.Margin as='span' left='0.5'>
              {serviceFrequency && getFrequencyText(serviceFrequency.type, serviceFrequency.times)}
            </Layouts.Margin>
          </Cell>
        )}
      </tr>
      <tr>
        <Cell />
        <Cell>
          {!isEmpty(serviceDaysOfWeek) && <ServiceDaysList serviceDaysOfWeek={serviceDaysOfWeek} />}
        </Cell>
      </tr>
      {lineItems.length > 0 &&
        lineItems.map(({ billableLineItem = {}, quantity = 1 }, i) => (
          <tr key={billableLineItem.description}>
            <Cell>
              {i === 0 && (
                <Typography color='secondary' shade='desaturated' variant='bodyMedium'>
                  {t(`${I18N_PATH}RecurrentLineItems`)}
                </Typography>
              )}
            </Cell>
            <Cell>
              <Typography shade='light' variant='bodyMedium'>
                {billableLineItem.description}
              </Typography>

              <Typography color='secondary' shade='desaturated' as='span' variant='bodyMedium'>
                {t(`${I18N_PATH}Quantity`)}:
              </Typography>
              <Layouts.Margin as='span' left='0.5'>
                {quantity}
              </Layouts.Margin>
            </Cell>
          </tr>
        ))}
      <Divider colSpan={2} />
    </>
  );
};

export default observer(ServiceItem);
