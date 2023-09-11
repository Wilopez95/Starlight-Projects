import { AdditionalOrderData } from '@starlightpro/recycling/hooks/useAdditionalOrderData';
import { action, computed, observable } from 'mobx';

import { FileGalleryMediaItem } from '@root/common/FilePreview/FilesGallery/types';
import {
  addressFormat,
  addressFormatShort,
  substituteLocalTimeZoneInsteadUTC,
} from '@root/helpers';
import { ICreditCard, ManuallyCreatablePayment, PaymentMethod } from '@root/modules/billing/types';
import {
  FileWithPreview,
  IBillableService,
  IBusinessLine,
  IBusinessUnit,
  IContact,
  ICustomer,
  ICustomerJobSitePair,
  IDisposalSite,
  IEquipmentItem,
  IGlobalRateService,
  IJobSite,
  IMaterial,
  IMaterialProfile,
  IOrder,
  IOrderCustomRatesGroupService,
  IOrderIncludedLineItem,
  IOrderManifestItem,
  IOrderSurcharge,
  IOrderThreshold,
  IPermit,
  IPriceGroup,
  IProject,
  IPromo,
  IPurchaseOrder,
  IServiceArea,
  IThirdPartyHauler,
  IUser,
  IWorkOrder,
  IWorkOrderMediaFile,
  JsonConversions,
  OrderCancellationReasonType,
  OrderStatusType,
  OrderTaxDistrict,
  VersionedEntity,
} from '@root/types';

import { BaseEntity } from '../base/BaseEntity';

import { convertOrderDates } from './helpers';
import { OrderStore } from './OrderStore';

export class Order extends BaseEntity implements IOrder {
  businessUnit: IBusinessUnit;
  businessLine: IBusinessLine;
  jobSite: VersionedEntity<IJobSite>;
  customer: VersionedEntity<ICustomer>;
  csr: VersionedEntity<IUser>;
  jobSiteContact: VersionedEntity<IContact>;
  jobSiteContactId: number;
  csrName: string;
  beforeTaxesTotal: number;
  bestTimeToComeFrom: string;
  bestTimeToComeTo: string;
  billableLineItemsTotal: number;
  billableServicePrice: number;
  billableServiceTotal: number;
  billableServiceApplySurcharges?: boolean;
  cancellationComment: string | null;
  cancellationReasonType: OrderCancellationReasonType | null;
  driverInstructions: string | null;
  earlyPick: boolean;
  grandTotal: number;
  highPriority: boolean;
  initialGrandTotal: number;
  callOnWayPhoneNumber: string | null;
  callOnWayPhoneNumberId: number | null;
  textOnWayPhoneNumber: string | null;
  textOnWayPhoneNumberId: number | null;
  jobSiteNote: string | null;
  purchaseOrder: IPurchaseOrder | null;
  rescheduleComment: string | null;
  serviceDate: Date;
  someoneOnSite: boolean;
  thresholdsTotal: number;
  toRoll: boolean;
  unapprovedComment: string | null;
  unfinalizedComment: string | null;
  invoiceNotes: string | null;
  droppedEquipmentItem: string | null;
  sendReceipt: boolean;
  orderContact: VersionedEntity<IContact>;
  orderContactId: number;
  notifyDayBefore: 'byText' | 'byEmail' | null;
  deferred: boolean;
  material: VersionedEntity<IMaterial> | null;
  lineItems: IOrderIncludedLineItem[];
  paymentMethod: PaymentMethod;
  applySurcharges: boolean;
  commercialTaxesUsed: boolean;
  surchargesTotal: number;
  manifestItems: IOrderManifestItem[];

  serviceArea?: IServiceArea;
  customerJobSite?: VersionedEntity<ICustomerJobSitePair>;
  thirdPartyHauler?: VersionedEntity<IThirdPartyHauler>;
  workOrder?: IWorkOrder;
  globalRatesServices?: VersionedEntity<IGlobalRateService>;
  globalRatesServicesId?: number | null;
  billableService?: VersionedEntity<IBillableService>;
  equipmentItem?: VersionedEntity<IEquipmentItem>;
  jobSite2?: VersionedEntity<IJobSite>;
  project?: VersionedEntity<IProject>;
  customRatesGroup?: VersionedEntity<IPriceGroup>;
  disposalSite?: VersionedEntity<IDisposalSite>;
  promo?: VersionedEntity<IPromo>;
  taxDistricts?: OrderTaxDistrict[];
  permit?: VersionedEntity<IPermit>;
  materialProfile?: VersionedEntity<IMaterialProfile>;
  thresholds?: IOrderThreshold[];
  customRatesGroupServices?: VersionedEntity<IOrderCustomRatesGroupService>;
  creditCard?: VersionedEntity<ICreditCard>;
  payments?: ManuallyCreatablePayment[];
  ticketFile?: FileWithPreview | undefined;
  overrideCreditLimit?: boolean | undefined;
  alleyPlacement?: boolean;
  cabOver?: boolean;
  surcharges?: IOrderSurcharge[];
  landfillOperationId?: number;

