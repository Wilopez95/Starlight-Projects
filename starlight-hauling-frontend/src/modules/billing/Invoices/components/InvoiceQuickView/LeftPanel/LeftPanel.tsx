import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { useIntl } from '@root/i18n/useIntl';
import { InvoiceType } from '@root/modules/billing/Invoices/types';

import { LeftPanelTools, Typography } from '../../../../../../common';
import { useStores } from '../../../../../../hooks';
import { getBadgeByStatus } from '../../../helpers/getBadgeByStatus';

const I18NPath = 'pages.Invoices.components.InvoiceQuickView.components.LeftPanel.';

const LeftPanel: React.FC = () => {
  const { invoiceStore } = useStores();
  const { t } = useTranslation();
  const { formatCurrency, formatDateTime } = useIntl();

  const currentInvoice = invoiceStore.selectedEntity;

  return (
    <LeftPanelTools.Panel>
      <Layouts.Scroll>
        <LeftPanelTools.ItemsContainer>
          <LeftPanelTools.Item>
            <Typography fontWeight="bold" variant="bodyLarge">
              {t(`${I18NPath}Invoice#`, { id: currentInvoice?.id })}
            </Typography>
          </LeftPanelTools.Item>

          <LeftPanelTools.Item>
            {currentInvoice?.status ? getBadgeByStatus(currentInvoice.status) : null}
          </LeftPanelTools.Item>

          <LeftPanelTools.Item>
            <Typography color="secondary" shade="desaturated">
              {t(`${I18NPath}InvoiceID`)}:
            </Typography>
            <LeftPanelTools.Subitem>{currentInvoice?.id}</LeftPanelTools.Subitem>
          </LeftPanelTools.Item>

          <LeftPanelTools.Item>
            <Typography color="secondary" shade="desaturated">
              {t(`${I18NPath}DueDate`)}:
            </Typography>
            <LeftPanelTools.Subitem>
              {currentInvoice?.dueDate ? formatDateTime(currentInvoice.dueDate).date : null}
            </LeftPanelTools.Subitem>
          </LeftPanelTools.Item>

          <LeftPanelTools.Item>
            <Typography color="secondary" shade="desaturated">
              {t(`${I18NPath}CSR`)}:
            </Typography>
            <LeftPanelTools.Subitem>{currentInvoice?.csrName}</LeftPanelTools.Subitem>
          </LeftPanelTools.Item>

          {currentInvoice?.customer ? (
            <>
              <LeftPanelTools.Item>
                <Typography color="secondary" shade="desaturated">
                  {t(`${I18NPath}Customer`)}:
                </Typography>
                <LeftPanelTools.Subitem>{currentInvoice?.customer?.name}</LeftPanelTools.Subitem>
              </LeftPanelTools.Item>
              <LeftPanelTools.Item>
                <Typography color="secondary" shade="desaturated">
                  {t(`${I18NPath}CustomerType`)}:
                </Typography>
                <LeftPanelTools.Subitem>
                  {currentInvoice.customer.onAccount ? 'On Account' : 'Prepaid'}
                </LeftPanelTools.Subitem>
              </LeftPanelTools.Item>
            </>
          ) : null}
        </LeftPanelTools.ItemsContainer>
      </Layouts.Scroll>

      <LeftPanelTools.ItemsContainer>
        <LeftPanelTools.Item inline>
          <Typography color="secondary" shade="desaturated">
            {t(
              `${I18NPath}${
                currentInvoice?.type === InvoiceType.orders
                  ? 'OrdersIncluded'
                  : 'SubscriptionsIncluded'
              }`,
            )}
            :
          </Typography>
          <Typography variant="bodyLarge">{currentInvoice?.invoicedEntityList?.length}</Typography>
        </LeftPanelTools.Item>
        <LeftPanelTools.Item inline>
          <Typography color="secondary" shade="desaturated">
            {t(`${I18NPath}PaymentsApplied`)}:
          </Typography>
          <Typography variant="bodyLarge">{currentInvoice?.payments.length}</Typography>
        </LeftPanelTools.Item>
        <LeftPanelTools.Item inline>
          <Typography color="secondary" shade="desaturated" variant="headerFive">
            {t(`${I18NPath}InvoiceTotal`)}:
          </Typography>
          <Typography variant="bodyLarge" fontWeight="bold">
            {formatCurrency(currentInvoice?.total)}
          </Typography>
        </LeftPanelTools.Item>
        <LeftPanelTools.Item inline>
          <Typography color="secondary" shade="desaturated" variant="headerFive">
            {t(`${I18NPath}RemainingBalance`)}:
          </Typography>
          <Typography variant="bodyLarge" fontWeight="bold">
            {formatCurrency(currentInvoice?.balance)}
          </Typography>
        </LeftPanelTools.Item>
      </LeftPanelTools.ItemsContainer>
    </LeftPanelTools.Panel>
  );
};

export default observer(LeftPanel);
