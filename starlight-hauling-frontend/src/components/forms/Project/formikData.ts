import { isAfter } from 'date-fns';
import { TFunction } from 'i18next';
import * as Yup from 'yup';

import { notNullObject } from '@root/helpers';
import { ProjectStore } from '@root/stores/project/ProjectStore';
import { ICustomer, ICustomerJobSitePair, IProject, Maybe } from '@root/types';

const I18N_PATH = 'components.forms.Project.ValidationErrors.';

export const generateValidationSchema = (
  projectStore: ProjectStore,
  t: TFunction,
  project?: IProject,
) => {
  const currentId = project?.id ?? projectStore.selectedEntity?.id;
  let projects = projectStore.values;

  if (currentId) {
    projects = projects.filter(projectElement => projectElement.id !== currentId);
  }

  const descriptions = projects.map(projectElement => projectElement.description);

  return Yup.object().shape({
    description: Yup.string()
      .trim()
      .max(120, t(`${I18N_PATH}120Chars`))
      .required(t(`${I18N_PATH}Required`))
      .notOneOf(descriptions, `${I18N_PATH}Uniq`),
    startDate: Yup.date().nullable(),
    endDate: Yup.date()
      .nullable()
      .test('endDate', t(`${I18N_PATH}EndDate`), function (date?: Maybe<Date>) {
        return this.parent.startDate && date ? isAfter(date, this.parent.startDate as Date) : true;
      }),
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
  generatedId: string,
  item?: IProject | null,
  linkedData?: ICustomerJobSitePair,
  selectedCustomer?: ICustomer | null,
): IProject => {
  defaultValue.generatedId = generatedId;

  if (linkedData) {
    defaultValue.poRequired = linkedData.poRequired ?? defaultValue.poRequired;
    defaultValue.permitRequired = linkedData.permitRequired ?? defaultValue.permitRequired;
  } else {
    defaultValue.poRequired = selectedCustomer?.poRequired ?? defaultValue.poRequired;
  }

  if (!item) {
    return defaultValue;
  }

  return notNullObject(item, defaultValue);
};
