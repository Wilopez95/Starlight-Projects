import Joi from 'joi';

import TENANT_NAME from '../../../../consts/tenantName.js';

export const schemaName = Joi.object().keys({
  schemaName: Joi.string().regex(TENANT_NAME).required(),
});
