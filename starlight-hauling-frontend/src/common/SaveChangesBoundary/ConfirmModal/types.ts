export interface ISaveChangesBoundaryConfirmModal {
  isOpen: boolean;
  title?: string;
  onClose(): void;
  onLeave(e: React.MouseEvent<HTMLButtonElement, MouseEvent>): void; //any is official formik handleReset type
}
