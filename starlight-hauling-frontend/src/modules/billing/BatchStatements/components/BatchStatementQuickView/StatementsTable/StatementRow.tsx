import React from 'react';
import { noop } from 'lodash';

import { parseDate } from '@root/helpers';
import { useBoolean } from '@root/hooks';
import { useIntl } from '@root/i18n/useIntl';

import { FilePreviewModal, Typography } from '../../../../../../common';
import { TableCell, TableCheckboxCell, TableRow } from '../../../../../../common/TableTools';

import { IStatementRow } from './types';

export const StatementRow: React.FC<IStatementRow> = ({
  statement,
  onSelect,
  selected = false,
}) => {
  const { formatCurrency } = useIntl();

  const [isPreviewOpen, openPreviewModal, closePreviewModal] = useBoolean();
  const [isPrevPreviewModalOpen, openPrevPreviewModal, closePrevPreviewModal] = useBoolean();

  const timestamp = parseDate(statement.createdAt);

  return (
    <TableRow key={statement.id}>
      {statement.pdfUrl ? (
        <FilePreviewModal
          isOpen={isPreviewOpen}
          onClose={closePreviewModal}
          fileName="Statement Preview"
          category="Statement"
          src={statement.pdfUrl}
          downloadSrc={statement.pdfUrl}
          timestamp={timestamp}
          withMeta
          hideAuthor
          isPdf
        />
      ) : null}
      {statement.prevPdfUrl ? (
        <FilePreviewModal
          isOpen={isPrevPreviewModalOpen}
          onClose={closePrevPreviewModal}
          fileName="Statement Preview"
          category="Statement"
          src={statement.prevPdfUrl}
          downloadSrc={statement.prevPdfUrl}
          timestamp={timestamp}
          isPdf
          withMeta
          hideAuthor
        />
      ) : null}
      <TableCheckboxCell onChange={onSelect} name={`statement${statement.id}`} value={selected} />
      <TableCell>{statement.customer?.name}</TableCell>
      <TableCell>{formatCurrency(statement.customer?.balance)}</TableCell>
      <TableCell>
        <Typography
          color={statement.prevPdfUrl ? 'information' : undefined}
          onClick={statement.prevPdfUrl ? openPrevPreviewModal : noop}
        >
          {formatCurrency(statement.prevBalance)}
        </Typography>
      </TableCell>
      <TableCell>
        <Typography
          color={statement.pdfUrl ? 'information' : undefined}
          onClick={statement.pdfUrl ? openPreviewModal : noop}
        >
          {formatCurrency(statement.balance)}
        </Typography>
      </TableCell>
    </TableRow>
  );
};
