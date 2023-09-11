import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
import { GraphQLClientContext } from '../graphql/context';
import { gql } from '@apollo/client';
import * as ApolloReactCommon from '@apollo/client';
import * as ApolloReactHooks from '@apollo/client';
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type RequireFields<T, K extends keyof T> = { [X in Exclude<keyof T, K>]?: T[X] } &
  { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  /** The javascript `Date` as string. Type represents date and time as the ISO Date string. */
  DateTime: any;
  /** GeoJSON Feature as a Scalar */
  Feature: any;
  /** GeoJSON Geometry as a Scalar */
  Geometry: any;
  /** A Scalar that represents order history */
  HaulingOrderHistory: any;
  /** Key value object */
  Highlight: any;
  /** ObjectLiteralScalar */
  ObjectLiteralScalar: any;
  /** GeoJSON Point as a Scalar */
  Point: any;
  /** a Scalar that represents file upload */
  Upload: any;
  ReactElement: any;
  Function: any;
  AsyncFunction: any;
};

export enum AccessLevel {
  FullAccess = 'FULL_ACCESS',
  Modify = 'MODIFY',
  NoAccess = 'NO_ACCESS',
  Read = 'READ',
}

export type AddCreditCardInput = {
  active: Scalars['Boolean'];
  addressLine1: Scalars['String'];
  addressLine2?: Maybe<Scalars['String']>;
  cardNickname?: Maybe<Scalars['String']>;
  cardNumber: Scalars['String'];
  city: Scalars['String'];
  cvv: Scalars['String'];
  expirationDate: Scalars['String'];
  jobSites?: Maybe<Array<Maybe<Scalars['ID']>>>;
  nameOnCard: Scalars['String'];
  state: Scalars['String'];
  zip: Scalars['String'];
};

export type Address = {
  __typename?: 'Address';
  addressLine1: Scalars['String'];
  addressLine2?: Maybe<Scalars['String']>;
  city: Scalars['String'];
  region?: Maybe<Scalars['String']>;
  state: Scalars['String'];
  zip: Scalars['String'];
};

export type AddressInput = {
  addressLine1: Scalars['String'];
  addressLine2?: Maybe<Scalars['String']>;
  city: Scalars['String'];
  id?: Maybe<Scalars['Float']>;
  region?: Maybe<Scalars['String']>;
  state: Scalars['String'];
  zip: Scalars['String'];
};

export type AdministrativeDistrict = {
  __typename?: 'AdministrativeDistrict';
  city?: Maybe<Scalars['String']>;
  county?: Maybe<Scalars['String']>;
  id: Scalars['Float'];
  level: AdministrativeDistrictLevel;
  name: Scalars['String'];
  state: Scalars['String'];
};

export enum AdministrativeDistrictLevel {
  City = 'city',
  County = 'county',
  State = 'state',
}

export type AllPermissions = {
  __typename?: 'AllPermissions';
  entries: Array<PolicyEntry>;
  resource: Scalars['String'];
};

export enum AprType {
  Custom = 'CUSTOM',
  Standard = 'STANDARD',
}

export type AvailableResourceLogin = {
  __typename?: 'AvailableResourceLogin';
  hasGradingAccess?: Maybe<Scalars['Boolean']>;
  hasRecyclingAccess?: Maybe<Scalars['Boolean']>;
  id: Scalars['String'];
  image?: Maybe<Scalars['String']>;
  label: Scalars['String'];
  loginUrl: Scalars['String'];
  subLabel?: Maybe<Scalars['String']>;
  targetType: Scalars['String'];
  tenantName?: Maybe<Scalars['String']>;
  updatedAt?: Maybe<Scalars['String']>;
};

export type Balances = {
  __typename?: 'Balances';
  availableCredit: Scalars['Float'];
  balance: Scalars['Float'];
  creditLimit: Scalars['Float'];
  nonInvoicedTotal: Scalars['Float'];
  paymentDue: Scalars['Float'];
  prepaidDeposits: Scalars['Float'];
  prepaidOnAccount: Scalars['Float'];
};

export type BillableLineItemInput = {
  lineItemId: Scalars['Float'];
  materialId?: Maybe<Scalars['Int']>;
};

export type BillableService = {
  __typename?: 'BillableService';
  action: BillableServiceAction;
  active: Scalars['Boolean'];
  businessLineId: Scalars['Float'];
  description: Scalars['String'];
  equipmentItemId: Scalars['Float'];
  id: Scalars['Float'];
  materialBasedPricing: Scalars['Boolean'];
  unit: BillableServiceUnit;
};

export enum BillableServiceAction {
  Dump = 'dump',
  Load = 'load',
}

export type BillableServiceCalculateInput = {
  billableServiceId?: Maybe<Scalars['Float']>;
  equipmentItemId?: Maybe<Scalars['Float']>;
  materialId?: Maybe<Scalars['Int']>;
};

export enum BillableServiceUnit {
  Daily = 'daily',
  Each = 'each',
  Gallon = 'gallon',
  Hourly = 'hourly',
  Mile = 'mile',
  Minute = 'minute',
  Monthly = 'monthly',
  None = 'none',
  Ton = 'ton',
  Weekly = 'weekly',
  Yard = 'yard',
}

export enum BillingCycle {
  Daily = 'DAILY',
  Monthly = 'MONTHLY',
  None = 'NONE',
  Quaterly = 'QUATERLY',
  TwentyEightDays = 'TWENTY_EIGHT_DAYS',
  Weekly = 'WEEKLY',
  Yearly = 'YEARLY',
}

export type BillingJobSite = {
  __typename?: 'BillingJobSite';
  addressLine1: Scalars['String'];
  addressLine2?: Maybe<Scalars['String']>;
  city: Scalars['String'];
  id: Scalars['ID'];
  state: Scalars['String'];
  zip: Scalars['String'];
};

export type Company = {
  __typename?: 'Company';
  businessLineId: Scalars['Float'];
  businessTimeFridayEnd?: Maybe<Scalars['String']>;
  businessTimeFridayStart?: Maybe<Scalars['String']>;
  businessTimeMondayEnd?: Maybe<Scalars['String']>;
  businessTimeMondayStart?: Maybe<Scalars['String']>;
  businessTimeSaturdayEnd?: Maybe<Scalars['String']>;
  businessTimeSaturdayStart?: Maybe<Scalars['String']>;
  businessTimeSundayEnd?: Maybe<Scalars['String']>;
  businessTimeSundayStart?: Maybe<Scalars['String']>;
  businessTimeThursdayEnd?: Maybe<Scalars['String']>;
  businessTimeThursdayStart?: Maybe<Scalars['String']>;
  businessTimeTuesdayEnd?: Maybe<Scalars['String']>;
  businessTimeTuesdayStart?: Maybe<Scalars['String']>;
  businessTimeWednesdayEnd?: Maybe<Scalars['String']>;
  businessTimeWednesdayStart?: Maybe<Scalars['String']>;
  businessUnitId: Scalars['Float'];
  ccGateway?: Maybe<Gateway>;
  companyName1?: Maybe<Scalars['String']>;
  companyName2?: Maybe<Scalars['String']>;
  createdAt: Scalars['DateTime'];
  currency?: Maybe<Currency>;
  documentType?: Maybe<Scalars['String']>;
  email?: Maybe<Scalars['String']>;
  emailBody?: Maybe<Scalars['String']>;
  facilityAddress?: Maybe<Scalars['String']>;
  facilityAddress2?: Maybe<Scalars['String']>;
  facilityCity?: Maybe<Scalars['String']>;
  facilityState?: Maybe<Scalars['String']>;
  facilityZip?: Maybe<Scalars['String']>;
  fax?: Maybe<Scalars['String']>;
  financeAPR?: Maybe<Scalars['Float']>;
  financeMethod?: Maybe<FinanceMethod>;
  firstInvoice?: Maybe<Scalars['String']>;
  id: Scalars['Float'];
  jobSiteId?: Maybe<Scalars['Float']>;
  logoUrl?: Maybe<Scalars['String']>;
  mailingAddress?: Maybe<Scalars['String']>;
  mailingAddress2?: Maybe<Scalars['String']>;
  mailingCity?: Maybe<Scalars['String']>;
  mailingFrom?: Maybe<Scalars['String']>;
  mailingReplyTo?: Maybe<Scalars['String']>;
  mailingSendCopyTo?: Maybe<Scalars['String']>;
  mailingState?: Maybe<Scalars['String']>;
  mailingZip?: Maybe<Scalars['String']>;
  minBalance?: Maybe<Scalars['String']>;
  minFinanceCharge?: Maybe<Scalars['String']>;
  phone?: Maybe<Scalars['String']>;
  printNodeApiKey?: Maybe<Scalars['String']>;
  region?: Maybe<Scalars['String']>;
  requireDestinationOnWeightOut: Scalars['Boolean'];
  requireOriginOfInboundLoads: Scalars['Boolean'];
  subject?: Maybe<Scalars['String']>;
  timezone?: Maybe<Scalars['String']>;
  updatedAt: Scalars['DateTime'];
  website?: Maybe<Scalars['String']>;
  yardInstructions?: Maybe<Scalars['String']>;
};

export type CompanyUpdateInput = {
  id: Scalars['Float'];
  yardInstructions: Scalars['String'];
};

export type ContactPhoneInput = {
  extension?: Maybe<Scalars['String']>;
  number?: Maybe<Scalars['String']>;
  type: ContactPhoneType;
};

export enum ContactPhoneType {
  Cell = 'CELL',
  Fax = 'FAX',
  Home = 'HOME',
  Main = 'MAIN',
  Other = 'OTHER',
  Pager = 'PAGER',
  Work = 'WORK',
}

export type CreditCard = {
  __typename?: 'CreditCard';
  active: Scalars['Boolean'];
  addressLine1?: Maybe<Scalars['String']>;
  addressLine2?: Maybe<Scalars['String']>;
  cardNickname?: Maybe<Scalars['String']>;
  cardNumberLastDigits: Scalars['String'];
  cardType: Scalars['String'];
  ccAccountId: Scalars['Int'];
  ccAccountToken: Scalars['String'];
  city?: Maybe<Scalars['String']>;
  customerId: Scalars['String'];
  expDate?: Maybe<Scalars['String']>;
  expirationDate?: Maybe<Scalars['String']>;
  expiredLabel?: Maybe<Scalars['Boolean']>;
  id: Scalars['ID'];
  isAutopay?: Maybe<Scalars['Boolean']>;
  jobSites?: Maybe<Array<BillingJobSite>>;
  nameOnCard?: Maybe<Scalars['String']>;
  paymentGateway?: Maybe<Scalars['String']>;
  state?: Maybe<Scalars['String']>;
  zip?: Maybe<Scalars['String']>;
};

export type CreditCardFilter = {
  activeOnly?: Maybe<Scalars['Boolean']>;
  customerId?: Maybe<Scalars['Int']>;
  jobSiteId?: Maybe<Scalars['Int']>;
  relevantOnly?: Maybe<Scalars['Boolean']>;
};

export enum Currency {
  Cad = 'CAD',
  Gbp = 'GBP',
  Usd = 'USD',
}

export type CustomerAddress = {
  __typename?: 'CustomerAddress';
  addressLine1?: Maybe<Scalars['String']>;
  addressLine2?: Maybe<Scalars['String']>;
  city?: Maybe<Scalars['String']>;
  state?: Maybe<Scalars['String']>;
  zip?: Maybe<Scalars['String']>;
};

export type CustomerAddressInput = {
  addressLine1?: Maybe<Scalars['String']>;
  addressLine2?: Maybe<Scalars['String']>;
  city?: Maybe<Scalars['String']>;
  state?: Maybe<Scalars['String']>;
  zip?: Maybe<Scalars['String']>;
};

export type CustomerContactInput = {
  active: Scalars['Boolean'];
  email?: Maybe<Scalars['String']>;
  firstName: Scalars['String'];
  isMain: Scalars['Boolean'];
  lastName: Scalars['String'];
  phones?: Maybe<Array<ContactPhoneInput>>;
  title?: Maybe<Scalars['String']>;
};

export type CustomerFilter = {
  activeOnly?: Maybe<Scalars['Boolean']>;
  businessUnitId?: Maybe<Scalars['Float']>;
  customerGroupId?: Maybe<Scalars['Float']>;
  filterByHaulerSrn?: Maybe<Array<Scalars['String']>>;
  filterByOnAccount?: Maybe<Scalars['Boolean']>;
  filterBySelfServiceOrderAllowed?: Maybe<Scalars['Boolean']>;
  filterByState?: Maybe<Array<HaulingCustomerStatus>>;
  limit?: Maybe<Scalars['Float']>;
  query?: Maybe<Scalars['String']>;
  skip?: Maybe<Scalars['Float']>;
  sortBy?: Maybe<Scalars['Float']>;
  sortOrder?: Maybe<Scalars['Float']>;
};

export type CustomerTruck = {
  __typename?: 'CustomerTruck';
  active: Scalars['Boolean'];
  createdAt: Scalars['DateTime'];
  customerId: Scalars['Float'];
  description?: Maybe<Scalars['String']>;
  emptyWeight?: Maybe<Scalars['Float']>;
  emptyWeightSource?: Maybe<Scalars['String']>;
  emptyWeightTimestamp?: Maybe<Scalars['DateTime']>;
  emptyWeightType?: Maybe<MeasurementType>;
  emptyWeightUnit?: Maybe<MeasurementUnit>;
  emptyWeightUser?: Maybe<User>;
  id: Scalars['Float'];
  licensePlate?: Maybe<Scalars['String']>;
  truckNumber: Scalars['String'];
  type: CustomerTruckTypes;
  updatedAt: Scalars['DateTime'];
};

export type CustomerTruckDeleteResult = {
  __typename?: 'CustomerTruckDeleteResult';
  result: Scalars['Boolean'];
};

export type CustomerTruckFilter = {
  active?: Maybe<Scalars['Boolean']>;
  customerId?: Maybe<Scalars['Int']>;
  description?: Maybe<Scalars['String']>;
  search?: Maybe<SearchBodyInput>;
};

export type CustomerTruckForOrderCreate = {
  __typename?: 'CustomerTruckForOrderCreate';
  active: Scalars['Boolean'];
  createdAt: Scalars['DateTime'];
  customerId: Scalars['Float'];
  description?: Maybe<Scalars['String']>;
  emptyWeight?: Maybe<Scalars['Float']>;
  emptyWeightSource?: Maybe<Scalars['String']>;
  emptyWeightTimestamp?: Maybe<Scalars['DateTime']>;
  emptyWeightType?: Maybe<MeasurementType>;
  emptyWeightUnit?: Maybe<MeasurementUnit>;
  emptyWeightUser?: Maybe<User>;
  id: Scalars['Float'];
  isInUse: Scalars['Boolean'];
  licensePlate?: Maybe<Scalars['String']>;
  truckNumber: Scalars['String'];
  type: CustomerTruckTypes;
  updatedAt: Scalars['DateTime'];
};

export type CustomerTruckIndexed = {
  __typename?: 'CustomerTruckIndexed';
  active: Scalars['Boolean'];
  createdAt: Scalars['DateTime'];
  customerId: Scalars['Float'];
  description?: Maybe<Scalars['String']>;
  emptyWeight?: Maybe<Scalars['Float']>;
  emptyWeightSource?: Maybe<Scalars['String']>;
  emptyWeightTimestamp?: Maybe<Scalars['DateTime']>;
  emptyWeightType?: Maybe<MeasurementType>;
  emptyWeightUnit?: Maybe<MeasurementUnit>;
  emptyWeightUser?: Maybe<User>;
  highlight?: Maybe<Scalars['Highlight']>;
  id: Scalars['Float'];
  licensePlate?: Maybe<Scalars['String']>;
  truckNumber: Scalars['String'];
  type: CustomerTruckTypes;
  updatedAt: Scalars['DateTime'];
};

export type CustomerTruckIndexedFilter = {
  activeOnly?: Maybe<Scalars['Boolean']>;
  customerId?: Maybe<Scalars['Float']>;
  search?: Maybe<Scalars['String']>;
};

export type CustomerTruckInput = {
  active: Scalars['Boolean'];
  customerId: Scalars['Int'];
  description?: Maybe<Scalars['String']>;
  emptyWeight?: Maybe<Scalars['Float']>;
  emptyWeightSource?: Maybe<Scalars['String']>;
  emptyWeightTimestamp?: Maybe<Scalars['DateTime']>;
  emptyWeightType?: Maybe<MeasurementType>;
  emptyWeightUnit?: Maybe<MeasurementUnit>;
  emptyWeightUser?: Maybe<Scalars['String']>;
  licensePlate?: Maybe<Scalars['String']>;
  truckNumber: Scalars['String'];
  type: CustomerTruckTypes;
};

export type CustomerTrucksListIndexed = {
  __typename?: 'CustomerTrucksListIndexed';
  data: Array<CustomerTruckIndexed>;
  total: Scalars['Float'];
};

export type CustomerTrucksResponse = {
  __typename?: 'CustomerTrucksResponse';
  data: Array<CustomerTruck>;
  total: Scalars['Float'];
};

export enum CustomerTruckTypes {
  Dumptruck = 'DUMPTRUCK',
  Rolloff = 'ROLLOFF',
  Tractortrailer = 'TRACTORTRAILER',
}

export type CustomerTruckUpdateInput = {
  active: Scalars['Boolean'];
  customerId: Scalars['Int'];
  description?: Maybe<Scalars['String']>;
  emptyWeight?: Maybe<Scalars['Float']>;
  emptyWeightSource?: Maybe<Scalars['String']>;
  emptyWeightTimestamp?: Maybe<Scalars['DateTime']>;
  emptyWeightType?: Maybe<MeasurementType>;
  emptyWeightUnit?: Maybe<MeasurementUnit>;
  emptyWeightUser?: Maybe<Scalars['String']>;
  id: Scalars['Float'];
  licensePlate?: Maybe<Scalars['String']>;
  truckNumber: Scalars['String'];
  type: CustomerTruckTypes;
};

export enum CustomerType {
  Commercial = 'COMMERCIAL',
  Walkup = 'WALKUP',
}

export type CustomerUpdateInput = {
  id: Scalars['Float'];
};

export type DestinationFilter = {
  activeOnly?: Maybe<Scalars['Boolean']>;
};

export type DestinationsResponse = {
  __typename?: 'DestinationsResponse';
  data: Array<HaulingDestination>;
};

export type EditCreditCardInput = {
  active: Scalars['Boolean'];
  addressLine1: Scalars['String'];
  addressLine2?: Maybe<Scalars['String']>;
  cardNickname?: Maybe<Scalars['String']>;
  city: Scalars['String'];
  expirationDate: Scalars['String'];
  jobSites?: Maybe<Array<Maybe<Scalars['ID']>>>;
  nameOnCard: Scalars['String'];
  state: Scalars['String'];
  zip: Scalars['String'];
};

export type Equipment = {
  __typename?: 'Equipment';
  active: Scalars['Boolean'];
  businessLineId: Scalars['Float'];
  closedTop?: Maybe<Scalars['Boolean']>;
  containerTareWeightRequired: Scalars['Boolean'];
  customerOwned?: Maybe<Scalars['Boolean']>;
  description: Scalars['String'];
  emptyWeight?: Maybe<Scalars['Float']>;
  height?: Maybe<Scalars['Float']>;
  id: Scalars['Float'];
  length?: Maybe<Scalars['Float']>;
  shortDescription?: Maybe<Scalars['String']>;
  size?: Maybe<Scalars['Float']>;
  type: EquipmentType;
  width?: Maybe<Scalars['Float']>;
};

export type EquipmentFilterInput = {
  activeOnly?: Maybe<Scalars['Boolean']>;
  businessUnitId?: Maybe<Scalars['Float']>;
  customerGroupId?: Maybe<Scalars['Float']>;
  limit?: Maybe<Scalars['Float']>;
  query?: Maybe<Scalars['String']>;
  skip?: Maybe<Scalars['Float']>;
  sortBy?: Maybe<Scalars['Float']>;
  sortOrder?: Maybe<Scalars['Float']>;
};

export type EquipmentInput = {
  active: Scalars['Boolean'];
  businessLineId: Scalars['Float'];
  closedTop?: Maybe<Scalars['Boolean']>;
  containerTareWeightRequired: Scalars['Boolean'];
  customerOwned?: Maybe<Scalars['Boolean']>;
  description: Scalars['String'];
  emptyWeight?: Maybe<Scalars['Float']>;
  height?: Maybe<Scalars['Float']>;
  length?: Maybe<Scalars['Float']>;
  shortDescription?: Maybe<Scalars['String']>;
  size?: Maybe<Scalars['Float']>;
  type: EquipmentType;
  width?: Maybe<Scalars['Float']>;
};

export type EquipmentsResponse = {
  __typename?: 'EquipmentsResponse';
  data: Array<Equipment>;
};

export enum EquipmentType {
  PortableToilet = 'portableToilet',
  RollOffContainer = 'rollOffContainer',
  Unspecified = 'unspecified',
  WasteContainer = 'wasteContainer',
}

export type EquipmentUpdateInput = {
  active: Scalars['Boolean'];
  businessLineId: Scalars['Float'];
  closedTop?: Maybe<Scalars['Boolean']>;
  containerTareWeightRequired: Scalars['Boolean'];
  customerOwned?: Maybe<Scalars['Boolean']>;
  description: Scalars['String'];
  emptyWeight?: Maybe<Scalars['Float']>;
  height?: Maybe<Scalars['Float']>;
  id: Scalars['Float'];
  length?: Maybe<Scalars['Float']>;
  shortDescription?: Maybe<Scalars['String']>;
  size?: Maybe<Scalars['Float']>;
  type: EquipmentType;
  width?: Maybe<Scalars['Float']>;
};

export type FileDeleteResult = {
  __typename?: 'FileDeleteResult';
  result: Scalars['String'];
};

export enum FinanceMethod {
  Days = 'days',
  Periods = 'periods',
}

export enum Gateway {
  CardConnect = 'CardConnect',
}

export type GradingPayloadInput = {
  images?: Maybe<Array<OrderImageInput>>;
  materialsDistribution: Array<OrderMaterialDistributionInput>;
  miscellaneousMaterialsDistribution: Array<OrderMiscellaneousMaterialDistributionInput>;
  orderId: Scalars['Float'];
};

export type HaulingBillableItem = {
  __typename?: 'HaulingBillableItem';
  active: Scalars['Boolean'];
  businessLineId: Scalars['Float'];
  description: Scalars['String'];
  id: Scalars['Float'];
  materialBasedPricing: Scalars['Boolean'];
  materialIds?: Maybe<Array<Scalars['Float']>>;
  materials?: Maybe<Array<HaulingMaterial>>;
  originalId: Scalars['Float'];
  type: HaulingBillableItemType;
  unit: HaulingBillableItemUnit;
};

export type HaulingBillableItemFilterInput = {
  active: Scalars['Boolean'];
  types: Array<HaulingBillableItemType>;
};

export enum HaulingBillableItemType {
  Line = 'LINE',
  Miscellanies = 'MISCELLANIES',
}

export enum HaulingBillableItemUnit {
  Day = 'DAY',
  Each = 'EACH',
  Gallon = 'GALLON',
  Hour = 'HOUR',
  Mile = 'MILE',
  Min = 'MIN',
  Month = 'MONTH',
  None = 'NONE',
  Order = 'ORDER',
  Ton = 'TON',
  Week = 'WEEK',
  Yard = 'YARD',
}

export type HaulingCalculateRatesInput = {
  billableLineItems?: Maybe<Array<BillableLineItemInput>>;
  billableService?: Maybe<BillableServiceCalculateInput>;
  customRatesGroupId?: Maybe<Scalars['Float']>;
  type: HaulingPriceGroupsResultLevel;
};

export type HaulingCalculateRatesResult = {
  __typename?: 'HaulingCalculateRatesResult';
  customRates?: Maybe<HaulingCustomRates>;
  globalRates?: Maybe<HaulingGlobalRates>;
};

export type HaulingCompanyGeneralSettings = {
  __typename?: 'HaulingCompanyGeneralSettings';
  clockIn: Scalars['Boolean'];
  id: Scalars['Float'];
  timeZoneName: Scalars['String'];
  unit: HaulingMeasurementUnit;
};

export type HaulingCustomer = {
  __typename?: 'HaulingCustomer';
  active: Scalars['Boolean'];
  addFinanceCharges: Scalars['Boolean'];
  alternateId: Scalars['String'];
  aprType: Scalars['String'];
  attachMediaPref: Scalars['Boolean'];
  attachTicketPref: Scalars['Boolean'];
  balances?: Maybe<Balances>;
  billingAddress: CustomerAddress;
  billingCycle?: Maybe<BillingCycle>;
  businessName?: Maybe<Scalars['String']>;
  canTareWeightRequired?: Maybe<Scalars['Boolean']>;
  commercial?: Maybe<Scalars['Boolean']>;
  creditLimit: Scalars['Float'];
  customerGroupId: Scalars['Float'];
  email: Scalars['String'];
  financeCharge?: Maybe<Scalars['Float']>;
  firstName: Scalars['String'];
  generalNote: Scalars['String'];
  gradingNotification?: Maybe<Scalars['Boolean']>;
  gradingRequired?: Maybe<Scalars['Boolean']>;
  haulerSrn?: Maybe<Scalars['String']>;
  id: Scalars['Float'];
  invoiceConstruction: Scalars['String'];
  invoiceEmails?: Maybe<Array<Scalars['String']>>;
  jobSiteRequired?: Maybe<Scalars['Boolean']>;
  lastName: Scalars['String'];
  mailingAddress: CustomerAddress;
  mainEmail: Scalars['String'];
  mainFirstName: Scalars['String'];
  mainJobTitle: Scalars['String'];
  mainLastName: Scalars['String'];
  mainPhoneNumbers: Array<HaulingPhone>;
  notificationEmails?: Maybe<Array<Scalars['String']>>;
  onAccount?: Maybe<Scalars['Boolean']>;
  onHold: Scalars['Boolean'];
  paymentTerms: Scalars['String'];
  phoneNumbers: Array<HaulingPhone>;
  popupNote?: Maybe<Scalars['String']>;
  poRequired?: Maybe<Scalars['Boolean']>;
  saleRepresentative?: Maybe<User>;
  saleRepresentativeId?: Maybe<Scalars['String']>;
  salesId: Scalars['String'];
  selfServiceOrderAllowed?: Maybe<Scalars['Boolean']>;
  sendInvoicesByEmail: Scalars['Boolean'];
  sendInvoicesByPost: Scalars['Boolean'];
  signatureRequired: Scalars['Boolean'];
  statementEmails?: Maybe<Array<Scalars['String']>>;
  status: HaulingCustomerStatus;
  type: CustomerType;
  walkup: Scalars['Boolean'];
  workOrderRequired?: Maybe<Scalars['Boolean']>;
};

export type HaulingCustomerGroup = {
  __typename?: 'HaulingCustomerGroup';
  active: Scalars['Boolean'];
  description: Scalars['String'];
  id: Scalars['Float'];
  type: HaulingCustomerGroupType;
};

export type HaulingCustomerGroupFilter = {
  activeOnly?: Maybe<Scalars['Boolean']>;
  type?: Maybe<HaulingCustomerGroupType>;
};

export enum HaulingCustomerGroupType {
  Commercial = 'COMMERCIAL',
  NonCommercial = 'NON_COMMERCIAL',
  Walkup = 'WALKUP',
}

export type HaulingCustomerInput = {
  active: Scalars['Boolean'];
  addFinancialCharges: Scalars['Boolean'];
  allowSelfServiceOrders: Scalars['Boolean'];
  alternateID?: Maybe<Scalars['String']>;
  apr?: Maybe<AprType>;
  aprCharge?: Maybe<Scalars['Float']>;
  billingAddress: CustomerAddressInput;
  billingCycle?: Maybe<BillingCycle>;
  billingSameAsMailing: Scalars['Boolean'];
  businessName: Scalars['String'];
  creditLimit?: Maybe<Scalars['Float']>;
  email?: Maybe<Scalars['String']>;
  emailForInvoices?: Maybe<Scalars['String']>;
  generalNotes?: Maybe<Scalars['String']>;
  gradingNotification: Scalars['Boolean'];
  groupId: Scalars['Float'];
  haulerSrn?: Maybe<Scalars['String']>;
  invoiceConstruction?: Maybe<InvoiceConstruction>;
  mailingAddress: CustomerAddressInput;
  mainContact: CustomerContactInput;
  onAccount: Scalars['Boolean'];
  paymentTerm?: Maybe<PaymentTerm>;
  phones?: Maybe<Array<ContactPhoneInput>>;
  popupNotes?: Maybe<Scalars['String']>;
  requireCanTareWeight: Scalars['Boolean'];
  requireGrading: Scalars['Boolean'];
  requireJobSite: Scalars['Boolean'];
  requirePONumber: Scalars['Boolean'];
  requireWONumber: Scalars['Boolean'];
  saleRepresentativeId?: Maybe<Scalars['String']>;
  sendInvoiceByEmail: Scalars['Boolean'];
  sendInvoiceByPost: Scalars['Boolean'];
};

