export const parseSearchQuery = (query: string | string[]) => {
  let searchQuery: string | undefined;
  let searchId: number | undefined;

  if (query) {
    if (Array.isArray(query)) {
      searchQuery = query.join(',');
    }
    searchQuery = query.toString().toLowerCase();

    // check query.length to prevent `is out of range for type integer` error from Postgres
    // when searching by phone number
    const id = searchQuery.length > 10 ? Number.NaN : Number.parseInt(searchQuery, 10);
    const isId = !Number.isNaN(id) && id > 0 && String(id) === searchQuery;

    if (isId) {
      searchId = id;
    }
  }

  return { searchQuery, searchId };
};
