import { TFunction } from 'i18next';
import * as Yup from 'yup';

import { emailBodyVariables } from '@root/consts';
import { emailValidator } from '@root/helpers';

import { MailSettingsFormValue } from './types';

const I18N_PATH = 'pages.SystemConfiguration.tables.CompanySettings.components.Mailing.Text.';

export const getInitialValues = (t: TFunction): MailSettingsFormValue => ({
  adminEmail: '',
  notificationEmails: [],
  domainId: null,

  invoicesFrom: 'notify@starlightsoftware.io',
  invoicesReplyTo: '',
  invoicesSendCopyTo: '',
  invoicesSubject: '',
  invoicesBody: '',
  invoicesDisclaimerText: '',

  statementsFrom: 'notify@starlightsoftware.io',
  statementsReplyTo: '',
  statementsSendCopyTo: '',
  statementsSubject: '',
  statementsBody: '',
  statementsDisclaimerText: '',

  receiptsFrom: 'notify@starlightsoftware.io',
  receiptsReplyTo: '',
  receiptsSendCopyTo: '',
  receiptsSubject: '',
  receiptsBody: '',
  receiptsDisclaimerText: '',

  servicesFrom: 'notify@starlightsoftware.io',
  servicesReplyTo: '',
  servicesSendCopyTo: '',
  servicesSubject: '',
  servicesBody: '',

  subscriptionsEndFrom: 'notify@starlightsoftware.io',
  subscriptionsEndReplyTo: t(`${I18N_PATH}SalesRep`),
  subscriptionsEndSubject: t(`${I18N_PATH}SubscriptionsEndSubject`),
  subscriptionsEndBody: t(`${I18N_PATH}SubscriptionsEndBody`, { skipInterpolation: true }),

  subscriptionsResumeFrom: 'notify@starlightsoftware.io',
  subscriptionsResumeReplyTo: t(`${I18N_PATH}SalesRep`),
  subscriptionsResumeSubject: t(`${I18N_PATH}SubscriptionsResumeSubject`),
  subscriptionsResumeBody: t(`${I18N_PATH}SubscriptionsResumeBody`, { skipInterpolation: true }),

  weightTicketFrom: 'notify@starlightsoftware.io',
  weightTicketReplyTo: '',
  weightTicketSendCopyTo: '',
  weightTicketSubject: '',
  weightTicketBody: '',

  customerOnHoldFrom: 'notify@starlightsoftware.io',
  customerOnHoldReplyTo: t(`${I18N_PATH}SalesRep`),
  customerOnHoldSubject: t(`${I18N_PATH}CustomerIsPutOnHoldSubject`),
  customerOnHoldBody: t(`${I18N_PATH}CustomerIsPutOnHoldBody`, { skipInterpolation: true }),

  id: undefined,
  updatedAt: undefined,
  createdAt: undefined,
});

export const getDefaultValues = (t: TFunction): MailSettingsFormValue => ({
  ...getInitialValues(t),

  invoicesFrom: 'billing',
  statementsFrom: 'billing',
  receiptsFrom: 'billing',
  servicesFrom: 'billing',

  statementsBody: `Dear customer,
Your statement is attached.
Thank you!`,
  invoicesBody: `Dear customer,
Your invoices are attached.
Thank you!`,
  receiptsBody: `Dear customer,
Your receipt is attached.
Thank you!`,
  servicesBody: `Dear customer,
Your service are attached.
Thank you!`,

  statementsSubject: 'Your statement form',
  invoicesSubject: 'Your invoice form',
  receiptsSubject: 'Your receipt form',
  servicesSubject: 'Your services form',
});

