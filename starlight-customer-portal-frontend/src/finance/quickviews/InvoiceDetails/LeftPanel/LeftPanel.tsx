import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts, Typography } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { LeftPanelTools } from '@root/core/common/TableTools';
import { useStores } from '@root/core/hooks';
import { useIntl } from '@root/core/i18n/useIntl';
import { getBadgeByStatus } from '@root/finance/components/InvoiceTable/helpers';
import { InvoiceType } from '@root/finance/types/entities';

const I18N_PATH = 'modules.finance.quickviews.InvoiceDetails.LeftPanel.';

const LeftPanel: React.FC = () => {
  const { invoiceStore } = useStores();
  const { formatCurrency, formatDateTime } = useIntl();

  const { t } = useTranslation();

  const currentInvoice = invoiceStore.selectedEntity;

  return (
    <LeftPanelTools.Panel>
      <Layouts.Scroll>
        <LeftPanelTools.ItemsContainer>
          <LeftPanelTools.Item>
            <Typography fontWeight='bold' variant='bodyLarge'>
              {t(`${I18N_PATH}Invoice#`)} {currentInvoice?.id}
            </Typography>
          </LeftPanelTools.Item>

          <LeftPanelTools.Item>
            {currentInvoice?.status && getBadgeByStatus(currentInvoice.status)}
          </LeftPanelTools.Item>

          <LeftPanelTools.Item>
            <Typography color='secondary' shade='desaturated'>
              {t(`${I18N_PATH}InvoiceID`)}:
            </Typography>
            <LeftPanelTools.Subitem>{currentInvoice?.id}</LeftPanelTools.Subitem>
          </LeftPanelTools.Item>

          <LeftPanelTools.Item>
            <Typography color='secondary' shade='desaturated'>
              {t(`${I18N_PATH}DueDate`)}:
            </Typography>
            <LeftPanelTools.Subitem>
              {currentInvoice?.dueDate && formatDateTime(currentInvoice.dueDate).date}
            </LeftPanelTools.Subitem>
          </LeftPanelTools.Item>

          <LeftPanelTools.Item>
            <Typography color='secondary' shade='desaturated'>
              {t(`${I18N_PATH}CSR`)}:
            </Typography>
            <LeftPanelTools.Subitem>{currentInvoice?.csrName}</LeftPanelTools.Subitem>
          </LeftPanelTools.Item>

          {currentInvoice?.customer && (
            <>
              <LeftPanelTools.Item>
                <Typography color='secondary' shade='desaturated'>
                  Customer:
                </Typography>
                <LeftPanelTools.Subitem>{currentInvoice?.customer.name}</LeftPanelTools.Subitem>
              </LeftPanelTools.Item>
              <LeftPanelTools.Item>
                <Typography color='secondary' shade='desaturated'>
                  Customer Type:
                </Typography>
                <LeftPanelTools.Subitem>
                  {currentInvoice.customer.onAccount
                    ? t(`${I18N_PATH}OnAccount`)
                    : t(`${I18N_PATH}Prepaid`)}
                </LeftPanelTools.Subitem>
              </LeftPanelTools.Item>
            </>
          )}
        </LeftPanelTools.ItemsContainer>
      </Layouts.Scroll>

      <LeftPanelTools.ItemsContainer>
        <LeftPanelTools.Item inline>
          <Typography color='secondary' shade='desaturated'>
            {t(
              `${I18N_PATH}${
                currentInvoice?.type === InvoiceType.orders
                  ? 'OrdersIncluded'
                  : 'SubscriptionsIncluded'
              }`,
            )}
            :
          </Typography>
          <Typography variant='bodyLarge'>{currentInvoice?.invoicedEntityList?.length}</Typography>
        </LeftPanelTools.Item>
        <LeftPanelTools.Item inline>
          <Typography color='secondary' shade='desaturated'>
            {t(`${I18N_PATH}PaymentsApplied`)}:
          </Typography>
          <Typography variant='bodyLarge'>{currentInvoice?.payments.length}</Typography>
        </LeftPanelTools.Item>
        <LeftPanelTools.Item inline>
          <Typography color='secondary' shade='desaturated' variant='headerFive'>
            {t(`${I18N_PATH}InvoiceTotal`)}:
          </Typography>
          <Typography variant='bodyLarge' fontWeight='bold'>
            {formatCurrency(currentInvoice?.total)}
          </Typography>
        </LeftPanelTools.Item>
        <LeftPanelTools.Item inline>
          <Typography color='secondary' shade='desaturated' variant='headerFive'>
            {t(`${I18N_PATH}RemainingBalance`)}:
          </Typography>
          <Typography variant='bodyLarge' fontWeight='bold'>
            {formatCurrency(currentInvoice?.balance)}
          </Typography>
        </LeftPanelTools.Item>
      </LeftPanelTools.ItemsContainer>
    </LeftPanelTools.Panel>
  );
};

export default observer(LeftPanel);
