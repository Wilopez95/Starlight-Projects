import { parseFacilitySrn } from '../../utils/srn';
import {
  BILLING_CYCLE,
  INVOICE_CONSTRUCTION,
  PAYMENT_TERM,
  CustomerContactInput,
  HaulingCustomer,
  HaulingCustomerInput,
} from './types/HaulingCustomer';
import {
  HaulingHttpCrudService,
  ListResponseBasic,
  PartialContext,
} from '../../graphql/createHaulingCRUDResolver';
import { ParsedUrlQueryInput } from 'querystring';
import PaginationInput from '../../graphql/types/PaginationInput';
import SortInput from '../../graphql/types/SortInput';
import { HaulingBusinessUnit } from './types/HaulingBusinessUnit';
import { HaulingCustomerGroup } from './types/HaulingCustomerGroup';
import { ContactPhoneInput, ContactPhoneType } from '../../graphql/types/ContactPhone';
import { CustomerAddressInput } from '../../graphql/types/CustomerAddress';
import { CORE_SERVICE_API_URL } from '../../config';

interface GetOrCreateCustomerOptions {
  ctx: PartialContext;
  haulerSrn: string;
  businessUnit: HaulingBusinessUnit;
  customerGroup: HaulingCustomerGroup;
}

export const getOrCreateCustomer = async ({
  ctx,
  haulerSrn,
  businessUnit,
  customerGroup,
}: GetOrCreateCustomerOptions): Promise<HaulingCustomer> => {
  const customerHttpService = new HaulingCustomerHttpService();
  const response = await customerHttpService.get(ctx, { filterByHaulerSrn: haulerSrn });
  const customer = response?.data?.[0];

  if (customer) {
    return customer;
  }

  const address: CustomerAddressInput = {
    addressLine1: businessUnit.mailingAddressLine1,
    addressLine2: businessUnit.mailingAddressLine2,
    city: businessUnit.physicalCity,
    state: businessUnit.physicalState,
    zip: businessUnit.physicalZip,
  };
  const phone: ContactPhoneInput = {
    number: businessUnit.phone,
    type: ContactPhoneType.MAIN,
    extension: '',
  };
  const customerContact: CustomerContactInput = {
    active: true,
    isMain: true,
    firstName: businessUnit.nameLine1,
    lastName: businessUnit.nameLine2 ?? businessUnit.nameLine1,
    email: businessUnit.email?.toString(),
    phones: [phone],
  };
  const customerInput: HaulingCustomerInput = {
    active: true,
    requireWONumber: true,
    requirePONumber: false,
    sendInvoiceByPost: true,
    onAccount: false,
    addFinancialCharges: false,
    billingSameAsMailing: true,
    haulerSrn,
    groupId: customerGroup.id,
    businessName: businessUnit.nameLine1,
    email: businessUnit.email?.toString(),
    mainContact: customerContact,
    invoiceConstruction: INVOICE_CONSTRUCTION.BY_ORDER,
    sendInvoiceByEmail: !!businessUnit.email,
    emailForInvoices: businessUnit.email,
    mailingAddress: address,
    billingAddress: address,
    phones: [phone],
    requireGrading: false,
    requireCanTareWeight: false,
    requireJobSite: false,
    allowSelfServiceOrders: false,
    gradingNotification: false,
    creditLimit: 0,
    billingCycle: BILLING_CYCLE.NONE,
    paymentTerm: PAYMENT_TERM.NONE,
    apr: null,
    aprCharge: null,
    generalNotes: '',
    popupNotes: '',
  };

  return customerHttpService.createCustomer(ctx, customerInput);
};

export const getCustomer = async (
  ctx: PartialContext,
  id: number,
  authorization?: string,
): Promise<HaulingCustomer> => {
  const customer = await new HaulingCustomerHttpService().getById(ctx, id, authorization);

  if (!customer) {
    throw new Error('Customer not found');
  }

  return customer;
};

export interface CustomerTotalResponse {
  total: number;
  filteredTotal: number;
  customerGroupIds: Record<string, number>;
}

export class HaulingCustomerHttpService extends HaulingHttpCrudService<
  HaulingCustomer,
  HaulingCustomerInput
