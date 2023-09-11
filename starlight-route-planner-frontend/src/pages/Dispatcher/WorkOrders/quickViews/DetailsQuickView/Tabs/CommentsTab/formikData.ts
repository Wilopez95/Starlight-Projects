import { TFunction } from 'i18next';
import { object, string } from 'yup';

import { COMMENTS_EVENT_TYPE } from '@root/types';

const I18N_PATH = 'pages.Dispatcher.components.WorkOrders.QuickViews.CommentSection.Validation.';

export const defaultValues = {
  comment: '',
  workOrderId: 0,
  eventType: COMMENTS_EVENT_TYPE.comment,
};

export const commentValidationSchema = (t: TFunction) =>
  object().shape({
    comment: string().required(t(`${I18N_PATH}CommentRequired`)),
  });