export type HaulingCustomerJobSite = {
  __typename?: 'HaulingCustomerJobSite';
  active: Scalars['Boolean'];
  address: CustomerAddress;
  contactId?: Maybe<Scalars['Float']>;
  fullAddress: Scalars['String'];
  id: Scalars['Float'];
  jobSite: HaulingJobSite;
  location: Scalars['Point'];
  originalId?: Maybe<Scalars['Float']>;
  popupNote?: Maybe<Scalars['String']>;
  poRequired?: Maybe<Scalars['Boolean']>;
};

export type HaulingCustomerJobSiteFilterInput = {
  activeOnly?: Maybe<Scalars['Boolean']>;
  businessUnitId?: Maybe<Scalars['Float']>;
  customerGroupId?: Maybe<Scalars['Float']>;
  customerId: Scalars['Float'];
  limit?: Maybe<Scalars['Float']>;
  query?: Maybe<Scalars['String']>;
  skip?: Maybe<Scalars['Float']>;
  sortBy?: Maybe<Scalars['Float']>;
  sortOrder?: Maybe<Scalars['Float']>;
};

export type HaulingCustomerJobSiteInput = {
  active?: Maybe<Scalars['Boolean']>;
  customerId: Scalars['Float'];
  jobSiteId: Scalars['Float'];
  PONumberRequired?: Maybe<Scalars['Boolean']>;
  popupNote?: Maybe<Scalars['String']>;
  poRequired?: Maybe<Scalars['Boolean']>;
};

export type HaulingCustomerJobSitePairByIdFilterInput = {
  customerId: Scalars['Float'];
  jobSiteId: Scalars['Float'];
};

export type HaulingCustomerJobSitePairFilterInput = {
  customerId: Scalars['Float'];
  jobSiteId: Scalars['Float'];
};

export type HaulingCustomersResponse = {
  __typename?: 'HaulingCustomersResponse';
  data: Array<HaulingCustomer>;
};

export enum HaulingCustomerStatus {
  Active = 'active',
  OnHold = 'onHold',
}

export type HaulingCustomRates = {
  __typename?: 'HaulingCustomRates';
  customRatesLineItems?: Maybe<Array<HaulingRatesLineItemResult>>;
  customRatesService?: Maybe<HaulingRatesServiceResult>;
};

export type HaulingDestination = {
  __typename?: 'HaulingDestination';
  active: Scalars['Boolean'];
  addressLine1: Scalars['String'];
  addressLine2?: Maybe<Scalars['String']>;
  businessUnitId: Scalars['String'];
  city: Scalars['String'];
  description: Scalars['String'];
  geojson?: Maybe<Scalars['Feature']>;
  id: Scalars['Float'];
  state: Scalars['String'];
  zip: Scalars['String'];
};

export type HaulingDestinationInput = {
  active: Scalars['Boolean'];
  addressLine1: Scalars['String'];
  addressLine2?: Maybe<Scalars['String']>;
  businessUnitId?: Maybe<Scalars['Float']>;
  city: Scalars['String'];
  description: Scalars['String'];
  geojson?: Maybe<Scalars['Feature']>;
  state: Scalars['String'];
  zip: Scalars['String'];
};

export type HaulingDestinationUpdateInput = {
  active: Scalars['Boolean'];
  addressLine1: Scalars['String'];
  addressLine2?: Maybe<Scalars['String']>;
  businessUnitId?: Maybe<Scalars['Float']>;
  city: Scalars['String'];
  description: Scalars['String'];
  geojson?: Maybe<Scalars['Feature']>;
  id: Scalars['Float'];
  state: Scalars['String'];
  zip: Scalars['String'];
};

export type HaulingDriver = {
  __typename?: 'HaulingDriver';
  active: Scalars['Boolean'];
  businessUnits: Array<HaulingDriverBu>;
  description: Scalars['String'];
  email: Scalars['String'];
  id: Scalars['Int'];
  licenseNumber: Scalars['String'];
  licenseType: Scalars['String'];
  phone?: Maybe<Scalars['String']>;
  photoUrl?: Maybe<Scalars['String']>;
  truckId: Scalars['Int'];
};

export type HaulingDriverBu = {
  __typename?: 'HaulingDriverBU';
  id: Scalars['Int'];
  name: Scalars['String'];
};

export type HaulingGlobalRates = {
  __typename?: 'HaulingGlobalRates';
  globalRatesLineItems?: Maybe<Array<HaulingRatesLineItemResult>>;
  globalRatesService: HaulingRatesServiceResult;
};

export type HaulingJobSite = {
  __typename?: 'HaulingJobSite';
  address: HaulingJobSiteAddress;
  alleyPlacement: Scalars['Boolean'];
  cabOver: Scalars['Boolean'];
  fullAddress?: Maybe<Scalars['String']>;
  id: Scalars['Float'];
  location: Scalars['Geometry'];
  popupNote?: Maybe<Scalars['String']>;
};

export type HaulingJobSiteAddress = {
  __typename?: 'HaulingJobSiteAddress';
  addressLine1: Scalars['String'];
  addressLine2?: Maybe<Scalars['String']>;
  city: Scalars['String'];
  region?: Maybe<Scalars['String']>;
  state: Scalars['String'];
  zip: Scalars['String'];
};

export type HaulingJobSiteAddressInput = {
  addressLine1: Scalars['String'];
  addressLine2?: Maybe<Scalars['String']>;
  city: Scalars['String'];
  region: Scalars['String'];
  state: Scalars['String'];
  zip: Scalars['String'];
};

export type HaulingJobSiteInput = {
  address: HaulingJobSiteAddressInput;
  alleyPlacement: Scalars['Boolean'];
  cabOver: Scalars['Boolean'];
  location: Scalars['Geometry'];
};

export type HaulingJobSitesResponse = {
  __typename?: 'haulingJobSitesResponse';
  data: Array<HaulingJobSite>;
};

export type HaulingJobSiteUpdateInput = {
  address: HaulingJobSiteAddressInput;
  alleyPlacement: Scalars['Boolean'];
  cabOver: Scalars['Boolean'];
  id: Scalars['Float'];
  location: Scalars['Geometry'];
};

export type HaulingMaterial = {
  __typename?: 'HaulingMaterial';
  active: Scalars['Boolean'];
  code?: Maybe<Scalars['String']>;
  description: Scalars['String'];
  id: Scalars['Float'];
  misc: Scalars['Boolean'];
  originalId: Scalars['Float'];
  recycle: Scalars['Boolean'];
  units?: Maybe<Scalars['String']>;
  useForDump: Scalars['Boolean'];
  useForLoad: Scalars['Boolean'];
  yard: Scalars['Boolean'];
};

export type HaulingMaterialFilterInput = {
  activeOnly?: Maybe<Scalars['Boolean']>;
  businessUnitId?: Maybe<Scalars['Float']>;
  customerGroupId?: Maybe<Scalars['Float']>;
  equipmentItems: Scalars['Boolean'];
  limit?: Maybe<Scalars['Float']>;
  query?: Maybe<Scalars['String']>;
  skip?: Maybe<Scalars['Float']>;
  sortBy?: Maybe<Scalars['Float']>;
  sortOrder?: Maybe<Scalars['Float']>;
  useForDump?: Maybe<Scalars['Boolean']>;
  useForLoad?: Maybe<Scalars['Boolean']>;
};

export type HaulingMaterialInput = {
  active: Scalars['Boolean'];
  code?: Maybe<Scalars['String']>;
  description: Scalars['String'];
  misc: Scalars['Boolean'];
  recycle: Scalars['Boolean'];
  useForDump: Scalars['Boolean'];
  useForLoad: Scalars['Boolean'];
  useForYard: Scalars['Boolean'];
};

export type HaulingMaterialsResponse = {
  __typename?: 'HaulingMaterialsResponse';
  data: Array<HaulingMaterial>;
};

export type HaulingMaterialUpdateInput = {
  active: Scalars['Boolean'];
  code?: Maybe<Scalars['String']>;
  description: Scalars['String'];
  id: Scalars['Float'];
  misc: Scalars['Boolean'];
  recycle: Scalars['Boolean'];
  useForDump: Scalars['Boolean'];
  useForLoad: Scalars['Boolean'];
  useForYard: Scalars['Boolean'];
};

export enum HaulingMeasurementUnit {
  Imperial = 'imperial',
  Metric = 'metric',
  Us = 'us',
}

export type HaulingOrigin = {
  __typename?: 'HaulingOrigin';
  active: Scalars['Boolean'];
  businessUnitId: Scalars['String'];
  description: Scalars['String'];
  id: Scalars['Float'];
  originDistricts: Array<HaulingOriginDistrict>;
};

export type HaulingOriginDistrict = {
  __typename?: 'HaulingOriginDistrict';
  city?: Maybe<Scalars['String']>;
  county?: Maybe<Scalars['String']>;
  id: Scalars['Float'];
  originId: Scalars['Float'];
  state: Scalars['String'];
  taxDistrictId?: Maybe<Scalars['Int']>;
};

export type HaulingOriginDistrictInput = {
  city?: Maybe<Scalars['String']>;
  county?: Maybe<Scalars['String']>;
  state: Scalars['String'];
  taxDistrictId?: Maybe<Scalars['Int']>;
};

export type HaulingPhone = {
  __typename?: 'HaulingPhone';
  extension?: Maybe<Scalars['String']>;
  number?: Maybe<Scalars['String']>;
  textOnly: Scalars['Boolean'];
  type: HaulingPhoneType;
};

export enum HaulingPhoneType {
  Cell = 'CELL',
  Fax = 'FAX',
  Home = 'HOME',
  Main = 'MAIN',
  Other = 'OTHER',
  Pager = 'PAGER',
  Work = 'WORK',
}

export type HaulingPriceGroup = {
  __typename?: 'HaulingPriceGroup';
  description: Scalars['String'];
  id: Scalars['Float'];
};

export type HaulingPriceGroupFilterInput = {
  customerId: Scalars['Float'];
  customerJobSiteId?: Maybe<Scalars['Int']>;
};

export type HaulingPriceGroupsResult = {
  __typename?: 'HaulingPriceGroupsResult';
  customRatesGroups?: Maybe<Array<HaulingPriceGroup>>;
  level: HaulingPriceGroupsResultLevel;
  selectedId?: Maybe<Scalars['Float']>;
};

export enum HaulingPriceGroupsResultLevel {
  Custom = 'custom',
  Global = 'global',
}

export type HaulingProject = {
  __typename?: 'HaulingProject';
  customerJobSiteId: Scalars['Float'];
  description: Scalars['String'];
  endDate?: Maybe<Scalars['String']>;
  id: Scalars['Float'];
  originalId: Scalars['Float'];
  permitRequired: Scalars['Boolean'];
  poRequired: Scalars['Boolean'];
  startDate?: Maybe<Scalars['String']>;
};

export type HaulingProjectFilter = {
  customerJobSiteId?: Maybe<Scalars['Int']>;
};

export type HaulingRatesLineItemResult = {
  __typename?: 'HaulingRatesLineItemResult';
  id: Scalars['Float'];
  lineItemId: Scalars['Float'];
  materialId?: Maybe<Scalars['Int']>;
  price: Scalars['Float'];
};

export type HaulingRatesServiceResult = {
  __typename?: 'HaulingRatesServiceResult';
  id: Scalars['Float'];
  price: Scalars['Float'];
};

export type HaulingServiceDaysAndHours = {
  __typename?: 'HaulingServiceDaysAndHours';
  businessUnitId: Scalars['Float'];
  dayOfWeek: Scalars['Float'];
  endTime?: Maybe<Scalars['String']>;
  id: Scalars['Float'];
  startTime?: Maybe<Scalars['String']>;
};

export type HaulingServiceDaysAndHoursFilter = {
  businessUnitId?: Maybe<Scalars['Float']>;
  dayOfWeek?: Maybe<Scalars['Float']>;
  endTime?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['Float']>;
  startTime?: Maybe<Scalars['String']>;
};

export type HaulingServiceDaysAndHoursInput = {
  businessUnitId?: Maybe<Scalars['Float']>;
  dayOfWeek?: Maybe<Scalars['Float']>;
  endTime?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['Float']>;
  startTime?: Maybe<Scalars['String']>;
};

export type HaulingServiceDaysAndHoursUpdateInput = {
  businessUnitId?: Maybe<Scalars['Float']>;
  dayOfWeek?: Maybe<Scalars['Float']>;
  endTime?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['Float']>;
  startTime?: Maybe<Scalars['String']>;
};

export type HaulingTaxDistrict = {
  __typename?: 'HaulingTaxDistrict';
  active: Scalars['Boolean'];
  bbox?: Maybe<Array<Scalars['Float']>>;
  businessConfiguration?: Maybe<Array<TaxBusinessConfiguration>>;
  businessLineTaxesIds?: Maybe<Array<Scalars['Float']>>;
  createdAt: Scalars['String'];
  description: Scalars['String'];
  districtCode?: Maybe<Scalars['String']>;
  districtName?: Maybe<Scalars['String']>;
  districtType: TaxDistrictType;
  id: Scalars['Float'];
  includeNationalInTaxableAmount: Scalars['Boolean'];
  taxDescription?: Maybe<Scalars['String']>;
  taxesPerCustomerType: Scalars['Boolean'];
  updatedAt: Scalars['String'];
  useGeneratedDescription: Scalars['Boolean'];
  userId: Scalars['String'];
};

export enum InvoiceConstruction {
  ByAddress = 'BY_ADDRESS',
  ByCustomer = 'BY_CUSTOMER',
  ByOrder = 'BY_ORDER',
}

export type JobSiteFilter = {
  active?: Maybe<Scalars['Boolean']>;
};

export type JobSiteInput = {
  active?: Maybe<Scalars['Boolean']>;
  city: Scalars['String'];
  county?: Maybe<Scalars['String']>;
  customerId: Scalars['Float'];
  geojson: Scalars['Feature'];
  lineAddress1: Scalars['String'];
  lineAddress2: Scalars['String'];
  state: Scalars['String'];
  zip: Scalars['String'];
};

export type LineItemExclusions = {
  __typename?: 'LineItemExclusions';
  lineItems: Array<Scalars['Float']>;
  thresholds: Array<Scalars['Float']>;
};

export type LineItemTax = {
  __typename?: 'LineItemTax';
  application?: Maybe<TaxApplication>;
  calculation: TaxCalculation;
  exclusions?: Maybe<LineItemExclusions>;
  group: Scalars['Boolean'];
  nonGroup?: Maybe<NonGroupLineItemTaxValue>;
  value?: Maybe<Scalars['String']>;
};

export type ListPermissionsResult = {
  __typename?: 'ListPermissionsResult';
  data: Array<Permission>;
  total: Scalars['Float'];
};

export type ListResourcesResult = {
  __typename?: 'ListResourcesResult';
  data: Array<Resource>;
  total: Scalars['Float'];
};

export type ListRolesResult = {
  __typename?: 'ListRolesResult';
  data: Array<Role>;
  total: Scalars['Float'];
};

export type ListUsersResult = {
  __typename?: 'ListUsersResult';
  data: Array<User>;
  total: Scalars['Float'];
};

/** User information associated with provided access token */
export type Me = {
  __typename?: 'Me';
  email?: Maybe<Scalars['String']>;
  firstName?: Maybe<Scalars['String']>;
  id: Scalars['String'];
  lastName?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  permissions: Array<Scalars['String']>;
  resource?: Maybe<Scalars['String']>;
  tenantId?: Maybe<Scalars['ID']>;
  tenantName?: Maybe<Scalars['String']>;
};

export enum MeasurementType {
  Hardware = 'HARDWARE',
  Manual = 'MANUAL',
}

export enum MeasurementUnit {
  Gram = 'GRAM',
  Kilogram = 'KILOGRAM',
  Ton = 'TON',
}

export type Mutation = {
  __typename?: 'Mutation';
  approveOrders: Scalars['Boolean'];
  bulkRemoveOrder: Scalars['Boolean'];
  calculateHaulingRates?: Maybe<HaulingCalculateRatesResult>;
  /** Complete walkup customer order */
  completeWalkUpCustomerOrder?: Maybe<Scalars['Boolean']>;
  createAutoOrderBillableItems?: Maybe<Array<OrderBillableItem>>;
  createCreditCard?: Maybe<CreditCard>;
  createCustomerTruck?: Maybe<CustomerTruck>;
  createDestination?: Maybe<HaulingDestination>;
  createEquipment?: Maybe<Equipment>;
  createHaulingCustomer: HaulingCustomer;
  createHaulingCustomerJS: HaulingCustomerJobSite;
  createHaulingJobSiteOnCore?: Maybe<HaulingJobSite>;
  createHaulingMaterial?: Maybe<HaulingMaterial>;
  createHaulingProject?: Maybe<HaulingProject>;
  createOrder?: Maybe<Order>;
  createOrderBillableItems?: Maybe<Array<OrderBillableItem>>;
  createOrigin?: Maybe<HaulingOrigin>;
  createPermission: Permission;
  createResource: Resource;
  createRole: Role;
  createScale?: Maybe<Scale>;
  createServiceDaysAndHour?: Maybe<HaulingServiceDaysAndHours>;
  createUser: User;
  createhaulingJobSite?: Maybe<HaulingJobSite>;
  deleteCustomerTruck: CustomerTruckDeleteResult;
  deleteFile: FileDeleteResult;
  deleteOrder: OrderDeleteResult;
  deletePermission: PermissionDeleteResult;
  deleteResource: ResourceDeleteResult;
  deleteRole: Scalars['Boolean'];
  deleteScale: ScaleDeleteResult;
  deleteUser: Scalars['Boolean'];
  fillOrderBillableItemsWithPrices?: Maybe<Array<OrderBillableItem>>;
  finalizeOrders: Scalars['Boolean'];
  gradingOrder: Scalars['Boolean'];
  /** log out current user. clear user related local state */
  logOut?: Maybe<Scalars['Boolean']>;
  /** Change order status to APPROVED */
  makeOrderApproved?: Maybe<Scalars['Boolean']>;
  /** Change order status to COMPLETED */
  makeOrderCompleted?: Maybe<Scalars['Boolean']>;
  /** Change order status to FINALIZED */
  makeOrderFinalized?: Maybe<Scalars['Boolean']>;
  /** Change order status to IN_YARD */
  makeOrderInYard: Scalars['Boolean'];
  /** Change order status to INVOICED */
  makeOrderInvoiced: Scalars['Boolean'];
  /** Change order status to LOAD */
  makeOrderLoaded: Scalars['Boolean'];
  /** Change order status to PAYMENT */
  makeOrderPayment?: Maybe<Scalars['Boolean']>;
  /** Change order status to WEIGHT_OUT */
  makeOrderWeightOut: Scalars['Boolean'];
  recoverCustomerTruck: CustomerTruck;
  recoverOrder: Order;
  recoverScale: Scale;
  /** Send pdf weight ticket via email */
  sendPdfWeightTicketViaEmail: Scalars['Boolean'];
  /** send populateElasticSearchIndex event to recycling:populate-elastic-search-index in Recycling */
  sendPopulateElasticSearchIndexInRecycling: Scalars['Boolean'];
  /** send populateEntity event to recycling:populate-entity in Recycling */
  sendPopulateEntityInRecycling: Scalars['Boolean'];
  setCompanyYardInstructions: Company;
  /** store token in local state */
  setUserInfo?: Maybe<Scalars['Boolean']>;
  updateCompany: Company;
  updateCreditCard?: Maybe<CreditCard>;
  updateCustomerTruck: CustomerTruck;
  updateDestination?: Maybe<HaulingDestination>;
  updateEquipment?: Maybe<Equipment>;
  updateHaulingCustomer?: Maybe<HaulingCustomer>;
  updateHaulingMaterial?: Maybe<HaulingMaterial>;
  updateOrder: Order;
  updateOrigin?: Maybe<HaulingOrigin>;
  updatePermission: Permission;
  updateResource: Resource;
  updateRole: Role;
  updateScale: Scale;
  updateServiceDaysAndHour?: Maybe<HaulingServiceDaysAndHours>;
  updateUser: User;
  updatehaulingJobSite?: Maybe<HaulingJobSite>;
  uploadFile: UploadFileResponse;
};

export type MutationApproveOrdersArgs = {
  ids?: Maybe<Array<Scalars['Int']>>;
};

export type MutationBulkRemoveOrderArgs = {
  ids: Array<Scalars['Int']>;
};

export type MutationCalculateHaulingRatesArgs = {
  input: HaulingCalculateRatesInput;
};

export type MutationCompleteWalkUpCustomerOrderArgs = {
  id: Scalars['Int'];
};

export type MutationCreateAutoOrderBillableItemsArgs = {
  billableItemsIds: Array<Scalars['Int']>;
  distributionMaterials: Array<Scalars['Int']>;
  materialId?: Maybe<Scalars['Int']>;
  priceGroupId: Scalars['Int'];
  type: OrderType;
};

export type MutationCreateCreditCardArgs = {
  customerId: Scalars['Int'];
  data: AddCreditCardInput;
};

export type MutationCreateCustomerTruckArgs = {
  data: CustomerTruckInput;
  filter?: Maybe<CustomerTruckFilter>;
};

export type MutationCreateDestinationArgs = {
  data: HaulingDestinationInput;
};

export type MutationCreateEquipmentArgs = {
  data: EquipmentInput;
};

export type MutationCreateHaulingCustomerArgs = {
  data: HaulingCustomerInput;
};

export type MutationCreateHaulingCustomerJsArgs = {
  data: HaulingCustomerJobSiteInput;
};

export type MutationCreateHaulingJobSiteOnCoreArgs = {
  data: JobSiteInput;
};

export type MutationCreateHaulingMaterialArgs = {
  data: HaulingMaterialInput;
};

export type MutationCreateHaulingProjectArgs = {
  input: ProjectInput;
};

export type MutationCreateOrderArgs = {
  data: OrderInput;
  filter?: Maybe<OrderFilterInput>;
};

export type MutationCreateOrderBillableItemsArgs = {
  billableItemsIds: Array<Scalars['Int']>;
  materialId?: Maybe<Scalars['Int']>;
  priceGroupId: Scalars['Int'];
  type: OrderType;
};

export type MutationCreateOriginArgs = {
  data: OriginInput;
};

export type MutationCreatePermissionArgs = {
  data: PermissionInput;
};

export type MutationCreateResourceArgs = {
  data: ResourceInput;
};

export type MutationCreateRoleArgs = {
  roleData: RoleInput;
};

export type MutationCreateScaleArgs = {
  data: ScaleInput;
  filter?: Maybe<ScaleFilterInput>;
};

export type MutationCreateServiceDaysAndHourArgs = {
  data: HaulingServiceDaysAndHoursInput;
};

export type MutationCreateUserArgs = {
  userData: UserCreateInput;
};

export type MutationCreatehaulingJobSiteArgs = {
  data: HaulingJobSiteInput;
};

export type MutationDeleteCustomerTruckArgs = {
  filter?: Maybe<CustomerTruckFilter>;
  id: Scalars['Int'];
};

export type MutationDeleteFileArgs = {
  fileUrl: Scalars['String'];
};

export type MutationDeleteOrderArgs = {
  filter?: Maybe<OrderFilterInput>;
  id: Scalars['Int'];
};

export type MutationDeletePermissionArgs = {
  id: Scalars['String'];
};

export type MutationDeleteResourceArgs = {
  srn: Scalars['String'];
};

export type MutationDeleteRoleArgs = {
  id: Scalars['String'];
};

export type MutationDeleteScaleArgs = {
  filter?: Maybe<ScaleFilterInput>;
  id: Scalars['Int'];
};

export type MutationDeleteUserArgs = {
  id: Scalars['String'];
};

export type MutationFillOrderBillableItemsWithPricesArgs = {
  materialId?: Maybe<Scalars['Int']>;
  orderBillableItems: Array<OrderBillableItemInput>;
  priceGroupId: Scalars['Int'];
  type: OrderType;
};

export type MutationFinalizeOrdersArgs = {
  ids?: Maybe<Array<Scalars['Int']>>;
};

export type MutationGradingOrderArgs = {
  gradingPayload: GradingPayloadInput;
};

export type MutationMakeOrderApprovedArgs = {
  data?: Maybe<OrderApprovedRequestInput>;
  id: Scalars['Int'];
};

export type MutationMakeOrderCompletedArgs = {
  data?: Maybe<OrderCompletedRequestInput>;
  id: Scalars['Int'];
};

export type MutationMakeOrderFinalizedArgs = {
  id: Scalars['Int'];
};

export type MutationMakeOrderInYardArgs = {
  id: Scalars['Int'];
};

export type MutationMakeOrderInvoicedArgs = {
  id: Scalars['Int'];
};

export type MutationMakeOrderLoadedArgs = {
  id: Scalars['Int'];
};

export type MutationMakeOrderPaymentArgs = {
  id: Scalars['Int'];
};

export type MutationMakeOrderWeightOutArgs = {
  id: Scalars['Int'];
};

export type MutationRecoverCustomerTruckArgs = {
  filter?: Maybe<CustomerTruckFilter>;
  id?: Maybe<Scalars['Int']>;
};

export type MutationRecoverOrderArgs = {
  filter?: Maybe<OrderFilterInput>;
  id?: Maybe<Scalars['Int']>;
};

export type MutationRecoverScaleArgs = {
  filter?: Maybe<ScaleFilterInput>;
  id?: Maybe<Scalars['Int']>;
};

export type MutationSendPdfWeightTicketViaEmailArgs = {
  email: Scalars['String'];
  id: Scalars['Int'];
};

export type MutationSendPopulateEntityInRecyclingArgs = {
  populateEvent: PopulateEntityEvent;
};

export type MutationSetCompanyYardInstructionsArgs = {
  yardInstructions: Scalars['String'];
};

export type MutationSetUserInfoArgs = {
  userInfo: UserInfoInput;
};

export type MutationUpdateCompanyArgs = {
  data: CompanyUpdateInput;
};

export type MutationUpdateCreditCardArgs = {
  data: EditCreditCardInput;
  id: Scalars['ID'];
};

export type MutationUpdateCustomerTruckArgs = {
  data: CustomerTruckUpdateInput;
  filter?: Maybe<CustomerTruckFilter>;
};

export type MutationUpdateDestinationArgs = {
  data: HaulingDestinationUpdateInput;
};

export type MutationUpdateEquipmentArgs = {
  data: EquipmentUpdateInput;
};

export type MutationUpdateHaulingCustomerArgs = {
  data: CustomerUpdateInput;
};

export type MutationUpdateHaulingMaterialArgs = {
  data: HaulingMaterialUpdateInput;
};

export type MutationUpdateOrderArgs = {
  data: OrderUpdateInput;
  filter?: Maybe<OrderFilterInput>;
};

export type MutationUpdateOriginArgs = {
  data: OriginUpdateInput;
};

export type MutationUpdatePermissionArgs = {
  data: PermissionUpdateInput;
};

export type MutationUpdateResourceArgs = {
  data: ResourceUpdateInput;
};

export type MutationUpdateRoleArgs = {
  id: Scalars['String'];
  roleData: RoleInput;
};

export type MutationUpdateScaleArgs = {
  data: ScaleUpdateInput;
  filter?: Maybe<ScaleFilterInput>;
};

export type MutationUpdateServiceDaysAndHourArgs = {
  data: HaulingServiceDaysAndHoursUpdateInput;
};

export type MutationUpdateUserArgs = {
  id: Scalars['String'];
  userData: UserUpdateInput;
};

export type MutationUpdatehaulingJobSiteArgs = {
  data: HaulingJobSiteUpdateInput;
};

export type MutationUploadFileArgs = {
  file: Scalars['Upload'];
  pathEntries?: Maybe<Array<Scalars['String']>>;
};

export type NonGroupLineItemTaxValue = {
  __typename?: 'NonGroupLineItemTaxValue';
  lineItems: Array<NonGroupTaxValue>;
  thresholds: Array<NonGroupTaxValue>;
};

export type NonGroupTaxValue = {
  __typename?: 'NonGroupTaxValue';
  id: Scalars['Float'];
  value: Scalars['String'];
};

export type OnTheWayNumber = {
  __typename?: 'OnTheWayNumber';
  customerBusinessName: Scalars['String'];
  WONumber: Scalars['String'];
};

