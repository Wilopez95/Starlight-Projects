import { Group } from './Group/Group';
import { GroupHeader } from './GroupHeader/GroupHeader';
import { MenuList } from './MenuList/MenuList';
import { Option } from './Option/Option';
import { SingleValue } from './SingleValue/SingleValue';

const baseSelectComponents = {
  Group,
  Option,
  MenuList,
  GroupHeading: GroupHeader,
};

export const singleSelectComponents = {
  ...baseSelectComponents,
  SingleValue,
};

export const multiSelectComponents = baseSelectComponents;
