import httpStatus from 'http-status';

import { mergePdfs } from '../../../services/pdfMerger.js';

import { getAttachmentFileName } from '../../../utils/attachmentFileName.js';

export const download = async ctx => {
  const { Statement } = ctx.state.models;
  const { id: batchStatementIds } = ctx.request.validated.query;

  const pdfUrls = await Statement.getByBatchStatementIds(batchStatementIds, [
    'id',
    'pdfUrl',
    'createdAt',
  ]);

  const fileName = getAttachmentFileName('Statement(s)', pdfUrls);

  let buffer;
  try {
    buffer = await mergePdfs(
      pdfUrls.map(({ pdfUrl }) => pdfUrl),
      fileName,
    );
  } catch (error) {
    ctx.logger.error(`Could not merge PDFs for documents: ${pdfUrls}`);
    throw error;
  }

  ctx.attachment(`${fileName}.pdf`);
  ctx.status = httpStatus.OK;
  ctx.body = buffer;
};
