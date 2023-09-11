import { IDateTimeFormatComponents } from '../types';

// export const dateFormatsEnGB: IDateTimeFormatComponents = {
//   time: 'h:mm a',
//   time24: 'HH:mm',
//   date: 'dd/MM/yyyy',
//   dateDefault: 'yyyy-MM-dd',
//   dateTZ: 'dd/MM/yyyy HH:mm:ss+hh:mm',
//   dateTime: 'dd/MM/yyyy, hh:mm',
//   ISO: `dd/MM/yyyy'T'HH:mm:ss'Z'`,
// };

//TODO: add normal UK dates
export const dateFormatsEnGB: IDateTimeFormatComponents = {
  time: 'h:mm a',
  time24: 'HH:mm',
  date: 'dd MMM, yyyy',
  dateDefault: 'yyyy-MM-dd',
  dateTZ: 'yyyy-MM-dd HH:mm:ss+hh:mm',
  dateTime: 'dd MMM, yyyy, h:mm a',
  ISO: "yyyy-MM-dd'T'HH:mm:ss'Z'",
  dateMonthYear: 'MMMM, yyyy',
  dateShortMonthYear: 'MMM, yyyy',
  dateMonthYearTime: 'dd MMMM, yyyy, p',
};

export const dateFormatsEnUS: IDateTimeFormatComponents = {
  time: 'h:mm a',
  time24: 'HH:mm',
  date: 'dd MMM, yyyy',
  dateDefault: 'yyyy-MM-dd',
  dateTZ: 'yyyy-MM-dd HH:mm:ss+hh:mm',
  dateTime: 'dd MMM, yyyy, h:mm a',
  ISO: "yyyy-MM-dd'T'HH:mm:ss'Z'",
  dateMonthYear: 'MMMM, yyyy',
  dateShortMonthYear: 'MMM, yyyy',
  dateMonthYearTime: 'dd MMMM, yyyy, p',
};

//TODO: add normal FR dates
export const dateFormatsFrCA: IDateTimeFormatComponents = {
  time: 'h:mm a',
  time24: 'HH:mm',
  date: 'dd MMM, yyyy',
  dateDefault: 'yyyy-MM-dd',
  dateTZ: 'yyyy-MM-dd HH:mm:ss+hh:mm',
  dateTime: 'dd MMM, yyyy, h:mm a',
  ISO: "yyyy-MM-dd'T'HH:mm:ss'Z'",
  dateMonthYear: 'MMMM, yyyy',
  dateShortMonthYear: 'MMM, yyyy',
  dateMonthYearTime: 'dd MMMM, yyyy, p',
};

// export const dateFormatsFrCA: IDateTimeFormatComponents = {
//   time: `h 'h' mm a`,
//   time24: `hh 'h' mm`,
//   date: 'yyyy-MM-dd',
//   dateDefault: 'yyyy-MM-dd',
//   dateTZ: `yyyy-MM-dd HH 'h' mm:ss+hh:mm`,
//   dateTime: `yyyy-MM-dd hh 'h' mm`,
//   ISO: `yyyy-MM-dd'T'HH:mm:ss'Z'`,
// };
