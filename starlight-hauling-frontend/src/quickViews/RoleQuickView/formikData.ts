import * as Yup from 'yup';

import { notNullObject } from '@root/helpers';
import { Role } from '@root/stores/entities';
import { RoleStore } from '@root/stores/role/RoleStore';
import { IRole } from '@root/types';

export type FormRole = Omit<IRole, 'usersCount' | 'id' | 'createdAt' | 'updatedAt'>;

export const validationSchema = (roleStore: RoleStore, selectedEntity: Role | null) => {
  let data = roleStore.values;

  if (selectedEntity?.id) {
    data = data.filter(x => x.id !== selectedEntity.id);
  }

  const descriptions = data.map(role => role.description);

  return Yup.object().shape({
    active: Yup.boolean(),
    personal: Yup.boolean(),
    personalLabel: Yup.boolean(),
    description: Yup.string()
      .trim()
      .notOneOf(descriptions, 'Description must be unique')
      .required('Description is required'),
  });
};

const defaultValue: FormRole = {
  active: true,
  description: '',
  policies: [],
  policyTemplates: [],
};

export const getDuplicateValues = (item: FormRole): FormRole => ({
  ...item,
  description: '',
});

export const getValues = (item: FormRole | null): FormRole => {
  if (!item) {
    return defaultValue;
  }

  return notNullObject(item, defaultValue);
};
