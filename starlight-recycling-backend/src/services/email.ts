import { ClientResponse } from '@sendgrid/client/src/response';
import sgMail from '@sendgrid/mail';
import { createLogger } from './logger';
import { SENDGRID_SENDER_EMAIL, SENDGRID_SMTP_API_KEY_ID } from '../config';

const emailLogger = createLogger();

if (SENDGRID_SMTP_API_KEY_ID) {
  sgMail.setApiKey(SENDGRID_SMTP_API_KEY_ID);
}
export interface PersonalizationData {
  to: string;
  cc?: string | string[];
  bcc?: string | string[];
  subject?: string;
  headers?: { [key: string]: string };
  substitutions?: { [key: string]: string };
  dynamicTemplateData?: { [key: string]: any }; // eslint-disable-line
  customArgs?: { [key: string]: string };
  sendAt?: number;
}

export interface AttachmentData {
  content: string;
  filename: string;
  type?: string;
  disposition?: string;
  contentId?: string;
}

export interface MailData {
  to?: string;
  cc?: string;
  bcc?: string;

  from?: string;
  replyTo?: string;

  sendAt?: number;

  subject?: string;
  text?: string;
  html?: string;
  templateId?: string;
  copyTo?: string;

  personalizations?: PersonalizationData[];
  attachments?: AttachmentData[];

  ipPoolName?: string;
  batchId?: string;

  sections?: { [key: string]: string };
  headers?: { [key: string]: string };

  categories?: string[];
  category?: string;

  customArgs?: { [key: string]: any }; // eslint-disable-line

  substitutions?: { [key: string]: string };
  substitutionWrappers?: string[];

  isMultiple?: boolean;
  dynamicTemplateData?: { [key: string]: any }; // eslint-disable-line

  hideWarnings?: boolean;
}

export const sendEmail = ({
  from = SENDGRID_SENDER_EMAIL,
  to,
  text,
  html,
  templateId,
  substitutions,
  subject,
}: MailData): Promise<[ClientResponse, Record<string, unknown>]> => {
  if (emailLogger) {
    emailLogger.info({
      from,
      to,
      text,
      html,
      subject,
      templateId,
      substitutions,
    });
  }

  // sendgrid has broken typings
  // eslint-disable-next-line
  // @ts-ignore
  return sgMail.send({
    from,
    to,
    text: text || '',
    html,
    subject,
    templateId,
    substitutions,
  });
};

export const sendEmailWithAttachments = ({
  to,
  subject,
  text = '',
  from = SENDGRID_SENDER_EMAIL,
  replyTo = SENDGRID_SENDER_EMAIL,
  copyTo,
  attachments,
}: MailData): Promise<[ClientResponse, Record<string, unknown>]> => {
  if (emailLogger) {
    emailLogger.info({
      from,
      to,
      text,
      subject,
      attachments: attachments?.length
        ? JSON.stringify(attachments.map((attachment) => attachment.filename))
        : [],
    });
  }

  return sgMail.send({
    from,
    replyTo,
    to: to,
    subject,
    text,
    cc: copyTo,
    attachments,
  });
};
