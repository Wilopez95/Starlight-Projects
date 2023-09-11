export interface IBillableServiceFrequency {
  price?: number | undefined | null;
  customRatesGroupRecurringServiceId?: number | undefined;
  id?: number;
  billableServiceFrequencyId?: number | undefined;
  billingCycle?: string | undefined;
}
