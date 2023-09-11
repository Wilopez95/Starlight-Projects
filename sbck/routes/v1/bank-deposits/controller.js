import httpStatus from 'http-status';
import sortBy from 'lodash/sortBy.js';

import { mergePdfs } from '../../../services/pdfMerger.js';
import { generateAndSaveBankDeposit } from '../../../services/reporting/report.js';

import { getAttachmentFileName } from '../../../utils/attachmentFileName.js';

import { BankDepositStatus } from '../../../consts/bankDepositStatuses.js';

export const download = async ctx => {
  const { subscriberName, tenantId } = ctx.state.user;
  const { BankDeposit } = ctx.state.models;
  const { ids } = ctx.request.validated.query;

  const [lockedDeposits, unlockedDeposits] = await Promise.all([
    BankDeposit.getAllByStatus({
      ids,
      status: BankDepositStatus.LOCKED,
      fields: ['id', 'pdfUrl', 'createdAt'],
    }),
    BankDeposit.getAllByStatus({
      ids,
      status: BankDepositStatus.UNLOCKED,
      fields: ['id', 'createdAt'],
    }),
  ]);

  const fileName = getAttachmentFileName(
    'Bank Deposits(s)',
    sortBy(lockedDeposits.concat(unlockedDeposits), 'createdAt'),
  );

  try {
    const generationResults = await Promise.all(
      unlockedDeposits.map(({ id }) =>
        generateAndSaveBankDeposit(ctx, subscriberName, tenantId, id),
      ),
    );

    unlockedDeposits.forEach(
      (deposit, index) => (deposit.pdfUrl = generationResults[index].pdfUrl),
    );
  } catch (error) {
    ctx.logger.error('Failed to generate PDFs for unlocked bank deposits');
    throw error;
  }

  const pdfUrls = lockedDeposits.concat(unlockedDeposits).map(({ pdfUrl }) => pdfUrl);

  let buffer;

  try {
    buffer = await mergePdfs(pdfUrls, fileName);
  } catch (error) {
    ctx.logger.error(`Could not merge PDFs for documents: ${pdfUrls.join(',')}`);
    throw error;
  }

  ctx.attachment(`${fileName}.pdf`);
  ctx.status = httpStatus.OK;
  ctx.body = buffer;
};
