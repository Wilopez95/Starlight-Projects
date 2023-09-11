import { Next } from 'koa';
import { Context } from '../Interfaces/Auth';

// special array case with commas or null
export async function processSearchQuery(
  field: string,
  searchOnly: boolean = false,
  ctx: Context,
  next: Next,
) {
  const query = ctx.request.query[field];

  // should be allowed by Joi to search by "null"
  if (!query) {
    ctx.request.query[field] = String(query);
  }

  if (!query && searchOnly) {
    // just don't perform search
    return ctx.sendArray([]);
  }

  if (Array.isArray(query)) {
    ctx.request.query[field] = query.join(',');
  }

  await next();
}
