import httpStatus from 'http-status';

import { mergePdfs } from '../../../services/pdfMerger.js';

import { getAttachmentFileName } from '../../../utils/attachmentFileName.js';

export const download = async ctx => {
  const { FinanceCharge } = ctx.state.models;
  const { ids } = ctx.request.validated.query;

  const pdfUrls = await FinanceCharge.getPdfUrls(ids);

  const fileName = getAttachmentFileName('Finance charge(s)', pdfUrls);

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
