import { type AppliedFilterState } from '../../../../../common/TableTools/TableFilter';

export interface IFinanceChargesPage {
  filters?: AppliedFilterState;
  query?: string;
}

export type FinanceChargesPageParams = {
  id?: string;
};
