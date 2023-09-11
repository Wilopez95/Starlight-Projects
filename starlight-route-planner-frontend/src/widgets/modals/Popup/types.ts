export interface IPopup {
  serviceItemId: number;
  masterRouteId?: number;
  onClosePopup: () => void;
}
