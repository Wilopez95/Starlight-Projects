type Action = { buttonText: string; handler(): void };

export interface IButtonContainer {
  isCreating?: boolean;
  isDuplicating?: boolean;
  disabled?: boolean;
  submitButtonType?: 'submit' | 'button';
  submitButtonText?: string;
  customCreateActions?: Action[];
  customEditActions?: Action[];

  onCancel(e: React.MouseEvent<HTMLButtonElement, MouseEvent>): void;

  onSave?(e: React.MouseEvent<HTMLButtonElement, MouseEvent>): void;
  onDuplicate?(): void;
  onDelete?(): void;
}
