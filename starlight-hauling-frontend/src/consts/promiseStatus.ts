export enum PromiseStatusEnum {
  FULFILLED = 'fulfilled',
  REJECTED = 'rejected',
}

export type PromiseStatus = PromiseStatusEnum.FULFILLED | PromiseStatusEnum.REJECTED;