export type Order = {
  __typename?: 'Order';
  amount: Scalars['Float'];
  arrivedAt?: Maybe<Scalars['DateTime']>;
  beforeTaxesTotal: Scalars['Float'];
  billableItems: Array<OrderBillableItem>;
  billableService?: Maybe<BillableService>;
  bypassScale: Scalars['Boolean'];
  canTare?: Maybe<Scalars['Float']>;
  checkNumber?: Maybe<Scalars['String']>;
  container?: Maybe<Equipment>;
  containerId?: Maybe<Scalars['Float']>;
  createdAt: Scalars['DateTime'];
  creditCardId?: Maybe<Scalars['String']>;
  customer: HaulingCustomer;
  customerId: Scalars['Float'];
  customerJobSite?: Maybe<HaulingCustomerJobSite>;
  customerJobSiteId?: Maybe<Scalars['Float']>;
  customerTruck?: Maybe<CustomerTruck>;
  customerTruckId?: Maybe<Scalars['Float']>;
  deleteDate?: Maybe<Scalars['DateTime']>;
  departureAt?: Maybe<Scalars['DateTime']>;
  destination?: Maybe<HaulingDestination>;
  destinationId?: Maybe<Scalars['Float']>;
  grandTotal: Scalars['Float'];
  hasWeightTicket: Scalars['Boolean'];
  haulingOrderId?: Maybe<Scalars['Int']>;
  id: Scalars['Float'];
  images?: Maybe<Array<OrderImage>>;
  initialOrderTotal: Scalars['Float'];
  isAch: Scalars['Boolean'];
  isSelfService?: Maybe<Scalars['Boolean']>;
  jobSite?: Maybe<HaulingCustomerJobSite>;
  jobSiteId?: Maybe<Scalars['Float']>;
  material?: Maybe<HaulingMaterial>;
  materialId?: Maybe<Scalars['Float']>;
  materialsDistribution: Array<OrderMaterialDistribution>;
  minimalWeight?: Maybe<Scalars['Float']>;
  miscellaneousMaterialsDistribution: Array<OrderMiscellaneousMaterialDistribution>;
  note?: Maybe<Scalars['String']>;
  originDistrict?: Maybe<HaulingOriginDistrict>;
  originDistrictId?: Maybe<Scalars['Float']>;
  owner?: Maybe<Scalars['String']>;
  paymentMethod?: Maybe<PaymentMethodType>;
  PONumber?: Maybe<Scalars['String']>;
  priceGroup?: Maybe<HaulingPriceGroup>;
  priceGroupId?: Maybe<Scalars['Float']>;
  project?: Maybe<HaulingProject>;
  projectId?: Maybe<Scalars['Float']>;
  status: OrderStatus;
  taxDistricts?: Maybe<Array<HaulingTaxDistrict>>;
  taxTotal: Scalars['Float'];
  truckTare?: Maybe<Scalars['Float']>;
  type: OrderType;
  updatedAt: Scalars['DateTime'];
  useTare?: Maybe<Scalars['Boolean']>;
  weightIn?: Maybe<Scalars['Float']>;
  weightInSource?: Maybe<Scalars['String']>;
  weightInTimestamp?: Maybe<Scalars['DateTime']>;
  weightInType?: Maybe<MeasurementType>;
  weightInUnit?: Maybe<MeasurementUnit>;
  weightInUser?: Maybe<User>;
  weightOut?: Maybe<Scalars['Float']>;
  weightOutSource?: Maybe<Scalars['String']>;
  weightOutTimestamp?: Maybe<Scalars['DateTime']>;
  weightOutType?: Maybe<MeasurementType>;
  weightOutUnit?: Maybe<MeasurementUnit>;
  weightOutUser?: Maybe<User>;
  weightTicketAttachedAt?: Maybe<Scalars['DateTime']>;
  weightTicketCreator?: Maybe<User>;
  weightTicketCreatorId?: Maybe<Scalars['String']>;
  weightTicketPrivateUrl?: Maybe<Scalars['String']>;
  weightTicketUrl?: Maybe<Scalars['String']>;
  WONumber?: Maybe<Scalars['String']>;
};

export type OrderApprovedRequestInput = {
  reason?: Maybe<Scalars['String']>;
};

export type OrderBillableItem = {
  __typename?: 'OrderBillableItem';
  applySurcharges?: Maybe<Scalars['Boolean']>;
  auto: Scalars['Boolean'];
  billableItem?: Maybe<HaulingBillableItem>;
  billableItemId?: Maybe<Scalars['Int']>;
  createdAt: Scalars['DateTime'];
  customRatesGroupLineItemsId?: Maybe<Scalars['Float']>;
  customRatesGroupServicesId?: Maybe<Scalars['Int']>;
  customRatesGroupThresholdsId?: Maybe<Scalars['Int']>;
  globalRatesLineItemsId?: Maybe<Scalars['Float']>;
  globalRatesServiceId?: Maybe<Scalars['Int']>;
  globalRatesThresholdsId?: Maybe<Scalars['Int']>;
  material?: Maybe<HaulingMaterial>;
  materialId?: Maybe<Scalars['Float']>;
  orderId?: Maybe<Scalars['Float']>;
  price: Scalars['Float'];
  priceSource?: Maybe<Scalars['String']>;
  priceSourceType?: Maybe<OrderPriceSourceType>;
  quantity: Scalars['Float'];
  readonly: Scalars['Boolean'];
  thresholdId?: Maybe<Scalars['Int']>;
  type: OrderBillableItemType;
  updatedAt: Scalars['DateTime'];
  uuid: Scalars['String'];
};

export type OrderBillableItemInput = {
  applySurcharges?: Maybe<Scalars['Boolean']>;
  auto?: Maybe<Scalars['Boolean']>;
  billableItemId?: Maybe<Scalars['Float']>;
  customRatesGroupLineItemsId?: Maybe<Scalars['Float']>;
  customRatesGroupServicesId?: Maybe<Scalars['Int']>;
  customRatesGroupThresholdsId?: Maybe<Scalars['Int']>;
  globalRatesLineItemsId?: Maybe<Scalars['Float']>;
  globalRatesServiceId?: Maybe<Scalars['Int']>;
  globalRatesThresholdsId?: Maybe<Scalars['Int']>;
  materialId?: Maybe<Scalars['Float']>;
  price: Scalars['Float'];
  priceSource?: Maybe<Scalars['String']>;
  priceSourceType?: Maybe<OrderPriceSourceType>;
  quantity: Scalars['Float'];
  readonly?: Maybe<Scalars['Boolean']>;
  thresholdId?: Maybe<Scalars['Float']>;
  type: OrderBillableItemType;
  uuid: Scalars['String'];
};

export enum OrderBillableItemType {
  Fee = 'FEE',
  Line = 'LINE',
  Material = 'MATERIAL',
  Miscellanies = 'MISCELLANIES',
}

export type OrderCompletedRequestInput = {
  overrideCreditLimit?: Maybe<Scalars['Boolean']>;
  reason?: Maybe<Scalars['String']>;
};

export type OrderDeleteResult = {
  __typename?: 'OrderDeleteResult';
  result: Scalars['Boolean'];
};

export type OrderFilterInput = {
  customerId?: Maybe<Scalars['Int']>;
  customerJobSiteId?: Maybe<Scalars['Int']>;
  customerTruckId?: Maybe<Scalars['Int']>;
  jobSiteId?: Maybe<Scalars['Int']>;
  projectIds?: Maybe<Array<Scalars['Int']>>;
  status?: Maybe<OrderStatus>;
  WONumber?: Maybe<Scalars['String']>;
};

export type OrderImage = {
  __typename?: 'OrderImage';
  filename: Scalars['String'];
  url: Scalars['String'];
};

export type OrderImageInput = {
  filename: Scalars['String'];
  url: Scalars['String'];
};

export type OrderIndexed = {
  __typename?: 'OrderIndexed';
  amount: Scalars['Float'];
  arrivedAt?: Maybe<Scalars['DateTime']>;
  beforeTaxesTotal: Scalars['Float'];
  billableItems: Array<OrderBillableItem>;
  billableService?: Maybe<BillableService>;
  bypassScale: Scalars['Boolean'];
  canTare?: Maybe<Scalars['Float']>;
  checkNumber?: Maybe<Scalars['String']>;
  container?: Maybe<Equipment>;
  containerId?: Maybe<Scalars['Float']>;
  createdAt: Scalars['DateTime'];
  creditCardId?: Maybe<Scalars['String']>;
  customer: HaulingCustomer;
  customerId: Scalars['Float'];
  customerJobSite?: Maybe<HaulingCustomerJobSite>;
  customerJobSiteId?: Maybe<Scalars['Float']>;
  customerTruck?: Maybe<CustomerTruck>;
  customerTruckId?: Maybe<Scalars['Float']>;
  deleteDate?: Maybe<Scalars['DateTime']>;
  departureAt?: Maybe<Scalars['DateTime']>;
  destination?: Maybe<HaulingDestination>;
  destinationId?: Maybe<Scalars['Float']>;
  graded?: Maybe<Scalars['Boolean']>;
  grandTotal: Scalars['Float'];
  hasWeightTicket?: Maybe<Scalars['Boolean']>;
  haulingOrderId?: Maybe<Scalars['Int']>;
  highlight?: Maybe<Scalars['Highlight']>;
  id: Scalars['Float'];
  images?: Maybe<Array<OrderImage>>;
  initialOrderTotal: Scalars['Float'];
  isAch: Scalars['Boolean'];
  isSelfService?: Maybe<Scalars['Boolean']>;
  jobSite?: Maybe<HaulingCustomerJobSite>;
  jobSiteId?: Maybe<Scalars['Float']>;
  material?: Maybe<HaulingMaterial>;
  materialId?: Maybe<Scalars['Float']>;
  materialsDistribution: Array<OrderMaterialDistribution>;
  minimalWeight?: Maybe<Scalars['Float']>;
  miscellaneousMaterialsDistribution: Array<OrderMiscellaneousMaterialDistribution>;
  netWeight?: Maybe<Scalars['Float']>;
  note?: Maybe<Scalars['String']>;
  originDistrict?: Maybe<HaulingOriginDistrict>;
  originDistrictId?: Maybe<Scalars['Float']>;
  owner?: Maybe<Scalars['String']>;
  paymentMethod?: Maybe<PaymentMethodType>;
  PONumber?: Maybe<Scalars['String']>;
  priceGroup?: Maybe<HaulingPriceGroup>;
  priceGroupId?: Maybe<Scalars['Float']>;
  project?: Maybe<HaulingProject>;
  projectId?: Maybe<Scalars['Float']>;
  status: OrderStatus;
  taxDistricts?: Maybe<Array<HaulingTaxDistrict>>;
  taxTotal: Scalars['Float'];
  truckTare?: Maybe<Scalars['Float']>;
  type: OrderType;
  updatedAt: Scalars['DateTime'];
  useTare?: Maybe<Scalars['Boolean']>;
  weightIn?: Maybe<Scalars['Float']>;
  weightInSource?: Maybe<Scalars['String']>;
  weightInTimestamp?: Maybe<Scalars['DateTime']>;
  weightInType?: Maybe<MeasurementType>;
  weightInUnit?: Maybe<MeasurementUnit>;
  weightInUser?: Maybe<User>;
  weightOut?: Maybe<Scalars['Float']>;
  weightOutSource?: Maybe<Scalars['String']>;
  weightOutTimestamp?: Maybe<Scalars['DateTime']>;
  weightOutType?: Maybe<MeasurementType>;
  weightOutUnit?: Maybe<MeasurementUnit>;
  weightOutUser?: Maybe<User>;
  weightTicketAttachedAt?: Maybe<Scalars['DateTime']>;
  weightTicketCreator?: Maybe<User>;
  weightTicketCreatorId?: Maybe<Scalars['String']>;
  weightTicketPrivateUrl?: Maybe<Scalars['String']>;
  weightTicketUrl?: Maybe<Scalars['String']>;
  WONumber?: Maybe<Scalars['String']>;
};

export type OrderInput = {
  amount?: Maybe<Scalars['Float']>;
  arrivedAt?: Maybe<Scalars['DateTime']>;
  bypassScale?: Maybe<Scalars['Boolean']>;
  canTare?: Maybe<Scalars['Float']>;
  checkNumber?: Maybe<Scalars['String']>;
  containerId?: Maybe<Scalars['Float']>;
  creditCardId?: Maybe<Scalars['String']>;
  customerId?: Maybe<Scalars['Int']>;
  customerJobSiteId?: Maybe<Scalars['Int']>;
  customerTruckId?: Maybe<Scalars['Int']>;
  departureAt?: Maybe<Scalars['DateTime']>;
  destinationId?: Maybe<Scalars['Int']>;
  isAch?: Maybe<Scalars['Boolean']>;
  isSelfService?: Maybe<Scalars['Boolean']>;
  jobSiteId?: Maybe<Scalars['Float']>;
  materialId?: Maybe<Scalars['Int']>;
  note?: Maybe<Scalars['String']>;
  orderBillableItems?: Maybe<Array<OrderBillableItemInput>>;
  originDistrictId?: Maybe<Scalars['Int']>;
  paymentMethod?: Maybe<PaymentMethodType>;
  PONumber?: Maybe<Scalars['String']>;
  priceGroupId?: Maybe<Scalars['Int']>;
  projectId?: Maybe<Scalars['Int']>;
  taxTotal?: Maybe<Scalars['Float']>;
  truckTare?: Maybe<Scalars['Float']>;
  type?: Maybe<OrderType>;
  useTare?: Maybe<Scalars['Boolean']>;
  weightIn?: Maybe<Scalars['Float']>;
  weightInSource?: Maybe<Scalars['String']>;
  weightInTimestamp?: Maybe<Scalars['DateTime']>;
  weightInType?: Maybe<MeasurementType>;
  weightInUnit?: Maybe<MeasurementUnit>;
  weightInUser?: Maybe<Scalars['String']>;
  weightOut?: Maybe<Scalars['Float']>;
  weightOutSource?: Maybe<Scalars['String']>;
  weightOutTimestamp?: Maybe<Scalars['DateTime']>;
  weightOutType?: Maybe<MeasurementType>;
  weightOutUnit?: Maybe<MeasurementUnit>;
  weightOutUser?: Maybe<Scalars['String']>;
  WONumber?: Maybe<Scalars['String']>;
};

export type OrderMaterialDistribution = {
  __typename?: 'OrderMaterialDistribution';
  createdAt: Scalars['DateTime'];
  material?: Maybe<HaulingMaterial>;
  materialId: Scalars['Float'];
  orderId: Scalars['Float'];
  recycle?: Maybe<Scalars['Boolean']>;
  updatedAt: Scalars['DateTime'];
  uuid: Scalars['String'];
  value: Scalars['Float'];
};

export type OrderMaterialDistributionInput = {
  materialId: Scalars['Float'];
  uuid: Scalars['String'];
  value: Scalars['Float'];
};

export type OrderMiscellaneousMaterialDistribution = {
  __typename?: 'OrderMiscellaneousMaterialDistribution';
  createdAt: Scalars['DateTime'];
  material: HaulingMaterial;
  materialId: Scalars['Float'];
  orderId: Scalars['Float'];
  quantity: Scalars['Float'];
  recycle?: Maybe<Scalars['Boolean']>;
  updatedAt: Scalars['DateTime'];
  uuid: Scalars['String'];
};

export type OrderMiscellaneousMaterialDistributionInput = {
  materialId: Scalars['Float'];
  quantity: Scalars['Float'];
  uuid: Scalars['String'];
};

export enum OrderPriceSourceType {
  GlobalRackRates = 'GLOBAL_RACK_RATES',
  Manual = 'MANUAL',
  NoPrice = 'NO_PRICE',
  PriceGroup = 'PRICE_GROUP',
}

export type OrdersIndexedFilter = {
  createdAt?: Maybe<Array<RangeFilter>>;
  customerId?: Maybe<Array<Scalars['Int']>>;
  graded?: Maybe<Scalars['Boolean']>;
  haulingOrderId?: Maybe<Array<Scalars['Int']>>;
  materialId?: Maybe<Array<Scalars['Int']>>;
  owner?: Maybe<Array<Scalars['String']>>;
  paymentMethod?: Maybe<Array<PaymentMethodType>>;
  PONumber?: Maybe<Array<Scalars['String']>>;
  search?: Maybe<Scalars['String']>;
  status?: Maybe<Array<OrderStatus>>;
  type?: Maybe<Array<OrderType>>;
};

export type OrdersIndexedList = {
  __typename?: 'OrdersIndexedList';
  data: Array<OrderIndexed>;
  total: Scalars['Float'];
};

export type OrdersIndexedResponse = {
  __typename?: 'OrdersIndexedResponse';
  data: Array<OrderIndexed>;
  total: Scalars['Float'];
};

export type OrdersResponse = {
  __typename?: 'OrdersResponse';
  data: Array<Order>;
  total: Scalars['Float'];
};

export enum OrderStatus {
  Approved = 'APPROVED',
  Completed = 'COMPLETED',
  Finalized = 'FINALIZED',
  InYard = 'IN_YARD',
  Invoiced = 'INVOICED',
  Load = 'LOAD',
  OnTheWay = 'ON_THE_WAY',
  Payment = 'PAYMENT',
  WeightOut = 'WEIGHT_OUT',
}

export type OrderTotalByStatus = {
  __typename?: 'OrderTotalByStatus';
  all?: Maybe<Scalars['Int']>;
  APPROVED?: Maybe<Scalars['Int']>;
  COMPLETED?: Maybe<Scalars['Int']>;
  FINALIZED?: Maybe<Scalars['Int']>;
  IN_YARD?: Maybe<Scalars['Int']>;
  INVOICED?: Maybe<Scalars['Int']>;
  LOAD?: Maybe<Scalars['Int']>;
  ON_THE_WAY?: Maybe<Scalars['Int']>;
  PAYMENT?: Maybe<Scalars['Int']>;
  WEIGHT_OUT?: Maybe<Scalars['Int']>;
};

export enum OrderType {
  Dump = 'DUMP',
  Load = 'LOAD',
  NonService = 'NON_SERVICE',
}

export type OrderUpdateInput = {
  amount?: Maybe<Scalars['Float']>;
  arrivedAt?: Maybe<Scalars['DateTime']>;
  bypassScale?: Maybe<Scalars['Boolean']>;
  canTare?: Maybe<Scalars['Float']>;
  checkNumber?: Maybe<Scalars['String']>;
  containerId?: Maybe<Scalars['Float']>;
  creditCardId?: Maybe<Scalars['String']>;
  customerId?: Maybe<Scalars['Int']>;
  customerJobSiteId?: Maybe<Scalars['Int']>;
  customerTruckId?: Maybe<Scalars['Int']>;
  departureAt?: Maybe<Scalars['DateTime']>;
  destinationId?: Maybe<Scalars['Int']>;
  id: Scalars['Float'];
  images?: Maybe<Array<OrderImageInput>>;
  isAch?: Maybe<Scalars['Boolean']>;
  isSelfService?: Maybe<Scalars['Boolean']>;
  jobSiteId?: Maybe<Scalars['Float']>;
  materialId?: Maybe<Scalars['Int']>;
  materialsDistributionInput?: Maybe<Array<OrderMaterialDistributionInput>>;
  miscellaneousMaterialsDistributionInput?: Maybe<
    Array<OrderMiscellaneousMaterialDistributionInput>
  >;
  note?: Maybe<Scalars['String']>;
  orderBillableItems?: Maybe<Array<OrderBillableItemInput>>;
  originDistrictId?: Maybe<Scalars['Int']>;
  paymentMethod?: Maybe<PaymentMethodType>;
  PONumber?: Maybe<Scalars['String']>;
  priceGroupId?: Maybe<Scalars['Int']>;
  projectId?: Maybe<Scalars['Int']>;
  taxTotal?: Maybe<Scalars['Float']>;
  truckTare?: Maybe<Scalars['Float']>;
  type?: Maybe<OrderType>;
  useTare?: Maybe<Scalars['Boolean']>;
  weightIn?: Maybe<Scalars['Float']>;
  weightInSource?: Maybe<Scalars['String']>;
  weightInTimestamp?: Maybe<Scalars['DateTime']>;
  weightInType?: Maybe<MeasurementType>;
  weightInUnit?: Maybe<MeasurementUnit>;
  weightInUser?: Maybe<Scalars['String']>;
  weightOut?: Maybe<Scalars['Float']>;
  weightOutSource?: Maybe<Scalars['String']>;
  weightOutTimestamp?: Maybe<Scalars['DateTime']>;
  weightOutType?: Maybe<MeasurementType>;
  weightOutUnit?: Maybe<MeasurementUnit>;
  weightOutUser?: Maybe<Scalars['String']>;
  WONumber?: Maybe<Scalars['String']>;
};

export type OriginFilter = {
  activeOnly?: Maybe<Scalars['Boolean']>;
};

export type OriginInput = {
  active: Scalars['Boolean'];
  businessUnitId?: Maybe<Scalars['Float']>;
  description: Scalars['String'];
  originDistricts: Array<HaulingOriginDistrictInput>;
};

export type OriginsResponse = {
  __typename?: 'OriginsResponse';
  data: Array<HaulingOrigin>;
};

export type OriginUpdateInput = {
  active: Scalars['Boolean'];
  businessUnitId?: Maybe<Scalars['Float']>;
  description: Scalars['String'];
  id: Scalars['Float'];
  originDistricts: Array<HaulingOriginDistrictInput>;
};

export type PaginationInput = {
  page: Scalars['Float'];
  perPage: Scalars['Float'];
};

export enum PaymentMethodType {
  Cash = 'CASH',
  Check = 'CHECK',
  CreditCard = 'CREDIT_CARD',
  OnAccount = 'ON_ACCOUNT',
}

export enum PaymentTerm {
  Cod = 'COD',
  Net_15Days = 'NET_15_DAYS',
  Net_30Days = 'NET_30_DAYS',
  Net_60Days = 'NET_60_DAYS',
  None = 'NONE',
}

export type Permission = {
  __typename?: 'Permission';
  createdAt: Scalars['DateTime'];
  id: Scalars['String'];
  name: Scalars['String'];
  type: ResourceType;
  updatedAt: Scalars['DateTime'];
};

export type PermissionDeleteResult = {
  __typename?: 'PermissionDeleteResult';
  result: Scalars['Boolean'];
};

export type PermissionInput = {
  name: Scalars['String'];
  type: ResourceType;
};

export type PermissionsFilterInput = {
  type: ResourceType;
};

export type PermissionsSortInput = {
  field: Scalars['String'];
  order: Scalars['String'];
};

export type PermissionUpdateInput = {
  id: Scalars['String'];
  name: Scalars['String'];
  type: ResourceType;
};

export type Phone = {
  __typename?: 'Phone';
  extension: Scalars['String'];
  number: Scalars['String'];
  textOnly: Scalars['Boolean'];
  type: PhoneType;
};

export type PhoneInput = {
  extension?: Maybe<Scalars['String']>;
  number?: Maybe<Scalars['String']>;
  textOnly?: Maybe<Scalars['Boolean']>;
  type: PhoneType;
};

export enum PhoneType {
  Cell = 'CELL',
  Fax = 'FAX',
  Home = 'HOME',
  Main = 'MAIN',
  Other = 'OTHER',
  Pager = 'PAGER',
  Phone = 'PHONE',
  Work = 'WORK',
}

export enum PolicyEffect {
  Allow = 'ALLOW',
  Deny = 'DENY',
}

export type PolicyEntry = {
  __typename?: 'PolicyEntry';
  level: AccessLevel;
  overridden?: Maybe<Scalars['Boolean']>;
  subject: Scalars['String'];
};

export type PolicyEntryInput = {
  level: AccessLevel;
  overridden?: Maybe<Scalars['Boolean']>;
  subject: Scalars['String'];
};

export type PolicyInput = {
  entries: Array<PolicyEntryInput>;
  resource: Scalars['String'];
};

export type PolicyStatementInput = {
  actions: Array<Scalars['String']>;
  effect: Scalars['String'];
  resource: Scalars['String'];
};

export type PolicyStatementTemplateInput = {
  actions: Array<Scalars['String']>;
  resourceType: ResourceType;
};

export type PolicyTemplateInput = {
  entries: Array<PolicyEntryInput>;
  resourceType: ResourceType;
};

export type PopulateEntityEvent = {
  /** force reindex without checking if mapping has changed */
  forceReindex: Scalars['Boolean'];
  /** name of the entity to populate into ElasticSearch */
  name: Scalars['String'];
  /** Recycling Facility SRN, example: "srn:acme:recycling:1" */
  resource: Scalars['String'];
};

export type ProjectInput = {
  customerJobSiteId: Scalars['Int'];
  description: Scalars['String'];
  endDate?: Maybe<Scalars['String']>;
  purchaseOrder: Scalars['Boolean'];
  startDate?: Maybe<Scalars['String']>;
};

export type Query = {
  __typename?: 'Query';
  activeOriginDistricts: Array<HaulingOriginDistrict>;
  aggregatedOrderHistory: Scalars['HaulingOrderHistory'];
  availableResourceLogins: Array<ResourceLogin>;
  company: Company;
  creditCard?: Maybe<CreditCard>;
  creditCards?: Maybe<Array<CreditCard>>;
  customerTruck: CustomerTruck;
  customerTruckIndexed: CustomerTruckIndexed;
  customerTrucks: CustomerTrucksResponse;
  customerTrucksByIds: Array<CustomerTruck>;
  customerTrucksIndexed: CustomerTrucksListIndexed;
  /** Get CustomerTruck count by filters */
  customerTrucksIndexedCount: Scalars['Int'];
  destination: HaulingDestination;
  destinations: DestinationsResponse;
  equipment: Equipment;
  equipments: EquipmentsResponse;
  getHaulingBillableItems: Array<HaulingBillableItem>;
  /** get sales representives by business unit */
  getSalesRepresentativesByBU: Array<User>;
  getWalkUpCustomer?: Maybe<HaulingCustomer>;
  haulingCompanyGeneralSettings?: Maybe<HaulingCompanyGeneralSettings>;
  haulingCustomer: HaulingCustomer;
  haulingCustomerGroups: Array<HaulingCustomerGroup>;
  haulingCustomerJobSite: HaulingCustomerJobSite;
  haulingCustomerJobSitePair: HaulingCustomerJobSite;
  haulingCustomerJobSites: Array<HaulingCustomerJobSite>;
  haulingCustomerJobSitesAll: Array<HaulingCustomerJobSite>;
  haulingCustomers: HaulingCustomersResponse;
  haulingJobSite: HaulingJobSite;
  haulingJobSites: HaulingJobSitesResponse;
  haulingMaterial: HaulingMaterial;
  haulingMaterials: HaulingMaterialsResponse;
  haulingPriceGroups: HaulingPriceGroupsResult;
  haulingProjects: Array<HaulingProject>;
  indexedOrdersGroupByStatusTotal: OrderTotalByStatus;
  /** is user logged in, local state */
  isLoggedIn: Scalars['Boolean'];
  lastUsedCreditCard?: Maybe<Scalars['String']>;
  listRoles: ListRolesResult;
  /** get users */
  listUsers: ListUsersResult;
  me: Me;
  minimalWeight?: Maybe<Scalars['Float']>;
  onTheWayWONumbers: Array<OnTheWayNumber>;
  order: Order;
  orderIndexed: OrderIndexed;
  orders: OrdersResponse;
  ordersByHaulingId: Array<Order>;
  ordersByIds: Array<Order>;
  ordersByWONumberAndCustomer: Array<OrderIndexed>;
  ordersGrid: OrdersIndexedList;
  ordersIndexed: OrdersIndexedResponse;
  /** Get Order count by filters */
  ordersIndexedCount: Scalars['Int'];
  origin: HaulingOrigin;
  origins: OriginsResponse;
  permissions: ListPermissionsResult;
  resource?: Maybe<Resource>;
  /** Get User Resources */
  resourceLogins: Array<AvailableResourceLogin>;
  resources: ListResourcesResult;
  role?: Maybe<Role>;
  roles: Array<Role>;
  salesRepresentatives: Array<User>;
  scale: Scale;
  scales: ScalesResponse;
  scalesByIds: Array<Scale>;
  serviceDaysAndHour: HaulingServiceDaysAndHours;
  serviceDaysAndHours: ServiceDaysAndHoursResponse;
  taxDistricts: Array<HaulingTaxDistrict>;
  taxDistrictsForOrder: Array<HaulingTaxDistrict>;
  trucksForOrderCreate: Array<CustomerTruckForOrderCreate>;
  user?: Maybe<User>;
  userDriver?: Maybe<HaulingDriver>;
  /** user info from token, local state */
  userInfo: UserInfo;
  /** get users by ids */
  users: Array<Maybe<User>>;
  yardOperationConsoleActivity: YardConsoleActivityTotal;
};

export type QueryAggregatedOrderHistoryArgs = {
  orderId: Scalars['Int'];
};

export type QueryCreditCardArgs = {
  id: Scalars['ID'];
};

export type QueryCreditCardsArgs = {
  filter?: Maybe<CreditCardFilter>;
};

export type QueryCustomerTruckArgs = {
  filter?: Maybe<CustomerTruckFilter>;
  id: Scalars['Int'];
};

export type QueryCustomerTruckIndexedArgs = {
  id: Scalars['Int'];
};

export type QueryCustomerTrucksArgs = {
  filter?: Maybe<CustomerTruckFilter>;
  pagination?: Maybe<PaginationInput>;
  sort?: Maybe<Array<SortInput>>;
};

export type QueryCustomerTrucksByIdsArgs = {
  filter?: Maybe<CustomerTruckFilter>;
  ids: Array<Scalars['Int']>;
};

