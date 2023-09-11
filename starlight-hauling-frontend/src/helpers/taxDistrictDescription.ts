import { TaxCalculation } from '@root/consts';
import { IntlConfig } from '@root/i18n/types';
import { IBusinessLine, ITaxDistrict, LineItemTax, Tax } from '@root/types';

export const generateTaxDescription =
  ({ formatCurrency }: IntlConfig) =>
  ({ tax, label }: { tax: Tax | LineItemTax; label: string }) => {
    const getTaxString = (value: string) =>
      tax.calculation === TaxCalculation.Percentage ? `${value}%` : formatCurrency(Number(value));

    if (tax.group) {
      if (+tax.value > 0) {
        let isSelected = false;

        if (Array.isArray(tax.exclusions)) {
          isSelected = tax.exclusions.length === 0;
        } else {
          isSelected =
            tax.exclusions.lineItems.length === 0 && tax.exclusions.thresholds.length === 0;
        }

        return [`- ${getTaxString(tax.value)} to ${isSelected ? 'all' : 'selected'} ${label}`];
      }

      return [];
    }
    const items = Array.isArray(tax.nonGroup)
      ? tax.nonGroup
      : tax.nonGroup.thresholds.concat(tax.nonGroup.lineItems);

    return items
      .filter(nonGroupItem => +nonGroupItem.value > 0)
      .map(nonGroupItem => `- ${getTaxString(nonGroupItem.value)} to selected ${label}`);
  };

export const generateTaxDistrictDescription = (
  taxDistrict: ITaxDistrict | null,
  businessLines: IBusinessLine[],
  intlConfig: IntlConfig,
): string | undefined => {
  if (!taxDistrict) {
    return;
  }

  const generateDescription = generateTaxDescription(intlConfig);

  const descriptions = taxDistrict.businessConfiguration.reduce<string[]>((agg, current) => {
    const {
      commercialLineItems,
      commercialMaterials,
      commercialRecurringLineItems,
      commercialRecurringServices,
      commercialServices,
      nonCommercialLineItems,
      nonCommercialMaterials,
      nonCommercialRecurringLineItems,
      nonCommercialRecurringServices,
      nonCommercialServices,
    }: {
      commercialLineItems: LineItemTax;
      commercialMaterials: Tax;
      commercialRecurringLineItems: Tax;
      commercialRecurringServices: Tax;
      commercialServices: Tax;
      nonCommercialLineItems: LineItemTax;
      nonCommercialMaterials: Tax;
      nonCommercialRecurringLineItems: Tax;
      nonCommercialRecurringServices: Tax;
      nonCommercialServices: Tax;
    } = current;
    const activeBusinessLine = businessLines.find(bl => bl.id === +current.businessLineId);

    if (!activeBusinessLine) {
      return agg;
    }

    let businessLineDesc = [
      ...generateDescription({
        tax: commercialServices,
        label: 'Commercial One-Time Services',
      }),
      ...generateDescription({
        tax: commercialRecurringServices,
        label: 'Commercial Recurring Services',
      }),
      ...generateDescription({ tax: commercialMaterials, label: 'Commercial Materials' }),
      ...generateDescription({
        tax: commercialLineItems,
        label: 'Commercial Line Items And Thresholds',
      }),
      ...generateDescription({
        tax: commercialRecurringLineItems,
        label: 'Commercial Recurring Line Items',
      }),
      ...generateDescription({
        tax: nonCommercialServices,
        label: 'Non-Commercial One-Time Services',
      }),
      ...generateDescription({
        tax: nonCommercialRecurringServices,
        label: 'Non-Commercial Recurring Services',
      }),
      ...generateDescription({
        tax: nonCommercialMaterials,
        label: 'Non-Commercial Materials',
      }),
      ...generateDescription({
        tax: nonCommercialLineItems,
        label: 'Non-Commercial Line Items And Thresholds',
      }),
      ...generateDescription({
        tax: nonCommercialRecurringLineItems,
        label: 'Non-Commercial Recurring Line Items',
      }),
    ];

    if (businessLineDesc.length > 0) {
      const label = `${activeBusinessLine.name}:`;
      const nextLine = '';

      businessLineDesc = [label, ...businessLineDesc, nextLine];

      return [...agg, ...businessLineDesc];
    }

    return agg;
  }, []);

  return descriptions.length > 0 ? descriptions.join('\n') : undefined;
};

export const formatTaxDistrictDescription = (description: string, separator = ';') =>
  description.replace(/(\r\n)/gm, separator);
