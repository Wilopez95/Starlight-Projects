import * as Yup from 'yup';

export const schema = Yup.object().shape({
  yardInstructions: Yup.string().required().max(250),
});
