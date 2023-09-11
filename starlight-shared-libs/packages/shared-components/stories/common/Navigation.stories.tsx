import React, { useState } from 'react';
import { Meta, Story } from '@storybook/react/types-6-0';

import { INavigation, Navigation, NavigationConfigItem } from '../../src/common';
import { Theme } from '../Theme';

export default {
  title: 'Example/Navigation',
  component: Navigation,
} as Meta;

const navigationConfig: NavigationConfigItem<any>[] = Array.from({ length: 30 }, (_, i) => ({
  index: i,
  label: `Services ${i + 1}`,
  key: i,
}));

export const Overview: Story<INavigation> = args => {
  const [currentTab, setCurrentTab] = useState<NavigationConfigItem<any>>(navigationConfig[0]);

  return (
    <Theme>
      <Navigation
        {...args}
        carousel
        direction="row"
        onChange={setCurrentTab}
        activeTab={currentTab}
        configs={navigationConfig}
      />
    </Theme>
  );
};
