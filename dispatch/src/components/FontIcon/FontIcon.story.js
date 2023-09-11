import { storiesOf } from '@storybook/react';
import { text, select, number } from '@storybook/addon-knobs';
import FontIcon from './FontIcon';

storiesOf('FontIcon', module).add('default', () => (
  <FontIcon name="backward" />
));
