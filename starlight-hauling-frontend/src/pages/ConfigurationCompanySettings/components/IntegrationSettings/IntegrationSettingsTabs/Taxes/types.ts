import { IQbBillableItemsData } from '../../../../../../types';

export type Account = {
  accountName: string;
  billableItems: IQbBillableItemsData[];
};

export type TaxDistrict = {
  description: string;
};

export type FilteredAccount = {
  name: string;
};

export type TaxDistrictOption =
  | {
      value: string;
    }
  | undefined
  | null;

export type BillableItem = {
  id: number;
  accountName: string;
  description: string | undefined;
  districtType: string | undefined;
  districtId: number | undefined;
};
