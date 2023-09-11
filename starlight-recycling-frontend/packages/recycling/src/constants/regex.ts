/* eslint-disable no-useless-escape */
export const PASSWORD_REGEX = /(^(?=.*[a-z]+)(?=.*[A-Z]+)(?=.*[0-9]+)(?=.*[!@#\$%\^&\*]+))(?=.{8,})/;
export const NUMERIC_REGEX = /^\d+$/;
export const FLOAT_REGEX = /^\s*-?[1-9]\d*(\.\d{1,2})?\s*$/;
export const MONTH_REGEX = /^(0[1-9]|1[0-2])$/;
export const CVV_REGEX = /^[0-9]{3,}$/;
export const ZIP_REGEX = /^\d{5}(?:[-\s]\d{4})?$/;
export const DECIMAL_PRECISION = /^-?\d+(\.\d{1,2})?$/;
export const DECIMAL_PRECISION_TEN = /^-?\d+(\.\d)?$/;
export const PHONE_REGEX = /^((\\+[1-9]{1,4}[ \\-]*)|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?$/;
export const US_PHONE = /\+1 ((\(\d{3}\) ?)|(\d{3}-))?\d{3}-\d{4}/;
export const PDF_FILE = /\.pdf$/;
