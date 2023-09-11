import { addDays } from 'date-fns';

export const defaultValues = {
  publishDate: addDays(new Date(), 1),
};

export type PublishRouteFormValues = typeof defaultValues;
