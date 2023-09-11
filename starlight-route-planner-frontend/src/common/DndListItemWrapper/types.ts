export interface IDndListItemWrapper {
  id: number;
  sequence: number;
  readOnly?: boolean;
  color?: string;
  onClick?: (id: number) => void;
  onDelete?: (id: number) => void;
}
