const cast = value => {
  let newValue = value;
  if (value !== undefined) {
    if (value === '') {
      return undefined;
    }
    if (Number.isNaN(Number(value))) {
      const lv = value.toLowerCase();
      if (lv === 'true' || lv === 'false') {
        newValue = lv === 'true';
      }

      if (value.includes(',')) {
        newValue = value.split(',');
      }
    } else {
      newValue = Number(value);
    }
  }
  return newValue;
};

export const castQueryParams = async (ctx, next) => {
  const { query } = ctx.request;
  // ctx.request.q = { ...query };    // uncomment if it's needed

  Object.entries(query)
    .filter(([, value]) => typeof value === 'string')
    .forEach(([key, value]) => {
      query[key] = cast(value.trim());
    });

  await next();
};
