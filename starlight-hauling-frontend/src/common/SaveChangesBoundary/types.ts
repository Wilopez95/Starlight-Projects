export interface ISaveChangesBoundary {
  dirty: boolean;
  className?: string;
  onLeaveModal(e: React.MouseEvent<HTMLButtonElement, MouseEvent>): void; //any is official formik handleReset type
}
