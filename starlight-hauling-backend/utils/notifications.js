export const getOrderNotificationText = ({
  phone,
  companyName,
  date,
  jobSite: {
    address: { addressLine1, addressLine2, city, state, zip },
  },
  billableService: { description },
}) => `
***DO NOT REPLY***

Hello,
This is a friendly reminder that the container at ${addressLine1}${
  addressLine2 ? `, ${addressLine2}` : ''
}, ${city}, ${state}, ${zip} is scheduled for a ${description} service tomorrow, ${date}.
If you need to reschedule or make any changes, please contact us as soon as possible at ${phone}.
${companyName}
`;
