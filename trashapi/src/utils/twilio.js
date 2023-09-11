import clientFactory from 'twilio';
import { TWILIO_ID, TWILIO_TOKEN, TWILIO_MSG_SVC_ID } from '../config.js';

const client = clientFactory(TWILIO_ID, TWILIO_TOKEN);

/**
 * @name sendSMS
 * @description sends a text message using Twilio
 * @param {String} to the number (+13031233456) where the SMS is sent to
 * @param {String} body the contents of the text message
 * @returns {Promise} the sms was sent or failed.
 */
export const sendSMS = (to, body) =>
  new Promise((resolve, reject) => {
    client.messages.create(
      {
        body,
        // Text this number
        to,
        // From registered twilio messaging service
        messagingServiceSid: TWILIO_MSG_SVC_ID,
      },
      (err, responseData) => {
        if (err) {
          return reject(err);
        }
        return resolve(responseData);
      },
    );
  });
