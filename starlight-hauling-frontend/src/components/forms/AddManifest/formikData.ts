import * as Yup from 'yup';

import { BillableLineItemUnitTypeEnum } from '@root/consts';
import { i18n } from '@root/i18n';

import { INewManifestWithFile } from './types';

const I18N_PATH = 'components.forms.AddManifestForm.';

export const defaultValue: INewManifestWithFile = {
  unitType: BillableLineItemUnitTypeEnum.TON,
  quantity: 0,
  manifestNumber: '',
  materialId: null,
  workOrderId: 0,
};

export const validationSchema = Yup.object().shape({
  manifestNumber: Yup.string()
    .strict(true)
    .trim('Leading and trailing whitespace not allowed')
    .required(i18n.t(`${I18N_PATH}ValidationErrors.ManifestNumberRequired`)),
  quantity: Yup.number()
    .positive(i18n.t(`${I18N_PATH}ValidationErrors.QuantityPositive`))
    .required(i18n.t(`${I18N_PATH}ValidationErrors.QuantityRequired`)),
  unitType: Yup.string()
    .oneOf([BillableLineItemUnitTypeEnum.TON, BillableLineItemUnitTypeEnum.YARD])
    .required(),
  materialId: Yup.number()
    .nullable()
    .required(i18n.t(`${I18N_PATH}ValidationErrors.MaterialRequired`)),
  file: Yup.mixed().required(i18n.t(`${I18N_PATH}ValidationErrors.FileRequired`)),
});
