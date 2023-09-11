export interface IOptionItem {
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  selected?: boolean;
  wrapperClassName?: string;
}
