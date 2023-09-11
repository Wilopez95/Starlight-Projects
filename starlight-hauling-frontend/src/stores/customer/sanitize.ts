/* eslint-disable @typescript-eslint/ban-ts-comment */
import { pick } from 'lodash-es';

import { INewCustomerData } from '@root/components/forms/NewCustomer/types';

// TODO: refactor this pick
const getNonCommercialCustomerData = [
  'commercial',
  'email',
  'customerGroupId',
  'signatureRequired',
  'businessUnitId',
  'poRequired',
  'contactId',
  'firstName',
  'lastName',
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
  'billingNote',
  'sendInvoicesByEmail',
  'sendInvoicesByPost',
  'attachTicketPref',
  'attachMediaPref',
  'invoiceEmails',
  'statementEmails',
  'notificationEmails',
  'workOrderRequired',
  'jobSiteRequired',
  'canTareWeightRequired',
  'gradingRequired',
  'gradingNotification',
  'selfServiceOrderAllowed',
  'isAutopayExist',
  'autopayType',
  'autopayCreditCardId',
  'defaultPurchaseOrders',
  'purchaseOrders',
  'workOrderNote',
];

const getCommercialCustomerData = [
  'commercial',
  'email',
  'customerGroupId',
  'signatureRequired',
  'poRequired',
  'businessName',
  'businessUnitId',
  'alternateId',
  'ownerId',
  'salesId',
  'phoneNumbers',
  'contactId',
  'mainFirstName',
  'mainLastName',
  'mainJobTitle',
  'mainEmail',
  'mainPhoneNumbers',
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
  'billingNote',
  'invoiceEmails',
  'statementEmails',
  'notificationEmails',
  'workOrderRequired',
  'jobSiteRequired',
  'canTareWeightRequired',
  'gradingRequired',
  'gradingNotification',
  'selfServiceOrderAllowed',
  'isAutopayExist',
  'autopayType',
  'autopayCreditCardId',
  'defaultPurchaseOrders',
  'purchaseOrders',
  'workOrderNote',
];

export const sanitizeCustomer = (customer: INewCustomerData) => {
  const sanitizedCustomer = pick(
    customer,
    customer.commercial ? getCommercialCustomerData : getNonCommercialCustomerData,
  ) as INewCustomerData;

  sanitizedCustomer.mainPhoneNumbers?.forEach(number => {
    if (number.id === 0) {
      delete number.id;
    }
  });
  sanitizedCustomer.phoneNumbers.forEach(number => {
    if (number.id === 0) {
      delete number.id;
    }
  });

  // @ts-expect-error
  delete sanitizedCustomer.mailingAddress.id;
  // @ts-expect-error
  delete sanitizedCustomer.billingAddress.id;
  delete sanitizedCustomer.billingAddress.billingAddressSameAsMailing;

  return sanitizedCustomer;
};
