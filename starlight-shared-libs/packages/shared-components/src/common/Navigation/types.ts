import React from 'react';

export interface INavigation {
  configs: NavigationConfigItem[];
  direction?: 'row' | 'column';
  className?: string;
  activeTab?: NavigationConfigItem;
  progressBar?: boolean;
  border?: boolean;
  withEmpty?: boolean;
  loading?: boolean;
  carousel?: boolean;
  warning?: boolean;
  onChange(tab: NavigationConfigItem<any>): void;
}

export type NavigationConfigItem<T = string | null> = {
  key: T;
  index: number;
  disabled?: boolean;
  label?: React.ReactNode;
  loading?: boolean;
  width?: string | number;
  component?: React.FC<any>;
  path?: string;
  searchPlaceholder?: string;
  warning?: boolean;
};
