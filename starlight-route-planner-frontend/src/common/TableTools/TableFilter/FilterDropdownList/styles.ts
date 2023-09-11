import { PlusIcon as BasePlusIcon } from '@starlightpro/shared-components';
import styled from 'styled-components';

export const AddFilter = styled(BasePlusIcon as React.FC)`
  width: 10px;
  height: 10px;
  color: ${p => p.theme.colors.secondary.desaturated};
`;
