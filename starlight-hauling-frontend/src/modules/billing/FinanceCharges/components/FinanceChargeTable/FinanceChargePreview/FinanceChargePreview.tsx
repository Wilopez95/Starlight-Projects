import React from 'react';

import { TicketIcon } from '../../../../../../assets';
import { FilePreviewModal } from '../../../../../../common';
import { useBoolean } from '../../../../../../hooks';

import { IFinanceChargePreview } from './types';

export const FinanceChargePreview: React.FC<IFinanceChargePreview> = ({ src }) => {
  const [isModalOpen, openModal, closeModal] = useBoolean();

  return (
    <>
      <TicketIcon onClick={openModal} data-skip-event />
      <FilePreviewModal
        isOpen={isModalOpen}
        onClose={closeModal}
        fileName="Finance Charge Preview"
        category="Finance charge"
        isPdf={false}
        src={src}
        downloadSrc={src}
      />
    </>
  );
};
