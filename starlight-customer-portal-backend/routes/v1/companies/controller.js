import { getHaulingCurrentCompany } from '../../../services/hauling/companies.js';

export const getCurrentCompany = async (ctx) => {
  const data = await getHaulingCurrentCompany(ctx);
  ctx.sendObj(data);
};
