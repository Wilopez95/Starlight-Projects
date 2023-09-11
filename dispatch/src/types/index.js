/* eslint-disable */
import * as React from 'react';
import type { Store as ReduxStore, Middleware as ReduxMiddleware } from 'redux';
// import type { Reducers } from 'state/reducers';
export type { Match } from 'react-router-dom';

export type AsyncActionType = {|
  REQUEST: string,
  SUCCESS: string,
  FAILURE: string,
|};

export type AsyncActionTypeArray = [string, string, string];

export type UUID = string;

export type Params = { [string]: string | number };

export type NavMenuItem = {
  id: number,
  href: string,
  title: string,
};

type TZInput = {
  value: string,
  label: string,
};

export type RoleInputValue = {
  value: number,
  label: string,
};

export type UpdateUserInput = {
  firstName: string,
  lastName: string,
  email: string,
  username: string,
  password?: string,
  avatarUrl?: string,
  timezone: TZInput,
  organizationId?: number,
};

export type CreateUserInput = {
  firstName: string,
  lastName: string,
  email: string,
  password: string,
  username: string,
  avatarUrl?: string,
  timezone: TZInput,
  roleId: RoleInputValue,
  organizationId: number,
};

export type NormalizrPayload = {
  result: $ReadOnlyArray<Object> | Object,
  entities: Object,
};

export type NavMenuLinks = $ReadOnlyArray<NavMenuItem>;

export type RouterLocation = {
  pathname: string,
  search?: string,
  hash?: string,
  state?: any,
};
export type Point = {
  x: number,
  y: number,
};
export type Coordinate = {
  lat: number,
  lon: number,
};

export type UserMeta = {
  apiMode: string,
  tenantId: number,
  contactId: number,
  apiBaseUrl: string,
  customerId: number,
};
export type RoleType = {
  id: number,
  name: string,
  slug: string,
  description?: string,
};

export type RolesType = $ReadOnlyArray<RoleType>;

export type OrganizationType = {
  id: number,
  uuid?: UUID,
  name: string,
  slug: string,
  description?: string,
  website?: string,
  logoUrl?: string,
  ownerId?: string,
  createdAt?: string,
  updatedAt?: string,
  deletedAt?: string,
};

export type OrganizationsType = $ReadOnlyArray<OrganizationType>;

export type UserType = {
  id: UUID,
  firstName: string,
  lastName: string,
  email: string,
  password?: string,
  username: string,
  avatarUrl?: string,
  createdAt?: string,
  updatedAt?: string,
  deletedAt?: string,
  roleId: number,
  organizationId: number,
  lastLogin?: string,
  timezone?: string,
  role: RoleType,
  organization?: OrganizationType,
  meta: UserMeta,
};

export type UsersType = $ReadOnlyArray<UserType>;

export type CreateUserRes = {
  user: UserType,
};

export type OrgConfigType = {
  id: number,
  organizationId: number,
  orgName: string,
  twilioNumber: string,
  enableStructuredManifest: boolean,
  dbName: string,
};

export type GeoPointCoordinate = Point | Coordinate;

export type CanAction =
  | 'MOVE'
  | 'PICKUP'
  | 'DROPOFF'
  | 'TRANSFER'
  | 'NOTE'
  | 'UPDATE'
  | 'REMOVE'
  | 'CREATE';

export type CanType = {
  id: number,
  name?: string,
  serial?: string,
  size?: string,
  requiresMaintenance: ?number,
  outOfService: ?number,
  deleted: ?number,
  locationId?: number,
  source?: string,
  startDate?: string,
  hazardous: number,
  action?: CanAction,
  timestamp: string,
  createdBy?: string,
  createdDate?: Date,
  modifiedBy?: string,
  modifiedDate?: Date,
  prevLocationId?: number,
};

export type DocumentType = {
  id: number,
  name?: string,
  url?: string,
  templateId: number,
  workOrderId: number,
  printedName: string,
  driver?: string,
  createdBy?: string,
  createdDate: Date,
  modifiedBy?: string,
  modifiedDate: Date,
};

export type DocumentsType = $ReadOnlyArray<DocumentType>;

export type DriverType = {
  id: number,
  name: string,
  photo?: string,
  truckId?: number,
  deleted: ?number,
  username: string,
  phoneNumber?: string,
  createdBy?: string,
  createdDate: Date,
  modifiedBy?: string,
  modifiedDate: Date,
};
export type LocType = 'LOCATION' | 'WAYPOINT' | 'TRUCK';
export type WaypointType =
  | 'HOME_YARD'
  | 'LANDFILL_STORAGE_YARD'
  | 'LANDFILL'
  | 'RECYCLE_CENTER'
  | 'STORAGE_YARD'
  | 'TRANSFER_CENTER';

