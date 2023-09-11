import { BaseEntity } from '@root/stores/base/BaseEntity';

export interface IOrderCount extends BaseEntity {
  allCounts: number | undefined;
  myCounts: number | undefined;
}
