export interface IForm<T> {
  onSubmit: (values: T) => void;
  onClose: (values?: T) => void;
}