export type QueryCustomerTrucksIndexedArgs = {
  filter?: Maybe<CustomerTruckIndexedFilter>;
  pagination?: Maybe<PaginationInput>;
  sort?: Maybe<Array<SortInput>>;
};

export type QueryCustomerTrucksIndexedCountArgs = {
  search: SearchBodyInput;
};

export type QueryDestinationArgs = {
  id: Scalars['Int'];
};

export type QueryDestinationsArgs = {
  filter?: Maybe<DestinationFilter>;
  pagination?: Maybe<PaginationInput>;
  sort?: Maybe<Array<SortInput>>;
};

export type QueryEquipmentArgs = {
  id: Scalars['Int'];
};

export type QueryEquipmentsArgs = {
  filter?: Maybe<EquipmentFilterInput>;
  pagination?: Maybe<PaginationInput>;
  sort?: Maybe<Array<SortInput>>;
};

export type QueryGetHaulingBillableItemsArgs = {
  search: HaulingBillableItemFilterInput;
};

export type QueryGetSalesRepresentativesByBuArgs = {
  businessUnitId: Scalars['Int'];
};

export type QueryHaulingCustomerArgs = {
  id: Scalars['Int'];
};

export type QueryHaulingCustomerGroupsArgs = {
  filter?: Maybe<HaulingCustomerGroupFilter>;
};

export type QueryHaulingCustomerJobSiteArgs = {
  filter: HaulingCustomerJobSitePairByIdFilterInput;
};

export type QueryHaulingCustomerJobSitePairArgs = {
  filter: HaulingCustomerJobSitePairFilterInput;
};

export type QueryHaulingCustomerJobSitesArgs = {
  filter: HaulingCustomerJobSiteFilterInput;
};

export type QueryHaulingCustomerJobSitesAllArgs = {
  filter: HaulingCustomerJobSiteFilterInput;
};

export type QueryHaulingCustomersArgs = {
  filter?: Maybe<CustomerFilter>;
  pagination?: Maybe<PaginationInput>;
  sort?: Maybe<Array<SortInput>>;
};

export type QueryHaulingJobSiteArgs = {
  id: Scalars['Int'];
};

export type QueryHaulingJobSitesArgs = {
  filter?: Maybe<JobSiteFilter>;
  pagination?: Maybe<PaginationInput>;
  sort?: Maybe<Array<SortInput>>;
};

export type QueryHaulingMaterialArgs = {
  id: Scalars['Int'];
};

export type QueryHaulingMaterialsArgs = {
  filter?: Maybe<HaulingMaterialFilterInput>;
  pagination?: Maybe<PaginationInput>;
  sort?: Maybe<Array<SortInput>>;
};

export type QueryHaulingPriceGroupsArgs = {
  filter: HaulingPriceGroupFilterInput;
};

export type QueryHaulingProjectsArgs = {
  filter: HaulingProjectFilter;
};

export type QueryIndexedOrdersGroupByStatusTotalArgs = {
  filter?: Maybe<OrdersIndexedFilter>;
};

export type QueryLastUsedCreditCardArgs = {
  customerId: Scalars['Int'];
  jobSiteId?: Maybe<Scalars['Int']>;
};

export type QueryListRolesArgs = {
  filter?: Maybe<RolesFilter>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
};

export type QueryListUsersArgs = {
  filter?: Maybe<UsersFilter>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  query?: Maybe<Scalars['String']>;
};

export type QueryMinimalWeightArgs = {
  materialId: Scalars['Int'];
  priceGroupId: Scalars['Int'];
  type: OrderType;
};

export type QueryOnTheWayWoNumbersArgs = {
  customerId?: Maybe<Scalars['Int']>;
  onlyAllowSelfService?: Maybe<Scalars['Boolean']>;
};

export type QueryOrderArgs = {
  filter?: Maybe<OrderFilterInput>;
  id: Scalars['Int'];
};

export type QueryOrderIndexedArgs = {
  id: Scalars['Int'];
};

export type QueryOrdersArgs = {
  filter?: Maybe<OrderFilterInput>;
  pagination?: Maybe<PaginationInput>;
  sort?: Maybe<Array<SortInput>>;
};

export type QueryOrdersByHaulingIdArgs = {
  ids: Array<Scalars['Int']>;
};

export type QueryOrdersByIdsArgs = {
  filter?: Maybe<OrderFilterInput>;
  ids: Array<Scalars['Int']>;
};

export type QueryOrdersByWoNumberAndCustomerArgs = {
  customerId?: Maybe<Scalars['Int']>;
  onlyAllowSelfService?: Maybe<Scalars['Boolean']>;
  WONumber: Scalars['String'];
};

export type QueryOrdersGridArgs = {
  filter?: Maybe<OrdersIndexedFilter>;
  pagination?: Maybe<PaginationInput>;
  sort?: Maybe<Array<SortInput>>;
};

export type QueryOrdersIndexedArgs = {
  search: SearchBodyInput;
};

export type QueryOrdersIndexedCountArgs = {
  search: SearchBodyInput;
};

export type QueryOriginArgs = {
  id: Scalars['Int'];
};

export type QueryOriginsArgs = {
  filter?: Maybe<OriginFilter>;
  pagination?: Maybe<PaginationInput>;
  sort?: Maybe<Array<SortInput>>;
};

export type QueryPermissionsArgs = {
  filter?: Maybe<PermissionsFilterInput>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  sort?: Maybe<Array<PermissionsSortInput>>;
};

export type QueryResourceArgs = {
  srn: Scalars['String'];
};

export type QueryResourcesArgs = {
  filter?: Maybe<ResourcesFilterInput>;
  limit?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  sort?: Maybe<Array<ResourcesSortInput>>;
};

export type QueryRoleArgs = {
  id: Scalars['String'];
};

export type QueryScaleArgs = {
  filter?: Maybe<ScaleFilterInput>;
  id: Scalars['Int'];
};

export type QueryScalesArgs = {
  filter?: Maybe<ScaleFilterInput>;
  pagination?: Maybe<PaginationInput>;
  sort?: Maybe<Array<SortInput>>;
};

export type QueryScalesByIdsArgs = {
  filter?: Maybe<ScaleFilterInput>;
  ids: Array<Scalars['Int']>;
};

export type QueryServiceDaysAndHourArgs = {
  id: Scalars['Int'];
};

export type QueryServiceDaysAndHoursArgs = {
  filter?: Maybe<HaulingServiceDaysAndHoursFilter>;
  pagination?: Maybe<PaginationInput>;
  sort?: Maybe<Array<SortInput>>;
};

export type QueryTaxDistrictsForOrderArgs = {
  filter: TaxDistrictFilter;
};

export type QueryTrucksForOrderCreateArgs = {
  customerId: Scalars['Int'];
  filter?: Maybe<TrucksForOrderCreateFilterInput>;
};

export type QueryUserArgs = {
  filter?: Maybe<UsersFilter>;
  id?: Maybe<Scalars['String']>;
};

export type QueryUsersArgs = {
  ids: Array<Scalars['String']>;
  raw?: Maybe<Scalars['Boolean']>;
};

export type QueryYardOperationConsoleActivityArgs = {
  input: YardConsoleActivityInput;
};

export type RangeFilter = {
  from: Scalars['DateTime'];
  to: Scalars['DateTime'];
};

export type Resource = {
  __typename?: 'Resource';
  createdAt: Scalars['DateTime'];
  id?: Maybe<Scalars['String']>;
  image?: Maybe<Scalars['String']>;
  label?: Maybe<Scalars['String']>;
  loginUrl?: Maybe<Scalars['String']>;
  srn: Scalars['String'];
  subLabel?: Maybe<Scalars['String']>;
  type: ResourceType;
  updatedAt: Scalars['DateTime'];
};

export type ResourceDeleteResult = {
  __typename?: 'ResourceDeleteResult';
  result: Scalars['Boolean'];
};

export type ResourceInput = {
  id?: Maybe<Scalars['String']>;
  image?: Maybe<Scalars['String']>;
  label?: Maybe<Scalars['String']>;
  loginUrl?: Maybe<Scalars['String']>;
  srn: Scalars['String'];
  subLabel?: Maybe<Scalars['String']>;
  type: ResourceType;
};

/** Login to a resource, used in lobby for list of login targets */
export type ResourceLogin = {
  __typename?: 'ResourceLogin';
  graderHasBUAccess?: Maybe<Scalars['Boolean']>;
  hasGradingAccess?: Maybe<Scalars['Boolean']>;
  hasRecyclingAccess?: Maybe<Scalars['Boolean']>;
  id?: Maybe<Scalars['String']>;
  /** Optional image of a resource */
  image?: Maybe<Scalars['String']>;
  label?: Maybe<Scalars['String']>;
  loginUrl?: Maybe<Scalars['String']>;
  resourceType: Scalars['String'];
  subLabel?: Maybe<Scalars['String']>;
  tenantName: Scalars['String'];
  updatedAt: Scalars['String'];
};

export type ResourcesFilterInput = {
  configurableOnly?: Maybe<Scalars['Boolean']>;
  type?: Maybe<ResourceType>;
};

export type ResourcesSortInput = {
  field: Scalars['String'];
  order: Scalars['String'];
};

export enum ResourceType {
  CustomerPortal = 'CUSTOMER_PORTAL',
  Global = 'GLOBAL',
  Hauling = 'HAULING',
  Recycling = 'RECYCLING',
}

export type ResourceUpdateInput = {
  id?: Maybe<Scalars['String']>;
  image?: Maybe<Scalars['String']>;
  label?: Maybe<Scalars['String']>;
  loginUrl?: Maybe<Scalars['String']>;
  srn: Scalars['String'];
  subLabel?: Maybe<Scalars['String']>;
  type: ResourceType;
};

export type Role = {
  __typename?: 'Role';
  createdAt: Scalars['DateTime'];
  description: Scalars['String'];
  id: Scalars['ID'];
  policies: Array<RolePolicy>;
  policyStatements: Array<RolePolicyStatement>;
  policyTemplates: Array<RolePolicyTemplate>;
  status: RoleStatus;
  tenantId?: Maybe<Scalars['String']>;
  updatedAt: Scalars['DateTime'];
  users: Array<User>;
  usersCount: Scalars['Int'];
};

export type RoleInput = {
  description: Scalars['String'];
  policies?: Maybe<Array<PolicyInput>>;
  policyStatements?: Maybe<Array<PolicyStatementInput>>;
  policyStatementTemplates?: Maybe<Array<PolicyStatementTemplateInput>>;
  policyTemplates?: Maybe<Array<PolicyTemplateInput>>;
  status: RoleStatus;
};

export type RolePolicy = {
  __typename?: 'RolePolicy';
  createdAt: Scalars['DateTime'];
  entries: Array<PolicyEntry>;
  id: Scalars['String'];
  resource: Scalars['String'];
  role: Role;
  updatedAt: Scalars['DateTime'];
};

export type RolePolicyStatement = {
  __typename?: 'RolePolicyStatement';
  actions: Array<Scalars['String']>;
  effect: PolicyEffect;
  name: Scalars['String'];
  resource: Scalars['String'];
  role: Role;
  tenantId: Scalars['String'];
};

export type RolePolicyTemplate = {
  __typename?: 'RolePolicyTemplate';
  createdAt: Scalars['DateTime'];
  entries: Array<PolicyEntry>;
  id: Scalars['String'];
  resourceType: ResourceType;
  role: Role;
  updatedAt: Scalars['DateTime'];
};

export type RolesFilter = {
  boundToTenant?: Maybe<Scalars['Boolean']>;
};

export enum RoleStatus {
  Active = 'ACTIVE',
  Disabled = 'DISABLED',
}

export type SalesRepresentative = {
  __typename?: 'SalesRepresentative';
  businessUnitId: Scalars['Float'];
  commissionAmount: Scalars['Float'];
};

export type SalesRepresentativeInput = {
  businessUnitId: Scalars['Float'];
  commissionAmount: Scalars['Float'];
};

export type Scale = {
  __typename?: 'Scale';
  computerId?: Maybe<Scalars['Float']>;
  connectionStatus: ScaleConnectionStatus;
  createdAt: Scalars['DateTime'];
  deviceName?: Maybe<Scalars['String']>;
  deviceNumber?: Maybe<Scalars['Float']>;
  id: Scalars['Float'];
  name: Scalars['String'];
  updatedAt: Scalars['DateTime'];
};

export enum ScaleConnectionStatus {
  Connected = 'CONNECTED',
  Failure = 'FAILURE',
  PendingConnection = 'PENDING_CONNECTION',
}

export type ScaleDeleteResult = {
  __typename?: 'ScaleDeleteResult';
  result: Scalars['Boolean'];
};

export type ScaleFilterInput = {
  connectionStatus?: Maybe<ScaleConnectionStatus>;
};

export type ScaleInput = {
  computerId?: Maybe<Scalars['Int']>;
  connectionStatus: ScaleConnectionStatus;
  deviceName?: Maybe<Scalars['String']>;
  deviceNumber?: Maybe<Scalars['Int']>;
  name: Scalars['String'];
};

export type ScalesResponse = {
  __typename?: 'ScalesResponse';
  data: Array<Scale>;
  total: Scalars['Float'];
};

export type ScaleUpdateInput = {
  computerId?: Maybe<Scalars['Int']>;
  connectionStatus: ScaleConnectionStatus;
  deviceName?: Maybe<Scalars['String']>;
  deviceNumber?: Maybe<Scalars['Int']>;
  id: Scalars['Float'];
  name: Scalars['String'];
};

export type SearchBodyInput = {
  aggs?: Maybe<Scalars['ObjectLiteralScalar']>;
  from?: Maybe<Scalars['Float']>;
  highlight?: Maybe<Scalars['ObjectLiteralScalar']>;
  query?: Maybe<Scalars['ObjectLiteralScalar']>;
  size?: Maybe<Scalars['Float']>;
  sort?: Maybe<Array<Scalars['ObjectLiteralScalar']>>;
};

export type ServiceDaysAndHoursResponse = {
  __typename?: 'ServiceDaysAndHoursResponse';
  data: Array<HaulingServiceDaysAndHours>;
};

export type SortInput = {
  field: Scalars['String'];
  order: Scalars['String'];
};

export type Tax = {
  __typename?: 'Tax';
  application?: Maybe<TaxApplication>;
  calculation: TaxCalculation;
  exclusions?: Maybe<Array<Scalars['Float']>>;
  group: Scalars['Boolean'];
  nonGroup?: Maybe<Array<NonGroupTaxValue>>;
  value?: Maybe<Scalars['String']>;
};

export enum TaxApplication {
  Each = 'Each',
  Order = 'Order',
  Quantity = 'Quantity',
  Subscription = 'Subscription',
  Ton = 'Ton',
}

export type TaxBusinessConfiguration = {
  __typename?: 'TaxBusinessConfiguration';
  businessLineId: Scalars['Float'];
  commercialLineItems: LineItemTax;
  commercialMaterials: Tax;
  commercialRecurringLineItems: Tax;
  commercialRecurringServices: Tax;
  commercialServices: Tax;
  id: Scalars['Float'];
  nonCommercialLineItems: LineItemTax;
  nonCommercialMaterials: Tax;
  nonCommercialRecurringLineItems: Tax;
  nonCommercialRecurringServices: Tax;
  nonCommercialServices: Tax;
};

export enum TaxCalculation {
  Flat = 'Flat',
  Percentage = 'Percentage',
}

export type TaxDistrictFilter = {
  customerId: Scalars['Float'];
  jobSiteId?: Maybe<Scalars['Int']>;
  originDistrictId?: Maybe<Scalars['Int']>;
};

export enum TaxDistrictType {
  Country = 'Country',
  Municipal = 'Municipal',
  Primary = 'Primary',
  Secondary = 'Secondary',
}

export type TrucksForOrderCreateFilterInput = {
  isDefinedEmptyWeight?: Maybe<Scalars['Boolean']>;
};

export type UploadFileResponse = {
  __typename?: 'UploadFileResponse';
  encoding: Scalars['String'];
  filename: Scalars['String'];
  mimetype: Scalars['String'];
  url: Scalars['String'];
};

export type User = {
  __typename?: 'User';
  address?: Maybe<Address>;
  allPermissions?: Maybe<Array<AllPermissions>>;
  availableActions: Array<Scalars['String']>;
  createdAt: Scalars['DateTime'];
  email: Scalars['String'];
  firstName?: Maybe<Scalars['String']>;
  hasPersonalPermissions: Scalars['Boolean'];
  id: Scalars['String'];
  lastName?: Maybe<Scalars['String']>;
  name: Scalars['String'];
  permissions: Array<PolicyEntry>;
  phones: Array<Phone>;
  policies: Array<UserPolicy>;
  policyStatements: Array<UserPolicyStatement>;
  roleIds: Array<Scalars['Float']>;
  roles: Array<Role>;
  salesRepresentatives?: Maybe<Array<SalesRepresentative>>;
  status: UserStatus;
  tenantId?: Maybe<Scalars['String']>;
  tenantName?: Maybe<Scalars['String']>;
  title?: Maybe<Scalars['String']>;
  updatedAt: Scalars['DateTime'];
};

export type UserAvailableActionsArgs = {
  resource: Scalars['String'];
};

export type UserPermissionsArgs = {
  resource: Scalars['String'];
};

export type UserCreateInput = {
  address?: Maybe<AddressInput>;
  email: Scalars['String'];
  firstName: Scalars['String'];
  lastName: Scalars['String'];
  phones?: Maybe<Array<PhoneInput>>;
  policies?: Maybe<Array<PolicyInput>>;
  policyStatements?: Maybe<Array<PolicyStatementInput>>;
  roleIds: Array<Scalars['ID']>;
  salesRepresentatives?: Maybe<Array<SalesRepresentativeInput>>;
  status: UserStatus;
  title: Scalars['String'];
};

export type UserPolicy = {
  __typename?: 'UserPolicy';
  createdAt: Scalars['DateTime'];
  entries: Array<PolicyEntry>;
  id: Scalars['String'];
  resource: Scalars['String'];
  updatedAt: Scalars['DateTime'];
  user: User;
};

export type UserPolicyStatement = {
  __typename?: 'UserPolicyStatement';
  actions: Array<Scalars['String']>;
  effect: PolicyEffect;
  name: Scalars['String'];
  resource: Scalars['String'];
  tenantId: Scalars['String'];
  user: User;
};

export type UsersFilter = {
  boundToTenant?: Maybe<Scalars['Boolean']>;
  email?: Maybe<Scalars['String']>;
};

export enum UserStatus {
  Active = 'ACTIVE',
  Disabled = 'DISABLED',
}

export type UserUpdateInput = {
  address?: Maybe<AddressInput>;
  firstName: Scalars['String'];
  lastName: Scalars['String'];
  phones?: Maybe<Array<PhoneInput>>;
  policies?: Maybe<Array<PolicyInput>>;
  policyStatements?: Maybe<Array<PolicyStatementInput>>;
  roleIds: Array<Scalars['String']>;
  salesRepresentatives?: Maybe<Array<SalesRepresentativeInput>>;
  status: UserStatus;
  title: Scalars['String'];
};

export type YardConsoleActivityInput = {
  activeTab: Scalars['String'];
  query?: Maybe<Scalars['ObjectLiteralScalar']>;
  time: Scalars['DateTime'];
};

export type YardConsoleActivityTotal = {
  __typename?: 'YardConsoleActivityTotal';
  inYard?: Maybe<Scalars['Int']>;
  onTheWay?: Maybe<Scalars['Int']>;
  selfService?: Maybe<Scalars['Int']>;
  today?: Maybe<Scalars['Int']>;
};

/** user info from token, local state */
export type UserInfo = {
  __typename?: 'UserInfo';
  id: Scalars['String'];
  email: Scalars['String'];
  token: Scalars['String'];
  expiresAt: Scalars['String'];
  refreshToken: Scalars['String'];
  refreshExpiresAt: Scalars['String'];
  resource: Scalars['String'];
  lastName: Scalars['String'];
  firstName: Scalars['String'];
  permissions: Array<Maybe<Scalars['String']>>;
};

export type UserInfoInput = {
  id: Scalars['String'];
  email: Scalars['String'];
  token: Scalars['String'];
  expiresAt: Scalars['String'];
  refreshToken: Scalars['String'];
  refreshExpiresAt: Scalars['String'];
  resource: Scalars['String'];
  lastName: Scalars['String'];
  firstName: Scalars['String'];
  permissions: Array<Maybe<Scalars['String']>>;
};

export type GetUserInfoQueryVariables = Exact<{ [key: string]: never }>;

export type GetUserInfoQuery = { __typename?: 'Query' } & {
  userInfo: { __typename?: 'UserInfo' } & Pick<
    UserInfo,
    | 'id'
    | 'expiresAt'
    | 'token'
    | 'lastName'
    | 'firstName'
    | 'email'
    | 'resource'
    | 'permissions'
    | 'refreshToken'
    | 'refreshExpiresAt'
  >;
};

export type GetMeQueryVariables = Exact<{ [key: string]: never }>;

export type GetMeQuery = { __typename?: 'Query' } & {
  me: { __typename?: 'Me' } & Pick<
    Me,
    'id' | 'lastName' | 'firstName' | 'email' | 'resource' | 'permissions'
  >;
};

export type GetGrantedPermissionsQueryVariables = Exact<{ [key: string]: never }>;

export type GetGrantedPermissionsQuery = { __typename?: 'Query' } & {
  userInfo: { __typename?: 'UserInfo' } & Pick<UserInfo, 'token' | 'permissions'>;
};

export type IsUserLoggedInQueryVariables = Exact<{ [key: string]: never }>;

export type IsUserLoggedInQuery = { __typename?: 'Query' } & Pick<Query, 'isLoggedIn'>;

export type SetUserInfoMutationVariables = Exact<{
  userInfo: UserInfoInput;
}>;

export type SetUserInfoMutation = { __typename?: 'Mutation' } & Pick<Mutation, 'setUserInfo'>;

export type LogOutMutationVariables = Exact<{ [key: string]: never }>;

export type LogOutMutation = { __typename?: 'Mutation' } & Pick<Mutation, 'logOut'>;

export const GetUserInfoDocument = gql`
  query GetUserInfo {
    userInfo @client {
      id
      expiresAt
      token
      lastName
      firstName
      email
      resource
      permissions
      refreshToken
      refreshExpiresAt
    }
  }
`;

/**
 * __useGetUserInfoQuery__
 *
 * To run a query within a React component, call `useGetUserInfoQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUserInfoQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUserInfoQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetUserInfoQuery(
  baseOptions?: ApolloReactHooks.QueryHookOptions<GetUserInfoQuery, GetUserInfoQueryVariables>,
) {
  return ApolloReactHooks.useQuery<GetUserInfoQuery, GetUserInfoQueryVariables>(
    GetUserInfoDocument,
    baseOptions,
  );
}
export function useGetUserInfoLazyQuery(
  baseOptions?: ApolloReactHooks.LazyQueryHookOptions<GetUserInfoQuery, GetUserInfoQueryVariables>,
) {
  return ApolloReactHooks.useLazyQuery<GetUserInfoQuery, GetUserInfoQueryVariables>(
    GetUserInfoDocument,
    baseOptions,
  );
}
export type GetUserInfoQueryHookResult = ReturnType<typeof useGetUserInfoQuery>;
export type GetUserInfoLazyQueryHookResult = ReturnType<typeof useGetUserInfoLazyQuery>;
export type GetUserInfoQueryResult = ApolloReactCommon.QueryResult<
  GetUserInfoQuery,
  GetUserInfoQueryVariables
>;
export function refetchGetUserInfoQuery(variables?: GetUserInfoQueryVariables) {
  return { query: GetUserInfoDocument, variables: variables };
}
export const GetMeDocument = gql`
  query getMe {
    me {
      id
      lastName
      firstName
      email
      resource
      permissions
    }
  }
`;

/**
 * __useGetMeQuery__
 *
 * To run a query within a React component, call `useGetMeQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetMeQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetMeQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetMeQuery(
  baseOptions?: ApolloReactHooks.QueryHookOptions<GetMeQuery, GetMeQueryVariables>,
) {
  return ApolloReactHooks.useQuery<GetMeQuery, GetMeQueryVariables>(GetMeDocument, baseOptions);
}
export function useGetMeLazyQuery(
  baseOptions?: ApolloReactHooks.LazyQueryHookOptions<GetMeQuery, GetMeQueryVariables>,
) {
  return ApolloReactHooks.useLazyQuery<GetMeQuery, GetMeQueryVariables>(GetMeDocument, baseOptions);
}
export type GetMeQueryHookResult = ReturnType<typeof useGetMeQuery>;
export type GetMeLazyQueryHookResult = ReturnType<typeof useGetMeLazyQuery>;
export type GetMeQueryResult = ApolloReactCommon.QueryResult<GetMeQuery, GetMeQueryVariables>;
export function refetchGetMeQuery(variables?: GetMeQueryVariables) {
  return { query: GetMeDocument, variables: variables };
}
export const GetGrantedPermissionsDocument = gql`
  query getGrantedPermissions {
    userInfo @client {
      token
      permissions
    }
  }
`;

/**
 * __useGetGrantedPermissionsQuery__
 *
 * To run a query within a React component, call `useGetGrantedPermissionsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetGrantedPermissionsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetGrantedPermissionsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetGrantedPermissionsQuery(
  baseOptions?: ApolloReactHooks.QueryHookOptions<
    GetGrantedPermissionsQuery,
    GetGrantedPermissionsQueryVariables
  >,
) {
  return ApolloReactHooks.useQuery<GetGrantedPermissionsQuery, GetGrantedPermissionsQueryVariables>(
    GetGrantedPermissionsDocument,
    baseOptions,
  );
}
export function useGetGrantedPermissionsLazyQuery(
  baseOptions?: ApolloReactHooks.LazyQueryHookOptions<
    GetGrantedPermissionsQuery,
    GetGrantedPermissionsQueryVariables
  >,
) {
  return ApolloReactHooks.useLazyQuery<
    GetGrantedPermissionsQuery,
    GetGrantedPermissionsQueryVariables
  >(GetGrantedPermissionsDocument, baseOptions);
}
export type GetGrantedPermissionsQueryHookResult = ReturnType<typeof useGetGrantedPermissionsQuery>;
export type GetGrantedPermissionsLazyQueryHookResult = ReturnType<
  typeof useGetGrantedPermissionsLazyQuery
>;
export type GetGrantedPermissionsQueryResult = ApolloReactCommon.QueryResult<
  GetGrantedPermissionsQuery,
  GetGrantedPermissionsQueryVariables
>;
export function refetchGetGrantedPermissionsQuery(variables?: GetGrantedPermissionsQueryVariables) {
  return { query: GetGrantedPermissionsDocument, variables: variables };
}
export const IsUserLoggedInDocument = gql`
  query IsUserLoggedIn {
    isLoggedIn @client
  }
`;

/**
 * __useIsUserLoggedInQuery__
 *
 * To run a query within a React component, call `useIsUserLoggedInQuery` and pass it any options that fit your needs.
 * When your component renders, `useIsUserLoggedInQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useIsUserLoggedInQuery({
 *   variables: {
 *   },
 * });
 */
export function useIsUserLoggedInQuery(
  baseOptions?: ApolloReactHooks.QueryHookOptions<
    IsUserLoggedInQuery,
    IsUserLoggedInQueryVariables
  >,
) {
  return ApolloReactHooks.useQuery<IsUserLoggedInQuery, IsUserLoggedInQueryVariables>(
    IsUserLoggedInDocument,
    baseOptions,
  );
}
export function useIsUserLoggedInLazyQuery(
  baseOptions?: ApolloReactHooks.LazyQueryHookOptions<
    IsUserLoggedInQuery,
    IsUserLoggedInQueryVariables
  >,
) {
  return ApolloReactHooks.useLazyQuery<IsUserLoggedInQuery, IsUserLoggedInQueryVariables>(
    IsUserLoggedInDocument,
    baseOptions,
  );
}
export type IsUserLoggedInQueryHookResult = ReturnType<typeof useIsUserLoggedInQuery>;
export type IsUserLoggedInLazyQueryHookResult = ReturnType<typeof useIsUserLoggedInLazyQuery>;
export type IsUserLoggedInQueryResult = ApolloReactCommon.QueryResult<
  IsUserLoggedInQuery,
  IsUserLoggedInQueryVariables
>;
export function refetchIsUserLoggedInQuery(variables?: IsUserLoggedInQueryVariables) {
  return { query: IsUserLoggedInDocument, variables: variables };
}
export const SetUserInfoDocument = gql`
  mutation setUserInfo($userInfo: UserInfoInput!) {
    setUserInfo(userInfo: $userInfo) @client
  }
`;
export type SetUserInfoMutationFn = ApolloReactCommon.MutationFunction<
  SetUserInfoMutation,
  SetUserInfoMutationVariables
>;

