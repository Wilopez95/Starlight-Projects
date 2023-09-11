import { AddressOption as AddressOptionType } from './featuresToAddressOptions';
import { DistrictOption as DistrictOptionType } from './featuresToDistrictOptions';
import { PromiseCancelable as PromiseCancelableType } from './services';

export { default as Boundaries } from './Boundaries';
export { default as Boundary } from './Boundary';
export { forwardGeocode, reverseGeocode, getAdminDistrictsAtPoint } from './services';

export type AddressOption = AddressOptionType;
export type DistrictOption = DistrictOptionType;
export type PromiseCancelable<T> = PromiseCancelableType<T>;
