export interface IModal {
  isOpen: boolean;
  className?: string;
  overlayClassName?: string;
  shouldCloseOnEsc?: boolean;
  onClose?(): void;
  onOpened?(): void;
}
