export interface ICustomInput {
  name: string;
  id?: string;
  checkmarkClass?: string;
  labelClass?: string;
  inputClass?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  tabIndex?: number;
  focus?: string | boolean;
  type?: 'radio' | 'checkbox';
  readOnly?: boolean;
  indeterminate?: boolean;
  checked?: boolean;
  title?: string;
  onChange(e: React.ChangeEvent<HTMLInputElement>): void;
}
