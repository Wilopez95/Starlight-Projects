import { IBaseSelectInput, SelectValue } from '../types';

export interface IMultiSelect extends IBaseSelectInput {
  value: SelectValue[];
  checkbox?: boolean;
  maxMenuHeight?: number;
  components?: Record<string, React.ReactNode>;
  onSelectChange(name: string, value: SelectValue[]): void;
  onMenuScrollToBottom?(): void;
}
