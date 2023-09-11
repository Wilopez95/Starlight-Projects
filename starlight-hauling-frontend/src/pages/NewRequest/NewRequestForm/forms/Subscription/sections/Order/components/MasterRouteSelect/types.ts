export interface IMasterRouteSelect {
  name: string;
  day: string; // "Sunday" | "Monday"...
  requiredByCustomer: boolean;
  value?: string;
  showLabel?: boolean;
}
