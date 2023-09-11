import React from 'react';
import { useTranslation } from 'react-i18next';

import { Typography } from '../../../../../../../../common';
import { useIntl } from '../../../../../../../../i18n/useIntl';
import { OrderTable } from '../styles';
import { type IDraftSubscriptionTable } from '../types';

import DraftSubscriptionRow from './DraftSubscriptionRow';

const columns = ['Subscription', 'BillingPeriod', 'Service', 'Amount'];
const I18NPath = 'pages.Invoices.RunInvoicingMenu.';

const DraftSubscriptionTable: React.FC<IDraftSubscriptionTable> = ({
  currentCustomer,
  subscriptions,
}) => {
  const { currencySymbol } = useIntl();
  const { t } = useTranslation();

  return (
    <OrderTable>
      <thead>
        <tr>
          {columns.map((column, i) => (
            <th key={column}>
              <Typography
                textAlign={i === columns.length - 1 ? 'right' : 'left'}
                variant="headerFive"
                color="secondary"
                textTransform="uppercase"
              >
                {t(`${I18NPath}${column}`, {
                  currency: column === 'Amount' ? `, ${currencySymbol}` : '',
                })}
              </Typography>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {subscriptions.map(subscription => (
          <DraftSubscriptionRow
            key={subscription.id}
            subscription={subscription}
            currentCustomerId={currentCustomer.id}
          />
        ))}
      </tbody>
    </OrderTable>
  );
};

export default DraftSubscriptionTable;
