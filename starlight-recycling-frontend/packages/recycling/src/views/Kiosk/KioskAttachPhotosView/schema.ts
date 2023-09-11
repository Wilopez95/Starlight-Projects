import * as yup from 'yup';
import { schema as selfServiceSchema } from '../SelfServiceOrderForm/schema';
import i18n from '../../../i18n';

export const attachPhotosOrderSchemaShape = yup.object().shape({
  images: yup
    .array()
    .of(
      yup.object({
        filename: yup.string().required(),
        url: yup.string().required(),
      }),
    )
    .min(1, i18n.t('At least one photo is required')),
});

export const schema = selfServiceSchema.concat(attachPhotosOrderSchemaShape);
