import { Field, Float, InputType, ObjectType, registerEnumType } from 'type-graphql';
import { ContactPhoneInput } from '../../../graphql/types/ContactPhone';
import CustomerType from '../../../modules/recycling/graphql/types/CustomerType';
import { CustomerAddress, CustomerAddressInput } from '../../../graphql/types/CustomerAddress';
import { Balances } from '../../billing/graphql/graphql';
import { IsBoolean, IsEmail, IsOptional, Length } from 'class-validator';

export enum APR_TYPE {
  STANDARD = 'standard',
  CUSTOM = 'custom',
}

registerEnumType(APR_TYPE, { name: 'APRType' });

export enum PAYMENT_TERM {
  COD = 'cod',
  NET_15_DAYS = 'net15Days',
  NET_30_DAYS = 'net30Days',
  NET_45_DAYS = 'net45Days',
  NET_60_DAYS = 'net60Days',
  NET_75_DAYS = 'net75Days',
  NONE = 'NONE',
}

registerEnumType(PAYMENT_TERM, { name: 'PaymentTerm' });

export enum BILLING_CYCLE {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  TWENTY_EIGHT_DAYS = '28days',
  QUATERLY = 'quarterly',
  YEARLY = 'yearly',
  NONE = 'NONE',
}

registerEnumType(BILLING_CYCLE, { name: 'BillingCycle' });

export enum INVOICE_CONSTRUCTION {
  BY_ORDER = 'byOrder',
  BY_ADDRESS = 'byAddress',
  BY_CUSTOMER = 'byCustomer',
}

registerEnumType(INVOICE_CONSTRUCTION, { name: 'InvoiceConstruction' });

export enum HaulingPhoneType {
  MAIN = 'main',
  HOME = 'home',
  WORK = 'work',
  CELL = 'cell',
  PAGER = 'pager',
  FAX = 'fax',
  OTHER = 'other',
}

registerEnumType(HaulingPhoneType, { name: 'HaulingPhoneType' });

@ObjectType()
export class HaulingPhone {
  @Field(() => HaulingPhoneType)
  type!: HaulingPhoneType;
  @Field(() => String, { nullable: true })
  number: string | null = null;
  @Field(() => String, { nullable: true })
  extension: string | null = null;
  @Field()
  textOnly!: boolean;
}

export enum HaulingCustomerStatus {
  active = 'active',
  onHold = 'onHold',
}
registerEnumType(HaulingCustomerStatus, { name: 'HaulingCustomerStatus' });

@ObjectType()
export class HaulingCustomer {
  @Field()
  id!: number;
  @Field(() => String, { nullable: true })
  saleRepresentativeId: string | null = null;
  @Field(() => String, { nullable: true })
  businessName: string | null = null;
  @Field(() => Boolean, { nullable: true })
  onAccount!: boolean;
  @Field()
  get onHold(): boolean {
    return this.status === HaulingCustomerStatus.onHold;
  }
  @Field()
  get active(): boolean {
    return this.status === HaulingCustomerStatus.active;
  }
  @Field(() => Boolean, { nullable: true })
  commercial: boolean | null = null;
  @Field()
  customerGroupId!: number;
  @Field()
  signatureRequired!: boolean;
  @Field(() => Boolean, { nullable: true })
  poRequired: boolean | null = null;
  @Field(() => Boolean, { nullable: true })
  workOrderRequired: boolean | null = null;
  @Field(() => Boolean, { nullable: true })
  jobSiteRequired: boolean | null = null;
  @Field(() => Boolean, { nullable: true })
  canTareWeightRequired: boolean | null = null;
  @Field(() => Boolean, { nullable: true })
  gradingRequired: boolean | null = null;
  @Field()
  alternateId?: string;
  @Field()
  firstName!: string;
  @Field()
  lastName!: string;
  @Field(() => [HaulingPhone])
  phoneNumbers!: HaulingPhone[];
  @Field()
  mainFirstName!: string;
  @Field()
  mainLastName!: string;
  @Field()
  mainEmail?: string;
  @Field()
  mainJobTitle?: string;
  @Field(() => [HaulingPhone])
  mainPhoneNumbers!: HaulingPhone[];
  @Field()
  sendInvoicesByEmail?: boolean;
  @Field()
  sendInvoicesByPost?: boolean;
  @Field()
  salesId?: string;
  @Field(() => [String], { nullable: true })
  invoiceEmails: string[] | null = null;
  @Field(() => [String], { nullable: true })
  statementEmails: string[] | null = null;
  @Field(() => [String], { nullable: true })
  notificationEmails: string[] | null = null;
  @Field()
  addFinanceCharges!: boolean;
  @Field()
  aprType!: APR_TYPE;
  @Field(() => Float, { nullable: true })
  financeCharge: number | null = null;
  @Field()
  generalNote?: string;
  @Field(() => String, { nullable: true })
  popupNote?: string;
  @Field(() => Boolean, { nullable: true })
  selfServiceOrderAllowed!: boolean;
  @Field(() => Boolean, { nullable: true })
  gradingNotification?: boolean | null;
  @Field()
  email?: string;
  @Field()
  creditLimit!: number;
  @Field(() => BILLING_CYCLE, { nullable: true })
  billingCycle: BILLING_CYCLE | null = null;
  @Field()
  paymentTerms!: PAYMENT_TERM;
  @Field()
  attachTicketPref!: boolean;
  @Field()
  attachMediaPref!: boolean;
  @Field()
  invoiceConstruction!: INVOICE_CONSTRUCTION;
  @Field(() => HaulingCustomerStatus)
  status!: HaulingCustomerStatus;
  @Field()
  walkup!: boolean;
  @Field(() => CustomerType)
  get type(): CustomerType {
    if (this.walkup) {
      return CustomerType.WALKUP;
    }

    return CustomerType.COMMERCIAL;
  }
  @Field(() => CustomerAddress)
  mailingAddress!: CustomerAddress;
  @Field(() => CustomerAddress)
  billingAddress!: CustomerAddress;
  @Field(() => Balances, { nullable: true })
  balances!: Balances | null;
  @Field(() => String, { nullable: true })
  haulerSrn: string | null = null;
}

