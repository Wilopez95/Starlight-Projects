import Joi from 'joi';

import TENANT_NAME from '../../../../consts/tenantName.js';
import { REGIONS } from '../../../../consts/regions.js';

export const tenantData = Joi.object()
  .keys({
    name: Joi.string().regex(TENANT_NAME).required(),
    legalName: Joi.string().required(),
    rootEmail: Joi.string().email().required(),
    region: Joi.string()
      .valid(...REGIONS)
      .required(),
  })
  .required();

export const tenantName = Joi.object().keys({ name: Joi.string().regex(TENANT_NAME).required() });
