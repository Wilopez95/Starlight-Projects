import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Layouts } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { ApiError } from '@root/api/base/ApiError';
import { ActionCode } from '@root/helpers/notifications/types';
import { Typography } from '../../../../../../common';
import { NotificationHelper } from '../../../../../../helpers';
import { useBoolean, useStores } from '../../../../../../hooks';
import { InvoiceService } from '../../../../Invoices/api/invoice';
import { InvoicingStatusModal, SendInvoicesModal } from '../../../../Invoices/components';
import { GenerateInvoicingMode } from '../../../../Invoices/components/GenerateInvoicesQuickView/types';
import { ISendInvoicesData } from '../../../../Invoices/components/SendInvoices/types';
import { GenerateInvoicesRequest } from '../../../../Invoices/types';
import RunInvoicingQuickView from '../../components/RunInvoicingQuickView/RunInvoicingQuickView';

import { IInvoicesHeader } from './types';

const I18N_PATH = 'pages.Invoices.RunInvoicingMenu.';

const InvoicesHeader: React.FC<IInvoicesHeader> = ({
  onInvoicesGenerated,
  isRunInvoicing = false,
}) => {
  const { invoiceStore } = useStores();
  const { t } = useTranslation();
  const [isOpenInvoiceView, openInvoiceView, closeInvoiceView] = useBoolean();
  const [isSendInvoiceToEmailModalOpen, openInvoiceModal, closeSendInvoiceToEmailModal] =
    useBoolean(false);
  const [invoicingRequestData, setInvoicingRequestData] = useState<GenerateInvoicesRequest>();
  const [isInvoicingSummaryOpen, openInvoicingSummary, closeInvoicingSummary] = useBoolean();

  const handleSendInvoicesToEmail = useCallback(
    async (values: ISendInvoicesData) => {
      try {
        await InvoiceService.sendInvoices(values);
        NotificationHelper.success('send', 'Invoices');
      } catch (error: unknown) {
        const typedError = error as ApiError;
        NotificationHelper.error('default', typedError.response.code as ActionCode);
      }

      closeSendInvoiceToEmailModal();
    },
    [closeSendInvoiceToEmailModal],
  );

  const checkedInvoices = invoiceStore.checkedInvoices.length;

  const handleDownloadInvoices = useCallback(() => {
    if (checkedInvoices > 0) {
      const invoiceQueryParams = new URLSearchParams();
      const invoiceIds = invoiceStore.checkedInvoices.map(({ id }) => id);

      invoiceIds.forEach(id => invoiceQueryParams.append('invoiceIds', id.toString()));

      InvoiceService.downloadInvoices(invoiceQueryParams.toString());
    }
  }, [checkedInvoices, invoiceStore.checkedInvoices]);

  const handleInvoicesSave = useCallback(
    (data: GenerateInvoicesRequest) => {
      setInvoicingRequestData(data);
      openInvoicingSummary();
    },
    [openInvoicingSummary],
  );

  const handleInvoicingSummaryClose = useCallback(() => {
    setInvoicingRequestData(undefined);
    closeInvoicingSummary();
  }, [closeInvoicingSummary]);

  return (
    <Layouts.Margin margin="2">
      <Layouts.Box minHeight="50px" position="relative">
        <RunInvoicingQuickView
          isOpen={isOpenInvoiceView}
          onClose={closeInvoiceView}
          onInvoicesSave={handleInvoicesSave}
        />
        <Layouts.Flex alignItems="center" justifyContent="space-between">
          <SendInvoicesModal
            onFormSubmit={handleSendInvoicesToEmail}
            isOpen={isSendInvoiceToEmailModalOpen}
            onClose={closeSendInvoiceToEmailModal}
          />
          {invoicingRequestData ? (
            <InvoicingStatusModal
              data={invoicingRequestData}
              onInvoicesGenerated={onInvoicesGenerated}
              isOpen={isInvoicingSummaryOpen}
              onClose={handleInvoicingSummaryClose}
              mode={GenerateInvoicingMode.OrdersAndSubscriptions}
            />
          ) : null}
          <Layouts.Flex alignItems="center" justifyContent="flex-start">
            {checkedInvoices === 0 ? (
              <>
                <Layouts.Margin right="2">
                  <Typography as="h1" variant="headerTwo">
                    Invoices
                  </Typography>
                </Layouts.Margin>
                {invoiceStore.count ? (
                  <Typography variant="bodyMedium" color="secondary">
                    {invoiceStore.values.length} of {invoiceStore.count}
                  </Typography>
                ) : null}
              </>
            ) : (
              <Typography variant="headerTwo">{checkedInvoices} Invoice(s) selected</Typography>
            )}
          </Layouts.Flex>
          <Layouts.Flex alignItems="center" justifyContent="flex-end">
            {checkedInvoices > 0 ? (
              <Layouts.Flex>
                <Layouts.Margin left="3">
                  <Button onClick={handleDownloadInvoices}>Download</Button>
                </Layouts.Margin>
                <Layouts.Margin left="3" right="3">
                  <Button variant="primary" onClick={openInvoiceModal}>
                    Send to Emails
                  </Button>
                </Layouts.Margin>
              </Layouts.Flex>
            ) : null}
            {isRunInvoicing ? (
              <Button variant="primary" onClick={openInvoiceView}>
                {t(`${I18N_PATH}RunInvoicing`)}
              </Button>
            ) : null}
          </Layouts.Flex>
        </Layouts.Flex>
      </Layouts.Box>
    </Layouts.Margin>
  );
};

export default observer(InvoicesHeader);
