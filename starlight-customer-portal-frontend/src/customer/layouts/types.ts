export interface ICustomerPortalLayout {
  children: React.ReactNode;
}
export interface ITabsNavigation {
  searchPlaceholder?: string;
  onSearch?(search: string): void;
}
