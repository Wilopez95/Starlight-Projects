import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError.js';
import TermsAndConditionsRepository from '../../../repos/termsAndConditions.js';
import { getTermsAndConditionPDF } from '../../../services/billing.js';

export const getTermAndConditionsById = async ctx => {
  const { id } = ctx.params;

  const termsAndCondition = await TermsAndConditionsRepository.getInstance(ctx.state).getById(id);

  if (!termsAndCondition) {
    throw ApiError.notFound(
      'Terms and condition not found',
      `Terms and condition doesn't exist with id ${id}`,
    );
  }

  ctx.sendObj(termsAndCondition);
};
export const getTermAndConditionsByReqId = async ctx => {
  const { reqId, tenantName } = ctx.params;

  const termsAndCondition = await TermsAndConditionsRepository.getInstance(ctx.state).getByReqId(
    tenantName,
    reqId,
  );

  if (!termsAndCondition) {
    throw ApiError.notFound(
      'Terms and condition not found',
      `Terms and condition doesn't exist with reqId ${reqId}`,
    );
  }

  ctx.sendObj(termsAndCondition);
};

export const createTermsAndConditions = async ctx => {
  const data = ctx.request.body;
  const termsAndCondition = await TermsAndConditionsRepository.getInstance(ctx.state).createOne({
    data,
  });

  if (!termsAndCondition) {
    throw ApiError.unknown();
  }
  ctx.logger.info(`createTermsAndConditions: ${termsAndCondition}`);
  ctx.body = termsAndCondition;
  ctx.status = httpStatus.CREATED;
};

export const editTermsAndConditions = async ctx => {
  const { id } = ctx.params;
  const data = ctx.request.body;

  const updatedTermsAndConditions = await TermsAndConditionsRepository.getInstance(
    ctx.state,
  ).updateOne({
    condition: { id },
    data,
  });

  ctx.sendObj(updatedTermsAndConditions);
};

export const updateTermsAndConditionsByReqId = async ctx => {
  const { reqId, tenantName } = ctx.request.body;
  const acceptanceDate = new Date().toISOString();
  const termsAndCondition = await TermsAndConditionsRepository.getInstance(ctx.state).getByReqId(
    tenantName,
    reqId,
  );
  const requestData = {
    bussinesUnit: termsAndCondition.businessUnit,
    tenantName,
    customerId: termsAndCondition.customer.id,
    acceptanceDate,
  };
  const urlPdf = await getTermsAndConditionPDF(ctx, requestData);

  const data = { tcAck: true, tcAckTimestamp: acceptanceDate, tcAckPdfUrl: urlPdf.pdfUrl };

  const updatedTermsAndConditions = await TermsAndConditionsRepository.getInstance(
    ctx.state,
  ).updateByReqId({
    reqId,
    tenantName,
    data,
  });

  const result = { urlPDF: updatedTermsAndConditions.tcAckPdfUrl };

  ctx.sendObj(result);
};
