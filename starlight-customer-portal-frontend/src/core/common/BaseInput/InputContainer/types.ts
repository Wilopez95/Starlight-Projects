export interface IInputContainer {
  children: React.ReactNode;
  className?: string;
  id?: string;
  label?: React.ReactNode;
  error?: string | string[] | false;
  noErrorMessage?: boolean;
}
