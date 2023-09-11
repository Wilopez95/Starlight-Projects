const sortByDateDesc = (a, b) => {
  if (a.serviceDate === b.serviceDate) {
    return 0;
  }
  if (a.serviceDate < b.serviceDate) {
    return -1;
  }
  return 1;
};

export default sortByDateDesc;
