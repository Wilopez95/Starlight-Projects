import { CancellationReason } from '@root/types';

export interface ICancellationReason {
  isOpen: boolean;
  cancellationReason?: CancellationReason;
  cancellationComment?: string;
  onSubmit(cancellationReason: CancellationReason, cancellationComment?: string): void;
  onClose(): void;
}
