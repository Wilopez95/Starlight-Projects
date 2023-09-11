export const parseBusinessUnitLineId = async (ctx, next) => {
  const { businessLineId, businessUnitId } = ctx.request.validated.query;

  businessUnitId && ctx.addToCondition('businessUnitId', businessUnitId);
  businessLineId && ctx.addToCondition('businessLineId', businessLineId);

  await next();
};

const cast = value => {
  let newValue = value;
  if (value !== undefined) {
    // Number('') is 0
    if (value === '') {
      return undefined;
    }
    if (!Number.isNaN(Number(value))) {
      newValue = Number(value);
    } else {
      const lv = value.toLowerCase();

      if (lv === 'true' || lv === 'false') {
        newValue = lv === 'true';
      }

      if (lv === 'null') {
        newValue = null;
      }

      if (value.includes(',')) {
        newValue = value.split(',');
      }
    }
  }
  return newValue;
};

// TODO: just remove it
export const castQueryParams = async (ctx, next) => {
  const { query } = ctx.request;
  // ctx.request.q = { ...query };    // uncomment if it's needed

  Object.entries(query)
    .filter(([, value]) => typeof value === 'string' || Array.isArray(value))
    .forEach(([key, value]) => {
      if (Array.isArray(value)) {
        query[key] = value.map(el => cast(el.trim()));
      } else {
        query[key] = cast(value.trim());
      }
    });

  await next();
};

// special array case with commas or null
export async function processSearchQuery(field, searchOnly = false, ctx, next) {
  const query = ctx.request.query[field];

  // should be allowed by Joi to search by "null"
  if (query === null) {
    ctx.request.query[field] = String(query);
  }

  if (!query && searchOnly) {
    // just don't perform search
    return ctx.sendArray([]);
  }

  if (Array.isArray(query)) {
    ctx.request.query[field] = query.join(',');
  }

  return await next();
}
