export const getDefaultLogo = (companyName: string) => {
  const words = companyName.split(' ').slice(0, 2);

  return words.map((word) => word[0]).join('');
};
