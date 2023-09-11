import * as TypeGraphQL from 'type-graphql';
export { TypeGraphQL };
import { GraphQLClient } from 'graphql-request';
import * as Dom from 'graphql-request/dist/types.dom';
import gql from 'graphql-tag';
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type FixDecorator<T> = T;
export type GetCustomerBalancesQueryVariables = Exact<{
  customerId: Scalars['ID'];
}>;


export type GetCustomerBalancesQuery = (
  { __typename?: 'Query' }
  & { customerBalances?: Maybe<(
    { __typename?: 'Balances' }
    & Pick<Balances, 'availableCredit' | 'balance' | 'creditLimit' | 'nonInvoicedTotal' | 'prepaidOnAccount' | 'prepaidDeposits' | 'paymentDue'>
  )> }
);

export type CreditCardFragmentFragment = (
  { __typename?: 'CreditCardExtended' }
  & Pick<CreditCardExtended, 'id' | 'active' | 'cardNickname' | 'cardType' | 'cardNumberLastDigits' | 'nameOnCard' | 'expirationDate' | 'addressLine1' | 'addressLine2' | 'city' | 'state' | 'zip' | 'expDate' | 'expiredLabel'>
  & { jobSites?: Maybe<Array<(
    { __typename?: 'JobSite' }
    & Pick<JobSite, 'id' | 'addressLine1' | 'addressLine2' | 'city' | 'state' | 'zip'>
  )>> }
);

export type GetCreditCardsQueryVariables = Exact<{
  customerId?: Maybe<Scalars['ID']>;
  activeOnly?: Maybe<Scalars['Boolean']>;
  jobSiteId?: Maybe<Scalars['ID']>;
  relevantOnly?: Maybe<Scalars['Boolean']>;
}>;


export type GetCreditCardsQuery = (
  { __typename?: 'Query' }
  & { creditCards?: Maybe<Array<Maybe<(
    { __typename?: 'CreditCardExtended' }
    & CreditCardFragmentFragment
  )>>> }
);

export type GetCreditCardQueryVariables = Exact<{
  id: Scalars['ID'];
}>;


export type GetCreditCardQuery = (
  { __typename?: 'Query' }
  & { creditCard?: Maybe<(
    { __typename?: 'CreditCardExtended' }
    & CreditCardFragmentFragment
  )> }
);

export type CreateCreditCardMutationVariables = Exact<{
  customerId: Scalars['ID'];
  data: AddCreditCardInput;
}>;


export type CreateCreditCardMutation = (
  { __typename?: 'Mutation' }
  & { addCreditCard?: Maybe<(
    { __typename?: 'CreditCardExtended' }
    & CreditCardFragmentFragment
  )> }
);

export type UpdateCreditCardMutationVariables = Exact<{
  id: Scalars['ID'];
  data: EditCreditCardInput;
}>;


export type UpdateCreditCardMutation = (
  { __typename?: 'Mutation' }
  & { updateCreditCard?: Maybe<(
    { __typename?: 'CreditCardExtended' }
    & CreditCardFragmentFragment
  )> }
);

export const CreditCardFragmentFragmentDoc = gql`
    fragment CreditCardFragment on CreditCardExtended {
  id
  active
  cardNickname
  cardType
  cardNumberLastDigits
  nameOnCard
  expirationDate
  addressLine1
  addressLine2
  city
  state
  zip
  jobSites {
    id
    addressLine1
    addressLine2
    city
    state
    zip
  }
  expDate
  expiredLabel
}
    `;
export const GetCustomerBalancesDocument = gql`
    query getCustomerBalances($customerId: ID!) {
  customerBalances(customerId: $customerId) {
    availableCredit
    balance
    creditLimit
    nonInvoicedTotal
    prepaidOnAccount
    prepaidDeposits
    paymentDue
  }
}
    `;
export const GetCreditCardsDocument = gql`
    query getCreditCards($customerId: ID, $activeOnly: Boolean, $jobSiteId: ID, $relevantOnly: Boolean) {
  creditCards(
    customerId: $customerId
    activeOnly: $activeOnly
    jobSiteId: $jobSiteId
    relevantOnly: $relevantOnly
  ) {
    ...CreditCardFragment
  }
}
    ${CreditCardFragmentFragmentDoc}`;
export const GetCreditCardDocument = gql`
    query getCreditCard($id: ID!) {
  creditCard(id: $id) {
    ...CreditCardFragment
  }
}
    ${CreditCardFragmentFragmentDoc}`;
export const CreateCreditCardDocument = gql`
    mutation createCreditCard($customerId: ID!, $data: AddCreditCardInput!) {
  addCreditCard(customerId: $customerId, data: $data) {
    ...CreditCardFragment
  }
}
    ${CreditCardFragmentFragmentDoc}`;
export const UpdateCreditCardDocument = gql`
    mutation updateCreditCard($id: ID!, $data: EditCreditCardInput!) {
  updateCreditCard(id: $id, data: $data) {
    ...CreditCardFragment
  }
}
    ${CreditCardFragmentFragmentDoc}`;

export type SdkFunctionWrapper = <T>(action: () => Promise<T>) => Promise<T>;


