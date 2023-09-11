import React, { useMemo } from 'react';
import { Layouts } from '@starlightpro/shared-components';

import { useIntl } from '@root/i18n/useIntl';

import { DollarIcon } from '../../../../../../../assets';
import { Protected, Typography } from '../../../../../../../common';
import { OverpaidOrderTable } from '../OrderTables';

import * as styles from './styles';
import { type IOverpaidPanel } from './types';

const OverpaidPanel: React.FC<IOverpaidPanel> = ({
  currentCustomer,
  expanded,
  onToggle,
  onCreateRefund,
}) => {
  const overpaidOrders = Object.values(currentCustomer.overpaidOrders);

  const { formatCurrency } = useIntl();

  const totalOverpaid = useMemo(
    () => overpaidOrders.reduce((acc, order) => acc + order.overpaidAmount, 0),
    [overpaidOrders],
  );

  if (overpaidOrders.length === 0) {
    return null;
  }

  return (
    <Layouts.Margin bottom="2">
      <styles.ProblemPanel
        color="primary"
        expanded={expanded}
        onClick={e => onToggle(e, expanded, 'overpaid')}
      >
        <Layouts.Flex justifyContent="space-between">
          <styles.Banner color="primary" showIcon>
            <Typography color="secondary" shade="dark">
              Would be invoiced even without refund
            </Typography>
          </styles.Banner>
          <Layouts.Flex justifyContent="space-between">
            <Protected permissions="billing/invoices/invoicing:refund:perform">
              <div data-skip-event>
                <Layouts.Margin left="2">
                  <Typography color="information" cursor="pointer" onClick={onCreateRefund}>
                    <Layouts.Flex justifyContent="space-between" alignItems="center">
                      <DollarIcon />
                      <Layouts.Margin left="1">Create Refund</Layouts.Margin>
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
              Overpaid orders
            </Typography>
            <Typography fontWeight="bold" variant="bodyLarge" color="primary">
              {formatCurrency(totalOverpaid)}
            </Typography>
          </Layouts.Flex>
        </Layouts.Margin>
        <Layouts.Flex justifyContent="space-between">
          <Typography color="primary">{`${overpaidOrders.length} Order(s)`}</Typography>
          <Typography>Total Overlimit</Typography>
        </Layouts.Flex>
      </styles.ProblemPanel>
      {expanded ? (
        <styles.Content>
          <OverpaidOrderTable currentCustomer={currentCustomer} />
        </styles.Content>
      ) : null}
    </Layouts.Margin>
  );
};

export default OverpaidPanel;
