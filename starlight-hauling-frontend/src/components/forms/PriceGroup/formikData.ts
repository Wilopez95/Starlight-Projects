import { isAfter } from 'date-fns';
import { get, isObject } from 'lodash-es';
import * as Yup from 'yup';

import { notNullObject } from '@root/helpers';
import { IntlConfig } from '@root/i18n/types';
import { PriceGroupsTab } from '@root/pages/SystemConfiguration/tables/PriceGroups/types';
import { PriceGroup } from '@root/stores/priceGroup/PriceGroup';
import { PriceGroupStore } from '@root/stores/priceGroup/PriceGroupStore';
import { Maybe } from '@root/types';
import { IPriceGroup } from '@root/types/entities/priceGroup';

export type FormikPriceGroups = Omit<IPriceGroup, 'validDays' | 'serviceAreaIds'> & {
  validDays: Record<string, boolean>;
  groupSpecification: PriceGroupsTab;
  customerSpecificationString: string;
  serviceAreaIds: Record<string, boolean>;

  // for customer job site pair
  pairCustomerId?: number;
  pairJobSiteId?: number;
};

export const getPriceGroupValidationSchema = (priceGroupStore: PriceGroupStore) => {
  const currentId = priceGroupStore.selectedEntity?.id;
  let priceGroups = priceGroupStore.values;

  if (currentId) {
    priceGroups = priceGroups.filter(priceGroup => priceGroup.id !== currentId);
  }

  const descriptions = priceGroups.map(priceGroup => priceGroup.description.toLowerCase());

  return Yup.object().shape({
    description: Yup.string()
      .lowercase()
      .trim()
      .max(120, 'Please enter up to 120 characters')
      .required('Description is required')
      .notOneOf(descriptions, 'Description must be unique'),
    validDays: Yup.object().test(
      'validDays',
      'At least one day should be selected',
      (val?: Maybe<unknown>) => {
        return !!val && isObject(val) && Object.keys(val).some(key => get(val, key));
      },
    ),
    startDate: Yup.date().nullable(),
    endDate: Yup.date()
      .nullable()
      .min(new Date(), 'End date must be greater than today')
      .test(
        'endDate',
        'End date cannot be less than the start date',
        function (date?: Maybe<Date>) {
          return this.parent.startDate && date
            ? isAfter(date, this.parent.startDate as Date)
            : true;
        },
      ),
    hasSpecificPrice: Yup.boolean(),
    groupSpecification: Yup.string(),
    customerGroupId: Yup.number()
      .nullable()
      .when('groupSpecification', {
        is: PriceGroupsTab.customerGroups,
        then: Yup.number().required('Customer group is required'),
      }),
    customerId: Yup.number()
      .nullable()
      .when('groupSpecification', {
        is: PriceGroupsTab.customers,
        then: Yup.number().required('Customer is required'),
      }),
    pairCustomerId: Yup.number()
      .nullable()
      .when('groupSpecification', {
        is: PriceGroupsTab.customerJobSites,
        then: Yup.number().required('Customer is required'),
      }),
    pairJobSiteId: Yup.number()
      .nullable()
      .when(['groupSpecification', 'pairCustomerId'], {
        is: (groupSpecification, pairCustomerId) =>
          groupSpecification === PriceGroupsTab.customerJobSites && !!pairCustomerId,
        then: Yup.number().required('Job Site is required'),
      }),
    serviceAreaIds: Yup.object()
      .nullable()
      .when('groupSpecification', {
        is: PriceGroupsTab.serviceAreas,
        then: Yup.object().test(
          'serviceAreaIds',
          'At least one service area should be selected',
          (val?: Maybe<unknown>) => {
            return !!val && isObject(val) && Object.keys(val).some(key => get(val, key));
          },
        ),
      }),
    spUsed: Yup.boolean(),
  });
};

const defaultDays = ({ weekDays }: IntlConfig): Record<string, boolean> =>
  Object.keys(weekDays).reduce((val, acc) => {
    return {
      ...val,
      [acc]: true,
    };
  }, {});

const priceGroupDefaultValue = (intl: IntlConfig): FormikPriceGroups => ({
  id: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
  description: '',
  validDays: defaultDays(intl),
  active: true,
  demurrageSetting: 'global',
  usageDaysSetting: 'global',
  overweightSetting: 'global',
  dumpSetting: 'material',
  loadSetting: 'material',
  nonServiceHours: false,
  startDate: null,
  endDate: null,
  groupSpecification: PriceGroupsTab.customerGroups,
  customerSpecificationString: '',
  customerId: undefined,
  customerGroupId: undefined,
  serviceAreaIds: {},
  customerJobSiteId: undefined,
  businessUnitId: '',
  businessLineId: '',
  spUsed: false,
});

const getPriceGroupDefaultValue = (
  defaultOverrides: Partial<FormikPriceGroups>,
  selectedTabKey: string,
  intlConfig: IntlConfig,
) => {
  const defaultValues = { ...priceGroupDefaultValue(intlConfig), ...defaultOverrides };

  if (
    selectedTabKey === PriceGroupsTab.customers ||
    selectedTabKey === PriceGroupsTab.customerJobSites ||
    selectedTabKey === PriceGroupsTab.serviceAreas
  ) {
    defaultValues.groupSpecification = selectedTabKey;
  }

  return defaultValues;
};

export const getDuplicateValues = (item: FormikPriceGroups) => ({
  ...item,
  description: '',
});

export const getPriceGroupValues = (
  defaultOverrides: Partial<FormikPriceGroups>,
  selectedTabKey: string,
  intl: IntlConfig,
  item?: PriceGroup | null,
): FormikPriceGroups => {
  if (!item) {
    return getPriceGroupDefaultValue(defaultOverrides, selectedTabKey, intl);
  }

  const selectedDays = item.validDays || [];

  const days = Object.keys(intl.weekDays).reduce<Record<string, boolean>>((val, acc) => {
    return {
      ...val,
      [acc]: selectedDays.includes(intl.weekDays[acc]),
    };
  }, {});

  const result = notNullObject(item as unknown as FormikPriceGroups, priceGroupDefaultValue(intl));

  result.startDate = item.startDate;
  result.endDate = item.endDate;
  result.validDays = days;

  result.groupSpecification = item.customerId
    ? PriceGroupsTab.customers
    : item.customerJobSiteId
    ? PriceGroupsTab.customerJobSites
    : item.serviceAreaIds
    ? PriceGroupsTab.serviceAreas
    : PriceGroupsTab.customerGroups;

  if (item.customer?.name) {
    result.customerSpecificationString = item.customer.name;
    result.pairCustomerId = item.customer.id;
  }

  if (item.jobSite) {
    result.pairJobSiteId = item.jobSite.id;
    result.jobSite = item.jobSite;
  }

  if (item.serviceAreaIds) {
    result.spUsed = !!result.spUsed;
    result.serviceAreaIds = item.serviceAreaIds.reduce<Record<string, boolean>>(
      (serviceAreaIdsObj, serviceAreaId) => {
        serviceAreaIdsObj[serviceAreaId] = true;

        return serviceAreaIdsObj;
      },
      {},
    );
  }

  return result;
};
