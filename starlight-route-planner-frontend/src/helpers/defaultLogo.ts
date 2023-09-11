export const getDefaultLogo = (companyName: string) => {
  const words = companyName.split(' ');

  return words.map(word => word[0]).join('');
};
