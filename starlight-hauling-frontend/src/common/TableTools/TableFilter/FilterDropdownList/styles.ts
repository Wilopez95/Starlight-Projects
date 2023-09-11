import styled from 'styled-components';

import { PlusIcon as BasePlusIcon } from '@root/assets';

export const AddFilter = styled(BasePlusIcon)`
  width: 10px;
  height: 10px;
  color: ${p => p.theme.colors.secondary.light};
`;
