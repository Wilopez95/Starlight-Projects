export interface IInputOperation {
  active?: boolean;
  disabled?: boolean;
  onIncrement(e: React.SyntheticEvent<HTMLButtonElement>): void;
  onDecrement(e: React.SyntheticEvent<HTMLButtonElement>): void;
}
