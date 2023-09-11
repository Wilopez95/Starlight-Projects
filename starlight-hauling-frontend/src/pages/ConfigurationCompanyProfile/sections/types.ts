import { type ICompany } from '@root/types';

export interface ICompanySection {
  loading: boolean;
  company?: ICompany;
  onSetCurrentCompany?(): Promise<void>;
  onSetCompany?(company: ICompany): void;
}
