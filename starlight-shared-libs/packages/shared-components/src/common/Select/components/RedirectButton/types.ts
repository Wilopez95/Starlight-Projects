export interface IRedirectButton {
  children: string;
  onClick(e: React.MouseEvent<HTMLOrSVGElement, MouseEvent>): void;
}
