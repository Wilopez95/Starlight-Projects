import * as Yup from 'yup';

import { IMessage } from '@root/types';

export const validationSchema = () => {
  return Yup.object().shape({
    message: Yup.string().trim().required(),
  });
};

export const defaultValue: IMessage = {
  id: 0,
  message: '',
  authorName: '',
  userId: null,
  contractorId: null,
  read: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};