  store: OrderStore;

  @observable status: OrderStatusType;
  @observable checked = false;
  @observable workOrderMediaFiles: IWorkOrderMediaFile[];
  @observable netWeight: number | null;
  @observable graded: boolean;
  @observable hasWeightTicket: boolean;
  @observable weightTicketUrl: AdditionalOrderData['weightTicketUrl'];
  @observable weightTicketAttachedAt: AdditionalOrderData['weightTicketAttachedAt'];
  @observable weightTicketCreator: AdditionalOrderData['weightTicketCreator'];
  @observable ticketNumber: number | null;
  @observable recyclingWONumber?: string | null;

  constructor(store: OrderStore, entity: JsonConversions<IOrder>) {
    super(entity);

    entity.payments?.forEach(payment => {
      if (payment?.deferredUntil) {
        payment.deferredUntil = substituteLocalTimeZoneInsteadUTC(
          payment.deferredUntil,
        ) as unknown as string;
      }
    });

    const order = convertOrderDates(entity);

    this.invoiceNotes = order.invoiceNotes;
    this.callOnWayPhoneNumber = order.callOnWayPhoneNumber;
    this.callOnWayPhoneNumberId = order.callOnWayPhoneNumberId;
    this.textOnWayPhoneNumber = order.textOnWayPhoneNumber;
    this.textOnWayPhoneNumberId = order.textOnWayPhoneNumberId;
    this.beforeTaxesTotal = order.beforeTaxesTotal;
    this.droppedEquipmentItem = order.droppedEquipmentItem;
    this.grandTotal = order.grandTotal;
    this.driverInstructions = order.driverInstructions;
    this.someoneOnSite = order.someoneOnSite;
    this.toRoll = order.toRoll;
    this.highPriority = order.highPriority;
    this.earlyPick = order.earlyPick;
    this.cancellationReasonType = order.cancellationReasonType;
    this.cancellationComment = order.cancellationComment;
    this.unapprovedComment = order.unapprovedComment;
    this.unfinalizedComment = order.unfinalizedComment;
    this.rescheduleComment = order.rescheduleComment;
    this.jobSiteNote = order.jobSiteNote;
    this.driverInstructions = order.driverInstructions;
    this.billableServiceTotal = order.billableServiceTotal;
    this.billableLineItemsTotal = order.billableLineItemsTotal;
    this.billableServicePrice = order.billableServicePrice;
    this.billableServiceApplySurcharges = !!order.billableService?.applySurcharges;
    this.thresholdsTotal = order.thresholdsTotal;
    this.initialGrandTotal = order.initialGrandTotal;
    this.purchaseOrder = order.purchaseOrder;
    this.bestTimeToComeFrom = order.bestTimeToComeFrom;
    this.bestTimeToComeTo = order.bestTimeToComeTo;
    this.sendReceipt = order.sendReceipt;
    this.notifyDayBefore = order.notifyDayBefore;
    this.commercialTaxesUsed = order.commercialTaxesUsed;

    this.jobSite2 = order.jobSite2;
    this.materialProfile = order.materialProfile;
    this.jobSiteContact = order.jobSiteContact;
    this.jobSiteContactId = order.jobSiteContactId;
    this.disposalSite = order.disposalSite;
    this.jobSite = order.jobSite;
    this.customer = order.customer;
    this.billableService = order.billableService;
    this.customRatesGroup = order.customRatesGroup;
    this.csr = order.csr;
    this.csrName = order.csrName;
    this.material = order.material;
    this.globalRatesServices = order.globalRatesServices;
    this.globalRatesServicesId = order.globalRatesServicesId;
    this.customRatesGroupServices = order.customRatesGroupServices;
    this.project = order.project;
    this.lineItems = order.lineItems;
    this.thresholds = order.thresholds;
    this.customerJobSite = order.customerJobSite;
    this.thirdPartyHauler = order.thirdPartyHauler;
    this.permit = order.permit;
    this.promo = order.promo;
    this.taxDistricts = order.taxDistricts;
    this.equipmentItem = order.equipmentItem;
    this.manifestItems = order.manifestItems;

    this.workOrder = order.workOrder;

    this.serviceDate = order.serviceDate;

    this.checked = false;
    this.paymentMethod = order.paymentMethod;
    this.creditCard = order.creditCard;

    this.businessUnit = order.businessUnit;
    this.businessLine = order.businessLine;
    this.serviceArea = order.serviceArea;

    this.deferred = order.deferred;
    this.payments = order.payments ?? [];
    this.applySurcharges = order.applySurcharges;
    this.surcharges = order.surcharges;
    this.surchargesTotal = order.surchargesTotal;
    this.alleyPlacement = order.alleyPlacement;
    this.cabOver = order.cabOver;
    this.landfillOperationId = order.landfillOperationId;

    this.store = store;
    this.status = entity.status;
    this.orderContact = order.orderContact;
    this.orderContactId = order.orderContactId;
    this.workOrderMediaFiles = [];

    this.netWeight = null;
    this.graded = false;
    this.hasWeightTicket = false;
    this.ticketNumber = null;
  }

