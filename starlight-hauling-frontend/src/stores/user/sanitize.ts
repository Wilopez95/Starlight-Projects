import { FormUser } from '@root/quickViews/UserQuickView/formikData';
import { PhoneNumberType, UserManagementStatus } from '@root/types';

export const sanitizeUserForCreate = (user: FormUser) => ({
  ...user,
  active: undefined,
  policies:
    user.policies?.map(({ resource, access }) => ({
      resource,
      entries: Object.entries(access)
        .filter(([, config]) => config.overridden)
        .map(([subject, config]) => ({ subject, ...config })),
    })) ?? [],
  status: user.active ? UserManagementStatus.ACTIVE : UserManagementStatus.DISABLED,
  phones: user.phones.map(phone => ({
    ...phone,
    id: undefined,
    type: phone.type.toUpperCase() as PhoneNumberType,
  })),
  salesRepresentatives: user.salesRepresentatives.map(item => ({
    ...item,
    commissionAmount: +item.commissionAmount,
  })),
});

export const sanitizeUserForUpdate = (user: FormUser) => ({
  ...user,
  address: user.address ? { ...user.address, id: undefined } : undefined,
  active: undefined,
  email: undefined,
  status: user.active ? UserManagementStatus.ACTIVE : UserManagementStatus.DISABLED,
  policies:
    user.policies?.map(({ resource, access }) => ({
      resource,
      entries: Object.entries(access)
        .filter(([, config]) => config.overridden)
        .map(([subject, config]) => ({ subject, ...config })),
    })) ?? [],
  phones: user.phones.map(phone => ({
    ...phone,
    id: undefined,
    type: phone.type.toUpperCase() as PhoneNumberType,
  })),
  salesRepresentatives: user.salesRepresentatives.map(item => ({
    ...item,
    commissionAmount: +item.commissionAmount,
  })),
});
