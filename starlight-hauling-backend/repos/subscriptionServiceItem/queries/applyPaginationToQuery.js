export const applyPaginationToQuery = (baseQuery, skip, limit) => {
  let query = baseQuery;
  if (limit) {
    query = query.limit(limit);
  }
  if (skip) {
    query = query.offset(skip);
  }
  return query;
};
