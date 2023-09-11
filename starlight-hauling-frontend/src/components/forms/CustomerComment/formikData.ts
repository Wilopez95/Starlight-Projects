import * as Yup from 'yup';

import { CustomerCommentRequest, ICustomerComment } from '@root/types';

export const validationSchema = Yup.object().shape({
  content: Yup.string()
    .required('Comment is required')
    .max(256, 'Please enter up to 256 characters'),
});

export const getValues = (
  currentUserId: string,
  item: ICustomerComment | null,
): CustomerCommentRequest => {
  const values = { content: '', authorId: currentUserId };

  if (!item) {
    return values;
  }

  return {
    ...values,
    content: item.content,
  };
};
