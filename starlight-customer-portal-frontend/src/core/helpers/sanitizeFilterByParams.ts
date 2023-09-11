export const sanitizeFilterByParams = (filterBy?: string, filterValue?: (string | number)[]) => {
  if (filterBy) {
    return {
      [filterBy]: filterValue,
    };
  }

  return {};
};
