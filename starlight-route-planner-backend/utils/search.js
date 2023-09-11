const DISPLAY_ID_SEPARATOR = '.';

export const parseSearchInput = searchInput => {
  if (!searchInput) {
    return null;
  }

  const searchQuery = searchInput.toLowerCase();
  const isSearchByDisplayId = searchInput
    .split(DISPLAY_ID_SEPARATOR)
    .every(subId => Boolean(Number(subId)));

  if (isSearchByDisplayId) {
    return { searchId: searchInput, searchQuery };
  }

  return { searchQuery };
};
