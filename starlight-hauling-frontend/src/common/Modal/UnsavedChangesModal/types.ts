export interface IUnsavedChangesModalContext {
  isOpen: boolean;
  isDirtyRef: React.MutableRefObject<boolean> | null;
  confirm(): void;
  close(): void;
}

export interface IUnsavedChangesModal {
  dirty: boolean;
  onSubmit: () => void;
}
