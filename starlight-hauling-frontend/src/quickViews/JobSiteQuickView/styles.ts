import styled from 'styled-components';

import { DeleteIcon } from '@root/assets';

export const DeleteTaxDistrictIcon = styled(DeleteIcon)`
  margin-right: ${props => props.theme.offsets[1]};

  path {
    fill: ${props => props.theme.colors.secondary.desaturated};
  }
`;
