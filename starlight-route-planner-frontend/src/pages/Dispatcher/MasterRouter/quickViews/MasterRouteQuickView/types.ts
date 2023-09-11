import { ICustomizedServiceItem } from '@root/providers/MasterRoutesMapProvider';

export type MasterRouteConfigType = 'details' | 'services';

export interface IForm {
  scrollContainerHeight: number;
  onAddRef: (ref: HTMLElement | null) => void;
  onClose: (id?: number) => void;
}

export interface IMasterRouteQuickView {
  onClose: () => void;
  mainContainerRef: React.MutableRefObject<HTMLDivElement | null>;
}

export interface IMasterRouteCustomizedFormValues {
  name: string;
  color?: string;
  truckId?: string;
  driverId?: number;
  serviceDaysList: number[];
  serviceItems: ICustomizedServiceItem[];
}

export interface IMasterRouteFormStep {
  validationSchema: object;
  onSubmit?(): void;
}

export interface IMasterRouteFormBase {
  initialValues: IMasterRouteCustomizedFormValues;
  children: React.ReactNode;
  title: string;
  onSubmit(values: IMasterRouteCustomizedFormValues): void;
  onClose(): void;
  isEdited?: boolean;
}

export interface IMasterRouteForm {
  title: string;
  onClose(): void;
  onSubmit(values: IMasterRouteCustomizedFormValues): void;
  isEdited?: boolean;
}
