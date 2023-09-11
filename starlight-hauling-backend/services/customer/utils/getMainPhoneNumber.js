import { PHONE_TYPE } from '../../../consts/phoneTypes.js';

const getMainPhoneNumber = data =>
  data?.find(phoneNumber => phoneNumber?.type === PHONE_TYPE.main)?.number;

export default getMainPhoneNumber;
