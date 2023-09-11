import Joi from 'joi';
import { SERVICING_FREQUENCY_IDS } from '../../../consts/frequencyTypes.js';
import { SERVICE_DAYS_OF_WEEK_NUMBERS } from '../../../consts/serviceDays.js';

const id = Joi.number().integer().positive();

const haulingServiceItemsFiltersSchema = Joi.object().keys({
  businessLineId: id.required(),
  equipmentIds: Joi.array().items(id.required()),
  serviceAreaIds: Joi.array().items(id.required()),
  frequencyIds: Joi.array()
    .items(...SERVICING_FREQUENCY_IDS)
    .optional(),
  materialIds: Joi.array().items(id.required()),
  serviceDaysOfWeek: Joi.array().items(...SERVICE_DAYS_OF_WEEK_NUMBERS),
});

export const getHaulingServiceItemsSchema = Joi.object().keys({
  businessUnitId: id.required(),
  filters: haulingServiceItemsFiltersSchema,
});
