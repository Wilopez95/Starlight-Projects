export enum TabsEnum {
  DAILY_ROUTE_TAB = 'DAILY_ROUTE_TAB',
  MASTER_ROUTE_TAB = 'MASTER_ROUTE_TAB',
  WORK_ORDER_TAB = 'WORK_ORDER_TAB',
  DASHBOARD_TAB = 'DASHBOARD_TAB',
}

export interface ITabProps {
  tableNavigationRef: React.MutableRefObject<HTMLDivElement | null>;
}
