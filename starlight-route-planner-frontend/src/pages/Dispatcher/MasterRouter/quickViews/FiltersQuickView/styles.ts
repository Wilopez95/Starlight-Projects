import {
  Select as SelectBase,
  UnassignedIcon as UnassignedIconBase,
} from '@starlightpro/shared-components';
import styled from 'styled-components';

export const UnassignedIcon = styled(UnassignedIconBase)`
  margin-right: 5px;
  height: 24px;
`;

export const Select = styled(SelectBase)`
  & {
    [class*='styles_divider'] {
      width: 0;
      margin: 0;
    }
    [class*='styles_cross'] {
      margin-right: 10px;
    }
  }
`;
