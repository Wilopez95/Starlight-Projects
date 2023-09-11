import { IMailSettings, NullableProperty } from '@root/types';

export type TemplateProps = {
  kind:
    | 'statements'
    | 'invoices'
    | 'receipts'
    | 'services'
    | 'subscriptionsEnd'
    | 'subscriptionsResume'
    | 'weightTicket'
    | 'customerOnHold';
  domain?: string;
  showDisclaimer?: boolean;
  showSendCopy?: boolean;
  disableReplyTo?: boolean;
  variables?: string[];
};

export type MailSettingsFormValue = NullableProperty<
  IMailSettings,
  'id' | 'updatedAt' | 'createdAt'
> & {
  subscriptionsEndReplyTo: string;
  subscriptionsResumeReplyTo: string;
  customerOnHoldReplyTo: string;
};

export type Values = Record<string, string>;
