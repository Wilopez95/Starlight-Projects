export interface IModal {
  isOpen: boolean;
  className?: string;
  overlayClassName?: string;
  onClose?(): void;
  onOpened?(): void;
}