  @action.bound openDetails() {
    this.store.openDetails(this);
  }

  @action.bound openEdit() {
    this.store.openEdit(this);
  }

  @action.bound check() {
    this.checked = !this.checked;
  }

  @computed get getCsrName() {
    return this.csrName || 'Root';
  }

  @computed get customerName() {
    return this.customer?.businessName ?? this.customer?.name;
  }

  @computed get jobSiteAddress() {
    //TODO fix this
    if (!this.jobSite) {
      return '';
    }

    return addressFormat(this.jobSite.address);
  }

  @computed get jobSiteShortAddress() {
    //TODO fix this
    if (!this.jobSite) {
      return '';
    }

    return addressFormatShort(this.jobSite.address);
  }

  @computed get billableServiceDescription() {
    if (!this.billableService) {
      return 'No billable service';
    }

    const materialDescription = this.material?.description ? `・ ${this.material.description}` : '';

    return `${this.billableService.description}${materialDescription}`;
  }

  @action setWorkOrderMediaFiles(mediaFiles: IWorkOrderMediaFile[]) {
    this.workOrderMediaFiles = mediaFiles;
    if (this.workOrder) {
      this.workOrder.mediaFiles = mediaFiles;
    }
  }

  @action setAdditionalRecyclingValues(recyclingValue: AdditionalOrderData) {
    this.netWeight = recyclingValue.netWeight ?? null;
    this.graded = !!recyclingValue.graded;
    this.hasWeightTicket = !!recyclingValue.hasWeightTicket;
    this.weightTicketUrl = recyclingValue.weightTicketUrl;
    this.weightTicketCreator = recyclingValue.weightTicketCreator;
    this.weightTicketAttachedAt = recyclingValue.weightTicketAttachedAt;
    this.ticketNumber = recyclingValue.id;
    this.recyclingWONumber = recyclingValue.WONumber;
  }

  @computed get mediaFilesCount() {
    let cachedMediaFilesCount = this.workOrderMediaFiles.length;
    const isTicketExist = this.workOrder?.ticketUrl;

    let workOrderMediaFilesCount = 0;

    if (isTicketExist) {
      cachedMediaFilesCount += 1;
      workOrderMediaFilesCount += 1;
    }

    if (this.workOrder) {
      if (this.workOrder.mediaFilesCount) {
        workOrderMediaFilesCount = this.workOrder.mediaFilesCount;
      } else {
        workOrderMediaFilesCount = this.workOrder.mediaFiles.length;
      }
    }

    return cachedMediaFilesCount || workOrderMediaFilesCount;
  }

  @computed
  get mediaFiles() {
    const workOrder = this.workOrder;

    const workOrderMediaFiles = this.workOrderMediaFiles;

    if (!workOrder) {
      return [];
    }

    const files: FileGalleryMediaItem[] = [];

    if (workOrder.ticketUrl) {
      files.push({
        src: workOrder.ticketUrl,
        category: 'Ticket',
        fileName: `Ticket from Order# ${this.id}`,
        author: workOrder.ticketAuthor,
        timestamp: workOrder.ticketDate ?? undefined,
      });
    }

    if (workOrderMediaFiles.length) {
      workOrderMediaFiles.forEach(mediaFile => {
        const convertedMediaFile = {
          src: mediaFile.url,
          author: mediaFile.author,
          timestamp: mediaFile.timestamp,
          fileName: mediaFile.fileName ?? 'unknown',
          category: 'Media file',
        };

        files.push(convertedMediaFile);
      });
    }

    return files;
  }

  @computed
  get workOrderTicket() {
    if (!this.weightTicketUrl || !this.ticketNumber) {
      return [];
    }

    let author = 'unknown';

    if (this.weightTicketCreator) {
      author = `${this.weightTicketCreator.firstName ?? ''} ${
        this.weightTicketCreator.lastName ?? ''
      }`.trim();
    }

    return [
      {
        src: this.weightTicketUrl,
        category: 'Ticket',
        fileName: `Ticket from Order# ${this.ticketNumber}`,
        author,
        timestamp: this.weightTicketAttachedAt
          ? new Date(this.weightTicketAttachedAt as string | number | Date)
          : null,
      },
    ];
  }

  @computed get orderContactName() {
    return this.orderContact
      ? `${this.orderContact.firstName} ${this.orderContact.lastName}`
      : undefined;
  }
}