export type LocationType = {
  id: number,
  name?: string,
  location: GeoPointCoordinate,
  type: LocType,
  seedName?: string,
  description?: string,
  waypointName?: string,
  waypointType?: WaypointType,
  deleted: ?number,
  licensePlate?: string,
  createdBy?: string,
  createdDate: Date,
  modifiedBy?: string,
  modifiedDate: Date,
};

export type LocationInputType = {
  name: string,
  location: GeoPointCoordinate,
  type: LocType,
  description?: string,
};

export type TruckInputType = {
  name?: string,
  location?: GeoPointCoordinate,
  type: LocType,
  description?: string,
  licensePlate?: string,
};

export type MaterialType = {
  id: number,
  name: string,
  deleted: ?number,
  createdBy?: string,
  createdDate: Date,
  modifiedBy?: string,
  modifiedDate: Date,
};

export type SettingType = {
  id: number,
  key: string,
  value: { [string]: string | number },
  createdBy?: string,
  createdDate: Date,
  modifiedBy?: string,
  modifiedDate: Date,
};

export type SizeType = {
  id: number,
  name: string,
  deleted: ?number,
  createdBy?: string,
  createdDate: Date,
  modifiedBy?: string,
  modifiedDate: Date,
};

export type TemplateType = {
  id: number,
  name: string,
  description?: string,
  url: string,
  logo: string,
  companyName?: string,
  address: string,
  address2?: string,
  city: string,
  state: string,
  zipcode: string,
  phoneNumber: string,
  content: string,
  acknowledgement: string,
  createdBy?: string,
  createdDate: Date,
  modifiedBy?: string,
  modifiedDate: Date,
};

export type TimecardType = {
  id: number,
  driverId: number,
  startTime: string,
  stopTime?: string,
  deleted: ?number,
  createdBy?: string,
  createdDate: Date,
  modifiedBy?: string,
  modifiedDate: Date,
};

export type TransitionState =
  | 'START WORK ORDER'
  | 'ARRIVE ON SITE'
  | 'ARRIVE ON SITE2'
  | 'SIGNATURE'
  | 'START SERVICE'
  | 'START SERVICE2'
  | 'DROP CAN'
  | 'PICKUP CAN'
  | 'FINISH SERVICE'
  | 'FINISH SERVICE2'
  | 'RECORD WEIGHT'
  | 'RECORD MANIFESTS'
  | 'GOING TO FILL'
  | 'ARRIVE AT FILL'
  | 'FINISH DISPOSAL'
  | 'RECORD WEIGHT TICKETS'
  | 'RETURNING TO JOBSITE'
  | 'REASSIGNMENT'
  | 'WORK ORDER COMPLETE'
  | 'SPECIAL INSTRUCTIONS';

export type TransactionType = {
  id: number,
  timestamp: string,
  action: string,
  payload: any,
  locationId1?: number,
  locationId2?: number,
  canId?: number,
  createdBy?: string,
  createdDate: Date,
  modifiedBy?: string,
  modifiedDate: Date,
};

export type TripType = {
  id: number,
  truckId?: number,
  driverId?: number,
  tripType: string,
  odometer: number,
  deleted: ?number,
  createdBy?: string,
  createdDate: Date,
  modifiedBy?: string,
  modifiedDate: Date,
};

export type MapConfigType = {
  lat: number,
  lon: number,
  zoom: number,
};

export type NoteType =
  | 'MANIFEST'
  | 'NOTE'
  | 'SCALETICKET'
  | 'WEIGHT_RECORD'
  | 'TRANSITION';

export type WorkOrderNoteType = {
  id: number,
  note: any,
  workOrderId: number,
  locationId: number,
  type: NoteType,
  deleted: ?number,
  createdBy?: string,
  createdDate: Date,
  modifiedBy?: string,
  modifiedDate: Date,
};

export type WorkOrderStatus =
  | 'UNASSIGNED'
  | 'ASSIGNED'
  | 'INPROGRESS'
  | 'COMPLETED'
  | 'CANCELED';

export type WorkOrderType = {
  id: number,
  status?: WorkOrderStatus,
  action?: string,
  size: string,
  material: string,
  scheduledDate: string,
  scheduledEnd?: string,
  scheduledStart?: string,
  poNumber?: string,
  contactName?: string,
  contactNumber?: string,
  customerName?: string,
  instructions?: string,
  alleyPlacement?: number,
  earlyPickUp?: number,
  okToRoll?: number,
  negotiatedFill?: number,
  profileNumber?: string,
  customerProvidedProfile?: number,
  priority?: number,
  step?: string,
  driverId?: number,
  locationId1?: number,
  locationId2?: number,
  location1?: Object,
  location2?: Object,
  canId?: number,
  index: number,
  cow?: number,
  sos?: number,
  cabOver?: number,
  permittedCan?: number,
  textOnWay?: string,
  permitNumber?: string,
  signatureRequired?: number,
  templateId?: number,
  documentId?: number,
  deleted?: number,
  createdBy?: string,
  createdDate?: Date,
  modifiedBy?: string,
  modifiedDate?: Date,
};
export type ManifestCustomerType = {
  name: string,
  address: string,
  city: string,
  state: string,
  zip: string,
  phone: string,
  authorizedRep: string,
};