> {
  path = 'customers';

  // todo: Refactor frontend to send data in hauling format to use create from super
  async createCustomer(
    ctx: PartialContext,
    input: HaulingCustomerInput,
    authorization?: string,
    tokenPayload?: Record<string, any>,
  ): Promise<HaulingCustomer> {
    const { businessUnitId } = parseFacilitySrn(ctx.userInfo.resource!);
    const haulingCustomerData = {
      businessName: input.businessName,
      commercial: true,
      customerGroupId: input.groupId,
      signatureRequired: false,
      poRequired: input.requirePONumber,
      alternateId: input.alternateID || undefined,
      firstName: input.mainContact.firstName,
      lastName: input.mainContact.lastName,
      phoneNumbers: input.phones.map((phone) => ({
        number: phone.number,
        extension: phone.extension || null,
        textOnly: false,
        type: phone.type,
      })),
      mainFirstName: input.mainContact.firstName,
      mainLastName: input.mainContact.lastName,
      mainEmail: input.mainContact.email,
      mainJobTitle: input.mainContact.title,
      mainPhoneNumbers: input.mainContact.phones.map((phone) => ({
        number: phone.number,
        extension: phone.extension || null,
        textOnly: false,
        type: phone.type,
      })),
      sendInvoicesByEmail: input.sendInvoiceByEmail,
      sendInvoicesByPost: input.sendInvoiceByPost,
      salesId: input.saleRepresentativeId || undefined,
      invoiceEmails: input.emailForInvoices ? [input.emailForInvoices] : [],
      statementEmails: input.emailForInvoices ? [input.emailForInvoices] : [],
      notificationEmails: input.emailForInvoices ? [input.emailForInvoices] : [],
      addFinanceCharges: input.addFinancialCharges,
      aprType: input.apr,
      financeCharge: input.aprCharge,
      generalNote: input.generalNotes || undefined,
      popupNote: input.popupNotes || undefined,
      workOrderRequired: input.requireWONumber,
      jobSiteRequired: input.requireJobSite,
      canTareWeightRequired: input.requireCanTareWeight,
      gradingRequired: input.requireGrading,
      selfServiceOrderAllowed: input.allowSelfServiceOrders,
      gradingNotification: input.gradingNotification,
      email: input.email || input.mainContact.email,
      creditLimit: input.creditLimit,
      billingCycle: input.billingCycle === BILLING_CYCLE.NONE ? null : input.billingCycle,
      paymentTerms: input.paymentTerm === PAYMENT_TERM.NONE ? undefined : input.paymentTerm,
      attachTicketPref: false,
      attachMediaPref: false,
      invoiceConstruction: input.invoiceConstruction,
      onAccount: input.onAccount,
      mailingAddress: input.mailingAddress,
      billingAddress: input.billingAddress,
      businessUnitId,
      haulerSrn: input.haulerSrn,
    };

    return super.create(
      ctx,
      (haulingCustomerData as unknown) as HaulingCustomerInput,
      authorization,
      tokenPayload,
    );
  }

  async get(
    ctx: PartialContext,
    filter: ParsedUrlQueryInput = {},
    pagination?: PaginationInput,
    sort?: SortInput<HaulingCustomer>[],
    authorization?: string,
    tokenPayload?: Record<string, any>,
  ): Promise<ListResponseBasic<HaulingCustomer>> {
    const { businessUnitId } = parseFacilitySrn(ctx.userInfo.resource!);

    return super.get(
      ctx,
      { businessUnitId, ...filter },
      pagination,
      sort,
      authorization,
      tokenPayload,
    );
  }

  async count(
    ctx: PartialContext,
    filter: ParsedUrlQueryInput = {},
    authorization?: string,
    tokenPayload?: Record<string, any>,
  ): Promise<CustomerTotalResponse> {
    const { businessUnitId } = parseFacilitySrn(ctx.userInfo.resource!);

    const response = await super.makeRequest<CustomerTotalResponse>({
      ctx,
      url: `${CORE_SERVICE_API_URL}/${this.path}/count`,
      params: {
        ...filter,
        businessUnitId,
      },
      authorization,
      tokenPayload,
    });

    return response.data;
  }
}

export const customerService = new HaulingCustomerHttpService();
