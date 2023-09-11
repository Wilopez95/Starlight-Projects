export interface IBatchStatementQuickView {
  onFinanceChargeQuickViewOpen(ids: number[]): void;
  setGenerationJob(id: string): void;
  showSummaryModal(): void;
  loading: boolean;
  setLoading(loading: boolean): void;
  stopCheckingJobResult(): void;
}
