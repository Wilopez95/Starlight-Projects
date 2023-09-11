import i18next from 'i18next';
import * as Yup from 'yup';

const I18N_PATH = 'pages.Dispatcher.components.MasterRoutesGrid.Table.Errors.Text.';

export const generateValidationSchema = () =>
  Yup.object().shape({
    services: Yup.array().of(
      Yup.object().shape({
        top: Yup.number(),
        newSequence: Yup.number()
          .nullable()
          .when('top', {
            is: val => val != null,
            then: Yup.number().max(Yup.ref('top'), i18next.t(`${I18N_PATH}ErrorSequenceTooLong`)),
          })
          .min(1, i18next.t(`${I18N_PATH}ErrorNonPositiveSequence`)),
      }),
    ),
  });
