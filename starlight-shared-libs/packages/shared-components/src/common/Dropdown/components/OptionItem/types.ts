export interface IOptionItem {
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  selected?: boolean;
  wrapperClassName?: string;
  onClick?(): void;
}
