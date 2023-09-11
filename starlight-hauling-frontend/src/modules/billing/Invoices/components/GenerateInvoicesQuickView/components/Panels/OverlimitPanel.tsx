import React from 'react';
import { Layouts } from '@starlightpro/shared-components';

import { useIntl } from '@root/i18n/useIntl';

import { ApproveIcon, DollarIcon } from '../../../../../../../assets';
import { Protected, Typography } from '../../../../../../../common';
import { OverlimitOrderTable } from '../OrderTables';

import * as styles from './styles';
import { type IOverlimitPanel } from './types';

const OverlimitPanel: React.FC<IOverlimitPanel> = ({
  currentCustomer,
  expanded,
  onToggle,
  onCreatePayment,
  onPutOnAccount,
}) => {
  const { formatCurrency } = useIntl();

  const overlimitOrders = Object.values(currentCustomer.overlimitOrders);

  if (overlimitOrders.length === 0) {
    return null;
  }

  const totalOverlimit = overlimitOrders.reduce((acc, order) => acc + order.overlimitAmount, 0);

  const creditLimitOverrideRequired = overlimitOrders[0].availableCredit < totalOverlimit;

  return (
    <Layouts.Margin bottom="2">
      <styles.ProblemPanel
        expanded={expanded}
        color="alert"
        onClick={e => onToggle(e, expanded, 'overlimit')}
      >
        <Layouts.Flex justifyContent="space-between">
          <styles.Banner color="alert" showIcon>
            <Typography color="secondary" shade="dark">
              Not on invoice until payment is addressed
            </Typography>
          </styles.Banner>
          <Layouts.Flex justifyContent="space-between">
            {currentCustomer.onAccount ||
            (!creditLimitOverrideRequired && !currentCustomer.onAccount) ? (
              <Protected permissions="billing/invoices/invoicing:put-on-account:perform">
                <div data-skip-event>
                  <Layouts.Margin left="2">
                    <Typography
                      onClick={() => onPutOnAccount(creditLimitOverrideRequired)}
                      color="information"
                      cursor="pointer"
                    >
                      <Layouts.Flex justifyContent="space-between" alignItems="center">
                        <ApproveIcon />
                        <Layouts.Margin left="1">
                          Put On Account{' '}
                          {creditLimitOverrideRequired ? '& Override Credit Limit' : null}
                        </Layouts.Margin>
                      </Layouts.Flex>
                    </Typography>
                  </Layouts.Margin>
                </div>
              </Protected>
            ) : null}
            <Protected permissions="billing/invoices/invoicing:payment:perform">
              <div data-skip-event>
                <Layouts.Margin left="2">
                  <Typography onClick={onCreatePayment} color="information" cursor="pointer">
                    <Layouts.Flex justifyContent="space-between" alignItems="center">
                      <DollarIcon />
                      <Layouts.Margin left="1">Create Payment</Layouts.Margin>
                    </Layouts.Flex>
                  </Typography>
                </Layouts.Margin>
              </div>
            </Protected>
          </Layouts.Flex>
        </Layouts.Flex>
        <Layouts.Margin top="2" bottom="1">
          <Layouts.Flex justifyContent="space-between">
            <Typography fontWeight="bold" variant="bodyLarge">
              Overlimit orders
            </Typography>
            <Typography fontWeight="bold" variant="bodyLarge" color="alert">
              {formatCurrency(totalOverlimit)}
            </Typography>
          </Layouts.Flex>
        </Layouts.Margin>
        <Layouts.Flex justifyContent="space-between">
          <Typography
            color="secondary"
            shade="desaturated"
          >{`${overlimitOrders.length} Order(s)`}</Typography>
          <Typography color="secondary" shade="desaturated">
            Total Overlimit
          </Typography>
        </Layouts.Flex>
      </styles.ProblemPanel>
      {expanded ? (
        <styles.Content>
          <OverlimitOrderTable currentCustomer={currentCustomer} />
        </styles.Content>
      ) : null}
    </Layouts.Margin>
  );
};

export default OverlimitPanel;
