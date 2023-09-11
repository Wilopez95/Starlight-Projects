export interface IButtons {
  onSubmit(callback: (subscriptionOrderId: number) => Promise<void>): void;
}
