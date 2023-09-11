const matchReg =
  /\s*(([+](\s?\d)([-\s]?\d)|0)?(\s?\d)([-\s]?\d){11}|[(](\s?\d)([-\s]?\d)+\s*[)]([-\s]?\d)+)\s*\s*/;

/***
 * More info about E164
 * https://support.twilio.com/hc/en-us/articles/223183008-Formatting-International-Phone-Numbers
 * https://en.wikipedia.org/wiki/E.164
 */

const toE164 = (phone: string) => {
  if (phone.startsWith('+44')) {
    return phone;
  } else if (phone.startsWith('0')) {
    return `+44${phone.replace(/\s/g, '').slice(1)}`;
  } else {
    return phone;
  }
};

export const formatEnGBPhoneNumber = (phoneNumber: string): string | undefined => {
  const match = matchReg.exec(phoneNumber);

  if (!match) {
    return;
  }

  const e164phone = toE164(match[0]);

  return e164phone.replace(/(\d{2})(\d{2})(\d{4})(\d{4})/, '$1 $2 $3 $4');
};
