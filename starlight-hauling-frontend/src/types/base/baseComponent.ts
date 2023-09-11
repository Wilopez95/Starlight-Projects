import { AppliedFilterState } from '@root/common/TableTools/TableFilter';

export interface IBaseComponent {
  className?: string;
  children?: React.ReactNode;
}

export interface IBaseFilterComponent {
  onApply(newState: AppliedFilterState): void;
}
