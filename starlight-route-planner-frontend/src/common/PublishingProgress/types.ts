export interface IPublishProgress {
  updatingRoutes: { id: number; name: string }[];
  onClose(): void;
}
