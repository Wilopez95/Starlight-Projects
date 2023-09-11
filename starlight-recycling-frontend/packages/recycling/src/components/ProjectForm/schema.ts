import * as Yup from 'yup';
import moment from 'moment';
import i18n from '../../i18n';

export const ProjectSchema = Yup.object().shape({
  purchaseOrder: Yup.bool().required(i18n.t('Required')),
  startDate: Yup.object()
    .nullable()
    .required(i18n.t('Required'))
    .test('startDate', i18n.t('Invalid date'), (value) => {
      if (value && value >= moment().startOf('day')) {
        return value.isValid();
      }

      return false;
    })
    .test('startDate', i18n.t('Required'), (value) => {
      if (!value) {
        return false;
      }

      return true;
    }),
  endDate: Yup.object().when('startDate', (startDate: any) => {
    if (startDate) {
      return Yup.object()
        .nullable()
        .test('endDate', i18n.t('Invalid date'), (value) => {
          if (value) {
            return value.isValid() && value.startOf('day') >= startDate.startOf('day');
          }

          return true;
        });
    }
  }),
  description: Yup.string()
    .max(200, i18n.t('MaxLength', { number: 200 }))
    .trim()
    .required(i18n.t('Required')),
});
