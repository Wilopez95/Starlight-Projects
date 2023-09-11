import twilio from 'twilio';

import { getOrderNotificationText } from '../utils/notifications.js';

import {
  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN,
  TWILIO_MSG_SERVICE_SID,
  TWILIO_TC_MSG_SERVICE_SID,
} from '../config.js';

const twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

const normalizePhoneNumber = number => `+${number.replace(/-/g, '')}`;

export const sendOrderNotification = async (recipientPhone, orderData) => {
  const normalizedRecipientPhone = normalizePhoneNumber(recipientPhone);
  const text = getOrderNotificationText(orderData);

  await twilioClient.messages.create({
    body: text,
    messagingServiceSid: TWILIO_MSG_SERVICE_SID,
    to: normalizedRecipientPhone,
  });
};

export const sendProspectReminderSms = async (
  recipientPhone,
  customerName,
  subscriptionDraftId,
) => {
  const normalizedRecipientPhone = normalizePhoneNumber(recipientPhone);
  const text = `**Do Not Reply**
    Hello,
    Please ensure to send the offer to ${customerName} , ${subscriptionDraftId}`;

  await twilioClient.messages.create({
    body: text,
    messagingServiceSid: TWILIO_MSG_SERVICE_SID,
    to: normalizedRecipientPhone,
  });
};

export const sendAnnualReminderSms = async (recipientPhone, customerName, subscriptionId) => {
  const normalizedRecipientPhone = normalizePhoneNumber(recipientPhone);
  const text = `**Do Not Reply**
    Hello,
    Please ensure to contact ${customerName}, subscription ${subscriptionId}, on the upcoming event
    `;

  await twilioClient.messages.create({
    body: text,
    messagingServiceSid: TWILIO_MSG_SERVICE_SID,
    to: normalizedRecipientPhone,
  });
};

export const sendTermsAndConditionsUrlSms = async (recipientPhone, URL, businessUnit) => {
  const normalizedRecipientPhone = normalizePhoneNumber(recipientPhone);
  const text = `**DO NOT REPLY:\nHello, Please review and accept the following terms and conditions from ${
    businessUnit.nameLine1 ? businessUnit.nameLine1 : ''
  } ${businessUnit.nameLine2 ? businessUnit.nameLine2 : ''}.\n${URL}\nQuestions? Please call ${
    businessUnit.phone
  }`;

  await twilioClient.messages.create({
    body: text,
    messagingServiceSid: TWILIO_TC_MSG_SERVICE_SID,
    to: normalizedRecipientPhone,
  });
};
