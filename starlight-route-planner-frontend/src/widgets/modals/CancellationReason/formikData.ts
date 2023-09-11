import { TFunction } from 'i18next';
import { object, string } from 'yup';

import { Maybe, CancellationReason } from '@root/types';

export const getInitialValues = (
  cancellationReason?: CancellationReason,
  cancellationComment?: string,
) => ({
  cancellationReason: cancellationReason ?? CancellationReason.UserError,
  cancellationComment,
});

export type FormDataType = ReturnType<typeof getInitialValues>;

const I18N_PATH = 'components.modals.CancellationReason.Validation.';

export const validationSchema = (
  validateComment: (value?: Maybe<string>) => boolean,
  t: TFunction,
) =>
  object({
    cancellationReason: string().required(t(`${I18N_PATH}CancellationReason`)),
    cancellationComment: string()
      .nullable()
      .test('cancellationComment', t(`${I18N_PATH}Comment`), (value?: Maybe<string>) =>
        validateComment(value),
      ),
  });
