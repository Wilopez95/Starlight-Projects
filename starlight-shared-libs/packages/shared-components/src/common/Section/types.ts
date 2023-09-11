export interface ISection {
  children: React.ReactNode;
  className?: string;
  borderless?: boolean;
  direction?: 'row' | 'column';
  dashed?: boolean;
  alignItems?: string;
}
