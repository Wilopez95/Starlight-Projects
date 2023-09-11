import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ObjectType, Field, registerEnumType } from 'type-graphql';

import BaseEntity from '../../../entities/BaseEntity';
import { BusinessUnit } from '../../../services/core/types/BusinessUnit';
import { getBusinessUnit } from '../../../services/core/business_units';
import { Context } from '../../../types/Context';
import { getCompanyRegionalSettings } from '../../../services/core/companies';
import { HaulingCompanyRegionalSettings } from '../../../services/core/types/HaulingCompany';

export enum Currency {
  USD = 'USD',
  CAD = 'CAD',
  GBP = 'GBP',
}

export enum Gateway {
  CardConnect = 'CardConnect',
}

export enum FinanceMethod {
  days = 'days',
  periods = 'periods',
}

export enum DocumentType {
  statements = 'statements',
  invoices = 'invoices',
}

registerEnumType(Currency, {
  name: 'Currency',
});

registerEnumType(Gateway, {
  name: 'Gateway',
});

registerEnumType(FinanceMethod, {
  name: 'FinanceMethod',
});

registerEnumType(DocumentType, {
  name: 'DocumentType',
});

@Entity()
@ObjectType()
export default class Company extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Field({ defaultValue: null })
  logoUrl?: string;

  @Field({ defaultValue: null })
  companyName1?: string;

  @Field({ defaultValue: null })
  companyName2?: string;

  @Field({ defaultValue: null })
  facilityAddress?: string;

  @Field({ defaultValue: null })
  facilityAddress2?: string;

  @Field({ defaultValue: null })
  facilityCity?: string;

  @Field({ defaultValue: null })
  facilityState?: string;

  @Field({ defaultValue: null })
  facilityZip?: string;

  @Field({ defaultValue: null })
  mailingAddress?: string;

  @Field({ defaultValue: null })
  mailingAddress2?: string;

  @Field({ defaultValue: null })
  mailingCity?: string;

  @Field({ defaultValue: null })
  mailingState?: string;

  @Field({ defaultValue: null })
  mailingZip?: string;

  @Field({ defaultValue: null })
  website?: string;

  @Field({ defaultValue: null })
  email?: string;

  @Field({ defaultValue: null })
  phone?: string;

  @Field({ defaultValue: null })
  fax?: string;

  @Field({ defaultValue: null })
  region?: string;

  @Field({ defaultValue: null })
  firstInvoice?: string;

  @Field(() => Currency, { nullable: true })
  currency?: Currency;

  @Field(() => Gateway, { nullable: true })
  ccGateway?: Gateway;

  @Field(() => FinanceMethod, { nullable: true })
  financeMethod?: FinanceMethod;

  @Field(() => Number, { nullable: true, defaultValue: 0 })
  financeAPR?: number;

  @Field({ defaultValue: null })
  minBalance?: string;

  @Field({ defaultValue: null })
  minFinanceCharge?: string;

  @Field({ defaultValue: null })
  documentType?: DocumentType;

  @Field({ defaultValue: null })
  mailingFrom?: string;

  @Field({ defaultValue: null })
  mailingReplyTo?: string;

  @Field({ defaultValue: null })
  mailingSendCopyTo?: string;

  @Field({ defaultValue: null })
  subject?: string;

  @Field({ defaultValue: null })
  emailBody?: string;

  @Field({ defaultValue: 'UTC' })
  timezone!: string;

  @Field(() => String, { defaultValue: null })
  businessTimeSundayStart: string | null = null;

  @Field(() => String, { defaultValue: null })
  businessTimeSundayEnd: string | null = null;

  @Field(() => String, { defaultValue: null })
  businessTimeMondayStart: string | null = null;

  @Field(() => String, { defaultValue: null })
  businessTimeMondayEnd: string | null = null;

  @Field(() => String, { defaultValue: null })
  businessTimeTuesdayStart: string | null = null;

  @Field(() => String, { defaultValue: null })
  businessTimeTuesdayEnd: string | null = null;

  @Field(() => String, { defaultValue: null })
  businessTimeWednesdayStart: string | null = null;

  @Field(() => String, { defaultValue: null })
  businessTimeWednesdayEnd: string | null = null;

  @Field(() => String, { defaultValue: null })
  businessTimeThursdayStart: string | null = null;

  @Field(() => String, { defaultValue: null })
  businessTimeThursdayEnd: string | null = null;

  @Field(() => String, { defaultValue: null })
  businessTimeFridayStart: string | null = null;

  @Field(() => String, { defaultValue: null })
  businessTimeFridayEnd: string | null = null;

  @Field(() => String, { defaultValue: null })
  businessTimeSaturdayStart: string | null = null;

  @Field(() => String, { defaultValue: null })
  businessTimeSaturdayEnd: string | null = null;

  @Field({ defaultValue: null, nullable: true })
  @Column('varchar', { nullable: true })
  yardInstructions?: string;

  private fetchBUPromise?: Promise<BusinessUnit>;
  private fetchRSPromise?: Promise<HaulingCompanyRegionalSettings>;

  fetchBU(ctx: Context): Promise<BusinessUnit> {
    if (!this.fetchBUPromise) {
      this.fetchBUPromise = getBusinessUnit(ctx);
    }

    return this.fetchBUPromise;
  }

  fetchRegionalSettings(ctx: Context): Promise<HaulingCompanyRegionalSettings> {
    if (!this.fetchRSPromise) {
      this.fetchRSPromise = getCompanyRegionalSettings(ctx);
    }

    return this.fetchRSPromise;
  }
}
