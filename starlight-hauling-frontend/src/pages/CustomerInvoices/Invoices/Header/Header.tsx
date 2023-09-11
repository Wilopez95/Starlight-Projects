import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Layouts } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { Typography } from '@root/common';
import { NotificationHelper } from '@root/helpers';
import { useIntl } from '@root/i18n/useIntl';
import { InvoiceService } from '@root/modules/billing/Invoices/api/invoice';
import { SendInvoicesModal } from '@root/modules/billing/Invoices/components';
import { ISendInvoicesData } from '@root/modules/billing/Invoices/components/SendInvoices/types';
import { useBoolean, useStores } from '@hooks';

import { ApiError } from '@root/api/base/ApiError';
import { ActionCode } from '@root/helpers/notifications/types';
import { CustomerStyles } from '../../../Customer';

const I18N_PATH = 'pages.CustomerInvoices.Text.';

const InvoicesHeader: React.FC = () => {
  const { invoiceStore } = useStores();
  const [isSendInvoiceModalOpen, openInvoiceModal, closeInvoiceModal] = useBoolean(false);
  const { t } = useTranslation();

  const { formatCurrency } = useIntl();
  const checkedInvoices = invoiceStore.checkedInvoices.length;

  const handleSendInvoices = useCallback(
    async (values: ISendInvoicesData) => {
      try {
        await InvoiceService.sendInvoices(values);
        NotificationHelper.success('send', 'Invoices');
      } catch (error: unknown) {
        const typedError = error as ApiError;
        NotificationHelper.error('send', typedError.response.code as ActionCode, 'Invoices');
      }

      closeInvoiceModal();
    },
    [closeInvoiceModal],
  );

  const handleDownloadInvoices = useCallback(() => {
    if (checkedInvoices > 0) {
      const invoiceQueryParams = new URLSearchParams();
      const invoiceIds = invoiceStore.checkedInvoices.map(({ id }) => id);

      invoiceIds.forEach(id => invoiceQueryParams.append('invoiceIds', id.toString()));

      InvoiceService.downloadInvoices(invoiceQueryParams.toString());
    }
  }, [checkedInvoices, invoiceStore.checkedInvoices]);

  return (
    <>
      <SendInvoicesModal
        onFormSubmit={handleSendInvoices}
        isOpen={isSendInvoiceModalOpen}
        onClose={closeInvoiceModal}
      />
      <CustomerStyles.TitleContainer>
        {checkedInvoices === 0 ? (
          <Typography fontWeight="bold" variant="headerTwo">
            {t('Titles.Invoices')}
          </Typography>
        ) : (
          <>
            <Typography variant="headerTwo">
              {checkedInvoices} {t(`${I18N_PATH}InvoiceSelected`)}
            </Typography>
            <Layouts.Flex alignItems="center">
              <Layouts.Flex direction="column" alignItems="flex-end">
                <Typography fontWeight="bold" variant="headerThree">
                  {formatCurrency(invoiceStore.totalBalance)}
                </Typography>
                <Typography color="secondary">{t(`${I18N_PATH}InvoicesTotal`)}</Typography>
              </Layouts.Flex>
              <Layouts.Margin left="2">
                <Button onClick={handleDownloadInvoices}>{t('Text.Download')}</Button>
              </Layouts.Margin>
              <Layouts.Margin left="2">
                <Button variant="primary" onClick={openInvoiceModal}>
                  {t('Text.SendToEmails')}
                </Button>
              </Layouts.Margin>
            </Layouts.Flex>
          </>
        )}
      </CustomerStyles.TitleContainer>
    </>
  );
};

export default observer(InvoicesHeader);
