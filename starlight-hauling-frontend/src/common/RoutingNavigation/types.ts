export interface IRoutingNavigation {
  routes: RoutingNavigationItem[];
  withEmpty?: boolean;
  direction?: 'row' | 'column';
  className?: string;
  onRouteChange?(): void;
}

export type RoutingNavigationItem =
  | {
      loading: true;
      content: string | number;
      width?: string;
    }
  | {
      content: React.ReactNode;
      to: string;
      loading?: false;
      disabled?: boolean;
    };
