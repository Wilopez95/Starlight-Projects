import { IBaseSelectInput, SelectValue } from '../types';

export interface ISelect extends IBaseSelectInput {
  value?: SelectValue;
  components?: Record<string, React.ReactNode>;
  onSelectChange(name: string, value: SelectValue): void;
  menuPortalTarget?: HTMLElement | null;
}