const defaultWrapper: SdkFunctionWrapper = sdkFunction => sdkFunction();
export function getSdk(client: GraphQLClient, withWrapper: SdkFunctionWrapper = defaultWrapper) {
  return {
    getCustomerBalances(variables: GetCustomerBalancesQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetCustomerBalancesQuery> {
      return withWrapper(() => client.request<GetCustomerBalancesQuery>(GetCustomerBalancesDocument, variables, requestHeaders));
    },
    getCreditCards(variables?: GetCreditCardsQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetCreditCardsQuery> {
      return withWrapper(() => client.request<GetCreditCardsQuery>(GetCreditCardsDocument, variables, requestHeaders));
    },
    getCreditCard(variables: GetCreditCardQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetCreditCardQuery> {
      return withWrapper(() => client.request<GetCreditCardQuery>(GetCreditCardDocument, variables, requestHeaders));
    },
    createCreditCard(variables: CreateCreditCardMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<CreateCreditCardMutation> {
      return withWrapper(() => client.request<CreateCreditCardMutation>(CreateCreditCardDocument, variables, requestHeaders));
    },
    updateCreditCard(variables: UpdateCreditCardMutationVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<UpdateCreditCardMutation> {
      return withWrapper(() => client.request<UpdateCreditCardMutation>(UpdateCreditCardDocument, variables, requestHeaders));
    }
  };
}
export type Sdk = ReturnType<typeof getSdk>;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};


@TypeGraphQL.InputType()
export class AddCreditCardInput {

  @TypeGraphQL.Field(() => Boolean)
  active!: Scalars['Boolean'];

  @TypeGraphQL.Field(() => String, { nullable: true })
  cardNickname!: Maybe<Scalars['String']>;

  @TypeGraphQL.Field(() => String)
  addressLine1!: Scalars['String'];

  @TypeGraphQL.Field(() => String, { nullable: true })
  addressLine2!: Maybe<Scalars['String']>;

  @TypeGraphQL.Field(() => String)
  city!: Scalars['String'];

  @TypeGraphQL.Field(() => String)
  state!: Scalars['String'];

  @TypeGraphQL.Field(() => String)
  zip!: Scalars['String'];

  @TypeGraphQL.Field(() => String)
  nameOnCard!: Scalars['String'];

  @TypeGraphQL.Field(() => String)
  expirationDate!: Scalars['String'];

  @TypeGraphQL.Field(() => String)
  cardNumber!: Scalars['String'];

  @TypeGraphQL.Field(() => String)
  cvv!: Scalars['String'];

  @TypeGraphQL.Field(() => [TypeGraphQL.ID], { nullable: 'itemsAndList' })
  jobSites!: Maybe<Array<Maybe<Scalars['ID']>>>;
};

@TypeGraphQL.ObjectType()
export class Address {
  __typename?: 'Address';

  @TypeGraphQL.Field(() => String)
  addressLine1!: Scalars['String'];

  @TypeGraphQL.Field(() => String, { nullable: true })
  addressLine2!: Maybe<Scalars['String']>;

  @TypeGraphQL.Field(() => String, { nullable: true })
  zip!: Maybe<Scalars['String']>;

  @TypeGraphQL.Field(() => String, { nullable: true })
  city!: Maybe<Scalars['String']>;

  @TypeGraphQL.Field(() => String, { nullable: true })
  state!: Maybe<Scalars['String']>;
};

@TypeGraphQL.ObjectType()
export class AppliedInvoice {
  __typename?: 'AppliedInvoice';

  @TypeGraphQL.Field(() => TypeGraphQL.ID)
  id!: Scalars['ID'];

  @TypeGraphQL.Field(() => String, { nullable: true })
  dueDate!: Maybe<Scalars['String']>;

  @TypeGraphQL.Field(() => String)
  createdAt!: Scalars['String'];

  @TypeGraphQL.Field(() => TypeGraphQL.Float)
  total!: Scalars['Float'];

  @TypeGraphQL.Field(() => TypeGraphQL.Float)
  balance!: Scalars['Float'];

  @TypeGraphQL.Field(() => InvoiceType)
  type!: FixDecorator<InvoiceType>;

  @TypeGraphQL.Field(() => String, { nullable: true })
  pdfUrl!: Maybe<Scalars['String']>;

  @TypeGraphQL.Field(() => String, { nullable: true })
  previewUrl!: Maybe<Scalars['String']>;

  @TypeGraphQL.Field(() => TypeGraphQL.Float)
  amount!: Scalars['Float'];

  @TypeGraphQL.Field(() => TypeGraphQL.Float)
  prevBalance!: Scalars['Float'];

  @TypeGraphQL.Field(() => Boolean)
  writeOff!: Scalars['Boolean'];
};

export enum AprType {
  Standard = 'STANDARD',
  Custom = 'CUSTOM'
}
TypeGraphQL.registerEnumType(AprType, { name: 'AprType' });

@TypeGraphQL.ObjectType()
export class Balances {
  __typename?: 'Balances';

  @TypeGraphQL.Field(() => TypeGraphQL.Float)
  availableCredit!: Scalars['Float'];

  @TypeGraphQL.Field(() => TypeGraphQL.Float)
  balance!: Scalars['Float'];

  @TypeGraphQL.Field(() => TypeGraphQL.Float)
  creditLimit!: Scalars['Float'];

  @TypeGraphQL.Field(() => TypeGraphQL.Float)
  nonInvoicedTotal!: Scalars['Float'];

  @TypeGraphQL.Field(() => TypeGraphQL.Float)
  prepaidOnAccount!: Scalars['Float'];

  @TypeGraphQL.Field(() => TypeGraphQL.Float)
  prepaidDeposits!: Scalars['Float'];

  @TypeGraphQL.Field(() => TypeGraphQL.Float)
  paymentDue!: Scalars['Float'];
};

@TypeGraphQL.ObjectType()
export class BankDeposit {
  __typename?: 'BankDeposit';

  @TypeGraphQL.Field(() => TypeGraphQL.ID)
  id!: Scalars['ID'];

  @TypeGraphQL.Field(() => BusinessUnit)
  businessUnit!: FixDecorator<BusinessUnit>;

  @TypeGraphQL.Field(() => TypeGraphQL.Float)
  adjustments!: Scalars['Float'];

  @TypeGraphQL.Field(() => String, { nullable: true })
  merchantId!: Maybe<Scalars['String']>;

  @TypeGraphQL.Field(() => String)
  date!: Scalars['String'];

  @TypeGraphQL.Field(() => BankDepositType)
  depositType!: FixDecorator<BankDepositType>;

  @TypeGraphQL.Field(() => BankDepositStatus)
  status!: FixDecorator<BankDepositStatus>;

  @TypeGraphQL.Field(() => Boolean)
  synced!: Scalars['Boolean'];

  @TypeGraphQL.Field(() => TypeGraphQL.Float)
  total!: Scalars['Float'];

  @TypeGraphQL.Field(() => String, { nullable: true })
  pdfUrl!: Maybe<Scalars['String']>;

  @TypeGraphQL.Field(() => TypeGraphQL.Int)
  count!: Scalars['Int'];

  @TypeGraphQL.Field(() => [Payment])
  payments!: Array<Payment>;
};

export enum BankDepositStatus {
  Locked = 'LOCKED',
  Unlocked = 'UNLOCKED'
}
TypeGraphQL.registerEnumType(BankDepositStatus, { name: 'BankDepositStatus' });

export enum BankDepositType {
  CashCheck = 'CASH_CHECK',
  CreditCard = 'CREDIT_CARD',
  Reversal = 'REVERSAL'
}
TypeGraphQL.registerEnumType(BankDepositType, { name: 'BankDepositType' });

@TypeGraphQL.ObjectType()
export class BatchStatement {
  __typename?: 'BatchStatement';

  @TypeGraphQL.Field(() => TypeGraphQL.ID)
  id!: Scalars['ID'];

  @TypeGraphQL.Field(() => String)
  createdAt!: Scalars['String'];

  @TypeGraphQL.Field(() => String)
  statementDate!: Scalars['String'];

  @TypeGraphQL.Field(() => String)
  endDate!: Scalars['String'];

  @TypeGraphQL.Field(() => TypeGraphQL.Int)
  count!: Scalars['Int'];

  @TypeGraphQL.Field(() => TypeGraphQL.Float)
  total!: Scalars['Float'];

  @TypeGraphQL.Field(() => BusinessUnit)
  businessUnit!: FixDecorator<BusinessUnit>;

  @TypeGraphQL.Field(() => [Statement])
  statements!: Array<Statement>;
};

export enum BatchStatementSorting {
  Id = 'ID',
  StatementDate = 'STATEMENT_DATE',
  EndDate = 'END_DATE',
  Count = 'COUNT',
  Total = 'TOTAL'
}
TypeGraphQL.registerEnumType(BatchStatementSorting, { name: 'BatchStatementSorting' });

export enum BillingCycle {
  Daily = 'DAILY',
  Weekly = 'WEEKLY',
  Monthly = 'MONTHLY',
  TwentyEightDays = 'TWENTY_EIGHT_DAYS',
  Quaterly = 'QUATERLY',
  Yearly = 'YEARLY'
}
TypeGraphQL.registerEnumType(BillingCycle, { name: 'BillingCycle' });

export enum BillingType {
  InAdvance = 'inAdvance',
  Arrears = 'arrears'
}
TypeGraphQL.registerEnumType(BillingType, { name: 'BillingType' });

@TypeGraphQL.ObjectType()
export class BusinessLine {
  __typename?: 'BusinessLine';

  @TypeGraphQL.Field(() => TypeGraphQL.ID)
  id!: Scalars['ID'];

  @TypeGraphQL.Field(() => Boolean)
  active!: Scalars['Boolean'];

  @TypeGraphQL.Field(() => String)
  name!: Scalars['String'];

  @TypeGraphQL.Field(() => String, { nullable: true })
  description!: Maybe<Scalars['String']>;

  @TypeGraphQL.Field(() => String, { nullable: true })
  shortName!: Maybe<Scalars['String']>;

  @TypeGraphQL.Field(() => String)
  type!: Scalars['String'];

  @TypeGraphQL.Field(() => String, { nullable: true })
  createdAt!: Maybe<Scalars['String']>;
};

@TypeGraphQL.ObjectType()
export class BusinessUnit {
  __typename?: 'BusinessUnit';

  @TypeGraphQL.Field(() => TypeGraphQL.ID)
  id!: Scalars['ID'];

  @TypeGraphQL.Field(() => Boolean)
  active!: Scalars['Boolean'];

  @TypeGraphQL.Field(() => String, { nullable: true })
  timeZoneName!: Maybe<Scalars['String']>;

  @TypeGraphQL.Field(() => String)
  nameLine1!: Scalars['String'];

  @TypeGraphQL.Field(() => String)
  type!: Scalars['String'];

  @TypeGraphQL.Field(() => String)
  createdAt!: Scalars['String'];
};

export enum CcSorting {
  Id = 'ID',
  Status = 'STATUS',
  CardNickname = 'CARD_NICKNAME',
  CardType = 'CARD_TYPE',
  ExpirationDate = 'EXPIRATION_DATE',
  PaymentGateway = 'PAYMENT_GATEWAY',
  CardNumber = 'CARD_NUMBER'
}
TypeGraphQL.registerEnumType(CcSorting, { name: 'CcSorting' });

@TypeGraphQL.ObjectType()
export class CreditCard {
  __typename?: 'CreditCard';

  @TypeGraphQL.Field(() => TypeGraphQL.ID)
  id!: Scalars['ID'];

  @TypeGraphQL.Field(() => Boolean)
  active!: Scalars['Boolean'];

  @TypeGraphQL.Field(() => String, { nullable: true })
  cardNickname!: Maybe<Scalars['String']>;

  @TypeGraphQL.Field(() => String)
  cardType!: Scalars['String'];

  @TypeGraphQL.Field(() => String)
  cardNumberLastDigits!: Scalars['String'];

  @TypeGraphQL.Field(() => TypeGraphQL.ID)
  ccAccountId!: Scalars['ID'];

  @TypeGraphQL.Field(() => String)
  ccAccountToken!: Scalars['String'];

  @TypeGraphQL.Field(() => PaymentGateway, { nullable: true })
  paymentGateway!: Maybe<PaymentGateway>;

  @TypeGraphQL.Field(() => TypeGraphQL.ID)
  merchantId!: Scalars['ID'];

  @TypeGraphQL.Field(() => Customer)
  customer!: FixDecorator<Customer>;

  @TypeGraphQL.Field(() => [Payment])
  payments!: Array<Payment>;

  @TypeGraphQL.Field(() => Boolean, { nullable: true })
  spUsed!: Maybe<Scalars['Boolean']>;
};


@TypeGraphQL.ArgsType()
export class CreditCardPaymentsArgs {

  @TypeGraphQL.Field(() => TypeGraphQL.Int, { nullable: true })
  offset!: Maybe<Scalars['Int']>;

  @TypeGraphQL.Field(() => TypeGraphQL.Int, { nullable: true })
  limit!: Maybe<Scalars['Int']>;
};

@TypeGraphQL.ObjectType()
export class CreditCardExtended {
  __typename?: 'CreditCardExtended';

  @TypeGraphQL.Field(() => TypeGraphQL.ID)
  id!: Scalars['ID'];

  @TypeGraphQL.Field(() => Boolean)
  active!: Scalars['Boolean'];

  @TypeGraphQL.Field(() => String, { nullable: true })
  cardNickname!: Maybe<Scalars['String']>;

  @TypeGraphQL.Field(() => String)
  cardType!: Scalars['String'];

  @TypeGraphQL.Field(() => String)
  cardNumberLastDigits!: Scalars['String'];

  @TypeGraphQL.Field(() => TypeGraphQL.ID)
  ccAccountId!: Scalars['ID'];

  @TypeGraphQL.Field(() => String)
  ccAccountToken!: Scalars['String'];

  @TypeGraphQL.Field(() => PaymentGateway, { nullable: true })
  paymentGateway!: Maybe<PaymentGateway>;

  @TypeGraphQL.Field(() => TypeGraphQL.ID)
  merchantId!: Scalars['ID'];

  @TypeGraphQL.Field(() => Customer)
  customer!: FixDecorator<Customer>;

  @TypeGraphQL.Field(() => [Payment])
  payments!: Array<Payment>;

  @TypeGraphQL.Field(() => [JobSite], { nullable: true })
  jobSites!: Maybe<Array<JobSite>>;

  @TypeGraphQL.Field(() => String, { nullable: true })
  nameOnCard!: Maybe<Scalars['String']>;

  @TypeGraphQL.Field(() => String, { nullable: true })
  expirationDate!: Maybe<Scalars['String']>;

  @TypeGraphQL.Field(() => String, { nullable: true })
  addressLine1!: Maybe<Scalars['String']>;

  @TypeGraphQL.Field(() => String, { nullable: true })
  addressLine2!: Maybe<Scalars['String']>;

  @TypeGraphQL.Field(() => String, { nullable: true })
  city!: Maybe<Scalars['String']>;

  @TypeGraphQL.Field(() => String, { nullable: true })
  state!: Maybe<Scalars['String']>;

  @TypeGraphQL.Field(() => String, { nullable: true })
  zip!: Maybe<Scalars['String']>;

  @TypeGraphQL.Field(() => String, { nullable: true })
  expDate!: Maybe<Scalars['String']>;

  @TypeGraphQL.Field(() => Boolean, { nullable: true })
  expiredLabel!: Maybe<Scalars['Boolean']>;

  @TypeGraphQL.Field(() => Boolean, { nullable: true })
  isAutopay!: Maybe<Scalars['Boolean']>;

  @TypeGraphQL.Field(() => Boolean, { nullable: true })
  spUsed!: Maybe<Scalars['Boolean']>;
};

@TypeGraphQL.InputType()
export class CreditCardInput {

  @TypeGraphQL.Field(() => Boolean)
  active!: Scalars['Boolean'];

  @TypeGraphQL.Field(() => String, { nullable: true })
  cardNickname!: Maybe<Scalars['String']>;

  @TypeGraphQL.Field(() => String)
  addressLine1!: Scalars['String'];

  @TypeGraphQL.Field(() => String, { nullable: true })
  addressLine2!: Maybe<Scalars['String']>;

  @TypeGraphQL.Field(() => String)
  city!: Scalars['String'];

  @TypeGraphQL.Field(() => String)
  state!: Scalars['String'];

  @TypeGraphQL.Field(() => String)
  zip!: Scalars['String'];

  @TypeGraphQL.Field(() => String)
  nameOnCard!: Scalars['String'];

  @TypeGraphQL.Field(() => String)
  expirationDate!: Scalars['String'];

  @TypeGraphQL.Field(() => String)
  cardNumber!: Scalars['String'];

  @TypeGraphQL.Field(() => String)
  cvv!: Scalars['String'];
};

@TypeGraphQL.ObjectType()
export class Customer {
  __typename?: 'Customer';

  @TypeGraphQL.Field(() => TypeGraphQL.ID)
  id!: Scalars['ID'];

  @TypeGraphQL.Field(() => TypeGraphQL.ID)
  businessUnitId!: Scalars['ID'];

  @TypeGraphQL.Field(() => String, { nullable: true })
  businessName!: Maybe<Scalars['String']>;

  @TypeGraphQL.Field(() => String, { nullable: true })
  firstName!: Maybe<Scalars['String']>;

  @TypeGraphQL.Field(() => String, { nullable: true })
  lastName!: Maybe<Scalars['String']>;

  @TypeGraphQL.Field(() => String)
  name!: Scalars['String'];

  @TypeGraphQL.Field(() => String)
  status!: Scalars['String'];

  @TypeGraphQL.Field(() => InvoiceConstruction)
  invoiceConstruction!: FixDecorator<InvoiceConstruction>;

  @TypeGraphQL.Field(() => Boolean)
  onAccount!: Scalars['Boolean'];

  @TypeGraphQL.Field(() => TypeGraphQL.Float, { nullable: true })
  creditLimit!: Maybe<Scalars['Float']>;

  @TypeGraphQL.Field(() => BillingCycle, { nullable: true })
  billingCycle!: Maybe<BillingCycle>;

  @TypeGraphQL.Field(() => PaymentTerms, { nullable: true })
  paymentTerms!: Maybe<PaymentTerms>;

  @TypeGraphQL.Field(() => Boolean)
  addFinanceCharges!: Scalars['Boolean'];

  @TypeGraphQL.Field(() => AprType, { nullable: true })
  aprType!: Maybe<AprType>;

  @TypeGraphQL.Field(() => TypeGraphQL.Float, { nullable: true })
  financeCharge!: Maybe<Scalars['Float']>;

  @TypeGraphQL.Field(() => TypeGraphQL.Float)
  balance!: Scalars['Float'];

  @TypeGraphQL.Field(() => Address)
  mailingAddress!: FixDecorator<Address>;

  @TypeGraphQL.Field(() => Address)
  billingAddress!: FixDecorator<Address>;

  @TypeGraphQL.Field(() => TypeGraphQL.ID, { nullable: true })
  cardConnectId!: Maybe<Scalars['ID']>;

  @TypeGraphQL.Field(() => TypeGraphQL.ID, { nullable: true })
  fluidPayId!: Maybe<Scalars['ID']>;

  @TypeGraphQL.Field(() => Boolean)
  sendInvoicesByPost!: Scalars['Boolean'];

  @TypeGraphQL.Field(() => Boolean)
  sendInvoicesByEmail!: Scalars['Boolean'];

  @TypeGraphQL.Field(() => Boolean)
  attachMediaPref!: Scalars['Boolean'];

  @TypeGraphQL.Field(() => Boolean)
  attachTicketPref!: Scalars['Boolean'];

  @TypeGraphQL.Field(() => [String], { nullable: true })
  invoiceEmails!: Maybe<Array<Scalars['String']>>;

  @TypeGraphQL.Field(() => [String], { nullable: true })
  statementEmails!: Maybe<Array<Scalars['String']>>;

  @TypeGraphQL.Field(() => [String], { nullable: true })
  notificationEmails!: Maybe<Array<Scalars['String']>>;

  @TypeGraphQL.Field(() => [CreditCard], { nullable: 'items' })
  creditCards!: Array<Maybe<CreditCard>>;

  @TypeGraphQL.Field(() => [Invoice], { nullable: 'items' })
  invoices!: Array<Maybe<Invoice>>;

  @TypeGraphQL.Field(() => TypeGraphQL.Int)
  invoicesCount!: Scalars['Int'];

  @TypeGraphQL.Field(() => [Payment], { nullable: 'items' })
  payments!: Array<Maybe<Payment>>;
};


@TypeGraphQL.ArgsType()
export class CustomerCreditCardsArgs {

  @TypeGraphQL.Field(() => TypeGraphQL.Int, { nullable: true })
  offset!: Maybe<Scalars['Int']>;

  @TypeGraphQL.Field(() => TypeGraphQL.Int, { nullable: true })
  limit!: Maybe<Scalars['Int']>;
};


@TypeGraphQL.ArgsType()
export class CustomerInvoicesArgs {

  @TypeGraphQL.Field(() => TypeGraphQL.ID, { nullable: true })
  jobSiteId!: Maybe<Scalars['ID']>;

  @TypeGraphQL.Field(() => TypeGraphQL.Int, { nullable: true })
  offset!: Maybe<Scalars['Int']>;

  @TypeGraphQL.Field(() => TypeGraphQL.Int, { nullable: true })
  limit!: Maybe<Scalars['Int']>;

  @TypeGraphQL.Field(() => String, { nullable: true })
  from!: Maybe<Scalars['String']>;

  @TypeGraphQL.Field(() => String, { nullable: true })
  to!: Maybe<Scalars['String']>;

  @TypeGraphQL.Field(() => InvoiceSorting, { nullable: true })
  sortBy!: Maybe<InvoiceSorting>;

  @TypeGraphQL.Field(() => SortOrder, { nullable: true })
  sortOrder!: Maybe<SortOrder>;
};


@TypeGraphQL.ArgsType()
export class CustomerPaymentsArgs {

  @TypeGraphQL.Field(() => TypeGraphQL.Int, { nullable: true })
  offset!: Maybe<Scalars['Int']>;

  @TypeGraphQL.Field(() => TypeGraphQL.Int, { nullable: true })
  limit!: Maybe<Scalars['Int']>;
};

@TypeGraphQL.ObjectType()
export class CustomerLastStatementBalance {
  __typename?: 'CustomerLastStatementBalance';

  @TypeGraphQL.Field(() => TypeGraphQL.ID)
  id!: Scalars['ID'];

  @TypeGraphQL.Field(() => TypeGraphQL.Float, { nullable: true })
  statementBalance!: Maybe<Scalars['Float']>;
};

export enum CustomerType {
  Prepaid = 'PREPAID',
  OnAccount = 'ON_ACCOUNT'
}
TypeGraphQL.registerEnumType(CustomerType, { name: 'CustomerType' });

export enum DeferredPaymentSorting {
  Id = 'ID',
  Status = 'STATUS',
  Date = 'DATE',
  Amount = 'AMOUNT',
  Customer = 'CUSTOMER',
  DeferredUntil = 'DEFERRED_UNTIL'
}
TypeGraphQL.registerEnumType(DeferredPaymentSorting, { name: 'DeferredPaymentSorting' });

export enum DepositSorting {
  Id = 'ID',
  Date = 'DATE',
  DepositType = 'DEPOSIT_TYPE',
  MerchantId = 'MERCHANT_ID',
  Count = 'COUNT',
  SyncWithQb = 'SYNC_WITH_QB',
  Status = 'STATUS',
  Total = 'TOTAL'
}
TypeGraphQL.registerEnumType(DepositSorting, { name: 'DepositSorting' });

@TypeGraphQL.InputType()
export class EditCreditCardInput {

  @TypeGraphQL.Field(() => Boolean)
  active!: Scalars['Boolean'];

  @TypeGraphQL.Field(() => String, { nullable: true })
  cardNickname!: Maybe<Scalars['String']>;

  @TypeGraphQL.Field(() => String)
  addressLine1!: Scalars['String'];

  @TypeGraphQL.Field(() => String, { nullable: true })
  addressLine2!: Maybe<Scalars['String']>;

  @TypeGraphQL.Field(() => String)
  city!: Scalars['String'];

  @TypeGraphQL.Field(() => String)
  state!: Scalars['String'];

  @TypeGraphQL.Field(() => String)
  zip!: Scalars['String'];

  @TypeGraphQL.Field(() => String)
  nameOnCard!: Scalars['String'];

  @TypeGraphQL.Field(() => String)
  expirationDate!: Scalars['String'];

  @TypeGraphQL.Field(() => [TypeGraphQL.ID], { nullable: 'itemsAndList' })
  jobSites!: Maybe<Array<Maybe<Scalars['ID']>>>;
};

@TypeGraphQL.InputType()
export class EditCreditMemoInput {

  @TypeGraphQL.Field(() => String, { nullable: true })
  memoNote!: Maybe<Scalars['String']>;

  @TypeGraphQL.Field(() => String, { nullable: true })
  billableItemType!: Maybe<Scalars['String']>;

  @TypeGraphQL.Field(() => TypeGraphQL.ID, { nullable: true })
  billableItemId!: Maybe<Scalars['ID']>;

  @TypeGraphQL.Field(() => TypeGraphQL.Float)
  amount!: Scalars['Float'];

  @TypeGraphQL.Field(() => String)
  date!: Scalars['String'];
};

export enum EmailEvent {
  Pending = 'PENDING',
  Sent = 'SENT',
  Delivered = 'DELIVERED',
  FailedToSend = 'FAILED_TO_SEND',
  FailedToDeliver = 'FAILED_TO_DELIVER'
}
TypeGraphQL.registerEnumType(EmailEvent, { name: 'EmailEvent' });

@TypeGraphQL.ObjectType()
export class FinChargeGenerationJobResult {
  __typename?: 'FinChargeGenerationJobResult';

  @TypeGraphQL.Field(() => TypeGraphQL.ID)
  id!: Scalars['ID'];

  @TypeGraphQL.Field(() => TypeGraphQL.Int)
  count!: Scalars['Int'];

  @TypeGraphQL.Field(() => TypeGraphQL.Int)
  expectedCount!: Scalars['Int'];

  @TypeGraphQL.Field(() => TypeGraphQL.Int)
  failedCount!: Scalars['Int'];

  @TypeGraphQL.Field(() => GenerationJobStatus)
  status!: FixDecorator<GenerationJobStatus>;

  @TypeGraphQL.Field(() => TypeGraphQL.Float)
  invoicesTotal!: Scalars['Float'];

  @TypeGraphQL.Field(() => TypeGraphQL.Int)
  invoicesCount!: Scalars['Int'];

  @TypeGraphQL.Field(() => TypeGraphQL.Int)
  customersCount!: Scalars['Int'];

  @TypeGraphQL.Field(() => [TypeGraphQL.ID])
  financeChargeIds!: Array<Scalars['ID']>;
};

@TypeGraphQL.ObjectType()
export class FinanceCharge {
  __typename?: 'FinanceCharge';

  @TypeGraphQL.Field(() => TypeGraphQL.ID)
  id!: Scalars['ID'];

  @TypeGraphQL.Field(() => String)
  createdAt!: Scalars['String'];

  @TypeGraphQL.Field(() => TypeGraphQL.Float)
  total!: Scalars['Float'];

  @TypeGraphQL.Field(() => TypeGraphQL.Float)
  balance!: Scalars['Float'];

  @TypeGraphQL.Field(() => String, { nullable: true })
  pdfUrl!: Maybe<Scalars['String']>;

  @TypeGraphQL.Field(() => String)
  exagoPath!: Scalars['String'];

  @TypeGraphQL.Field(() => Customer)
  customer!: FixDecorator<Customer>;

  @TypeGraphQL.Field(() => Invoice)
  invoice!: FixDecorator<Invoice>;

  @TypeGraphQL.Field(() => [Invoice])
  invoices!: Array<Invoice>;

  @TypeGraphQL.Field(() => Statement)
  statement!: FixDecorator<Statement>;

  @TypeGraphQL.Field(() => [Payment], { nullable: 'itemsAndList' })
  payments!: Maybe<Array<Maybe<Payment>>>;

  @TypeGraphQL.Field(() => [FinanceChargeEmail], { nullable: 'itemsAndList' })
  emails!: Maybe<Array<Maybe<FinanceChargeEmail>>>;
};

@TypeGraphQL.ObjectType()
export class FinanceChargeEmail {
  __typename?: 'FinanceChargeEmail';

  @TypeGraphQL.Field(() => TypeGraphQL.ID)
  id!: Scalars['ID'];

  @TypeGraphQL.Field(() => String)
  createdAt!: Scalars['String'];

  @TypeGraphQL.Field(() => String, { nullable: true })
  receiver!: Maybe<Scalars['String']>;

  @TypeGraphQL.Field(() => EmailEvent)
  status!: FixDecorator<EmailEvent>;
};

@TypeGraphQL.InputType()
export class FinanceChargeFilters {

  @TypeGraphQL.Field(() => [InvoiceStatus], { nullable: true })
  filterByStatus!: Maybe<Array<InvoiceStatus>>;

  @TypeGraphQL.Field(() => [CustomerType], { nullable: true })
  filterByCustomer!: Maybe<Array<CustomerType>>;

  @TypeGraphQL.Field(() => String, { nullable: true })
  filterByCreatedFrom!: Maybe<Scalars['String']>;

  @TypeGraphQL.Field(() => String, { nullable: true })
  filterByCreatedTo!: Maybe<Scalars['String']>;

  @TypeGraphQL.Field(() => TypeGraphQL.Float, { nullable: true })
  filterByAmountFrom!: Maybe<Scalars['Float']>;

  @TypeGraphQL.Field(() => TypeGraphQL.Float, { nullable: true })
  filterByAmountTo!: Maybe<Scalars['Float']>;

  @TypeGraphQL.Field(() => TypeGraphQL.Float, { nullable: true })
  filterByBalanceFrom!: Maybe<Scalars['Float']>;

  @TypeGraphQL.Field(() => TypeGraphQL.Float, { nullable: true })
  filterByBalanceTo!: Maybe<Scalars['Float']>;

  @TypeGraphQL.Field(() => [TypeGraphQL.ID], { nullable: true })
  filterByUser!: Maybe<Array<Scalars['ID']>>;
};

@TypeGraphQL.InputType()
export class FinanceChargeInput {

  @TypeGraphQL.Field(() => TypeGraphQL.ID, { nullable: true })
  businessUnitId!: Maybe<Scalars['ID']>;

  @TypeGraphQL.Field(() => TypeGraphQL.ID)
  customerId!: Scalars['ID'];

  @TypeGraphQL.Field(() => TypeGraphQL.Float)
  financeChargeApr!: Scalars['Float'];

  @TypeGraphQL.Field(() => [FinanceChargeInvoiceInput])
  financeChargeInvoices!: Array<FinanceChargeInvoiceInput>;
};

@TypeGraphQL.InputType()
export class FinanceChargeInvoiceInput {

  @TypeGraphQL.Field(() => TypeGraphQL.ID)
  statementId!: Scalars['ID'];

  @TypeGraphQL.Field(() => TypeGraphQL.ID)
  invoiceId!: Scalars['ID'];

  @TypeGraphQL.Field(() => TypeGraphQL.Float)
  fine!: Scalars['Float'];
};

@TypeGraphQL.ObjectType()
export class FinanceChargeResult {
  __typename?: 'FinanceChargeResult';

  @TypeGraphQL.Field(() => TypeGraphQL.Int)
  customersCount!: Scalars['Int'];

  @TypeGraphQL.Field(() => TypeGraphQL.Int)
  invoicesCount!: Scalars['Int'];

  @TypeGraphQL.Field(() => TypeGraphQL.Float)
  invoicesTotal!: Scalars['Float'];
};

export enum FinanceChargesSorting {
  Id = 'ID',
  Status = 'STATUS',
  CreatedAt = 'CREATED_AT',
  Total = 'TOTAL',
  RemainingBalance = 'REMAINING_BALANCE',
  Customer = 'CUSTOMER',
  CustomerType = 'CUSTOMER_TYPE'
}
TypeGraphQL.registerEnumType(FinanceChargesSorting, { name: 'FinanceChargesSorting' });

@TypeGraphQL.ObjectType()
export class GenerationJob {
  __typename?: 'GenerationJob';

  @TypeGraphQL.Field(() => TypeGraphQL.ID)
  id!: Scalars['ID'];

  @TypeGraphQL.Field(() => GenerationJobStatus, { nullable: true })
  status!: Maybe<GenerationJobStatus>;

  @TypeGraphQL.Field(() => TypeGraphQL.Int)
  count!: Scalars['Int'];

  @TypeGraphQL.Field(() => TypeGraphQL.Int)
  expectedCount!: Scalars['Int'];

  @TypeGraphQL.Field(() => TypeGraphQL.Int)
  failedCount!: Scalars['Int'];

  @TypeGraphQL.Field(() => String, { nullable: true })
  startTime!: Maybe<Scalars['String']>;

  @TypeGraphQL.Field(() => String, { nullable: true })
  endTime!: Maybe<Scalars['String']>;

  @TypeGraphQL.Field(() => TypeGraphQL.Int, { nullable: true })
  durationInSec!: Maybe<Scalars['Int']>;
};

export enum GenerationJobStatus {
  Pending = 'PENDING',
  Finished = 'FINISHED',
  Failed = 'FAILED'
}
TypeGraphQL.registerEnumType(GenerationJobStatus, { name: 'GenerationJobStatus' });

@TypeGraphQL.ObjectType()
export class Invoice {
  __typename?: 'Invoice';

  @TypeGraphQL.Field(() => TypeGraphQL.ID)
  id!: Scalars['ID'];

  @TypeGraphQL.Field(() => String, { nullable: true })
  dueDate!: Maybe<Scalars['String']>;

  @TypeGraphQL.Field(() => String)
  createdAt!: Scalars['String'];

  @TypeGraphQL.Field(() => String)
  csrName!: Scalars['String'];

  @TypeGraphQL.Field(() => String)
  csrEmail!: Scalars['String'];

  @TypeGraphQL.Field(() => TypeGraphQL.Float, { nullable: true })
  fine!: Maybe<Scalars['Float']>;

  @TypeGraphQL.Field(() => TypeGraphQL.Float)
  total!: Scalars['Float'];

  @TypeGraphQL.Field(() => TypeGraphQL.Float)
  balance!: Scalars['Float'];

  @TypeGraphQL.Field(() => String, { nullable: true })
  pdfUrl!: Maybe<Scalars['String']>;

  @TypeGraphQL.Field(() => String, { nullable: true })
  previewUrl!: Maybe<Scalars['String']>;

  @TypeGraphQL.Field(() => InvoiceType)
  type!: FixDecorator<InvoiceType>;

  @TypeGraphQL.Field(() => [BusinessLine], { nullable: 'itemsAndList' })
  businessLines!: Maybe<Array<Maybe<BusinessLine>>>;

  @TypeGraphQL.Field(() => [Order], { nullable: true })
  orders!: Maybe<Array<Order>>;

  @TypeGraphQL.Field(() => [InvoicedEntityUnion], { nullable: true })
  invoicedEntity!: Maybe<Array<InvoicedEntity>>;

  @TypeGraphQL.Field(() => Customer)
  customer!: FixDecorator<Customer>;

  @TypeGraphQL.Field(() => [Payment])
  payments!: Array<Payment>;

  @TypeGraphQL.Field(() => [InvoiceEmail])
  emails!: Array<InvoiceEmail>;

  @TypeGraphQL.Field(() => Boolean)
  writeOff!: Scalars['Boolean'];

  @TypeGraphQL.Field(() => BusinessUnit, { nullable: true })
  businessUnit!: Maybe<BusinessUnit>;

  @TypeGraphQL.Field(() => TypeGraphQL.Int, { nullable: true })
  financeChargeId!: Maybe<Scalars['Int']>;
};

export enum InvoiceAge {
  Current = 'CURRENT',
  Overdue_31Days = 'OVERDUE_31_DAYS',
  Overdue_61Days = 'OVERDUE_61_DAYS',
  Overdue_91Days = 'OVERDUE_91_DAYS'
}
TypeGraphQL.registerEnumType(InvoiceAge, { name: 'InvoiceAge' });

export enum InvoiceConstruction {
  ByOrder = 'BY_ORDER',
  ByAddress = 'BY_ADDRESS',
  ByCustomer = 'BY_CUSTOMER'
}
TypeGraphQL.registerEnumType(InvoiceConstruction, { name: 'InvoiceConstruction' });

@TypeGraphQL.ObjectType()
export class InvoiceEmail {
  __typename?: 'InvoiceEmail';

  @TypeGraphQL.Field(() => TypeGraphQL.ID)
  id!: Scalars['ID'];

  @TypeGraphQL.Field(() => String)
  createdAt!: Scalars['String'];

  @TypeGraphQL.Field(() => String, { nullable: true })
  receiver!: Maybe<Scalars['String']>;

  @TypeGraphQL.Field(() => EmailEvent)
  status!: FixDecorator<EmailEvent>;
};

@TypeGraphQL.InputType()
export class InvoiceFilters {

  @TypeGraphQL.Field(() => Boolean, { nullable: true })
  canWriteOff!: Maybe<Scalars['Boolean']>;

  @TypeGraphQL.Field(() => [InvoiceType], { nullable: true })
  filterByType!: Maybe<Array<InvoiceType>>;

  @TypeGraphQL.Field(() => [InvoiceStatus], { nullable: true })
  filterByStatus!: Maybe<Array<InvoiceStatus>>;

  @TypeGraphQL.Field(() => [CustomerType], { nullable: true })
  filterByCustomer!: Maybe<Array<CustomerType>>;

  @TypeGraphQL.Field(() => [InvoiceAge], { nullable: true })
  filterByAge!: Maybe<Array<InvoiceAge>>;

  @TypeGraphQL.Field(() => String, { nullable: true })
  filterByDueDateFrom!: Maybe<Scalars['String']>;

  @TypeGraphQL.Field(() => String, { nullable: true })
  filterByDueDateTo!: Maybe<Scalars['String']>;

  @TypeGraphQL.Field(() => String, { nullable: true })
  filterByCreatedFrom!: Maybe<Scalars['String']>;

  @TypeGraphQL.Field(() => String, { nullable: true })
  filterByCreatedTo!: Maybe<Scalars['String']>;

  @TypeGraphQL.Field(() => TypeGraphQL.Float, { nullable: true })
  filterByAmountFrom!: Maybe<Scalars['Float']>;

  @TypeGraphQL.Field(() => TypeGraphQL.Float, { nullable: true })
  filterByAmountTo!: Maybe<Scalars['Float']>;

  @TypeGraphQL.Field(() => TypeGraphQL.Float, { nullable: true })
  filterByBalanceFrom!: Maybe<Scalars['Float']>;

  @TypeGraphQL.Field(() => TypeGraphQL.Float, { nullable: true })
  filterByBalanceTo!: Maybe<Scalars['Float']>;

  @TypeGraphQL.Field(() => [TypeGraphQL.ID], { nullable: true })
  filterByUser!: Maybe<Array<Scalars['ID']>>;

  @TypeGraphQL.Field(() => [TypeGraphQL.ID], { nullable: true })
  filterBusinessLineIds!: Maybe<Array<Scalars['ID']>>;
};

@TypeGraphQL.ObjectType()
export class InvoiceGenerationJobResult {
  __typename?: 'InvoiceGenerationJobResult';

  @TypeGraphQL.Field(() => TypeGraphQL.ID)
  id!: Scalars['ID'];

  @TypeGraphQL.Field(() => TypeGraphQL.Int)
  count!: Scalars['Int'];

  @TypeGraphQL.Field(() => TypeGraphQL.Int)
  expectedCount!: Scalars['Int'];

  @TypeGraphQL.Field(() => TypeGraphQL.Int)
  failedCount!: Scalars['Int'];

  @TypeGraphQL.Field(() => GenerationJobStatus)
  status!: FixDecorator<GenerationJobStatus>;

  @TypeGraphQL.Field(() => String, { nullable: true })
  startTime!: Maybe<Scalars['String']>;

  @TypeGraphQL.Field(() => String, { nullable: true })
  endTime!: Maybe<Scalars['String']>;

  @TypeGraphQL.Field(() => TypeGraphQL.Int, { nullable: true })
  durationInSec!: Maybe<Scalars['Int']>;

  @TypeGraphQL.Field(() => TypeGraphQL.Int)
  processedOrders!: Scalars['Int'];

  @TypeGraphQL.Field(() => TypeGraphQL.Int)
  processedSubscriptions!: Scalars['Int'];

  @TypeGraphQL.Field(() => TypeGraphQL.Int)
  customersIncluded!: Scalars['Int'];

  @TypeGraphQL.Field(() => TypeGraphQL.Int)
  generatedInvoices!: Scalars['Int'];

  @TypeGraphQL.Field(() => TypeGraphQL.Float)
  invoicesTotal!: Scalars['Float'];
};

export enum InvoiceMailing {
  AttachTicket = 'ATTACH_TICKET',
  AttachAllMedia = 'ATTACH_ALL_MEDIA'
}
TypeGraphQL.registerEnumType(InvoiceMailing, { name: 'InvoiceMailing' });

export enum InvoiceSorting {
  Id = 'ID',
  Balance = 'BALANCE',
  CreatedAt = 'CREATED_AT',
  DueDate = 'DUE_DATE',
  Total = 'TOTAL',
  CustomerName = 'CUSTOMER_NAME',
  CustomerType = 'CUSTOMER_TYPE',
  Status = 'STATUS'
}
TypeGraphQL.registerEnumType(InvoiceSorting, { name: 'InvoiceSorting' });

export enum InvoiceStatus {
  Open = 'OPEN',
  Closed = 'CLOSED',
  Overdue = 'OVERDUE',
  WriteOff = 'WRITE_OFF'
}
TypeGraphQL.registerEnumType(InvoiceStatus, { name: 'InvoiceStatus' });

export enum InvoiceType {
  Orders = 'ORDERS',
  FinanceCharges = 'FINANCE_CHARGES',
  Subscriptions = 'SUBSCRIPTIONS'
}
TypeGraphQL.registerEnumType(InvoiceType, { name: 'InvoiceType' });


export type InvoicedEntity = Order | Subscription;

const InvoicedEntityUnion = TypeGraphQL.createUnionType({ name: 'InvoicedEntityUnion', types: () => [Order, Subscription] as const })

@TypeGraphQL.ObjectType()
export class JobSite {
  __typename?: 'JobSite';

  @TypeGraphQL.Field(() => TypeGraphQL.ID)
  id!: Scalars['ID'];

  @TypeGraphQL.Field(() => String)
  addressLine1!: Scalars['String'];

  @TypeGraphQL.Field(() => String, { nullable: true })
  addressLine2!: Maybe<Scalars['String']>;

  @TypeGraphQL.Field(() => String)
  city!: Scalars['String'];

  @TypeGraphQL.Field(() => String)
  state!: Scalars['String'];

  @TypeGraphQL.Field(() => String)
  zip!: Scalars['String'];
};

@TypeGraphQL.ObjectType()
export class LineItem {
  __typename?: 'LineItem';

  @TypeGraphQL.Field(() => TypeGraphQL.ID)
  id!: Scalars['ID'];

  @TypeGraphQL.Field(() => TypeGraphQL.Float)
  price!: Scalars['Float'];

  @TypeGraphQL.Field(() => TypeGraphQL.Int)
  quantity!: Scalars['Int'];

  @TypeGraphQL.Field(() => TypeGraphQL.Float)
  totalPrice!: Scalars['Float'];

  @TypeGraphQL.Field(() => String, { nullable: true })
  periodTo!: Maybe<Scalars['String']>;

  @TypeGraphQL.Field(() => String, { nullable: true })
  periodSince!: Maybe<Scalars['String']>;

  @TypeGraphQL.Field(() => String)
  serviceName!: Scalars['String'];

  @TypeGraphQL.Field(() => TypeGraphQL.Int)
  totalDay!: Scalars['Int'];

  @TypeGraphQL.Field(() => TypeGraphQL.Int)
  usageDay!: Scalars['Int'];
};

export type Mutation = {
  __typename?: 'Mutation';
  applyPayment: Payment;
  reversePayment: Payment;
  createUnappliedPayment: Payment;
  createPayout: Payout;
  refundUnappliedPayment: Payment;
  chargeDeferredPayment: Payment;
  chargeDeferredPayments: Array<Payment>;
  refundPrepaidOrder: Scalars['Float'];
  requestSettlement: Scalars['ID'];
  deleteSettlements?: Maybe<Scalars['Boolean']>;
  sendInvoices?: Maybe<Scalars['Boolean']>;
  ordersPutOnAccount?: Maybe<Scalars['Boolean']>;
  writeOffInvoices: Payment;
  createStatement: Scalars['ID'];
  deleteStatement?: Maybe<Scalars['Boolean']>;
  sendStatements?: Maybe<Scalars['Boolean']>;
  addCreditCard?: Maybe<CreditCardExtended>;
  updateCreditCard?: Maybe<CreditCardExtended>;
  deleteCreditCard?: Maybe<Scalars['Boolean']>;
  editCreditMemo?: Maybe<Payment>;
  deleteCreditMemo?: Maybe<Scalars['Boolean']>;
  newMultiOrderPayment?: Maybe<Payment>;
  createFinanceCharge: Scalars['ID'];
  sendFinanceCharges?: Maybe<Scalars['Boolean']>;
  lockBankDeposit?: Maybe<BankDeposit>;
  unlockBankDeposit?: Maybe<Scalars['Boolean']>;
  deleteBankDeposit?: Maybe<Scalars['Boolean']>;
  createBatchStatement?: Maybe<Scalars['ID']>;
  sendBatchStatements?: Maybe<Scalars['Boolean']>;
};


@TypeGraphQL.ArgsType()
export class MutationApplyPaymentArgs {

  @TypeGraphQL.Field(() => TypeGraphQL.ID)
  paymentId!: Scalars['ID'];

  @TypeGraphQL.Field(() => [PaymentApplicationInput])
  applications!: Array<PaymentApplicationInput>;
};


@TypeGraphQL.ArgsType()
export class MutationReversePaymentArgs {

  @TypeGraphQL.Field(() => TypeGraphQL.ID)
  paymentId!: Scalars['ID'];

  @TypeGraphQL.Field(() => ReverseDataInput)
  reverseData!: FixDecorator<ReverseDataInput>;
};


@TypeGraphQL.ArgsType()
export class MutationCreateUnappliedPaymentArgs {

  @TypeGraphQL.Field(() => TypeGraphQL.ID)
  customerId!: Scalars['ID'];

  @TypeGraphQL.Field(() => UnappliedPaymentInput)
  data!: FixDecorator<UnappliedPaymentInput>;
};


@TypeGraphQL.ArgsType()
export class MutationCreatePayoutArgs {

  @TypeGraphQL.Field(() => TypeGraphQL.ID)
  customerId!: Scalars['ID'];

  @TypeGraphQL.Field(() => PayoutInput)
  data!: FixDecorator<PayoutInput>;
};


@TypeGraphQL.ArgsType()
export class MutationRefundUnappliedPaymentArgs {

  @TypeGraphQL.Field(() => TypeGraphQL.ID)
  paymentId!: Scalars['ID'];

  @TypeGraphQL.Field(() => TypeGraphQL.Float)
  amount!: Scalars['Float'];
};


@TypeGraphQL.ArgsType()
export class MutationChargeDeferredPaymentArgs {

  @TypeGraphQL.Field(() => TypeGraphQL.ID)
  paymentId!: Scalars['ID'];
};


@TypeGraphQL.ArgsType()
export class MutationChargeDeferredPaymentsArgs {

  @TypeGraphQL.Field(() => [TypeGraphQL.ID])
  paymentIds!: Array<Scalars['ID']>;
};


@TypeGraphQL.ArgsType()
export class MutationRefundPrepaidOrderArgs {

  @TypeGraphQL.Field(() => TypeGraphQL.ID)
  orderId!: Scalars['ID'];

  @TypeGraphQL.Field(() => TypeGraphQL.Float)
  amount!: Scalars['Float'];

  @TypeGraphQL.Field(() => RefundType)
  refundType!: FixDecorator<RefundType>;

  @TypeGraphQL.Field(() => TypeGraphQL.ID)
  refundedPaymentId!: Scalars['ID'];

  @TypeGraphQL.Field(() => String, { nullable: true })
  checkNumber!: Maybe<Scalars['String']>;
};


@TypeGraphQL.ArgsType()
export class MutationRequestSettlementArgs {

  @TypeGraphQL.Field(() => String)
  date!: Scalars['String'];

  @TypeGraphQL.Field(() => TypeGraphQL.ID)
  businessUnitId!: Scalars['ID'];

  @TypeGraphQL.Field(() => TypeGraphQL.ID)
  merchantId!: Scalars['ID'];

  @TypeGraphQL.Field(() => String)
  mid!: Scalars['String'];
};


@TypeGraphQL.ArgsType()
export class MutationDeleteSettlementsArgs {

  @TypeGraphQL.Field(() => [TypeGraphQL.ID])
  ids!: Array<Scalars['ID']>;
};


@TypeGraphQL.ArgsType()
export class MutationSendInvoicesArgs {

  @TypeGraphQL.Field(() => [TypeGraphQL.Int])
  invoiceIds!: Array<Scalars['Int']>;

  @TypeGraphQL.Field(() => InvoiceMailing, { nullable: true })
  attachMedia!: Maybe<InvoiceMailing>;

  @TypeGraphQL.Field(() => Boolean, { nullable: true })
  sendToCustomerInvoiceEmails!: Maybe<Scalars['Boolean']>;

  @TypeGraphQL.Field(() => [String])
  customerEmails!: Array<Scalars['String']>;
};


@TypeGraphQL.ArgsType()
export class MutationOrdersPutOnAccountArgs {

  @TypeGraphQL.Field(() => [TypeGraphQL.Int])
  orderIds!: Array<Scalars['Int']>;

  @TypeGraphQL.Field(() => Boolean, { nullable: true })
  overrideCreditLimit!: Maybe<Scalars['Boolean']>;
};


@TypeGraphQL.ArgsType()
export class MutationWriteOffInvoicesArgs {

  @TypeGraphQL.Field(() => [TypeGraphQL.ID])
  invoiceIds!: Array<Scalars['ID']>;

  @TypeGraphQL.Field(() => TypeGraphQL.ID)
  customerId!: Scalars['ID'];

  @TypeGraphQL.Field(() => String)
  note!: Scalars['String'];
};


@TypeGraphQL.ArgsType()
export class MutationCreateStatementArgs {

  @TypeGraphQL.Field(() => TypeGraphQL.ID)
  businessUnitId!: Scalars['ID'];

  @TypeGraphQL.Field(() => TypeGraphQL.ID)
  customerId!: Scalars['ID'];

  @TypeGraphQL.Field(() => String)
  statementDate!: Scalars['String'];

  @TypeGraphQL.Field(() => String)
  endDate!: Scalars['String'];
};


@TypeGraphQL.ArgsType()
export class MutationDeleteStatementArgs {

  @TypeGraphQL.Field(() => TypeGraphQL.ID)
  id!: Scalars['ID'];
};


@TypeGraphQL.ArgsType()
export class MutationSendStatementsArgs {

  @TypeGraphQL.Field(() => [TypeGraphQL.ID])
  ids!: Array<Scalars['ID']>;

  @TypeGraphQL.Field(() => [String], { nullable: true })
  emails!: Maybe<Array<Scalars['String']>>;
};


@TypeGraphQL.ArgsType()
export class MutationAddCreditCardArgs {

  @TypeGraphQL.Field(() => TypeGraphQL.ID)
  customerId!: Scalars['ID'];

  @TypeGraphQL.Field(() => AddCreditCardInput, { nullable: true })
  data!: Maybe<AddCreditCardInput>;
};


@TypeGraphQL.ArgsType()
export class MutationUpdateCreditCardArgs {

  @TypeGraphQL.Field(() => TypeGraphQL.ID)
  id!: Scalars['ID'];

  @TypeGraphQL.Field(() => EditCreditCardInput, { nullable: true })
  data!: Maybe<EditCreditCardInput>;
};


@TypeGraphQL.ArgsType()
export class MutationDeleteCreditCardArgs {

  @TypeGraphQL.Field(() => TypeGraphQL.ID)
  id!: Scalars['ID'];
};


@TypeGraphQL.ArgsType()
export class MutationEditCreditMemoArgs {

  @TypeGraphQL.Field(() => TypeGraphQL.ID)
  id!: Scalars['ID'];

  @TypeGraphQL.Field(() => EditCreditMemoInput, { nullable: true })
  data!: Maybe<EditCreditMemoInput>;
};


@TypeGraphQL.ArgsType()
export class MutationDeleteCreditMemoArgs {

  @TypeGraphQL.Field(() => TypeGraphQL.ID)
  id!: Scalars['ID'];
};


@TypeGraphQL.ArgsType()
export class MutationNewMultiOrderPaymentArgs {

  @TypeGraphQL.Field(() => TypeGraphQL.ID)
  customerId!: Scalars['ID'];

  @TypeGraphQL.Field(() => NewMultiOrderPayment, { nullable: true })
  data!: Maybe<NewMultiOrderPayment>;
};


@TypeGraphQL.ArgsType()
export class MutationCreateFinanceChargeArgs {

  @TypeGraphQL.Field(() => [FinanceChargeInput])
  data!: Array<FinanceChargeInput>;
};


@TypeGraphQL.ArgsType()
export class MutationSendFinanceChargesArgs {

  @TypeGraphQL.Field(() => [TypeGraphQL.ID])
  ids!: Array<Scalars['ID']>;

  @TypeGraphQL.Field(() => [String], { nullable: true })
  emails!: Maybe<Array<Scalars['String']>>;
};


@TypeGraphQL.ArgsType()
export class MutationLockBankDepositArgs {

  @TypeGraphQL.Field(() => TypeGraphQL.ID)
  businessUnitId!: Scalars['ID'];

  @TypeGraphQL.Field(() => String)
  date!: Scalars['String'];
};


@TypeGraphQL.ArgsType()
export class MutationUnlockBankDepositArgs {

  @TypeGraphQL.Field(() => TypeGraphQL.ID)
  id!: Scalars['ID'];

  @TypeGraphQL.Field(() => TypeGraphQL.ID)
  businessUnitId!: Scalars['ID'];
};


@TypeGraphQL.ArgsType()
export class MutationDeleteBankDepositArgs {

  @TypeGraphQL.Field(() => TypeGraphQL.ID)
  id!: Scalars['ID'];
};


@TypeGraphQL.ArgsType()
export class MutationCreateBatchStatementArgs {

  @TypeGraphQL.Field(() => TypeGraphQL.ID)
  businessUnitId!: Scalars['ID'];

  @TypeGraphQL.Field(() => [TypeGraphQL.ID])
  customerIds!: Array<Scalars['ID']>;

  @TypeGraphQL.Field(() => String)
  statementDate!: Scalars['String'];

  @TypeGraphQL.Field(() => String)
  endDate!: Scalars['String'];
};


@TypeGraphQL.ArgsType()
export class MutationSendBatchStatementsArgs {

  @TypeGraphQL.Field(() => [TypeGraphQL.ID])
  ids!: Array<Scalars['ID']>;
};

@TypeGraphQL.InputType()
export class NewMultiOrderPayment {

  @TypeGraphQL.Field(() => [TypeGraphQL.ID])
  orderIds!: Array<Scalars['ID']>;

  @TypeGraphQL.Field(() => TypeGraphQL.ID, { nullable: true })
  creditCardId!: Maybe<Scalars['ID']>;

  @TypeGraphQL.Field(() => CreditCardInput, { nullable: true })
  newCreditCard!: Maybe<CreditCardInput>;

  @TypeGraphQL.Field(() => PaymentType)
  paymentType!: FixDecorator<PaymentType>;

  @TypeGraphQL.Field(() => String, { nullable: true })
  date!: Maybe<Scalars['String']>;

  @TypeGraphQL.Field(() => String, { nullable: true })
  checkNumber!: Maybe<Scalars['String']>;

  @TypeGraphQL.Field(() => Boolean, { nullable: true })
  isAch!: Maybe<Scalars['Boolean']>;

  @TypeGraphQL.Field(() => Boolean, { nullable: true })
  sendReceipt!: Maybe<Scalars['Boolean']>;

  @TypeGraphQL.Field(() => String, { nullable: true })
  deferredUntil!: Maybe<Scalars['String']>;
};

@TypeGraphQL.ObjectType()
export class NonInvoicedOrdersTotals {
  __typename?: 'NonInvoicedOrdersTotals';

  @TypeGraphQL.Field(() => TypeGraphQL.Float)
  prepaidTotal!: Scalars['Float'];

  @TypeGraphQL.Field(() => TypeGraphQL.Float)
  prepaidOnAccount!: Scalars['Float'];

  @TypeGraphQL.Field(() => TypeGraphQL.Float)
  total!: Scalars['Float'];
};

@TypeGraphQL.ObjectType()
export class Order {
  __typename?: 'Order';

  @TypeGraphQL.Field(() => TypeGraphQL.ID)
  id!: Scalars['ID'];

  @TypeGraphQL.Field(() => PaymentMethod)
  paymentMethod!: FixDecorator<PaymentMethod>;

  @TypeGraphQL.Field(() => TypeGraphQL.Float)
  grandTotal!: Scalars['Float'];

  @TypeGraphQL.Field(() => TypeGraphQL.Float)
  beforeTaxesTotal!: Scalars['Float'];

  @TypeGraphQL.Field(() => TypeGraphQL.Float)
  capturedTotal!: Scalars['Float'];

  @TypeGraphQL.Field(() => TypeGraphQL.Float)
  refundedTotal!: Scalars['Float'];

  @TypeGraphQL.Field(() => String)
  serviceDate!: Scalars['String'];

  @TypeGraphQL.Field(() => String, { nullable: true })
  invoiceNotes!: Maybe<Scalars['String']>;

  @TypeGraphQL.Field(() => TypeGraphQL.Int, { nullable: true })
  woNumber!: Maybe<Scalars['Int']>;

  @TypeGraphQL.Field(() => String, { nullable: true })
  ticketUrl!: Maybe<Scalars['String']>;

  @TypeGraphQL.Field(() => [OrderLineItem])
  lineItems!: Array<OrderLineItem>;

  @TypeGraphQL.Field(() => Invoice, { nullable: true })
  invoice!: Maybe<Invoice>;

  @TypeGraphQL.Field(() => [Payment], { nullable: 'items' })
  payments!: Array<Maybe<Payment>>;

  @TypeGraphQL.Field(() => JobSite)
  jobSite!: FixDecorator<JobSite>;

  @TypeGraphQL.Field(() => Customer)
  customer!: FixDecorator<Customer>;

  @TypeGraphQL.Field(() => BusinessUnit, { nullable: true })
  businessUnit!: Maybe<BusinessUnit>;
};

@TypeGraphQL.ObjectType()
export class OrderLineItem {
  __typename?: 'OrderLineItem';

  @TypeGraphQL.Field(() => TypeGraphQL.ID)
  id!: Scalars['ID'];

  @TypeGraphQL.Field(() => String)
  description!: Scalars['String'];

  @TypeGraphQL.Field(() => TypeGraphQL.Float)
  price!: Scalars['Float'];

  @TypeGraphQL.Field(() => TypeGraphQL.Int)
  quantity!: Scalars['Int'];

  @TypeGraphQL.Field(() => TypeGraphQL.Float)
  total!: Scalars['Float'];

  @TypeGraphQL.Field(() => Boolean)
  isService!: Scalars['Boolean'];

  @TypeGraphQL.Field(() => TypeGraphQL.Int, { nullable: true })
  billableServiceHistoricalId!: Maybe<Scalars['Int']>;

  @TypeGraphQL.Field(() => TypeGraphQL.Int, { nullable: true })
  billableLineItemHistoricalId!: Maybe<Scalars['Int']>;

  @TypeGraphQL.Field(() => Order)
  order!: FixDecorator<Order>;
};

@TypeGraphQL.ObjectType()
export class PaidOutPayment {
  __typename?: 'PaidOutPayment';

  @TypeGraphQL.Field(() => TypeGraphQL.ID)
  id!: Scalars['ID'];

  @TypeGraphQL.Field(() => PaymentStatus)
  status!: FixDecorator<PaymentStatus>;

  @TypeGraphQL.Field(() => PaymentInvoicedStatus, { nullable: true })
  invoicedStatus!: Maybe<PaymentInvoicedStatus>;

  @TypeGraphQL.Field(() => String)
  date!: Scalars['String'];

  @TypeGraphQL.Field(() => PaymentType)
  paymentType!: FixDecorator<PaymentType>;

  @TypeGraphQL.Field(() => TypeGraphQL.Float)
  amount!: Scalars['Float'];

  @TypeGraphQL.Field(() => Boolean)
  sendReceipt!: Scalars['Boolean'];

  @TypeGraphQL.Field(() => String, { nullable: true })
  checkNumber!: Maybe<Scalars['String']>;

  @TypeGraphQL.Field(() => Boolean)
  isAch!: Scalars['Boolean'];

  @TypeGraphQL.Field(() => TypeGraphQL.Float)
  prevBalance!: Scalars['Float'];

  @TypeGraphQL.Field(() => TypeGraphQL.Float, { nullable: true })
  newBalance!: Maybe<Scalars['Float']>;

  @TypeGraphQL.Field(() => TypeGraphQL.Float)
  appliedAmount!: Scalars['Float'];

  @TypeGraphQL.Field(() => TypeGraphQL.Float, { nullable: true })
  unappliedAmount!: Maybe<Scalars['Float']>;

  @TypeGraphQL.Field(() => TypeGraphQL.Float)
  paidOutAmount!: Scalars['Float'];

  @TypeGraphQL.Field(() => TypeGraphQL.Float)
  refundedAmount!: Scalars['Float'];

  @TypeGraphQL.Field(() => TypeGraphQL.Float)
  refundedOnAccountAmount!: Scalars['Float'];
};

@TypeGraphQL.ObjectType()
export class Payment {
  __typename?: 'Payment';

  @TypeGraphQL.Field(() => TypeGraphQL.ID)
  id!: Scalars['ID'];

  @TypeGraphQL.Field(() => TypeGraphQL.ID, { nullable: true })
  originalPaymentId!: Maybe<Scalars['ID']>;

  @TypeGraphQL.Field(() => PaymentStatus)
  status!: FixDecorator<PaymentStatus>;

  @TypeGraphQL.Field(() => PaymentInvoicedStatus, { nullable: true })
  invoicedStatus!: Maybe<PaymentInvoicedStatus>;

  @TypeGraphQL.Field(() => String)
  date!: Scalars['String'];

  @TypeGraphQL.Field(() => PaymentType)
  paymentType!: FixDecorator<PaymentType>;

  @TypeGraphQL.Field(() => TypeGraphQL.Float)
  amount!: Scalars['Float'];

  @TypeGraphQL.Field(() => Boolean)
  sendReceipt!: Scalars['Boolean'];

  @TypeGraphQL.Field(() => String, { nullable: true })
  checkNumber!: Maybe<Scalars['String']>;

  @TypeGraphQL.Field(() => Boolean)
  isAch!: Scalars['Boolean'];

  @TypeGraphQL.Field(() => String, { nullable: true })
  memoNote!: Maybe<Scalars['String']>;

  @TypeGraphQL.Field(() => String, { nullable: true })
  billableItemType!: Maybe<Scalars['String']>;

  @TypeGraphQL.Field(() => TypeGraphQL.ID, { nullable: true })
  billableItemId!: Maybe<Scalars['ID']>;

  @TypeGraphQL.Field(() => String, { nullable: true })
  writeOffNote!: Maybe<Scalars['String']>;

  @TypeGraphQL.Field(() => String, { nullable: true })
  deferredUntil!: Maybe<Scalars['String']>;

  @TypeGraphQL.Field(() => TypeGraphQL.Float)
  prevBalance!: Scalars['Float'];

  @TypeGraphQL.Field(() => TypeGraphQL.Float, { nullable: true })
  newBalance!: Maybe<Scalars['Float']>;

  @TypeGraphQL.Field(() => TypeGraphQL.Float)
  appliedAmount!: Scalars['Float'];

  @TypeGraphQL.Field(() => TypeGraphQL.Float, { nullable: true })
  unappliedAmount!: Maybe<Scalars['Float']>;

  @TypeGraphQL.Field(() => TypeGraphQL.Float)
  paidOutAmount!: Scalars['Float'];

  @TypeGraphQL.Field(() => TypeGraphQL.Float)
  refundedAmount!: Scalars['Float'];

  @TypeGraphQL.Field(() => TypeGraphQL.Float)
  refundedOnAccountAmount!: Scalars['Float'];

  @TypeGraphQL.Field(() => String, { nullable: true })
  receiptPreviewUrl!: Maybe<Scalars['String']>;

  @TypeGraphQL.Field(() => String, { nullable: true })
  receiptPdfUrl!: Maybe<Scalars['String']>;

  @TypeGraphQL.Field(() => String, { nullable: true })
  bankDepositDate!: Maybe<Scalars['String']>;

  @TypeGraphQL.Field(() => Customer)
  customer!: FixDecorator<Customer>;

  @TypeGraphQL.Field(() => [PaymentRelatedOrder])
  orders!: Array<PaymentRelatedOrder>;

  @TypeGraphQL.Field(() => CreditCard, { nullable: true })
  creditCard!: Maybe<CreditCard>;

  @TypeGraphQL.Field(() => [AppliedInvoice])
  invoices!: Array<AppliedInvoice>;

  @TypeGraphQL.Field(() => ReverseData, { nullable: true })
  reverseData!: Maybe<ReverseData>;

  @TypeGraphQL.Field(() => [RefundData], { nullable: 'itemsAndList' })
  refundData!: Maybe<Array<Maybe<RefundData>>>;

  @TypeGraphQL.Field(() => Boolean)
  isEditable!: Scalars['Boolean'];

  @TypeGraphQL.Field(() => Boolean)
  isPrepay!: Scalars['Boolean'];
};

@TypeGraphQL.InputType()
export class PaymentApplicationInput {

  @TypeGraphQL.Field(() => TypeGraphQL.ID)
  invoiceId!: Scalars['ID'];

  @TypeGraphQL.Field(() => TypeGraphQL.Float)
  amount!: Scalars['Float'];
};

@TypeGraphQL.InputType()
export class PaymentFilters {

  @TypeGraphQL.Field(() => String, { nullable: true })
  filterByCreatedFrom!: Maybe<Scalars['String']>;

  @TypeGraphQL.Field(() => String, { nullable: true })
  filterByCreatedTo!: Maybe<Scalars['String']>;

  @TypeGraphQL.Field(() => [PaymentInvoicedStatus], { nullable: true })
  filterByInvoicedStatus!: Maybe<Array<PaymentInvoicedStatus>>;

  @TypeGraphQL.Field(() => [PaymentType], { nullable: true })
  filterByType!: Maybe<Array<PaymentType>>;

  @TypeGraphQL.Field(() => TypeGraphQL.Float, { nullable: true })
  filterByAmountFrom!: Maybe<Scalars['Float']>;

  @TypeGraphQL.Field(() => TypeGraphQL.Float, { nullable: true })
  filterByAmountTo!: Maybe<Scalars['Float']>;

  @TypeGraphQL.Field(() => TypeGraphQL.Float, { nullable: true })
  filterByUnappliedFrom!: Maybe<Scalars['Float']>;

  @TypeGraphQL.Field(() => TypeGraphQL.Float, { nullable: true })
  filterByUnappliedTo!: Maybe<Scalars['Float']>;

  @TypeGraphQL.Field(() => [TypeGraphQL.ID], { nullable: true })
  filterByUser!: Maybe<Array<Scalars['ID']>>;
};

export enum PaymentGateway {
  Cardconnect = 'CARDCONNECT',
  Fluidpay = 'FLUIDPAY'
}
TypeGraphQL.registerEnumType(PaymentGateway, { name: 'PaymentGateway' });

export enum PaymentInvoicedStatus {
  Applied = 'APPLIED',
  Reversed = 'REVERSED',
  Unapplied = 'UNAPPLIED'
}
TypeGraphQL.registerEnumType(PaymentInvoicedStatus, { name: 'PaymentInvoicedStatus' });

export enum PaymentMethod {
  Cash = 'CASH',
  Check = 'CHECK',
  CreditCard = 'CREDIT_CARD',
  OnAccount = 'ON_ACCOUNT',
  Mixed = 'MIXED'
}
TypeGraphQL.registerEnumType(PaymentMethod, { name: 'PaymentMethod' });

@TypeGraphQL.ObjectType()
export class PaymentRelatedOrder {
  __typename?: 'PaymentRelatedOrder';

  @TypeGraphQL.Field(() => TypeGraphQL.ID)
  id!: Scalars['ID'];

  @TypeGraphQL.Field(() => String)
  serviceDate!: Scalars['String'];

  @TypeGraphQL.Field(() => TypeGraphQL.Float)
  grandTotal!: Scalars['Float'];

  @TypeGraphQL.Field(() => TypeGraphQL.Float)
  beforeTaxesTotal!: Scalars['Float'];

  @TypeGraphQL.Field(() => TypeGraphQL.Float)
  capturedTotal!: Scalars['Float'];

  @TypeGraphQL.Field(() => TypeGraphQL.Float)
  refundedTotal!: Scalars['Float'];

  @TypeGraphQL.Field(() => JobSite)
  jobSite!: FixDecorator<JobSite>;

  @TypeGraphQL.Field(() => TypeGraphQL.Float)
  assignedAmount!: Scalars['Float'];

  @TypeGraphQL.Field(() => String, { nullable: true })
  receiptPreviewUrl!: Maybe<Scalars['String']>;

  @TypeGraphQL.Field(() => String, { nullable: true })
  receiptPdfUrl!: Maybe<Scalars['String']>;
};

export enum PaymentSorting {
  Date = 'DATE',
  PaymentId = 'PAYMENT_ID',
  PaymentForm = 'PAYMENT_FORM',
  Status = 'STATUS',
  Unapplied = 'UNAPPLIED',
  Amount = 'AMOUNT',
  Customer = 'CUSTOMER',
  DepositDate = 'DEPOSIT_DATE'
}
TypeGraphQL.registerEnumType(PaymentSorting, { name: 'PaymentSorting' });

export enum PaymentStatus {
  Failed = 'FAILED',
  Authorized = 'AUTHORIZED',
  Captured = 'CAPTURED',
  Voided = 'VOIDED',
  Deferred = 'DEFERRED'
}
TypeGraphQL.registerEnumType(PaymentStatus, { name: 'PaymentStatus' });

export enum PaymentTerms {
  Cod = 'COD',
  Net_15Days = 'NET_15_DAYS',
  Net_30Days = 'NET_30_DAYS',
  Net_60Days = 'NET_60_DAYS'
}
TypeGraphQL.registerEnumType(PaymentTerms, { name: 'PaymentTerms' });

export enum PaymentType {
  Cash = 'CASH',
  Check = 'CHECK',
  CreditCard = 'CREDIT_CARD',
  CreditMemo = 'CREDIT_MEMO',
  RefundOnAccount = 'REFUND_ON_ACCOUNT',
  WriteOff = 'WRITE_OFF'
}
TypeGraphQL.registerEnumType(PaymentType, { name: 'PaymentType' });

@TypeGraphQL.ObjectType()
export class Payout {
  __typename?: 'Payout';

  @TypeGraphQL.Field(() => TypeGraphQL.ID)
  id!: Scalars['ID'];

  @TypeGraphQL.Field(() => String)
  date!: Scalars['String'];

  @TypeGraphQL.Field(() => PaymentType)
  paymentType!: FixDecorator<PaymentType>;

  @TypeGraphQL.Field(() => String, { nullable: true })
  checkNumber!: Maybe<Scalars['String']>;

  @TypeGraphQL.Field(() => Boolean)
  isAch!: Scalars['Boolean'];

  @TypeGraphQL.Field(() => TypeGraphQL.Float)
  amount!: Scalars['Float'];

  @TypeGraphQL.Field(() => TypeGraphQL.Float)
  prevBalance!: Scalars['Float'];

  @TypeGraphQL.Field(() => TypeGraphQL.Float, { nullable: true })
  newBalance!: Maybe<Scalars['Float']>;

  @TypeGraphQL.Field(() => Customer)
  customer!: FixDecorator<Customer>;

  @TypeGraphQL.Field(() => CreditCard, { nullable: true })
  creditCard!: Maybe<CreditCard>;

  @TypeGraphQL.Field(() => [PaidOutPayment])
  payments!: Array<PaidOutPayment>;
};

@TypeGraphQL.InputType()
export class PayoutFilters {

  @TypeGraphQL.Field(() => String, { nullable: true })
  filterByCreatedFrom!: Maybe<Scalars['String']>;

  @TypeGraphQL.Field(() => String, { nullable: true })
  filterByCreatedTo!: Maybe<Scalars['String']>;

  @TypeGraphQL.Field(() => [PaymentType], { nullable: true })
  filterByType!: Maybe<Array<PaymentType>>;

  @TypeGraphQL.Field(() => TypeGraphQL.Float, { nullable: true })
  filterByAmountFrom!: Maybe<Scalars['Float']>;

  @TypeGraphQL.Field(() => TypeGraphQL.Float, { nullable: true })
  filterByAmountTo!: Maybe<Scalars['Float']>;

  @TypeGraphQL.Field(() => [TypeGraphQL.ID], { nullable: true })
  filterByUser!: Maybe<Array<Scalars['ID']>>;
};

@TypeGraphQL.InputType()
export class PayoutInput {

  @TypeGraphQL.Field(() => PaymentType)
  paymentType!: FixDecorator<PaymentType>;

  @TypeGraphQL.Field(() => String, { nullable: true })
  date!: Maybe<Scalars['String']>;

  @TypeGraphQL.Field(() => TypeGraphQL.ID, { nullable: true })
  creditCardId!: Maybe<Scalars['ID']>;

  @TypeGraphQL.Field(() => CreditCardInput, { nullable: true })
  newCreditCard!: Maybe<CreditCardInput>;

  @TypeGraphQL.Field(() => String, { nullable: true })
  checkNumber!: Maybe<Scalars['String']>;

  @TypeGraphQL.Field(() => Boolean, { nullable: true })
  isAch!: Maybe<Scalars['Boolean']>;

  @TypeGraphQL.Field(() => [TypeGraphQL.ID])
  paymentIds!: Array<Scalars['ID']>;
};

export enum PayoutSorting {
  Date = 'DATE',
  PayoutId = 'PAYOUT_ID',
  Customer = 'CUSTOMER',
  PaymentForm = 'PAYMENT_FORM',
  Amount = 'AMOUNT'
}
TypeGraphQL.registerEnumType(PayoutSorting, { name: 'PayoutSorting' });

export type Query = {
  __typename?: 'Query';
  order?: Maybe<Order>;
  orders: Array<Order>;
  invoice?: Maybe<Invoice>;
  invoicesCount: Scalars['Int'];
  invoices: Array<Invoice>;
  invoiceBySubOrderId?: Maybe<Invoice>;
  payment?: Maybe<Payment>;
  payments?: Maybe<Array<Maybe<Payment>>>;
  unconfirmedPayments: Array<Payment>;
  deferredPayments?: Maybe<Array<Maybe<Payment>>>;
  prepaidPayment?: Maybe<Payment>;
  nonInvoicedOrdersTotals?: Maybe<NonInvoicedOrdersTotals>;
  customerBalances?: Maybe<Balances>;
  payout?: Maybe<Payout>;
  payouts: Array<Payout>;
  settlements: Array<Settlement>;
  settlement?: Maybe<Settlement>;
  settlementTransactions?: Maybe<Array<SettlementTransaction>>;
  settlementsCount: Scalars['Int'];
  statements: Array<Statement>;
  statement?: Maybe<Statement>;
  newStatementEndDate: Scalars['String'];
  creditCard?: Maybe<CreditCardExtended>;
  creditCards?: Maybe<Array<Maybe<CreditCardExtended>>>;
  financeCharge?: Maybe<FinanceCharge>;
  financeCharges: Array<FinanceCharge>;
  bankDeposit?: Maybe<BankDeposit>;
  bankDeposits?: Maybe<Array<Maybe<BankDeposit>>>;
  batchStatements: Array<BatchStatement>;
  batchStatement?: Maybe<BatchStatement>;
  generationJobStatus?: Maybe<GenerationJob>;
  invoiceGenerationJob?: Maybe<InvoiceGenerationJobResult>;
  statementGenerationJob?: Maybe<StatementGenerationJobResult>;
  finChargeGenerationJob?: Maybe<FinChargeGenerationJobResult>;
  settlementGenerationJob?: Maybe<SettlementGenerationJobResult>;
  customersLastStatementBalance: Array<CustomerLastStatementBalance>;
};


@TypeGraphQL.ArgsType()
export class QueryOrderArgs {

  @TypeGraphQL.Field(() => TypeGraphQL.ID)
  id!: Scalars['ID'];
};


@TypeGraphQL.ArgsType()
export class QueryOrdersArgs {

  @TypeGraphQL.Field(() => TypeGraphQL.Int, { nullable: true })
  offset!: Maybe<Scalars['Int']>;

  @TypeGraphQL.Field(() => TypeGraphQL.Int, { nullable: true })
  limit!: Maybe<Scalars['Int']>;
};


@TypeGraphQL.ArgsType()
export class QueryInvoiceArgs {

  @TypeGraphQL.Field(() => TypeGraphQL.ID)
  id!: Scalars['ID'];
};


@TypeGraphQL.ArgsType()
export class QueryInvoicesCountArgs {

  @TypeGraphQL.Field(() => TypeGraphQL.ID, { nullable: true })
  businessUnitId!: Maybe<Scalars['ID']>;

  @TypeGraphQL.Field(() => TypeGraphQL.ID, { nullable: true })
  customerId!: Maybe<Scalars['ID']>;

  @TypeGraphQL.Field(() => TypeGraphQL.ID, { nullable: true })
  jobSiteId!: Maybe<Scalars['ID']>;

  @TypeGraphQL.Field(() => TypeGraphQL.ID, { nullable: true })
  subscriptionId!: Maybe<Scalars['ID']>;

  @TypeGraphQL.Field(() => InvoiceFilters, { nullable: true })
  filters!: Maybe<InvoiceFilters>;

  @TypeGraphQL.Field(() => String, { nullable: true })
  query!: Maybe<Scalars['String']>;
};


@TypeGraphQL.ArgsType()
export class QueryInvoicesArgs {

  @TypeGraphQL.Field(() => TypeGraphQL.ID, { nullable: true })
  customerId!: Maybe<Scalars['ID']>;

  @TypeGraphQL.Field(() => TypeGraphQL.ID, { nullable: true })
  businessUnitId!: Maybe<Scalars['ID']>;

  @TypeGraphQL.Field(() => TypeGraphQL.ID, { nullable: true })
  subscriptionId!: Maybe<Scalars['ID']>;

  @TypeGraphQL.Field(() => TypeGraphQL.ID, { nullable: true })
  jobSiteId!: Maybe<Scalars['ID']>;

  @TypeGraphQL.Field(() => InvoiceFilters, { nullable: true })
  filters!: Maybe<InvoiceFilters>;

  @TypeGraphQL.Field(() => String, { nullable: true })
  query!: Maybe<Scalars['String']>;

  @TypeGraphQL.Field(() => TypeGraphQL.Int, { nullable: true })
  offset!: Maybe<Scalars['Int']>;

  @TypeGraphQL.Field(() => TypeGraphQL.Int, { nullable: true })
  limit!: Maybe<Scalars['Int']>;

  @TypeGraphQL.Field(() => InvoiceSorting, { nullable: true })
  sortBy!: Maybe<InvoiceSorting>;

  @TypeGraphQL.Field(() => SortOrder, { nullable: true })
  sortOrder!: Maybe<SortOrder>;
};


@TypeGraphQL.ArgsType()
export class QueryInvoiceBySubOrderIdArgs {

  @TypeGraphQL.Field(() => TypeGraphQL.ID)
  orderId!: Scalars['ID'];
};


@TypeGraphQL.ArgsType()
export class QueryPaymentArgs {

  @TypeGraphQL.Field(() => TypeGraphQL.ID)
  id!: Scalars['ID'];
};


@TypeGraphQL.ArgsType()
export class QueryPaymentsArgs {

  @TypeGraphQL.Field(() => TypeGraphQL.ID, { nullable: true })
  customerId!: Maybe<Scalars['ID']>;

  @TypeGraphQL.Field(() => PaymentFilters, { nullable: true })
  filters!: Maybe<PaymentFilters>;

  @TypeGraphQL.Field(() => String, { nullable: true })
  query!: Maybe<Scalars['String']>;

  @TypeGraphQL.Field(() => TypeGraphQL.ID, { nullable: true })
  businessUnitId!: Maybe<Scalars['ID']>;

  @TypeGraphQL.Field(() => TypeGraphQL.Int, { nullable: true })
  offset!: Maybe<Scalars['Int']>;

  @TypeGraphQL.Field(() => TypeGraphQL.Int, { nullable: true })
  limit!: Maybe<Scalars['Int']>;

  @TypeGraphQL.Field(() => PaymentSorting, { nullable: true })
  sortBy!: Maybe<PaymentSorting>;

  @TypeGraphQL.Field(() => SortOrder, { nullable: true })
  sortOrder!: Maybe<SortOrder>;
};


@TypeGraphQL.ArgsType()
export class QueryUnconfirmedPaymentsArgs {

  @TypeGraphQL.Field(() => TypeGraphQL.ID)
  settlementId!: Scalars['ID'];
};


@TypeGraphQL.ArgsType()
export class QueryDeferredPaymentsArgs {

  @TypeGraphQL.Field(() => TypeGraphQL.ID, { nullable: true })
  customerId!: Maybe<Scalars['ID']>;

  @TypeGraphQL.Field(() => TypeGraphQL.ID, { nullable: true })
  businessUnitId!: Maybe<Scalars['ID']>;

  @TypeGraphQL.Field(() => TypeGraphQL.Int, { nullable: true })
  offset!: Maybe<Scalars['Int']>;

  @TypeGraphQL.Field(() => TypeGraphQL.Int, { nullable: true })
  limit!: Maybe<Scalars['Int']>;

  @TypeGraphQL.Field(() => Boolean, { nullable: true })
  failedOnly!: Maybe<Scalars['Boolean']>;

  @TypeGraphQL.Field(() => DeferredPaymentSorting, { nullable: true })
  sortBy!: Maybe<DeferredPaymentSorting>;

  @TypeGraphQL.Field(() => SortOrder, { nullable: true })
  sortOrder!: Maybe<SortOrder>;
};


@TypeGraphQL.ArgsType()
export class QueryPrepaidPaymentArgs {

  @TypeGraphQL.Field(() => TypeGraphQL.ID)
  orderId!: Scalars['ID'];
};


@TypeGraphQL.ArgsType()
export class QueryNonInvoicedOrdersTotalsArgs {

  @TypeGraphQL.Field(() => TypeGraphQL.ID)
  customerId!: Scalars['ID'];
};


@TypeGraphQL.ArgsType()
export class QueryCustomerBalancesArgs {

  @TypeGraphQL.Field(() => TypeGraphQL.ID)
  customerId!: Scalars['ID'];
};


@TypeGraphQL.ArgsType()
export class QueryPayoutArgs {

  @TypeGraphQL.Field(() => TypeGraphQL.ID)
  id!: Scalars['ID'];
};


@TypeGraphQL.ArgsType()
export class QueryPayoutsArgs {

  @TypeGraphQL.Field(() => TypeGraphQL.ID, { nullable: true })
  customerId!: Maybe<Scalars['ID']>;

  @TypeGraphQL.Field(() => TypeGraphQL.ID, { nullable: true })
  businessUnitId!: Maybe<Scalars['ID']>;

  @TypeGraphQL.Field(() => TypeGraphQL.Int, { nullable: true })
  offset!: Maybe<Scalars['Int']>;

  @TypeGraphQL.Field(() => TypeGraphQL.Int, { nullable: true })
  limit!: Maybe<Scalars['Int']>;

  @TypeGraphQL.Field(() => PayoutFilters, { nullable: true })
  filters!: Maybe<PayoutFilters>;

  @TypeGraphQL.Field(() => String, { nullable: true })
  query!: Maybe<Scalars['String']>;

  @TypeGraphQL.Field(() => PayoutSorting, { nullable: true })
  sortBy!: Maybe<PayoutSorting>;

  @TypeGraphQL.Field(() => SortOrder, { nullable: true })
  sortOrder!: Maybe<SortOrder>;
};


@TypeGraphQL.ArgsType()
export class QuerySettlementsArgs {

  @TypeGraphQL.Field(() => TypeGraphQL.Int, { nullable: true })
  offset!: Maybe<Scalars['Int']>;

  @TypeGraphQL.Field(() => TypeGraphQL.Int, { nullable: true })
  limit!: Maybe<Scalars['Int']>;

  @TypeGraphQL.Field(() => TypeGraphQL.ID)
  businessUnitId!: Scalars['ID'];

  @TypeGraphQL.Field(() => String, { nullable: true })
  from!: Maybe<Scalars['String']>;

  @TypeGraphQL.Field(() => String, { nullable: true })
  to!: Maybe<Scalars['String']>;

  @TypeGraphQL.Field(() => SettlementsSorting, { nullable: true })
  sortBy!: Maybe<SettlementsSorting>;

  @TypeGraphQL.Field(() => SortOrder, { nullable: true })
  sortOrder!: Maybe<SortOrder>;
};


@TypeGraphQL.ArgsType()
export class QuerySettlementArgs {

  @TypeGraphQL.Field(() => TypeGraphQL.ID)
  id!: Scalars['ID'];
};


@TypeGraphQL.ArgsType()
export class QuerySettlementTransactionsArgs {

  @TypeGraphQL.Field(() => TypeGraphQL.ID)
  settlementId!: Scalars['ID'];

  @TypeGraphQL.Field(() => TypeGraphQL.Int, { nullable: true })
  offset!: Maybe<Scalars['Int']>;

  @TypeGraphQL.Field(() => TypeGraphQL.Int, { nullable: true })
  limit!: Maybe<Scalars['Int']>;
};


@TypeGraphQL.ArgsType()
export class QuerySettlementsCountArgs {

  @TypeGraphQL.Field(() => TypeGraphQL.ID)
  businessUnitId!: Scalars['ID'];
};


@TypeGraphQL.ArgsType()
export class QueryStatementsArgs {

  @TypeGraphQL.Field(() => TypeGraphQL.ID, { nullable: true })
  businessUnitId!: Maybe<Scalars['ID']>;

  @TypeGraphQL.Field(() => TypeGraphQL.ID, { nullable: true })
  customerId!: Maybe<Scalars['ID']>;

  @TypeGraphQL.Field(() => TypeGraphQL.Int, { nullable: true })
  offset!: Maybe<Scalars['Int']>;

  @TypeGraphQL.Field(() => TypeGraphQL.Int, { nullable: true })
  limit!: Maybe<Scalars['Int']>;

  @TypeGraphQL.Field(() => StatementSorting, { nullable: true })
  sortBy!: Maybe<StatementSorting>;

  @TypeGraphQL.Field(() => SortOrder, { nullable: true })
  sortOrder!: Maybe<SortOrder>;
};


@TypeGraphQL.ArgsType()
export class QueryStatementArgs {

  @TypeGraphQL.Field(() => TypeGraphQL.ID)
  id!: Scalars['ID'];
};


@TypeGraphQL.ArgsType()
export class QueryNewStatementEndDateArgs {

  @TypeGraphQL.Field(() => TypeGraphQL.ID)
  customerId!: Scalars['ID'];
};


@TypeGraphQL.ArgsType()
export class QueryCreditCardArgs {

  @TypeGraphQL.Field(() => TypeGraphQL.ID)
  id!: Scalars['ID'];
};


@TypeGraphQL.ArgsType()
export class QueryCreditCardsArgs {

  @TypeGraphQL.Field(() => TypeGraphQL.ID, { nullable: true })
  customerId!: Maybe<Scalars['ID']>;

  @TypeGraphQL.Field(() => Boolean, { nullable: true })
  activeOnly!: Maybe<Scalars['Boolean']>;

  @TypeGraphQL.Field(() => TypeGraphQL.ID, { nullable: true })
  jobSiteId!: Maybe<Scalars['ID']>;

  @TypeGraphQL.Field(() => Boolean, { nullable: true })
  relevantOnly!: Maybe<Scalars['Boolean']>;

  @TypeGraphQL.Field(() => TypeGraphQL.Int, { nullable: true })
  offset!: Maybe<Scalars['Int']>;

  @TypeGraphQL.Field(() => TypeGraphQL.Int, { nullable: true })
  limit!: Maybe<Scalars['Int']>;

  @TypeGraphQL.Field(() => Boolean, { nullable: true })
  isAutopay!: Maybe<Scalars['Boolean']>;

  @TypeGraphQL.Field(() => CcSorting, { nullable: true })
  sortBy!: Maybe<CcSorting>;

  @TypeGraphQL.Field(() => SortOrder, { nullable: true })
  sortOrder!: Maybe<SortOrder>;
};


@TypeGraphQL.ArgsType()
export class QueryFinanceChargeArgs {

  @TypeGraphQL.Field(() => TypeGraphQL.ID)
  id!: Scalars['ID'];
};


@TypeGraphQL.ArgsType()
export class QueryFinanceChargesArgs {

  @TypeGraphQL.Field(() => TypeGraphQL.ID, { nullable: true })
  businessUnitId!: Maybe<Scalars['ID']>;

  @TypeGraphQL.Field(() => TypeGraphQL.ID, { nullable: true })
  customerId!: Maybe<Scalars['ID']>;

  @TypeGraphQL.Field(() => FinanceChargeFilters, { nullable: true })
  filters!: Maybe<FinanceChargeFilters>;

  @TypeGraphQL.Field(() => String, { nullable: true })
  query!: Maybe<Scalars['String']>;

  @TypeGraphQL.Field(() => TypeGraphQL.Int, { nullable: true })
  offset!: Maybe<Scalars['Int']>;

  @TypeGraphQL.Field(() => TypeGraphQL.Int, { nullable: true })
  limit!: Maybe<Scalars['Int']>;

  @TypeGraphQL.Field(() => FinanceChargesSorting, { nullable: true })
  sortBy!: Maybe<FinanceChargesSorting>;

  @TypeGraphQL.Field(() => SortOrder, { nullable: true })
  sortOrder!: Maybe<SortOrder>;
};


@TypeGraphQL.ArgsType()
export class QueryBankDepositArgs {

  @TypeGraphQL.Field(() => TypeGraphQL.ID)
  id!: Scalars['ID'];
};


@TypeGraphQL.ArgsType()
export class QueryBankDepositsArgs {

  @TypeGraphQL.Field(() => TypeGraphQL.ID, { nullable: true })
  businessUnitId!: Maybe<Scalars['ID']>;

  @TypeGraphQL.Field(() => TypeGraphQL.Int, { nullable: true })
  offset!: Maybe<Scalars['Int']>;

  @TypeGraphQL.Field(() => TypeGraphQL.Int, { nullable: true })
  limit!: Maybe<Scalars['Int']>;

  @TypeGraphQL.Field(() => DepositSorting, { nullable: true })
  sortBy!: Maybe<DepositSorting>;

  @TypeGraphQL.Field(() => SortOrder, { nullable: true })
  sortOrder!: Maybe<SortOrder>;
};


@TypeGraphQL.ArgsType()
export class QueryBatchStatementsArgs {

  @TypeGraphQL.Field(() => TypeGraphQL.ID, { nullable: true })
  businessUnitId!: Maybe<Scalars['ID']>;

  @TypeGraphQL.Field(() => TypeGraphQL.Int, { nullable: true })
  offset!: Maybe<Scalars['Int']>;

  @TypeGraphQL.Field(() => TypeGraphQL.Int, { nullable: true })
  limit!: Maybe<Scalars['Int']>;

  @TypeGraphQL.Field(() => BatchStatementSorting, { nullable: true })
  sortBy!: Maybe<BatchStatementSorting>;

  @TypeGraphQL.Field(() => SortOrder, { nullable: true })
  sortOrder!: Maybe<SortOrder>;
};


@TypeGraphQL.ArgsType()
export class QueryBatchStatementArgs {

  @TypeGraphQL.Field(() => TypeGraphQL.ID)
  id!: Scalars['ID'];
};


@TypeGraphQL.ArgsType()
export class QueryGenerationJobStatusArgs {

  @TypeGraphQL.Field(() => TypeGraphQL.ID)
  id!: Scalars['ID'];
};


@TypeGraphQL.ArgsType()
export class QueryInvoiceGenerationJobArgs {

  @TypeGraphQL.Field(() => TypeGraphQL.ID)
  id!: Scalars['ID'];
};


@TypeGraphQL.ArgsType()
export class QueryStatementGenerationJobArgs {

  @TypeGraphQL.Field(() => TypeGraphQL.ID)
  id!: Scalars['ID'];
};


@TypeGraphQL.ArgsType()
export class QueryFinChargeGenerationJobArgs {

  @TypeGraphQL.Field(() => TypeGraphQL.ID)
  id!: Scalars['ID'];
};


@TypeGraphQL.ArgsType()
export class QuerySettlementGenerationJobArgs {

  @TypeGraphQL.Field(() => TypeGraphQL.ID)
  id!: Scalars['ID'];
};


@TypeGraphQL.ArgsType()
export class QueryCustomersLastStatementBalanceArgs {

  @TypeGraphQL.Field(() => [TypeGraphQL.ID])
  ids!: Array<Scalars['ID']>;
};

@TypeGraphQL.ObjectType()
export class RefundData {
  __typename?: 'RefundData';

  @TypeGraphQL.Field(() => TypeGraphQL.ID)
  id!: Scalars['ID'];

  @TypeGraphQL.Field(() => RefundType)
  type!: FixDecorator<RefundType>;

  @TypeGraphQL.Field(() => TypeGraphQL.Float)
  amount!: Scalars['Float'];
};

export enum RefundType {
  Check = 'CHECK',
  CreditCard = 'CREDIT_CARD',
  OnAccount = 'ON_ACCOUNT'
}
TypeGraphQL.registerEnumType(RefundType, { name: 'RefundType' });

@TypeGraphQL.ObjectType()
export class ReverseData {
  __typename?: 'ReverseData';

  @TypeGraphQL.Field(() => TypeGraphQL.ID)
  id!: Scalars['ID'];

  @TypeGraphQL.Field(() => String)
  date!: Scalars['String'];

  @TypeGraphQL.Field(() => String, { nullable: true })
  note!: Maybe<Scalars['String']>;

  @TypeGraphQL.Field(() => String)
  type!: Scalars['String'];

  @TypeGraphQL.Field(() => TypeGraphQL.Float)
  amount!: Scalars['Float'];
};

@TypeGraphQL.InputType()
export class ReverseDataInput {

  @TypeGraphQL.Field(() => String)
  date!: Scalars['String'];

  @TypeGraphQL.Field(() => String, { nullable: true })
  note!: Maybe<Scalars['String']>;

  @TypeGraphQL.Field(() => String)
  type!: Scalars['String'];

  @TypeGraphQL.Field(() => TypeGraphQL.Float)
  amount!: Scalars['Float'];
};

@TypeGraphQL.ObjectType()
export class ServiceItem {
  __typename?: 'ServiceItem';

  @TypeGraphQL.Field(() => TypeGraphQL.ID)
  serviceItemId!: Scalars['ID'];

  @TypeGraphQL.Field(() => String)
  serviceName!: Scalars['String'];

  @TypeGraphQL.Field(() => [LineItem], { nullable: true })
  lineItems!: Maybe<Array<LineItem>>;

  @TypeGraphQL.Field(() => [ServiceItemInfo])
  serviceItems!: Array<ServiceItemInfo>;
};

@TypeGraphQL.ObjectType()
export class ServiceItemInfo {
  __typename?: 'ServiceItemInfo';

  @TypeGraphQL.Field(() => TypeGraphQL.ID)
  id!: Scalars['ID'];

  @TypeGraphQL.Field(() => TypeGraphQL.Int)
  totalPrice!: Scalars['Int'];

  @TypeGraphQL.Field(() => TypeGraphQL.Int)
  totalDay!: Scalars['Int'];

  @TypeGraphQL.Field(() => TypeGraphQL.Int)
  usageDay!: Scalars['Int'];

  @TypeGraphQL.Field(() => TypeGraphQL.Float)
  price!: Scalars['Float'];

  @TypeGraphQL.Field(() => TypeGraphQL.Int)
  quantity!: Scalars['Int'];

  @TypeGraphQL.Field(() => String, { nullable: true })
  periodTo!: Maybe<Scalars['String']>;

  @TypeGraphQL.Field(() => String, { nullable: true })
  periodSince!: Maybe<Scalars['String']>;

  @TypeGraphQL.Field(() => [SubscriptionOrder], { nullable: true })
  subscriptionOrders!: Maybe<Array<SubscriptionOrder>>;
};

@TypeGraphQL.ObjectType()
export class Settlement {
  __typename?: 'Settlement';

  @TypeGraphQL.Field(() => TypeGraphQL.ID)
  id!: Scalars['ID'];

  @TypeGraphQL.Field(() => String)
  date!: Scalars['String'];

  @TypeGraphQL.Field(() => PaymentGateway)
  paymentGateway!: FixDecorator<PaymentGateway>;

  @TypeGraphQL.Field(() => TypeGraphQL.Float)
  fees!: Scalars['Float'];

  @TypeGraphQL.Field(() => TypeGraphQL.Float)
  amount!: Scalars['Float'];

  @TypeGraphQL.Field(() => TypeGraphQL.Float)
  adjustments!: Scalars['Float'];

  @TypeGraphQL.Field(() => TypeGraphQL.Int)
  count!: Scalars['Int'];

  @TypeGraphQL.Field(() => String, { nullable: true })
  pdfUrl!: Maybe<Scalars['String']>;

  @TypeGraphQL.Field(() => TypeGraphQL.Float)
  net!: Scalars['Float'];

  @TypeGraphQL.Field(() => String)
  mid!: Scalars['String'];
};

@TypeGraphQL.ObjectType()
export class SettlementGenerationJobResult {
  __typename?: 'SettlementGenerationJobResult';

  @TypeGraphQL.Field(() => TypeGraphQL.ID)
  id!: Scalars['ID'];

  @TypeGraphQL.Field(() => TypeGraphQL.Int)
  count!: Scalars['Int'];

  @TypeGraphQL.Field(() => TypeGraphQL.Int)
  expectedCount!: Scalars['Int'];

  @TypeGraphQL.Field(() => TypeGraphQL.Int)
  failedCount!: Scalars['Int'];

  @TypeGraphQL.Field(() => GenerationJobStatus)
  status!: FixDecorator<GenerationJobStatus>;

  @TypeGraphQL.Field(() => TypeGraphQL.ID)
  settlementId!: Scalars['ID'];
};

@TypeGraphQL.ObjectType()
export class SettlementTransaction {
  __typename?: 'SettlementTransaction';

  @TypeGraphQL.Field(() => TypeGraphQL.ID)
  id!: Scalars['ID'];

  @TypeGraphQL.Field(() => Settlement)
  settlement!: FixDecorator<Settlement>;

  @TypeGraphQL.Field(() => Payment, { nullable: true })
  payment!: Maybe<Payment>;

  @TypeGraphQL.Field(() => TypeGraphQL.Float)
  amount!: Scalars['Float'];

  @TypeGraphQL.Field(() => TypeGraphQL.Float)
  fee!: Scalars['Float'];

  @TypeGraphQL.Field(() => TypeGraphQL.Float)
  adjustment!: Scalars['Float'];

  @TypeGraphQL.Field(() => String, { nullable: true })
  transactionNote!: Maybe<Scalars['String']>;

  @TypeGraphQL.Field(() => Boolean, { nullable: true })
  spUsed!: Maybe<Scalars['Boolean']>;
};

export enum SettlementsSorting {
  Date = 'DATE',
  Processor = 'PROCESSOR',
  Count = 'COUNT',
  Amount = 'AMOUNT',
  Fees = 'FEES',
  Adjustment = 'ADJUSTMENT',
  Net = 'NET',
  MerchantId = 'MERCHANT_ID'
}
TypeGraphQL.registerEnumType(SettlementsSorting, { name: 'SettlementsSorting' });

export enum SortOrder {
  Asc = 'ASC',
  Desc = 'DESC'
}
TypeGraphQL.registerEnumType(SortOrder, { name: 'SortOrder' });

@TypeGraphQL.ObjectType()
export class Statement {
  __typename?: 'Statement';

  @TypeGraphQL.Field(() => TypeGraphQL.ID)
  id!: Scalars['ID'];

  @TypeGraphQL.Field(() => String)
  createdAt!: Scalars['String'];

  @TypeGraphQL.Field(() => String)
  statementDate!: Scalars['String'];

  @TypeGraphQL.Field(() => String)
  endDate!: Scalars['String'];

  @TypeGraphQL.Field(() => TypeGraphQL.Int)
  invoicesCount!: Scalars['Int'];

  @TypeGraphQL.Field(() => TypeGraphQL.Float)
  invoicesTotal!: Scalars['Float'];

  @TypeGraphQL.Field(() => TypeGraphQL.Float)
  paymentsTotal!: Scalars['Float'];

  @TypeGraphQL.Field(() => TypeGraphQL.Float)
  balance!: Scalars['Float'];

  @TypeGraphQL.Field(() => String, { nullable: true })
  pdfUrl!: Maybe<Scalars['String']>;

  @TypeGraphQL.Field(() => String, { nullable: true })
  prevPdfUrl!: Maybe<Scalars['String']>;

  @TypeGraphQL.Field(() => String)
  exagoPath!: Scalars['String'];

  @TypeGraphQL.Field(() => TypeGraphQL.Float)
  prevBalance!: Scalars['Float'];

  @TypeGraphQL.Field(() => Customer)
  customer!: FixDecorator<Customer>;

  @TypeGraphQL.Field(() => [StatementEmail], { nullable: 'itemsAndList' })
  emails!: Maybe<Array<Maybe<StatementEmail>>>;

  @TypeGraphQL.Field(() => Boolean, { nullable: true })
  financeChargeExists!: Maybe<Scalars['Boolean']>;
};

@TypeGraphQL.ObjectType()
export class StatementEmail {
  __typename?: 'StatementEmail';

  @TypeGraphQL.Field(() => TypeGraphQL.ID)
  id!: Scalars['ID'];

  @TypeGraphQL.Field(() => String)
  createdAt!: Scalars['String'];

  @TypeGraphQL.Field(() => String, { nullable: true })
  receiver!: Maybe<Scalars['String']>;

  @TypeGraphQL.Field(() => EmailEvent)
  status!: FixDecorator<EmailEvent>;
};

@TypeGraphQL.ObjectType()
export class StatementGenerationJobResult {
  __typename?: 'StatementGenerationJobResult';

  @TypeGraphQL.Field(() => TypeGraphQL.ID)
  id!: Scalars['ID'];

  @TypeGraphQL.Field(() => TypeGraphQL.Int)
  count!: Scalars['Int'];

  @TypeGraphQL.Field(() => TypeGraphQL.Int)
  expectedCount!: Scalars['Int'];

  @TypeGraphQL.Field(() => TypeGraphQL.Int)
  failedCount!: Scalars['Int'];

  @TypeGraphQL.Field(() => GenerationJobStatus)
  status!: FixDecorator<GenerationJobStatus>;

  @TypeGraphQL.Field(() => TypeGraphQL.Float)
  invoicesTotal!: Scalars['Float'];

  @TypeGraphQL.Field(() => TypeGraphQL.Float)
  paymentsTotal!: Scalars['Float'];

  @TypeGraphQL.Field(() => TypeGraphQL.Int)
  invoicesCount!: Scalars['Int'];

  @TypeGraphQL.Field(() => TypeGraphQL.Float)
  total!: Scalars['Float'];

  @TypeGraphQL.Field(() => [TypeGraphQL.ID])
  statementIds!: Array<Scalars['ID']>;

  @TypeGraphQL.Field(() => TypeGraphQL.ID)
  batchStatementId!: Scalars['ID'];
};

export enum StatementSorting {
  Id = 'ID',
  Balance = 'BALANCE',
  CreatedAt = 'CREATED_AT',
  EndDate = 'END_DATE',
  InvoicesCount = 'INVOICES_COUNT',
  StatementDate = 'STATEMENT_DATE'
}
TypeGraphQL.registerEnumType(StatementSorting, { name: 'StatementSorting' });

@TypeGraphQL.ObjectType()
export class SubOrderLineItem {
  __typename?: 'SubOrderLineItem';

  @TypeGraphQL.Field(() => TypeGraphQL.ID)
  id!: Scalars['ID'];

  @TypeGraphQL.Field(() => TypeGraphQL.Float)
  price!: Scalars['Float'];

  @TypeGraphQL.Field(() => TypeGraphQL.Int)
  quantity!: Scalars['Int'];

  @TypeGraphQL.Field(() => String)
  serviceName!: Scalars['String'];
};

@TypeGraphQL.ObjectType()
export class Subscription {
  __typename?: 'Subscription';

  @TypeGraphQL.Field(() => TypeGraphQL.ID)
  id!: Scalars['ID'];

  @TypeGraphQL.Field(() => Boolean)
  anniversaryBilling!: Scalars['Boolean'];

  @TypeGraphQL.Field(() => String)
  billingCycle!: Scalars['String'];

  @TypeGraphQL.Field(() => BillingType)
  billingType!: FixDecorator<BillingType>;

  @TypeGraphQL.Field(() => TypeGraphQL.ID)
  businessLineId!: Scalars['ID'];

  @TypeGraphQL.Field(() => String, { nullable: true })
  endDate!: Maybe<Scalars['String']>;

  @TypeGraphQL.Field(() => String, { nullable: true })
  nextBillingPeriodFrom!: Maybe<Scalars['String']>;

  @TypeGraphQL.Field(() => String, { nullable: true })
  nextBillingPeriodTo!: Maybe<Scalars['String']>;

  @TypeGraphQL.Field(() => TypeGraphQL.Float, { nullable: true })
  totalPriceForSubscription!: Maybe<Scalars['Float']>;

  @TypeGraphQL.Field(() => String)
  startDate!: Scalars['String'];

  @TypeGraphQL.Field(() => [ServiceItem])
  serviceItems!: Array<ServiceItem>;

  @TypeGraphQL.Field(() => [SubscriptionOrder], { nullable: true })
  nonServiceOrder!: Maybe<Array<SubscriptionOrder>>;
};

@TypeGraphQL.ObjectType()
export class SubscriptionOrder {
  __typename?: 'SubscriptionOrder';

  @TypeGraphQL.Field(() => TypeGraphQL.ID, { nullable: true })
  id!: Maybe<Scalars['ID']>;

  @TypeGraphQL.Field(() => String)
  serviceDate!: Scalars['String'];

  @TypeGraphQL.Field(() => String, { nullable: true })
  sequenceId!: Maybe<Scalars['String']>;

  @TypeGraphQL.Field(() => TypeGraphQL.Float, { nullable: true })
  price!: Maybe<Scalars['Float']>;

  @TypeGraphQL.Field(() => TypeGraphQL.Int, { nullable: true })
  quantity!: Maybe<Scalars['Int']>;

  @TypeGraphQL.Field(() => String)
  serviceName!: Scalars['String'];

  @TypeGraphQL.Field(() => TypeGraphQL.Float, { nullable: true })
  grandTotal!: Maybe<Scalars['Float']>;

  @TypeGraphQL.Field(() => [SubOrderLineItem], { nullable: true })
  subOrderLineItems!: Maybe<Array<SubOrderLineItem>>;
};

@TypeGraphQL.InputType()
export class UnappliedPaymentInput {

  @TypeGraphQL.Field(() => PaymentType)
  paymentType!: FixDecorator<PaymentType>;

  @TypeGraphQL.Field(() => String, { nullable: true })
  date!: Maybe<Scalars['String']>;

  @TypeGraphQL.Field(() => TypeGraphQL.Float)
  amount!: Scalars['Float'];

  @TypeGraphQL.Field(() => TypeGraphQL.ID, { nullable: true })
  creditCardId!: Maybe<Scalars['ID']>;

  @TypeGraphQL.Field(() => CreditCardInput, { nullable: true })
  newCreditCard!: Maybe<CreditCardInput>;

  @TypeGraphQL.Field(() => String, { nullable: true })
  checkNumber!: Maybe<Scalars['String']>;

  @TypeGraphQL.Field(() => Boolean, { nullable: true })
  isAch!: Maybe<Scalars['Boolean']>;

  @TypeGraphQL.Field(() => Boolean, { nullable: true })
  sendReceipt!: Maybe<Scalars['Boolean']>;

  @TypeGraphQL.Field(() => String, { nullable: true })
  memoNote!: Maybe<Scalars['String']>;

  @TypeGraphQL.Field(() => String, { nullable: true })
  billableItemType!: Maybe<Scalars['String']>;

  @TypeGraphQL.Field(() => TypeGraphQL.ID, { nullable: true })
  billableItemId!: Maybe<Scalars['ID']>;

  @TypeGraphQL.Field(() => [PaymentApplicationInput], { nullable: true })
  applications!: Maybe<Array<PaymentApplicationInput>>;
};
