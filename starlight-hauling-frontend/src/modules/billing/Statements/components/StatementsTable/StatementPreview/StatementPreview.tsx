import React, { useCallback } from 'react';
import { Layouts } from '@starlightpro/shared-components';

import { handleEnterOrSpaceKeyDown } from '@root/helpers';

import { TicketIcon } from '../../../../../../assets';
import { FilePreviewModal } from '../../../../../../common';
import { useBoolean } from '../../../../../../hooks';

import { IStatementPreview } from './types';

export const StatementPreview: React.FC<IStatementPreview> = ({ statement }) => {
  const [isModalOpen, openModal, closeModal] = useBoolean();

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
      <Layouts.IconLayout width="25px" height="25px" disableFill>
        <TicketIcon
          role="button"
          tabIndex={0}
          onKeyDown={handleKeyDown}
          onClick={openModal}
          data-skip-event
        />
      </Layouts.IconLayout>

      <FilePreviewModal
        isOpen={isModalOpen}
        onClose={closeModal}
        fileName="Statement Preview"
        category="Statement"
        src={statement.pdfUrl}
        downloadSrc={statement.pdfUrl}
        isPdf
      />
    </>
  );
};