/**
 * __useSetUserInfoMutation__
 *
 * To run a mutation, you first call `useSetUserInfoMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSetUserInfoMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [setUserInfoMutation, { data, loading, error }] = useSetUserInfoMutation({
 *   variables: {
 *      userInfo: // value for 'userInfo'
 *   },
 * });
 */
export function useSetUserInfoMutation(
  baseOptions?: ApolloReactHooks.MutationHookOptions<
    SetUserInfoMutation,
    SetUserInfoMutationVariables
  >,
) {
  return ApolloReactHooks.useMutation<SetUserInfoMutation, SetUserInfoMutationVariables>(
    SetUserInfoDocument,
    baseOptions,
  );
}
export type SetUserInfoMutationHookResult = ReturnType<typeof useSetUserInfoMutation>;
export type SetUserInfoMutationResult = ApolloReactCommon.MutationResult<SetUserInfoMutation>;
export type SetUserInfoMutationOptions = ApolloReactCommon.BaseMutationOptions<
  SetUserInfoMutation,
  SetUserInfoMutationVariables
>;
export const LogOutDocument = gql`
  mutation logOut {
    logOut @client
  }
`;
export type LogOutMutationFn = ApolloReactCommon.MutationFunction<
  LogOutMutation,
  LogOutMutationVariables
>;

/**
 * __useLogOutMutation__
 *
 * To run a mutation, you first call `useLogOutMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useLogOutMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [logOutMutation, { data, loading, error }] = useLogOutMutation({
 *   variables: {
 *   },
 * });
 */
export function useLogOutMutation(
  baseOptions?: ApolloReactHooks.MutationHookOptions<LogOutMutation, LogOutMutationVariables>,
) {
  return ApolloReactHooks.useMutation<LogOutMutation, LogOutMutationVariables>(
    LogOutDocument,
    baseOptions,
  );
}
export type LogOutMutationHookResult = ReturnType<typeof useLogOutMutation>;
export type LogOutMutationResult = ApolloReactCommon.MutationResult<LogOutMutation>;
export type LogOutMutationOptions = ApolloReactCommon.BaseMutationOptions<
  LogOutMutation,
  LogOutMutationVariables
>;

export type ResolverTypeWrapper<T> = Promise<T> | T;

export type LegacyStitchingResolver<TResult, TParent, TContext, TArgs> = {
  fragment: string;
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};

export type NewStitchingResolver<TResult, TParent, TContext, TArgs> = {
  selectionSet: string;
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type StitchingResolver<TResult, TParent, TContext, TArgs> =
  | LegacyStitchingResolver<TResult, TParent, TContext, TArgs>
  | NewStitchingResolver<TResult, TParent, TContext, TArgs>;
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> =
  | ResolverFn<TResult, TParent, TContext, TArgs>
  | StitchingResolver<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo,
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo,
) => AsyncIterator<TResult> | Promise<AsyncIterator<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo,
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<
  TResult,
  TKey extends string,
  TParent,
  TContext,
  TArgs
> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<
  TResult,
  TKey extends string,
  TParent = {},
  TContext = {},
  TArgs = {}
> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo,
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}> = (
  obj: T,
  info: GraphQLResolveInfo,
) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo,
) => TResult | Promise<TResult>;

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  AccessLevel: AccessLevel;
  AddCreditCardInput: AddCreditCardInput;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
  String: ResolverTypeWrapper<Scalars['String']>;
  ID: ResolverTypeWrapper<Scalars['ID']>;
  Address: ResolverTypeWrapper<Address>;
  AddressInput: AddressInput;
  Float: ResolverTypeWrapper<Scalars['Float']>;
  AdministrativeDistrict: ResolverTypeWrapper<AdministrativeDistrict>;
  AdministrativeDistrictLevel: AdministrativeDistrictLevel;
  AllPermissions: ResolverTypeWrapper<AllPermissions>;
  APRType: AprType;
  AvailableResourceLogin: ResolverTypeWrapper<AvailableResourceLogin>;
  Balances: ResolverTypeWrapper<Balances>;
  BillableLineItemInput: BillableLineItemInput;
  Int: ResolverTypeWrapper<Scalars['Int']>;
  BillableService: ResolverTypeWrapper<BillableService>;
  BillableServiceAction: BillableServiceAction;
  BillableServiceCalculateInput: BillableServiceCalculateInput;
  BillableServiceUnit: BillableServiceUnit;
  BillingCycle: BillingCycle;
  BillingJobSite: ResolverTypeWrapper<BillingJobSite>;
  Company: ResolverTypeWrapper<Company>;
  CompanyUpdateInput: CompanyUpdateInput;
  ContactPhoneInput: ContactPhoneInput;
  ContactPhoneType: ContactPhoneType;
  CreditCard: ResolverTypeWrapper<CreditCard>;
  CreditCardFilter: CreditCardFilter;
  Currency: Currency;
  CustomerAddress: ResolverTypeWrapper<CustomerAddress>;
  CustomerAddressInput: CustomerAddressInput;
  CustomerContactInput: CustomerContactInput;
  CustomerFilter: CustomerFilter;
  CustomerTruck: ResolverTypeWrapper<CustomerTruck>;
  CustomerTruckDeleteResult: ResolverTypeWrapper<CustomerTruckDeleteResult>;
  CustomerTruckFilter: CustomerTruckFilter;
  CustomerTruckForOrderCreate: ResolverTypeWrapper<CustomerTruckForOrderCreate>;
  CustomerTruckIndexed: ResolverTypeWrapper<CustomerTruckIndexed>;
  CustomerTruckIndexedFilter: CustomerTruckIndexedFilter;
  CustomerTruckInput: CustomerTruckInput;
  CustomerTrucksListIndexed: ResolverTypeWrapper<CustomerTrucksListIndexed>;
  CustomerTrucksResponse: ResolverTypeWrapper<CustomerTrucksResponse>;
  CustomerTruckTypes: CustomerTruckTypes;
  CustomerTruckUpdateInput: CustomerTruckUpdateInput;
  CustomerType: CustomerType;
  CustomerUpdateInput: CustomerUpdateInput;
  DateTime: ResolverTypeWrapper<Scalars['DateTime']>;
  DestinationFilter: DestinationFilter;
  DestinationsResponse: ResolverTypeWrapper<DestinationsResponse>;
  EditCreditCardInput: EditCreditCardInput;
  Equipment: ResolverTypeWrapper<Equipment>;
  EquipmentFilterInput: EquipmentFilterInput;
  EquipmentInput: EquipmentInput;
  EquipmentsResponse: ResolverTypeWrapper<EquipmentsResponse>;
  EquipmentType: EquipmentType;
  EquipmentUpdateInput: EquipmentUpdateInput;
  Feature: ResolverTypeWrapper<Scalars['Feature']>;
  FileDeleteResult: ResolverTypeWrapper<FileDeleteResult>;
  FinanceMethod: FinanceMethod;
  Gateway: Gateway;
  Geometry: ResolverTypeWrapper<Scalars['Geometry']>;
  GradingPayloadInput: GradingPayloadInput;
  HaulingBillableItem: ResolverTypeWrapper<HaulingBillableItem>;
  HaulingBillableItemFilterInput: HaulingBillableItemFilterInput;
  HaulingBillableItemType: HaulingBillableItemType;
  HaulingBillableItemUnit: HaulingBillableItemUnit;
  HaulingCalculateRatesInput: HaulingCalculateRatesInput;
  HaulingCalculateRatesResult: ResolverTypeWrapper<HaulingCalculateRatesResult>;
  HaulingCompanyGeneralSettings: ResolverTypeWrapper<HaulingCompanyGeneralSettings>;
  HaulingCustomer: ResolverTypeWrapper<HaulingCustomer>;
  HaulingCustomerGroup: ResolverTypeWrapper<HaulingCustomerGroup>;
  HaulingCustomerGroupFilter: HaulingCustomerGroupFilter;
  HaulingCustomerGroupType: HaulingCustomerGroupType;
  HaulingCustomerInput: HaulingCustomerInput;
  HaulingCustomerJobSite: ResolverTypeWrapper<HaulingCustomerJobSite>;
  HaulingCustomerJobSiteFilterInput: HaulingCustomerJobSiteFilterInput;
  HaulingCustomerJobSiteInput: HaulingCustomerJobSiteInput;
  HaulingCustomerJobSitePairByIdFilterInput: HaulingCustomerJobSitePairByIdFilterInput;
  HaulingCustomerJobSitePairFilterInput: HaulingCustomerJobSitePairFilterInput;
  HaulingCustomersResponse: ResolverTypeWrapper<HaulingCustomersResponse>;
  HaulingCustomerStatus: HaulingCustomerStatus;
  HaulingCustomRates: ResolverTypeWrapper<HaulingCustomRates>;
  HaulingDestination: ResolverTypeWrapper<HaulingDestination>;
  HaulingDestinationInput: HaulingDestinationInput;
  HaulingDestinationUpdateInput: HaulingDestinationUpdateInput;
  HaulingDriver: ResolverTypeWrapper<HaulingDriver>;
  HaulingDriverBU: ResolverTypeWrapper<HaulingDriverBu>;
  HaulingGlobalRates: ResolverTypeWrapper<HaulingGlobalRates>;
  HaulingJobSite: ResolverTypeWrapper<HaulingJobSite>;
  HaulingJobSiteAddress: ResolverTypeWrapper<HaulingJobSiteAddress>;
  HaulingJobSiteAddressInput: HaulingJobSiteAddressInput;
  HaulingJobSiteInput: HaulingJobSiteInput;
  haulingJobSitesResponse: ResolverTypeWrapper<HaulingJobSitesResponse>;
  HaulingJobSiteUpdateInput: HaulingJobSiteUpdateInput;
  HaulingMaterial: ResolverTypeWrapper<HaulingMaterial>;
  HaulingMaterialFilterInput: HaulingMaterialFilterInput;
  HaulingMaterialInput: HaulingMaterialInput;
  HaulingMaterialsResponse: ResolverTypeWrapper<HaulingMaterialsResponse>;
  HaulingMaterialUpdateInput: HaulingMaterialUpdateInput;
  HaulingMeasurementUnit: HaulingMeasurementUnit;
  HaulingOrderHistory: ResolverTypeWrapper<Scalars['HaulingOrderHistory']>;
  HaulingOrigin: ResolverTypeWrapper<HaulingOrigin>;
  HaulingOriginDistrict: ResolverTypeWrapper<HaulingOriginDistrict>;
  HaulingOriginDistrictInput: HaulingOriginDistrictInput;
  HaulingPhone: ResolverTypeWrapper<HaulingPhone>;
  HaulingPhoneType: HaulingPhoneType;
  HaulingPriceGroup: ResolverTypeWrapper<HaulingPriceGroup>;
  HaulingPriceGroupFilterInput: HaulingPriceGroupFilterInput;
  HaulingPriceGroupsResult: ResolverTypeWrapper<HaulingPriceGroupsResult>;
  HaulingPriceGroupsResultLevel: HaulingPriceGroupsResultLevel;
  HaulingProject: ResolverTypeWrapper<HaulingProject>;
  HaulingProjectFilter: HaulingProjectFilter;
  HaulingRatesLineItemResult: ResolverTypeWrapper<HaulingRatesLineItemResult>;
  HaulingRatesServiceResult: ResolverTypeWrapper<HaulingRatesServiceResult>;
  HaulingServiceDaysAndHours: ResolverTypeWrapper<HaulingServiceDaysAndHours>;
  HaulingServiceDaysAndHoursFilter: HaulingServiceDaysAndHoursFilter;
  HaulingServiceDaysAndHoursInput: HaulingServiceDaysAndHoursInput;
  HaulingServiceDaysAndHoursUpdateInput: HaulingServiceDaysAndHoursUpdateInput;
  HaulingTaxDistrict: ResolverTypeWrapper<HaulingTaxDistrict>;
  Highlight: ResolverTypeWrapper<Scalars['Highlight']>;
  InvoiceConstruction: InvoiceConstruction;
  JobSiteFilter: JobSiteFilter;
  JobSiteInput: JobSiteInput;
  LineItemExclusions: ResolverTypeWrapper<LineItemExclusions>;
  LineItemTax: ResolverTypeWrapper<LineItemTax>;
  ListPermissionsResult: ResolverTypeWrapper<ListPermissionsResult>;
  ListResourcesResult: ResolverTypeWrapper<ListResourcesResult>;
  ListRolesResult: ResolverTypeWrapper<ListRolesResult>;
  ListUsersResult: ResolverTypeWrapper<ListUsersResult>;
  Me: ResolverTypeWrapper<Me>;
  MeasurementType: MeasurementType;
  MeasurementUnit: MeasurementUnit;
  Mutation: ResolverTypeWrapper<{}>;
  NonGroupLineItemTaxValue: ResolverTypeWrapper<NonGroupLineItemTaxValue>;
  NonGroupTaxValue: ResolverTypeWrapper<NonGroupTaxValue>;
  ObjectLiteralScalar: ResolverTypeWrapper<Scalars['ObjectLiteralScalar']>;
  OnTheWayNumber: ResolverTypeWrapper<OnTheWayNumber>;
  Order: ResolverTypeWrapper<Order>;
  OrderApprovedRequestInput: OrderApprovedRequestInput;
  OrderBillableItem: ResolverTypeWrapper<OrderBillableItem>;
  OrderBillableItemInput: OrderBillableItemInput;
  OrderBillableItemType: OrderBillableItemType;
  OrderCompletedRequestInput: OrderCompletedRequestInput;
  OrderDeleteResult: ResolverTypeWrapper<OrderDeleteResult>;
  OrderFilterInput: OrderFilterInput;
  OrderImage: ResolverTypeWrapper<OrderImage>;
  OrderImageInput: OrderImageInput;
  OrderIndexed: ResolverTypeWrapper<OrderIndexed>;
  OrderInput: OrderInput;
  OrderMaterialDistribution: ResolverTypeWrapper<OrderMaterialDistribution>;
  OrderMaterialDistributionInput: OrderMaterialDistributionInput;
  OrderMiscellaneousMaterialDistribution: ResolverTypeWrapper<
    OrderMiscellaneousMaterialDistribution
  >;
  OrderMiscellaneousMaterialDistributionInput: OrderMiscellaneousMaterialDistributionInput;
  OrderPriceSourceType: OrderPriceSourceType;
  OrdersIndexedFilter: OrdersIndexedFilter;
  OrdersIndexedList: ResolverTypeWrapper<OrdersIndexedList>;
  OrdersIndexedResponse: ResolverTypeWrapper<OrdersIndexedResponse>;
  OrdersResponse: ResolverTypeWrapper<OrdersResponse>;
  OrderStatus: OrderStatus;
  OrderTotalByStatus: ResolverTypeWrapper<OrderTotalByStatus>;
  OrderType: OrderType;
  OrderUpdateInput: OrderUpdateInput;
  OriginFilter: OriginFilter;
  OriginInput: OriginInput;
  OriginsResponse: ResolverTypeWrapper<OriginsResponse>;
  OriginUpdateInput: OriginUpdateInput;
  PaginationInput: PaginationInput;
  PaymentMethodType: PaymentMethodType;
  PaymentTerm: PaymentTerm;
  Permission: ResolverTypeWrapper<Permission>;
  PermissionDeleteResult: ResolverTypeWrapper<PermissionDeleteResult>;
  PermissionInput: PermissionInput;
  PermissionsFilterInput: PermissionsFilterInput;
  PermissionsSortInput: PermissionsSortInput;
  PermissionUpdateInput: PermissionUpdateInput;
  Phone: ResolverTypeWrapper<Phone>;
  PhoneInput: PhoneInput;
  PhoneType: PhoneType;
  Point: ResolverTypeWrapper<Scalars['Point']>;
  PolicyEffect: PolicyEffect;
  PolicyEntry: ResolverTypeWrapper<PolicyEntry>;
  PolicyEntryInput: PolicyEntryInput;
  PolicyInput: PolicyInput;
  PolicyStatementInput: PolicyStatementInput;
  PolicyStatementTemplateInput: PolicyStatementTemplateInput;
  PolicyTemplateInput: PolicyTemplateInput;
  PopulateEntityEvent: PopulateEntityEvent;
  ProjectInput: ProjectInput;
  Query: ResolverTypeWrapper<{}>;
  RangeFilter: RangeFilter;
  Resource: ResolverTypeWrapper<Resource>;
  ResourceDeleteResult: ResolverTypeWrapper<ResourceDeleteResult>;
  ResourceInput: ResourceInput;
  ResourceLogin: ResolverTypeWrapper<ResourceLogin>;
  ResourcesFilterInput: ResourcesFilterInput;
  ResourcesSortInput: ResourcesSortInput;
  ResourceType: ResourceType;
  ResourceUpdateInput: ResourceUpdateInput;
  Role: ResolverTypeWrapper<Role>;
  RoleInput: RoleInput;
  RolePolicy: ResolverTypeWrapper<RolePolicy>;
  RolePolicyStatement: ResolverTypeWrapper<RolePolicyStatement>;
  RolePolicyTemplate: ResolverTypeWrapper<RolePolicyTemplate>;
  RolesFilter: RolesFilter;
  RoleStatus: RoleStatus;
  SalesRepresentative: ResolverTypeWrapper<SalesRepresentative>;
  SalesRepresentativeInput: SalesRepresentativeInput;
  Scale: ResolverTypeWrapper<Scale>;
  ScaleConnectionStatus: ScaleConnectionStatus;
  ScaleDeleteResult: ResolverTypeWrapper<ScaleDeleteResult>;
  ScaleFilterInput: ScaleFilterInput;
  ScaleInput: ScaleInput;
  ScalesResponse: ResolverTypeWrapper<ScalesResponse>;
  ScaleUpdateInput: ScaleUpdateInput;
  SearchBodyInput: SearchBodyInput;
  ServiceDaysAndHoursResponse: ResolverTypeWrapper<ServiceDaysAndHoursResponse>;
  SortInput: SortInput;
  Tax: ResolverTypeWrapper<Tax>;
  TaxApplication: TaxApplication;
  TaxBusinessConfiguration: ResolverTypeWrapper<TaxBusinessConfiguration>;
  TaxCalculation: TaxCalculation;
  TaxDistrictFilter: TaxDistrictFilter;
  TaxDistrictType: TaxDistrictType;
  TrucksForOrderCreateFilterInput: TrucksForOrderCreateFilterInput;
  Upload: ResolverTypeWrapper<Scalars['Upload']>;
  UploadFileResponse: ResolverTypeWrapper<UploadFileResponse>;
  User: ResolverTypeWrapper<User>;
  UserCreateInput: UserCreateInput;
  UserPolicy: ResolverTypeWrapper<UserPolicy>;
  UserPolicyStatement: ResolverTypeWrapper<UserPolicyStatement>;
  UsersFilter: UsersFilter;
  UserStatus: UserStatus;
  UserUpdateInput: UserUpdateInput;
  YardConsoleActivityInput: YardConsoleActivityInput;
  YardConsoleActivityTotal: ResolverTypeWrapper<YardConsoleActivityTotal>;
  ReactElement: ResolverTypeWrapper<Scalars['ReactElement']>;
  Function: ResolverTypeWrapper<Scalars['Function']>;
  AsyncFunction: ResolverTypeWrapper<Scalars['AsyncFunction']>;
  UserInfo: ResolverTypeWrapper<UserInfo>;
  UserInfoInput: UserInfoInput;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  AddCreditCardInput: AddCreditCardInput;
  Boolean: Scalars['Boolean'];
  String: Scalars['String'];
  ID: Scalars['ID'];
  Address: Address;
  AddressInput: AddressInput;
  Float: Scalars['Float'];
  AdministrativeDistrict: AdministrativeDistrict;
  AllPermissions: AllPermissions;
  AvailableResourceLogin: AvailableResourceLogin;
  Balances: Balances;
  BillableLineItemInput: BillableLineItemInput;
  Int: Scalars['Int'];
  BillableService: BillableService;
  BillableServiceCalculateInput: BillableServiceCalculateInput;
  BillingJobSite: BillingJobSite;
  Company: Company;
  CompanyUpdateInput: CompanyUpdateInput;
  ContactPhoneInput: ContactPhoneInput;
  CreditCard: CreditCard;
  CreditCardFilter: CreditCardFilter;
  CustomerAddress: CustomerAddress;
  CustomerAddressInput: CustomerAddressInput;
  CustomerContactInput: CustomerContactInput;
  CustomerFilter: CustomerFilter;
  CustomerTruck: CustomerTruck;
  CustomerTruckDeleteResult: CustomerTruckDeleteResult;
  CustomerTruckFilter: CustomerTruckFilter;
  CustomerTruckForOrderCreate: CustomerTruckForOrderCreate;
  CustomerTruckIndexed: CustomerTruckIndexed;
  CustomerTruckIndexedFilter: CustomerTruckIndexedFilter;
  CustomerTruckInput: CustomerTruckInput;
  CustomerTrucksListIndexed: CustomerTrucksListIndexed;
  CustomerTrucksResponse: CustomerTrucksResponse;
  CustomerTruckUpdateInput: CustomerTruckUpdateInput;
  CustomerUpdateInput: CustomerUpdateInput;
  DateTime: Scalars['DateTime'];
  DestinationFilter: DestinationFilter;
  DestinationsResponse: DestinationsResponse;
  EditCreditCardInput: EditCreditCardInput;
  Equipment: Equipment;
  EquipmentFilterInput: EquipmentFilterInput;
  EquipmentInput: EquipmentInput;
  EquipmentsResponse: EquipmentsResponse;
  EquipmentUpdateInput: EquipmentUpdateInput;
  Feature: Scalars['Feature'];
  FileDeleteResult: FileDeleteResult;
  Geometry: Scalars['Geometry'];
  GradingPayloadInput: GradingPayloadInput;
  HaulingBillableItem: HaulingBillableItem;
  HaulingBillableItemFilterInput: HaulingBillableItemFilterInput;
  HaulingCalculateRatesInput: HaulingCalculateRatesInput;
  HaulingCalculateRatesResult: HaulingCalculateRatesResult;
  HaulingCompanyGeneralSettings: HaulingCompanyGeneralSettings;
  HaulingCustomer: HaulingCustomer;
  HaulingCustomerGroup: HaulingCustomerGroup;
  HaulingCustomerGroupFilter: HaulingCustomerGroupFilter;
  HaulingCustomerInput: HaulingCustomerInput;
  HaulingCustomerJobSite: HaulingCustomerJobSite;
  HaulingCustomerJobSiteFilterInput: HaulingCustomerJobSiteFilterInput;
  HaulingCustomerJobSiteInput: HaulingCustomerJobSiteInput;
  HaulingCustomerJobSitePairByIdFilterInput: HaulingCustomerJobSitePairByIdFilterInput;
  HaulingCustomerJobSitePairFilterInput: HaulingCustomerJobSitePairFilterInput;
  HaulingCustomersResponse: HaulingCustomersResponse;
  HaulingCustomRates: HaulingCustomRates;
  HaulingDestination: HaulingDestination;
  HaulingDestinationInput: HaulingDestinationInput;
  HaulingDestinationUpdateInput: HaulingDestinationUpdateInput;
  HaulingDriver: HaulingDriver;
  HaulingDriverBU: HaulingDriverBu;
  HaulingGlobalRates: HaulingGlobalRates;
  HaulingJobSite: HaulingJobSite;
  HaulingJobSiteAddress: HaulingJobSiteAddress;
  HaulingJobSiteAddressInput: HaulingJobSiteAddressInput;
  HaulingJobSiteInput: HaulingJobSiteInput;
  haulingJobSitesResponse: HaulingJobSitesResponse;
  HaulingJobSiteUpdateInput: HaulingJobSiteUpdateInput;
  HaulingMaterial: HaulingMaterial;
  HaulingMaterialFilterInput: HaulingMaterialFilterInput;
  HaulingMaterialInput: HaulingMaterialInput;
  HaulingMaterialsResponse: HaulingMaterialsResponse;
  HaulingMaterialUpdateInput: HaulingMaterialUpdateInput;
  HaulingOrderHistory: Scalars['HaulingOrderHistory'];
  HaulingOrigin: HaulingOrigin;
  HaulingOriginDistrict: HaulingOriginDistrict;
  HaulingOriginDistrictInput: HaulingOriginDistrictInput;
  HaulingPhone: HaulingPhone;
  HaulingPriceGroup: HaulingPriceGroup;
  HaulingPriceGroupFilterInput: HaulingPriceGroupFilterInput;
  HaulingPriceGroupsResult: HaulingPriceGroupsResult;
  HaulingProject: HaulingProject;
  HaulingProjectFilter: HaulingProjectFilter;
  HaulingRatesLineItemResult: HaulingRatesLineItemResult;
  HaulingRatesServiceResult: HaulingRatesServiceResult;
  HaulingServiceDaysAndHours: HaulingServiceDaysAndHours;
  HaulingServiceDaysAndHoursFilter: HaulingServiceDaysAndHoursFilter;
  HaulingServiceDaysAndHoursInput: HaulingServiceDaysAndHoursInput;
  HaulingServiceDaysAndHoursUpdateInput: HaulingServiceDaysAndHoursUpdateInput;
  HaulingTaxDistrict: HaulingTaxDistrict;
  Highlight: Scalars['Highlight'];
  JobSiteFilter: JobSiteFilter;
  JobSiteInput: JobSiteInput;
  LineItemExclusions: LineItemExclusions;
  LineItemTax: LineItemTax;
  ListPermissionsResult: ListPermissionsResult;
  ListResourcesResult: ListResourcesResult;
  ListRolesResult: ListRolesResult;
  ListUsersResult: ListUsersResult;
  Me: Me;
  Mutation: {};
  NonGroupLineItemTaxValue: NonGroupLineItemTaxValue;
  NonGroupTaxValue: NonGroupTaxValue;
  ObjectLiteralScalar: Scalars['ObjectLiteralScalar'];
  OnTheWayNumber: OnTheWayNumber;
  Order: Order;
  OrderApprovedRequestInput: OrderApprovedRequestInput;
  OrderBillableItem: OrderBillableItem;
  OrderBillableItemInput: OrderBillableItemInput;
  OrderCompletedRequestInput: OrderCompletedRequestInput;
  OrderDeleteResult: OrderDeleteResult;
  OrderFilterInput: OrderFilterInput;
  OrderImage: OrderImage;
  OrderImageInput: OrderImageInput;
  OrderIndexed: OrderIndexed;
  OrderInput: OrderInput;
  OrderMaterialDistribution: OrderMaterialDistribution;
  OrderMaterialDistributionInput: OrderMaterialDistributionInput;
  OrderMiscellaneousMaterialDistribution: OrderMiscellaneousMaterialDistribution;
  OrderMiscellaneousMaterialDistributionInput: OrderMiscellaneousMaterialDistributionInput;
  OrdersIndexedFilter: OrdersIndexedFilter;
  OrdersIndexedList: OrdersIndexedList;
  OrdersIndexedResponse: OrdersIndexedResponse;
  OrdersResponse: OrdersResponse;
  OrderTotalByStatus: OrderTotalByStatus;
  OrderUpdateInput: OrderUpdateInput;
  OriginFilter: OriginFilter;
  OriginInput: OriginInput;
  OriginsResponse: OriginsResponse;
  OriginUpdateInput: OriginUpdateInput;
  PaginationInput: PaginationInput;
  Permission: Permission;
  PermissionDeleteResult: PermissionDeleteResult;
  PermissionInput: PermissionInput;
  PermissionsFilterInput: PermissionsFilterInput;
  PermissionsSortInput: PermissionsSortInput;
  PermissionUpdateInput: PermissionUpdateInput;
  Phone: Phone;
  PhoneInput: PhoneInput;
  Point: Scalars['Point'];
  PolicyEntry: PolicyEntry;
  PolicyEntryInput: PolicyEntryInput;
  PolicyInput: PolicyInput;
  PolicyStatementInput: PolicyStatementInput;
  PolicyStatementTemplateInput: PolicyStatementTemplateInput;
  PolicyTemplateInput: PolicyTemplateInput;
  PopulateEntityEvent: PopulateEntityEvent;
  ProjectInput: ProjectInput;
  Query: {};
  RangeFilter: RangeFilter;
  Resource: Resource;
  ResourceDeleteResult: ResourceDeleteResult;
  ResourceInput: ResourceInput;
  ResourceLogin: ResourceLogin;
  ResourcesFilterInput: ResourcesFilterInput;
  ResourcesSortInput: ResourcesSortInput;
  ResourceUpdateInput: ResourceUpdateInput;
  Role: Role;
  RoleInput: RoleInput;
  RolePolicy: RolePolicy;
  RolePolicyStatement: RolePolicyStatement;
  RolePolicyTemplate: RolePolicyTemplate;
  RolesFilter: RolesFilter;
  SalesRepresentative: SalesRepresentative;
  SalesRepresentativeInput: SalesRepresentativeInput;
  Scale: Scale;
  ScaleDeleteResult: ScaleDeleteResult;
  ScaleFilterInput: ScaleFilterInput;
  ScaleInput: ScaleInput;
  ScalesResponse: ScalesResponse;
  ScaleUpdateInput: ScaleUpdateInput;
  SearchBodyInput: SearchBodyInput;
  ServiceDaysAndHoursResponse: ServiceDaysAndHoursResponse;
  SortInput: SortInput;
  Tax: Tax;
  TaxBusinessConfiguration: TaxBusinessConfiguration;
  TaxDistrictFilter: TaxDistrictFilter;
  TrucksForOrderCreateFilterInput: TrucksForOrderCreateFilterInput;
  Upload: Scalars['Upload'];
  UploadFileResponse: UploadFileResponse;
  User: User;
  UserCreateInput: UserCreateInput;
  UserPolicy: UserPolicy;
  UserPolicyStatement: UserPolicyStatement;
  UsersFilter: UsersFilter;
  UserUpdateInput: UserUpdateInput;
  YardConsoleActivityInput: YardConsoleActivityInput;
  YardConsoleActivityTotal: YardConsoleActivityTotal;
  ReactElement: Scalars['ReactElement'];
  Function: Scalars['Function'];
  AsyncFunction: Scalars['AsyncFunction'];
  UserInfo: UserInfo;
  UserInfoInput: UserInfoInput;
};

