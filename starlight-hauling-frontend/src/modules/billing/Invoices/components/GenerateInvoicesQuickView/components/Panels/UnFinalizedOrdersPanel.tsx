import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts } from '@starlightpro/shared-components';

import { ApproveIcon } from '@root/assets';
import { Protected, Typography } from '@root/common';
import { useIntl } from '@root/i18n/useIntl';

import UnFinalizedOrdersTable from '../OrderTables/UnFinalizedOrdersTable';

import { Banner, Content, ProblemPanel } from './styles';
import { type IUnFinalizedOrdersPanel } from './types';

const i18nPath = 'pages.Invoices.RunInvoicingMenu.';

const UnFinalizedOrdersPanel: React.FC<IUnFinalizedOrdersPanel> = ({
  currentCustomer,
  expanded,
  onToggle,
  onIgnore,
}) => {
  const { t } = useTranslation();
  const { formatCurrency } = useIntl();

  const unFinalizedOrders = useMemo(
    () => currentCustomer.unfinalizedOrders ?? [],
    [currentCustomer.unfinalizedOrders],
  );

  const total = useMemo(() => {
    return unFinalizedOrders.reduce((res, { grandTotal }) => res + grandTotal, 0);
  }, [unFinalizedOrders]);

  if (unFinalizedOrders.length === 0) {
    return null;
  }

  return (
    <Layouts.Margin bottom="2">
      <ProblemPanel
        color="primary"
        expanded={expanded}
        onClick={e => onToggle(e, expanded, 'unFinalized')}
      >
        <Layouts.Flex justifyContent="space-between">
          <Banner color="primary" showIcon>
            <Typography color="secondary" shade="dark">
              {t(`${i18nPath}UnFinalizedOrdersInfo`)}
            </Typography>
          </Banner>
          <Protected permissions="billing/invoices/invoicing:refund:perform">
            <Layouts.Flex alignItems="center" onClick={onIgnore}>
              <Layouts.IconLayout color="secondary" shade="desaturated">
                <ApproveIcon />
              </Layouts.IconLayout>
              <Typography cursor="pointer" color="information">
                {t(`${i18nPath}Ignore`)}
              </Typography>
            </Layouts.Flex>
          </Protected>
        </Layouts.Flex>
        <Layouts.Margin top="2" bottom="1">
          <Layouts.Flex justifyContent="space-between">
            <Typography fontWeight="bold" variant="bodyLarge">
              {t(`${i18nPath}UnFinalizedOrders`)}
            </Typography>
            <Typography fontWeight="bold" variant="bodyLarge" color="primary">
              {t(`${formatCurrency(total)}`)}
            </Typography>
          </Layouts.Flex>
        </Layouts.Margin>
        <Layouts.Flex justifyContent="space-between">
          <Typography color="primary">
            {t(`${i18nPath}OrdersCount`, {
              count: unFinalizedOrders.length,
            })}
          </Typography>
          <Typography>{t(`${i18nPath}OrdersTotal`)}</Typography>
        </Layouts.Flex>
      </ProblemPanel>
      {expanded ? (
        <Content>
          <UnFinalizedOrdersTable currentCustomer={currentCustomer} />
        </Content>
      ) : null}
    </Layouts.Margin>
  );
};

export default UnFinalizedOrdersPanel;
