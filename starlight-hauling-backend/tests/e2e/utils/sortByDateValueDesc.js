const sortByDateValueDesc = (a, b) => {
  if (a.valueOf() === b.valueOf()) {
    return 0;
  }
  if (a.valueOf() < b.valueOf()) {
    return -1;
  }
  return 1;
};

export default sortByDateValueDesc;
