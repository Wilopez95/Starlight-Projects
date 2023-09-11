import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts } from '@starlightpro/shared-components';
import { isEmpty } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { Typography } from '@root/common';
import { Divider } from '@root/common/TableTools';
import { BillableItemActionEnum } from '@root/consts';
import { getFrequencyText } from '@root/pages/SystemConfiguration/components/Frequency/helpers';

import ServiceDaysList from './DaysOfWeek';
import { Cell } from './styles';
import { IServiceItemComponent } from './types';

const I18N_PATH = 'quickViews.SubscriptionQuickView.ServiceItem.';

const ServiceItem: React.FC<IServiceItemComponent> = ({
  serviceItem: { billableService, quantity, serviceDaysOfWeek, serviceFrequency, lineItems },
  index,
}) => {
  const { t } = useTranslation();

  return (
    <>
      <tr>
        <Cell>
          <Typography color="secondary" shade="desaturated" variant="bodyMedium">
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
          <Typography color="secondary" shade="desaturated" as="span">
            {t(`${I18N_PATH}Quantity`)}:
          </Typography>
          <Layouts.Margin as="span" left="0.5">
            {quantity}
          </Layouts.Margin>
        </Cell>
      </tr>
      <tr>
        <Cell />
        {billableService.action == BillableItemActionEnum.service ? (
          <Cell>
            <Typography color="secondary" shade="desaturated" as="span">
              {t(`${I18N_PATH}Frequency`)}:
            </Typography>
            <Layouts.Margin as="span" left="0.5">
              {serviceFrequency
                ? getFrequencyText(t, serviceFrequency?.[0]?.type, serviceFrequency?.[0]?.times)
                : null}
            </Layouts.Margin>
          </Cell>
        ) : null}
      </tr>
      <tr>
        <Cell />
        <Cell>
          {!isEmpty(serviceDaysOfWeek) ? (
            <ServiceDaysList serviceDaysOfWeek={serviceDaysOfWeek} />
          ) : null}
        </Cell>
      </tr>
      {lineItems.length > 0
        ? lineItems.map(({ billableLineItem = {}, quantity: quantityElement = 1 }, i) => (
            <tr key={billableLineItem.description}>
              <Cell>
                {i === 0 ? (
                  <Typography color="secondary" shade="desaturated" variant="bodyMedium">
                    {t(`${I18N_PATH}RecurrentLineItems`)}
                  </Typography>
                ) : null}
              </Cell>
              <Cell>
                <Typography shade="light" variant="bodyMedium">
                  {billableLineItem.description}
                </Typography>

                <Typography color="secondary" shade="desaturated" as="span" variant="bodyMedium">
                  {t(`${I18N_PATH}Quantity`)}:
                </Typography>
                <Layouts.Margin as="span" left="0.5">
                  {quantityElement}
                </Layouts.Margin>
              </Cell>
            </tr>
          ))
        : null}
      <Divider colSpan={2} />
    </>
  );
};

export default observer(ServiceItem);
