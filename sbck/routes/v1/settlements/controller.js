import httpStatus from 'http-status';

import { mergePdfs } from '../../../services/pdfMerger.js';

import { getAttachmentFileName } from '../../../utils/attachmentFileName.js';

export const downloadSettlements = async ctx => {
  const { settlementIds } = ctx.request.query;
  const { Settlement } = ctx.state.models;

  let pdfUrls;
  try {
    pdfUrls = await Settlement.getPdfUrls(
      Array.isArray(settlementIds) ? settlementIds : [settlementIds],
    );
  } catch (error) {
    ctx.logger.error(`Could not retrieve PDF URLs for settlements: ${settlementIds}`);
    throw error;
  }

  const fileName = getAttachmentFileName('Settlement(s)', pdfUrls);

  let buffer;
  try {
    buffer = await mergePdfs(
      pdfUrls.filter(({ pdfUrl }) => pdfUrl).map(({ pdfUrl }) => pdfUrl),
      fileName,
    );
  } catch (error) {
    ctx.logger.error(`Could not merge PDFs for documents: ${pdfUrls}`);
    throw error;
  }

  ctx.attachment(`${fileName}.pdf`);
  ctx.statusCode = httpStatus.OK;
  ctx.body = buffer;
};
