import { IMapMergeData } from '@root/types';

export interface ISearchDropDownItem extends IMapMergeData {
  id: number;
  title: string;
  subTitle: string;
}

export interface IDropDownSearch {
  items: ISearchDropDownItem[];
  onClick: (arg: ISearchDropDownItem) => void;
  onClickOut: () => void;
}
