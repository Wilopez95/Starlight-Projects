import { searchHaulingAddressSuggestion } from '../../../services/hauling/search.js';

export const searchAddressSuggestion = async (ctx) => {
  const data = await searchHaulingAddressSuggestion(ctx);
  ctx.sendArray(data);
};
