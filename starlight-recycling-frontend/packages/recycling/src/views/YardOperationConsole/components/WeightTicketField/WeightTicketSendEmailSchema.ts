import * as Yup from 'yup';

export const WeightTicketSendEmailSchema = Yup.object().shape({
  email: Yup.string().email().trim().required('Required'),
});