@InputType()
export class CustomerContactInput {
  @Field()
  @IsBoolean()
  active!: boolean;

  @Field()
  isMain!: boolean;

  @Length(1, 200)
  @Field(() => String)
  firstName!: string;

  @Length(1, 200)
  @Field(() => String)
  lastName!: string;

  @Length(0, 200)
  @Field({ nullable: true })
  @IsOptional()
  title?: string;

  @Field({ nullable: true })
  @IsEmail({}, { message: 'Contact email is invalid' })
  @IsOptional()
  email?: string;

  @Field(() => [ContactPhoneInput], { defaultValue: [] })
  phones!: ContactPhoneInput[];
}

@InputType()
export class HaulingCustomerInput {
  // General Info

  @Field()
  @Length(0, 200)
  businessName!: string;

  @Field(() => Number)
  groupId!: number;

  @Field()
  active!: boolean;

  @Field()
  requirePONumber!: boolean;

  @Field()
  requireWONumber!: boolean;

  @Field()
  requireGrading!: boolean;

  @Field()
  requireCanTareWeight!: boolean;

  @Field()
  requireJobSite!: boolean;

  @Field()
  allowSelfServiceOrders!: boolean;

  @Field()
  gradingNotification!: boolean;

  @Field()
  sendInvoiceByEmail!: boolean;

  @Field()
  sendInvoiceByPost!: boolean;

  @Field({ nullable: true })
  @IsEmail({}, { message: 'General info email is invalid' })
  @IsOptional()
  email?: string;

  @Field({ nullable: true })
  alternateID?: string;

  @Field(() => [ContactPhoneInput], { defaultValue: [] })
  phones!: ContactPhoneInput[];

  @Field({ defaultValue: null })
  saleRepresentativeId?: string;

  // Payments and Billing

  @Field()
  onAccount!: boolean;

  @Field({ defaultValue: 0 })
  creditLimit!: number;

  @Field(() => BILLING_CYCLE, { nullable: true })
  billingCycle!: BILLING_CYCLE | null;

  @Field(() => PAYMENT_TERM, { nullable: true })
  paymentTerm!: PAYMENT_TERM | null;

  @Field()
  addFinancialCharges!: boolean;

  @Field(() => APR_TYPE, { nullable: true })
  apr!: APR_TYPE | null;

  @Field(() => Number, { nullable: true, defaultValue: 0 })
  aprCharge!: number | null;

  @Field(() => INVOICE_CONSTRUCTION, { nullable: true })
  invoiceConstruction!: INVOICE_CONSTRUCTION | null;

  @Field(() => String, { nullable: true })
  @IsEmail({}, { message: 'Email for invoices is invalid' })
  @IsOptional()
  emailForInvoices?: string | null = null;

  // Addresses

  @Field(() => Boolean)
  billingSameAsMailing!: boolean;

  @Field(() => CustomerAddressInput)
  mailingAddress!: CustomerAddressInput;

  @Field(() => CustomerAddressInput)
  billingAddress!: CustomerAddressInput;

  // Customer Notes

  @Length(0, 65535)
  @Field(() => String, { defaultValue: '' })
  generalNotes!: string;

  @Length(0, 65535)
  @Field(() => String, { defaultValue: '' })
  popupNotes!: string;

  @Field(() => CustomerContactInput)
  mainContact!: CustomerContactInput;

  @Field(() => String, { nullable: true })
  haulerSrn?: string | null = null;
}
