import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Meta, Story } from '@storybook/react/types-6-0';

import { ApproveIcon } from '../../src/assets';
import {
  NavigationPanel,
  NavigationPanelItem,
  NavigationPanelItemContainer,
  Typography,
} from '../../src/common';
import { Layouts } from '../../src/layouts';
import { Theme } from '../Theme';

export default {
  title: 'Example/NavigationPanel',
  component: NavigationPanel,
} as Meta;

export const Overview: Story<any> = () => {
  const items1 = [
    {
      id: 1,
      active: false,
      icon: ApproveIcon,
      title: 'Item 1',
      to: 'some route1',
      exact: false,
      onClick: () => {
        alert('Item 1 was clicked');
      },
    },
    {
      id: 2,
      icon: ApproveIcon,
      title: 'Item 2',
      to: 'some route2',
      exact: false,
      onClick: () => {
        alert('Item 2 was clicked');
      },
    },
    {
      id: 3,
      active: true,
      icon: ApproveIcon,
      title: 'Item 3',
      to: 'some route3',
      exact: false,
      onClick: () => {
        alert('Item 3 was clicked');
      },
    },
  ];

  const items2 = [
    {
      id: 1,
      active: false,
      icon: ApproveIcon,
      title: 'Item 1',
      to: 'some route4',
      exact: false,
      onClick: () => {
        alert('Item 1 was clicked');
      },
    },
    {
      id: 2,
      icon: ApproveIcon,
      title: 'Item 2',
      to: 'some route5',
      exact: false,
      onClick: () => {
        alert('Item 2 was clicked');
      },
    },
    {
      id: 3,
      active: true,
      icon: ApproveIcon,
      title: 'Item 3',
      to: 'some route6',
      exact: false,
      onClick: () => {
        alert('Item 3 was clicked');
      },
    },
  ];

  return (
    <Theme>
      <BrowserRouter>
        <NavigationPanel>
          <Layouts.Margin bottom="1" left="3">
            <Typography
              variant="headerFive"
              color="secondary"
              shade="desaturated"
              textTransform="uppercase"
            >
              Navigation items
            </Typography>
          </Layouts.Margin>
          <NavigationPanelItemContainer>
            {items1.map(config => (
              <NavigationPanelItem key={config.id} {...config} />
            ))}
          </NavigationPanelItemContainer>
        </NavigationPanel>
        <NavigationPanel>
          <Layouts.Margin bottom="1" left="3">
            <Typography
              variant="headerFive"
              color="secondary"
              shade="desaturated"
              textTransform="uppercase"
            >
              Inner navigation items
            </Typography>
          </Layouts.Margin>
          <NavigationPanelItemContainer>
            <NavigationPanelItem title="Collapsible item title">
              {items2.map(config => (
                <NavigationPanelItem inner key={config.id} {...config} />
              ))}
            </NavigationPanelItem>
          </NavigationPanelItemContainer>
        </NavigationPanel>
      </BrowserRouter>
    </Theme>
  );
};
