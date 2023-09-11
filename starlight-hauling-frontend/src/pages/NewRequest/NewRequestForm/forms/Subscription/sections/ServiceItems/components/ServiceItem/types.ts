import { ReactNode } from 'react';

export interface IServiceItem {
  serviceIndex: number;

  children(params: { handleEndService(): void }): ReactNode;
}