export type ManifestFacilityType = {
  name: string,
  address: string,
  city: string,
  state: string,
  zip: string,
  phone: string,
};

export type StructuredManifestType = {
  id: number,
  constructionWaste: number,
  demolitionWaste: number,
  wasteQtyTons: null | number,
  wasteQtyYrds: null | number,
  locPickUpSource: string,
  locPickUpAddress: string,
  locPickUpCity: string,
  locPickUpState: string,
  locPickUpZip: string,
  genName?: string,
  genAddress?: string,
  genCity?: string,
  genState?: string,
  genZip?: string,
  genAuthRep?: string,
  genPhone?: string,
  genSig: null | string,
  genDate?: string,
  generatorLocked?: number,
  transporterName?: string,
  transporterDriverName?: string,
  transporterDriverPhone: null | string,
  transporterDriverPlate: null | string,
  transporterDecPermit: string,
  transporterSig: null | string,
  transporterDate?: string,
  transporterLocked?: number,
  recFacName?: string,
  recFacAddress?: string,
  recFacCity?: string,
  recFacState?: string,
  recFacZip?: string,
  recFacDecPermit?: string,
  recFacProcessor: number,
  recFacFinal: number,
  recFacPrintName?: string,
  recFacPhone?: string,
  recFacSig: null | string,
  recFacDate?: string,
  recFacLocked?: number,
  workOrderId: number,
  createdDate?: string,
  createdBy?: string,
  modifiedBy?: string,
  modifiedDate?: string,
  s3url: null | string,
};

export type DateFilterType = {
  startDate: string | number,
  endDate: string | number,
};

export type WorkOrderFilterType = {
  date: DateFilterType,
  bounds: ?string,
  search: ?string,
  modifiedSince: ?string,
  driverId: ?string,
  size: ?string,
  material: ?string,
  action: ?string,
  status: ?string,
  scheduledStart: ?string,
  scheduledStartPM: ?string,
  scheduledStartAM: ?string,
  cow: ?string,
  sos: ?string,
  alleyPlacement: ?string,
  permittedCan: ?string,
  earlyPickUp: ?string,
  cabOver: ?string,
  okToRoll: ?string,
  priority: ?string,
  negotiatedFill: ?string,
  customerProvidedProfile: ?string,
};

export type ConstantsType = {
  driverApp?: Object,
  can?: {
    action: Object,
    size: Array<string>,
  },
  trip?: {
    tripType: Object,
  },
  location?: {
    type: Object,
    waypointType: Object,
  },
  workOrder?: {
    action?: Object,
    status?: Object,
    material?: Array<string>,
    note?: {
      type?: Object,
      unittype?: Object,
      transitionState?: Object,
    },
  },
  import?: {
    type?: Object,
  },
  timezone?: Object,
  actionTransitionsRelation?: Object,
  actionTransitionsOrdered?: Object,
};

export type SessionReducerType = {
  isAuthorized: boolean,
  user: UserType,
  token?: string,
  error?: string,
};

export type TemplateReducerType = {
  isLoading: boolean,
  ids: $ReadOnlyArray<number>,
  current: TemplateType,
  errorMessage?: string,
};

export type SizeReducerType = {
  list: Array<SizeType>,
  status: string,
  current: SizeType,
};

// type $ExtractFunctionReturn = <V>(v: (...args: any) => V) => V;

// export type State = $ObjMap<Reducers, $ExtractFunctionReturn>;
export type Reducer = any; // (state: State, action: Action) => State;

// export type Store = ReduxStore<State, Action, Dispatch<*>>;

// export type GetState = () => State;

// export type Middleware = ReduxMiddleware<State, AnyAction<*>, Dispatch<*>>;

export type Action = {|
  type: string,
  payload?: any,
  meta?: any,
  error?: boolean,
  success?: boolean,
|};

export type PromiseAction = Promise<Action>;

// export type AnyAction<R> = PromiseAction | ThunkAction | Action;

// export type Dispatch<R> = (action: AnyAction<R>) => R;

// export type Thunk<R> = (dispatch: Dispatch<R>, getState: GetState) => R;
export type Dispatch = (
  // eslint-disable-next-line no-use-before-define
  action: Action | ThunkAction | PromiseAction | $ReadOnlyArray<Action>,
) => any;
export type GetState = () => Object;
export type ThunkAction = (dispatch: Dispatch, getState: GetState) => any;
