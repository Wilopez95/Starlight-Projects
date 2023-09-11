import React from 'react';
import { useBoolean } from '@starlightpro/shared-components';

import { TicketIcon } from '@root/assets';
import { FilePreviewModal } from '@root/core/common';

import { IInvoicePreview } from './types';

export const InvoicePreview: React.FC<IInvoicePreview> = ({ invoice, showSendEmail }) => {
  const [isModalOpen, openModal, closeModal] = useBoolean();

  return (
    <>
      <TicketIcon onClick={openModal} data-skip-event />
      <FilePreviewModal
        isOpen={isModalOpen}
        onClose={closeModal}
        timestamp={invoice.dueDate}
        fileName='Invoice Preview'
        category='Invoice'
        isPdf={false}
        author={invoice.csrName}
        src={invoice.pdfUrl!}
        withMeta
        downloadSrc={invoice.pdfUrl!}
        showSendEmail={showSendEmail}
        scrollable
      />
    </>
  );
};
