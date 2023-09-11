export const EmailEvent = {
  PENDING: 'pending',
  SENT: 'sent',
  DELIVERED: 'delivered',
  FAILED_TO_SEND: 'failedToSend',
  FAILED_TO_DELIVER: 'failedToDeliver',
};

export const EMAIL_EVENTS = Object.values(EmailEvent);
