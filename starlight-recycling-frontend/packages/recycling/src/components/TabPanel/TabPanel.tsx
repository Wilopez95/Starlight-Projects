import React, { memo, FC } from 'react';

interface TabPanelProps {
  children?: React.ReactNode;
  dir?: string;
  index: any;
  value: any;
  alwaysRendered?: boolean;
  className?: string;
}

export const TabPanel: FC<TabPanelProps> = memo<TabPanelProps>(
  ({ children, value, index, alwaysRendered, ...other }) => {
    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`full-width-tabpanel-${index}`}
        aria-labelledby={`full-width-tabpanel-${index}`}
        {...other}
      >
        {(alwaysRendered || value === index) && children}
      </div>
    );
  },
);

export default TabPanel;
