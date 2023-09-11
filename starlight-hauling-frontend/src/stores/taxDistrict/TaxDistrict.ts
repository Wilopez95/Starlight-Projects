import { BBox } from 'geojson';
import { upperFirst } from 'lodash-es';
import { action } from 'mobx';

import { findTaxConfigurationByBusinessLineId } from '@root/helpers';
import {
  IBusinessConfig,
  ITaxDistrict,
  JsonConversions,
  LineItemTax,
  Tax,
  TaxDistrictType,
  TaxGroup,
  TaxKey,
} from '@root/types';

import { BaseEntity } from '../base/BaseEntity';

import { TaxDistrictStore } from './TaxDistrictStore';

const isLineItemTax = (tax: Tax | LineItemTax): tax is LineItemTax =>
  (tax.group && !Array.isArray(tax.exclusions)) || (!tax.group && !Array.isArray(tax.nonGroup));

export class TaxDistrict extends BaseEntity implements ITaxDistrict {
  active: boolean;
  description: string;
  districtType: TaxDistrictType;
  includeNationalInTaxableAmount: boolean;
  useGeneratedDescription: boolean;
  taxesPerCustomerType: boolean;
  bbox?: number[];
  businessLineTaxesIds?: number[];
  districtCode?: string;
  districtName?: string;
  taxDescription?: string | null;
  businessConfiguration: IBusinessConfig[];

  store: TaxDistrictStore;

  constructor(store: TaxDistrictStore, entity: JsonConversions<ITaxDistrict>) {
    super(entity);

    this.active = entity.active;
    this.bbox = entity.bbox as BBox;
    this.businessConfiguration = entity.businessConfiguration;
    this.businessLineTaxesIds = entity.businessLineTaxesIds;
    this.description = entity.description;
    this.districtCode = entity.districtCode;
    this.districtName = entity.districtName;
    this.districtType = entity.districtType;
    this.taxDescription = entity.taxDescription;
    this.includeNationalInTaxableAmount = entity.includeNationalInTaxableAmount;
    this.useGeneratedDescription = entity.useGeneratedDescription;
    this.taxesPerCustomerType = entity.taxesPerCustomerType;

    this.store = store;
  }

  @action
  setTax(key: TaxKey, commercial: boolean, businessLineId: number, tax: Tax | LineItemTax): void {
    const taxConfiguration = findTaxConfigurationByBusinessLineId(this, businessLineId);

    if (taxConfiguration) {
      const isValidLineItemTax = isLineItemTax(tax);

      if (
        (key === 'lineItems' && isValidLineItemTax) ||
        (key !== 'lineItems' && !isValidLineItemTax)
      ) {
        const taxGroup = `${commercial ? 'commercial' : 'nonCommercial'}${upperFirst(
          key,
        )}` as TaxGroup;

        taxConfiguration[taxGroup] = tax as Tax & LineItemTax;
      }
    }
  }
}
