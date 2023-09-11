import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { Typography } from '@root/common';
import { useIntl } from '@root/i18n/useIntl';

import { ISubscriptionOrderComponent } from './types';

const I18N_PATH =
  'pages.NewRequest.NewRequestForm.forms.Subscription.sections.Summary.Summary.Text.';

const SubscriptionOrder: React.FC<ISubscriptionOrderComponent> = ({
  billableService,
  price,
  quantity,
  showLabels = false,
}) => {
  const { formatCurrency } = useIntl();
  const { t } = useTranslation();

  return (
    <Layouts.Flex justifyContent="space-between">
      <Layouts.Box width="250px">
        <Layouts.Margin top={showLabels ? '3' : '1'}>
          <Typography color="secondary" variant="bodyMedium">
            {billableService?.description ?? '-'}
          </Typography>
        </Layouts.Margin>
      </Layouts.Box>
      <Layouts.Box width="75px" />
      <Layouts.Box width="85px">
        {showLabels ? (
          <Layouts.Padding right="1">
            <Typography color="secondary" shade="desaturated" variant="bodySmall" textAlign="right">
              {t(`${I18N_PATH}TotalPrice`)}
            </Typography>
          </Layouts.Padding>
        ) : null}

        <Layouts.Margin top="0.5">
          <Typography variant="bodyMedium" textAlign="right">
            {formatCurrency(price)} ×
          </Typography>
        </Layouts.Margin>
      </Layouts.Box>
      <Layouts.Box width="85px">
        {showLabels ? (
          <Layouts.Padding right="1.5">
            <Typography color="secondary" shade="desaturated" variant="bodySmall" textAlign="right">
              {t(`Text.QTY`)}
            </Typography>
          </Layouts.Padding>
        ) : null}

        <Layouts.Margin top="0.5">
          <Typography variant="bodyMedium" textAlign="right">
            {quantity} =
          </Typography>
        </Layouts.Margin>
      </Layouts.Box>
      <Layouts.Box width="85px">
        {showLabels ? (
          <Typography color="secondary" shade="desaturated" variant="bodySmall" textAlign="right">
            {t(`${I18N_PATH}Total`)}
          </Typography>
        ) : null}

        <Layouts.Margin top="0.5">
          <Typography variant="bodyMedium" textAlign="right">
            {formatCurrency(price * quantity)}
          </Typography>
        </Layouts.Margin>
      </Layouts.Box>
    </Layouts.Flex>
  );
};

export default observer(SubscriptionOrder);
