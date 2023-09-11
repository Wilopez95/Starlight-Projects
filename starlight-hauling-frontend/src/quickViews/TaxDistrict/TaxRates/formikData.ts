import { FormikErrors } from 'formik';
import { TFunction } from 'i18next';
import { partition, startCase } from 'lodash-es';
import * as Yup from 'yup';

import { TaxCalculation } from '@root/consts';
import {
  GroupLineItemTax,
  GroupTax,
  IThreshold,
  LineItemTax,
  NonGroupLineItemTax,
  NonGroupTax,
  PercentageOrFlatTax,
  Tax,
} from '@root/types';

import { FormikTax, FormikTaxItem, TaxGroupItem, TaxRatesConfigType } from './types';

export const defaultValues: Omit<FormikTax, 'type'> = {
  calculation: TaxCalculation.Percentage,
  application: null,
  group: true,
  items: [],
  value: '0',
};

const I18N_PATH =
  'pages.SystemConfiguration.tables.TaxDistricts.QuickView.TaxRates.ValidationErrors.';

export const validationSchema = (t: TFunction) =>
  Yup.object().shape({
    calculation: Yup.string(),
    group: Yup.boolean(),
    value: Yup.number().when('group', {
      is: true,
      then: Yup.number()
        .typeError(t(`${I18N_PATH}MustBeNumber`))
        .required(t(`${I18N_PATH}ValueRequired`))
        .positive(t(`${I18N_PATH}MustBePositive`))
        .test('taxItems', t(`${I18N_PATH}NoItemsSelected`), function () {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return,@typescript-eslint/no-unsafe-call
          return this.parent.items.some((item: FormikTaxItem) => item.enabled);
        }),
    }),
    items: Yup.array().when('group', {
      is: false,
      then: Yup.array().of(
        Yup.object().shape({
          value: Yup.number().when('enabled', {
            is: true,
            then: Yup.number()
              .typeError(t(`${I18N_PATH}MustBeNumber`))
              .required(t(`${I18N_PATH}ValueRequired`))
              .positive(t(`${I18N_PATH}MustBePositive`)),
          }),
        }),
      ),
    }),
  });

export const getTaxItemError = (
  errors: string | string[] | FormikErrors<FormikTaxItem>[] | undefined,
  index: number,
) => {
  const error = errors?.[index] as FormikErrors<FormikTaxItem>;

  return error?.value;
};

const isItemThreshold = (item: TaxGroupItem): item is IThreshold =>
  ['overweight', 'usageDays', 'demurrage', 'dump', 'load'].includes((item as IThreshold).type);

export const mapTaxToForm = (
  type: TaxRatesConfigType,
  currentTaxGroupItems: TaxGroupItem[],
  taxItem?: Tax | LineItemTax,
): FormikTax => {
  if (!taxItem) {
    return { ...defaultValues, type } as FormikTax;
  }

  if (taxItem.group) {
    return {
      ...taxItem,
      type,
      items: currentTaxGroupItems.map(taxGroupItem => {
        const isThreshold = isItemThreshold(taxGroupItem);

        return {
          id: taxGroupItem.id,
          value: '',
          isThreshold,
          description: isThreshold ? startCase(taxGroupItem.description) : taxGroupItem.description,
          enabled: Array.isArray(taxItem.exclusions)
            ? !taxItem.exclusions.includes(taxGroupItem.id)
            : !taxItem.exclusions[isThreshold ? 'thresholds' : 'lineItems'].includes(
                taxGroupItem.id,
              ),
        };
      }),
    };
  }

  return {
    ...taxItem,
    type,
    value: '',
    items: currentTaxGroupItems.map(taxNonGroupItem => {
      const isThreshold = isItemThreshold(taxNonGroupItem);
      const nonGroupTaxItems = Array.isArray(taxItem.nonGroup)
        ? taxItem.nonGroup
        : taxItem.nonGroup[isThreshold ? 'thresholds' : 'lineItems'];

      const nonGroupTaxItem = nonGroupTaxItems.find(item => item.id === taxNonGroupItem.id);

      return {
        id: taxNonGroupItem.id,
        value: nonGroupTaxItem?.value ?? '',
        isThreshold,
        description: isThreshold
          ? startCase(taxNonGroupItem.description)
          : taxNonGroupItem.description,
        enabled: !!nonGroupTaxItem,
      };
    }),
  };
};

export const mapFormToTax = (formValues: FormikTax): Tax | LineItemTax => {
  const [enabledItems, disabledItems] = partition(formValues.items, item => item.enabled);
  const isLineItems = formValues.type === 'lineItems';

  if (formValues.group) {
    const exclusions = isLineItems
      ? {
          thresholds: disabledItems.filter(item => item.isThreshold).map(item => item.id),
          lineItems: disabledItems.filter(item => !item.isThreshold).map(item => item.id),
        }
      : disabledItems.map(item => item.id);

    return {
      calculation: formValues.calculation,
      application: formValues.application,
      value: formValues.value,
      group: true,
      exclusions,
    } as PercentageOrFlatTax & (GroupLineItemTax | GroupTax);
  } else {
    const nonGroup = isLineItems
      ? {
          thresholds: enabledItems
            .filter(item => item.isThreshold)
            .map(item => ({ id: item.id, value: item.value })),
          lineItems: enabledItems
            .filter(item => !item.isThreshold)
            .map(item => ({ id: item.id, value: item.value })),
        }
      : enabledItems.map(item => ({ id: item.id, value: item.value }));

    return {
      calculation: formValues.calculation,
      application: formValues.application,
      group: false,
      nonGroup,
    } as PercentageOrFlatTax & (NonGroupTax | NonGroupLineItemTax);
  }
};