export const validationSchema = (t: TFunction, i18n: string) =>
  Yup.object().shape({
    adminEmail: Yup.string()
      .email(emailValidator)
      .required(t(`${i18n}AdminEmailRequired`)),
    notificationEmails: Yup.array().of(Yup.string().email(emailValidator)),
    domainId: Yup.number().integer().positive().nullable().optional(),

    invoicesFrom: Yup.string().nullable(),
    invoicesReplyTo: Yup.string().nullable(),
    invoicesSendCopyTo: Yup.string().nullable(),
    invoicesSubject: Yup.string().nullable(),
    invoicesBody: Yup.string()
      .nullable()
      .max(1000, t(`${i18n}EmailBodyMaxCharacters`)),
    invoicesDisclaimerText: Yup.string().nullable(),

    statementsFrom: Yup.string().nullable(),
    statementsReplyTo: Yup.string().nullable(),
    statementsSendCopyTo: Yup.string().nullable(),
    statementsSubject: Yup.string().nullable(),
    statementsBody: Yup.string()
      .nullable()
      .max(1000, t(`${i18n}EmailBodyMaxCharacters`)),
    statementsDisclaimerText: Yup.string().nullable(),

    receiptsFrom: Yup.string().nullable(),
    receiptsReplyTo: Yup.string().nullable(),
    receiptsSendCopyTo: Yup.string().nullable(),
    receiptsSubject: Yup.string().nullable(),
    receiptsBody: Yup.string()
      .nullable()
      .max(1000, t(`${i18n}EmailBodyMaxCharacters`)),
    receiptsDisclaimerText: Yup.string().nullable(),

    servicesFrom: Yup.string().nullable(),
    servicesReplyTo: Yup.string().nullable(),
    servicesSendCopyTo: Yup.string().nullable(),
    servicesSubject: Yup.string().nullable(),
    servicesBody: Yup.string()
      .nullable()
      .max(1000, t(`${i18n}EmailBodyMaxCharacters`)),

    subscriptionsEndFrom: Yup.string(),
    subscriptionsEndSubject: Yup.string()
      .max(200, t('ValidationErrors.PleaseEnterUpTo', { number: 200 }))
      .required(t(`${i18n}SubjectIsRequired`)),
    subscriptionsEndBody: Yup.string()
      .required(t(`${i18n}BodyIsRequired`))
      .max(1000, t(`${i18n}EmailBodyMaxCharacters`))
      .test({
        name: 'subscriptionsEndBody',
        message: t(`${i18n}VariableNotUsed`),
        params: { var: emailBodyVariables.subscriptionIds },
        test: subscriptionsEndBody =>
          typeof subscriptionsEndBody === 'string' &&
          subscriptionsEndBody.includes(emailBodyVariables.subscriptionIds),
      }),

    subscriptionsResumeFrom: Yup.string(),
    subscriptionsResumeSubject: Yup.string()
      .max(200, t('ValidationErrors.PleaseEnterUpTo', { number: 200 }))
      .required(t(`${i18n}SubjectIsRequired`)),
    subscriptionsResumeBody: Yup.string()
      .required(t(`${i18n}BodyIsRequired`))
      .max(1000, t(`${i18n}EmailBodyMaxCharacters`))
      .test({
        name: 'subscriptionsResumeBody',
        message: t(`${i18n}VariableNotUsed`),
        params: { var: emailBodyVariables.subscriptionIds },
        test: subscriptionsResumeBody =>
          typeof subscriptionsResumeBody === 'string' &&
          subscriptionsResumeBody.includes(emailBodyVariables.subscriptionIds),
      }),

    customerOnHoldFrom: Yup.string(),
    customerOnHoldSubject: Yup.string()
      .max(200, t('ValidationErrors.PleaseEnterUpTo', { number: 200 }))
      .required(t(`${i18n}SubjectIsRequired`)),
    customerOnHoldBody: Yup.string()
      .required(t(`${i18n}BodyIsRequired`))
      .max(1000, t(`${i18n}EmailBodyMaxCharacters`))
      .test({
        name: 'customerOnHoldBody',
        message: t(`${i18n}VariableNotUsed`),
        params: {
          var: emailBodyVariables.subscriptionIds,
        },
        test: customerOnHoldBody =>
          typeof customerOnHoldBody === 'string' &&
          customerOnHoldBody.includes(emailBodyVariables.subscriptionIds),
      })
      .test({
        name: 'customerOnHoldBody',
        message: t(`${i18n}VariableNotUsed`),
        params: {
          var: emailBodyVariables.recurringOrdersIds,
        },
        test: customerOnHoldBody =>
          typeof customerOnHoldBody === 'string' &&
          customerOnHoldBody.includes(emailBodyVariables.recurringOrdersIds),
      })
      .test({
        name: 'customerOnHoldBody',
        message: t(`${i18n}VariableNotUsed`),
        params: {
          var: emailBodyVariables.customerName,
        },
        test: customerOnHoldBody =>
          typeof customerOnHoldBody === 'string' &&
          customerOnHoldBody.includes(emailBodyVariables.customerName),
      }),
  });
