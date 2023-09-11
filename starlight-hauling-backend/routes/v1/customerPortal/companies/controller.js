import httpStatus from 'http-status';

import CompanyRepository from '../../../../repos/company.js';

import ApiError from '../../../../errors/ApiError.js';

export const getCurrentCompany = async ctx => {
  const { tenantName } = ctx.request.query;
  if (!tenantName) {
    throw ApiError.invalidRequest('Please provide tenantName');
  }

  const company = await CompanyRepository.getInstance(ctx.state).getWithTenant({
    condition: { tenantName },
  });

  ctx.sendObj(company, httpStatus.OK);
};