export type AddressResolvers<
  ContextType = GraphQLClientContext,
  ParentType extends ResolversParentTypes['Address'] = ResolversParentTypes['Address']
> = {
  addressLine1?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  addressLine2?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  city?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  region?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  state?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  zip?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export type AdministrativeDistrictResolvers<
  ContextType = GraphQLClientContext,
  ParentType extends ResolversParentTypes['AdministrativeDistrict'] = ResolversParentTypes['AdministrativeDistrict']
> = {
  city?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  county?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  level?: Resolver<ResolversTypes['AdministrativeDistrictLevel'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  state?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export type AllPermissionsResolvers<
  ContextType = GraphQLClientContext,
  ParentType extends ResolversParentTypes['AllPermissions'] = ResolversParentTypes['AllPermissions']
> = {
  entries?: Resolver<Array<ResolversTypes['PolicyEntry']>, ParentType, ContextType>;
  resource?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export type AvailableResourceLoginResolvers<
  ContextType = GraphQLClientContext,
  ParentType extends ResolversParentTypes['AvailableResourceLogin'] = ResolversParentTypes['AvailableResourceLogin']
> = {
  hasGradingAccess?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  hasRecyclingAccess?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  image?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  label?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  loginUrl?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  subLabel?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  targetType?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  tenantName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export type BalancesResolvers<
  ContextType = GraphQLClientContext,
  ParentType extends ResolversParentTypes['Balances'] = ResolversParentTypes['Balances']
> = {
  availableCredit?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  balance?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  creditLimit?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  nonInvoicedTotal?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  paymentDue?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  prepaidDeposits?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  prepaidOnAccount?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export type BillableServiceResolvers<
  ContextType = GraphQLClientContext,
  ParentType extends ResolversParentTypes['BillableService'] = ResolversParentTypes['BillableService']
> = {
  action?: Resolver<ResolversTypes['BillableServiceAction'], ParentType, ContextType>;
  active?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  businessLineId?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  description?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  equipmentItemId?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  materialBasedPricing?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  unit?: Resolver<ResolversTypes['BillableServiceUnit'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export type BillingJobSiteResolvers<
  ContextType = GraphQLClientContext,
  ParentType extends ResolversParentTypes['BillingJobSite'] = ResolversParentTypes['BillingJobSite']
> = {
  addressLine1?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  addressLine2?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  city?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  state?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  zip?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export type CompanyResolvers<
  ContextType = GraphQLClientContext,
  ParentType extends ResolversParentTypes['Company'] = ResolversParentTypes['Company']
> = {
  businessLineId?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  businessTimeFridayEnd?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  businessTimeFridayStart?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  businessTimeMondayEnd?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  businessTimeMondayStart?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  businessTimeSaturdayEnd?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  businessTimeSaturdayStart?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  businessTimeSundayEnd?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  businessTimeSundayStart?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  businessTimeThursdayEnd?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  businessTimeThursdayStart?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  businessTimeTuesdayEnd?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  businessTimeTuesdayStart?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  businessTimeWednesdayEnd?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  businessTimeWednesdayStart?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  businessUnitId?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  ccGateway?: Resolver<Maybe<ResolversTypes['Gateway']>, ParentType, ContextType>;
  companyName1?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  companyName2?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  currency?: Resolver<Maybe<ResolversTypes['Currency']>, ParentType, ContextType>;
  documentType?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  email?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  emailBody?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  facilityAddress?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  facilityAddress2?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  facilityCity?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  facilityState?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  facilityZip?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  fax?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  financeAPR?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  financeMethod?: Resolver<Maybe<ResolversTypes['FinanceMethod']>, ParentType, ContextType>;
  firstInvoice?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  jobSiteId?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  logoUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  mailingAddress?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  mailingAddress2?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  mailingCity?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  mailingFrom?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  mailingReplyTo?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  mailingSendCopyTo?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  mailingState?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  mailingZip?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  minBalance?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  minFinanceCharge?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  phone?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  printNodeApiKey?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  region?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  requireDestinationOnWeightOut?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  requireOriginOfInboundLoads?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  subject?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  timezone?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  website?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  yardInstructions?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export type CreditCardResolvers<
  ContextType = GraphQLClientContext,
  ParentType extends ResolversParentTypes['CreditCard'] = ResolversParentTypes['CreditCard']
> = {
  active?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  addressLine1?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  addressLine2?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  cardNickname?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  cardNumberLastDigits?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  cardType?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  ccAccountId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  ccAccountToken?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  city?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  customerId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  expDate?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  expirationDate?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  expiredLabel?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  isAutopay?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  jobSites?: Resolver<Maybe<Array<ResolversTypes['BillingJobSite']>>, ParentType, ContextType>;
  nameOnCard?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  paymentGateway?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  state?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  zip?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export type CustomerAddressResolvers<
  ContextType = GraphQLClientContext,
  ParentType extends ResolversParentTypes['CustomerAddress'] = ResolversParentTypes['CustomerAddress']
> = {
  addressLine1?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  addressLine2?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  city?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  state?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  zip?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export type CustomerTruckResolvers<
  ContextType = GraphQLClientContext,
  ParentType extends ResolversParentTypes['CustomerTruck'] = ResolversParentTypes['CustomerTruck']
> = {
  active?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  customerId?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  emptyWeight?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  emptyWeightSource?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  emptyWeightTimestamp?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  emptyWeightType?: Resolver<Maybe<ResolversTypes['MeasurementType']>, ParentType, ContextType>;
  emptyWeightUnit?: Resolver<Maybe<ResolversTypes['MeasurementUnit']>, ParentType, ContextType>;
  emptyWeightUser?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  licensePlate?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  truckNumber?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  type?: Resolver<ResolversTypes['CustomerTruckTypes'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export type CustomerTruckDeleteResultResolvers<
  ContextType = GraphQLClientContext,
  ParentType extends ResolversParentTypes['CustomerTruckDeleteResult'] = ResolversParentTypes['CustomerTruckDeleteResult']
> = {
  result?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export type CustomerTruckForOrderCreateResolvers<
  ContextType = GraphQLClientContext,
  ParentType extends ResolversParentTypes['CustomerTruckForOrderCreate'] = ResolversParentTypes['CustomerTruckForOrderCreate']
> = {
  active?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  customerId?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  emptyWeight?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  emptyWeightSource?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  emptyWeightTimestamp?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  emptyWeightType?: Resolver<Maybe<ResolversTypes['MeasurementType']>, ParentType, ContextType>;
  emptyWeightUnit?: Resolver<Maybe<ResolversTypes['MeasurementUnit']>, ParentType, ContextType>;
  emptyWeightUser?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  isInUse?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  licensePlate?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  truckNumber?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  type?: Resolver<ResolversTypes['CustomerTruckTypes'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export type CustomerTruckIndexedResolvers<
  ContextType = GraphQLClientContext,
  ParentType extends ResolversParentTypes['CustomerTruckIndexed'] = ResolversParentTypes['CustomerTruckIndexed']
> = {
  active?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  customerId?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  emptyWeight?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  emptyWeightSource?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  emptyWeightTimestamp?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  emptyWeightType?: Resolver<Maybe<ResolversTypes['MeasurementType']>, ParentType, ContextType>;
  emptyWeightUnit?: Resolver<Maybe<ResolversTypes['MeasurementUnit']>, ParentType, ContextType>;
  emptyWeightUser?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  highlight?: Resolver<Maybe<ResolversTypes['Highlight']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  licensePlate?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  truckNumber?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  type?: Resolver<ResolversTypes['CustomerTruckTypes'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export type CustomerTrucksListIndexedResolvers<
  ContextType = GraphQLClientContext,
  ParentType extends ResolversParentTypes['CustomerTrucksListIndexed'] = ResolversParentTypes['CustomerTrucksListIndexed']
> = {
  data?: Resolver<Array<ResolversTypes['CustomerTruckIndexed']>, ParentType, ContextType>;
  total?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export type CustomerTrucksResponseResolvers<
  ContextType = GraphQLClientContext,
  ParentType extends ResolversParentTypes['CustomerTrucksResponse'] = ResolversParentTypes['CustomerTrucksResponse']
> = {
  data?: Resolver<Array<ResolversTypes['CustomerTruck']>, ParentType, ContextType>;
  total?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export interface DateTimeScalarConfig
  extends GraphQLScalarTypeConfig<ResolversTypes['DateTime'], any> {
  name: 'DateTime';
}

export type DestinationsResponseResolvers<
  ContextType = GraphQLClientContext,
  ParentType extends ResolversParentTypes['DestinationsResponse'] = ResolversParentTypes['DestinationsResponse']
> = {
  data?: Resolver<Array<ResolversTypes['HaulingDestination']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export type EquipmentResolvers<
  ContextType = GraphQLClientContext,
  ParentType extends ResolversParentTypes['Equipment'] = ResolversParentTypes['Equipment']
> = {
  active?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  businessLineId?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  closedTop?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  containerTareWeightRequired?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  customerOwned?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  description?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  emptyWeight?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  height?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  length?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  shortDescription?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  size?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  type?: Resolver<ResolversTypes['EquipmentType'], ParentType, ContextType>;
  width?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export type EquipmentsResponseResolvers<
  ContextType = GraphQLClientContext,
  ParentType extends ResolversParentTypes['EquipmentsResponse'] = ResolversParentTypes['EquipmentsResponse']
> = {
  data?: Resolver<Array<ResolversTypes['Equipment']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export interface FeatureScalarConfig
  extends GraphQLScalarTypeConfig<ResolversTypes['Feature'], any> {
  name: 'Feature';
}

export type FileDeleteResultResolvers<
  ContextType = GraphQLClientContext,
  ParentType extends ResolversParentTypes['FileDeleteResult'] = ResolversParentTypes['FileDeleteResult']
> = {
  result?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export interface GeometryScalarConfig
  extends GraphQLScalarTypeConfig<ResolversTypes['Geometry'], any> {
  name: 'Geometry';
}

export type HaulingBillableItemResolvers<
  ContextType = GraphQLClientContext,
  ParentType extends ResolversParentTypes['HaulingBillableItem'] = ResolversParentTypes['HaulingBillableItem']
> = {
  active?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  businessLineId?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  description?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  materialBasedPricing?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  materialIds?: Resolver<Maybe<Array<ResolversTypes['Float']>>, ParentType, ContextType>;
  materials?: Resolver<Maybe<Array<ResolversTypes['HaulingMaterial']>>, ParentType, ContextType>;
  originalId?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  type?: Resolver<ResolversTypes['HaulingBillableItemType'], ParentType, ContextType>;
  unit?: Resolver<ResolversTypes['HaulingBillableItemUnit'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export type HaulingCalculateRatesResultResolvers<
  ContextType = GraphQLClientContext,
  ParentType extends ResolversParentTypes['HaulingCalculateRatesResult'] = ResolversParentTypes['HaulingCalculateRatesResult']
> = {
  customRates?: Resolver<Maybe<ResolversTypes['HaulingCustomRates']>, ParentType, ContextType>;
  globalRates?: Resolver<Maybe<ResolversTypes['HaulingGlobalRates']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export type HaulingCompanyGeneralSettingsResolvers<
  ContextType = GraphQLClientContext,
  ParentType extends ResolversParentTypes['HaulingCompanyGeneralSettings'] = ResolversParentTypes['HaulingCompanyGeneralSettings']
> = {
  clockIn?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  timeZoneName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  unit?: Resolver<ResolversTypes['HaulingMeasurementUnit'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export type HaulingCustomerResolvers<
  ContextType = GraphQLClientContext,
  ParentType extends ResolversParentTypes['HaulingCustomer'] = ResolversParentTypes['HaulingCustomer']
> = {
  active?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  addFinanceCharges?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  alternateId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  aprType?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  attachMediaPref?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  attachTicketPref?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  balances?: Resolver<Maybe<ResolversTypes['Balances']>, ParentType, ContextType>;
  billingAddress?: Resolver<ResolversTypes['CustomerAddress'], ParentType, ContextType>;
  billingCycle?: Resolver<Maybe<ResolversTypes['BillingCycle']>, ParentType, ContextType>;
  businessName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  canTareWeightRequired?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  commercial?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  creditLimit?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  customerGroupId?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  email?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  financeCharge?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  firstName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  generalNote?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  gradingNotification?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  gradingRequired?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  haulerSrn?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  invoiceConstruction?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  invoiceEmails?: Resolver<Maybe<Array<ResolversTypes['String']>>, ParentType, ContextType>;
  jobSiteRequired?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  lastName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  mailingAddress?: Resolver<ResolversTypes['CustomerAddress'], ParentType, ContextType>;
  mainEmail?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  mainFirstName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  mainJobTitle?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  mainLastName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  mainPhoneNumbers?: Resolver<Array<ResolversTypes['HaulingPhone']>, ParentType, ContextType>;
  notificationEmails?: Resolver<Maybe<Array<ResolversTypes['String']>>, ParentType, ContextType>;
  onAccount?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  onHold?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  paymentTerms?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  phoneNumbers?: Resolver<Array<ResolversTypes['HaulingPhone']>, ParentType, ContextType>;
  popupNote?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  poRequired?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  saleRepresentative?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  saleRepresentativeId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  salesId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  selfServiceOrderAllowed?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  sendInvoicesByEmail?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  sendInvoicesByPost?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  signatureRequired?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  statementEmails?: Resolver<Maybe<Array<ResolversTypes['String']>>, ParentType, ContextType>;
  status?: Resolver<ResolversTypes['HaulingCustomerStatus'], ParentType, ContextType>;
  type?: Resolver<ResolversTypes['CustomerType'], ParentType, ContextType>;
  walkup?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  workOrderRequired?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export type HaulingCustomerGroupResolvers<
  ContextType = GraphQLClientContext,
  ParentType extends ResolversParentTypes['HaulingCustomerGroup'] = ResolversParentTypes['HaulingCustomerGroup']
> = {
  active?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  description?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  type?: Resolver<ResolversTypes['HaulingCustomerGroupType'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export type HaulingCustomerJobSiteResolvers<
  ContextType = GraphQLClientContext,
  ParentType extends ResolversParentTypes['HaulingCustomerJobSite'] = ResolversParentTypes['HaulingCustomerJobSite']
> = {
  active?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  address?: Resolver<ResolversTypes['CustomerAddress'], ParentType, ContextType>;
  contactId?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  fullAddress?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  jobSite?: Resolver<ResolversTypes['HaulingJobSite'], ParentType, ContextType>;
  location?: Resolver<ResolversTypes['Point'], ParentType, ContextType>;
  originalId?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  popupNote?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  poRequired?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export type HaulingCustomersResponseResolvers<
  ContextType = GraphQLClientContext,
  ParentType extends ResolversParentTypes['HaulingCustomersResponse'] = ResolversParentTypes['HaulingCustomersResponse']
> = {
  data?: Resolver<Array<ResolversTypes['HaulingCustomer']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export type HaulingCustomRatesResolvers<
  ContextType = GraphQLClientContext,
  ParentType extends ResolversParentTypes['HaulingCustomRates'] = ResolversParentTypes['HaulingCustomRates']
> = {
  customRatesLineItems?: Resolver<
    Maybe<Array<ResolversTypes['HaulingRatesLineItemResult']>>,
    ParentType,
    ContextType
  >;
  customRatesService?: Resolver<
    Maybe<ResolversTypes['HaulingRatesServiceResult']>,
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export type HaulingDestinationResolvers<
  ContextType = GraphQLClientContext,
  ParentType extends ResolversParentTypes['HaulingDestination'] = ResolversParentTypes['HaulingDestination']
> = {
  active?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  addressLine1?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  addressLine2?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  businessUnitId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  city?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  description?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  geojson?: Resolver<Maybe<ResolversTypes['Feature']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  state?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  zip?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export type HaulingDriverResolvers<
  ContextType = GraphQLClientContext,
  ParentType extends ResolversParentTypes['HaulingDriver'] = ResolversParentTypes['HaulingDriver']
> = {
  active?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  businessUnits?: Resolver<Array<ResolversTypes['HaulingDriverBU']>, ParentType, ContextType>;
  description?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  email?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  licenseNumber?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  licenseType?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  phone?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  photoUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  truckId?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export type HaulingDriverBuResolvers<
  ContextType = GraphQLClientContext,
  ParentType extends ResolversParentTypes['HaulingDriverBU'] = ResolversParentTypes['HaulingDriverBU']
> = {
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export type HaulingGlobalRatesResolvers<
  ContextType = GraphQLClientContext,
  ParentType extends ResolversParentTypes['HaulingGlobalRates'] = ResolversParentTypes['HaulingGlobalRates']
> = {
  globalRatesLineItems?: Resolver<
    Maybe<Array<ResolversTypes['HaulingRatesLineItemResult']>>,
    ParentType,
    ContextType
  >;
  globalRatesService?: Resolver<
    ResolversTypes['HaulingRatesServiceResult'],
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export type HaulingJobSiteResolvers<
  ContextType = GraphQLClientContext,
  ParentType extends ResolversParentTypes['HaulingJobSite'] = ResolversParentTypes['HaulingJobSite']
> = {
  address?: Resolver<ResolversTypes['HaulingJobSiteAddress'], ParentType, ContextType>;
  alleyPlacement?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  cabOver?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  fullAddress?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  location?: Resolver<ResolversTypes['Geometry'], ParentType, ContextType>;
  popupNote?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export type HaulingJobSiteAddressResolvers<
  ContextType = GraphQLClientContext,
  ParentType extends ResolversParentTypes['HaulingJobSiteAddress'] = ResolversParentTypes['HaulingJobSiteAddress']
> = {
  addressLine1?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  addressLine2?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  city?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  region?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  state?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  zip?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export type HaulingJobSitesResponseResolvers<
  ContextType = GraphQLClientContext,
  ParentType extends ResolversParentTypes['haulingJobSitesResponse'] = ResolversParentTypes['haulingJobSitesResponse']
> = {
  data?: Resolver<Array<ResolversTypes['HaulingJobSite']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export type HaulingMaterialResolvers<
  ContextType = GraphQLClientContext,
  ParentType extends ResolversParentTypes['HaulingMaterial'] = ResolversParentTypes['HaulingMaterial']
> = {
  active?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  code?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  description?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  misc?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  originalId?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  recycle?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  units?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  useForDump?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  useForLoad?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  yard?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export type HaulingMaterialsResponseResolvers<
  ContextType = GraphQLClientContext,
  ParentType extends ResolversParentTypes['HaulingMaterialsResponse'] = ResolversParentTypes['HaulingMaterialsResponse']
> = {
  data?: Resolver<Array<ResolversTypes['HaulingMaterial']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export interface HaulingOrderHistoryScalarConfig
  extends GraphQLScalarTypeConfig<ResolversTypes['HaulingOrderHistory'], any> {
  name: 'HaulingOrderHistory';
}

export type HaulingOriginResolvers<
  ContextType = GraphQLClientContext,
  ParentType extends ResolversParentTypes['HaulingOrigin'] = ResolversParentTypes['HaulingOrigin']
> = {
  active?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  businessUnitId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  description?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  originDistricts?: Resolver<
    Array<ResolversTypes['HaulingOriginDistrict']>,
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export type HaulingOriginDistrictResolvers<
  ContextType = GraphQLClientContext,
  ParentType extends ResolversParentTypes['HaulingOriginDistrict'] = ResolversParentTypes['HaulingOriginDistrict']
> = {
  city?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  county?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  originId?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  state?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  taxDistrictId?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export type HaulingPhoneResolvers<
  ContextType = GraphQLClientContext,
  ParentType extends ResolversParentTypes['HaulingPhone'] = ResolversParentTypes['HaulingPhone']
> = {
  extension?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  number?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  textOnly?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  type?: Resolver<ResolversTypes['HaulingPhoneType'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export type HaulingPriceGroupResolvers<
  ContextType = GraphQLClientContext,
  ParentType extends ResolversParentTypes['HaulingPriceGroup'] = ResolversParentTypes['HaulingPriceGroup']
> = {
  description?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export type HaulingPriceGroupsResultResolvers<
  ContextType = GraphQLClientContext,
  ParentType extends ResolversParentTypes['HaulingPriceGroupsResult'] = ResolversParentTypes['HaulingPriceGroupsResult']
> = {
  customRatesGroups?: Resolver<
    Maybe<Array<ResolversTypes['HaulingPriceGroup']>>,
    ParentType,
    ContextType
  >;
  level?: Resolver<ResolversTypes['HaulingPriceGroupsResultLevel'], ParentType, ContextType>;
  selectedId?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export type HaulingProjectResolvers<
  ContextType = GraphQLClientContext,
  ParentType extends ResolversParentTypes['HaulingProject'] = ResolversParentTypes['HaulingProject']
> = {
  customerJobSiteId?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  description?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  endDate?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  originalId?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  permitRequired?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  poRequired?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  startDate?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export type HaulingRatesLineItemResultResolvers<
  ContextType = GraphQLClientContext,
  ParentType extends ResolversParentTypes['HaulingRatesLineItemResult'] = ResolversParentTypes['HaulingRatesLineItemResult']
> = {
  id?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  lineItemId?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  materialId?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  price?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export type HaulingRatesServiceResultResolvers<
  ContextType = GraphQLClientContext,
  ParentType extends ResolversParentTypes['HaulingRatesServiceResult'] = ResolversParentTypes['HaulingRatesServiceResult']
> = {
  id?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  price?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export type HaulingServiceDaysAndHoursResolvers<
  ContextType = GraphQLClientContext,
  ParentType extends ResolversParentTypes['HaulingServiceDaysAndHours'] = ResolversParentTypes['HaulingServiceDaysAndHours']
> = {
  businessUnitId?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  dayOfWeek?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  endTime?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  startTime?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export type HaulingTaxDistrictResolvers<
  ContextType = GraphQLClientContext,
  ParentType extends ResolversParentTypes['HaulingTaxDistrict'] = ResolversParentTypes['HaulingTaxDistrict']
> = {
  active?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  bbox?: Resolver<Maybe<Array<ResolversTypes['Float']>>, ParentType, ContextType>;
  businessConfiguration?: Resolver<
    Maybe<Array<ResolversTypes['TaxBusinessConfiguration']>>,
    ParentType,
    ContextType
  >;
  businessLineTaxesIds?: Resolver<Maybe<Array<ResolversTypes['Float']>>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  description?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  districtCode?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  districtName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  districtType?: Resolver<ResolversTypes['TaxDistrictType'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  includeNationalInTaxableAmount?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  taxDescription?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  taxesPerCustomerType?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  useGeneratedDescription?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  userId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export interface HighlightScalarConfig
  extends GraphQLScalarTypeConfig<ResolversTypes['Highlight'], any> {
  name: 'Highlight';
}

export type LineItemExclusionsResolvers<
  ContextType = GraphQLClientContext,
  ParentType extends ResolversParentTypes['LineItemExclusions'] = ResolversParentTypes['LineItemExclusions']
> = {
  lineItems?: Resolver<Array<ResolversTypes['Float']>, ParentType, ContextType>;
  thresholds?: Resolver<Array<ResolversTypes['Float']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export type LineItemTaxResolvers<
  ContextType = GraphQLClientContext,
  ParentType extends ResolversParentTypes['LineItemTax'] = ResolversParentTypes['LineItemTax']
> = {
  application?: Resolver<Maybe<ResolversTypes['TaxApplication']>, ParentType, ContextType>;
  calculation?: Resolver<ResolversTypes['TaxCalculation'], ParentType, ContextType>;
  exclusions?: Resolver<Maybe<ResolversTypes['LineItemExclusions']>, ParentType, ContextType>;
  group?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  nonGroup?: Resolver<Maybe<ResolversTypes['NonGroupLineItemTaxValue']>, ParentType, ContextType>;
  value?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export type ListPermissionsResultResolvers<
  ContextType = GraphQLClientContext,
  ParentType extends ResolversParentTypes['ListPermissionsResult'] = ResolversParentTypes['ListPermissionsResult']
> = {
  data?: Resolver<Array<ResolversTypes['Permission']>, ParentType, ContextType>;
  total?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export type ListResourcesResultResolvers<
  ContextType = GraphQLClientContext,
  ParentType extends ResolversParentTypes['ListResourcesResult'] = ResolversParentTypes['ListResourcesResult']
> = {
  data?: Resolver<Array<ResolversTypes['Resource']>, ParentType, ContextType>;
  total?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export type ListRolesResultResolvers<
  ContextType = GraphQLClientContext,
  ParentType extends ResolversParentTypes['ListRolesResult'] = ResolversParentTypes['ListRolesResult']
> = {
  data?: Resolver<Array<ResolversTypes['Role']>, ParentType, ContextType>;
  total?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export type ListUsersResultResolvers<
  ContextType = GraphQLClientContext,
  ParentType extends ResolversParentTypes['ListUsersResult'] = ResolversParentTypes['ListUsersResult']
> = {
  data?: Resolver<Array<ResolversTypes['User']>, ParentType, ContextType>;
  total?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export type MeResolvers<
  ContextType = GraphQLClientContext,
  ParentType extends ResolversParentTypes['Me'] = ResolversParentTypes['Me']
> = {
  email?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  firstName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  lastName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  permissions?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  resource?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  tenantId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  tenantName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export type MutationResolvers<
  ContextType = GraphQLClientContext,
  ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']
> = {
  approveOrders?: Resolver<
    ResolversTypes['Boolean'],
    ParentType,
    ContextType,
    RequireFields<MutationApproveOrdersArgs, never>
  >;
  bulkRemoveOrder?: Resolver<
    ResolversTypes['Boolean'],
    ParentType,
    ContextType,
    RequireFields<MutationBulkRemoveOrderArgs, 'ids'>
  >;
  calculateHaulingRates?: Resolver<
    Maybe<ResolversTypes['HaulingCalculateRatesResult']>,
    ParentType,
    ContextType,
    RequireFields<MutationCalculateHaulingRatesArgs, 'input'>
  >;
  completeWalkUpCustomerOrder?: Resolver<
    Maybe<ResolversTypes['Boolean']>,
    ParentType,
    ContextType,
    RequireFields<MutationCompleteWalkUpCustomerOrderArgs, 'id'>
  >;
  createAutoOrderBillableItems?: Resolver<
    Maybe<Array<ResolversTypes['OrderBillableItem']>>,
    ParentType,
    ContextType,
    RequireFields<
      MutationCreateAutoOrderBillableItemsArgs,
      'billableItemsIds' | 'distributionMaterials' | 'priceGroupId' | 'type'
    >
  >;
  createCreditCard?: Resolver<
    Maybe<ResolversTypes['CreditCard']>,
    ParentType,
    ContextType,
    RequireFields<MutationCreateCreditCardArgs, 'customerId' | 'data'>
  >;
  createCustomerTruck?: Resolver<
    Maybe<ResolversTypes['CustomerTruck']>,
    ParentType,
    ContextType,
    RequireFields<MutationCreateCustomerTruckArgs, 'data' | 'filter'>
  >;
  createDestination?: Resolver<
    Maybe<ResolversTypes['HaulingDestination']>,
    ParentType,
    ContextType,
    RequireFields<MutationCreateDestinationArgs, 'data'>
  >;
  createEquipment?: Resolver<
    Maybe<ResolversTypes['Equipment']>,
    ParentType,
    ContextType,
    RequireFields<MutationCreateEquipmentArgs, 'data'>
  >;
  createHaulingCustomer?: Resolver<
    ResolversTypes['HaulingCustomer'],
    ParentType,
    ContextType,
    RequireFields<MutationCreateHaulingCustomerArgs, 'data'>
  >;
  createHaulingCustomerJS?: Resolver<
    ResolversTypes['HaulingCustomerJobSite'],
    ParentType,
    ContextType,
    RequireFields<MutationCreateHaulingCustomerJsArgs, 'data'>
  >;
  createHaulingJobSiteOnCore?: Resolver<
    Maybe<ResolversTypes['HaulingJobSite']>,
    ParentType,
    ContextType,
    RequireFields<MutationCreateHaulingJobSiteOnCoreArgs, 'data'>
  >;
  createHaulingMaterial?: Resolver<
    Maybe<ResolversTypes['HaulingMaterial']>,
    ParentType,
    ContextType,
    RequireFields<MutationCreateHaulingMaterialArgs, 'data'>
  >;
  createHaulingProject?: Resolver<
    Maybe<ResolversTypes['HaulingProject']>,
    ParentType,
    ContextType,
    RequireFields<MutationCreateHaulingProjectArgs, 'input'>
  >;
  createOrder?: Resolver<
    Maybe<ResolversTypes['Order']>,
    ParentType,
    ContextType,
    RequireFields<MutationCreateOrderArgs, 'data' | 'filter'>
  >;
  createOrderBillableItems?: Resolver<
    Maybe<Array<ResolversTypes['OrderBillableItem']>>,
    ParentType,
    ContextType,
    RequireFields<
      MutationCreateOrderBillableItemsArgs,
      'billableItemsIds' | 'priceGroupId' | 'type'
    >
  >;
  createOrigin?: Resolver<
    Maybe<ResolversTypes['HaulingOrigin']>,
    ParentType,
    ContextType,
    RequireFields<MutationCreateOriginArgs, 'data'>
  >;
  createPermission?: Resolver<
    ResolversTypes['Permission'],
    ParentType,
    ContextType,
    RequireFields<MutationCreatePermissionArgs, 'data'>
  >;
  createResource?: Resolver<
    ResolversTypes['Resource'],
    ParentType,
    ContextType,
    RequireFields<MutationCreateResourceArgs, 'data'>
  >;
  createRole?: Resolver<
    ResolversTypes['Role'],
    ParentType,
    ContextType,
    RequireFields<MutationCreateRoleArgs, 'roleData'>
  >;
  createScale?: Resolver<
    Maybe<ResolversTypes['Scale']>,
    ParentType,
    ContextType,
    RequireFields<MutationCreateScaleArgs, 'data' | 'filter'>
  >;
  createServiceDaysAndHour?: Resolver<
    Maybe<ResolversTypes['HaulingServiceDaysAndHours']>,
    ParentType,
    ContextType,
    RequireFields<MutationCreateServiceDaysAndHourArgs, 'data'>
  >;
  createUser?: Resolver<
    ResolversTypes['User'],
    ParentType,
    ContextType,
    RequireFields<MutationCreateUserArgs, 'userData'>
  >;
  createhaulingJobSite?: Resolver<
    Maybe<ResolversTypes['HaulingJobSite']>,
    ParentType,
    ContextType,
    RequireFields<MutationCreatehaulingJobSiteArgs, 'data'>
  >;
  deleteCustomerTruck?: Resolver<
    ResolversTypes['CustomerTruckDeleteResult'],
    ParentType,
    ContextType,
    RequireFields<MutationDeleteCustomerTruckArgs, 'filter' | 'id'>
  >;
  deleteFile?: Resolver<
    ResolversTypes['FileDeleteResult'],
    ParentType,
    ContextType,
    RequireFields<MutationDeleteFileArgs, 'fileUrl'>
  >;
  deleteOrder?: Resolver<
    ResolversTypes['OrderDeleteResult'],
    ParentType,
    ContextType,
    RequireFields<MutationDeleteOrderArgs, 'filter' | 'id'>
  >;
  deletePermission?: Resolver<
    ResolversTypes['PermissionDeleteResult'],
    ParentType,
    ContextType,
    RequireFields<MutationDeletePermissionArgs, 'id'>
  >;
  deleteResource?: Resolver<
    ResolversTypes['ResourceDeleteResult'],
    ParentType,
    ContextType,
    RequireFields<MutationDeleteResourceArgs, 'srn'>
  >;
  deleteRole?: Resolver<
    ResolversTypes['Boolean'],
    ParentType,
    ContextType,
    RequireFields<MutationDeleteRoleArgs, 'id'>
  >;
  deleteScale?: Resolver<
    ResolversTypes['ScaleDeleteResult'],
    ParentType,
    ContextType,
    RequireFields<MutationDeleteScaleArgs, 'filter' | 'id'>
  >;
  deleteUser?: Resolver<
    ResolversTypes['Boolean'],
    ParentType,
    ContextType,
    RequireFields<MutationDeleteUserArgs, 'id'>
  >;
  fillOrderBillableItemsWithPrices?: Resolver<
    Maybe<Array<ResolversTypes['OrderBillableItem']>>,
    ParentType,
    ContextType,
    RequireFields<
      MutationFillOrderBillableItemsWithPricesArgs,
      'orderBillableItems' | 'priceGroupId' | 'type'
    >
  >;
  finalizeOrders?: Resolver<
    ResolversTypes['Boolean'],
    ParentType,
    ContextType,
    RequireFields<MutationFinalizeOrdersArgs, never>
  >;
  gradingOrder?: Resolver<
    ResolversTypes['Boolean'],
    ParentType,
    ContextType,
    RequireFields<MutationGradingOrderArgs, 'gradingPayload'>
  >;
  logOut?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  makeOrderApproved?: Resolver<
    Maybe<ResolversTypes['Boolean']>,
    ParentType,
    ContextType,
    RequireFields<MutationMakeOrderApprovedArgs, 'id'>
  >;
  makeOrderCompleted?: Resolver<
    Maybe<ResolversTypes['Boolean']>,
    ParentType,
    ContextType,
    RequireFields<MutationMakeOrderCompletedArgs, 'id'>
  >;
  makeOrderFinalized?: Resolver<
    Maybe<ResolversTypes['Boolean']>,
    ParentType,
    ContextType,
    RequireFields<MutationMakeOrderFinalizedArgs, 'id'>
  >;
  makeOrderInYard?: Resolver<
    ResolversTypes['Boolean'],
    ParentType,
    ContextType,
    RequireFields<MutationMakeOrderInYardArgs, 'id'>
  >;
  makeOrderInvoiced?: Resolver<
    ResolversTypes['Boolean'],
    ParentType,
    ContextType,
    RequireFields<MutationMakeOrderInvoicedArgs, 'id'>
  >;
  makeOrderLoaded?: Resolver<
    ResolversTypes['Boolean'],
    ParentType,
    ContextType,
    RequireFields<MutationMakeOrderLoadedArgs, 'id'>
  >;
  makeOrderPayment?: Resolver<
    Maybe<ResolversTypes['Boolean']>,
    ParentType,
    ContextType,
    RequireFields<MutationMakeOrderPaymentArgs, 'id'>
  >;
  makeOrderWeightOut?: Resolver<
    ResolversTypes['Boolean'],
    ParentType,
    ContextType,
    RequireFields<MutationMakeOrderWeightOutArgs, 'id'>
  >;
  recoverCustomerTruck?: Resolver<
    ResolversTypes['CustomerTruck'],
    ParentType,
    ContextType,
    RequireFields<MutationRecoverCustomerTruckArgs, 'filter'>
  >;
  recoverOrder?: Resolver<
    ResolversTypes['Order'],
    ParentType,
    ContextType,
    RequireFields<MutationRecoverOrderArgs, 'filter'>
  >;
  recoverScale?: Resolver<
    ResolversTypes['Scale'],
    ParentType,
    ContextType,
    RequireFields<MutationRecoverScaleArgs, 'filter'>
  >;
  sendPdfWeightTicketViaEmail?: Resolver<
    ResolversTypes['Boolean'],
    ParentType,
    ContextType,
    RequireFields<MutationSendPdfWeightTicketViaEmailArgs, 'email' | 'id'>
  >;
  sendPopulateElasticSearchIndexInRecycling?: Resolver<
    ResolversTypes['Boolean'],
    ParentType,
    ContextType
  >;
  sendPopulateEntityInRecycling?: Resolver<
    ResolversTypes['Boolean'],
    ParentType,
    ContextType,
    RequireFields<MutationSendPopulateEntityInRecyclingArgs, 'populateEvent'>
  >;
  setCompanyYardInstructions?: Resolver<
    ResolversTypes['Company'],
    ParentType,
    ContextType,
    RequireFields<MutationSetCompanyYardInstructionsArgs, 'yardInstructions'>
  >;
  setUserInfo?: Resolver<
    Maybe<ResolversTypes['Boolean']>,
    ParentType,
    ContextType,
    RequireFields<MutationSetUserInfoArgs, 'userInfo'>
  >;
  updateCompany?: Resolver<
    ResolversTypes['Company'],
    ParentType,
    ContextType,
    RequireFields<MutationUpdateCompanyArgs, 'data'>
  >;
  updateCreditCard?: Resolver<
    Maybe<ResolversTypes['CreditCard']>,
    ParentType,
    ContextType,
    RequireFields<MutationUpdateCreditCardArgs, 'data' | 'id'>
  >;
  updateCustomerTruck?: Resolver<
    ResolversTypes['CustomerTruck'],
    ParentType,
    ContextType,
    RequireFields<MutationUpdateCustomerTruckArgs, 'data' | 'filter'>
  >;
  updateDestination?: Resolver<
    Maybe<ResolversTypes['HaulingDestination']>,
    ParentType,
    ContextType,
    RequireFields<MutationUpdateDestinationArgs, 'data'>
  >;
  updateEquipment?: Resolver<
    Maybe<ResolversTypes['Equipment']>,
    ParentType,
    ContextType,
    RequireFields<MutationUpdateEquipmentArgs, 'data'>
  >;
  updateHaulingCustomer?: Resolver<
    Maybe<ResolversTypes['HaulingCustomer']>,
    ParentType,
    ContextType,
    RequireFields<MutationUpdateHaulingCustomerArgs, 'data'>
  >;
  updateHaulingMaterial?: Resolver<
    Maybe<ResolversTypes['HaulingMaterial']>,
    ParentType,
    ContextType,
    RequireFields<MutationUpdateHaulingMaterialArgs, 'data'>
  >;
  updateOrder?: Resolver<
    ResolversTypes['Order'],
    ParentType,
    ContextType,
    RequireFields<MutationUpdateOrderArgs, 'data' | 'filter'>
  >;
  updateOrigin?: Resolver<
    Maybe<ResolversTypes['HaulingOrigin']>,
    ParentType,
    ContextType,
    RequireFields<MutationUpdateOriginArgs, 'data'>
  >;
  updatePermission?: Resolver<
    ResolversTypes['Permission'],
    ParentType,
    ContextType,
    RequireFields<MutationUpdatePermissionArgs, 'data'>
  >;
  updateResource?: Resolver<
    ResolversTypes['Resource'],
    ParentType,
    ContextType,
    RequireFields<MutationUpdateResourceArgs, 'data'>
  >;
  updateRole?: Resolver<
    ResolversTypes['Role'],
    ParentType,
    ContextType,
    RequireFields<MutationUpdateRoleArgs, 'id' | 'roleData'>
  >;
  updateScale?: Resolver<
    ResolversTypes['Scale'],
    ParentType,
    ContextType,
    RequireFields<MutationUpdateScaleArgs, 'data' | 'filter'>
  >;
  updateServiceDaysAndHour?: Resolver<
    Maybe<ResolversTypes['HaulingServiceDaysAndHours']>,
    ParentType,
    ContextType,
    RequireFields<MutationUpdateServiceDaysAndHourArgs, 'data'>
  >;
  updateUser?: Resolver<
    ResolversTypes['User'],
    ParentType,
    ContextType,
    RequireFields<MutationUpdateUserArgs, 'id' | 'userData'>
  >;
  updatehaulingJobSite?: Resolver<
    Maybe<ResolversTypes['HaulingJobSite']>,
    ParentType,
    ContextType,
    RequireFields<MutationUpdatehaulingJobSiteArgs, 'data'>
  >;
  uploadFile?: Resolver<
    ResolversTypes['UploadFileResponse'],
    ParentType,
    ContextType,
    RequireFields<MutationUploadFileArgs, 'file' | 'pathEntries'>
  >;
};

export type NonGroupLineItemTaxValueResolvers<
  ContextType = GraphQLClientContext,
  ParentType extends ResolversParentTypes['NonGroupLineItemTaxValue'] = ResolversParentTypes['NonGroupLineItemTaxValue']
> = {
  lineItems?: Resolver<Array<ResolversTypes['NonGroupTaxValue']>, ParentType, ContextType>;
  thresholds?: Resolver<Array<ResolversTypes['NonGroupTaxValue']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export type NonGroupTaxValueResolvers<
  ContextType = GraphQLClientContext,
  ParentType extends ResolversParentTypes['NonGroupTaxValue'] = ResolversParentTypes['NonGroupTaxValue']
> = {
  id?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  value?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export interface ObjectLiteralScalarScalarConfig
  extends GraphQLScalarTypeConfig<ResolversTypes['ObjectLiteralScalar'], any> {
  name: 'ObjectLiteralScalar';
}

export type OnTheWayNumberResolvers<
  ContextType = GraphQLClientContext,
  ParentType extends ResolversParentTypes['OnTheWayNumber'] = ResolversParentTypes['OnTheWayNumber']
> = {
  customerBusinessName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  WONumber?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export type OrderResolvers<
  ContextType = GraphQLClientContext,
  ParentType extends ResolversParentTypes['Order'] = ResolversParentTypes['Order']
> = {
  amount?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  arrivedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  beforeTaxesTotal?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  billableItems?: Resolver<Array<ResolversTypes['OrderBillableItem']>, ParentType, ContextType>;
  billableService?: Resolver<Maybe<ResolversTypes['BillableService']>, ParentType, ContextType>;
  bypassScale?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  canTare?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  checkNumber?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  container?: Resolver<Maybe<ResolversTypes['Equipment']>, ParentType, ContextType>;
  containerId?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  creditCardId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  customer?: Resolver<ResolversTypes['HaulingCustomer'], ParentType, ContextType>;
  customerId?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  customerJobSite?: Resolver<
    Maybe<ResolversTypes['HaulingCustomerJobSite']>,
    ParentType,
    ContextType
  >;
  customerJobSiteId?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  customerTruck?: Resolver<Maybe<ResolversTypes['CustomerTruck']>, ParentType, ContextType>;
  customerTruckId?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  deleteDate?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  departureAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  destination?: Resolver<Maybe<ResolversTypes['HaulingDestination']>, ParentType, ContextType>;
  destinationId?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  grandTotal?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  hasWeightTicket?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  haulingOrderId?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  images?: Resolver<Maybe<Array<ResolversTypes['OrderImage']>>, ParentType, ContextType>;
  initialOrderTotal?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  isAch?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  isSelfService?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  jobSite?: Resolver<Maybe<ResolversTypes['HaulingCustomerJobSite']>, ParentType, ContextType>;
  jobSiteId?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  material?: Resolver<Maybe<ResolversTypes['HaulingMaterial']>, ParentType, ContextType>;
  materialId?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  materialsDistribution?: Resolver<
    Array<ResolversTypes['OrderMaterialDistribution']>,
    ParentType,
    ContextType
  >;
  minimalWeight?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  miscellaneousMaterialsDistribution?: Resolver<
    Array<ResolversTypes['OrderMiscellaneousMaterialDistribution']>,
    ParentType,
    ContextType
  >;
  note?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  originDistrict?: Resolver<
    Maybe<ResolversTypes['HaulingOriginDistrict']>,
    ParentType,
    ContextType
  >;
  originDistrictId?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  owner?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  paymentMethod?: Resolver<Maybe<ResolversTypes['PaymentMethodType']>, ParentType, ContextType>;
  PONumber?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  priceGroup?: Resolver<Maybe<ResolversTypes['HaulingPriceGroup']>, ParentType, ContextType>;
  priceGroupId?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  project?: Resolver<Maybe<ResolversTypes['HaulingProject']>, ParentType, ContextType>;
  projectId?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  status?: Resolver<ResolversTypes['OrderStatus'], ParentType, ContextType>;
  taxDistricts?: Resolver<
    Maybe<Array<ResolversTypes['HaulingTaxDistrict']>>,
    ParentType,
    ContextType
  >;
  taxTotal?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  truckTare?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  type?: Resolver<ResolversTypes['OrderType'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  useTare?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  weightIn?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  weightInSource?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  weightInTimestamp?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  weightInType?: Resolver<Maybe<ResolversTypes['MeasurementType']>, ParentType, ContextType>;
  weightInUnit?: Resolver<Maybe<ResolversTypes['MeasurementUnit']>, ParentType, ContextType>;
  weightInUser?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  weightOut?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  weightOutSource?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  weightOutTimestamp?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  weightOutType?: Resolver<Maybe<ResolversTypes['MeasurementType']>, ParentType, ContextType>;
  weightOutUnit?: Resolver<Maybe<ResolversTypes['MeasurementUnit']>, ParentType, ContextType>;
  weightOutUser?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  weightTicketAttachedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  weightTicketCreator?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  weightTicketCreatorId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  weightTicketPrivateUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  weightTicketUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  WONumber?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export type OrderBillableItemResolvers<
  ContextType = GraphQLClientContext,
  ParentType extends ResolversParentTypes['OrderBillableItem'] = ResolversParentTypes['OrderBillableItem']
> = {
  applySurcharges?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  auto?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  billableItem?: Resolver<Maybe<ResolversTypes['HaulingBillableItem']>, ParentType, ContextType>;
  billableItemId?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  customRatesGroupLineItemsId?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  customRatesGroupServicesId?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  customRatesGroupThresholdsId?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  globalRatesLineItemsId?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  globalRatesServiceId?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  globalRatesThresholdsId?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  material?: Resolver<Maybe<ResolversTypes['HaulingMaterial']>, ParentType, ContextType>;
  materialId?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  orderId?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  price?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  priceSource?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  priceSourceType?: Resolver<
    Maybe<ResolversTypes['OrderPriceSourceType']>,
    ParentType,
    ContextType
  >;
  quantity?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  readonly?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  thresholdId?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  type?: Resolver<ResolversTypes['OrderBillableItemType'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  uuid?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export type OrderDeleteResultResolvers<
  ContextType = GraphQLClientContext,
  ParentType extends ResolversParentTypes['OrderDeleteResult'] = ResolversParentTypes['OrderDeleteResult']
> = {
  result?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export type OrderImageResolvers<
  ContextType = GraphQLClientContext,
  ParentType extends ResolversParentTypes['OrderImage'] = ResolversParentTypes['OrderImage']
> = {
  filename?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  url?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export type OrderIndexedResolvers<
  ContextType = GraphQLClientContext,
  ParentType extends ResolversParentTypes['OrderIndexed'] = ResolversParentTypes['OrderIndexed']
> = {
  amount?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  arrivedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  beforeTaxesTotal?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  billableItems?: Resolver<Array<ResolversTypes['OrderBillableItem']>, ParentType, ContextType>;
  billableService?: Resolver<Maybe<ResolversTypes['BillableService']>, ParentType, ContextType>;
  bypassScale?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  canTare?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  checkNumber?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  container?: Resolver<Maybe<ResolversTypes['Equipment']>, ParentType, ContextType>;
  containerId?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  creditCardId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  customer?: Resolver<ResolversTypes['HaulingCustomer'], ParentType, ContextType>;
  customerId?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  customerJobSite?: Resolver<
    Maybe<ResolversTypes['HaulingCustomerJobSite']>,
    ParentType,
    ContextType
  >;
  customerJobSiteId?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  customerTruck?: Resolver<Maybe<ResolversTypes['CustomerTruck']>, ParentType, ContextType>;
  customerTruckId?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  deleteDate?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  departureAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  destination?: Resolver<Maybe<ResolversTypes['HaulingDestination']>, ParentType, ContextType>;
  destinationId?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  graded?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  grandTotal?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  hasWeightTicket?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  haulingOrderId?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  highlight?: Resolver<Maybe<ResolversTypes['Highlight']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  images?: Resolver<Maybe<Array<ResolversTypes['OrderImage']>>, ParentType, ContextType>;
  initialOrderTotal?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  isAch?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  isSelfService?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  jobSite?: Resolver<Maybe<ResolversTypes['HaulingCustomerJobSite']>, ParentType, ContextType>;
  jobSiteId?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  material?: Resolver<Maybe<ResolversTypes['HaulingMaterial']>, ParentType, ContextType>;
  materialId?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  materialsDistribution?: Resolver<
    Array<ResolversTypes['OrderMaterialDistribution']>,
    ParentType,
    ContextType
  >;
  minimalWeight?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  miscellaneousMaterialsDistribution?: Resolver<
    Array<ResolversTypes['OrderMiscellaneousMaterialDistribution']>,
    ParentType,
    ContextType
  >;
  netWeight?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  note?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  originDistrict?: Resolver<
    Maybe<ResolversTypes['HaulingOriginDistrict']>,
    ParentType,
    ContextType
  >;
  originDistrictId?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  owner?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  paymentMethod?: Resolver<Maybe<ResolversTypes['PaymentMethodType']>, ParentType, ContextType>;
  PONumber?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  priceGroup?: Resolver<Maybe<ResolversTypes['HaulingPriceGroup']>, ParentType, ContextType>;
  priceGroupId?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  project?: Resolver<Maybe<ResolversTypes['HaulingProject']>, ParentType, ContextType>;
  projectId?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  status?: Resolver<ResolversTypes['OrderStatus'], ParentType, ContextType>;
  taxDistricts?: Resolver<
    Maybe<Array<ResolversTypes['HaulingTaxDistrict']>>,
    ParentType,
    ContextType
  >;
  taxTotal?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  truckTare?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  type?: Resolver<ResolversTypes['OrderType'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  useTare?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  weightIn?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  weightInSource?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  weightInTimestamp?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  weightInType?: Resolver<Maybe<ResolversTypes['MeasurementType']>, ParentType, ContextType>;
  weightInUnit?: Resolver<Maybe<ResolversTypes['MeasurementUnit']>, ParentType, ContextType>;
  weightInUser?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  weightOut?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  weightOutSource?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  weightOutTimestamp?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  weightOutType?: Resolver<Maybe<ResolversTypes['MeasurementType']>, ParentType, ContextType>;
  weightOutUnit?: Resolver<Maybe<ResolversTypes['MeasurementUnit']>, ParentType, ContextType>;
  weightOutUser?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  weightTicketAttachedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  weightTicketCreator?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  weightTicketCreatorId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  weightTicketPrivateUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  weightTicketUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  WONumber?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export type OrderMaterialDistributionResolvers<
  ContextType = GraphQLClientContext,
  ParentType extends ResolversParentTypes['OrderMaterialDistribution'] = ResolversParentTypes['OrderMaterialDistribution']
> = {
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  material?: Resolver<Maybe<ResolversTypes['HaulingMaterial']>, ParentType, ContextType>;
  materialId?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  orderId?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  recycle?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  uuid?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  value?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export type OrderMiscellaneousMaterialDistributionResolvers<
  ContextType = GraphQLClientContext,
  ParentType extends ResolversParentTypes['OrderMiscellaneousMaterialDistribution'] = ResolversParentTypes['OrderMiscellaneousMaterialDistribution']
> = {
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  material?: Resolver<ResolversTypes['HaulingMaterial'], ParentType, ContextType>;
  materialId?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  orderId?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  quantity?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  recycle?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  uuid?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export type OrdersIndexedListResolvers<
  ContextType = GraphQLClientContext,
  ParentType extends ResolversParentTypes['OrdersIndexedList'] = ResolversParentTypes['OrdersIndexedList']
> = {
  data?: Resolver<Array<ResolversTypes['OrderIndexed']>, ParentType, ContextType>;
  total?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export type OrdersIndexedResponseResolvers<
  ContextType = GraphQLClientContext,
  ParentType extends ResolversParentTypes['OrdersIndexedResponse'] = ResolversParentTypes['OrdersIndexedResponse']
> = {
  data?: Resolver<Array<ResolversTypes['OrderIndexed']>, ParentType, ContextType>;
  total?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export type OrdersResponseResolvers<
  ContextType = GraphQLClientContext,
  ParentType extends ResolversParentTypes['OrdersResponse'] = ResolversParentTypes['OrdersResponse']
> = {
  data?: Resolver<Array<ResolversTypes['Order']>, ParentType, ContextType>;
  total?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export type OrderTotalByStatusResolvers<
  ContextType = GraphQLClientContext,
  ParentType extends ResolversParentTypes['OrderTotalByStatus'] = ResolversParentTypes['OrderTotalByStatus']
> = {
  all?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  APPROVED?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  COMPLETED?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  FINALIZED?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  IN_YARD?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  INVOICED?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  LOAD?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  ON_THE_WAY?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  PAYMENT?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  WEIGHT_OUT?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export type OriginsResponseResolvers<
  ContextType = GraphQLClientContext,
  ParentType extends ResolversParentTypes['OriginsResponse'] = ResolversParentTypes['OriginsResponse']
> = {
  data?: Resolver<Array<ResolversTypes['HaulingOrigin']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export type PermissionResolvers<
  ContextType = GraphQLClientContext,
  ParentType extends ResolversParentTypes['Permission'] = ResolversParentTypes['Permission']
> = {
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  type?: Resolver<ResolversTypes['ResourceType'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export type PermissionDeleteResultResolvers<
  ContextType = GraphQLClientContext,
  ParentType extends ResolversParentTypes['PermissionDeleteResult'] = ResolversParentTypes['PermissionDeleteResult']
> = {
  result?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export type PhoneResolvers<
  ContextType = GraphQLClientContext,
  ParentType extends ResolversParentTypes['Phone'] = ResolversParentTypes['Phone']
> = {
  extension?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  number?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  textOnly?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  type?: Resolver<ResolversTypes['PhoneType'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export interface PointScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Point'], any> {
  name: 'Point';
}

export type PolicyEntryResolvers<
  ContextType = GraphQLClientContext,
  ParentType extends ResolversParentTypes['PolicyEntry'] = ResolversParentTypes['PolicyEntry']
> = {
  level?: Resolver<ResolversTypes['AccessLevel'], ParentType, ContextType>;
  overridden?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  subject?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export type QueryResolvers<
  ContextType = GraphQLClientContext,
  ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']
> = {
  activeOriginDistricts?: Resolver<
    Array<ResolversTypes['HaulingOriginDistrict']>,
    ParentType,
    ContextType
  >;
  aggregatedOrderHistory?: Resolver<
    ResolversTypes['HaulingOrderHistory'],
    ParentType,
    ContextType,
    RequireFields<QueryAggregatedOrderHistoryArgs, 'orderId'>
  >;
  availableResourceLogins?: Resolver<
    Array<ResolversTypes['ResourceLogin']>,
    ParentType,
    ContextType
  >;
  company?: Resolver<ResolversTypes['Company'], ParentType, ContextType>;
  creditCard?: Resolver<
    Maybe<ResolversTypes['CreditCard']>,
    ParentType,
    ContextType,
    RequireFields<QueryCreditCardArgs, 'id'>
  >;
  creditCards?: Resolver<
    Maybe<Array<ResolversTypes['CreditCard']>>,
    ParentType,
    ContextType,
    RequireFields<QueryCreditCardsArgs, 'filter'>
  >;
  customerTruck?: Resolver<
    ResolversTypes['CustomerTruck'],
    ParentType,
    ContextType,
    RequireFields<QueryCustomerTruckArgs, 'filter' | 'id'>
  >;
  customerTruckIndexed?: Resolver<
    ResolversTypes['CustomerTruckIndexed'],
    ParentType,
    ContextType,
    RequireFields<QueryCustomerTruckIndexedArgs, 'id'>
  >;
  customerTrucks?: Resolver<
    ResolversTypes['CustomerTrucksResponse'],
    ParentType,
    ContextType,
    RequireFields<QueryCustomerTrucksArgs, 'filter' | 'pagination' | 'sort'>
  >;
  customerTrucksByIds?: Resolver<
    Array<ResolversTypes['CustomerTruck']>,
    ParentType,
    ContextType,
    RequireFields<QueryCustomerTrucksByIdsArgs, 'filter' | 'ids'>
  >;
  customerTrucksIndexed?: Resolver<
    ResolversTypes['CustomerTrucksListIndexed'],
    ParentType,
    ContextType,
    RequireFields<QueryCustomerTrucksIndexedArgs, 'filter' | 'pagination' | 'sort'>
  >;
  customerTrucksIndexedCount?: Resolver<
    ResolversTypes['Int'],
    ParentType,
    ContextType,
    RequireFields<QueryCustomerTrucksIndexedCountArgs, 'search'>
  >;
  destination?: Resolver<
    ResolversTypes['HaulingDestination'],
    ParentType,
    ContextType,
    RequireFields<QueryDestinationArgs, 'id'>
  >;
  destinations?: Resolver<
    ResolversTypes['DestinationsResponse'],
    ParentType,
    ContextType,
    RequireFields<QueryDestinationsArgs, 'filter' | 'pagination' | 'sort'>
  >;
  equipment?: Resolver<
    ResolversTypes['Equipment'],
    ParentType,
    ContextType,
    RequireFields<QueryEquipmentArgs, 'id'>
  >;
  equipments?: Resolver<
    ResolversTypes['EquipmentsResponse'],
    ParentType,
    ContextType,
    RequireFields<QueryEquipmentsArgs, 'filter' | 'pagination' | 'sort'>
  >;
  getHaulingBillableItems?: Resolver<
    Array<ResolversTypes['HaulingBillableItem']>,
    ParentType,
    ContextType,
    RequireFields<QueryGetHaulingBillableItemsArgs, 'search'>
  >;
  getSalesRepresentativesByBU?: Resolver<
    Array<ResolversTypes['User']>,
    ParentType,
    ContextType,
    RequireFields<QueryGetSalesRepresentativesByBuArgs, 'businessUnitId'>
  >;
  getWalkUpCustomer?: Resolver<Maybe<ResolversTypes['HaulingCustomer']>, ParentType, ContextType>;
  haulingCompanyGeneralSettings?: Resolver<
    Maybe<ResolversTypes['HaulingCompanyGeneralSettings']>,
    ParentType,
    ContextType
  >;
  haulingCustomer?: Resolver<
    ResolversTypes['HaulingCustomer'],
    ParentType,
    ContextType,
    RequireFields<QueryHaulingCustomerArgs, 'id'>
  >;
  haulingCustomerGroups?: Resolver<
    Array<ResolversTypes['HaulingCustomerGroup']>,
    ParentType,
    ContextType,
    RequireFields<QueryHaulingCustomerGroupsArgs, never>
  >;
  haulingCustomerJobSite?: Resolver<
    ResolversTypes['HaulingCustomerJobSite'],
    ParentType,
    ContextType,
    RequireFields<QueryHaulingCustomerJobSiteArgs, 'filter'>
  >;
  haulingCustomerJobSitePair?: Resolver<
    ResolversTypes['HaulingCustomerJobSite'],
    ParentType,
    ContextType,
    RequireFields<QueryHaulingCustomerJobSitePairArgs, 'filter'>
  >;
  haulingCustomerJobSites?: Resolver<
    Array<ResolversTypes['HaulingCustomerJobSite']>,
    ParentType,
    ContextType,
    RequireFields<QueryHaulingCustomerJobSitesArgs, 'filter'>
  >;
  haulingCustomerJobSitesAll?: Resolver<
    Array<ResolversTypes['HaulingCustomerJobSite']>,
    ParentType,
    ContextType,
    RequireFields<QueryHaulingCustomerJobSitesAllArgs, 'filter'>
  >;
  haulingCustomers?: Resolver<
    ResolversTypes['HaulingCustomersResponse'],
    ParentType,
    ContextType,
    RequireFields<QueryHaulingCustomersArgs, 'filter' | 'pagination' | 'sort'>
  >;
  haulingJobSite?: Resolver<
    ResolversTypes['HaulingJobSite'],
    ParentType,
    ContextType,
    RequireFields<QueryHaulingJobSiteArgs, 'id'>
  >;
  haulingJobSites?: Resolver<
    ResolversTypes['haulingJobSitesResponse'],
    ParentType,
    ContextType,
    RequireFields<QueryHaulingJobSitesArgs, 'filter' | 'pagination' | 'sort'>
  >;
  haulingMaterial?: Resolver<
    ResolversTypes['HaulingMaterial'],
    ParentType,
    ContextType,
    RequireFields<QueryHaulingMaterialArgs, 'id'>
  >;
  haulingMaterials?: Resolver<
    ResolversTypes['HaulingMaterialsResponse'],
    ParentType,
    ContextType,
    RequireFields<QueryHaulingMaterialsArgs, 'pagination' | 'sort'>
  >;
  haulingPriceGroups?: Resolver<
    ResolversTypes['HaulingPriceGroupsResult'],
    ParentType,
    ContextType,
    RequireFields<QueryHaulingPriceGroupsArgs, 'filter'>
  >;
  haulingProjects?: Resolver<
    Array<ResolversTypes['HaulingProject']>,
    ParentType,
    ContextType,
    RequireFields<QueryHaulingProjectsArgs, 'filter'>
  >;
  indexedOrdersGroupByStatusTotal?: Resolver<
    ResolversTypes['OrderTotalByStatus'],
    ParentType,
    ContextType,
    RequireFields<QueryIndexedOrdersGroupByStatusTotalArgs, 'filter'>
  >;
  isLoggedIn?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  lastUsedCreditCard?: Resolver<
    Maybe<ResolversTypes['String']>,
    ParentType,
    ContextType,
    RequireFields<QueryLastUsedCreditCardArgs, 'customerId'>
  >;
  listRoles?: Resolver<
    ResolversTypes['ListRolesResult'],
    ParentType,
    ContextType,
    RequireFields<QueryListRolesArgs, 'filter' | 'limit' | 'offset'>
  >;
  listUsers?: Resolver<
    ResolversTypes['ListUsersResult'],
    ParentType,
    ContextType,
    RequireFields<QueryListUsersArgs, 'filter' | 'limit' | 'offset'>
  >;
  me?: Resolver<ResolversTypes['Me'], ParentType, ContextType>;
  minimalWeight?: Resolver<
    Maybe<ResolversTypes['Float']>,
    ParentType,
    ContextType,
    RequireFields<QueryMinimalWeightArgs, 'materialId' | 'priceGroupId' | 'type'>
  >;
  onTheWayWONumbers?: Resolver<
    Array<ResolversTypes['OnTheWayNumber']>,
    ParentType,
    ContextType,
    RequireFields<QueryOnTheWayWoNumbersArgs, never>
  >;
  order?: Resolver<
    ResolversTypes['Order'],
    ParentType,
    ContextType,
    RequireFields<QueryOrderArgs, 'filter' | 'id'>
  >;
  orderIndexed?: Resolver<
    ResolversTypes['OrderIndexed'],
    ParentType,
    ContextType,
    RequireFields<QueryOrderIndexedArgs, 'id'>
  >;
  orders?: Resolver<
    ResolversTypes['OrdersResponse'],
    ParentType,
    ContextType,
    RequireFields<QueryOrdersArgs, 'filter' | 'pagination' | 'sort'>
  >;
  ordersByHaulingId?: Resolver<
    Array<ResolversTypes['Order']>,
    ParentType,
    ContextType,
    RequireFields<QueryOrdersByHaulingIdArgs, 'ids'>
  >;
  ordersByIds?: Resolver<
    Array<ResolversTypes['Order']>,
    ParentType,
    ContextType,
    RequireFields<QueryOrdersByIdsArgs, 'filter' | 'ids'>
  >;
  ordersByWONumberAndCustomer?: Resolver<
    Array<ResolversTypes['OrderIndexed']>,
    ParentType,
    ContextType,
    RequireFields<QueryOrdersByWoNumberAndCustomerArgs, 'WONumber'>
  >;
  ordersGrid?: Resolver<
    ResolversTypes['OrdersIndexedList'],
    ParentType,
    ContextType,
    RequireFields<QueryOrdersGridArgs, 'filter' | 'pagination' | 'sort'>
  >;
  ordersIndexed?: Resolver<
    ResolversTypes['OrdersIndexedResponse'],
    ParentType,
    ContextType,
    RequireFields<QueryOrdersIndexedArgs, 'search'>
  >;
  ordersIndexedCount?: Resolver<
    ResolversTypes['Int'],
    ParentType,
    ContextType,
    RequireFields<QueryOrdersIndexedCountArgs, 'search'>
  >;
  origin?: Resolver<
    ResolversTypes['HaulingOrigin'],
    ParentType,
    ContextType,
    RequireFields<QueryOriginArgs, 'id'>
  >;
  origins?: Resolver<
    ResolversTypes['OriginsResponse'],
    ParentType,
    ContextType,
    RequireFields<QueryOriginsArgs, 'filter' | 'pagination' | 'sort'>
  >;
  permissions?: Resolver<
    ResolversTypes['ListPermissionsResult'],
    ParentType,
    ContextType,
    RequireFields<QueryPermissionsArgs, 'limit' | 'offset' | 'sort'>
  >;
  resource?: Resolver<
    Maybe<ResolversTypes['Resource']>,
    ParentType,
    ContextType,
    RequireFields<QueryResourceArgs, 'srn'>
  >;
  resourceLogins?: Resolver<
    Array<ResolversTypes['AvailableResourceLogin']>,
    ParentType,
    ContextType
  >;
  resources?: Resolver<
    ResolversTypes['ListResourcesResult'],
    ParentType,
    ContextType,
    RequireFields<QueryResourcesArgs, 'filter' | 'limit' | 'offset' | 'sort'>
  >;
  role?: Resolver<
    Maybe<ResolversTypes['Role']>,
    ParentType,
    ContextType,
    RequireFields<QueryRoleArgs, 'id'>
  >;
  roles?: Resolver<Array<ResolversTypes['Role']>, ParentType, ContextType>;
  salesRepresentatives?: Resolver<Array<ResolversTypes['User']>, ParentType, ContextType>;
  scale?: Resolver<
    ResolversTypes['Scale'],
    ParentType,
    ContextType,
    RequireFields<QueryScaleArgs, 'filter' | 'id'>
  >;
  scales?: Resolver<
    ResolversTypes['ScalesResponse'],
    ParentType,
    ContextType,
    RequireFields<QueryScalesArgs, 'filter' | 'pagination' | 'sort'>
  >;
  scalesByIds?: Resolver<
    Array<ResolversTypes['Scale']>,
    ParentType,
    ContextType,
    RequireFields<QueryScalesByIdsArgs, 'filter' | 'ids'>
  >;
  serviceDaysAndHour?: Resolver<
    ResolversTypes['HaulingServiceDaysAndHours'],
    ParentType,
    ContextType,
    RequireFields<QueryServiceDaysAndHourArgs, 'id'>
  >;
  serviceDaysAndHours?: Resolver<
    ResolversTypes['ServiceDaysAndHoursResponse'],
    ParentType,
    ContextType,
    RequireFields<QueryServiceDaysAndHoursArgs, 'filter' | 'pagination' | 'sort'>
  >;
  taxDistricts?: Resolver<Array<ResolversTypes['HaulingTaxDistrict']>, ParentType, ContextType>;
  taxDistrictsForOrder?: Resolver<
    Array<ResolversTypes['HaulingTaxDistrict']>,
    ParentType,
    ContextType,
    RequireFields<QueryTaxDistrictsForOrderArgs, 'filter'>
  >;
  trucksForOrderCreate?: Resolver<
    Array<ResolversTypes['CustomerTruckForOrderCreate']>,
    ParentType,
    ContextType,
    RequireFields<QueryTrucksForOrderCreateArgs, 'customerId' | 'filter'>
  >;
  user?: Resolver<
    Maybe<ResolversTypes['User']>,
    ParentType,
    ContextType,
    RequireFields<QueryUserArgs, 'filter' | 'id'>
  >;
  userDriver?: Resolver<Maybe<ResolversTypes['HaulingDriver']>, ParentType, ContextType>;
  userInfo?: Resolver<ResolversTypes['UserInfo'], ParentType, ContextType>;
  users?: Resolver<
    Array<Maybe<ResolversTypes['User']>>,
    ParentType,
    ContextType,
    RequireFields<QueryUsersArgs, 'ids' | 'raw'>
  >;
  yardOperationConsoleActivity?: Resolver<
    ResolversTypes['YardConsoleActivityTotal'],
    ParentType,
    ContextType,
    RequireFields<QueryYardOperationConsoleActivityArgs, 'input'>
  >;
};

export type ResourceResolvers<
  ContextType = GraphQLClientContext,
  ParentType extends ResolversParentTypes['Resource'] = ResolversParentTypes['Resource']
> = {
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  image?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  label?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  loginUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  srn?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  subLabel?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  type?: Resolver<ResolversTypes['ResourceType'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export type ResourceDeleteResultResolvers<
  ContextType = GraphQLClientContext,
  ParentType extends ResolversParentTypes['ResourceDeleteResult'] = ResolversParentTypes['ResourceDeleteResult']
> = {
  result?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export type ResourceLoginResolvers<
  ContextType = GraphQLClientContext,
  ParentType extends ResolversParentTypes['ResourceLogin'] = ResolversParentTypes['ResourceLogin']
> = {
  graderHasBUAccess?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  hasGradingAccess?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  hasRecyclingAccess?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  image?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  label?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  loginUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  resourceType?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  subLabel?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  tenantName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export type RoleResolvers<
  ContextType = GraphQLClientContext,
  ParentType extends ResolversParentTypes['Role'] = ResolversParentTypes['Role']
> = {
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  description?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  policies?: Resolver<Array<ResolversTypes['RolePolicy']>, ParentType, ContextType>;
  policyStatements?: Resolver<
    Array<ResolversTypes['RolePolicyStatement']>,
    ParentType,
    ContextType
  >;
  policyTemplates?: Resolver<Array<ResolversTypes['RolePolicyTemplate']>, ParentType, ContextType>;
  status?: Resolver<ResolversTypes['RoleStatus'], ParentType, ContextType>;
  tenantId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  users?: Resolver<Array<ResolversTypes['User']>, ParentType, ContextType>;
  usersCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export type RolePolicyResolvers<
  ContextType = GraphQLClientContext,
  ParentType extends ResolversParentTypes['RolePolicy'] = ResolversParentTypes['RolePolicy']
> = {
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  entries?: Resolver<Array<ResolversTypes['PolicyEntry']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  resource?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  role?: Resolver<ResolversTypes['Role'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export type RolePolicyStatementResolvers<
  ContextType = GraphQLClientContext,
  ParentType extends ResolversParentTypes['RolePolicyStatement'] = ResolversParentTypes['RolePolicyStatement']
> = {
  actions?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  effect?: Resolver<ResolversTypes['PolicyEffect'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  resource?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  role?: Resolver<ResolversTypes['Role'], ParentType, ContextType>;
  tenantId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export type RolePolicyTemplateResolvers<
  ContextType = GraphQLClientContext,
  ParentType extends ResolversParentTypes['RolePolicyTemplate'] = ResolversParentTypes['RolePolicyTemplate']
> = {
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  entries?: Resolver<Array<ResolversTypes['PolicyEntry']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  resourceType?: Resolver<ResolversTypes['ResourceType'], ParentType, ContextType>;
  role?: Resolver<ResolversTypes['Role'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export type SalesRepresentativeResolvers<
  ContextType = GraphQLClientContext,
  ParentType extends ResolversParentTypes['SalesRepresentative'] = ResolversParentTypes['SalesRepresentative']
> = {
  businessUnitId?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  commissionAmount?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export type ScaleResolvers<
  ContextType = GraphQLClientContext,
  ParentType extends ResolversParentTypes['Scale'] = ResolversParentTypes['Scale']
> = {
  computerId?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  connectionStatus?: Resolver<ResolversTypes['ScaleConnectionStatus'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  deviceName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  deviceNumber?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export type ScaleDeleteResultResolvers<
  ContextType = GraphQLClientContext,
  ParentType extends ResolversParentTypes['ScaleDeleteResult'] = ResolversParentTypes['ScaleDeleteResult']
> = {
  result?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export type ScalesResponseResolvers<
  ContextType = GraphQLClientContext,
  ParentType extends ResolversParentTypes['ScalesResponse'] = ResolversParentTypes['ScalesResponse']
> = {
  data?: Resolver<Array<ResolversTypes['Scale']>, ParentType, ContextType>;
  total?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export type ServiceDaysAndHoursResponseResolvers<
  ContextType = GraphQLClientContext,
  ParentType extends ResolversParentTypes['ServiceDaysAndHoursResponse'] = ResolversParentTypes['ServiceDaysAndHoursResponse']
> = {
  data?: Resolver<Array<ResolversTypes['HaulingServiceDaysAndHours']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export type TaxResolvers<
  ContextType = GraphQLClientContext,
  ParentType extends ResolversParentTypes['Tax'] = ResolversParentTypes['Tax']
> = {
  application?: Resolver<Maybe<ResolversTypes['TaxApplication']>, ParentType, ContextType>;
  calculation?: Resolver<ResolversTypes['TaxCalculation'], ParentType, ContextType>;
  exclusions?: Resolver<Maybe<Array<ResolversTypes['Float']>>, ParentType, ContextType>;
  group?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  nonGroup?: Resolver<Maybe<Array<ResolversTypes['NonGroupTaxValue']>>, ParentType, ContextType>;
  value?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export type TaxBusinessConfigurationResolvers<
  ContextType = GraphQLClientContext,
  ParentType extends ResolversParentTypes['TaxBusinessConfiguration'] = ResolversParentTypes['TaxBusinessConfiguration']
> = {
  businessLineId?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  commercialLineItems?: Resolver<ResolversTypes['LineItemTax'], ParentType, ContextType>;
  commercialMaterials?: Resolver<ResolversTypes['Tax'], ParentType, ContextType>;
  commercialRecurringLineItems?: Resolver<ResolversTypes['Tax'], ParentType, ContextType>;
  commercialRecurringServices?: Resolver<ResolversTypes['Tax'], ParentType, ContextType>;
  commercialServices?: Resolver<ResolversTypes['Tax'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  nonCommercialLineItems?: Resolver<ResolversTypes['LineItemTax'], ParentType, ContextType>;
  nonCommercialMaterials?: Resolver<ResolversTypes['Tax'], ParentType, ContextType>;
  nonCommercialRecurringLineItems?: Resolver<ResolversTypes['Tax'], ParentType, ContextType>;
  nonCommercialRecurringServices?: Resolver<ResolversTypes['Tax'], ParentType, ContextType>;
  nonCommercialServices?: Resolver<ResolversTypes['Tax'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export interface UploadScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Upload'], any> {
  name: 'Upload';
}

export type UploadFileResponseResolvers<
  ContextType = GraphQLClientContext,
  ParentType extends ResolversParentTypes['UploadFileResponse'] = ResolversParentTypes['UploadFileResponse']
> = {
  encoding?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  filename?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  mimetype?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  url?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export type UserResolvers<
  ContextType = GraphQLClientContext,
  ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']
> = {
  address?: Resolver<Maybe<ResolversTypes['Address']>, ParentType, ContextType>;
  allPermissions?: Resolver<
    Maybe<Array<ResolversTypes['AllPermissions']>>,
    ParentType,
    ContextType
  >;
  availableActions?: Resolver<
    Array<ResolversTypes['String']>,
    ParentType,
    ContextType,
    RequireFields<UserAvailableActionsArgs, 'resource'>
  >;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  email?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  firstName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  hasPersonalPermissions?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  lastName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  permissions?: Resolver<
    Array<ResolversTypes['PolicyEntry']>,
    ParentType,
    ContextType,
    RequireFields<UserPermissionsArgs, 'resource'>
  >;
  phones?: Resolver<Array<ResolversTypes['Phone']>, ParentType, ContextType>;
  policies?: Resolver<Array<ResolversTypes['UserPolicy']>, ParentType, ContextType>;
  policyStatements?: Resolver<
    Array<ResolversTypes['UserPolicyStatement']>,
    ParentType,
    ContextType
  >;
  roleIds?: Resolver<Array<ResolversTypes['Float']>, ParentType, ContextType>;
  roles?: Resolver<Array<ResolversTypes['Role']>, ParentType, ContextType>;
  salesRepresentatives?: Resolver<
    Maybe<Array<ResolversTypes['SalesRepresentative']>>,
    ParentType,
    ContextType
  >;
  status?: Resolver<ResolversTypes['UserStatus'], ParentType, ContextType>;
  tenantId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  tenantName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  title?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export type UserPolicyResolvers<
  ContextType = GraphQLClientContext,
  ParentType extends ResolversParentTypes['UserPolicy'] = ResolversParentTypes['UserPolicy']
> = {
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  entries?: Resolver<Array<ResolversTypes['PolicyEntry']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  resource?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export type UserPolicyStatementResolvers<
  ContextType = GraphQLClientContext,
  ParentType extends ResolversParentTypes['UserPolicyStatement'] = ResolversParentTypes['UserPolicyStatement']
> = {
  actions?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  effect?: Resolver<ResolversTypes['PolicyEffect'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  resource?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  tenantId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export type YardConsoleActivityTotalResolvers<
  ContextType = GraphQLClientContext,
  ParentType extends ResolversParentTypes['YardConsoleActivityTotal'] = ResolversParentTypes['YardConsoleActivityTotal']
> = {
  inYard?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  onTheWay?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  selfService?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  today?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export interface ReactElementScalarConfig
  extends GraphQLScalarTypeConfig<ResolversTypes['ReactElement'], any> {
  name: 'ReactElement';
}

export interface FunctionScalarConfig
  extends GraphQLScalarTypeConfig<ResolversTypes['Function'], any> {
  name: 'Function';
}

export interface AsyncFunctionScalarConfig
  extends GraphQLScalarTypeConfig<ResolversTypes['AsyncFunction'], any> {
  name: 'AsyncFunction';
}

export type UserInfoResolvers<
  ContextType = GraphQLClientContext,
  ParentType extends ResolversParentTypes['UserInfo'] = ResolversParentTypes['UserInfo']
> = {
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  email?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  token?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  expiresAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  refreshToken?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  refreshExpiresAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  resource?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  lastName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  firstName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  permissions?: Resolver<Array<Maybe<ResolversTypes['String']>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType>;
};

export type Resolvers<ContextType = GraphQLClientContext> = {
  Address?: AddressResolvers<ContextType>;
  AdministrativeDistrict?: AdministrativeDistrictResolvers<ContextType>;
  AllPermissions?: AllPermissionsResolvers<ContextType>;
  AvailableResourceLogin?: AvailableResourceLoginResolvers<ContextType>;
  Balances?: BalancesResolvers<ContextType>;
  BillableService?: BillableServiceResolvers<ContextType>;
  BillingJobSite?: BillingJobSiteResolvers<ContextType>;
  Company?: CompanyResolvers<ContextType>;
  CreditCard?: CreditCardResolvers<ContextType>;
  CustomerAddress?: CustomerAddressResolvers<ContextType>;
  CustomerTruck?: CustomerTruckResolvers<ContextType>;
  CustomerTruckDeleteResult?: CustomerTruckDeleteResultResolvers<ContextType>;
  CustomerTruckForOrderCreate?: CustomerTruckForOrderCreateResolvers<ContextType>;
  CustomerTruckIndexed?: CustomerTruckIndexedResolvers<ContextType>;
  CustomerTrucksListIndexed?: CustomerTrucksListIndexedResolvers<ContextType>;
  CustomerTrucksResponse?: CustomerTrucksResponseResolvers<ContextType>;
  DateTime?: GraphQLScalarType;
  DestinationsResponse?: DestinationsResponseResolvers<ContextType>;
  Equipment?: EquipmentResolvers<ContextType>;
  EquipmentsResponse?: EquipmentsResponseResolvers<ContextType>;
  Feature?: GraphQLScalarType;
  FileDeleteResult?: FileDeleteResultResolvers<ContextType>;
  Geometry?: GraphQLScalarType;
  HaulingBillableItem?: HaulingBillableItemResolvers<ContextType>;
  HaulingCalculateRatesResult?: HaulingCalculateRatesResultResolvers<ContextType>;
  HaulingCompanyGeneralSettings?: HaulingCompanyGeneralSettingsResolvers<ContextType>;
  HaulingCustomer?: HaulingCustomerResolvers<ContextType>;
  HaulingCustomerGroup?: HaulingCustomerGroupResolvers<ContextType>;
  HaulingCustomerJobSite?: HaulingCustomerJobSiteResolvers<ContextType>;
  HaulingCustomersResponse?: HaulingCustomersResponseResolvers<ContextType>;
  HaulingCustomRates?: HaulingCustomRatesResolvers<ContextType>;
  HaulingDestination?: HaulingDestinationResolvers<ContextType>;
  HaulingDriver?: HaulingDriverResolvers<ContextType>;
  HaulingDriverBU?: HaulingDriverBuResolvers<ContextType>;
  HaulingGlobalRates?: HaulingGlobalRatesResolvers<ContextType>;
  HaulingJobSite?: HaulingJobSiteResolvers<ContextType>;
  HaulingJobSiteAddress?: HaulingJobSiteAddressResolvers<ContextType>;
  haulingJobSitesResponse?: HaulingJobSitesResponseResolvers<ContextType>;
  HaulingMaterial?: HaulingMaterialResolvers<ContextType>;
  HaulingMaterialsResponse?: HaulingMaterialsResponseResolvers<ContextType>;
  HaulingOrderHistory?: GraphQLScalarType;
  HaulingOrigin?: HaulingOriginResolvers<ContextType>;
  HaulingOriginDistrict?: HaulingOriginDistrictResolvers<ContextType>;
  HaulingPhone?: HaulingPhoneResolvers<ContextType>;
  HaulingPriceGroup?: HaulingPriceGroupResolvers<ContextType>;
  HaulingPriceGroupsResult?: HaulingPriceGroupsResultResolvers<ContextType>;
  HaulingProject?: HaulingProjectResolvers<ContextType>;
  HaulingRatesLineItemResult?: HaulingRatesLineItemResultResolvers<ContextType>;
  HaulingRatesServiceResult?: HaulingRatesServiceResultResolvers<ContextType>;
  HaulingServiceDaysAndHours?: HaulingServiceDaysAndHoursResolvers<ContextType>;
  HaulingTaxDistrict?: HaulingTaxDistrictResolvers<ContextType>;
  Highlight?: GraphQLScalarType;
  LineItemExclusions?: LineItemExclusionsResolvers<ContextType>;
  LineItemTax?: LineItemTaxResolvers<ContextType>;
  ListPermissionsResult?: ListPermissionsResultResolvers<ContextType>;
  ListResourcesResult?: ListResourcesResultResolvers<ContextType>;
  ListRolesResult?: ListRolesResultResolvers<ContextType>;
  ListUsersResult?: ListUsersResultResolvers<ContextType>;
  Me?: MeResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  NonGroupLineItemTaxValue?: NonGroupLineItemTaxValueResolvers<ContextType>;
  NonGroupTaxValue?: NonGroupTaxValueResolvers<ContextType>;
  ObjectLiteralScalar?: GraphQLScalarType;
  OnTheWayNumber?: OnTheWayNumberResolvers<ContextType>;
  Order?: OrderResolvers<ContextType>;
  OrderBillableItem?: OrderBillableItemResolvers<ContextType>;
  OrderDeleteResult?: OrderDeleteResultResolvers<ContextType>;
  OrderImage?: OrderImageResolvers<ContextType>;
  OrderIndexed?: OrderIndexedResolvers<ContextType>;
  OrderMaterialDistribution?: OrderMaterialDistributionResolvers<ContextType>;
  OrderMiscellaneousMaterialDistribution?: OrderMiscellaneousMaterialDistributionResolvers<
    ContextType
  >;
  OrdersIndexedList?: OrdersIndexedListResolvers<ContextType>;
  OrdersIndexedResponse?: OrdersIndexedResponseResolvers<ContextType>;
  OrdersResponse?: OrdersResponseResolvers<ContextType>;
  OrderTotalByStatus?: OrderTotalByStatusResolvers<ContextType>;
  OriginsResponse?: OriginsResponseResolvers<ContextType>;
  Permission?: PermissionResolvers<ContextType>;
  PermissionDeleteResult?: PermissionDeleteResultResolvers<ContextType>;
  Phone?: PhoneResolvers<ContextType>;
  Point?: GraphQLScalarType;
  PolicyEntry?: PolicyEntryResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  Resource?: ResourceResolvers<ContextType>;
  ResourceDeleteResult?: ResourceDeleteResultResolvers<ContextType>;
  ResourceLogin?: ResourceLoginResolvers<ContextType>;
  Role?: RoleResolvers<ContextType>;
  RolePolicy?: RolePolicyResolvers<ContextType>;
  RolePolicyStatement?: RolePolicyStatementResolvers<ContextType>;
  RolePolicyTemplate?: RolePolicyTemplateResolvers<ContextType>;
  SalesRepresentative?: SalesRepresentativeResolvers<ContextType>;
  Scale?: ScaleResolvers<ContextType>;
  ScaleDeleteResult?: ScaleDeleteResultResolvers<ContextType>;
  ScalesResponse?: ScalesResponseResolvers<ContextType>;
  ServiceDaysAndHoursResponse?: ServiceDaysAndHoursResponseResolvers<ContextType>;
  Tax?: TaxResolvers<ContextType>;
  TaxBusinessConfiguration?: TaxBusinessConfigurationResolvers<ContextType>;
  Upload?: GraphQLScalarType;
  UploadFileResponse?: UploadFileResponseResolvers<ContextType>;
  User?: UserResolvers<ContextType>;
  UserPolicy?: UserPolicyResolvers<ContextType>;
  UserPolicyStatement?: UserPolicyStatementResolvers<ContextType>;
  YardConsoleActivityTotal?: YardConsoleActivityTotalResolvers<ContextType>;
  ReactElement?: GraphQLScalarType;
  Function?: GraphQLScalarType;
  AsyncFunction?: GraphQLScalarType;
  UserInfo?: UserInfoResolvers<ContextType>;
};

/**
 * @deprecated
 * Use "Resolvers" root object instead. If you wish to get "IResolvers", add "typesPrefix: I" to your config.
 */
export type IResolvers<ContextType = GraphQLClientContext> = Resolvers<ContextType>;
