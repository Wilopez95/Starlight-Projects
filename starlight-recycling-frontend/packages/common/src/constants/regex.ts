/* eslint-disable no-useless-escape */
export const PASSWORD_REGEX = /(^(?=.*[a-z]+)(?=.*[A-Z]+)(?=.*[0-9]+)(?=.*[!@#\$%\^&\*]+))(?=.{8,})/;
export const NUMERIC_REGEX = /^\d+$/;
export const MONTH_REGEX = /^(0[1-9]|1[0-2])$/;
export const CVV_REGEX = /^[0-9]{3,4}$/;
export const ZIP_REGEX = /^\d{5}(?:[-\s]\d{4})?$/;
export const PATHNAME_REGEX = /^\/([\w\d-_]+)\/([\w\d-_]+)\/([\w\d-_]+)/;
