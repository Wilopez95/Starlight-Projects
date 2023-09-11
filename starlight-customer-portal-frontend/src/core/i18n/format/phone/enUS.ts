// TODO: use named capturing groups once Firefox supports it in version 78
const matchReg = /^(?:(?:\+1|1)?(?: |-)?)?(?:\(([2-9][0-9]{2})\)|([2-9][0-9]{2}))(?: |-)?([2-9][0-9]{2})(?: |-)?([0-9]{4})$/;

export const formatEnUSPhoneNumber = (phoneNumber: string): string | undefined => {
  const match = matchReg.exec(phoneNumber);

  if (!match) {
    return;
  }

  if (!match[3] || !match[4] || !(match[1] || match[2])) {
    return;
  }

  return `${'1'}-${match[1] ?? match[2]}-${match[3]}-${match[4]}`;
};
