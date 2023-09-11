import { pick } from 'lodash-es';

import { IEditCustomerData } from '@root/customer/forms/EditCustomer/types';

const nonCommercialData = ['firstName', 'lastName'];
const commercialData = [
  'businessName',
  'mainFirstName',
  'mainLastName',
  'mainJobTitle',
  'mainEmail',
  'mainPhoneNumbers',
];
const commonData = [
  'commercial',
  'email',
  'customerGroupId',
  'signatureRequired',
  'businessUnitId',
  'poRequired',
  'contactId',
  'alternateId',
  'ownerId',
  'salesId',
  'phoneNumbers',
  'invoiceConstruction',
  'onAccount',
  'creditLimit',
  'billingCycle',
  'paymentTerms',
  'addFinanceCharges',
  'aprType',
  'financeCharge',
  'mailingAddress',
  'billingAddress',
  'generalNote',
  'popupNote',
  'sendInvoicesByEmail',
  'sendInvoicesByPost',
  'attachTicketPref',
  'attachMediaPref',
  'invoiceEmails',
  'statementEmails',
  'notificationEmails',
];

export const sanitizeCustomer = (customer: IEditCustomerData) => {
  const sanitizedCustomer = pick(customer, [
    ...commonData,
    ...(customer.commercial ? commercialData : nonCommercialData),
  ]) as IEditCustomerData;

  sanitizedCustomer.mainPhoneNumbers?.forEach((number) => {
    if (number.id === 0) {
      delete number.id;
    }
  });
  sanitizedCustomer.phoneNumbers.forEach((number) => {
    if (number.id === 0) {
      delete number.id;
    }
  });

  delete sanitizedCustomer.mailingAddress.id;
  delete sanitizedCustomer.billingAddress.id;
  delete sanitizedCustomer.billingAddress.billingAddressSameAsMailing;

  return sanitizedCustomer;
};
