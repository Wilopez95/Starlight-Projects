import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { handleEnterOrSpaceKeyDown } from '@root/helpers';

import { TicketIcon } from '../../../../../../assets';
import { FilePreviewModal } from '../../../../../../common';
import { useBoolean } from '../../../../../../hooks';

import { IInvoicePreview } from './types';

export const InvoicePreview: React.FC<IInvoicePreview> = ({ invoice }) => {
  const [isModalOpen, openModal, closeModal] = useBoolean();
  const { t } = useTranslation();

  const I18N_PATH = 'pages.SystemConfiguration.tables.Companies.sections.LogoInformation.Text.';

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLOrSVGElement>) => {
      if (handleEnterOrSpaceKeyDown(e)) {
        openModal();
      }
    },
    [openModal],
  );

  return (
    <>
      <TicketIcon
        role="button"
        aria-label={t(`${I18N_PATH}Preview`)}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onClick={openModal}
        data-skip-event
      />
      <FilePreviewModal
        isOpen={isModalOpen}
        onClose={closeModal}
        timestamp={invoice.dueDate}
        fileName="Invoice Preview"
        category="Invoice"
        author={invoice.csrName}
        src={invoice.pdfUrl!}
        downloadSrc={invoice.pdfUrl!}
        isPdf
        withMeta
      />
    </>
  );
};
