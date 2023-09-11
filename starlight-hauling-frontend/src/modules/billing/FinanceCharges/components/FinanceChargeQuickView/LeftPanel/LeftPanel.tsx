import React from 'react';
import { Layouts } from '@starlightpro/shared-components';
import { sumBy } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { useIntl } from '@root/i18n/useIntl';

import { Typography } from '../../../../../../common';
import { LeftPanelTools } from '../../../../../../common/QuickView';
import { useStores } from '../../../../../../hooks';
import { Payment } from '../../../../Payments/store/Payment';
import { getBadgeByStatus } from '../../../helpers/getBadgeByStatus';

const LeftPanel: React.FC = () => {
  const { financeChargeStore } = useStores();
  const { formatDateTime, formatCurrency } = useIntl();

  const currentFinCharge = financeChargeStore.selectedEntity!;

  const createDate = formatDateTime(currentFinCharge.createdAt as Date).date;

  const badge = getBadgeByStatus(currentFinCharge.status);

  const { writeOffPayments, payments } = currentFinCharge.payments.reduce<
    Record<string, Payment[]>
  >(
    (cur, acc) => {
      if (acc.paymentType === 'writeOff') {
        cur.writeOffPayments.push(acc);
      } else {
        cur.payments.push(acc);
      }

      return cur;
    },
    {
      writeOffPayments: [],
      payments: [],
    },
  );

  return (
    <LeftPanelTools.Panel>
      <Layouts.Scroll>
        <LeftPanelTools.ItemsContainer>
          <LeftPanelTools.Item>
            <Typography fontWeight="bold" variant="bodyLarge">
              Fin Charge# {currentFinCharge.id}
            </Typography>
          </LeftPanelTools.Item>

          <LeftPanelTools.Item>{badge}</LeftPanelTools.Item>

          <LeftPanelTools.Item>
            <Typography color="secondary" shade="desaturated">
              Fin Charge ID:
            </Typography>
            <LeftPanelTools.Subitem>{currentFinCharge.id}</LeftPanelTools.Subitem>
          </LeftPanelTools.Item>

          <LeftPanelTools.Item>
            <Typography color="secondary" shade="desaturated">
              Created:
            </Typography>
            <LeftPanelTools.Subitem>{createDate}</LeftPanelTools.Subitem>
          </LeftPanelTools.Item>

          {currentFinCharge.customer ? (
            <>
              <LeftPanelTools.Item>
                <Typography color="secondary" shade="desaturated">
                  Customer:
                </Typography>
                <LeftPanelTools.Subitem>
                  {currentFinCharge.customer?.name ?? ''}
                </LeftPanelTools.Subitem>
              </LeftPanelTools.Item>
              <LeftPanelTools.Item>
                <Typography color="secondary" shade="desaturated">
                  Customer Type:
                </Typography>
                <LeftPanelTools.Subitem>
                  {currentFinCharge.customer.onAccount ? 'On Account' : 'Prepaid'}
                </LeftPanelTools.Subitem>
              </LeftPanelTools.Item>
            </>
          ) : null}
        </LeftPanelTools.ItemsContainer>
      </Layouts.Scroll>
      <LeftPanelTools.ItemsContainer>
        <LeftPanelTools.Item inline>
          <Typography color="secondary" shade="desaturated">
            Invoices Included:
          </Typography>
          <Typography variant="bodyLarge">{currentFinCharge.invoices.length}</Typography>
        </LeftPanelTools.Item>
        <LeftPanelTools.Item inline>
          <Typography color="secondary" shade="desaturated">
            Payments Applied:
          </Typography>
          <Typography variant="bodyLarge">{currentFinCharge.payments.length}</Typography>
        </LeftPanelTools.Item>
        <LeftPanelTools.Item inline>
          <Typography color="secondary" shade="desaturated">
            Payments Total:
          </Typography>
          <Typography variant="bodyLarge">{sumBy(payments, x => x.amount)}</Typography>
        </LeftPanelTools.Item>
        <LeftPanelTools.Item inline>
          <Typography color="secondary" shade="desaturated">
            Write Off:
          </Typography>
          <Typography variant="bodyLarge">{sumBy(writeOffPayments, x => x.amount)}</Typography>
        </LeftPanelTools.Item>
        <LeftPanelTools.Item inline>
          <Typography color="secondary" shade="desaturated" variant="headerFive">
            Fin Charge Total:
          </Typography>
          <Typography variant="bodyLarge" fontWeight="bold">
            {formatCurrency(currentFinCharge.total)}
          </Typography>
        </LeftPanelTools.Item>
        <LeftPanelTools.Item inline>
          <Typography color="secondary" shade="desaturated" variant="headerFive">
            Remaining Balance:
          </Typography>
          <Typography variant="bodyLarge" fontWeight="bold">
            {formatCurrency(currentFinCharge.balance)}
          </Typography>
        </LeftPanelTools.Item>
      </LeftPanelTools.ItemsContainer>
    </LeftPanelTools.Panel>
  );
};

export default observer(LeftPanel);
