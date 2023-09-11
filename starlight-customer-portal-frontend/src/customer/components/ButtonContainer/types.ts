type Action = { buttonText: string; handler(): void };

export interface IButtonContainer {
  isCreating?: boolean;
  isDuplicating?: boolean;
  disabled?: boolean;
  submitButtonText?: string;
  customCreateActions?: Action[];
  customEditActions?: Action[];
  onSave(e: any): void;
  onCancel(e: any): void;
  onDuplicate?(): void;
  onDelete?(): void;
}
