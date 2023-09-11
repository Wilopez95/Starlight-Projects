import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { Typography } from '@root/common';
import { useIntl } from '@root/i18n/useIntl';

import { ITotalBlock } from './types';

const I18N_PATH =
  'pages.NewRequest.NewRequestForm.forms.Subscription.sections.Summary.Summary.Text.';

const TotalBlock: React.FC<ITotalBlock> = ({ total, billingPeriodFrom, billingPeriodTo }) => {
  const { formatCurrency, formatDateTime } = useIntl();

  const { t } = useTranslation();

  return (
    <Layouts.Margin top="1">
      <Layouts.Box backgroundColor="grey" backgroundShade="desaturated" borderRadius="4px">
        <Layouts.Padding padding="1" right="1">
          <Layouts.Flex justifyContent="space-between">
            {billingPeriodFrom && billingPeriodTo ? (
              <Typography color="secondary" variant="bodyMedium" fontWeight="bold">
                <Layouts.Padding as="span" right="0.5">
                  {t(`${I18N_PATH}SubscriptionPriceIn`)}
                </Layouts.Padding>
                {formatDateTime(billingPeriodFrom).date}
                <Layouts.Padding as="span" left="0.5" right="0.5">
                  -
                </Layouts.Padding>
                {formatDateTime(billingPeriodTo).date}:
              </Typography>
            ) : null}

            <Layouts.Box width="120px">
              <Typography
                color="secondary"
                variant="bodyMedium"
                fontWeight="bold"
                textAlign="right"
              >
                {formatCurrency(total)}
              </Typography>
            </Layouts.Box>
          </Layouts.Flex>
        </Layouts.Padding>
      </Layouts.Box>
    </Layouts.Margin>
  );
};

export default observer(TotalBlock);
