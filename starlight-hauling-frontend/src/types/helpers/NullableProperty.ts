export type NullableProperty<T, Property extends keyof T> =
  | {
      [P in keyof T]: P extends Property ? T[P] | undefined : T[P];
    }
  | T;
