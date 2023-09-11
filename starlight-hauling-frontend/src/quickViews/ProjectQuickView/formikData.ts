import { isAfter } from 'date-fns';
import * as Yup from 'yup';

import { notNullObject } from '@root/helpers';
import { ProjectStore } from '@root/stores/project/ProjectStore';
import { ICustomerJobSitePair, IProject, Maybe } from '@root/types';

export const generateValidationSchema = (projectStore: ProjectStore) => {
  const currentId = projectStore.selectedEntity?.id;
  let projects = projectStore.values;

  if (currentId) {
    projects = projects.filter(project => project.id !== currentId);
  }

  const descriptions = projects.map(project => project.description);

  return Yup.object().shape({
    description: Yup.string()
      .trim()
      .max(120, 'Description must not exceed 120 characters')
      .required('Description is required')
      .notOneOf(descriptions, 'Description must be unique'),
    startDate: Yup.date().nullable(),
    endDate: Yup.date()
      .nullable()
      .test(
        'endDate',
        'End date cannot be less than the start date',
        function (date?: Maybe<Date>) {
          return this.parent.startDate && date
            ? isAfter(date, this.parent.startDate as number | Date)
            : true;
        },
      ),
  });
};

const defaultValue: IProject = {
  id: 0,
  customerJobSiteId: 0,
  generatedId: '',
  description: '',
  startDate: null,
  endDate: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  permitRequired: false,
  poRequired: true,
};

export const getValues = (
  generatedId?: string,
  item?: IProject | null,
  linkedData?: ICustomerJobSitePair,
): IProject => {
  if (generatedId) {
    defaultValue.generatedId = generatedId;
  }

  if (linkedData) {
    defaultValue.poRequired = linkedData.poRequired ?? defaultValue.poRequired;
    defaultValue.permitRequired = linkedData.permitRequired ?? defaultValue.permitRequired;
  }

  if (!item) {
    return defaultValue;
  }

  return notNullObject(item, defaultValue);
};
