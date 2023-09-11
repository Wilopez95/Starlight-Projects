import { TFunction, TOptions } from 'i18next';
import * as Yup from 'yup';

import { DEFAULT_ADDRESS } from '@root/consts/address';
import { emailValidator, notNullObject } from '@root/helpers';
import { IntlConfig } from '@root/i18n/types';
// import { Resource } from '@root/stores/resource/Resource';
import { UserStore } from '@root/stores/user/UserStore';
import { IUser, Maybe } from '@root/types';
// import { AccessLevel, IUser, Maybe, ResourceType } from '@root/types';

export interface FormUser
  extends Omit<
    IUser,
    'id' | 'createdAt' | 'updatedAt' | 'roles' | 'name' | 'hasPersonalPermissions'
  > {
  roleIds: string[];
  firstName: string;
  lastName: string;
  title: string;
}

const I18N_PATH =
  'pages.SystemConfiguration.tables.UsersAndRoles.components.User.QuickView.ValidationErrors.';

export const validationSchema = (
  userStore: UserStore,
  activeTabKey: string | null,
  intl: IntlConfig,
  _t: TFunction,
) => {
  if (activeTabKey !== 'general') {
    return;
  }

  const t = (key: string, opts?: TOptions): string => _t(`${I18N_PATH}${key}`, opts);

  const selectedUser = userStore.selectedEntity;
  let data = userStore.values;

  if (selectedUser?.id) {
    data = data.filter(x => x.id !== selectedUser.id);
  }
  const emails = data.map(user => user.email);

  return Yup.object().shape({
    isSales: Yup.boolean(),
    firstName: Yup.string()
      .trim()
      .required(t('FirstName'))
      .max(50, _t('ValidationErrors.PleaseEnterUpTo', { number: 50 })),
    lastName: Yup.string()
      .required(t('LastName'))
      .max(50, _t('ValidationErrors.PleaseEnterUpTo', { number: 50 })),
    title: Yup.string().trim().required(t('TitleIsRequired')),
    email: Yup.string()
      .trim()
      .email(emailValidator)
      .notOneOf(emails, t('EmailUnique'))
      .required(t('EmailRequired')),
    address: Yup.object().shape({
      addressLine1: Yup.string()
        .required(t('Address1Required'))
        .max(100, _t('ValidationErrors.PleaseEnterUpTo', { number: 100 })),
      addressLine2: Yup.string()
        .nullable()
        .max(100, _t('ValidationErrors.PleaseEnterUpTo', { number: 100 })),
      city: Yup.string()
        .required(t('CityRequired'))
        .max(50, _t('ValidationErrors.PleaseEnterUpTo', { number: 50 })),
      state: Yup.string()
        .required(t('StateRequired'))
        .max(50, _t('ValidationErrors.PleaseEnterUpTo', { number: 50 })),
      zip: Yup.string()
        .matches(intl.zipRegexp, 'ZIP must be in correct format')
        .required(t('ZipRequired')),
    }),
    phones: Yup.array().of(
      Yup.object().shape({
        id: Yup.string(),
        type: Yup.string().required(),
        number: Yup.string()
          .ensure()
          .test(
            'mobile',
            t('ValidPhone'),
            (value?: Maybe<string>) => !!value && intl.validatePhoneNumber(value),
          )
          .required(t('PhoneNumberRequired')),
        extension: Yup.string()
          .matches(/^[0-9]*$/, t('ValidExtension'))
          .nullable(),
      }),
    ),
    salesRepresentatives: Yup.array().of(
      Yup.object().shape({
        businessUnitId: Yup.number().required(t('BusinessUnitRequired')),
        commissionAmount: Yup.number()
          .typeError(t('CommissionTypeError'))
          .required(t('CommissionAmountRequired'))
          .positive(t('CommissionAmountPositive')),
      }),
    ),
  });
};

const defaultValue: FormUser = {
  active: true,
  firstName: '',
  lastName: '',
  title: '',
  email: '',
  roleIds: [],
  address: DEFAULT_ADDRESS,
  phones: [],
  policies: [],
  salesRepresentatives: [],
};
// , resources: Resource[]
export const getValues = (item: IUser | null): FormUser => {
  if (!item) {
    return {
      ...defaultValue,
      // @NOTE: This was a hack implemented by Eleks for permissions? See REC-2419
      // Disabling this allows creation of users with database seed and when user ids
      // have been modified.
      // We will write a new ticket to fix properly if this permission hack is actually needed.
      // See policy hack below:
      // - Steven, 11/17/2022
      // policies: (resources || [])
      //   .filter(({ type }) => type === ResourceType.RECYCLING)
      //   .map(({ srn }) => ({
      //     resource: srn,
      //     access: {
      //       // eslint-disable-next-line no-useless-computed-key
      //       ['orders:new-prepaid-on-hold-order']: {
      //         level: AccessLevel.FULL_ACCESS,
      //         overridden: true,
      //       },
      //     },
      //   })),
    };
  }

  const newValue = notNullObject(item, defaultValue);

  newValue.roleIds = item.roles?.map(({ id }) => String(id)) ?? [];

  return newValue;
};
