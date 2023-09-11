import styled, { css } from 'styled-components';

import { FormInput } from '@root/common';

export const MaterialsTotalInput = styled(FormInput)`
  ${p1 =>
    !p1.error &&
    css`
      border: 1px solid ${p2 => p2.theme.colors.success.standard} !important;
      box-shadow: inset 0 1px 2px 0 ${p3 => p3.theme.colors.success.standard},
        inset 0 0 0 1px ${p4 => p4.theme.colors.success.standard} !important;
    `}
`;
