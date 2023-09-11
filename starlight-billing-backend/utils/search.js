export const parseSearchQuery = query => {
  let searchQuery, searchId;

  if (query) {
    searchQuery = query.toString().toLowerCase();
    const id = searchQuery.length > 10 ? Number.NaN : Number.parseInt(searchQuery, 10);
    const isId = !Number.isNaN(id) && id > 0 && String(id) === searchQuery;

    if (isId) {
      searchId = id;
    }
  }

  return { searchQuery, searchId };
};
